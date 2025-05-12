import {DialogContent, DialogHeader, DialogTitle} from "@/components/ui/dialog";

interface Props {
    onClose: () => void;
    onRefresh: () => void;
}

export default function AddCustomerContent({onClose, onRefresh}: Props) {
    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Add Customer</DialogTitle>
            </DialogHeader>
            Todo: Add customer form
        </DialogContent>
    );
}