import React from "react";
import {Check} from "lucide-react";
import {useNotification} from "@/components/helpers/NotificationProvider";
import {type Customer, type CustomerListResponse, CustomersService} from "@/models/api";
import {useTranslation} from "react-i18next";
import FilterManager from "@/utils/filtermanager";
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
    const {t} = useTranslation();
    const {addNotification} = useNotification();
    const filterManager = new FilterManager();
    const [customerIdOptions, setCustomerIdOptions] = React.useState<Customer[]>([]);
    const [selectedCustomer, setSelectedCustomer] = React.useState<Customer | null>(null);
    const [isLoading, setIsLoading] = React.useState(false);

    React.useEffect(() => {
        setIsLoading(true);

        (async () => {
            const filterString = await filterManager.getFilterStringWithProjectIds();
            CustomersService.getCustomers(filterString === "" ? undefined : filterString)
                .then((customers) => {
                    const customerList = customers as CustomerListResponse;
                    setCustomerIdOptions(customerList.items ?? []);
                    const selected = customerList.items?.find(c => c.id === customerID) ?? null;
                    setSelectedCustomer(selected);
                })
                .catch(err => addNotification(`Failed to load customer options${err?.message ? `: ${err.message}` : ""}`, "error"))
                .finally(() => setIsLoading(false))
        })();
    }, [customerID]);

    const handleSelect = (id: number) => {
        const selected = customerIdOptions.find(c => c.id === id) ?? null;
        setSelectedCustomer(selected);
        onChange(id);
    };

    return (
        <div className="space-y-1">
            <label className="block text-sm font-medium">{t("label.customer_name")}</label>
            <ComboBoxLoading
                selectedItem={selectedCustomer}
                items={customerIdOptions}
                onSelect={handleSelect}
                itemKey={(c) => c.id!}
                itemLabel={(c) => c.email}
                isLoading={isLoading}
                placeholder={t("placeholder.customer")}
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
