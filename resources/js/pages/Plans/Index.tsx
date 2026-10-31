
import { Head, Link, router, usePage } from '@inertiajs/react';
import DataTable, { TableColumn } from 'react-data-table-component';
import { useMemo } from 'react';
import AdminLayout from '../../layouts/dashboard-layout';
import { appRoute } from '../../lib/app-route';
import { Plan } from '../../types/plan';

interface PlanIndexProps {
    plans: {
        data: Plan[];
        current_page: number;
        from: number | null;
        to: number | null;
        total: number;
    };
    sorting: { sort: string; direction: 'asc' | 'desc' };
}

export default function Index({ plans, sorting }: PlanIndexProps) {
    const { url } = usePage();

    function visitPlans(params: {
        page?: number;
        sort?: string;
        direction?: string;
    }) {
        router.get(
            appRoute(url, '/plans'),
            {
                sort: params.sort ?? sorting.sort,
                direction: params.direction ?? sorting.direction,
                page: params.page ?? plans.current_page,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
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

    const columns = useMemo<TableColumn<Plan>[]>(
        () => [
            {
                id: 'name',
                name: 'PLAN NAME',
                selector: plan => plan.name,
                sortField: 'name',
                sortable: true,
                minWidth: '190px',
                cell: plan => (
                    <div className="d-flex align-items-center gap-3 py-2">
                        <div>
                            <div className="fw-semibold text-body">
                                {plan.name}
                            </div>
                        </div>
                    </div>
                ),
            },
            {
                id: 'speed',
                name: 'SPEED',
                selector: plan => plan.speed,
                sortField: 'speed',
                sortable: true,
                cell: plan => (
                    <span className="fw-semibold text-body">
                        {plan.speed}
                        <span className="text-body-secondary"> Mbps</span>
                    </span>
                ),
            },
            {
                id: 'price',
                name: 'PRICE',
                selector: plan => plan.price,
                sortField: 'price',
                sortable: true,
                cell: plan => (
                    <div>
                        <span className="fw-bold text-body">
                            ₹{Number(plan.price).toLocaleString('en-IN')}
                        </span>
                    </div>
                ),
            },
            {
                id: 'duration',
                name: 'VALIDITY',
                selector: plan => plan.duration,
                sortField: 'duration',
                sortable: true,
                cell: plan => (
                    <span className="text-body-secondary">
                        {plan.duration} month{plan.duration > 1 ? 's' : ''}
                    </span>
                ),
            },
            {
                id: 'vendor_name',
                name: 'VENDOR',
                selector: plan => plan.vendor_name,
                sortField: 'vendor_name',
                sortable: true,
                cell: plan => (
                    <span className="text-body">
                        {plan.vendor_name || '—'}
                    </span>
                ),
            },
            {
                id: 'status',
                name: 'STATUS',
                selector: plan => plan.status,
                sortField: 'status',
                sortable: true,
                cell: plan => (
                    <span
                        className={`badge rounded-pill px-3 py-2 ${
                            plan.status === 1
                                ? 'text-bg-success'
                                : 'text-bg-secondary'
                        }`}
                    >
                        <i
                            className={`fas ${
                                plan.status === 1
                                    ? 'fa-check-circle'
                                    : 'fa-pause-circle'
                            } me-1`}
                        />
                        {plan.status === 1 ? 'Active' : 'Inactive'}
                    </span>
                ),
            },
            {
                id: 'actions',
                name: 'ACTIONS',
                button: true,
                right: true,
                ignoreRowClick: true,
                cell: plan => (
                    <div className="d-flex align-items-center gap-1">
                        <Link
                            href={appRoute(url, `/plans/${plan.id}`)}
                            className="btn btn-sm btn-light border"
                            title="View plan"
                            aria-label={`View ${plan.name}`}
                        >
                            <i className="far fa-eye" />
                        </Link>

                        <Link
                            href={appRoute(url, `/plans/${plan.id}/edit`)}
                            className="btn btn-sm btn-light border"
                            title="Edit plan"
                            aria-label={`Edit ${plan.name}`}
                        >
                            <i className="fas fa-pen" />
                        </Link>

                        <button
                            type="button"
                            className="btn btn-sm btn-light border text-danger"
                            title="Delete plan"
                            aria-label={`Delete ${plan.name}`}
                            onClick={() => {
                                if (
                                    window.confirm(
                                        `Are you sure you want to delete "${plan.name}"?`
                                    )
                                ) {
                                    router.delete(
                                        appRoute(url, `/plans/${plan.id}`)
                                    );
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
            <Head title="Plans" />

            {/* Page Header */}
            <div className="app-content-header">
                <div className="container-fluid">
                    <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
                        <div>
                            <div className="d-flex align-items-center gap-2 mb-1">
                                <h3 className="mb-0 fw-bold">Internet Plans</h3>
                            </div>

                            <ol className="breadcrumb small mt-2 mb-0">
                                <li className="breadcrumb-item">
                                    <Link href={appRoute(url, '/dashboard')}>
                                        Dashboard
                                    </Link>
                                </li>
                                <li className="breadcrumb-item active">
                                    Plans
                                </li>
                            </ol>
                        </div>

                        <Link
                            href={appRoute(url, '/plans/create')}
                            className="btn btn-danger"
                        >
                            <i className="fas fa-plus" />
                        </Link>
                    </div>
                </div>
            </div>

            <div className="app-content">
                <div className="container-fluid">

                    {/* Plan Table */}
                    <div className="card border-0 shadow-sm">
                        <div className="card-body p-0">
                            <DataTable
                                customStyles={customerTableStyles}
                                key={`${sorting.sort}-${sorting.direction}-${plans.current_page}`}
                                columns={columns}
                                data={plans.data}
                                keyField="id"
                                defaultSortFieldId={sorting.sort}
                                defaultSortAsc={sorting.direction === 'asc'}
                                sortServer
                                onSort={(column, direction) => {
                                    if (column.sortField) {
                                        visitPlans({
                                            page: 1,
                                            sort: column.sortField,
                                            direction,
                                        });
                                    }
                                }}
                                pagination
                                paginationServer
                                paginationTotalRows={plans.total}
                                paginationDefaultPage={plans.current_page}
                                paginationPerPage={15}
                                paginationRowsPerPageOptions={[15]}
                                onChangePage={page => visitPlans({ page })}
                                persistTableHead
                                responsive
                                highlightOnHover
                                noDataComponent={
                                    <div className="text-center py-5">
                                        <i className="fas fa-box-open fs-1 text-body-tertiary mb-3" />
                                        <h6 className="fw-semibold">
                                            No plans found
                                        </h6>
                                    </div>
                                }
                            />
                        </div>

                        <div className="card-footer bg-body py-3">
                            <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                                <small className="text-body-secondary">
                                    Showing <strong>{plans.from ?? 0}</strong>
                                    {' '}to <strong>{plans.to ?? 0}</strong>
                                    {' '}of <strong>{plans.total}</strong> plans
                                </small>

                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}