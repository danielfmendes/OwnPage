import React, { ChangeEvent } from "react";
import { Input } from "@/components/ui/input";
import { Lock } from "lucide-react";

type InputFieldProps = {
    label: string;
    value: string | number;
    onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
    type?: string;
    errorMessage?: string;
};

export default function InputField({ label, value, onChange, type, errorMessage }: InputFieldProps) {
    const isReadOnly = !onChange;

    return (
        <div className="space-y-1">
            <label className="block text-sm font-medium">{label}</label>
            <div className="relative">
                <Input
                    value={value}
                    onChange={onChange}
                    readOnly={isReadOnly}
                    className={`${
                        errorMessage ? "border-red-500" : ""
                    } ${isReadOnly ? "pr-10" : ""}`}
                    type={type}
                />
                {isReadOnly && (
                    <Lock className="absolute right-2 top-2.5 h-4 w-4 text-muted-foreground" />
                )}
            </div>
            {errorMessage && (
                <p className="text-red-500 text-sm mt-1">{errorMessage}</p>
            )}
        </div>
    );
}