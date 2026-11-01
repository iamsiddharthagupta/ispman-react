import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import DataTable, { TableColumn } from 'react-data-table-component';
import { useMemo, useState } from 'react';
import AdminLayout from '../../layouts/dashboard-layout';
import { appRoute } from '../../lib/app-route';
import { formatDate } from '../../lib/date-format';
import { Customer } from '../../types/customer';

interface RenewalCustomer extends Customer {
    remaining_days: number;
    latest_order: {
        end_date: string;
        plan_name: string;
    };
}

interface RenewalsIndexProps {
    customers: {
        data: RenewalCustomer[];
        current_page: number;
        from: number | null;
        to: number | null;
        total: number;
    };
}

export default function Index({ customers }: RenewalsIndexProps) {
    const { url } = usePage();
    const [clearSelectedRows, setClearSelectedRows] = useState(false);
    const [notice, setNotice] = useState('');
    const bulkRenewal = useForm<{ customer_ids: number[] }>({ customer_ids: [] });

    function visitPage(page: number) {
        bulkRenewal.setData('customer_ids', []);
        setClearSelectedRows((current) => !current);
        router.get(appRoute(url, '/renew-plan'), { page }, { preserveState: true, preserveScroll: true, replace: true });
    }

    function submitBulkRenewal() {
        const selectedCount = bulkRenewal.data.customer_ids.length;

        if (!selectedCount || !window.confirm(`Renew the internet plans for ${selectedCount} selected customer(s)?`)) {
            return;
        }

        setNotice('');
        bulkRenewal.post(appRoute(url, '/renew-plan/bulk'), {
            onSuccess: () => {
                setNotice(`Successfully renewed ${selectedCount} customer plan${selectedCount === 1 ? '' : 's'}.`);
                bulkRenewal.reset();
                setClearSelectedRows((current) => !current);
            },
        });
    }

    const tableStyles = {
        headCells: {
            style: {
                fontSize: '13px',
                fontWeight: '700',
                paddingLeft: '16px',
                paddingRight: '16px',
            },
        },
        cells: {
            style: {
                fontSize: '15px',
                paddingLeft: '16px',
                paddingRight: '16px',
            },
        },
        rows: {
            style: {
                minHeight: '54px',
            },
        },
    };

    const columns = useMemo<TableColumn<RenewalCustomer>[]>(
        () => [
            {
                id: 'customer',
                name: 'CUSTOMER',
                selector: (customer) => customer.name,
                minWidth: '210px',
                cell: (customer) => (
                    <div>
                        <Link href={appRoute(url, `/customers/${customer.id}`)} className="fw-semibold text-body text-decoration-none">
                            {customer.name}
                        </Link>
                        <div className="small text-body-secondary">{customer.address_line_1} · {customer.address_line_2} · {customer.address_area} · {customer.phone}</div>
                    </div>
                ),
            },
            {
                id: 'phone',
                name: 'PHONE',
                selector: (customer) => customer.phone,
            },
            {
                id: 'plan',
                name: 'INTERNET PLAN',
                selector: (customer) => customer.latest_order.plan_name,
                cell: (customer) => <span className="fw-semibold text-body">{customer.latest_order.plan_name}</span>,
            },
            {
                id: 'expiry',
                name: 'EXPIRES ON',
                selector: (customer) => customer.latest_order.end_date,
                sortable: true,
                cell: (customer) => <span className="text-body">{formatDate(customer.latest_order.end_date)}</span>,
            },
            {
                id: 'remaining',
                name: 'DAYS REMAINING',
                selector: (customer) => customer.remaining_days,
                sortable: true,
                center: true,
                cell: (customer) => (
                    <span className={`badge rounded-pill px-3 py-2 ${customer.remaining_days === 0 ? 'text-bg-danger' : 'text-bg-warning'}`}>
                        {customer.remaining_days === 0
                            ? 'Expires today'
                            : `${customer.remaining_days} day${customer.remaining_days === 1 ? '' : 's'}`}
                    </span>
                ),
            },
        ],
        [url],
    );

    return (
        <AdminLayout>
            <Head title="Renew Plans" />
            <div className="app-content-header">
                <div className="container-fluid">
                    <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
                        <div>
                            <h3 className="mb-0 fw-bold">Renew Plans</h3>
                            <ol className="breadcrumb small mt-2 mb-0">
                                <li className="breadcrumb-item">
                                    <Link href={appRoute(url, '/dashboard')}>Dashboard</Link>
                                </li>
                                <li className="breadcrumb-item active" aria-current="page">
                                    Renew Plans
                                </li>
                            </ol>
                        </div>
                        <button
                            type="button"
                            className="btn btn-primary"
                            onClick={submitBulkRenewal}
                            disabled={bulkRenewal.processing || bulkRenewal.data.customer_ids.length === 0}
                        >
                            <i className="fas fa-arrows-rotate me-2" />
                            {bulkRenewal.processing ? 'Renewing…' : `Renew (${bulkRenewal.data.customer_ids.length})`}
                        </button>
                    </div>
                </div>
            </div>
            <div className="app-content">
                <div className="container-fluid">
                    {notice && (
                        <div className="alert alert-success" role="status">
                            {notice}
                        </div>
                    )}
                    {bulkRenewal.errors.customer_ids && (
                        <div className="alert alert-danger" role="alert">
                            {bulkRenewal.errors.customer_ids}
                        </div>
                    )}
                    <div className="card border-0 shadow-sm">
                        <div className="card-body p-0">
                            <DataTable
                                key={customers.current_page}
                                customStyles={tableStyles}
                                columns={columns}
                                data={customers.data}
                                keyField="id"
                                selectableRows
                                clearSelectedRows={clearSelectedRows}
                                onSelectedRowsChange={({ selectedRows }) => {
                                    bulkRenewal.setData(
                                        'customer_ids',
                                        selectedRows.map((customer) => customer.id),
                                    );
                                }}
                                pagination
                                paginationServer
                                paginationTotalRows={customers.total}
                                paginationDefaultPage={customers.current_page}
                                paginationPerPage={15}
                                paginationRowsPerPageOptions={[15]}
                                onChangePage={visitPage}
                                persistTableHead
                                responsive
                                highlightOnHover
                                noDataComponent={
                                    <div className="text-center py-5">
                                        <i className="fas fa-circle-check fs-1 text-body-tertiary mb-3" />
                                        <h6 className="fw-semibold">No plans need renewal</h6>
                                        <p className="text-body-secondary mb-0">No active customer plans expire within the next five days.</p>
                                    </div>
                                }
                            />
                        </div>
                        <div className="card-footer bg-body py-3">
                            <small className="text-body-secondary">
                                Showing <strong>{customers.from ?? 0}</strong> to <strong>{customers.to ?? 0}</strong> of{' '}
                                <strong>{customers.total}</strong> customers
                            </small>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
