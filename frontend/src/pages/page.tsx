import {Link} from "react-router-dom";
import {
    RocketIcon,
    BriefcaseIcon,
    GraduationCapIcon,
    LinkedinIcon,
    ChevronRightIcon,
    MailIcon,
    LayersIcon,
    DatabaseIcon,
    BrainCircuitIcon,
    LayoutTemplateIcon, GithubIcon,
} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";

const education = [
    {
        title: "Business Analytics Master of Science",
        institution: "Católica Lisbon School of Business & Economics",
        description: [
            "Coursework includes Foundations of Statistics, Database Management, and Predictive Analytics",
            "Programme fully taught in English"
        ],
        period: "09/2025 - 02/2027",
        image: "/logo/Católica.png",
    },
    {
        title: "Business Informatics Bachelor of Science",
        institution: "University of Applied Sciences Hamburg",
        description: [
            "Final Grade: 14.13 points out of 15",
            "The programme covered topics including Software Development, Business Systems, Databases, and Mathematics",
            "Strong focus on practical experience with projects and teamwork, providing hands-on learning opportunities"
        ],
        period: "09/2021 - 03/2025",
        image: "/logo/Haw.jpg",
    },
    {
        title: "German Abitur (equivalent to High School Diploma)",
        institution: "Emil-von-Behring-Gymnasium Großhansdorf",
        description: [
            "Graduated with final grade: 1.2",
            "Specialization: Natural Sciences (Physics, Biology, and Informatics)",
            "Final examinations in: Mathematics, Physics, French, and Economics"
        ],
        period: "09/2013 - 06/2021",
        image: "/logo/Emil-von-Behring.jpg",
    },
];

const experience = [
    {
        title: "Intern Software Development",
        company: "softAIs GmbH - Hamburg / remote",
        description: [
            "Developed and automated frontend test suites (CRUD operations, table validations) and integrated them into CI/CD pipelines",
            "Designed and implemented modern web applications for internal and client use with React, improving usability and visual consistency"
        ],
        period: "05/2025- 08/2025",
        image: "/logo/softais.jpg",
    },
    {
        title: "Working student, Software Development & Data Science",
        company: "Otto Group data.works GmbH - Hamburg",
        description: [
            "Analyzed production databases with SQL, including views, materialized views, indexes, window functions, and triggers, identifying and resolving critical errors to improve data accuracy and reliability",
            "Developed and implemented frontend features using Vue / TypeScript",
            "Collaborated in Agile cycles (Dailies, Sprints, Retrospectives) and improved code quality via code reviews and pair programming"
        ],
        period: "01/2024- 12/2024",
        image: "/logo/data_works.jpeg",
    },
];

const skill_categories = [
    {
        label: "AI & Intelligence",
        icon: <BrainCircuitIcon className="w-5 h-5"/>,
        skills: ["Llama 3.1", "Workers AI", "Python", "RAG Systems"]
    },
    {
        label: "Data Engineering",
        icon: <DatabaseIcon className="w-5 h-5"/>,
        skills: ["PostgreSQL", "Cloudflare D1", "SQL Optimization", "ETL"]
    },
    {
        label: "Modern Frontend",
        icon: <LayoutTemplateIcon className="w-5 h-5"/>,
        skills: ["React", "TypeScript", "Next.js", "Tailwind CSS"]
    },
    {
        label: "Backend & Cloud",
        icon: <LayersIcon className="w-5 h-5"/>,
        skills: ["Node.js", "Cloudflare Workers", "Docker", "REST APIs"]
    }
];

