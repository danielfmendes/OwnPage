import {useEffect, useRef, useState} from "react";
import {ArrowRight, Check, ChevronDown, Loader2, UserRound} from "lucide-react";
import {Button} from "@/features/causality-survey/components/ui/button";
import {Input} from "@/features/causality-survey/components/ui/input";
import {Label} from "@/features/causality-survey/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/features/causality-survey/components/ui/select";
import {RadioGroup, RadioGroupItem} from "@/features/causality-survey/components/ui/radio-group";
import {
    NATIONALITY_OPTIONS,
    PROFESSION_OPTIONS,
} from "@/features/causality-survey/lib/constants";
import {cn} from "@/features/causality-survey/lib/utils";
import type {Demographics} from "@/features/causality-survey/lib/conjoint";

/**
 * Searchable single-select. Type to filter the list, click to commit.
 * Lighter than pulling cmdk + popover back in for a single field.
 */
function SearchableSelect({
    value,
    onChange,
    options,
    placeholder,
}: {
    value: string;
    onChange: (v: string) => void;
    options: string[];
    placeholder: string;
}) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [activeIndex, setActiveIndex] = useState(0);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
                setOpen(false);
                setQuery("");
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const filtered = options.filter((o) =>
        o.toLowerCase().includes(query.toLowerCase()),
    );

    const commit = (option: string) => {
        onChange(option);
        setQuery("");
        setOpen(false);
    };

    const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setOpen(true);
            setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActiveIndex((i) => Math.max(i - 1, 0));
        } else if (e.key === "Enter" && open && filtered[activeIndex]) {
            e.preventDefault();
            commit(filtered[activeIndex]);
        } else if (e.key === "Escape") {
            setOpen(false);
            setQuery("");
        }
    };

    const display = open ? query : value;

    return (
        <div ref={wrapperRef} className="relative">
            <div className="relative">
                <Input
                    role="combobox"
                    aria-expanded={open}
                    aria-controls="nationality-listbox"
                    value={display}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setOpen(true);
                        setActiveIndex(0);
                        if (value) onChange("");
                    }}
                    onFocus={() => setOpen(true)}
                    onKeyDown={onKeyDown}
                    placeholder={placeholder}
                    className="pr-9"
                />
                <ChevronDown
                    className={cn(
                        "absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none transition-transform",
                        open && "rotate-180",
                    )}
                />
            </div>
            {open && (
                <div
                    id="nationality-listbox"
                    role="listbox"
                    className="absolute z-50 mt-1 w-full max-h-60 overflow-y-auto bg-popover text-popover-foreground border border-border rounded-lg shadow-lg p-1"
                >
                    {filtered.length === 0 ? (
                        <div className="px-3 py-2 text-sm text-muted-foreground">No matches</div>
                    ) : (
                        filtered.map((option, i) => (
                            <button
                                key={option}
                                type="button"
                                role="option"
                                aria-selected={value === option}
                                onMouseEnter={() => setActiveIndex(i)}
                                onClick={() => commit(option)}
                                className={cn(
                                    "flex items-center justify-between w-full text-left px-3 py-2 rounded-md text-sm transition-colors",
                                    activeIndex === i ? "bg-muted" : "hover:bg-muted/60",
                                    value === option && "font-semibold",
                                )}
                            >
                                <span>{option}</span>
                                {value === option && <Check className="w-4 h-4 text-primary shrink-0"/>}
                            </button>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}

interface DemographicsFormProps {
    onSubmit: (demographics: Demographics) => void;
    isLoading: boolean;
}

export function DemographicsForm({onSubmit, isLoading}: DemographicsFormProps) {
    const [age, setAge] = useState<string>("");
    const [nationality, setNationality] = useState<string>("");
    const [profession, setProfession] = useState<string>("");
    const [isCatolicaMaster, setIsCatolicaMaster] = useState<"yes" | "no" | "">("");

    const isStudent = profession === "Student";

    const ageNum = Number(age);
    const ageValid = age !== "" && Number.isFinite(ageNum) && ageNum >= 16 && ageNum <= 100;
    const nationalityValid = nationality !== "";
    const professionValid = profession !== "";
    const catolicaValid = !isStudent || isCatolicaMaster !== "";
    const canSubmit =
        ageValid && nationalityValid && professionValid && catolicaValid && !isLoading;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!canSubmit) return;
        onSubmit({
            age: ageNum,
            nationality,
            profession,
            isCatolicaMaster: isStudent ? isCatolicaMaster === "yes" : null,
        });
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300"
        >
            <div className="px-5 sm:px-8 pt-5 sm:pt-6 pb-4 border-b border-border">
                <div className="flex items-center gap-3 mb-1">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                        <UserRound className="w-4 h-4 text-primary"/>
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                            Last step
                        </p>
                        <h2 className="text-lg sm:text-xl font-bold tracking-tight">
                            A few details
                        </h2>
                    </div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                    Anonymous and used only to analyse the study results.
                </p>
            </div>

            <div className="px-5 sm:px-8 py-6 flex flex-col gap-6">

                {/* Age */}
                <div className="flex flex-col gap-2">
                    <Label htmlFor="age" className="text-sm font-semibold">Age</Label>
                    <Input
                        id="age"
                        type="number"
                        inputMode="numeric"
                        min={16}
                        max={100}
                        placeholder="e.g. 24"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                    />
                </div>

                {/* Nationality */}
                <div className="flex flex-col gap-2">
                    <Label className="text-sm font-semibold">Nationality</Label>
                    <SearchableSelect
                        value={nationality}
                        onChange={setNationality}
                        options={NATIONALITY_OPTIONS}
                        placeholder="Type to filter or pick from list…"
                    />
                </div>

                {/* Profession */}
                <div className="flex flex-col gap-2">
                    <Label className="text-sm font-semibold">What do you do?</Label>
                    <Select value={profession} onValueChange={setProfession}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select your profession"/>
                        </SelectTrigger>
                        <SelectContent>
                            {PROFESSION_OPTIONS.map((p) => (
                                <SelectItem key={p} value={p}>{p}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Católica branch — only when student */}
                {isStudent && (
                    <div className="flex flex-col gap-3 rounded-xl border border-border bg-muted/30 p-4 sm:p-5 animate-in fade-in slide-in-from-top-1 duration-200">
                        <Label className="text-sm font-semibold">
                            Are you a Master's student at Católica Lisbon?
                        </Label>
                        <RadioGroup
                            value={isCatolicaMaster}
                            onValueChange={(v) => setIsCatolicaMaster(v as "yes" | "no")}
                            className="flex gap-6"
                        >
                            <label className="flex items-center gap-2 cursor-pointer text-sm">
                                <RadioGroupItem value="yes" id="catolica-yes"/>
                                <span>Yes</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer text-sm">
                                <RadioGroupItem value="no" id="catolica-no"/>
                                <span>No</span>
                            </label>
                        </RadioGroup>

                    </div>
                )}

                <Button
                    type="submit"
                    size="lg"
                    disabled={!canSubmit}
                    className="w-full h-11 font-semibold rounded-xl group mt-2"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin"/>
                            Submitting…
                        </>
                    ) : (
                        <>
                            Submit responses
                            <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-0.5 transition-transform"/>
                        </>
                    )}
                </Button>
            </div>
        </form>
    );
}
