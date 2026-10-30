import { Head, Link, usePage } from '@inertiajs/react';
import AdminLayout from '../../layouts/dashboard-layout';
import { appRoute } from '../../lib/app-route';
import CustomerForm from '../../components/forms/customer-form';
import { Customer, CustomerPlan } from '../../types/customer';

interface EditProps {
    customer: Customer;
    plans: CustomerPlan[];
}

export default function Edit({ customer, plans }: EditProps) {
    const { url } = usePage();

    return (
        <AdminLayout>
            <Head title={`Edit ${customer.name}`} />
            <div className="app-content-header">
                <div className="container-fluid">
                    <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
                        <h3 className="mb-0">Edit customer</h3>
                        <ol className="breadcrumb mb-0">
                            <li className="breadcrumb-item">
                                <Link href={appRoute(url, '/dashboard')}>Dashboard</Link>
                            </li>
                            <li className="breadcrumb-item">
                                <Link href={appRoute(url, '/customers')}>Customers</Link>
                            </li>
                            <li className="breadcrumb-item active" aria-current="page">
                                Edit
                            </li>
                        </ol>
                    </div>
                </div>
            </div>
            <div className="app-content">
                <div className="container-fluid">
                    <CustomerForm customer={customer} plans={plans} />
                </div>
            </div>
        </AdminLayout>
    );
}
