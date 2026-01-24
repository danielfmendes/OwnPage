import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Section } from "@/components/helpers/Section";
import ContentLayout from "@/components/layout/ContentLayout";

export default function PrivacyPage() {
    const { t } = useTranslation();
    const location = useLocation();
    const isFromDwh = location.state?.fromDwh;

    const PageContent = (
        <div className="container px-8 md:px-16 py-12">
            <h1 className="text-4xl font-extrabold tracking-tight mb-10 text-foreground">
                {t("privacy.title")}
            </h1>

            <div className="space-y-12 text-muted-foreground leading-relaxed">
                <Section title={t("privacy.sections.glance.title")}>
                    <p>{t("privacy.sections.glance.p1")}</p>
                    <p className="mt-4">{t("privacy.sections.glance.p2")}</p>
                </Section>

                <Section title={t("privacy.sections.collection.title")}>
                    <div className="space-y-6">
                        <div>
                            <h3 className="mb-2 font-bold text-foreground">{t("privacy.sections.collection.serverLogs.title")}</h3>
                            <p>{t("privacy.sections.collection.serverLogs.p")}</p>
                            <ul className="list-disc pl-5 mt-3 space-y-2 marker:text-primary">
                                {[0, 1, 2, 3, 4, 5].map((i) => (
                                    <li key={i}>{t(`privacy.sections.collection.serverLogs.items.${i}`)}</li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h3 className="mb-2 font-bold text-foreground">{t("privacy.sections.collection.cookies.title")}</h3>
                            <p>{t("privacy.sections.collection.cookies.p")}</p>
                            <ul className="list-disc pl-5 mt-3 space-y-2 marker:text-primary">
                                {[0, 1, 2].map((i) => (
                                    <li key={i}>{t(`privacy.sections.collection.cookies.items.${i}`)}</li>
                                ))}
                            </ul>
                            <p className="mt-4 italic text-sm border-l-2 border-primary/20 pl-4">
                                {t("privacy.sections.collection.cookies.notice")}
                            </p>
                        </div>
                    </div>
                </Section>

                <Section title={t("privacy.sections.rights.title")}>
                    <p>{t("privacy.sections.rights.p1")}</p>
                    <ul className="list-disc pl-5 mt-3 space-y-2 marker:text-primary">
                        {[0, 1, 2, 3].map((i) => (
                            <li key={i}>{t(`privacy.sections.rights.items.${i}`)}</li>
                        ))}
                    </ul>
                    <p className="mt-4 font-medium text-foreground">{t("privacy.sections.rights.contact")}</p>
                </Section>

                <Section title={t("privacy.sections.changes.title")}>
                    <p>{t("privacy.sections.changes.p1")}</p>
                    <p className="mt-8 pt-4 border-t border-border text-xs uppercase tracking-tighter">
                        <strong>{t("privacy.sections.changes.updated")}:</strong>{" "}
                        {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                    </p>
                </Section>
            </div>
        </div>
    );

    return isFromDwh ? <ContentLayout>{PageContent}</ContentLayout> : <div className="max-w-5xl mx-auto">{PageContent}</div>;
}