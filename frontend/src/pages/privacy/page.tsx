import {Section} from "@/components/helpers/Section";
import ContentLayout from "@/components/layout/ContentLayout";
import {useTranslation} from "react-i18next";

export default function PrivacyPage() {
    const {t} = useTranslation();

    return (
        <ContentLayout>
            <div className="container px-4 py-10 max-w-4xl">
                <h1 className="text-3xl font-bold tracking-tight mb-6">{t("privacy.title")}</h1>

                <div className="space-y-6 text-muted-foreground">
                    <Section title={t("privacy.sections.glance.title")}>
                        <p>{t("privacy.sections.glance.p1")}</p>
                        <p className="mt-3">{t("privacy.sections.glance.p2")}</p>
                    </Section>

                    <Section title={t("privacy.sections.collection.title")}>
                        <h3 className="mb-2 text-foreground">{t("privacy.sections.collection.serverLogs.title")}</h3>
                        <p>{t("privacy.sections.collection.serverLogs.p")}</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li>{t("privacy.sections.collection.serverLogs.items.0")}</li>
                            <li>{t("privacy.sections.collection.serverLogs.items.1")}</li>
                            <li>{t("privacy.sections.collection.serverLogs.items.2")}</li>
                            <li>{t("privacy.sections.collection.serverLogs.items.3")}</li>
                            <li>{t("privacy.sections.collection.serverLogs.items.4")}</li>
                            <li>{t("privacy.sections.collection.serverLogs.items.5")}</li>
                        </ul>

                        <h3 className="mt-4 mb-2 text-foreground">{t("privacy.sections.collection.cookies.title")}</h3>
                        <p>{t("privacy.sections.collection.cookies.p")}</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li>{t("privacy.sections.collection.cookies.items.0")}</li>
                            <li>{t("privacy.sections.collection.cookies.items.1")}</li>
                            <li>{t("privacy.sections.collection.cookies.items.2")}</li>
                        </ul>
                        <p className="mt-3">{t("privacy.sections.collection.cookies.notice")}</p>
                    </Section>

                    <Section title={t("privacy.sections.storage.title")}>
                        <p>{t("privacy.sections.storage.p1")}</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li>{t("privacy.sections.storage.items.0")}</li>
                            <li>{t("privacy.sections.storage.items.1")}</li>
                            <li>{t("privacy.sections.storage.items.2")}</li>
                        </ul>
                        <p className="mt-3">{t("privacy.sections.storage.p2")}</p>
                    </Section>

                    <Section title={t("privacy.sections.rights.title")}>
                        <p>{t("privacy.sections.rights.p1")}</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li>{t("privacy.sections.rights.items.0")}</li>
                            <li>{t("privacy.sections.rights.items.1")}</li>
                            <li>{t("privacy.sections.rights.items.2")}</li>
                            <li>{t("privacy.sections.rights.items.3")}</li>
                        </ul>
                        <p className="mt-3">{t("privacy.sections.rights.contact")}</p>
                    </Section>

                    <Section title={t("privacy.sections.thirdParties.title")}>
                        <p>{t("privacy.sections.thirdParties.p")}</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li>{t("privacy.sections.thirdParties.items.0")}</li>
                            <li>{t("privacy.sections.thirdParties.items.1")}</li>
                            <li>{t("privacy.sections.thirdParties.items.2")}</li>
                        </ul>
                    </Section>

                    <Section title={t("privacy.sections.changes.title")}>
                        <p>{t("privacy.sections.changes.p1")}</p>
                        <p className="mt-3">
                            <strong>{t("privacy.sections.changes.updated")}:</strong>{" "}
                            {new Date().toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                            })}
                        </p>
                    </Section>
                </div>
            </div>
        </ContentLayout>
    );
}
;
