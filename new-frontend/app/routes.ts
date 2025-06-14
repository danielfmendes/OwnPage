import {
    type RouteConfig,
    route,
    index,
    layout
} from "@react-router/dev/routes";

export default [
    layout("./pages/layout.tsx", [
        index("./pages/page.tsx"),

        layout("./pages/dwh/layout.tsx", [
            route("dwh/login", "./pages/dwh/login/page.tsx"),
            route("dwh/register", "./pages/dwh/register/page.tsx"),
            route("dwh/customer", "./pages/dwh/customer/page.tsx"),
            route("dwh/dashboard", "./pages/dwh/dashboard/page.tsx"),
            route("dwh/orders", "./pages/dwh/orders/page.tsx"),
            route("dwh/partsstorage", "./pages/dwh/partsstorage/page.tsx"),
            route("dwh/rolemanagement", "./pages/dwh/rolemanagement/page.tsx"),
            route("dwh/warehouse", "./pages/dwh/warehouse/page.tsx"),
        ]),
    ]),
] satisfies RouteConfig;