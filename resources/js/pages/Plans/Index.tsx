
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
                        <div
                            className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
                            style={{
                                width: 38,
                                height: 38,
                                background: 'var(--bs-primary-bg-subtle)',
                                color: 'var(--bs-primary)',
                            }}
                        >
                            <i className="fas fa-wifi" />
                        </div>
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
                        <i className="fas fa-gauge-high me-2 text-body-secondary" />
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
                        <div className="small text-body-secondary">
                            Per plan
                        </div>
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
                        <i className="far fa-calendar me-2" />
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

    const tableStyles = {
        headRow: {
            style: {
                backgroundColor: 'var(--bs-tertiary-bg)',
                borderBottom: '1px solid var(--bs-border-color)',
                minHeight: '48px',
            },
        },
        headCells: {
            style: {
                fontSize: '11px',
                fontWeight: '700',
                letterSpacing: '0.06em',
                color: 'var(--bs-secondary-color)',
                paddingLeft: '16px',
                paddingRight: '16px',
            },
        },
        rows: {
            style: {
                minHeight: '68px',
                borderBottom: '1px solid var(--bs-border-color)',
            },
            highlightOnHoverStyle: {
                backgroundColor: 'var(--bs-tertiary-bg)',
                cursor: 'default',
            },
        },
        cells: {
            style: {
                paddingLeft: '16px',
                paddingRight: '16px',
                fontSize: '13px',
            },
        },
        pagination: {
            style: {
                borderTop: '1px solid var(--bs-border-color)',
                minHeight: '56px',
            },
        },
    };

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
                                <span className="badge text-bg-primary rounded-pill">
                                    {plans.total}
                                </span>
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
                                        <p className="text-body-secondary small mb-3">
                                            Create your first internet plan to get started.
                                        </p>
                                        <Link
                                            href={appRoute(url, '/plans/create')}
                                            className="btn btn-primary btn-sm"
                                        >
                                            <i className="fas fa-plus me-1" />
                                            Add Plan
                                        </Link>
                                    </div>
                                }
                                customStyles={tableStyles}
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