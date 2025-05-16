import {
    DialogContent,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog"
import {Card, CardContent} from "@/components/ui/card"
import {Customer} from "@/types/datatables"
import React from "react"
import InputField from "@/components/helpers/InputField";
import {ButtonLoading} from "@/components/helpers/ButtonLoading";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger
} from "@/components/ui/tabs"
import type {ColumnDef} from "@tanstack/react-table";
import {OrderWithCustomer} from "@/types/custom";
import {Button} from "@/components/ui/button";
import {ArrowUpDown} from "lucide-react";
import {fetchWithBodyAndToken, fetchWithToken} from "@/utils/url";
import {useNotification} from "@/components/helpers/NotificationProvider";
import {SimpleTable} from "@/components/helpers/SimpleTable";
import {useTranslation} from "react-i18next";

interface Props {
    rowData: Customer,
    onClose: () => void,
    onRefresh: () => void,
}

export default function CustomerDetailContent({rowData, onClose, onRefresh}: Props) {
    const {t} = useTranslation();
    const {addNotification} = useNotification();
    const [lastName, setLastName] = React.useState(rowData.name)
    const [city, setCity] = React.useState(rowData.city)
    const [data, setData] = React.useState<OrderWithCustomer[]>([]);
    const [isLoadingData, setIsLoadingData] = React.useState(false);
    const [isLoadingUpdate, setIsLoadingUpdate] = React.useState(false);

    React.useEffect(() => {
        fetchData();
    }, [rowData]);

    const fetchData = () => {
        setIsLoadingData(true);
        fetchWithToken(`/orders?email=${rowData.email}`)
            .then((orders: OrderWithCustomer[]) => {
                setData(orders);
            })
            .catch(err => addNotification(`Failed to load orders${err?.message ? `: ${err.message}` : ""}`, "error"))
            .finally(() => setIsLoadingData(false));
    };

    const handleUpdate = () => {
        const updatedData: Customer = {
            id: rowData.id,
            project_id: rowData.project_id,
            first_name: rowData.first_name,
            name: lastName,
            email: rowData.email,
            password: rowData.password,
            dob: rowData.dob,
            city: city,
        };

        setIsLoadingUpdate(true);
        fetchWithBodyAndToken("PUT", "/customers", updatedData)
            .then(() => {
                addNotification("Customer updated successfully", "success");
                onClose();
                onRefresh();
            })
            .catch(err => addNotification(`Failed to update customer${err?.message ? `: ${err.message}` : ""}`, "error"))
            .finally(() => setIsLoadingUpdate(false));
    };

    const columns: ColumnDef<OrderWithCustomer>[] = [
        {
            accessorKey: "order_date",
            header: ({column}) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    {t("label.order_date")}<ArrowUpDown className="ml-2 h-4 w-4"/>
                </Button>
            ),
            cell: ({row}) => {
                const date = new Date(row.getValue("order_date"))
                return date.toLocaleDateString()
            },
        },
        {
            accessorKey: "bike_model_name",
            header: t("label.bike_name"),
        },
        {
            accessorKey: "number",
            header: t("label.number"),
        },
        {
            accessorKey: "price",
            header: t("label.price"),
        },
    ]

    return (
        <DialogContent className="sm:max-w-[800px]">
            <DialogHeader>
                <DialogTitle>{t("customer.details")}</DialogTitle>
            </DialogHeader>

            <Tabs defaultValue="info" className="mt-4">
                <TabsList>
                    <TabsTrigger value="info">{t("customer.info")}</TabsTrigger>
                    <TabsTrigger value="orders">{t("orders.history")}</TabsTrigger>
                </TabsList>

                <TabsContent value="info">
                    <Card className="mt-4">
                        <CardContent className="space-y-4 pt-6">
                            <InputField label={t("label.email")} value={rowData.email}/>
                            <InputField label={t("label.first_name")} value={rowData.first_name}/>
                            <InputField
                                label={t("label.last_name")}
                                placeholder={t("placeholder.name")}
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                            />
                            <InputField
                                label={t("label.city")}
                                placeholder={t("placeholder.city")}
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                            />
                            <InputField
                                label={t("label.dob")}
                                value={new Date(rowData.dob).toLocaleDateString()}
                            />
                        </CardContent>
                    </Card>

                    <div className="flex justify-end mt-6">
                        <ButtonLoading
                            isLoading={isLoadingUpdate}
                            onClick={handleUpdate}
                            loadingText={t("placeholder.please_wait")}
                        >
                            {t("button.update")}
                        </ButtonLoading>
                    </div>
                </TabsContent>

                <TabsContent value="orders">
                    <Card className="mt-4">
                        <CardContent className="pt-4">
                            <h3 className="text-lg font-semibold mb-4">{t("orders.history")}</h3>
                            <SimpleTable data={data} columns={columns} isLoading={isLoadingData}/>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </DialogContent>
    )
}
