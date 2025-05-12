import {Customer} from "@/types/datatables";
import {DialogContent, DialogHeader, DialogTitle} from "@/components/ui/dialog";

interface Props {
    rowData: Customer;
    onClose: () => void;
}

export default function CustomerDetailContent({rowData, onClose}: Props) {
    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle> Customer Details</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-2">
                <label htmlFor="customer-name" className="text-sm font-medium">Customer Name</label>
                <input
                    type="text"
                    id="customer-name"
                    value={rowData?.name || ''}
                    readOnly
                    className="border border-gray-300 rounded-md p-2"
                />
            </div>
        </DialogContent>
    );
}