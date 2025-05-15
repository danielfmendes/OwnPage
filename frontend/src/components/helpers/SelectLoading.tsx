import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Loader2 } from "lucide-react"

type PartSelectProps = {
    id: number | null
    setId: (id: number) => void
    partIdOptions: { id: number; name: string }[]
    isLoadingParts: boolean
    placeholder?: string
}

export function SelectLoading({id, setId, partIdOptions, isLoadingParts, placeholder}: PartSelectProps) {
    return (
        <Select value={id !== null ? String(id) : undefined} onValueChange={(val) => setId(Number(val))}>
            <SelectTrigger className="w-full p-2 border rounded">
                <SelectValue placeholder={placeholder || "Select a part"} />
            </SelectTrigger>

            <SelectContent>
                {isLoadingParts ? (
                    <SelectItem value="loading" disabled className="opacity-50 italic pointer-events-none">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin inline-block" />
                        Please wait...
                    </SelectItem>
                ) : partIdOptions.length === 0 ? (
                    <SelectItem value="none" disabled className="opacity-50 italic pointer-events-none">
                        No parts found
                    </SelectItem>
                ) : (
                    partIdOptions.map((option) => (
                        <SelectItem key={option.id} value={String(option.id)}>
                            {option.name}
                        </SelectItem>
                    ))
                )}
            </SelectContent>
        </Select>
    )
}
