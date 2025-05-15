import React from "react";
import {Check} from "lucide-react";
import {fetchWithToken} from "@/utils/url";
import {useNotification} from "@/components/helpers/NotificationProvider";
import {Customer} from "@/types/datatables";
import {cn} from "@/lib/utils";
import {ComboBoxLoading} from "@/components/helpers/ComboBoxLoading";

interface Props {
    customerID: number | null;
    onChange: (value: number) => void;
}

function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? "" : date.toLocaleDateString("de-DE");
}

export default function CustomerNameComboBox({customerID, onChange}: Props) {
    const {addNotification} = useNotification();
    const [customerIdOptions, setCustomerIdOptions] = React.useState<Customer[]>([]);
    const [selectedCustomer, setSelectedCustomer] = React.useState<Customer | null>(null);
    const [isLoading, setIsLoading] = React.useState(false);

    React.useEffect(() => {
        setIsLoading(true);
        fetchWithToken(`/customers`)
            .then(res => res.json())
            .then((customers: Customer[]) => {
                setCustomerIdOptions(customers);
                const selected = customers.find(c => c.id === customerID) ?? null;
                setSelectedCustomer(selected);
            })
            .catch(err =>
                addNotification(`Failed to load customer options: ${err}`, "error")
            )
            .finally(() => setIsLoading(false));
    }, [customerID]);

    const handleSelect = (id: number) => {
        const selected = customerIdOptions.find(c => c.id === id) ?? null;
        setSelectedCustomer(selected);
        onChange(id);
    };

    return (
        <div className="space-y-1">
            <label className="block text-sm font-medium">Customer Name</label>
            <ComboBoxLoading
                selectedItem={selectedCustomer}
                items={customerIdOptions}
                onSelect={handleSelect}
                itemKey={(c) => c.id}
                itemLabel={(c) => c.email}
                isLoading={isLoading}
                placeholder="Select customer..."
            >
                {(customer, isSelected) => (
                    <div className="w-full flex justify-between items-center">
                        <div>
                            <p className="font-medium">{customer.email}</p>
                            <p className="text-xs text-muted-foreground">{customer.first_name} {customer.name} (geb. {formatDate(customer.dob)})</p>
                        </div>
                        <Check className={cn("ml-2", isSelected ? "opacity-100" : "opacity-0")}/>
                    </div>
                )}
            </ComboBoxLoading>
        </div>
    );
}
