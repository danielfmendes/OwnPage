import {useState} from "react";
import {
    Dialog,
    DialogContent,
    DialogTrigger,
    DialogHeader,
    DialogFooter,
    DialogTitle,
} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {Sliders} from "lucide-react";
import {FilterBar} from "./FilterBar";
import type {FilterDefinition} from "./FilterBar";
import FilterManager, {type FilterType} from "@/utils/filtermanager";
import {useTranslation} from "react-i18next";
import {Badge} from "@/components/ui/badge";
import type {CustomColumnDef} from "@/models/datatable/column";
import {Sort, SortDirection, type SortDirectionType} from "@/models/datatable/sort";

interface MobileFilterProps<TData> {
    filters: FilterDefinition[];
    filterManager: FilterManager;
    onChange: (key: string, selected: string[], type: FilterType) => void;
    columns: CustomColumnDef<TData>[];
    sort: Sort;
    updateSort: (key: string, sortDirection?: SortDirectionType) => void;
}

export default function MobileFilterDialog<TData>({
                                                      filters,
                                                      filterManager,
                                                      onChange,
                                                      columns,
                                                      sort,
                                                      updateSort,
                                                  }: MobileFilterProps<TData>) {
    const [open, setOpen] = useState(false);
    const selectedValues = filterManager.getSelectedValues();
    const {t} = useTranslation();

    const totalSelected = Object.values(selectedValues).reduce(
        (sum, arr) => sum + (arr?.length ?? 0),
        0
    );

    function getSortDirectionForKey(key: string): string | "unsorted" {
        const item = sort.items.find((i) => i.key === key);
        return item ? item.order : "unsorted";
    }

    const sortStates: { label: string; value?: SortDirectionType; display: string }[] = [
        {label: "asc", value: SortDirection.ASC, display: t("filterBar.asc")},
        {label: "desc", value: SortDirection.DESC, display: t("filterBar.desc")},
        {label: "unsorted", value: undefined, display: t("filterBar.unsorted")},
    ];

    return (
        <div className="sm:hidden">
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline" className="relative rounded-full">
                        <Sliders className="w-4 h-4"/>
                        {t("filterBar.filters")}
                        {totalSelected > 0 && (
                            <Badge className="absolute top-[-6px] right-[-6px] text-[10px] px-1.5 py-0.5 rounded-full">
                                {totalSelected}
                            </Badge>
                        )}
                    </Button>
                </DialogTrigger>

                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {t("filterBar.title")}
                        </DialogTitle>
                        <p className="mt-1">
                            {t("filterBar.subtitle")}
                        </p>
                    </DialogHeader>

                    {/* Filters Section */}
                    <div>
                        <h2 className="border-b border-primary pb-2 mb-3">
                            {t("filterBar.filters")}
                        </h2>
                        <FilterBar filters={filters} filterManager={filterManager} onChange={onChange}
                                   isMobile={true}/>
                    </div>

                    {/* Sort Section */}
                    <div>
                        <h2 className="border-b b border-primary pb-2 mb-3">
                            {t("filterBar.sort")}
                        </h2>
                        <ul className="space-y-3">
                            {columns.map((col, idx) => {
                                const colKey = (col as any).accessorKey || col.id;
                                if (!colKey || colKey === "actions") return null;
                                const currentDirection = getSortDirectionForKey(colKey);

                                return (
                                    <li
                                        key={col.id || colKey || idx}
                                        className="flex justify-between items-center border border-primary rounded-md p-3"
                                    >
                                            <span className="font-medium">
                                              {col.header || colKey || "Unnamed"}
                                            </span>
                                        <div className="flex gap-2 text-sm">
                                            {sortStates.map(({label, value, display}) => (
                                                <Button
                                                    key={label}
                                                    variant={currentDirection === label ? "default" : "secondary"}
                                                    size="sm"
                                                    onClick={() => updateSort(colKey, value)}
                                                    aria-pressed={currentDirection === label}
                                                    className="transition-colors duration-200"
                                                >
                                                    {display}
                                                </Button>
                                            ))}
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>

                    <DialogFooter className="mt-8">
                        <div className="flex gap-3">
                            <Button className="flex-1" onClick={() => setOpen(false)}>
                                {t("button.close")}
                            </Button>
                            <Button
                                variant="destructive"
                                className="flex-1"
                                onClick={() => {
                                    setOpen(false);
                                }}
                            >
                                {t("button.reset")}
                            </Button>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
