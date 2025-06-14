import React, {type ChangeEvent} from "react";
import {Input} from "@/components/ui/input";
import {Lock} from "lucide-react";

type InputFieldProps = {
    value: string | number | null;
    label?: string;
    onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
    errorMessage?: string;
    placeholder?: string;
    type?: string;
};

export default function InputField({label, value, onChange, errorMessage, placeholder, type}: InputFieldProps) {
    const isReadOnly = !onChange;
    const inputType =
        type ?? (typeof value === "number" ? "number" : "text");

    return (
        <div className="space-y-1">
            {label && <label className="block text-sm font-medium">{label}</label>}
            <div className="relative">
                <Input
                    value={value ?? ""}
                    onChange={onChange}
                    readOnly={isReadOnly}
                    placeholder={placeholder}
                    className={`${
                        errorMessage ? "border-red-500" : ""
                    } ${isReadOnly ? "pr-10" : ""}`}
                    type={inputType}
                />
                {isReadOnly && (
                    <Lock className="absolute right-2 top-2.5 h-4 w-4 text-muted-foreground"/>
                )}
            </div>
            {errorMessage && (
                <p className="text-red-500 text-sm mt-1">{errorMessage}</p>
            )}
        </div>
    );
}
