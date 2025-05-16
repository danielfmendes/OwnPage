import React, {useEffect, useRef, useState} from "react";
import {ChevronsUpDown, Loader2} from "lucide-react";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {ScrollArea} from "@/components/ui/scroll-area";
import {Button} from "@/components/ui/button";
import {useTranslation} from "react-i18next";

interface ComboBoxLoadingProps<T> {
    selectedItem: T | null;
    items: T[];
    isLoading: boolean;
    onSelect: (id: number) => void;
    placeholder?: string;
    children: (item: T, isSelected: null | boolean) => React.ReactNode;
    itemKey: (item: T) => number;
    itemLabel: (item: T) => string;
}

export function ComboBoxLoading<T>({
                                       selectedItem,
                                       items,
                                       isLoading,
                                       onSelect,
                                       placeholder = "Select...",
                                       children,
                                       itemKey,
                                       itemLabel,
                                   }: ComboBoxLoadingProps<T>) {
    const {t} = useTranslation();
    const [open, setOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const triggerRef = useRef<HTMLButtonElement>(null);
    const [popoverWidth, setPopoverWidth] = useState<string | undefined>(undefined);

    const handleSelect = (id: number) => {
        onSelect(id);
        setOpen(false);
    };

    const filterItems = (itemLabel: string) => {
        return itemLabel.toLowerCase().startsWith(searchTerm.toLowerCase());
    };

    useEffect(() => {
        const updateWidth = () => {
            if (triggerRef.current) {
                setPopoverWidth(`${triggerRef.current.offsetWidth}px`);
            }
        };
        updateWidth();

        const resizeObserver = new ResizeObserver(updateWidth);
        if (triggerRef.current) {
            resizeObserver.observe(triggerRef.current);
        }
        return () => resizeObserver.disconnect();
    }, []);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    ref={triggerRef}
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between text-left font-normal relative"
                >
                    {selectedItem ? (
                        <div className="flex flex-col text-left">
                            <span>{itemLabel(selectedItem)}</span>
                        </div>
                    ) : (
                        <span className="text-muted-foreground">{placeholder}</span>
                    )}
                        <ChevronsUpDown className="absolute right-2 w-4 h-4 opacity-50"/>
                </Button>
            </PopoverTrigger>

            <PopoverContent className="p-0" align="start" style={{width: popoverWidth}}>
                <Command shouldFilter={true} className="overflow-auto max-h-60">
                    <CommandInput
                        placeholder={t("placeholder.search")}
                        className="h-9"
                        onValueChange={setSearchTerm}
                    />
                    <ScrollArea
                        className="max-h-60 overflow-y-auto"
                        onWheel={(e) => {
                            const {currentTarget, deltaY} = e;
                            currentTarget.scrollBy({
                                top: deltaY * 2,
                                behavior: 'smooth'
                            });
                        }}
                    >
                        {isLoading ? (
                            <CommandItem disabled className="opacity-50 italic pointer-events-none">
                                <Loader2 className="mr-2 h-4 w-4 animate-spin inline-block"/>
                                {t("placeholder.loading")}
                            </CommandItem>
                        ) : items.length === 0 ? (
                            <CommandEmpty>{t("placeholder.no_results")}</CommandEmpty>
                        ) : (
                            <CommandGroup>
                                {[...(selectedItem ? [selectedItem] : []), ...items.filter(item =>
                                    !selectedItem || itemKey(item) !== itemKey(selectedItem)
                                )]
                                    .filter(item => filterItems(itemLabel(item)))
                                    .map(item => {
                                        const isSelected = selectedItem != null && itemKey(item) === itemKey(selectedItem);
                                        return (
                                            <CommandItem
                                                key={itemKey(item)}
                                                value={itemLabel(item)}
                                                onSelect={() => handleSelect(itemKey(item))}
                                                className={`flex flex-col items-start space-y-0.5 ${isSelected ? "bg-accent/10" : ""}`}
                                            >
                                                <div className="overflow-y-auto max-h-60">
                                                    {children(item, isSelected)}
                                                </div>
                                            </CommandItem>
                                        );
                                    })}
                            </CommandGroup>
                        )}
                    </ScrollArea>
                </Command>
            </PopoverContent>
        </Popover>
    );
}