'use client';

import { useEffect } from "react";
import {OpenAPI} from "@/models/api";

export const OpenAPIInitializer = () => {
    useEffect(() => {
        const path = window.location.pathname;

        if (
            path.startsWith("/login") ||
            path.startsWith("/register") ||
            path.startsWith("/dwh")
        ) {
            OpenAPI.BASE = process.env.NEXT_PUBLIC_API_ENV || "http://localhost:8080";
        }
    }, []);

    return null;
};
