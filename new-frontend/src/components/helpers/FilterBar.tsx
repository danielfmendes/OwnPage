import {type FC, type ReactNode, useEffect, useMemo, useState} from "react";
import {Popover, PopoverContent, PopoverTrigger,} from "@/components/ui/popover";
import {Button} from "@/components/ui/button";
import {Checkbox} from "@/components/ui/checkbox";
import {ScrollArea} from "@/components/ui/scroll-area";
import {Input} from "@/components/ui/input";
import {Sliders, X} from "lucide-react";
import {useTranslation} from "react-i18next";
import {useNotification} from "@/components/helpers/NotificationProvider";
import i18n from "i18next";
import FilterManager, {type FilterType} from "@/utils/filtermanager";
import {ButtonLoading} from "@/components/helpers/ButtonLoading";
import {useFilterStore} from "@/utils/filterstate";
import type {DateRange} from "react-day-picker";
import {DatePickerCalender} from "@/components/helpers/datepicker/DatePickerCalender";
import {DatePickerDisplayName} from "@/components/helpers/datepicker/DatePickerDisplayName";

export interface FilterItem {
    value: string;
    count: number;
    icon?: ReactNode;
}

export interface FilterDefinition {
    title: string;
    key: string;
    itemsLoader: () => Promise<FilterItem[]>;
    type?: FilterType;
    pinned?: boolean;
}

export interface FilterBarProps {
    filters: FilterDefinition[];
    filterManager: FilterManager;
    onChange: (key: string, selected: string[], type: FilterType) => void;
}

