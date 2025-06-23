export function Section({title, children}: {
    title: string;
    children: React.ReactNode;
}) {
    return (
        <section className="space-y-2">
            <h2 className="text-xl font-semibold text-foreground">{title}</h2>
            {children}
        </section>
    );
}