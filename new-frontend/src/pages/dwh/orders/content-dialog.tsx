import {useEffect, useState} from "react";
import {DialogContent, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {ButtonLoading} from "@/components/helpers/ButtonLoading";
import {useNotification} from "@/components/helpers/NotificationProvider";
import InputField from "@/components/helpers/InputField";
import {
    type Order,
    type OrderItem,
    type OrderItemsWithBikeName,
    OrdersService,
    type OrderWithCustomer,
} from "@/models/api";
import ProjectIDSelect from "@/components/helpers/selects/ProjectIDSelect";
import {DatePicker} from "@/components/helpers/datepicker/DatePicker";
import CustomerNameComboBox from "@/components/helpers/selects/CustomerNameComboBox";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {SimpleTable} from "@/components/helpers/SimpleTable";
import {type CustomColumnDef} from "@/models/datatable/column";
import {Pencil, Trash2} from "lucide-react";
import ModelNameSelect from "@/components/helpers/selects/ModelNameSelect";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {Button} from "@/components/ui/button";
import {useTranslation} from "react-i18next";
import FilterManager from "@/utils/filtermanager";
import {isRoleUserForProject} from "@/utils/helpers";

interface Props {
    rowData?: OrderWithCustomer;
    onClose: () => void;
    onRefresh: () => void;
}

export default function OrderDialogContent({rowData, onClose, onRefresh}: Props) {
    const {t} = useTranslation();
    const {addNotification} = useNotification();
    const filterManager = new FilterManager();
    const isEditMode = !!rowData;
    const isDisabled = isRoleUserForProject(rowData?.project_id!)

    const [projectId, setProjectId] = useState<string>("");
    const [orderDate, setOrderDate] = useState<Date | undefined>(undefined);
    const [customerId, setCustomerId] = useState<number>(0);

    const [data, setData] = useState<OrderItemsWithBikeName[]>([]);
    const [modelId, setModelId] = useState<number | null>(null);
    const [number, setNumber] = useState<number | null>(null);
    const [price, setPrice] = useState<number | null>(null);
    const [editItem, setEditItem] = useState<OrderItemsWithBikeName | null>(null);
    const [openPopoverId, setOpenPopoverId] = useState<number | null>(null);

    const [isLoadingOrder, setIsLoadingOrder] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(false);
    const [isLoadingOrderItems, setIsLoadingOrderItems] = useState(false);
    const [loadingEditID, setLoadingEditID] = useState<number | null>(null);
    const [loadingDeleteID, setLoadingDeleteID] = useState<number | null>(null);

    const loadRowData = () => {
        setProjectId(rowData?.project_id?.toString() ?? "");
        setOrderDate(rowData?.order_date ? new Date(rowData.order_date) : undefined);
        setCustomerId(rowData?.customer_id ?? 0);
    };

    const handleEdit = (orderItem: OrderItemsWithBikeName | null) => {
        setEditItem(orderItem);
        setOpenPopoverId(orderItem?.id || null);
    }

    const resetFormOrder = () => {
        setProjectId("");
        setCustomerId(0);
        setOrderDate(undefined);
    };

    const resetFormOrderItems = () => {
        setModelId(null);
        setNumber(null);
        setPrice(null);
    };

    useEffect(() => {
        loadRowData();
        if (rowData) {
            fetchOrderItems();
        }
    }, [rowData]);

    const fetchOrderItems = () => {
        setIsLoadingData(true);
        filterManager.addFilter("order_id", [rowData?.id]);
        const filterString = filterManager.getFilterStringWithProjectIds();
        OrdersService.getOrderItems(filterString === "" ? undefined : filterString)
            .then((orders: OrderItemsWithBikeName[]) => {
                setData(orders);
            })
            .catch(err => addNotification(`Failed to load orderitems${err?.message ? `: ${err.message}` : ""}`, "error"))
            .finally(() => setIsLoadingData(false));
    };

    const handleOrderSave = () => {
        const newData = {
            customer_id: customerId,
            order_date: orderDate ? orderDate.toISOString() : '',
            project_id: parseInt(projectId),
        };

        setIsLoadingOrder(true);
        OrdersService.createOrder(newData)
            .then(() => {
                addNotification("Order saved successfully", "success");
                resetFormOrder();
                onClose();
                onRefresh();
            })
            .catch(err => addNotification(`Failed to save order${err?.message ? `: ${err.message}` : ""}`, "error"))
            .finally(() => setIsLoadingOrder(false));
    };

    const handleOrderUpdate = () => {
        const updatedData: Order = {
            id: rowData?.id || 0,
            customer_id: customerId,
            order_date: orderDate ? orderDate.toISOString() : '',
            project_id: parseInt(projectId),
        };

        setIsLoadingOrder(true);
        OrdersService.updateOrder(updatedData)
            .then(() => {
                addNotification("Order updated successfully", "success");
                onClose();
                onRefresh();
            })
            .catch(err => addNotification(`Failed to update order${err?.message ? `: ${err.message}` : ""}`, "error"))
            .finally(() => setIsLoadingOrder(false));
    };

    const handleOrderItemSave = () => {
        const newData = {
            order_id: rowData?.id || 0,
            bike_id: modelId ?? 0,
            number: number ?? 0,
            price: price ?? 0,
        };

        setIsLoadingOrderItems(true);
        OrdersService.createOrderItem(newData)
            .then(() => {
                addNotification("Orderitem saved successfully", "success");
                resetFormOrderItems();
                fetchOrderItems();
            })
            .catch(err => addNotification(`Failed to save orderitem${err?.message ? `: ${err.message}` : ""}`, "error"))
            .finally(() => setIsLoadingOrderItems(false));
    }

    const handleOrderItemUpdate = (localEditNumber: number, localEditPrice: number) => {
        const updatedData: OrderItem = {
            id: editItem?.id || 0,
            order_id: editItem?.order_id || 0,
            bike_id: editItem?.bike_id || 0,
            number: localEditNumber,
            price: localEditPrice,
        };
        setLoadingEditID(updatedData.id!);

        OrdersService.updateOrderItem(updatedData)
            .then(() => {
                addNotification("OrderItem updated successfully", "success");
                fetchOrderItems();
                handleEdit(null);
            })
            .catch(err => addNotification(`Failed to update orderitem${err?.message ? `: ${err.message}` : ""}`, "error"))
            .finally(() => setLoadingEditID(null));
    };

    const handleDeleteOrderItems = (id: number) => {
        setLoadingDeleteID(id);
        OrdersService.deleteOrderItem(id)
            .then(() => {
                addNotification(`Order item mit id ${id} erfolgreich gelöscht`, "success");
                fetchOrderItems();
            })
            .catch(err => addNotification(`Failed to delete orderitem${err?.message ? `: ${err.message}` : ""}`, "error"))
            .finally(() => setLoadingDeleteID(null));
    };

    const columns: CustomColumnDef<OrderItemsWithBikeName>[] = [
        {
            accessorKey: "model_name",
            header: t("label.bike_name"),
            widthPercent: 30,
        },
        {
            accessorKey: "number",
            header: t("label.number"),
            widthPercent: 25,
        },
        {
            accessorKey: "price",
            header: t("label.price"),
            widthPercent: 25,
        },
        {
            id: "actions",
            widthPercent: 20,
            cell: ({row}) => {
                const orderItem = row.original;
                const [localEditNumber, setLocalEditNumber] = useState<number>(orderItem.number);
                const [localEditPrice, setLocalEditPrice] = useState<number>(orderItem.price);
                const hasChanges = localEditNumber !== orderItem.number || localEditPrice !== orderItem.price;

                return (
                    <div className="flex justify-end gap-2">
                        <ButtonLoading
                            onClick={() => handleDeleteOrderItems(orderItem.id!)}
                            isLoading={loadingDeleteID === orderItem.id}
                            className="text-black dark:text-white p-2 rounded"
                            variant="destructive"
                            disabled={isDisabled}
                        >
                            <Trash2 className="w-5 h-5"/>
                        </ButtonLoading>
                        <Popover
                            open={openPopoverId === orderItem.id}
                            onOpenChange={(open) => {
                                if (open) {
                                    handleEdit(orderItem)
                                } else {
                                    handleEdit(null);
                                }
                            }}
                        >
                            <PopoverTrigger asChild>
                                <Button
                                    className={`p-2 rounded ${
                                        editItem?.id === orderItem.id ? "text-white dark:text-black" : "text-black dark:text-white"
                                    }`}
                                    variant={editItem?.id === orderItem.id ? "default" : "secondary"}
                                    disabled={isDisabled}
                                >
                                    <Pencil className="w-4 h-4"/>
                                </Button>
                            </PopoverTrigger>
                            {openPopoverId === orderItem.id && (
                                <PopoverContent
                                    side="right"
                                    align="center"
                                    sideOffset={40}
                                    className="w-64 p-4 space-y-4"
                                >
                                    <h4 className="font-semibold text-lg">{t("orders.edit_item")}</h4>
                                    <div className="space-y-2">
                                        <InputField
                                            label={t("label.number")}
                                            placeholder={t("placeholder.enter.number")}
                                            value={localEditNumber ?? ""}
                                            onChange={(e) => setLocalEditNumber(Number(e.target.value))}
                                        />
                                        <InputField
                                            label={t("label.price")}
                                            placeholder={t("placeholder.enter.price")}
                                            value={localEditPrice ?? ""}
                                            onChange={(e) => setLocalEditPrice(Number(e.target.value))}
                                        />
                                        <ButtonLoading
                                            isLoading={loadingEditID === orderItem.id}
                                            onClick={() => handleOrderItemUpdate(localEditNumber, localEditPrice)}
                                            variant={hasChanges ? "default" : "secondary"}
                                            className="w-full"
                                            disabled={isDisabled}
                                        >
                                            {t("button.update")}
                                        </ButtonLoading>
                                    </div>
                                </PopoverContent>
                            )}
                        </Popover>
                    </div>
                );
            },
        },
    ];

    return (
        <DialogContent className={`${isEditMode ? 'sm:max-w-[700px]' : ''}`}>
            <DialogHeader>
                <DialogTitle>{isEditMode ? t("orders.edit") : t("orders.add")}</DialogTitle>
            </DialogHeader>
            {isEditMode ? (
                <>
                    <Tabs defaultValue="info" className="mt-4">
                        <TabsList>
                            <TabsTrigger value="info">{t("orders.info")}</TabsTrigger>
                            <TabsTrigger value="orders">{t("orders.items")}</TabsTrigger>
                        </TabsList>

                        <TabsContent value="info">
                            <div className="space-y-3">
                                <InputField label="Project" value={rowData?.project_id}/>
                                <div className="space-y-1">
                                    <label className="block text-sm font-medium">{t("label.order_date")}</label>
                                    <DatePicker date={orderDate} setDate={setOrderDate} position="right"/>
                                </div>
                                <CustomerNameComboBox
                                    customerID={customerId}
                                    onChange={(value) => setCustomerId(value)}
                                />
                            </div>
                            <div className="flex justify-end mt-6">
                                <ButtonLoading
                                    isLoading={isLoadingOrder}
                                    onClick={handleOrderUpdate}
                                    loadingText={t("placeholder.please_wait")}
                                    disabled={isDisabled}
                                >
                                    {t("button.update")}
                                </ButtonLoading>
                            </div>
                        </TabsContent>
                        <TabsContent value="orders">
                            <div className="mb-2 flex gap-2 items-center">
                                <div className="w-[80%]">
                                    <ModelNameSelect
                                        modelID={modelId}
                                        onChange={(value) => setModelId(value)}
                                    />
                                </div>
                                <InputField
                                    placeholder={t("placeholder.enter.number_short")}
                                    value={number}
                                    onChange={(e) => setNumber(Number(e.target.value))}
                                />
                                <InputField
                                    placeholder={t("placeholder.enter.price")}
                                    value={price}
                                    onChange={(e) => setPrice(Number(e.target.value))}
                                />
                                <ButtonLoading
                                    isLoading={isLoadingOrderItems}
                                    onClick={handleOrderItemSave}
                                    className="w-1/6"
                                    disabled={isDisabled}
                                >
                                    {t("button.add_item")}
                                </ButtonLoading>
                            </div>
                            <SimpleTable data={data} columns={columns} isLoading={isLoadingData}/>
                        </TabsContent>
                    </Tabs>
                </>
            ) : (
                <>
                    <ProjectIDSelect
                        projectID={projectId}
                        onChange={(value) => setProjectId(value)}
                    />

                    <div className="space-y-1">
                        <label className="block text-sm font-medium">{t("label.order_date")}</label>
                        <DatePicker date={orderDate} setDate={setOrderDate}/>
                    </div>

                    <CustomerNameComboBox
                        customerID={customerId}
                        onChange={(value) => setCustomerId(value)}
                    />

                    <ButtonLoading
                        isLoading={isLoadingOrder}
                        onClick={handleOrderSave}
                        className="w-full mt-4"
                        loadingText={t("placeholder.please_wait")}
                    >
                        {t("button.save")}
                    </ButtonLoading>
                </>
            )}
        </DialogContent>
    );
}
