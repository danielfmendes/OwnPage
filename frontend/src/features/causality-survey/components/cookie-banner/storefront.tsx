import {Shirt, ArrowDownUp, Calculator, Search, ShoppingBag, Heart, TrendingUp} from "lucide-react";
import {
    CLOTHING_PRODUCTS,
    CLOTHING_RETURNING_USER,
    CURRENCY_PAIR,
    CURRENCY_POPULAR_PAIRS,
} from "@/features/causality-survey/lib/constants";
import type {Environment} from "@/features/causality-survey/lib/conjoint";

/**
 * Mock host-site backdrop — blurred so the cookie banner reads as the focal
 * point. Two variants drive the within-subjects environment factor:
 *
 *  - `Clothing`           — fashion shop with size/price chrome, a
 *                            "welcome back" personalisation hint, and a
 *                            cart counter. Plausibly benefits from
 *                            remembered preferences.
 *  - `Currency Converter` — single-purpose utility: amount in, amount out,
 *                            no return value for cookies to remember.
 */
export function MiniStorefront({environment}: {environment: Environment}) {
    if (environment === "Currency Converter") {
        return <CurrencyConverterMock/>;
    }
    return <ClothingShopMock/>;
}

function ClothingShopMock() {
    const {greeting, savedSize, cartCount} = CLOTHING_RETURNING_USER;
    return (
        <div
            aria-hidden
            className="absolute inset-0 bg-background flex flex-col [filter:blur(2px)] saturate-[0.95]"
        >
            {/* Top nav */}
            <div className="flex items-center gap-2 px-3 py-1.5 border-b border-border bg-white shrink-0">
                <Shirt className="w-3 h-3 text-foreground"/>
                <span className="text-[10px] font-bold tracking-tight">Linen &amp; Co.</span>
                <nav className="hidden sm:flex items-center gap-2 ml-2 text-[8px] font-semibold uppercase tracking-wider text-muted-foreground">
                    <span>New</span>
                    <span>Men</span>
                    <span>Women</span>
                    <span className="text-rose-500">Sale</span>
                </nav>
                <div className="ml-auto flex items-center gap-2">
                    <Search className="w-2.5 h-2.5 text-muted-foreground"/>
                    <Heart className="w-2.5 h-2.5 text-muted-foreground"/>
                    <div className="relative">
                        <ShoppingBag className="w-2.5 h-2.5 text-foreground"/>
                        <span className="absolute -top-1 -right-1.5 w-2.5 h-2.5 rounded-full bg-rose-500 text-white text-[6px] font-bold flex items-center justify-center">
                            {cartCount}
                        </span>
                    </div>
                </div>
            </div>

            {/* Returning-user strip — the "cookies remember you" beat */}
            <div className="flex items-center justify-between gap-2 px-3 py-1 border-b border-border bg-primary/5 shrink-0">
                <span className="text-[8px] font-bold tracking-wide text-foreground">
                    {greeting}
                </span>
                <span className="text-[8px] font-semibold text-muted-foreground">
                    Saved size · <span className="text-foreground">{savedSize}</span>
                </span>
            </div>

            {/* Product grid */}
            <div className="flex-1 grid grid-cols-3 gap-1.5 p-1.5 sm:p-2 min-h-0">
                {CLOTHING_PRODUCTS.map((p) => (
                    <div
                        key={p.id}
                        className="rounded-md border border-border bg-background overflow-hidden flex flex-col min-h-0"
                    >
                        <div className="aspect-square bg-muted overflow-hidden shrink-0 relative">
                            <img
                                src={p.image}
                                alt=""
                                className="w-full h-full object-cover"
                                loading="eager"
                                referrerPolicy="no-referrer"
                            />
                            <span className="absolute top-1 right-1 w-3 h-3 rounded-full bg-white/90 flex items-center justify-center">
                                <Heart className="w-1.5 h-1.5 text-foreground"/>
                            </span>
                        </div>
                        <div className="px-1.5 py-1 flex-1 min-h-0 flex flex-col justify-between gap-0.5">
                            <p className="text-[9px] font-bold leading-tight truncate">{p.name}</p>
                            <div className="flex items-center justify-between">
                                <p className="text-[9px] font-bold text-foreground leading-tight">{p.price}</p>
                                <span className="text-[7px] font-bold uppercase tracking-wider bg-foreground text-background px-1 py-px rounded">
                                    {p.size}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function CurrencyConverterMock() {
    const {from, to, rate, asOf, delta} = CURRENCY_PAIR;
    return (
        <div
            aria-hidden
            className="absolute inset-0 bg-background flex flex-col [filter:blur(2px)] saturate-[0.95]"
        >
            {/* Top nav */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 border-b border-border bg-white shrink-0">
                <div className="w-4 h-4 rounded bg-primary flex items-center justify-center">
                    <Calculator className="w-2.5 h-2.5 text-primary-foreground"/>
                </div>
                <span className="text-[10px] font-bold tracking-tight">RateCalc</span>
                <span className="ml-auto text-[8px] font-semibold text-muted-foreground tracking-wide">
                    LIVE FX · {asOf}
                </span>
            </div>

            {/* Convert card */}
            <div className="flex-1 flex flex-col gap-1.5 p-2.5 min-h-0">
                <div className="flex items-center justify-between">
                    <p className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground">
                        Convert
                    </p>
                    <span className="text-[8px] font-semibold text-emerald-600 inline-flex items-center gap-0.5">
                        <TrendingUp className="w-2 h-2"/>
                        {delta}
                    </span>
                </div>

                <div className="relative flex flex-col gap-1">
                    <CurrencyRow
                        flag={from.flag}
                        code={from.code}
                        name={from.name}
                        amount={from.amount}
                        emphasis="from"
                    />

                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                        <div className="w-5 h-5 rounded-full bg-foreground text-background flex items-center justify-center shadow ring-2 ring-background">
                            <ArrowDownUp className="w-2.5 h-2.5"/>
                        </div>
                    </div>

                    <CurrencyRow
                        flag={to.flag}
                        code={to.code}
                        name={to.name}
                        amount={to.amount}
                        emphasis="to"
                    />
                </div>

                <div className="flex items-center justify-between text-[8px] font-semibold">
                    <span className="text-muted-foreground">Rate</span>
                    <span className="text-foreground tabular-nums">
                        1 {from.code} = {rate} {to.code}
                    </span>
                </div>

                {/* Popular pairs strip — pure visual chrome */}
                <div className="mt-auto pt-1.5 border-t border-border">
                    <p className="text-[7px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
                        Popular pairs
                    </p>
                    <div className="grid grid-cols-3 gap-1">
                        {CURRENCY_POPULAR_PAIRS.map((pair) => (
                            <div
                                key={pair.label}
                                className="rounded-sm bg-muted/50 border border-border px-1 py-0.5 flex flex-col"
                            >
                                <span className="text-[7px] text-muted-foreground leading-tight">{pair.label}</span>
                                <span className="text-[8px] font-bold tabular-nums leading-tight">{pair.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function CurrencyRow({
    flag,
    code,
    name,
    amount,
    emphasis,
}: {
    flag: string;
    code: string;
    name: string;
    amount: string;
    emphasis: "from" | "to";
}) {
    return (
        <div
            className={
                emphasis === "from"
                    ? "rounded-md border border-border bg-white flex items-center justify-between px-2 py-1.5"
                    : "rounded-md border border-border bg-muted/40 flex items-center justify-between px-2 py-1.5"
            }
        >
            <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-[12px] leading-none">{flag}</span>
                <div className="flex flex-col leading-tight min-w-0">
                    <span className="text-[9px] font-bold tracking-wide">{code}</span>
                    <span className="text-[7px] text-muted-foreground truncate">{name}</span>
                </div>
            </div>
            <span
                className={
                    emphasis === "from"
                        ? "text-[12px] font-bold tabular-nums"
                        : "text-[12px] font-bold tabular-nums text-foreground"
                }
            >
                {amount}
            </span>
        </div>
    );
}
