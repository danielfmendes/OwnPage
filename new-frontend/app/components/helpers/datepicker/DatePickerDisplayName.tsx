import {format} from "date-fns";
import * as React from "react";
import {useTranslation} from "react-i18next";
import type {DateRange} from "react-day-picker";

interface DisplayNameProps {
    mode: "single" | "range";
    date: Date | DateRange | undefined;
    noPlaceholder?: boolean;
}

export function DatePickerDisplayName({mode, date, noPlaceholder = false}: DisplayNameProps) {
    const {t} = useTranslation();
    const isRange = mode === "range";

    const dateObj = !isRange ? (date as Date | undefined) : undefined;
    const range = isRange ? (date as DateRange | undefined) : undefined;

    const displayText = () => {
        if (!isRange) {
            return dateObj ? format(dateObj, "PPP") : <span>{t("placeholder.pick_date")}</span>;
        }
        if (range?.from) {
            return range.to
                ? `${format(range.from, "LLL dd, y")} - ${format(range.to, "LLL dd, y")}`
                : format(range.from, "LLL dd, y");
        }
        if (!noPlaceholder) {
            return <span>{t("placeholder.pick_date")}</span>;
        }
    };

    return (
        <>
            {displayText()}
        </>
    );
}