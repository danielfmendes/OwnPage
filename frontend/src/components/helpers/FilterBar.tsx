import * as React from "react";
import {Popover, PopoverContent, PopoverTrigger,} from "@/components/ui/popover";
import {Button} from "@/components/ui/button";
import {Checkbox} from "@/components/ui/checkbox";
import {ScrollArea} from "@/components/ui/scroll-area";
import {Input} from "@/components/ui/input";
import {Sliders, X} from "lucide-react";
import {useTranslation} from "react-i18next";
import {useNotification} from "@/components/helpers/NotificationProvider";
import i18n from "i18next";
import FilterManager from "@/utils/filtermanager";
import {ButtonLoading} from "@/components/helpers/ButtonLoading";
import {useFilterStore} from "@/utils/filterstate";

export interface FilterItem {
    value: string;
    count: number;
    icon?: React.ReactNode;
}

export interface FilterDefinition {
    title: string;
    key: string;
    itemsLoader: () => Promise<FilterItem[]>;
    type?: "search" | "default";
    pinned?: boolean;
}

export interface FilterBarProps {
    filters: FilterDefinition[];
    filterManager: FilterManager;
    onChange: (key: string, selected: string[]) => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({filters, filterManager, onChange}) => {
    const locale = i18n.language;
    const {t} = useTranslation();
    const {addNotification} = useNotification();
    const context = React.useMemo(() => window.location.pathname.replace(/^\/|\/$/g, ""), []);

    const getLoadedItems = useFilterStore((state) => state.getLoadedItems);
    const setLoadedItems = useFilterStore((state) => state.setLoadedItems);
    const [filterDefs, setFilterDefs] = React.useState<FilterDefinition[]>(
        filters.map(f => ({...f, pinned: f.pinned !== false}))
    );
    const [selectedValues, setSelectedValues] = React.useState<Record<string, string[]>>(() => {
        return filterManager.getFilters();
    });
    const [loadingKeys, setLoadingKeys] = React.useState<string[]>([]);
    const [openKey, setOpenKey] = React.useState<string | null>(null);
    const [searchTexts, setSearchTexts] = React.useState<Record<string, string>>({});
    const [moreOpen, setMoreOpen] = React.useState(false);

    React.useEffect(() => {
        setFilterDefs(filters.map(f => ({...f, pinned: f.pinned !== false})));
    }, [filters]);

    // loads items for every key with values
    React.useEffect(() => {
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
    React.useEffect(() => {
        setFilterDefs((prev) =>
            prev.map((filter) => {
                const hasSelected = (selectedValues[filter.key]?.length ?? 0) > 0;
                if (hasSelected && filter.pinned !== true) {
                    return {...filter, pinned: true};
                }
                return filter;
            })
        );
    }, [selectedValues, filters]);

    React.useEffect(() => {
        Object.entries(selectedValues).forEach(([key, values]) => {
            onChange(key, values);
        });
    }, [selectedValues]);

    // Load items only if not already loaded
    const toggleValue = (key: string, value: string) => {
        setSelectedValues((prev) => {
            const current = prev[key] || [];
            const updated = current.includes(value)
                ? current.filter((v) => v !== value)
                : [...current, value];

            return {...prev, [key]: updated};
        });
    };

    const loadItemsForKey = async (key: string, loader: () => Promise<FilterItem[]>) => {
        const alreadyLoaded = getLoadedItems(context, key);
        if (alreadyLoaded) return;
        setLoadingKeys((prev) => [...prev, key]);
        try {
            const result = await loader();
            setLoadedItems(context, key, result);
        } catch (err) {
            addNotification(`Error loading items for ${key}`, "error");
        } finally {
            setLoadingKeys((prev) => prev.filter((k) => k !== key));
        }
    };

    const getDisplayLabel = (key: string, title: string) => {
        const values = selectedValues[key] || [];
        const items = getLoadedItems(context, key) || [];
        const labels = values
            .map((val) => items.find((i) => i.value === val)?.value)
            .filter(Boolean);
        if (labels.length === 0) return title;
        if (labels.length < 3) return `${title}: ${labels.join(", ")}`;
        return `${title}: ${labels.length}+ ${t("placeholder.selected")}`;
    };

    const calculateHeight = (items: FilterItem[] | undefined) => {
        if (!items || items.length === 0) return "auto";
        const itemCount = Math.min(items.length, 6);
        return `${itemCount * 35}px`;
    };

    const formatTitle = (title: string) => locale === "de" ? title : title.toLowerCase();

    const pinnedFilters = filterDefs.filter(f => f.pinned !== false);
    const unpinnedFilters = filterDefs.filter(f => f.pinned === false);

    const pinFilter = (title: string) => {
        setFilterDefs((prev) =>
            prev.map((f) =>
                f.title === title ? {...f, pinned: true} : f
            )
        );
        setMoreOpen(false);
    };

    return (
        <div className="flex flex-wrap gap-3">
            {pinnedFilters.map(({title, key, itemsLoader, type}) => {
                const items = getLoadedItems(context, key);
                const search = searchTexts[key] ?? "";
                const filteredItems = !search || type !== "search"
                    ? items
                    : items?.filter(item =>
                        item.value.toLowerCase().includes(search.toLowerCase())
                    );

                const height = calculateHeight(filteredItems);

                return (
                    <Popover
                        key={key}
                        open={openKey === key}
                        onOpenChange={(isOpen) => {
                            setOpenKey(isOpen ? key : null);
                            if (isOpen) loadItemsForKey(key, itemsLoader);
                        }}
                    >
                        <PopoverTrigger asChild>
                            <ButtonLoading
                                isLoading={loadingKeys.includes(key)}
                                loadingText={getDisplayLabel(key, t(title))}
                                variant={(selectedValues[key]?.length ?? 0) > 0 ? "default" : "outline"}
                                className={`rounded-full text-sm flex items-center gap-2 ${
                                    (selectedValues[key]?.length ?? 0) > 0 ? "" : "bg-muted"
                                }`}
                            >
                                <span>{getDisplayLabel(key, t(title))}</span>
                                {(selectedValues[key]?.length ?? 0) > 0 && (
                                    <X
                                        className="w-4 h-4 text-muted-foreground hover:text-red-600"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedValues((prev) => ({
                                                ...prev,
                                                [key]: [],
                                            }));
                                        }}
                                    />
                                )}
                            </ButtonLoading>
                        </PopoverTrigger>
                        <PopoverContent align="start" className="p-2 w-auto min-w-[220px]">
                            {type === "search" && (
                                <div className="relative mb-2 px-1">
                                    <Input
                                        value={search}
                                        onChange={(e) =>
                                            setSearchTexts(prev => ({
                                                ...prev,
                                                [key]: e.target.value
                                            }))
                                        }
                                        placeholder={`${t("placeholder.search")} ${formatTitle(t(title))}...`}
                                        className="pr-8"
                                    />
                                    {search && (
                                        <X
                                            className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground cursor-pointer"
                                            onClick={() =>
                                                setSearchTexts(prev => ({
                                                    ...prev,
                                                    [key]: ""
                                                }))
                                            }
                                        />
                                    )}
                                </div>
                            )}
                            <ScrollArea style={{height}} className="w-auto pr-2">
                                <div className="flex flex-col gap-2 min-w-max">
                                    {(filteredItems && filteredItems.length > 0) ? (
                                        filteredItems.map((item) => {
                                            const isChecked = (selectedValues[key] || []).includes(item.value);
                                            return (
                                                <label
                                                    key={item.value}
                                                    className="flex items-center gap-2 px-2 py-1 rounded hover:bg-muted cursor-pointer"
                                                >
                                                    <Checkbox
                                                        checked={isChecked}
                                                        onCheckedChange={() => toggleValue(key, item.value)}
                                                    />
                                                    {item.icon && (
                                                        <div className="text-muted-foreground w-4 h-4">
                                                            {React.cloneElement(item.icon as React.ReactElement, {
                                                                className: "w-4 h-4",
                                                            })}
                                                        </div>
                                                    )}
                                                    <span className="flex-1 text-sm">{item.value}</span>
                                                    <span className="text-xs text-muted-foreground">{item.count}</span>
                                                </label>
                                            );
                                        })
                                    ) : (
                                        <div className="text-sm text-muted-foreground px-2 py-1">
                                            {t("placeholder.no_results")}
                                        </div>
                                    )}
                                </div>
                            </ScrollArea>
                        </PopoverContent>
                    </Popover>
                );
            })}

            {unpinnedFilters.length > 0 && (
                <Popover open={moreOpen} onOpenChange={setMoreOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="default"
                            className="rounded-full text-sm flex items-center gap-1"
                            aria-label={t("more")}
                        >
                            <Sliders className="w-4 h-4"/>{t("placeholder.more")}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent align="start" className="p-2 w-auto min-w-[220px] max-h-64 overflow-auto">
                        <div className="flex flex-col gap-2 min-w-max">
                            {unpinnedFilters.map(({title}) => {
                                const key = title.toLowerCase();
                                return (
                                    <Button
                                        key={key}
                                        variant="ghost"
                                        className="justify-start text-sm"
                                        onClick={() => pinFilter(title)}
                                    >
                                        {t(title)}
                                    </Button>
                                );
                            })}
                        </div>
                    </PopoverContent>
                </Popover>
            )}
        </div>
    );
};
