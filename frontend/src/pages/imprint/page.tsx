import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Section } from "@/components/helpers/Section";
import ContentLayout from "@/components/layout/ContentLayout";
import { company } from "@/config/company";

export default function ImprintPage() {
    const { t } = useTranslation();
    const location = useLocation();
    const isFromDwh = location.state?.fromDwh;

    const PageContent = (
        <div className="container px-8 md:px-16 py-12">
            <h1 className="text-4xl font-extrabold tracking-tight mb-10 text-foreground">
                {t("imprint.title")}
            </h1>

            <div className="space-y-12 text-muted-foreground leading-relaxed">
                <Section title={t("imprint.legalInfo.title")}>
                    <address className="not-italic space-y-1 text-foreground">
                        <p className="font-bold text-lg">{company.name}</p>
                        <p>{company.address.street}</p>
                        <p>{company.address.city}</p>
                        <p>{company.address.country}</p>
                    </address>
                </Section>

                <Section title={t("imprint.contact.title")}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <p>
                            <span className="block text-xs uppercase font-bold text-primary mb-1">CEO</span>
                            {company.ceo}
                        </p>
                        <p>
                            <span className="block text-xs uppercase font-bold text-primary mb-1">Email</span>
                            <a href={`mailto:${company.email}`} className="text-foreground hover:underline transition-colors">
                                {company.email}
                            </a>
                        </p>
                    </div>
                </Section>

                <Section title={t("imprint.disclaimer.title")}>
                    <div className="space-y-4">
                        <p><strong className="text-foreground block">{t("imprint.disclaimer.contentTitle")}</strong> {t("imprint.disclaimer.content")}</p>
                        <p><strong className="text-foreground block">{t("imprint.disclaimer.linksTitle")}</strong> {t("imprint.disclaimer.links")}</p>
                    </div>
                </Section>

                <Section title={t("imprint.dispute.title")}>
                    <p>
                        {t("imprint.dispute.content")}{" "}
                        <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer"
                           className="text-primary hover:underline font-medium">
                            https://ec.europa.eu/consumers/odr
                        </a>.
                        <span className="block mt-4 text-xs italic">{t("imprint.dispute.note")}</span>
                    </p>
                </Section>
            </div>
        </div>
    );

    return isFromDwh ? <ContentLayout>{PageContent}</ContentLayout> : <div className="max-w-5xl mx-auto">{PageContent}</div>;
}