import { Head, Link, usePage } from '@inertiajs/react';
import AdminLayout from '../../layouts/dashboard-layout';
import { appRoute } from '../../lib/app-route';
import { Plan } from '../../types/plan';

interface ShowProps {
    plan: Plan;
}

export default function Show({ plan }: ShowProps) {
    const { url } = usePage();

    return (
        <AdminLayout>
            <Head title={plan.name} />
            <div className="app-content-header">
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-sm-6">
                            <h3 className="mb-0">{plan.name}</h3>
                        </div>
                        <div className="col-sm-6">
                            <ol className="breadcrumb float-sm-end">
                                <li className="breadcrumb-item">
                                    <Link href={appRoute(url, '/dashboard')}>Home</Link>
                                </li>
                                <li className="breadcrumb-item">
                                    <Link href={appRoute(url, '/plans')}>Plans</Link>
                                </li>
                                <li className="breadcrumb-item active" aria-current="page">
                                    {plan.name}
                                </li>
                            </ol>
                        </div>
                    </div>
                </div>
            </div>
            <div className="app-content">
                <div className="container-fluid">
                    <div className="card card-primary card-outline">
                        <div className="card-body">
                            <dl className="row mb-0">
                                <dt className="col-sm-3">Speed</dt>
                                <dd className="col-sm-9">{plan.speed}</dd>
                                <dt className="col-sm-3">Price</dt>
                                <dd className="col-sm-9">{plan.price}</dd>
                                <dt className="col-sm-3">Duration</dt>
                                <dd className="col-sm-9">
                                    {plan.duration} month{plan.duration === 1 ? '' : 's'}
                                </dd>
                                <dt className="col-sm-3">Vendor</dt>
                                <dd className="col-sm-9">{plan.vendor_name}</dd>
                                <dt className="col-sm-3">Vendor rate</dt>
                                <dd className="col-sm-9">{plan.vendor_rate ?? '—'}</dd>
                                <dt className="col-sm-3">Status</dt>
                                <dd className="col-sm-9">{plan.status === 1 ? 'Active' : 'Inactive'}</dd>
                                <dt className="col-sm-3">Remarks</dt>
                                <dd className="col-sm-9">{plan.remarks || '—'}</dd>
                            </dl>
                        </div>
                        <div className="card-footer d-flex gap-2">
                            <Link href={appRoute(url, `/plans/${plan.id}/edit`)} className="btn btn-primary">
                                Edit plan
                            </Link>
                            <Link href={appRoute(url, '/plans')} className="btn btn-secondary">
                                Back to plans
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
