import ContentLayout from "@/components/layout/ContentLayout";
import {useTranslation} from "react-i18next";
import {Section} from "@/components/helpers/Section";
import {company} from "@/config/company";

export default function ImprintPage() {
    const {t} = useTranslation();

    return (
        <ContentLayout>
            <div className="container pt-4 px-4 max-w-2xl">
                <h1 className="text-3xl font-bold tracking-tight mb-6">
                    {t("imprint.title")}
                </h1>

                <div className="space-y-8 text-muted-foreground">
                    <Section title={t("imprint.legalInfo.title")}>
                        <address className="not-italic">
                            <p>{company.name}</p>
                            <p>{company.address.street}</p>
                            <p>{company.address.city}</p>
                            <p>{company.address.country}</p>
                        </address>
                    </Section>

                    <Section title={t("imprint.contact.title")}>
                        <p>
                            {t("imprint.contact.representedBy")} {company.ceo} (CEO)<br/>
                            {t("imprint.contact.email")}{" "}
                            <a href={`mailto:${company.email}`} className="hover:underline">
                                {company.email}
                            </a><br/>
                            {t("imprint.contact.phone")} {company.phone}<br/>
                            {t("imprint.contact.fax")} {company.fax}
                        </p>
                    </Section>

                    <Section title={t("imprint.register.title")}>
                        <p>
                            {t("imprint.register.court")} {company.court}<br/>
                            {t("imprint.register.number")} {company.registrationNumber}<br/>
                            {t("imprint.register.vatId")} {company.vatId}<br/>
                            {t("imprint.register.taxNumber")} {company.taxNumber}
                        </p>
                    </Section>

                    <Section title={t("imprint.disclaimer.title")}>
                        <p>
                            {t("imprint.disclaimer.contentTitle")}{" "}
                            {t("imprint.disclaimer.content")}
                        </p>
                        <p>
                            {t("imprint.disclaimer.linksTitle")}{" "}
                            {t("imprint.disclaimer.links")}
                        </p>
                    </Section>

                    <Section title={t("imprint.copyright.title")}>
                        <p>{t("imprint.copyright.content")}</p>
                    </Section>

                    <Section title={t("imprint.dispute.title")}>
                        <p>
                            {t("imprint.dispute.content")}{" "}
                            <a
                                href="https://ec.europa.eu/consumers/odr"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline hover:text-blue-800 transition-colors duration-200"
                            >
                                https://ec.europa.eu/consumers/odr
                            </a>. {t("imprint.dispute.note")}
                        </p>
                    </Section>
                </div>
            </div>
        </ContentLayout>
    );
}
