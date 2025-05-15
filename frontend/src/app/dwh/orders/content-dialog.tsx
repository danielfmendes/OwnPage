import React from "react";
import {DialogContent, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import AuthToken from "@/utils/authtoken";
import {ButtonLoading} from "@/components/helpers/ButtonLoading";
import {useNotification} from "@/components/helpers/NotificationProvider";
import InputField from "@/components/helpers/InputField";
import {OrderItemsWithBikeName, OrderWithCustomer, RoleManagementWithName} from "@/types/custom";
import ProjectIDSelect from "@/components/helpers/selects/ProjectIDSelect";
import {DatePicker} from "@/components/helpers/DatePicker";
import CustomerNameComboBox from "@/components/helpers/selects/CustomerNameComboBox";
import apiUrl, {fetchWithToken} from "@/utils/url";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {SimpleTable} from "@/components/helpers/SimpleTable";
import {Order, OrderItem} from "@/types/datatables";
import type {ColumnDef} from "@tanstack/react-table";
import {Check, Pencil, Trash2} from "lucide-react";
import ModelNameSelect from "@/components/helpers/selects/ModelNameSelect";
import {useRoleStore} from "@/utils/rolemananagemetstate";
import {Input} from "@/components/ui/input";

interface Props {
    rowData?: OrderWithCustomer;
    onClose: () => void;
    onRefresh: () => void;
}

export default function OrderDialogContent({rowData, onClose, onRefresh}: Props) {
    const {addNotification} = useNotification();
    const token = AuthToken.getAuthToken();
    const roles: RoleManagementWithName[] = useRoleStore((state) => state.roles);
    const isEditMode = !!rowData;
    const isDisabled = roles.find(role => role.project_id === rowData?.project_id)?.role === "user";


    const [projectId, setProjectId] = React.useState<string>(rowData?.project_id?.toString() || "");
    const [orderDate, setOrderDate] = React.useState<Date | undefined>(rowData?.order_date ? new Date(rowData.order_date) : undefined);
    const [customerId, setCustomerId] = React.useState<number>(rowData?.customer_id ?? 0);

    const [data, setData] = React.useState<OrderItemsWithBikeName[]>([]);
    const [modelId, setModelId] = React.useState<number | null>(null);
    const [number, setNumber] = React.useState<number | null>(null);
    const [price, setPrice] = React.useState<number | null>(null);

    const [editItemId, setEditItemId] = React.useState<number | null>(null);
    const [editNumber, setEditNumber] = React.useState<number | null>(null);
    const [editPrice, setEditPrice] = React.useState<number | null>(null);

    const [isLoadingOrder, setIsLoadingOrder] = React.useState(false);
    const [isLoadingData, setIsLoadingData] = React.useState(false);
    const [isLoadingOrderItems, setIsLoadingOrderItems] = React.useState(false);
    const [loadingEditID, setLoadingEditID] = React.useState<number | null>(null);
    const [loadingDeleteID, setLoadingDeleteID] = React.useState<number | null>(null);

    const handleStartEdit = (item: OrderItemsWithBikeName) => {
        setEditItemId(item.id);
        setEditNumber(item.number);
        setEditPrice(item.price);
    };

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

    React.useEffect(() => {
        if (rowData) {
            fetchOrderItems();
        }
    }, [rowData]);

    const fetchOrderItems = () => {
        setIsLoadingData(true);
        fetchWithToken(`/orderitems?order_id=${rowData?.id}`)
            .then((res) => res.json())
            .then((orders: OrderItemsWithBikeName[]) => {
                setData(orders);
            })
            .catch(err => addNotification(`Error isLoading orders: ${err}`, "error"))
            .finally(() => setIsLoadingData(false));
    };

    const handleOrderSave = () => {
        const newData = {
            customer_id: customerId,
            order_date: orderDate ? orderDate.toISOString() : '',
            project_id: parseInt(projectId),
        };

        setIsLoadingOrder(true);
        fetch(`${apiUrl}/orders`, {
            method: "POST",
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newData),
        })
            .then(res => {
                if (!res.ok) throw new Error("Save failed");
                addNotification("Order saved successfully", "success");
                resetFormOrder();
                onClose();
                onRefresh();
            })
            .catch(err => addNotification(`Save error: ${err}`, "error"))
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
        fetch(`${apiUrl}/orders`, {
            method: "PUT",
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedData),
        })
            .then(res => {
                if (!res.ok) throw new Error("Update failed");
                addNotification("Order updated successfully", "success");
                onClose();
                onRefresh();
            })
            .catch(err => addNotification(`Update error: ${err}`, "error"))
            .finally(() => setIsLoadingOrder(false));
    };

    const handleOrderItemSave = () => {
        const newData = {
            order_id: rowData?.id || 0,
            bike_id: modelId,
            number,
            price,
        };

        setIsLoadingOrderItems(true);
        fetch(`${apiUrl}/orderitems`, {
            method: "POST",
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newData),
        })
            .then(res => {
                if (!res.ok) throw new Error("Save failed");
                addNotification("Orderitem saved successfully", "success");
                resetFormOrderItems();
                fetchOrderItems();
            })
            .catch(err => addNotification(`Save error: ${err}`, "error"))
            .finally(() => setIsLoadingOrderItems(false));
    }

    const handleDeleteOrderItems = (id: number) => {
        setLoadingDeleteID(id);
        fetch(`${apiUrl}/orderitems?id=${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        })
            .then(res => {
                if (!res.ok) throw new Error("Fehler beim Löschen");
                addNotification(`Order mit id ${id} erfolgreich gelöscht`, "success");
                fetchOrderItems();
            })
            .catch(err => addNotification(`Löschfehler: ${err}`, "error"))
            .finally(() => setLoadingDeleteID(null));
    };

    const handleOrderItemUpdate = (updated: OrderItemsWithBikeName) => {
        const updatedData: OrderItem = {
            id: updated.id,
            order_id: updated.order_id,
            bike_id: updated.bike_id,
            number: editNumber || 0,
            price: editPrice || 0,
        };
        setLoadingEditID(updated.id);
        fetch(`${apiUrl}/orderitems`, {
            method: "PUT",
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedData),
        })
            .then(res => {
                if (!res.ok) throw new Error("Update failed");
                addNotification("User Role updated successfully", "success");
                setEditItemId(null);
                fetchOrderItems();
            })
            .catch(err => addNotification(`Update error: ${err}`, "error"))
            .finally(() => setLoadingEditID(null));
    };

    const columns: ColumnDef<OrderItemsWithBikeName>[] = [
        {
            accessorKey: "model_name",
            header: "Bike Name",
        },
        {
            accessorKey: "number",
            header: "Number",
            cell: ({row}) =>
                row.original.id === editItemId ? (
                    <Input
                        value={editNumber ?? ""}
                        onChange={(e) => setEditNumber(Number(e.target.value))}
                    />
                ) : (
                    row.original.number
                ),
        },
        {
            accessorKey: "price",
            header: "Price",
            cell: ({row}) =>
                row.original.id === editItemId ? (
                    <Input
                        value={editPrice ?? ""}
                        onChange={(e) => setEditPrice(Number(e.target.value))}
                    />
                ) : (
                    row.original.price
                ),
        },
        {
            id: "actions",
            header: "",
            cell: ({row}) => {
                const orderItem = row.original;
                const isEditing = orderItem.id === editItemId;
                const hasChanged =
                    orderItem.number !== editNumber ||
                    orderItem.price !== editPrice;

                return (
                    <div className="flex gap-2">
                        <ButtonLoading
                            onClick={isEditing ? () => handleOrderItemUpdate(orderItem) : () => handleStartEdit(orderItem)}
                            isLoading={loadingEditID === orderItem.id}
                            variant={isEditing && hasChanged ? "secondary" : "outline"}
                            className="text-black dark:text-white p-2 rounded"
                            disabled={isDisabled || (isEditing && !hasChanged)}
                        >
                            {isEditing ? (
                                <Check className="w-4 h-4"/>
                            ) : (
                                <Pencil className="w-4 h-4"/>
                            )}
                        </ButtonLoading>
                        <ButtonLoading
                            onClick={() => handleDeleteOrderItems(orderItem.id)}
                            isLoading={loadingDeleteID === orderItem.id}
                            className="text-black dark:text-white p-2 rounded"
                            variant="destructive"
                            disabled={isDisabled}
                        >
                            <Trash2 className="w-5 h-5"/>
                        </ButtonLoading>
                    </div>
                );
            },
        },
    ];

    return (
        <DialogContent className={`${isEditMode ? 'sm:max-w-[700px]' : ''}`}>
            <DialogHeader>
                <DialogTitle>{isEditMode ? 'Edit Order' : 'Add new Order'}</DialogTitle>
            </DialogHeader>
            {isEditMode ? (
                <>
                    <Tabs defaultValue="info" className="mt-4">
                        <TabsList>
                            <TabsTrigger value="info">Order Info</TabsTrigger>
                            <TabsTrigger value="orders">Order Items</TabsTrigger>
                        </TabsList>

                        <TabsContent value="info">
                            <div className="space-y-3">
                                <InputField label="Project" value={rowData?.project_id}/>
                                <div className="space-y-1">
                                    <label className="block text-sm font-medium">Order Date</label>
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
                                    loadingText={"Please wait"}
                                >
                                    Update
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
                                    placeholder="Enter NoS"
                                    value={number}
                                    onChange={(e) => setNumber(Number(e.target.value))}
                                />
                                <InputField
                                    placeholder="Enter price"
                                    value={price}
                                    onChange={(e) => setPrice(Number(e.target.value))}
                                />
                                <ButtonLoading
                                    isLoading={isLoadingOrderItems}
                                    onClick={handleOrderItemSave}
                                    className="w-1/6"
                                >
                                    Add Item
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
                        <label className="block text-sm font-medium">Order Date</label>
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
                        loadingText={"Please wait"}
                    >
                        Save
                    </ButtonLoading>
                </>
            )}
        </DialogContent>
    );
}
