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
import {OrderOverview} from "@/types/custom";
import {Button} from "@/components/ui/button";
import {ArrowUpDown, Trash2} from "lucide-react";
import apiUrl, {fetchWithToken} from "@/utils/url";
import {useNotification} from "@/components/helpers/NotificationProvider";
import AuthToken from "@/utils/authtoken";
import {SimpleTable} from "@/components/helpers/SimpleTable";

interface Props {
    rowData: Customer,
    onClose: () => void,
    onRefresh: () => void,
}

export default function CustomerDetailContent({rowData, onClose, onRefresh}: Props) {
    const {addNotification} = useNotification();
    const token = AuthToken.getAuthToken();

    const [lastName, setLastName] = React.useState(rowData.name)
    const [city, setCity] = React.useState(rowData.city)
    const [data, setData] = React.useState<OrderOverview[]>([]);
    const [isLoadingData, setIsLoadingData] = React.useState(false);
    const [isLoadingUpdate, setIsLoadingUpdate] = React.useState(false);

    React.useEffect(() => {
        fetchData();
    }, [rowData]);

    const fetchData = () => {
        setIsLoadingData(true);
        fetchWithToken(`/orders?email=${rowData.email}`)
            .then((res) => res.json())
            .then((orders: OrderOverview[]) => {
                setData(orders);
            })
            .catch(err => addNotification(`Error isLoading orders: ${err}`, "error"))
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
        fetch(`${apiUrl}/customers`, {
            method: "PUT",
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedData),
        })
            .then(res => {
                if (!res.ok) throw new Error("Update failed");
                addNotification("Customer updated successfully", "success");
                onClose();
                onRefresh();
            })
            .catch(err => addNotification(`Update error: ${err}`, "error"))
            .finally(() => setIsLoadingUpdate(false));
    };

    const columns: ColumnDef<OrderOverview>[] = [
        {
            accessorKey: "customer_name",
            header: "Customer",
        },
        {
            accessorKey: "order_date",
            header: ({column}) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    OrderDate<ArrowUpDown className="ml-2 h-4 w-4"/>
                </Button>
            ),
            cell: ({row}) => {
                const date = new Date(row.getValue("order_date"))
                return date.toLocaleDateString()
            },
        },
        {
            accessorKey: "bike_model_name",
            header: "Bike Name",
        },
        {
            accessorKey: "number",
            header: "Number",
        },
        {
            accessorKey: "price",
            header: "Price",
        },
    ]

    return (
        <DialogContent className="sm:max-w-[800px]">
            <DialogHeader>
                <DialogTitle>Customer Details</DialogTitle>
            </DialogHeader>

            <Tabs defaultValue="info" className="mt-4">
                <TabsList>
                    <TabsTrigger value="info">Customer Info</TabsTrigger>
                    <TabsTrigger value="orders">Order History</TabsTrigger>
                </TabsList>

                <TabsContent value="info">
                    <Card className="mt-4">
                        <CardContent className="space-y-4 pt-6">
                            <InputField label="E-Mail" value={rowData.email}/>
                            <InputField label="Vorname" value={rowData.first_name}/>
                            <InputField
                                label="Nachname"
                                placeholder="e.g. Griffin"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                            />
                            <InputField
                                label="City"
                                placeholder="e.g. Hamburg"
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                            />
                            <InputField
                                label="Date of Birth"
                                value={new Date(rowData.dob).toLocaleDateString()}
                            />
                        </CardContent>
                    </Card>

                    <div className="flex justify-end mt-6">
                        <ButtonLoading
                            isLoading={isLoadingUpdate}
                            onClick={handleUpdate}
                            loadingText="Please wait"
                        >
                            Update
                        </ButtonLoading>
                    </div>
                </TabsContent>

                <TabsContent value="orders">
                    <Card className="mt-4">
                        <CardContent className="pt-4">
                            <h3 className="text-lg font-semibold mb-4">Order History</h3>
                            <SimpleTable data={data} columns={columns} isLoading={isLoadingData}/>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </DialogContent>
    )
}
