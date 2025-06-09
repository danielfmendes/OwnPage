import type {Route} from "./+types/home";
import Test from "~/routes/test";
import ContentLayout from "~/components/layout/ContentLayout";

export function meta({}: Route.MetaArgs) {
    return [
        {title: "NebulaDW"},
        {name: "description", content: "Welcome to NebulaDW!"},
    ];
}

import "../../i18n";
import {ThemeProvider} from "next-themes";
import {NotificationProvider} from "@/components/helpers/NotificationProvider";

export default function Home() {
    return (
        <NotificationProvider>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
                <ContentLayout title="Ronaldo">
                    <Test/>
                </ContentLayout>
            </ThemeProvider>
        </NotificationProvider>
    );
}
