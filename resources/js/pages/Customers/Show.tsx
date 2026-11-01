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

function dateAfterMonths(value: string, months: number): string {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

    if (!match) {
        return value;
    }

    const year = Number(match[1]);
    const monthIndex = Number(match[2]) - 1 + months;
    const targetYear = year + Math.floor(monthIndex / 12);
    const targetMonthIndex = ((monthIndex % 12) + 12) % 12;
    const day = Math.min(
        Number(match[3]),
        new Date(Date.UTC(targetYear, targetMonthIndex + 1, 0)).getUTCDate(),
    );

    return `${targetYear}-${String(targetMonthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function getNextRenewalDate(orders: CustomerOrder[]): string {
    const latestOrder = getLatestOrder(orders);

    return latestOrder ? dateAfter(latestOrder.end_date, 1) : today();
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

function getLatestOrder(orders: CustomerOrder[]): CustomerOrder | null {
    return orders.reduce<CustomerOrder | null>(
        (latest, order) =>
            latest === null ||
            order.end_date > latest.end_date ||
            (order.end_date === latest.end_date && order.id > latest.id)
                ? order
                : latest,
        null,
    );
}

function getCarryForwardBalance(orders: CustomerOrder[]): number {
    return orders.reduce((total, order) => total + Number(order.due_amount), 0);
}

function getPaidAmount(order: CustomerOrder): number {
    return order.payments.reduce((total, payment) => total + Number(payment.paid_amount), 0);
}

function escapeHtml(value: string): string {
    return value.replace(/[&<>"']/g, (character) => {
        const entities: Record<string, string> = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;',
        };

        return entities[character];
    });
}

function openBill(customer: Customer, order: CustomerOrder): void {
    const billWindow = window.open('', '_blank');

    if (!billWindow) {
        window.alert('Please allow pop-ups to generate the bill.');

        return;
    }

    billWindow.opener = null;

    const customerAddress = [
        customer.address_line_1,
        customer.address_line_2,
        customer.address_area,
    ]
        .filter(Boolean)
        .join(', ');
    const adjustment = Number(order.balance_adjustment);
    const netAmount = Number(order.plan_price) + adjustment;
    const payments = [...order.payments].sort(
        (first, second) =>
            first.payment_date.localeCompare(second.payment_date) || first.id - second.id,
    );
    const paymentRows = payments.length
        ? payments
              .map(
                  (payment) => `
                    <tr>
                        <td>${escapeHtml(formatDate(payment.payment_date))}</td>
                        <td>${escapeHtml(payment.mode)}</td>
                        <td class="amount">${escapeHtml(formatMoney(payment.paid_amount))}</td>
                    </tr>`,
              )
              .join('')
        : '<tr><td colspan="3" class="empty">No payments recorded for this bill.</td></tr>';

    billWindow.document.open();
    billWindow.document.write(`<!doctype html>
        <html lang="en">
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <title>Internet bill ${escapeHtml(order.order_number)}</title>
                <style>
                    @page { size: A4; margin: 18mm; }
                    * { box-sizing: border-box; }
                    body { color: #172033; font: 14px/1.5 Arial, sans-serif; margin: 0; }
                    .bill { margin: 0 auto; max-width: 800px; }
                    .header { align-items: flex-start; border-bottom: 3px solid #1769aa; display: flex; justify-content: space-between; padding-bottom: 18px; }
                    .brand { color: #1769aa; font-size: 24px; font-weight: 700; }
                    .subtitle { color: #687386; font-size: 12px; margin-top: 3px; }
                    .bill-title { font-size: 20px; font-weight: 700; margin: 0; text-align: right; }
                    .meta { color: #475569; font-size: 12px; margin-top: 7px; text-align: right; }
                    .section { margin-top: 24px; }
                    .section-title { color: #1769aa; font-size: 12px; font-weight: 700; letter-spacing: .06em; margin: 0 0 9px; text-transform: uppercase; }
                    .customer { background: #f3f7fb; border-radius: 6px; padding: 14px 16px; }
                    .customer-name { font-size: 16px; font-weight: 700; }
                    .muted { color: #64748b; }
                    .connection { border-collapse: collapse; width: 100%; }
                    .connection td { border-bottom: 1px solid #e2e8f0; padding: 9px 4px; vertical-align: top; }
                    .connection td:first-child { color: #64748b; width: 35%; }
                    table.items { border-collapse: collapse; margin-top: 8px; width: 100%; }
                    .items th { background: #f3f7fb; color: #475569; font-size: 11px; letter-spacing: .04em; padding: 10px 8px; text-align: left; text-transform: uppercase; }
                    .items td { border-bottom: 1px solid #e2e8f0; padding: 10px 8px; }
                    .items .amount { text-align: right; white-space: nowrap; }
                    .summary { margin: 12px 0 0 auto; max-width: 340px; width: 100%; }
                    .summary-row { display: flex; justify-content: space-between; padding: 5px 0; }
                    .summary-total { border-top: 2px solid #1769aa; font-size: 16px; font-weight: 700; margin-top: 5px; padding-top: 10px; }
                    .status { background: #e8f5ed; border-radius: 4px; color: #176b3a; display: inline-block; font-size: 12px; font-weight: 700; margin-top: 8px; padding: 4px 9px; }
                    .footer { border-top: 1px solid #e2e8f0; color: #64748b; font-size: 11px; margin-top: 34px; padding-top: 12px; text-align: center; }
                    .empty { color: #64748b; text-align: center; }
                    @media print { body { print-color-adjust: exact; -webkit-print-color-adjust: exact; } }
                </style>
            </head>
            <body>
                <main class="bill">
                    <header class="header">
                        <div>
                            <div class="brand">INTERNET SERVICE</div>
                            <div class="subtitle">Connection bill and payment statement</div>
                        </div>
                        <div>
                            <h1 class="bill-title">INTERNET BILL</h1>
                            <div class="meta">Bill no: ${escapeHtml(order.order_number)}<br>Bill date: ${escapeHtml(formatDate(today()))}</div>
                            <div class="status">PAID</div>
                        </div>
                    </header>
                    <section class="section">
                        <h2 class="section-title">Customer</h2>
                        <div class="customer">
                            <div class="customer-name">${escapeHtml(customer.name)}</div>
                            <div class="muted">Customer ID: ${escapeHtml(customer.username)}</div>
                            ${customerAddress ? `<div>${escapeHtml(customerAddress)}</div>` : ''}
                            ${customer.phone ? `<div>Phone: ${escapeHtml(customer.phone)}</div>` : ''}
                        </div>
                    </section>
                    <section class="section">
                        <h2 class="section-title">Internet connection</h2>
                        <table class="connection">
                            <tr><td>Plan</td><td><strong>${escapeHtml(order.plan_name)}</strong></td></tr>
                            <tr><td>Speed</td><td>${escapeHtml(order.plan_speed)}</td></tr>
                            <tr><td>Service period</td><td>${escapeHtml(formatDate(order.start_date))} to ${escapeHtml(formatDate(order.end_date))}</td></tr>
                            <tr><td>Plan term</td><td>${escapeHtml(order.plan_duration)} month(s)</td></tr>
                        </table>
                    </section>
                    <section class="section">
                        <h2 class="section-title">Bill summary</h2>
                        <table class="items">
                            <thead><tr><th>Description</th><th class="amount">Amount</th></tr></thead>
                            <tbody>
                                <tr><td>Internet plan - ${escapeHtml(order.plan_name)}</td><td class="amount">${escapeHtml(formatMoney(order.plan_price))}</td></tr>
                                ${adjustment !== 0 ? `<tr><td>${adjustment > 0 ? 'Previous balance' : 'Previous credit'}</td><td class="amount">${escapeHtml(formatMoney(Math.abs(adjustment)))}</td></tr>` : ''}
                            </tbody>
                        </table>
                        <div class="summary">
                            <div class="summary-row"><span>Bill total</span><strong>${escapeHtml(formatBalance(netAmount))}</strong></div>
                            <div class="summary-row"><span>Payments received</span><strong>${escapeHtml(formatMoney(getPaidAmount(order)))}</strong></div>
                            <div class="summary-row summary-total"><span>Balance</span><span>${escapeHtml(formatBalance(Number(order.due_amount)))}</span></div>
                        </div>
                    </section>
                    <section class="section">
                        <h2 class="section-title">Payment details</h2>
                        <table class="items">
                            <thead><tr><th>Date</th><th>Mode</th><th class="amount">Amount received</th></tr></thead>
                            <tbody>${paymentRows}</tbody>
                        </table>
                    </section>
                    <footer class="footer">This bill is for the internet connection and service period shown above. Generated on ${escapeHtml(formatDate(today()))}.</footer>
                </main>
            </body>
        </html>`);
    billWindow.document.close();
    billWindow.focus();
    billWindow.setTimeout(() => billWindow.print(), 250);
}

function formatBalance(value: number): string {
    return value < 0 ? `Credit ${formatMoney(Math.abs(value))}` : formatMoney(value);
}

export default function Show({ customer, plans }: ShowProps) {
    const { url } = usePage();
    const orders = customer.orders ?? [];
    const latestOrder = getLatestOrder(orders);
    const carryForwardBalance = getCarryForwardBalance(orders);
    const nextRenewalDate = getNextRenewalDate(orders);
    const [showRenewalModal, setShowRenewalModal] = useState(false);
    const [paymentOrder, setPaymentOrder] = useState<CustomerOrder | null>(null);
    const renewal = useForm({
        plan_id: customer.plan_id ? String(customer.plan_id) : '',
        start_date: nextRenewalDate,
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
            minWidth: '100px',
            grow: 1.25,
            cell: (order) => <span className="fw-semibold text-truncate">{order.plan_name}</span>,
        },
        {
            id: 'period',
            name: 'PERIOD',
            selector: (order) => order.start_date,
            sortable: true,
            minWidth: '80px',
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
            minWidth: '50px',
            grow: 0.8,
        },
        {
            id: 'duration',
            name: 'TERM',
            selector: (order) => Number(order.plan_duration),
            sortable: true,
            minWidth: '50px',
            grow: 0.7,
            cell: (order) => `${order.plan_duration} mo`,
        },
        {
            id: 'amount',
            name: 'AMOUNT',
            selector: (order) => Number(order.plan_price),
            sortable: true,
            right: true,
            minWidth: '50px',
            grow: 0.8,
            cell: (order) => (
                <div className="text-end">
                    <div>{formatMoney(order.plan_price)}</div>
                    {Number(order.balance_adjustment) !== 0 && (
                        <div className={`small ${Number(order.balance_adjustment) > 0 ? 'text-danger' : 'text-success'}`}>
                        {/* {Number(order.balance_adjustment) > 0 ? '- Balance' : '+ Credit'}{' '} */}
                        {formatMoney(Math.abs(Number(order.balance_adjustment)))}
                        </div>
                    )}
                </div>
            ),
        },
        {
            id: 'paid',
            name: 'PAID',
            selector: (order) => getPaidAmount(order),
            sortable: true,
            right: true,
            minWidth: '50px',
            grow: 0.8,
            cell: (order) => formatMoney(getPaidAmount(order)),
        },
        {
            id: 'balance',
            name: 'DUE',
            selector: (order) => Number(order.due_amount),
            sortable: true,
            right: true,
            minWidth: '30px',
            grow: 0.8,
            cell: (order) => (
                <span className={Number(order.due_amount) <= 0 ? 'text-success fw-semibold' : 'fw-semibold'}>
                    {formatBalance(Number(order.due_amount))}
                </span>
            ),
        },
        {
            id: 'action',
            name: 'ACTION',
            button: true,
            right: true,
            ignoreRowClick: true,
            minWidth: '80px',
            style: { paddingRight: '0.5rem' },
            grow: 0.8,
            cell: (order) =>
                Number(order.due_amount) > 0 ? (
                    <button
                        type="button"
                        className="btn btn-sm btn-success text-nowrap"
                        aria-label="Add payment"
                        title="Add payment"
                        onClick={() => openPaymentModal(order)}
                    >
                        <i className="fas fa-plus" />
                    </button>
                ) : (
                    <button
                        type="button"
                        className="btn btn-sm btn-outline-primary text-nowrap"
                        aria-label={`Generate bill for ${order.order_number}`}
                        title="Generate bill and save as PDF"
                        onClick={() => openBill(customer, order)}
                    >
                        <i className="fas fa-file-pdf me-1" />
                        Bill
                    </button>
                ),
        },
    ];

    return (
        <AdminLayout>
            <Head title={`${customer.name} Profile`} />
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
                                            <span className="customer-profile-info-icon">
                                                <i className="fas fa-wifi" />
                                            </span>
                                            <div className="min-w-0">
                                                <div className="customer-profile-label">CURRENT PLAN</div>
                                                <div 
                                                className={`customer-profile-value ${customer.plan?.status === 0 ? 'text-danger' : ''}`}
                                                >
                                                {customer.plan?.name ?? 'No plan assigned'}
                                                </div>
                                            </div>
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
                                        renewal.setData({
                                            plan_id: customer.plan_id ? String(customer.plan_id) : '',
                                            start_date: nextRenewalDate,
                                            remarks: '',
                                        });
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
                                            {carryForwardBalance !== 0 && (
                                                <div className="form-text">
                                                    {carryForwardBalance > 0 ? 'Outstanding balance added' : 'Advance credit applied'}:{' '}
                                                    {formatMoney(Math.abs(carryForwardBalance))}
                                                </div>
                                            )}
                                            {selectedPlan && (
                                                <div className="form-text fw-semibold">
                                                    Amount due after adjustment:{' '}
                                                    {formatBalance(Number(selectedPlan.price ?? 0) + carryForwardBalance)}
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
                                                    type="date"
                                                    className={`form-control${renewal.errors.start_date ? ' is-invalid' : ''}`}
                                                    value={renewal.data.start_date}
                                                    onChange={(event) => renewal.setData('start_date', event.target.value)}
                                                    required
                                                />
                                                {renewal.errors.start_date && <div className="invalid-feedback">{renewal.errors.start_date}</div>}
                                                <div className="form-text">Defaults to the day after the latest renewal ends.</div>
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label" htmlFor="renewal_end_date">
                                                    End Date
                                                </label>
                                                <input
                                                    id="renewal_end_date"
                                                    type="text"
                                                    className="form-control"
                                                    value={
                                                        selectedPlan?.duration != null
                                                            ? formatDate(dateAfterMonths(renewal.data.start_date, selectedPlan.duration))
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
                                        <button type="submit" className="btn btn-primary" disabled={renewal.processing || plans.length === 0}>
                                            {renewal.processing && <span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />}
                                            {renewal.processing ? 'Renewing…' : 'Confirm renewal'}
                                        </button>
                                        <button type="button" className="btn btn-secondary" onClick={() => setShowRenewalModal(false)}>
                                            Cancel
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
                                        <div className="small text-body-secondary mt-1">
                                            {formatDate(paymentOrder.start_date)} - {formatDate(paymentOrder.end_date)}
                                            <span className="mx-2 text-muted">·</span>
                                            {paymentOrder.plan_name}
                                            <span className="mx-2 text-muted">·</span>
                                            <span className={Number(paymentOrder.due_amount) < 0 ? 'text-success fw-medium' : 'text-danger fw-medium'}>
                                            {Number(paymentOrder.due_amount) < 0 ? 'Credit' : 'Balance'}{' '}
                                            {formatMoney(Math.abs(Number(paymentOrder.due_amount)))}
                                            </span>
                                        </div>
                                        </div>
                                        <button type="button" className="btn-close" aria-label="Close" onClick={closePaymentModal} />
                                    </div>

                                    <div className="modal-body">
                                        <div className="row g-3 mb-4">
                                        <div className="col-md-6">
                                            <label htmlFor="paid_amount" className="form-label mb-1">
                                            Paid amount
                                            </label>
                                            <div className="input-group has-validation">
                                            <input
                                                id="paid_amount"
                                                type="number"
                                                min="0.01"
                                                step="0.01"
                                                className={`form-control${payment.errors.paid_amount ? ' is-invalid' : ''}`}
                                                value={payment.data.paid_amount}
                                                onChange={(event) => payment.setData('paid_amount', event.target.value)}
                                                required
                                            />
                                            {payment.errors.paid_amount && (
                                                <div className="invalid-feedback">{payment.errors.paid_amount}</div>
                                            )}
                                            </div>
                                            <div className="form-text mt-1 lh-sm text-muted" style={{ fontSize: '0.825rem' }}>
                                            You can collect more than the current balance; any extra will be applied to the next renewal.
                                            </div>
                                        </div>

                                        <div className="col-md-6">
                                            <label htmlFor="payment_date" className="form-label mb-1">
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
                                            {payment.errors.payment_date && (
                                            <div className="invalid-feedback">{payment.errors.payment_date}</div>
                                            )}
                                        </div>

                                        <div className="col-md-6">
                                            <label htmlFor="payment_mode" className="form-label mb-1">
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

                                        <div className="col-md-6">
                                            <label htmlFor="payment_remarks" className="form-label mb-1">
                                            Remarks
                                            </label>
                                            <textarea
                                            id="payment_remarks"
                                            className={`form-control${payment.errors.remarks ? ' is-invalid' : ''}`}
                                            rows={1}
                                            style={{ resize: 'none' }}
                                            value={payment.data.remarks}
                                            onChange={(event) => payment.setData('remarks', event.target.value)}
                                            />
                                            {payment.errors.remarks && <div className="invalid-feedback">{payment.errors.remarks}</div>}
                                        </div>
                                        </div>

                                        <div className="border-top pt-3">
                                        <h6 className="fw-semibold mb-3 d-flex align-items-center">
                                            <i className="bi bi-clock-history me-1 text-secondary"></i>
                                            Previous payments on this renewal
                                        </h6>
                                        
                                        {paymentOrder.payments.length > 0 ? (
                                            <div className="table-responsive rounded-2 border">
                                            <table className="table table-sm table-striped table-hover align-middle mb-0">
                                                <thead className="table-light">
                                                <tr>
                                                    <th className="ps-3 py-2 text-muted fw-semibold" style={{ fontSize: '0.85rem' }}>Date</th>
                                                    <th className="py-2 text-muted fw-semibold" style={{ fontSize: '0.85rem' }}>Mode</th>
                                                    <th className="pe-3 py-2 text-end text-muted fw-semibold" style={{ fontSize: '0.85rem' }}>Paid</th>
                                                </tr>
                                                </thead>
                                                <tbody>
                                                {paymentOrder.payments.map((entry) => (
                                                    <tr key={entry.id}>
                                                    <td className="ps-3 py-2">{formatDate(entry.payment_date)}</td>
                                                    <td className="py-2">
                                                        <span className={`badge rounded-pill px-2.5 py-1 text-xs ${
                                                        entry.mode === 'Online' ? 'bg-primary-subtle text-primary border border-primary-subtle' :
                                                        entry.mode === 'Cash' ? 'bg-success-subtle text-success border border-success-subtle' :
                                                        'bg-warning-subtle text-warning border border-warning-subtle'
                                                        }`}>
                                                        {entry.mode}
                                                        </span>
                                                    </td>
                                                    <td className="pe-3 py-2 text-end fw-medium text-dark">
                                                        {formatMoney(entry.paid_amount)}
                                                    </td>
                                                    </tr>
                                                ))}
                                                </tbody>
                                            </table>
                                            </div>
                                        ) : (
                                            <div className="alert alert-light border border-dashed rounded-3 p-3 text-center mb-0">
                                            <span className="small text-muted">
                                                <i className="bi bi-info-circle me-1"></i>
                                                No payments have been added to this renewal.
                                            </span>
                                            </div>
                                        )}
                                        </div>
                                    </div>

                                    <div className="modal-footer bg-light-subtle border-top">
                                        <button type="submit" className="btn btn-success px-3" disabled={payment.processing}>
                                        {payment.processing ? (
                                            <>
                                            <span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />
                                            Saving…
                                            </>
                                        ) : (
                                            'Save payment'
                                        )}
                                        </button>
                                        <button type="button" className="btn btn-secondary px-3" onClick={closePaymentModal}>
                                        Cancel
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
