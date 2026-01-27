import {Link} from "react-router-dom";
import {
    RocketIcon,
    BriefcaseIcon,
    GraduationCapIcon,
    LinkedinIcon,
    MailIcon,
    GithubIcon,
    Cpu,
    ArrowUpRight,
    ArrowRight,
} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {education, experience, selected_projects, skill_categories, social_links} from "@/config/personal.tsx";
import {useTheme} from "next-themes";

export default function Home() {
    const {theme, setTheme} = useTheme();

    const toggleTheme = () => {
        setTheme(theme === "dark" ? "light" : "dark");
    };

    return (
        <div
            className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans selection:bg-primary/20">

            <main className="max-w-6xl mx-auto px-6 py-12 md:py-24 space-y-16">

                {/* 1. HERO SECTION */}
                <section className="flex flex-col md:flex-row items-center justify-between gap-12 md:gap-20">

                    {/* Text Column (Left Desktop) */}
                    <div
                        className="flex-1 space-y-8 text-center md:text-left order-2 md:order-1 animate-in fade-in slide-in-from-bottom-8 duration-700">
                        <div className="space-y-4">
                            <Badge variant="outline"
                                   className="px-3 py-1 text-xs font-bold uppercase tracking-widest border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400">
                                Software Engineer / Data Analyst
                            </Badge>
                            <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[1.1]">
                                Hi, I'm <span
                                className="text-primary underline decoration-primary/30 decoration-4 underline-offset-4">Daniel</span>.
                            </h1>
                            <p className="text-xl md:text-2xl text-zinc-600 dark:text-zinc-300 leading-relaxed max-w-lg mx-auto md:mx-0 font-medium">
                                I build performant data warehouses and intelligent AI assistants that solve real-world
                                problems.
                            </p>
                        </div>

                        <div className="flex flex-wrap justify-center md:justify-start gap-4">
                            <Button asChild size="lg"
                                    className="rounded-full px-8 shadow-xl hover:scale-105 transition-all duration-300 font-bold">
                                <a href={social_links.linkedin} target="_blank" rel="noopener noreferrer">
                                    <LinkedinIcon className="mr-2 h-4 w-4"/> Connect
                                </a>
                            </Button>

                            <Button asChild size="lg" variant="secondary"
                                    className="rounded-full px-8 shadow-lg hover:scale-105 transition-all duration-300 font-bold">
                                <a href={social_links.github} target="_blank" rel="noopener noreferrer">
                                    <GithubIcon className="mr-2 h-4 w-4"/> GitHub
                                </a>
                            </Button>

                            <Button asChild variant="outline" size="lg"
                                    className="rounded-full px-8 border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                                <a href={`mailto:${social_links.email}`}>
                                    <MailIcon className="mr-2 h-4 w-4"/> Email Me
                                </a>
                            </Button>
                        </div>
                    </div>

                    {/* Image Column (Right Desktop, Creative Top Mobile) */}
                    <div
                        className="relative order-1 md:order-2 flex-shrink-0 animate-in fade-in zoom-in duration-1000 cursor-pointer group"
                        onClick={toggleTheme}
                        title="Click to change theme"
                    >
                        {/* Interactive Background Glow */}
                        <div
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[130%] h-[130%] bg-gradient-to-tr from-primary/20 to-blue-600/20 rounded-full blur-[80px] -z-10 group-hover:from-primary/40 group-hover:to-blue-600/40 transition-colors duration-500"></div>

                        {/* Portrait Image */}
                        <img
                            src="/logo/fotos/portrait.png"
                            alt="Daniel - Click to toggle theme"
                            className="relative w-48 h-48 md:w-80 md:h-80 rounded-full object-cover p-1 md:p-2 border-[8px] border-white dark:border-zinc-900 shadow-2xl z-10 transition-all duration-500 group-hover:scale-[1.05] group-active:scale-95"
                        />
                    </div>
                </section>


                {/* 2. SELECTED WORK */}
                <section className="space-y-10">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-primary/10 rounded-xl border border-primary/20">
                            <RocketIcon className="h-6 w-6 text-primary"/>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-black tracking-tight">Selected Work</h2>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        {selected_projects.map((project, index) => (
                            <ProjectCard
                                key={index}
                                title={project.title}
                                desc={project.desc}
                                link={project.link}
                                tag={project.tag}
                            />
                        ))}
                    </div>
                </section>


                {/* 3. experience & education */}
                <section className="grid md:grid-cols-2 gap-16 md:gap-24 relative">
                    {/* Vertical Divider */}
                    <div
                        className="hidden md:block absolute top-12 bottom-12 left-1/2 w-px bg-zinc-200 dark:bg-zinc-800"></div>

                    {/* Education */}
                    <div className="space-y-10">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-primary/10 rounded-xl border border-primary/20">
                                <GraduationCapIcon className="h-6 w-6 text-primary"/>
                            </div>
                            <h2 className="text-3xl md:text-4xl font-black tracking-tight">Education</h2>
                        </div>

                        <div className="space-y-10">
                            {education.map((item, i) => (
                                <TimelineItem key={i} {...item} />
                            ))}
                        </div>
                    </div>

                    {/* Experience */}
                    <div className="space-y-10">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-primary/10 rounded-xl border border-primary/20">
                                <BriefcaseIcon className="h-6 w-6 text-primary"/>
                            </div>
                            <h2 className="text-3xl md:text-4xl font-black tracking-tight">Experience</h2>
                        </div>

                        <div className="space-y-10">
                            {experience.map((item, i) => (
                                <TimelineItem key={i} {...item} />
                            ))}
                        </div>
                    </div>
                </section>


                {/* 4. TECHNICAL ARSENAL */}
                <section className="space-y-12 pb-24">
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-primary/10 rounded-xl border border-primary/20">
                                <Cpu className="h-6 w-6 text-primary"/>
                            </div>
                            <h2 className="text-3xl md:text-4xl font-black tracking-tight">Technical Arsenal</h2>
                        </div>
                        <p className="text-zinc-600 dark:text-zinc-400 text-lg max-w-2xl">
                            My preferred weapons of choice for digital construction.
                        </p>
                    </div>

                    {/* CONTENT: Modern Watermarked Bento Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                        {skill_categories.map((cat, idx) => (
                            <div
                                key={idx}
                                className="group relative overflow-hidden rounded-3xl bg-zinc-100/50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 p-8 transition-all duration-500 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-2xl hover:shadow-zinc-200/50 dark:hover:shadow-black/50"
                            >
                                {/* 1. The Watermark Icon (Creative Element) */}
                                <div
                                    className="absolute -right-6 -bottom-6 text-zinc-200 dark:text-zinc-800/50 opacity-20 group-hover:opacity-40 group-hover:scale-110 group-hover:-rotate-12 transition-all duration-700 ease-out pointer-events-none">
                                    <div className="[&>svg]:w-48 [&>svg]:h-48 [&>svg]:stroke-[1]">
                                        {cat.icon}
                                    </div>
                                </div>

                                {/* 2. Content Layer */}
                                <div className="relative z-10 space-y-6">
                                    {/* Header */}
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="p-2 bg-white dark:bg-zinc-950 rounded-lg border border-zinc-200 dark:border-zinc-800 text-primary shadow-sm">
                                            {cat.icon}
                                        </div>
                                        <h3 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                                            {cat.label}
                                        </h3>
                                    </div>

                                    {/* Skills Cloud */}
                                    <div className="flex flex-wrap gap-2">
                                        {cat.skills.map((skill) => (
                                            <span
                                                key={skill}
                                                className="
                                    px-3 py-1.5 rounded-md text-xs font-semibold font-mono tracking-wide
                                    bg-white/80 dark:bg-black/40 backdrop-blur-md
                                    border border-zinc-200/50 dark:border-zinc-800/50
                                    text-zinc-600 dark:text-zinc-400
                                    group-hover:border-primary/30 group-hover:text-primary
                                    group-hover:bg-white dark:group-hover:bg-zinc-950
                                    transition-all duration-300 cursor-default select-none
                                "
                                            >
                                {skill}
                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </main>
        </div>
    );
}

// --- HELPER COMPONENTS (Optimized for Visibility) ---
interface ProjectCardProps {
    title: string;
    desc: string;
    link: string;
    tag: string;
}

function ProjectCard({title, desc, link, tag}: ProjectCardProps) {
    return (
        <Link to={link} className="block h-full group outline-none cursor-pointer">
            <Card
                className="relative h-full flex flex-col border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 rounded-[2rem] overflow-hidden transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-2xl group-hover:shadow-primary/10 group-hover:border-primary/20">

                {/* Visual Indicator: Top Right Arrow (Hidden until hover) */}
                <div
                    className="absolute top-6 right-6 text-primary opacity-0 -translate-y-2 translate-x-2 transition-all duration-500 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0">
                    <ArrowUpRight className="w-5 h-5"/>
                </div>

                <div className="flex flex-col h-full">
                    {/* 1. Header: Tighter Top Padding */}
                    <CardHeader className="px-6 pt-5 md:px-8 pb-0">
                        <div className="flex flex-col items-start gap-4">
                            <Badge
                                variant="secondary"
                                className="bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors border-transparent rounded-md px-2 py-0.5 text-[10px] font-bold tracking-[0.15em] uppercase"
                            >
                                {tag}
                            </Badge>

                            <CardTitle
                                className="text-2xl md:text-3xl font-black tracking-tight text-zinc-900 dark:text-white group-hover:text-primary transition-colors duration-300 leading-none pr-4">
                                {title}
                            </CardTitle>
                        </div>
                    </CardHeader>

                    {/* 2. Content */}
                    <CardContent
                        className="px-6 pb-5 md:px-8 md:pb-6 pt-4 flex flex-col justify-between flex-grow gap-6">
                        <p className="text-zinc-500 dark:text-zinc-400 leading-snug text-base font-medium transition-colors group-hover:text-zinc-900 dark:group-hover:text-zinc-200">
                            {desc}
                        </p>

                        {/* 3. Bottom Indicator */}
                        <div
                            className="flex items-center gap-2 text-xs font-bold text-zinc-400 dark:text-zinc-600 group-hover:text-primary transition-colors duration-300 mt-auto">
                            View Project
                            <ArrowRight
                                className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1"/>
                        </div>
                    </CardContent>
                </div>

                {/* 4. Active Line Animation */}
                <div
                    className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-primary to-blue-600 w-0 group-hover:w-full transition-all duration-500 ease-out"/>
            </Card>
        </Link>
    );
}

function TimelineItem({title, institution, company, description, period, image}: any) {
    return (
        <div className="flex gap-5 items-start group">
            {/* Logo Container: Fixed original colors and proper fit */}
            <div className="relative flex-shrink-0">
                <img
                    src={image}
                    className="w-16 h-16 rounded-2xl object-contain bg-white border border-zinc-200 dark:border-zinc-800 shadow-sm transition-all duration-500 group-hover:scale-110"
                    alt={title}
                />
            </div>

            <div className="space-y-1.5 flex-1">
                {/* Header: Title and Period */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <h4 className="font-bold text-base leading-tight group-hover:text-primary transition-colors text-zinc-900 dark:text-zinc-100">
                        {title}
                    </h4>
                    <span
                        className="text-[10px] font-mono font-bold text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-2 py-0.5 rounded w-fit shrink-0">
                        {period}
                    </span>
                </div>

                {/* Subtitle: Institution or Company */}
                <p className="text-sm font-bold text-primary">{institution || company}</p>

                {/* Description: Rendered as bullet points */}
                <ul className="mt-2 space-y-1.5">
                    {Array.isArray(description) ? (
                        description.map((point, index) => (
                            <li key={index}
                                className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed flex items-start gap-2.5 font-medium">
                                {/* Custom Bullet Point */}
                                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary/60 shrink-0"/>
                                <span>{point}</span>
                            </li>
                        ))
                    ) : (
                        <li className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed font-medium">
                            {description}
                        </li>
                    )}
                </ul>
            </div>
        </div>
    );
}