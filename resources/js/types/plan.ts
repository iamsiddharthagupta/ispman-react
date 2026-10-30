export interface Plan {
    id: number;
    name: string;
    speed: string;
    price: string;
    duration: number;
    vendor_name: string;
    vendor_rate: string | null;
    remarks: string | null;
    status: number;
}

export interface PlanFormData extends Record<string, string> {
    name: string;
    speed: string;
    price: string;
    duration: string;
    vendor_name: string;
    vendor_rate: string;
    remarks: string;
    status: string;
}
