'use client';

import {useEffect} from "react";
import {OpenAPI} from "@/models/api";
import apiUrl from "@/utils/helpers";

export const OpenAPIInitializer = () => {
    useEffect(() => {
        const path = window.location.pathname;

        if (
            path.startsWith("/login") ||
            path.startsWith("/register") ||
            path.startsWith("/dwh")
        ) {
            OpenAPI.BASE = apiUrl;
        }
    }, []);

    return null;
};
