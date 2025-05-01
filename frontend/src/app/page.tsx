import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {RocketIcon, CircleUserIcon, ChevronRightIcon} from "lucide-react"
import Link from "next/link";

export default function Home() {
  return (
      <div className="min-h-screen p-4 md:p-8 flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-900">
        <Card
            className="w-full max-w-md md:max-w-2xl backdrop-blur-sm border-border/50 shadow-lg transition-all hover:shadow-xl">
          <CardHeader className="space-y-1">
            <div className="flex items-center gap-3">
              <CircleUserIcon className="h-6 w-6 text-primary"/>
              <CardTitle className="text-2xl font-bold tracking-tight">
                Willkommen bei Daniels Portfolio
              </CardTitle>
            </div>
            <CardDescription className="text-muted-foreground">
              Ein Überblick über meine Projekte und Fähigkeiten
            </CardDescription>
          </CardHeader>
          <CardContent className="text-muted-foreground">
            <p className="leading-relaxed">
              Herzlich willkommen auf meiner persönlichen Seite. Hier finden Sie
              eine Auswahl der Projekte, an denen ich gearbeitet habe, sowie
              Einblicke in meine technischen Fähigkeiten und Erfahrungen.
            </p>
          </CardContent>
        </Card>
        <Card
            className="w-full max-w-md md:max-w-2xl mt-6 backdrop-blur-sm border-border/50 shadow-lg transition-all hover:shadow-xl">
          <CardHeader>
            <div className="flex items-center gap-3">
              <RocketIcon className="h-6 w-6 text-primary"/>
              <CardTitle className="text-2xl font-bold tracking-tight">
                Meine Projekte
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4">
            <Link href="/dwh/dashboard">
              <Button
                  size="lg"
                  className="w-full group transition-all"
                  variant="outline"
              >
                    <span className="group-hover:translate-x-1 transition-transform">
                        Data Warehouse Projekt ansehen
                    </span>
                <span className="group-hover:translate-x-1 transition-transform">
                    <ChevronRightIcon/>
                    </span>

              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
  );
}