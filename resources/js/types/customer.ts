export interface CustomerPlan {
    id: number;
    name: string;
    speed?: string;
    price?: string;
    vendor_name?: string;
    duration?: number;
    status?: number;
}

export interface CustomerPayment {
    id: number;
    due_amount: string;
    paid_amount: string;
    payment_date: string;
    mode: 'Cash' | 'Online' | 'Cheque';
    remarks: string | null;
    created_at: string;
}

export interface CustomerOrder {
    id: number;
    order_number: string;
    start_date: string;
    end_date: string;
    plan_name: string;
    plan_speed: string;
    plan_duration: string;
    plan_price: string;
    balance_adjustment: string;
    due_amount: string;
    remarks: string | null;
    created_at: string;
    payments: CustomerPayment[];
}

export interface Customer {
    id: number;
    username: string;
    name: string;
    phone: string;
    email: string | null;
    address_line_1: string;
    address_line_2: string | null;
    address_area: string;
    remarks: string | null;
    status: number;
    plan_id: number | null;
    plan?: CustomerPlan | null;
    orders?: CustomerOrder[];
}

export interface CustomerFormData extends Record<string, string> {
    username: string;
    name: string;
    phone: string;
    email: string;
    address_line_1: string;
    address_line_2: string;
    address_area: string;
    remarks: string;
    status: string;
    plan_id: string;
}
