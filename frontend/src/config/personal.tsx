import {BrainCircuitIcon, DatabaseIcon, LayersIcon, LayoutTemplateIcon} from "lucide-react";

export const social_links = {
    linkedin: "https://www.linkedin.com/in/daniel-freire-mendes/",
    github: "https://github.com/danielfmendes",
    email: "freiremendesdaniel2002@gmail.com"
};

export const education = [
    {
        title: "Business Analytics Master of Science",
        institution: "Católica Lisbon School of Business & Economics",
        description: [
            "Coursework includes Foundations of Statistics, Database Management, and Predictive Analytics",
            "Programme fully taught in English"
        ],
        period: "09/2025 - 02/2027",
        image: "/logo/Catolica.png",
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

export const experience = [
    {
        title: "Intern Software Development",
        company: "softAIs GmbH - Hamburg / remote",
        description: [
            "Developed and automated frontend test suites (CRUD operations, table validations) and integrated them into CI/CD pipelines",
            "Designed and implemented modern web applications for internal and client use with React, improving usability and visual consistency"
        ],
        period: "05/2025 - 08/2025",
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
        period: "01/2024 - 12/2024",
        image: "/logo/data_works.jpeg",
    },
];

export const skill_categories = [
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