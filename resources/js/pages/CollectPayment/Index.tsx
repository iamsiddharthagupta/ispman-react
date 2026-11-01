import { FormEvent, useMemo, useState } from 'react';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import DataTable, { TableColumn } from 'react-data-table-component';
import AdminLayout from '../../layouts/dashboard-layout';
import { appRoute } from '../../lib/app-route';
import { formatDate } from '../../lib/date-format';

type PaymentMode = 'Cash' | 'Online' | 'Cheque';

interface CollectionOrder {
    id: number;
    order_number: string;
    end_date: string;
    plan_name: string;
    due_amount: string;
    customer: {
        id: number;
        name: string;
        username: string;
        phone: string;
    };
}

interface PaymentEntry extends Record<string, string | number> {
    order_id: number;
    paid_amount: string;
}

interface CollectionFormData extends Record<string, string | PaymentEntry[]> {
    payments: PaymentEntry[];
    payment_date: string;
    mode: PaymentMode;
    remarks: string;
}

interface CollectPaymentProps {
    orders: {
        data: CollectionOrder[];
        current_page: number;
        from: number | null;
        to: number | null;
        total: number;
    };
    search: string;
}

function today(): string {
    const date = new Date();

    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function formatMoney(value: number | string): string {
    return `₹${Number(value).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function Index({ orders, search }: CollectPaymentProps) {
    const { url } = usePage();
    const [searchTerm, setSearchTerm] = useState(search);
    const [amounts, setAmounts] = useState<Record<number, string>>({});
    const [clearSelectedRows, setClearSelectedRows] = useState(false);
    const [notice, setNotice] = useState('');
    const paymentForm = useForm<CollectionFormData>({
        payments: [],
        payment_date: today(),
        mode: 'Cash',
        remarks: '',
    });

    function amountFor(order: CollectionOrder): string {
        return amounts[order.id] ?? order.due_amount;
    }

    function updateSelection(selectedOrders: CollectionOrder[]) {
        paymentForm.setData(
            'payments',
            selectedOrders.map((order) => ({
                order_id: order.id,
                paid_amount: amountFor(order),
            })),
        );
    }

    function updateAmount(order: CollectionOrder, value: string) {
        setAmounts((current) => ({ ...current, [order.id]: value }));
        paymentForm.setData(
            'payments',
            paymentForm.data.payments.map((entry) =>
                entry.order_id === order.id ? { ...entry, paid_amount: value } : entry,
            ),
        );
    }

    function visitPage(page: number) {
        paymentForm.setData('payments', []);
        setClearSelectedRows((current) => !current);
        router.get(
            appRoute(url, '/collect-payment'),
            { search: searchTerm || undefined, page },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    }

    function submitSearch(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        paymentForm.setData('payments', []);
        setClearSelectedRows((current) => !current);
        router.get(
            appRoute(url, '/collect-payment'),
            { search: searchTerm || undefined },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    }

    function submitPayments() {
        const paymentCount = paymentForm.data.payments.length;

        if (!paymentCount) {
            return;
        }

        setNotice('');
        paymentForm.post(appRoute(url, '/collect-payment'), {
            onSuccess: () => {
                setNotice(`Payment${paymentCount === 1 ? '' : 's'} recorded for ${paymentCount} renewal${paymentCount === 1 ? '' : 's'}.`);
                paymentForm.setData('payments', []);
                setAmounts({});
                setClearSelectedRows((current) => !current);
            },
        });
    }

    const columns = useMemo<TableColumn<CollectionOrder>[]>(
        () => [
            {
                id: 'customer',
                name: 'CUSTOMER',
                selector: (order) => order.customer.name,
                minWidth: '210px',
                cell: (order) => (
                    <div>
                        <Link
                            href={appRoute(url, `/customers/${order.customer.id}`)}
                            className="fw-semibold text-body text-decoration-none"
                        >
                            {order.customer.name}
                        </Link>
                        <div className="small text-body-secondary">{order.customer.username} · {order.customer.phone}</div>
                    </div>
                ),
            },
            {
                id: 'plan',
                name: 'RENEWAL',
                selector: (order) => order.plan_name,
                minWidth: '180px',
                cell: (order) => (
                    <div>
                        <span className="fw-semibold text-body">{order.plan_name}</span>
                        <div className="small text-body-secondary">{order.order_number}</div>
                    </div>
                ),
            },
            {
                id: 'due',
                name: 'BALANCE DUE',
                selector: (order) => Number(order.due_amount),
                sortable: true,
                right: true,
                cell: (order) => <span className="fw-semibold text-danger">{formatMoney(order.due_amount)}</span>,
            },
            {
                id: 'expiry',
                name: 'PLAN ENDS',
                selector: (order) => order.end_date,
                sortable: true,
                cell: (order) => <span className="text-body">{formatDate(order.end_date)}</span>,
            },
            {
                id: 'amount',
                name: 'COLLECT AMOUNT',
                minWidth: '175px',
                cell: (order) => (
                    <div className="input-group input-group-sm">
                        <span className="input-group-text">₹</span>
                        <input
                            type="number"
                            min="0.01"
                            step="0.01"
                            className="form-control"
                            aria-label={`Payment amount for ${order.customer.name}`}
                            value={amountFor(order)}
                            onChange={(event) => updateAmount(order, event.target.value)}
                        />
                    </div>
                ),
            },
        ],
        [amounts, paymentForm.data.payments, url],
    );

    const errorMessage = Object.values(paymentForm.errors)[0];

    return (
        <AdminLayout>
            <Head title="Collect Payments" />
            <div className="app-content-header">
                <div className="container-fluid">
                    <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
                        <div>
                            <h3 className="mb-0 fw-bold">Collect Payments</h3>
                            <ol className="breadcrumb small mt-2 mb-0">
                                <li className="breadcrumb-item">
                                    <Link href={appRoute(url, '/dashboard')}>Dashboard</Link>
                                </li>
                                <li className="breadcrumb-item active" aria-current="page">
                                    Collect Payments
                                </li>
                            </ol>
                        </div>
                        <button
                            type="button"
                            onClick={submitPayments}
                            className="btn btn-primary"
                            disabled={paymentForm.processing || paymentForm.data.payments.length === 0}
                        >
                            {paymentForm.processing ? (
                                <span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />
                            ) : (
                                <i className="fas fa-hand-holding-dollar me-2" />
                            )}
                            {paymentForm.processing
                                ? 'Recording…'
                                : `Collect payment${paymentForm.data.payments.length === 1 ? '' : 's'} (${paymentForm.data.payments.length})`}
                        </button>
                    </div>
                </div>
            </div>

            <div className="app-content">
                <div className="container-fluid">
                    {notice && <div className="alert alert-success" role="status">{notice}</div>}
                    {errorMessage && <div className="alert alert-danger" role="alert">{errorMessage}</div>}

                    <div>
                        <div className="card border-0 shadow-sm mb-3">
                            <div className="card-body">
                                <div className="row g-3 align-items-end">
                                    <div className="col-lg-5">
                                        <label htmlFor="payment-customer-search" className="form-label">Find a customer</label>
                                        <form onSubmit={submitSearch}>
                                            <div className="input-group">
                                                <input
                                                    id="payment-customer-search"
                                                    type="search"
                                                    className="form-control"
                                                    placeholder="Name, username, or phone"
                                                    value={searchTerm}
                                                    onChange={(event) => setSearchTerm(event.target.value)}
                                                />
                                                <button className="btn btn-outline-secondary" type="submit" aria-label="Search customers">
                                                    <i className="fas fa-search" />
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                    <div className="col-sm-6 col-lg-3">
                                        <label htmlFor="payment-date" className="form-label">Payment date</label>
                                        <input
                                            id="payment-date"
                                            type="date"
                                            className={`form-control${paymentForm.errors.payment_date ? ' is-invalid' : ''}`}
                                            value={paymentForm.data.payment_date}
                                            onChange={(event) => paymentForm.setData('payment_date', event.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="col-sm-6 col-lg-4">
                                        <label htmlFor="payment-mode" className="form-label">Payment mode</label>
                                        <select
                                            id="payment-mode"
                                            className={`form-select${paymentForm.errors.mode ? ' is-invalid' : ''}`}
                                            value={paymentForm.data.mode}
                                            onChange={(event) => paymentForm.setData('mode', event.target.value as PaymentMode)}
                                            required
                                        >
                                            <option value="Cash">Cash</option>
                                            <option value="Online">Online</option>
                                            <option value="Cheque">Cheque</option>
                                        </select>
                                    </div>
                                    <div className="col-12">
                                        <label htmlFor="payment-remarks" className="form-label">Remarks <span className="text-body-secondary">(optional)</span></label>
                                        <input
                                            id="payment-remarks"
                                            type="text"
                                            className={`form-control${paymentForm.errors.remarks ? ' is-invalid' : ''}`}
                                            value={paymentForm.data.remarks}
                                            onChange={(event) => paymentForm.setData('remarks', event.target.value)}
                                            maxLength={1000}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="card border-0 shadow-sm">
                            <div className="card-body p-0">
                                <DataTable
                                    key={orders.current_page}
                                    columns={columns}
                                    data={orders.data}
                                    keyField="id"
                                    selectableRows
                                    clearSelectedRows={clearSelectedRows}
                                    onSelectedRowsChange={({ selectedRows }) => updateSelection(selectedRows)}
                                    pagination
                                    paginationServer
                                    paginationTotalRows={orders.total}
                                    paginationDefaultPage={orders.current_page}
                                    paginationPerPage={15}
                                    paginationRowsPerPageOptions={[15]}
                                    onChangePage={visitPage}
                                    persistTableHead
                                    responsive
                                    highlightOnHover
                                    noDataComponent={
                                        <div className="text-center py-5">
                                            <i className="fas fa-circle-check fs-1 text-body-tertiary mb-3" />
                                            <h6 className="fw-semibold">No outstanding payments</h6>
                                            <p className="text-body-secondary mb-0">
                                                {search
                                                    ? 'No unpaid renewals match this customer search.'
                                                    : 'All customer renewals are paid up to date.'}
                                            </p>
                                        </div>
                                    }
                                />
                            </div>
                            <div className="card-footer bg-body py-3">
                                <small className="text-body-secondary">
                                    Showing <strong>{orders.from ?? 0}</strong> to <strong>{orders.to ?? 0}</strong> of{' '}
                                    <strong>{orders.total}</strong> unpaid renewals
                                </small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
