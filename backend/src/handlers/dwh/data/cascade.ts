// App-level cascade / child-exists logic driven by the catalog (dwh_columns reference columns),
// not by DB-level FK enforcement — D1 doesn't enforce FKs and PRAGMA isn't executable from the
// Worker, so we discover children from metadata and apply on_delete policy ourselves.

import { Env } from "../../../types";
import { HttpError } from "../../../utils/auth";
import { EntityRow, referencesTo } from "../schema/catalog";
import { safeIdent } from "../schema/ddl";

// Delete one row, honoring each child reference's on_delete policy. `force` (cascade=true) overrides
// a "restrict" policy and deletes children anyway. Recurses through grandchildren.
export async function deleteRowWithPolicy(
    env: Env,
    entity: Pick<EntityRow, "id" | "physical_table">,
    id: number | string,
    force: boolean,
): Promise<void> {
    const children = await referencesTo(env, entity.id);

    for (const { column, entity: childEntity } of children) {
        const childTable = safeIdent(childEntity.physical_table);
        const refCol = safeIdent(column.name);
        const { results } = await env.DB.prepare(
            `SELECT id FROM ${childTable} WHERE ${refCol} = ?`
        ).bind(id).all<{ id: number }>();
        if (results.length === 0) continue;

        const policy = force ? "cascade" : (column.on_delete || "restrict");
        if (policy === "restrict") {
            throw new HttpError(409, "Related data exists in a linked entity; use cascade=true to force delete");
        }
        if (policy === "set_null") {
            await env.DB.prepare(`UPDATE ${childTable} SET ${refCol} = NULL WHERE ${refCol} = ?`).bind(id).run();
            continue;
        }
        // cascade — delete each child row (which may cascade further).
        for (const child of results) {
            await deleteRowWithPolicy(env, childEntity, child.id, force);
        }
    }

    await env.DB.prepare(`DELETE FROM ${safeIdent(entity.physical_table)} WHERE id = ?`).bind(id).run();
}
