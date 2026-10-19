import {
    MessageCircle, Mail,
    LifeBuoy, Users, MessageSquare
} from "lucide-react";
import {Twitter, Github} from "lucide-legacy";

export function SourceIcon({source, size = 12}: { source: string, size?: number }) {
    if (!source) return <MessageSquare size={size} className="text-zinc-400"/>;

    const s = source.toLowerCase();

    if (s.includes('twitter') || s.includes('x/')) return <Twitter size={size} className="text-sky-500"/>;
    if (s.includes('discord')) return <MessageCircle size={size} className="text-indigo-500"/>;
    if (s.includes('github') || s.includes('issue') || s.includes('git')) return <Github size={size}
                                                                                         className="text-zinc-900 dark:text-zinc-100"/>;
    if (s.includes('email')) return <Mail size={size} className="text-emerald-500"/>;
    if (s.includes('support')) return <LifeBuoy size={size} className="text-rose-500"/>;
    if (s.includes('forum') || s.includes('community')) return <Users size={size} className="text-amber-500"/>;

    return <MessageSquare size={size} className="text-zinc-400"/>;
}