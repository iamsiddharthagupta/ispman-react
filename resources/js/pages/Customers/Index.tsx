import { Head, Link, router, usePage } from '@inertiajs/react';
import DataTable, { TableColumn } from 'react-data-table-component';
import { useMemo, useState } from 'react';
import AdminLayout from '../../layouts/dashboard-layout';
import { appRoute } from '../../lib/app-route';
import { Customer } from '../../types/customer';

interface CustomerIndexProps {
    customers: {
        data: Customer[];
        current_page: number;
        from: number | null;
        to: number | null;
        total: number;
    };
    sorting: { sort: string; direction: 'asc' | 'desc' };
}

export default function Index({ customers, sorting }: CustomerIndexProps) {
    const { url } = usePage();
    const [pendingStatusUpdates, setPendingStatusUpdates] = useState<Set<number>>(() => new Set());

    function visitCustomers(params: { page?: number; sort?: string; direction?: string }) {
        router.get(
            appRoute(url, '/customers'),
            {
                sort: params.sort ?? sorting.sort,
                direction: params.direction ?? sorting.direction,
                page: params.page ?? customers.current_page,
            },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    }

    function toggleCustomerStatus(customer: Customer) {
        if (pendingStatusUpdates.has(customer.id)) {
            return;
        }

        setPendingStatusUpdates((pending) => new Set(pending).add(customer.id));
        router.patch(
            appRoute(url, `/customers/${customer.id}/status`),
            { status: customer.status === 1 ? 0 : 1 },
            {
                preserveScroll: true,
                onFinish: () => {
                    setPendingStatusUpdates((pending) => {
                        const next = new Set(pending);
                        next.delete(customer.id);
                        return next;
                    });
                },
            },
        );
    }

    const customerTableStyles = {
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
                fontSize: '16px',
                paddingLeft: '16px',
                paddingRight: '16px',
            },
        },
        rows: {
            style: {
                minHeight: '40px',
            },
        },
    };

    const columns = useMemo<TableColumn<Customer>[]>(
        () => [
            {
                id: 'name',
                name: 'CUSTOMER',
                selector: (customer) => customer.name,
                sortField: 'name',
                sortable: true,
                cell: (customer) => (
                    <div className="d-flex align-items-center">
                        <Link href={appRoute(url, `/customers/${customer.id}`)} className="fw-semibold text-body text-decoration-none">
                            {customer.name}
                            <div className="small text-body-secondary">{customer.username}</div>
                        </Link>
                    </div>
                ),
            },
            {
                id: 'phone',
                name: 'PHONE',
                selector: (customer) => customer.phone,
                sortField: 'phone',
                sortable: true,
            },
            {
                id: 'address',
                name: 'ADDRESS',
                sortField: 'address_line_1',
                sortable: true,
                selector: (customer) => {
                    return [customer.address_line_1, customer.address_line_2]
                    .filter(Boolean)
                    .join(', ');
                },
                cell: (customer) => {
                    const fullAddress = [customer.address_line_1, customer.address_line_2]
                    .filter(Boolean)
                    .join(', ');

                    return (
                    <span className="text-body">
                        {fullAddress || '—'}
                    </span>
                    );
                },
            },
            {
                id: 'address_area',
                name: 'AREA',
                sortField: 'address_area',
                sortable: true,
                selector: (customer) => customer.address_area ?? '',
                cell: (customer) => {
                    const area = customer.address_area ?? '—';
                    const limit = 15;
                    const truncatedArea = area.length > limit ? `${area.substring(0, limit)}...` : area;

                    return (
                        <span className="text-body" title={area !== '—' ? area : undefined}>
                            {truncatedArea}
                        </span>
                    );
                },
            },
            {
            id: 'plan',
            name: 'INTERNET PLAN',
            selector: (customer) => customer.plan?.name ?? '',
            cell: (customer) => {
                const planName = customer.plan?.name ?? '—';
                const limit = 15; // Limit the number of characters to display
                const truncatedName = planName.length > limit ? `${planName.substring(0, limit)}...` : planName;
                
                return (
                <span className="fw-semibold text-body" title={planName !== '—' ? planName : undefined}>
                    {truncatedName}
                </span>
                );
            },
            },

            {
                id: 'status',
                name: 'STATUS',
                selector: (customer) => customer.status,
                sortField: 'status',
                sortable: true,
                cell: (customer) => (
                    <div className="form-check form-switch d-flex align-items-center gap-2 mb-0">
                        <input
                            className="form-check-input m-0"
                            type="checkbox"
                            role="switch"
                            checked={customer.status === 1}
                            disabled={pendingStatusUpdates.has(customer.id)}
                            aria-label={`Set ${customer.name} ${customer.status === 1 ? 'inactive' : 'active'}`}
                            onChange={() => toggleCustomerStatus(customer)}
                        />
                        <span className={customer.status === 1 ? 'text-success' : 'text-body-secondary'}>
                            {customer.status === 1 ? 'On' : 'Off'}
                        </span>
                    </div>
                ),
            },
            {
                id: 'actions',
                name: 'ACTIONS',
                button: true,
                right: true,
                ignoreRowClick: true,
                cell: (customer) => (
                    <div className="d-flex align-items-center gap-1">
                        <Link
                            href={appRoute(url, `/customers/${customer.id}`)}
                            className="btn btn-sm btn-light border"
                            title="View customer"
                            aria-label={`View ${customer.name}`}
                        >
                            <i className="far fa-eye" />
                        </Link>
                        <Link
                            href={appRoute(url, `/customers/${customer.id}/edit`)}
                            className="btn btn-sm btn-light border"
                            title="Edit customer"
                            aria-label={`Edit ${customer.name}`}
                        >
                            <i className="fas fa-pen" />
                        </Link>
                        <button
                            type="button"
                            className="btn btn-sm btn-light border text-danger"
                            title="Delete customer"
                            aria-label={`Delete ${customer.name}`}
                            onClick={() => {
                                if (window.confirm(`Are you sure you want to delete "${customer.name}"?`)) {
                                    router.delete(appRoute(url, `/customers/${customer.id}`));
                                }
                            }}
                        >
                            <i className="far fa-trash-alt" />
                        </button>
                    </div>
                ),
            },
        ],
        [url, pendingStatusUpdates],
    );

    return (
        <AdminLayout>
            <Head title="Customers" />
            <div className="app-content-header">
                <div className="container-fluid">
                    <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
                        <div>
                            <div className="d-flex align-items-center gap-2 mb-1">
                                <h3 className="mb-0 fw-bold">Customers</h3>
                            </div>
                            <ol className="breadcrumb small mt-2 mb-0">
                                <li className="breadcrumb-item">
                                    <Link href={appRoute(url, '/dashboard')}>Dashboard</Link>
                                </li>
                                <li className="breadcrumb-item active">Customers</li>
                            </ol>
                        </div>
                        <Link href={appRoute(url, '/customers/create')} className="btn btn-danger">
                            <i className="fas fa-plus" />
                        </Link>
                    </div>
                </div>
            </div>
            <div className="app-content">
                <div className="container-fluid">
                    <div className="card border-0 shadow-sm">
                        <div className="card-body p-0">
                            <DataTable
                                customStyles={customerTableStyles}
                                key={`${sorting.sort}-${sorting.direction}-${customers.current_page}`}
                                columns={columns}
                                data={customers.data}
                                keyField="id"
                                defaultSortFieldId={sorting.sort}
                                defaultSortAsc={sorting.direction === 'asc'}
                                sortServer
                                onSort={(column, direction) => {
                                    if (column.sortField) {
                                        visitCustomers({ page: 1, sort: column.sortField, direction });
                                    }
                                }}
                                pagination
                                paginationServer
                                paginationTotalRows={customers.total}
                                paginationDefaultPage={customers.current_page}
                                paginationPerPage={15}
                                paginationRowsPerPageOptions={[15]}
                                onChangePage={(page) => visitCustomers({ page })}
                                persistTableHead
                                responsive
                                highlightOnHover
                                noDataComponent={
                                    <div className="text-center py-5">
                                        <i className="fas fa-users fs-1 text-body-tertiary mb-3" />
                                        <h6 className="fw-semibold">No customers found</h6>
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
