import * as React from "react";
import {format, eachMonthOfInterval, startOfYear, endOfYear} from "date-fns";
import {DateRange} from "react-day-picker";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {Calendar} from "@/components/ui/calendar";

interface DatePickerContentProps {
    mode: "single" | "range";
    date: Date | DateRange | undefined;
    setDate: (date: Date | DateRange | undefined) => void;
    numberOfMonths?: number;
    endYear?: number;
}

export function DatePickerCalender({
                                      mode,
                                      date,
                                      setDate,
                                      numberOfMonths = 1,
                                      endYear,
                                  }: DatePickerContentProps) {
    const isRange = mode === "range";

    const dateObj = !isRange ? (date as Date | undefined) : undefined;
    const range = isRange ? (date as DateRange | undefined) : undefined;

    const [month, setMonth] = React.useState<number>(
        dateObj?.getMonth() ?? range?.from?.getMonth() ?? new Date().getMonth()
    );
    const [year, setYear] = React.useState<number>(
        dateObj?.getFullYear() ?? range?.from?.getFullYear() ?? new Date().getFullYear()
    );

    React.useEffect(() => {
        if (dateObj) {
            setMonth(dateObj.getMonth());
            setYear(dateObj.getFullYear());
        } else if (range?.from) {
            setMonth(range.from.getMonth());
            setYear(range.from.getFullYear());
        }
    }, [dateObj, range]);

    const years = React.useMemo(() => {
        const currentYear = new Date().getFullYear();
        const finalEndYear = endYear ?? currentYear;
        return Array.from({length: finalEndYear - 1950 + 1}, (_, i) => finalEndYear - i);
    }, [endYear]);

    const months = React.useMemo(() => {
        return eachMonthOfInterval({
            start: startOfYear(new Date(year, 0, 1)),
            end: endOfYear(new Date(year, 0, 1)),
        });
    }, [year]);

    const handleYearChange = (selectedYear: string) => {
        setYear(parseInt(selectedYear, 10));
    };

    const handleMonthChange = (selectedMonth: string) => {
        setMonth(parseInt(selectedMonth, 10));
    };


    return (
        <>
            <div className="flex justify-center gap-2 px-4 py-2">
                <Select onValueChange={handleMonthChange} value={month.toString()}>
                    <SelectTrigger className="w-[110px]">
                        <SelectValue placeholder="Month"/>
                    </SelectTrigger>
                    <SelectContent>
                        {months.map((m, index) => (
                            <SelectItem key={index} value={index.toString()}>
                                {format(m, "MMMM")}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Select onValueChange={handleYearChange} value={year.toString()}>
                    <SelectTrigger className="w-[100px]">
                        <SelectValue placeholder="Year"/>
                    </SelectTrigger>
                    <SelectContent>
                        {years.map((y) => (
                            <SelectItem key={y} value={y.toString()}>
                                {y}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/*@ts-ignore*/}
            <Calendar
                mode={mode}
                selected={date}
                // @ts-ignore
                onSelect={(selected) => setDate?.(selected)}
                month={new Date(year, month)}
                onMonthChange={(newMonth: Date) => {
                    setMonth(newMonth.getMonth());
                    setYear(newMonth.getFullYear());
                }}
                initialFocus={true}
                numberOfMonths={numberOfMonths}
            />
        </>
    );
}
