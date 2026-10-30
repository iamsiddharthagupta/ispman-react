import { Head, Link, usePage } from '@inertiajs/react';
import AdminLayout from '../../layouts/dashboard-layout';
import { appRoute } from '../../lib/app-route';
import PlanForm from '../../components/forms/plan-form';

export default function Create() {
    const { url } = usePage();

    return (
        <AdminLayout>
            <Head title="Create plan" />
            <div className="app-content-header">
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-sm-6">
                            <h3 className="mb-0">Create plan</h3>
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
                                    Create
                                </li>
                            </ol>
                        </div>
                    </div>
                </div>
            </div>
            <div className="app-content">
                <div className="container-fluid">
                    <PlanForm />
                </div>
            </div>
        </AdminLayout>
    );
}