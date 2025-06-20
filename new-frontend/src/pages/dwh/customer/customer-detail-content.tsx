import {
    DialogContent,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog"
import {Card, CardContent} from "@/components/ui/card"
import {useEffect, useState} from "react"
import InputField from "@/components/helpers/InputField";
import {ButtonLoading} from "@/components/helpers/buttons/ButtonLoading";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger
} from "@/components/ui/tabs"
import type {CustomColumnDef} from "@/models/datatable/column";
import {useNotification} from "@/components/helpers/NotificationProvider";
import {SimpleTable} from "@/components/helpers/SimpleTable";
import {useTranslation} from "react-i18next";
import {type Customer, CustomersService, type OrderItemsWithBikeAndDate, OrdersService} from "@/models/api";
import FilterManager from "@/utils/filtermanager";
import {isRoleUserForProject} from "@/utils/helpers";

interface Props {
    rowData: Customer,
    onClose: () => void,
    onRefresh: () => void,
}

export default function CustomerDetailContent({rowData, onClose, onRefresh}: Props) {
    const {t} = useTranslation();
    const {addNotification} = useNotification();
    const filterManager = new FilterManager();
    const isDisabled = isRoleUserForProject(rowData?.project_id!)

    const [lastName, setLastName] = useState(rowData.name)
    const [city, setCity] = useState(rowData.city)
    const [data, setData] = useState<OrderItemsWithBikeAndDate[]>([]);
    const [isLoadingData, setIsLoadingData] = useState(false);
    const [isLoadingUpdate, setIsLoadingUpdate] = useState(false);

    useEffect(() => {
        setLastName(rowData.name);
        setCity(rowData.city);
        fetchData();
    }, [rowData]);

    const fetchData = () => {
        setIsLoadingData(true);
        filterManager.addFilter("email", [rowData.email]);
        const filterString = filterManager.getFilterStringWithProjectIds();
        OrdersService.getOrders(filterString === "" ? undefined : filterString)
            .then((orders) => {
                const ordersWithBikeAndDate = orders as OrderItemsWithBikeAndDate[];
                setData(ordersWithBikeAndDate);
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
        CustomersService.updateCustomer(updatedData)
            .then(() => {
                addNotification("Customer updated successfully", "success");
                onClose();
                onRefresh();
            })
            .catch(err => addNotification(`Failed to update customer${err?.message ? `: ${err.message}` : ""}`, "error"))
            .finally(() => setIsLoadingUpdate(false));
    };

    const columns: CustomColumnDef<OrderItemsWithBikeAndDate>[] = [
        {
            accessorKey: "order_date",
            header: t("label.order_date"),
            widthPercent: 30,
            cell: ({row}) => {
                const date = new Date(row.getValue("order_date"))
                return date.toLocaleDateString()
            },
        },
        {
            accessorKey: "model_name",
            header: t("label.bike_name"),
            widthPercent: 40,
        },
        {
            accessorKey: "number",
            header: t("label.number"),
            widthPercent: 15,
        },
        {
            accessorKey: "price",
            header: t("label.price"),
            widthPercent: 15,
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
                            disabled={isDisabled}
                        >
                            {t("button.update")}
                        </ButtonLoading>
                    </div>
                </TabsContent>

                <TabsContent value="orders">
                    <Card className="mt-4">
                        <CardContent className="pt-4">
                            <h3 className="text-lg font-semibold mb-4">{t("orders.history")}</h3>
                            <SimpleTable data={data} columns={columns} isLoading={isLoadingData} maxHeight={300} singleData={true}/>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </DialogContent>
    )
}
