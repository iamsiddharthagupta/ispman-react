import { FormEvent, useState } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import DataTable, { TableColumn } from 'react-data-table-component';
import AdminLayout from '../../layouts/dashboard-layout';
import { appRoute } from '../../lib/app-route';
import { formatDate } from '../../lib/date-format';
import { Customer, CustomerOrder, CustomerPlan } from '../../types/customer';

interface ShowProps {
    customer: Customer;
    plans: CustomerPlan[];
}

function today(): string {
    const date = new Date();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${date.getFullYear()}-${month}-${day}`;
}

function dateAfter(value: string, days: number): string {
    const date = new Date(`${value.slice(0, 10)}T00:00:00Z`);
    date.setUTCDate(date.getUTCDate() + days);

    return date.toISOString().slice(0, 10);
}

function getNextRenewalDate(orders: CustomerOrder[]): string {
    const latestEndDate = orders.reduce<string | null>(
        (latest, order) => (latest === null || order.end_date > latest ? order.end_date : latest),
        null,
    );

    return latestEndDate ? dateAfter(latestEndDate, 1) : today();
}

function formatMoney(value: number | string): string {
    return `₹${Number(value).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatRenewalMonth(value: string): string {
    const match = /^(\d{4})-(\d{2})/.exec(value);

    if (!match) {
        return value;
    }

    const month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][Number(match[2]) - 1];

    return month ? `${month}-${match[1].slice(-2)}` : value;
}

function getPaidAmount(order: CustomerOrder): number {
    return Math.max(0, Number(order.plan_price) - Number(order.due_amount));
}

export default function Show({ customer, plans }: ShowProps) {
    const { url } = usePage();
    const orders = customer.orders ?? [];
    const nextRenewalDate = getNextRenewalDate(orders);
    const [showRenewalModal, setShowRenewalModal] = useState(false);
    const [paymentOrder, setPaymentOrder] = useState<CustomerOrder | null>(null);
    const renewal = useForm({
        plan_id: customer.plan_id ? String(customer.plan_id) : '',
        remarks: '',
    });
    const payment = useForm({
        order_id: '',
        paid_amount: '',
        payment_date: today(),
        mode: 'Cash',
        remarks: '',
    });
    const selectedPlan = plans.find((plan) => String(plan.id) === renewal.data.plan_id);

    function openPaymentModal(order: CustomerOrder) {
        payment.setData({
            order_id: String(order.id),
            paid_amount: '',
            payment_date: today(),
            mode: 'Cash',
            remarks: '',
        });
        payment.clearErrors();
        setPaymentOrder(order);
    }

    function closePaymentModal() {
        setPaymentOrder(null);
        payment.reset();
        payment.clearErrors();
    }

    function submitRenewal(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        renewal.post(appRoute(url, `/customers/${customer.id}/renewals`), {
            onSuccess: () => {
                setShowRenewalModal(false);
                renewal.reset();
            },
        });
    }

    function submitPayment(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        payment.post(appRoute(url, `/customers/${customer.id}/payments`), {
            onSuccess: closePaymentModal,
        });
    }

    const renewalTableStyles = {
        table: { style: { width: '100%', minWidth: '0' } },
        headRow: {
            style: {
                backgroundColor: 'var(--bs-tertiary-bg)',
                borderBottom: '1px solid var(--bs-border-color)',
                minHeight: '40px',
            },
        },
        headCells: {
            style: {
                fontSize: '13px',
                fontWeight: '700',
                letterSpacing: '0.055em',
                color: 'var(--bs-secondary-color)',
                paddingLeft: '12px',
                paddingRight: '12px',
            },
        },
        rows: {
            style: {
                minHeight: '40px',
                borderBottom: '1px solid var(--bs-border-color)',
                fontSize: '12px',
            },
        },
        cells: {
            style: {
                // paddingLeft: '12px',
                // paddingRight: '12px',
                paddingTop: '5px',
                paddingBottom: '5px',
                fontSize: '15px',
            },
        },
        pagination: {
            style: {
                borderTop: '1px solid var(--bs-border-color)',
                minHeight: '44px',
                fontSize: '12px',
            },
        },
    };

    const renewalColumns: TableColumn<CustomerOrder>[] = [
        {
            id: 'plan',
            name: 'PLAN',
            selector: (order) => order.plan_name,
            sortable: true,
            minWidth: '105px',
            grow: 1.25,
            cell: (order) => <span className="fw-semibold text-truncate">{order.plan_name}</span>,
        },
        {
            id: 'period',
            name: 'PERIOD',
            selector: (order) => order.start_date,
            sortable: true,
            minWidth: '158px',
            grow: 1.8,
            cell: (order) => (
                <span className="text-nowrap">
                    {formatDate(order.start_date)} - {formatDate(order.end_date)}
                </span>
            ),
        },
        {
            id: 'month',
            name: 'MONTH',
            selector: (order) => formatRenewalMonth(order.start_date),
            sortable: true,
            minWidth: '76px',
            grow: 0.8,
        },
        {
            id: 'duration',
            name: 'TERM',
            selector: (order) => Number(order.plan_duration),
            sortable: true,
            minWidth: '68px',
            grow: 0.7,
            cell: (order) => `${order.plan_duration} mo`,
        },
        {
            id: 'amount',
            name: 'AMOUNT',
            selector: (order) => Number(order.plan_price),
            sortable: true,
            right: true,
            minWidth: '92px',
            grow: 0.9,
            cell: (order) => formatMoney(order.plan_price),
        },
        {
            id: 'paid',
            name: 'PAID',
            selector: (order) => getPaidAmount(order),
            sortable: true,
            right: true,
            minWidth: '92px',
            grow: 0.9,
            cell: (order) => formatMoney(getPaidAmount(order)),
        },
        {
            id: 'balance',
            name: 'DUE',
            selector: (order) => Number(order.due_amount),
            sortable: true,
            right: true,
            minWidth: '92px',
            grow: 0.9,
            cell: (order) => (
                <span className={Number(order.due_amount) <= 0 ? 'text-success fw-semibold' : 'fw-semibold'}>{formatMoney(order.due_amount)}</span>
            ),
        },
        {
            id: 'action',
            name: 'ACTION',
            button: true,
            right: true,
            ignoreRowClick: true,
            minWidth: '78px',
            // padding right
            style: { paddingRight: '12px' },
            grow: 0.75,
            cell: (order) =>
                Number(order.due_amount) <= 0 ? (
                    <span className="badge text-bg-success">Paid</span>
                ) : (
                    <button type="button" className="btn btn-sm btn-success text-nowrap" onClick={() => openPaymentModal(order)}>
                        <i className="fas fa-plus" />
                    </button>
                ),
        },
    ];

    return (
        <AdminLayout>
            <Head title={`${customer.name} profile`} />
            <div className="app-content-header">
                <div className="container-fluid">
                    <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
                        <div>
                            <h3 className="mb-1 fw-bold">Customer profile</h3>
                        </div>
                        <ol className="breadcrumb mb-0">
                            <li className="breadcrumb-item">
                                <Link href={appRoute(url, '/dashboard')}>Dashboard</Link>
                            </li>
                            <li className="breadcrumb-item">
                                <Link href={appRoute(url, '/customers')}>Customers</Link>
                            </li>
                            <li className="breadcrumb-item active" aria-current="page">
                                {customer.name}
                            </li>
                        </ol>
                    </div>
                </div>
            </div>
            <div className="app-content">
                <div className="container-fluid">
                    <div className="customer-profile-grid">
                        <aside className="customer-profile-sidebar">
                            <div className="card customer-profile-card h-100">
                                <div className="customer-profile-card-header">
                                    <div className="d-flex align-items-center gap-3">
                                        <div className="customer-profile-avatar"><i className="fas fa-user" /></div>
                                        <div className="min-w-0 flex-grow-1">
                                            <h5 className="fw-bold text-truncate mb-1">{customer.name}</h5>
                                            <div className="small text-white-50 text-truncate">@{customer.username}</div>
                                        </div>
                                    </div>
                                    <span className={`badge rounded-pill mt-3 ${customer.status === 1 ? 'text-bg-success' : 'text-bg-secondary'}`}>
                                        <i className={`fas ${customer.status === 1 ? 'fa-circle-check' : 'fa-circle-minus'} me-1`} />
                                        {customer.status === 1 ? 'Active account' : 'Inactive account'}
                                    </span>
                                </div>
                                <div className="card-body p-3">
                                    <div className="customer-profile-info-grid">
                                        <div className="customer-profile-info-item">
                                            <span className="customer-profile-info-icon"><i className="fas fa-phone" /></span>
                                            <div className="min-w-0"><div className="customer-profile-label">PHONE</div><div className="customer-profile-value text-break">{customer.phone || '—'}</div></div>
                                        </div>
                                        <div className="customer-profile-info-item customer-profile-info-wide">
                                            <span className="customer-profile-info-icon"><i className="fas fa-wifi" /></span>
                                            <div className="min-w-0"><div className="customer-profile-label">CURRENT PLAN</div><div className="customer-profile-value">{customer.plan?.name ?? 'No plan assigned'}</div></div>
                                        </div>
                                        <div className="customer-profile-info-item customer-profile-info-wide">
                                            <span className="customer-profile-info-icon"><i className="fas fa-location-dot" /></span>
                                            <div className="min-w-0"><div className="customer-profile-label">ADDRESS</div><div className="customer-profile-value text-break">{[customer.address_line_1, customer.address_line_2, customer.address_area].filter(Boolean).join(', ') || '—'}</div></div>
                                        </div>
                                        {customer.remarks && (
                                            <div className="customer-profile-remarks customer-profile-info-wide">
                                                <div className="customer-profile-label mb-1">REMARKS</div>
                                                <div className="small text-body-secondary">{customer.remarks}</div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </aside>

                        <section>
                            <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
                                <div>
                                    <h4 className="fw-bold mb-1">Plan renewals</h4>
                                    <div className="text-body-secondary small">Each renewal stays as one row; payments update its balance.</div>
                                </div>
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={() => {
                                        renewal.setData({ plan_id: customer.plan_id ? String(customer.plan_id) : '', remarks: '' });
                                        renewal.clearErrors();
                                        setShowRenewalModal(true);
                                    }}
                                >
                                    <i className="fas fa-rotate me-1" />
                                    Renew plan
                                </button>
                            </div>

                            <div className="card customer-renewals-card">
                                <DataTable
                                    className="customer-renewals-table"
                                    columns={renewalColumns}
                                    data={orders}
                                    keyField="id"
                                    defaultSortFieldId="period"
                                    defaultSortAsc={false}
                                    pagination
                                    paginationPerPage={10}
                                    paginationRowsPerPageOptions={[10, 15, 25]}
                                    paginationComponentOptions={{ rowsPerPageText: 'Renewals per page:' }}
                                    persistTableHead
                                    responsive
                                    highlightOnHover
                                    customStyles={renewalTableStyles}
                                    noDataComponent={
                                        <div className="text-center text-body-secondary py-5">
                                            No renewals yet. Renew the plan to create the first renewal entry.
                                        </div>
                                    }
                                />
                            </div>
                        </section>
                    </div>
                </div>
            </div>

            {showRenewalModal && (
                <>
                    <div className="modal-backdrop fade show" />
                    <div className="modal fade show d-block" role="dialog" aria-modal="true" aria-labelledby="renewal-modal-title">
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content">
                                <form onSubmit={submitRenewal}>
                                    <div className="modal-header">
                                        <h5 className="modal-title" id="renewal-modal-title">
                                            Renew customer plan
                                        </h5>
                                        <button type="button" className="btn-close" aria-label="Close" onClick={() => setShowRenewalModal(false)} />
                                    </div>
                                    <div className="modal-body">
                                        <div className="mb-2">
                                            <label htmlFor="renewal_plan_id" className="form-label">
                                                Internet plan
                                            </label>
                                            <select
                                                id="renewal_plan_id"
                                                className={`form-select${renewal.errors.plan_id ? ' is-invalid' : ''}`}
                                                value={renewal.data.plan_id}
                                                onChange={(event) => renewal.setData('plan_id', event.target.value)}
                                                required
                                            >
                                                <option value="">Select a plan</option>
                                                {plans.map((plan) => (
                                                    <option key={plan.id} value={plan.id}>
                                                        {plan.name} · {plan.speed} · {formatMoney(plan.price ?? 0)}
                                                    </option>
                                                ))}
                                            </select>
                                            {renewal.errors.plan_id && <div className="invalid-feedback">{renewal.errors.plan_id}</div>}
                                            {selectedPlan && (
                                                <div className="form-text">
                                                    {selectedPlan.duration} month{selectedPlan.duration === 1 ? '' : 's'} ·{' '}
                                                    {formatMoney(selectedPlan.price ?? 0)}
                                                </div>
                                            )}
                                            {plans.length === 0 && <div className="form-text">There are no active plans available to renew.</div>}
                                        </div>
                                        <div className="row">
                                            <div className="col-md-6">
                                                <label className="form-label" htmlFor="renewal_start_date">
                                                    Start Date
                                                </label>
                                                <input
                                                    id="renewal_start_date"
                                                    type="text"
                                                    className="form-control"
                                                    value={formatDate(nextRenewalDate)}
                                                    readOnly
                                                />
                                                <div className="form-text">Starts the day after the latest renewal ends.</div>
                                            </div>
                                            <div className="col-md-6">
                                                {/* show renewal end date */}
                                                <label className="form-label" htmlFor="renewal_end_date">
                                                    End Date
                                                </label>
                                                <input
                                                    id="renewal_end_date"
                                                    type="text"
                                                    className="form-control"
                                                    value={
                                                        selectedPlan?.duration != null
                                                            ? formatDate(dateAfter(nextRenewalDate, selectedPlan.duration * 30 - 1))
                                                            : '—'
                                                    }
                                                    readOnly
                                                />
                                                <div className="form-text">Ends after the plan duration.</div>
                                            </div>
                                        </div>
                                        <div>
                                            <label htmlFor="renewal_remarks" className="form-label">
                                                Remarks
                                            </label>
                                            <textarea
                                                id="renewal_remarks"
                                                className={`form-control${renewal.errors.remarks ? ' is-invalid' : ''}`}
                                                rows={1}
                                                value={renewal.data.remarks}
                                                onChange={(event) => renewal.setData('remarks', event.target.value)}
                                            />
                                            {renewal.errors.remarks && <div className="invalid-feedback">{renewal.errors.remarks}</div>}
                                        </div>
                                    </div>
                                    <div className="modal-footer">
                                        <button type="button" className="btn btn-secondary" onClick={() => setShowRenewalModal(false)}>
                                            Cancel
                                        </button>
                                        <button type="submit" className="btn btn-primary" disabled={renewal.processing || plans.length === 0}>
                                            {renewal.processing ? 'Renewing…' : 'Confirm renewal'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {paymentOrder && (
                <>
                    <div className="modal-backdrop fade show" />
                    <div className="modal fade show d-block" role="dialog" aria-modal="true" aria-labelledby="payment-modal-title">
                        <div className="modal-dialog modal-dialog-centered modal-lg">
                            <div className="modal-content">
                                <form onSubmit={submitPayment}>
                                    <div className="modal-header">
                                        <div>
                                            <h5 className="modal-title" id="payment-modal-title">
                                                Add payment
                                            </h5>
                                            <div className="small text-body-secondary">
                                                {formatDate(paymentOrder.start_date)} - {formatDate(paymentOrder.end_date)} · {paymentOrder.plan_name}{' '}
                                                · Balance {formatMoney(paymentOrder.due_amount)}
                                            </div>
                                        </div>
                                        <button type="button" className="btn-close" aria-label="Close" onClick={closePaymentModal} />
                                    </div>
                                    <div className="modal-body">
                                        <div className="row">
                                            <div className="col-md-6 mb-3">
                                                <label htmlFor="paid_amount" className="form-label">
                                                    Paid amount
                                                </label>
                                                <input
                                                    id="paid_amount"
                                                    type="number"
                                                    min="0"
                                                    max={paymentOrder.due_amount}
                                                    step="0.01"
                                                    className={`form-control${payment.errors.paid_amount ? ' is-invalid' : ''}`}
                                                    value={payment.data.paid_amount}
                                                    onChange={(event) => payment.setData('paid_amount', event.target.value)}
                                                    required
                                                />
                                                {payment.errors.paid_amount && <div className="invalid-feedback">{payment.errors.paid_amount}</div>}
                                            </div>
                                            <div className="col-md-6 mb-3">
                                                <label htmlFor="payment_date" className="form-label">
                                                    Payment date
                                                </label>
                                                <input
                                                    id="payment_date"
                                                    type="date"
                                                    lang="en-GB"
                                                    className={`form-control${payment.errors.payment_date ? ' is-invalid' : ''}`}
                                                    value={payment.data.payment_date}
                                                    onChange={(event) => payment.setData('payment_date', event.target.value)}
                                                    required
                                                />
                                                {payment.errors.payment_date && <div className="invalid-feedback">{payment.errors.payment_date}</div>}
                                            </div>
                                            <div className="col-md-6 mb-3">
                                                <label htmlFor="payment_mode" className="form-label">
                                                    Payment mode
                                                </label>
                                                <select
                                                    id="payment_mode"
                                                    className={`form-select${payment.errors.mode ? ' is-invalid' : ''}`}
                                                    value={payment.data.mode}
                                                    onChange={(event) => payment.setData('mode', event.target.value)}
                                                    required
                                                >
                                                    <option value="Cash">Cash</option>
                                                    <option value="Online">Online</option>
                                                    <option value="Cheque">Cheque</option>
                                                </select>
                                                {payment.errors.mode && <div className="invalid-feedback">{payment.errors.mode}</div>}
                                            </div>
                                            <div className="col-12 mb-3">
                                                <label htmlFor="payment_remarks" className="form-label">
                                                    Remarks
                                                </label>
                                                <textarea
                                                    id="payment_remarks"
                                                    className={`form-control${payment.errors.remarks ? ' is-invalid' : ''}`}
                                                    rows={2}
                                                    value={payment.data.remarks}
                                                    onChange={(event) => payment.setData('remarks', event.target.value)}
                                                />
                                                {payment.errors.remarks && <div className="invalid-feedback">{payment.errors.remarks}</div>}
                                            </div>
                                        </div>

                                        <h6 className="fw-semibold">Previous payments on this renewal</h6>
                                        {paymentOrder.payments.length > 0 ? (
                                            <div className="table-responsive">
                                                <table className="table table-sm align-middle mb-0">
                                                    <thead>
                                                        <tr>
                                                            <th>Date</th>
                                                            <th>Mode</th>
                                                            <th className="text-end">Paid</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {paymentOrder.payments.map((entry) => (
                                                            <tr key={entry.id}>
                                                                <td>{formatDate(entry.payment_date)}</td>
                                                                <td>{entry.mode}</td>
                                                                <td className="text-end">{formatMoney(entry.paid_amount)}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        ) : (
                                            <div className="small text-body-secondary">No payments have been added to this renewal.</div>
                                        )}
                                    </div>
                                    <div className="modal-footer">
                                        <button type="button" className="btn btn-secondary" onClick={closePaymentModal}>
                                            Cancel
                                        </button>
                                        <button type="submit" className="btn btn-success" disabled={payment.processing}>
                                            {payment.processing ? 'Saving…' : 'Save payment'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </AdminLayout>
    );
}
