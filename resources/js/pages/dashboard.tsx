// resources/js/Pages/Dashboard.tsx
import { ReactNode } from 'react';
import AdminLayout from '@/layouts/adminlte-layout';
import { Head } from '@inertiajs/react';

export default function Dashboard() {
    return (
        <>
            <Head title="Dashboard" />

            <div className="row mb-4">
                <div className="col-sm-6">
                    <h1 className="m-0">Dashboard</h1>
                </div>
            </div>

            <div className="row">
                <div className="col-lg-3 col-6">
                    <div className="small-box text-bg-primary p-3 rounded mb-3">
                        <div className="inner">
                            <h3>150</h3>
                            <p>New Orders</p>
                        </div>
                        <i className="small-box-icon bi bi-bag"></i>
                    </div>
                </div>
                <div className="col-lg-3 col-6">
                    <div className="small-box text-bg-primary p-3 rounded mb-3">
                        <div className="inner">
                            <h3>150</h3>
                            <p>New Orders</p>
                        </div>
                        <i className="small-box-icon bi bi-bag"></i>
                    </div>
                </div>
                <div className="col-lg-3 col-6">
                    <div className="small-box text-bg-primary p-3 rounded mb-3">
                        <div className="inner">
                            <h3>150</h3>
                            <p>New Orders</p>
                        </div>
                        <i className="small-box-icon bi bi-bag"></i>
                    </div>
                </div>
                <div className="col-lg-3 col-6">
                    <div className="small-box text-bg-primary p-3 rounded mb-3">
                        <div className="inner">
                            <h3>150</h3>
                            <p>New Orders</p>
                        </div>
                        <i className="small-box-icon bi bi-bag"></i>
                    </div>
                </div>
            </div>
        </>
    );
}

// Attach the persistent layout to the component function
Dashboard.layout = (page: ReactNode) => <AdminLayout>{page}</AdminLayout>;
