import React from "react";
import {DialogContent, DialogHeader, DialogTitle} from "@/components/ui/dialog";

interface ManageProps {
    title: string;
}

export default function ManageDialogContent({title}: ManageProps) {
    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Rechte bearbeiten</DialogTitle>
            </DialogHeader>
            ToDo: Zeige aller Nutzer und deren Rollen an, die Rolle ist ein Select, wo man zwischen Admin und User wählen kann, und rechts daneben ist ein speichern btn
        </DialogContent>
    );
}
