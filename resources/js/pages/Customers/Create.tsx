import { Head, Link, usePage } from '@inertiajs/react';
import AdminLayout from '../../layouts/dashboard-layout';
import { appRoute } from '../../lib/app-route';
import CustomerForm from '../../components/forms/customer-form';
import { CustomerPlan } from '../../types/customer';

interface CreateProps {
    plans: CustomerPlan[];
}

export default function Create({ plans }: CreateProps) {
    const { url } = usePage();

    return (
        <AdminLayout>
            <Head title="Create customer" />
            <div className="app-content-header">
                <div className="container-fluid">
                    <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
                        <h3 className="mb-0">Create customer</h3>
                        <ol className="breadcrumb mb-0">
                            <li className="breadcrumb-item">
                                <Link href={appRoute(url, '/dashboard')}>Dashboard</Link>
                            </li>
                            <li className="breadcrumb-item">
                                <Link href={appRoute(url, '/customers')}>Customers</Link>
                            </li>
                            <li className="breadcrumb-item active" aria-current="page">
                                Create
                            </li>
                        </ol>
                    </div>
                </div>
            </div>
            <div className="app-content">
                <div className="container-fluid">
                    <CustomerForm plans={plans} />
                </div>
            </div>
        </AdminLayout>
    );
}
