import {Calendar as CalendarIcon, ChevronDown} from "lucide-react";
import type {DateRange} from "react-day-picker";

import {Button} from "@/components/ui/button";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {DatePickerCalender} from "@/components/helpers/datepicker/DatePickerCalender";
import {DatePickerDisplayName} from "@/components/helpers/datepicker/DatePickerDisplayName";
import {cn} from "@/lib/utils";


interface DatePickerPropsBase {
    endYear?: number;
    position?: "top" | "right" | "bottom" | "left";
    numberOfMonths?: number;
}

interface DatePickerPropsSingle extends DatePickerPropsBase {
    mode?: "single";
    date?: Date;
    setDate: (date: Date | undefined) => void;
}

interface DatePickerPropsRange extends DatePickerPropsBase {
    mode?: "range";
    date?: DateRange;
    setDate: (date: DateRange | undefined) => void;
}

type DatePickerProps = DatePickerPropsSingle | DatePickerPropsRange;

export function DatePicker({
                               date,
                               setDate,
                               endYear,
                               position = "bottom",
                               mode = "single",
                               numberOfMonths = 1,
                           }: DatePickerProps) {

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    id="datepicker"
                    variant="outline"
                    className={cn(
                        "w-full justify-between text-left font-normal relative pr-10",
                        !date && "text-muted-foreground"
                    )}
                >
                    <div className="flex items-center">
                        <CalendarIcon className="mr-2 h-4 w-4"/>
                        <DatePickerDisplayName mode={mode} date={date}/>
                    </div>
                    <div className="absolute right-2 flex items-center space-x-1 opacity-50">
                        <ChevronDown className="w-4 h-4"/>
                    </div>
                </Button>
            </PopoverTrigger>
            <PopoverContent
                className="w-auto p-0"
                align={["left", "right"].includes(position) ? "center" : "start"}
                side={position}
            >
                <DatePickerCalender
                    mode={mode}
                    date={date}
                    // @ts-ignore
                    setDate={setDate}
                    position={position}
                    numberOfMonths={numberOfMonths}
                    endYear={endYear}
                />
            </PopoverContent>
        </Popover>
    );
}
