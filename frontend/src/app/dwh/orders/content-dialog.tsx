import React from "react";
import {DialogContent, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {Order} from "@/types/datatables";
import AuthToken from "@/utils/authtoken";
import {ButtonLoading} from "@/components/helpers/ButtonLoading";
import {useNotification} from "@/components/helpers/NotificationProvider";

interface Props {
    rowData?: Order;
    onClose: () => void;
    onRefresh: () => void;
}

export default function OrderDialogContent({rowData, onClose, onRefresh}: Props) {
    const {addNotification} = useNotification();
    const token = AuthToken.getAuthToken();
    const isEditMode = !!rowData;
    const [isLoading, setIsLoading] = React.useState(false);

    React.useEffect(() => {
        //toDo
    }, []);

    const resetForm = () => {
        //toDo
    };

    const handleSave = () => {
        //toDo
    };

    const handleUpdate = () => {
        //toDo
    };

    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>{isEditMode ? 'Order bearbeiten' : 'Neues Teil hinzufügen'}</DialogTitle>
            </DialogHeader>
            {isEditMode ? (
                <h2>Bearbeiten</h2>
            ) : (
                <h2>Hinzufügen</h2>
            )}

            <ButtonLoading
                isLoading={isLoading}
                onClick={isEditMode ? handleUpdate : handleSave}
                className="w-full mt-4"
                loadingText={"Please wait"}
            >
                {isEditMode ? 'Update' : 'Save'}
            </ButtonLoading>

        </DialogContent>
    );
}