export default function Home() {
    return (
        <div
            className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans selection:bg-primary/20">

            <main className="max-w-6xl mx-auto px-6 py-12 md:py-24 space-y-32">

                {/* 1. HERO SECTION */}
                <section className="flex flex-col md:flex-row items-center justify-between gap-12 md:gap-20">

                    {/* Text Column (Left Desktop) */}
                    <div
                        className="flex-1 space-y-8 text-center md:text-left order-2 md:order-1 animate-in fade-in slide-in-from-bottom-8 duration-700">
                        <div className="space-y-4">
                            <Badge variant="outline"
                                   className="px-3 py-1 text-xs font-bold uppercase tracking-widest border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400">
                                Software Engineer
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
                                <a href="https://www.linkedin.com/in/daniel-freire-mendes/" target="_blank" rel="noopener noreferrer">
                                    <LinkedinIcon className="mr-2 h-4 w-4"/> Connect
                                </a>
                            </Button>

                            <Button asChild size="lg" variant="secondary"
                                    className="rounded-full px-8 shadow-lg hover:scale-105 transition-all duration-300 font-bold">
                                <a href="https://github.com/danielfmendes" target="_blank" rel="noopener noreferrer">
                                    <GithubIcon className="mr-2 h-4 w-4"/> GitHub
                                </a>
                            </Button>

                            <Button asChild variant="outline" size="lg"
                                    className="rounded-full px-8 border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                                <a href="mailto:freiremendesdaniel2002@gmail.com">
                                    <MailIcon className="mr-2 h-4 w-4"/> Email Me
                                </a>
                            </Button>
                        </div>
                    </div>

                    {/* Image Column (Right Desktop, Creative Top Mobile) */}
                    <div className="relative order-1 md:order-2 flex-shrink-0 animate-in fade-in zoom-in duration-1000">
                        <div
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[130%] h-[130%] bg-gradient-to-tr from-primary/20 to-blue-600/20 rounded-full blur-[80px] -z-10"></div>
                        <img
                            src="/logo/Portrait_Daniel_Freire_Mendes.png"
                            alt="Daniel"
                            className="relative w-48 h-48 md:w-80 md:h-80 rounded-full object-cover p-1 md:p-2 border-[8px] border-white dark:border-zinc-900 shadow-2xl z-10 transition-transform duration-500 hover:scale-[1.02]"
                        />
                    </div>
                </section>


                {/* 2. SELECTED WORK (High Contrast Cards) */}
                <section className="space-y-10">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-primary/10 rounded-xl border border-primary/20"><RocketIcon
                            className="h-6 w-6 text-primary"/></div>
                        <h2 className="text-3xl md:text-4xl font-black tracking-tight">Selected Work</h2>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        <ProjectCard
                            title="Data Warehouse System"
                            desc="A comprehensive BI platform for real-time sales and inventory tracking powered by D1."
                            link="/dwh/login"
                            tag="Analytics"
                        />
                        <ProjectCard
                            title="AI Streaming Chatbot"
                            desc="Intelligent assistant with real-time token streaming using Llama 3.1 & Workers AI."
                            link="/chat"
                            tag="AI / LLM"
                        />
                    </div>
                </section>


                {/* 3. experience & education */}
                <section className="grid md:grid-cols-2 gap-16 md:gap-24 relative">
                    {/* Vertical Divider */}
                    <div
                        className="hidden md:block absolute top-12 bottom-12 left-1/2 w-px bg-zinc-200 dark:bg-zinc-800"></div>

                    {/* Education */}
                    <div className="space-y-10">
                        <div className="flex items-center gap-3 pb-4">
                            <GraduationCapIcon className="h-6 w-6 text-primary"/>
                            <h3 className="text-2xl font-bold tracking-tight">Education</h3>
                        </div>
                        <div className="space-y-10">
                            {education.map((item, i) => <TimelineItem key={i} {...item} />)}
                        </div>
                    </div>

                    {/* Experience */}
                    <div className="space-y-10">
                        <div className="flex items-center gap-3 pb-4">
                            <BriefcaseIcon className="h-6 w-6 text-primary"/>
                            <h3 className="text-2xl font-bold tracking-tight">Experience</h3>
                        </div>
                        <div className="space-y-10">
                            {experience.map((item, i) => <TimelineItem key={i} {...item} />)}
                        </div>
                    </div>
                </section>


                {/* 4. TECHNICAL ARSENAL */}
                <section className="space-y-10 pb-12">
                    <div className="text-center space-y-4 max-w-2xl mx-auto">
                        <h2 className="text-3xl md:text-4xl font-black tracking-tight">Technical Arsenal</h2>
                        <p className="text-zinc-600 dark:text-zinc-400 text-lg">The tools and technologies I use to
                            build scalable solutions.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {skill_categories.map((cat, idx) => (
                            <Card key={idx}
                                  className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm hover:border-primary/50 transition-colors">
                                <CardHeader className="pb-3">
                                    <div className="flex items-center gap-3 text-primary mb-2">
                                        <div className="p-2.5 bg-zinc-100 dark:bg-zinc-800 rounded-lg">{cat.icon}</div>
                                    </div>
                                    <CardTitle
                                        className="text-sm font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">{cat.label}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-wrap gap-2">
                                        {cat.skills.map(skill => (
                                            <Badge key={skill} variant="secondary"
                                                   className="bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-primary/10 hover:text-primary transition-colors font-medium border border-zinc-200 dark:border-zinc-700">
                                                {skill}
                                            </Badge>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </section>

            </main>
        </div>
    );
}

// --- HELPER COMPONENTS (Optimized for Visibility) ---

function ProjectCard({title, desc, link, tag}: any) {
    return (
        <Card
            className="group overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 transition-all duration-300 hover:shadow-xl hover:border-primary/50">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div className="space-y-2">
                        <CardTitle
                            className="text-xl font-bold group-hover:text-primary transition-colors">{title}</CardTitle>
                        <Badge variant="outline"
                               className="text-[10px] font-bold border-zinc-300 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400">{tag}</Badge>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed text-sm font-medium">{desc}</p>
                <Button asChild variant="ghost"
                        className="w-full justify-between group/btn border border-zinc-200 dark:border-zinc-800 hover:bg-primary/5 dark:hover:bg-primary/10 hover:text-primary">
                    <Link to={link}>
                        Explore Project <ChevronRightIcon
                        className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform"/>
                    </Link>
                </Button>
            </CardContent>
        </Card>
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