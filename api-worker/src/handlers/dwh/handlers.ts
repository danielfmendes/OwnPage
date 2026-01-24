import { Env } from "../../types"

async function selectAll(env: Env, table: string) {
    const { results } = await env.DB
        .prepare(`SELECT * FROM ${table}`)
        .all()

    return Response.json(results)
}

export const getBikeModels = (env: Env) =>
    selectAll(env, "bikemodels")

export const bikeHandler = (env: Env) =>
    selectAll(env, "bikes")

export const componentHandler = (env: Env) =>
    selectAll(env, "components")

export const customerHandler = (env: Env) =>
    selectAll(env, "customers")

export const orderHandler = (env: Env) =>
    selectAll(env, "orders")

export const orderItemsHandler = (env: Env) =>
    selectAll(env, "orderitems")

export const projectHandler = (env: Env) =>
    selectAll(env, "projects")

export const warehousePartHandler = (env: Env) =>
    selectAll(env, "warehouseparts")

export const getUsers = (env: Env) =>
    selectAll(env, "users")

export const getUser = async (env: Env) => {
    const { results } = await env.DB
        .prepare("SELECT * FROM users LIMIT 1")
        .all()

    return Response.json(results[0] ?? null)
}
