import {Trash2} from "lucide-react";
import {ButtonLoading} from "@/components/helpers/buttons/ButtonLoading";

interface DeleteButtonProps {
    onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
    isLoading?: boolean;
    disabled?: boolean;
    className?: string;
}

export const DeleteButton = ({
                                 onClick,
                                 isLoading = false,
                                 disabled = false,
                                 className = "",
                             }: DeleteButtonProps) => {
    return (
        <ButtonLoading
            onClick={onClick}
            isLoading={isLoading}
            disabled={disabled}
            className={`text-black dark:text-white p-2 rounded-full sm:rounded ${className}`}
            size="icon"
            variant="destructive"
        >
            <Trash2 className="w-5 h-5"/>
        </ButtonLoading>
    );
};
