// Visual ER playground. Each entity is a node listing its columns; each reference column is an edge.
// Dragging from one entity's handle to another creates a new FK (a reference column) via the
// /relationships endpoint — i.e. you draw connections and the backend adds the column.

import { useCallback, useEffect, useMemo } from "react";
import ReactFlow, {
    Background,
    Controls,
    Handle,
    Position,
    useNodesState,
    useEdgesState,
    type Node,
    type Edge,
    type Connection,
} from "reactflow";
import "reactflow/dist/style.css";
import { useNotification } from "@/components/helpers/NotificationProvider";
import { dwhClient, truthy } from "@/models/dwh/dwhClient";
import type { DwhEntity } from "@/models/dwh/types";

interface Props {
    entities: DwhEntity[];
    reload: () => void;
    canWrite: boolean;
}

// Custom node: entity title + its columns, with connect handles on both sides.
function EntityNode({ data }: { data: { entity: DwhEntity } }) {
    const e = data.entity;
    return (
        <div className="rounded-lg border bg-card shadow-sm min-w-[160px]">
            <Handle type="target" position={Position.Left} />
            <div className="border-b px-3 py-1.5 font-semibold text-sm">{e.display_name || e.name}</div>
            <ul className="px-3 py-1.5 text-xs space-y-0.5">
                {e.columns.map((c) => (
                    <li key={c.id} className="flex justify-between gap-3">
                        <span className={truthy(c.is_system) ? "text-muted-foreground" : ""}>{c.name}</span>
                        <span className="text-muted-foreground">{c.data_type === "reference" ? "fk" : c.data_type}</span>
                    </li>
                ))}
            </ul>
            <Handle type="source" position={Position.Right} />
        </div>
    );
}

const nodeTypes = { entity: EntityNode };

export default function ErPlayground({ entities, reload, canWrite }: Props) {
    const { addNotification } = useNotification();
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);

    const built = useMemo(() => {
        const ns: Node[] = entities.map((e, i) => ({
            id: String(e.id),
            type: "entity",
            position: { x: (i % 4) * 240, y: Math.floor(i / 4) * 220 },
            data: { entity: e },
        }));
        const es: Edge[] = [];
        for (const e of entities) {
            for (const c of e.columns) {
                if (c.ref_entity_id) {
                    es.push({
                        id: `c${c.id}`,
                        source: String(e.id),
                        target: String(c.ref_entity_id),
                        label: c.name,
                        animated: true,
                    });
                }
            }
        }
        return { ns, es };
    }, [entities]);

    useEffect(() => { setNodes(built.ns); setEdges(built.es); }, [built, setNodes, setEdges]);

    const onConnect = useCallback((connection: Connection) => {
        if (!canWrite) { addNotification("You need write access to add connections", "error"); return; }
        if (!connection.source || !connection.target || connection.source === connection.target) return;
        dwhClient
            .createRelationship({ from_entity_id: Number(connection.source), to_entity_id: Number(connection.target) })
            .then(() => { addNotification("Connection created", "success"); reload(); })
            .catch((e: any) => addNotification(`${e?.message ?? e}`, "error"));
    }, [addNotification, reload, canWrite]);

    return (
        <div className="h-[70vh] rounded-xl border">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                nodeTypes={nodeTypes}
                fitView
            >
                <Background />
                <Controls />
            </ReactFlow>
        </div>
    );
}