export const FilterBar: FC<FilterBarProps> = ({filters, filterManager, onChange}) => {
    const locale = i18n.language;
    const {t} = useTranslation();
    const {addNotification} = useNotification();
    const context = useMemo(() => window.location.pathname.replace(/^\/|\/$/g, ""), []);

    const getLoadedItems = useFilterStore((state) => state.getLoadedItems);
    const setLoadedItems = useFilterStore((state) => state.setLoadedItems);

    const [lastChangedKey, setLastChangedKey] = useState<string | null>(null);
    const [filterDefs, setFilterDefs] = useState(() => filters.map(f => ({...f, pinned: f.pinned !== false})));
    const [selectedValues, setSelectedValues] = useState(() => filterManager.getSelectedValues());
    const [dateRanges, setDateRanges] = useState(() => filterManager.getDateRanges());
    const [openKey, setOpenKey] = useState<string | null>(null);
    const [loadingKeys, setLoadingKeys] = useState<string[]>([]);
    const [searchTexts, setSearchTexts] = useState<Record<string, string>>({});
    const [moreOpen, setMoreOpen] = useState(false);

    const pinnedFilters = useMemo(() => filterDefs.filter(f => f.pinned), [filterDefs]);
    const unpinnedFilters = useMemo(() => filterDefs.filter(f => !f.pinned), [filterDefs]);

    useEffect(() => {
        setFilterDefs(filters.map(f => ({...f, pinned: f.pinned !== false})));

        // loads items for every key with values
        Object.keys(selectedValues).forEach(async key => {
            if (selectedValues[key].length > 0 && !getLoadedItems(context, key)) {
                const filterDef = filters.find(f => f.key === key);
                if (filterDef) {
                    await loadItemsForKey(key, filterDef.itemsLoader);
                }
            }
        });
    }, [filters]);

    // unpinned => pinned, when selectedValues > 0
    useEffect(() => {
        setFilterDefs((prev) =>
            prev.map((filter) => {
                const hasSelected = (selectedValues[filter.key]?.length ?? 0) > 0;
                if (hasSelected && !filter.pinned) {
                    return {...filter, pinned: true};
                }
                return filter;
            })
        );
    }, [selectedValues, filters]);

    // updated only clicked key
    useEffect(() => {
        if (!lastChangedKey) return;

        const filterType = filters.find(f => f.key === lastChangedKey)?.type ?? "default";
        onChange(lastChangedKey, selectedValues[lastChangedKey] || [], filterType);

        setLastChangedKey(null);
    }, [lastChangedKey]);

    const loadItemsForKey = async (key: string, loader: () => Promise<FilterItem[]>) => {
        // if (getLoadedItems(context, key)) return;
        setLoadingKeys((prev) => [...prev, key]);
        try {
            const items = await loader();
            setLoadedItems(context, key, items);
        } catch (err) {
            addNotification(`Error loading items for ${key}`, "error");
        } finally {
            setLoadingKeys((prev) => prev.filter((k) => k !== key));
        }
    };

    const getDisplayLabel = (key: string, title: string) => {
        const values = selectedValues[key] || [];
        const items = getLoadedItems(context, key) || [];
        const labels = values.map((v) => items.find((i) => i.value === v)?.value).filter(Boolean);
        if (labels.length === 0) return title;
        return labels.length < 3 ? `${title}: ${labels.join(", ")}` : `${title}: ${labels.length}+ ${t("placeholder.selected")}`;
    };

    const calculateHeight = (items: FilterItem[] | undefined) => {
        if (!items || items.length === 0) return "auto";
        const itemCount = Math.min(items.length, 6);
        return `${itemCount * 35}px`;
    };

    const formatTitle = (title: string) => locale === "de" ? title : title.toLowerCase();

    // Load items only if not already loaded
    const toggleValue = (key: string, value: string) => {
        setSelectedValues((prev) => {
            const current = prev[key] || [];
            const updated = current.includes(value)
                ? current.filter((v) => v !== value)
                : [...current, value];
            setLastChangedKey(key);
            return {...prev, [key]: updated};
        });
    };

    const pinFilter = (title: string) => {
        setFilterDefs((prev) =>
            prev.map((f) =>
                f.title === title ? {...f, pinned: true} : f
            )
        );
        setMoreOpen(false);
    };

    const renderDisplayLabelWithDate = (key: string, title: string, type: FilterType, dateRange?: DateRange) => {
        if (type !== "date") return getDisplayLabel(key, t(title));
        const hasDate = dateRange?.from;
        return (
            <span>
                {getDisplayLabel(key, t(title))}
                {hasDate && ": "}
                <DatePickerDisplayName mode="range" date={dateRange} noPlaceholder={true}/>
            </span>
        );
    };

    return (
        <div
            className="flex gap-3 whitespace-nowrap mr-2
             overflow-x-auto scrollbar-thin scrollbar-thumb-muted-foreground
             md:flex-wrap md:overflow-visible md:scrollbar-none md:whitespace-normal"
        >
            {pinnedFilters.map(({title, key, itemsLoader, type = "default"}) => {
                const items = getLoadedItems(context, key);
                const search = searchTexts[key] ?? "";
                const filteredItems = !search || type !== "search"
                    ? items
                    : items?.filter(item =>
                        item.value.toLowerCase().includes(search.toLowerCase())
                    );
                const height = type === "date" ? undefined : calculateHeight(filteredItems);
                const dateRange = dateRanges[key];

                // update Funktion
                const setDateRange = (range?: DateRange) => {
                    setDateRanges(prev => ({...prev, [key]: range}));
                    setSelectedValues(prev => ({
                        ...prev,
                        [key]: range?.from && range?.to
                            ? [range.from.toISOString(), range.to.toISOString()]
                            : []
                    }));
                    setLastChangedKey(key);
                };
                return (
                    <Popover
                        key={key}
                        open={openKey === key}
                        onOpenChange={(isOpen) => {
                            setOpenKey(isOpen ? key : null);
                            if (isOpen && type !== "date") loadItemsForKey(key, itemsLoader!);
                        }}
                    >
                        <PopoverTrigger asChild>
                            <div className="relative">
                                <ButtonLoading
                                    isLoading={loadingKeys.includes(key)}
                                    loadingText={getDisplayLabel(key, t(title))}
                                    variant={(selectedValues[key]?.length ?? 0) > 0 ? "default" : "outline"}
                                    className={`rounded-full text-sm flex items-center gap-2 ${
                                        (selectedValues[key]?.length ?? 0) > 0 ? "pr-7" : ""
                                    }`}
                                >
                                    {renderDisplayLabelWithDate(key, title, type, dateRange)}
                                </ButtonLoading>

                                {(selectedValues[key]?.length ?? 0) > 0 && (
                                    <X
                                        className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground hover:text-red-600 cursor-pointer"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedValues(prev => {
                                                setLastChangedKey(key);
                                                return {...prev, [key]: []};
                                            });
                                            if (type === "date") setDateRange(undefined);
                                        }}
                                    />
                                )}
                            </div>
                        </PopoverTrigger>

                        <PopoverContent align="start" className="p-2 w-auto min-w-[220px]">
                            {type === "search" && (
                                <div className="relative mb-2 px-1">
                                    <Input
                                        value={search}
                                        onChange={(e) => setSearchTexts(prev => ({...prev, [key]: e.target.value}))}
                                        placeholder={`${t("placeholder.search")} ${formatTitle(t(title))}...`}
                                        className="pr-8"
                                    />
                                    {search && (
                                        <X
                                            className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground cursor-pointer"
                                            onClick={() => setSearchTexts(prev => ({...prev, [key]: ""}))}
                                        />
                                    )}
                                </div>
                            )}
                            {type === "date" ? (
                                // @ts-ignore
                                <DatePickerCalender mode="range" date={dateRange} setDate={setDateRange}/>
                            ) : (
                                <ScrollArea style={{height}} className="w-auto pr-2">
                                    <div className="flex flex-col gap-2 min-w-max">
                                        {filteredItems?.length ? filteredItems.map((item) => {
                                            const isChecked = !!selectedValues[key]?.includes(item.value);
                                            return (
                                                <label
                                                    key={item.value}
                                                    className="flex items-center gap-2 px-2 py-1 rounded hover:bg-muted cursor-pointer"
                                                >
                                                    <Checkbox checked={isChecked}
                                                              onCheckedChange={() => toggleValue(key, item.value)}/>
                                                    {item.icon && <div
                                                        className="w-4 h-4 text-muted-foreground">{item.icon}</div>}
                                                    <span className="flex-1 text-sm">{item.value}</span>
                                                    <span className="text-xs text-muted-foreground">{item.count}</span>
                                                </label>
                                            );
                                        }) : (
                                            <div
                                                className="text-sm text-muted-foreground px-2 py-1">{t("placeholder.no_results")}</div>
                                        )}
                                    </div>
                                </ScrollArea>
                            )}
                        </PopoverContent>
                    </Popover>
                );
            })}

            {unpinnedFilters.length > 0 && (
                <Popover open={moreOpen} onOpenChange={setMoreOpen}>
                    <PopoverTrigger asChild>
                        <Button variant="default" className="rounded-full text-sm flex items-center gap-1">
                            <Sliders className="w-4 h-4"/>{t("placeholder.more")}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent align="start" className="p-2 w-auto min-w-[220px] max-h-64 overflow-auto">
                        <div className="flex flex-col gap-2 min-w-max">
                            {unpinnedFilters.map(({title}) => (
                                <Button
                                    key={title}
                                    variant="ghost"
                                    className="justify-start text-sm"
                                    onClick={() => pinFilter(title)}
                                >
                                    {t(title)}
                                </Button>
                            ))}
                        </div>
                    </PopoverContent>
                </Popover>
            )}
        </div>
    );
};
