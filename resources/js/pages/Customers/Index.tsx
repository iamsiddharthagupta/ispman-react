import { Head, Link, router, usePage } from '@inertiajs/react';
import DataTable, { TableColumn } from 'react-data-table-component';
import { useMemo } from 'react';
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
                minWidth: '200px',
                cell: (customer) => (
                    <div className="d-flex align-items-center">
                        <div className="fw-semibold text-body">{customer.name}</div>
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
                id: 'email',
                name: 'EMAIL',
                selector: (customer) => customer.email ?? '',
                sortField: 'email',
                sortable: true,
                cell: (customer) => <span className="text-body-secondary">{customer.email || '—'}</span>,
            },
            {
                id: 'plan',
                name: 'INTERNET PLAN',
                selector: (customer) => customer.plan?.name ?? '',
                cell: (customer) => <span className="text-body">{customer.plan?.name ?? '—'}</span>,
            },
            {
                id: 'status',
                name: 'STATUS',
                selector: (customer) => customer.status,
                sortField: 'status',
                sortable: true,
                cell: (customer) => (
                    <span className={`badge rounded-pill px-3 py-2 ${customer.status === 1 ? 'text-bg-success' : 'text-bg-secondary'}`}>
                        <i className={`fas ${customer.status === 1 ? 'fa-check-circle' : 'fa-pause-circle'} me-1`} />
                        {customer.status === 1 ? 'Active' : 'Inactive'}
                    </span>
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
        [url],
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
                                <span className="badge text-bg-primary rounded-pill">{customers.total}</span>
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
