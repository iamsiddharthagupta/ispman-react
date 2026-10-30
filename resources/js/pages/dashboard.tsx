import { Head } from '@inertiajs/react';
import AdminLayout from '../layouts/adminlte-layout';

const metrics = [
    { title: 'Active subscribers', value: '12,840', icon: 'bi-people', color: 'primary' },
    { title: 'Monthly revenue', value: '$48,290', icon: 'bi-currency-dollar', color: 'success' },
    { title: 'Network uptime', value: '99.98%', icon: 'bi-router', color: 'info' },
    { title: 'Open support tickets', value: '18', icon: 'bi-headset', color: 'warning' },
];

const subscribers = [
    { id: 'ISP-20481', name: 'Olivia Rhye', plan: 'Fiber 500', status: 'Active', lastSeen: '2 minutes ago' },
    { id: 'ISP-20480', name: 'Phoenix Baker', plan: 'Fiber 200', status: 'Active', lastSeen: '18 minutes ago' },
    { id: 'ISP-20479', name: 'Lana Steiner', plan: 'Business Pro', status: 'Pending', lastSeen: '42 minutes ago' },
    { id: 'ISP-20478', name: 'Demi Wilkinson', plan: 'Fiber 500', status: 'Active', lastSeen: '1 hour ago' },
    { id: 'ISP-20477', name: 'Candice Wu', plan: 'Fiber 100', status: 'Active', lastSeen: '2 hours ago' },
];

const regions = [
    { name: 'North district', subscribers: '3,820', uptime: '99.99%' },
    { name: 'Central district', subscribers: '5,140', uptime: '99.97%' },
    { name: 'South district', subscribers: '3,880', uptime: '99.98%' },
];

export default function Dashboard() {
    return (
        <AdminLayout>
            <Head title="Dashboard" />

            <div className="app-content-header">
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-sm-6">
                            <h3 className="mb-0">Dashboard</h3>
                        </div>
                        <div className="col-sm-6">
                            <ol className="breadcrumb float-sm-end">
                                <li className="breadcrumb-item">
                                    <a href="/dashboard">Home</a>
                                </li>
                                <li className="breadcrumb-item active" aria-current="page">
                                    Dashboard
                                </li>
                            </ol>
                        </div>
                    </div>
                </div>
            </div>

            <div className="app-content">
                <div className="container-fluid">
                    <div className="row">
                        {metrics.map((metric) => (
                            <div className="col-lg-3 col-6" key={metric.title}>
                                <div className={`small-box text-bg-${metric.color}`}>
                                    <div className="inner">
                                        <h3>{metric.value}</h3>
                                        <p>{metric.title}</p>
                                    </div>
                                    <div className="small-box-icon">
                                        <i className={`bi ${metric.icon}`} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="row">
                        <div className="col-lg-8">
                            <section className="card">
                                <div className="card-header">
                                    <h3 className="card-title">Recent subscribers</h3>
                                    <div className="card-tools">
                                        <span className="badge text-bg-primary">Sample data</span>
                                    </div>
                                </div>
                                <div className="card-body p-0">
                                    <div className="table-responsive">
                                        <table className="table table-striped align-middle mb-0">
                                            <thead>
                                                <tr>
                                                    <th>Account</th>
                                                    <th>Subscriber</th>
                                                    <th>Plan</th>
                                                    <th>Status</th>
                                                    <th>Last active</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {subscribers.map((subscriber) => (
                                                    <tr key={subscriber.id}>
                                                        <td>{subscriber.id}</td>
                                                        <td>{subscriber.name}</td>
                                                        <td>{subscriber.plan}</td>
                                                        <td>
                                                            <span
                                                                className={`badge text-bg-${subscriber.status === 'Active' ? 'success' : 'warning'}`}
                                                            >
                                                                {subscriber.status}
                                                            </span>
                                                        </td>
                                                        <td>{subscriber.lastSeen}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                                <div className="card-footer clearfix">
                                    <span className="text-secondary">Showing 5 recent accounts</span>
                                    <a href="#subscribers" className="btn btn-sm btn-primary float-end">
                                        View subscribers
                                    </a>
                                </div>
                            </section>
                        </div>

                        <div className="col-lg-4">
                            <section className="card">
                                <div className="card-header">
                                    <h3 className="card-title">Network health</h3>
                                </div>
                                <div className="card-body p-0">
                                    <ul className="products-list product-list-in-card ps-2 pe-2">
                                        {regions.map((region) => (
                                            <li className="item" key={region.name}>
                                                <div className="product-info ms-0">
                                                    <span className="product-title">
                                                        {region.name}
                                                        <span className="badge text-bg-success float-end">Online</span>
                                                    </span>
                                                    <span className="product-description">
                                                        {region.subscribers} subscribers - {region.uptime} uptime
                                                    </span>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="card-footer">
                                    <i className="bi bi-info-circle me-1" />
                                    Regional figures are sample data.
                                </div>
                            </section>

                            <section className="card">
                                <div className="card-header">
                                    <h3 className="card-title">Service snapshot</h3>
                                </div>
                                <div className="card-body">
                                    <div className="info-box">
                                        <span className="info-box-icon text-bg-primary">
                                            <i className="bi bi-wifi" />
                                        </span>
                                        <div className="info-box-content">
                                            <span className="info-box-text">Provisioned connections</span>
                                            <span className="info-box-number">12,840</span>
                                        </div>
                                    </div>
                                    <div className="info-box mb-0">
                                        <span className="info-box-icon text-bg-success">
                                            <i className="bi bi-speedometer2" />
                                        </span>
                                        <div className="info-box-content">
                                            <span className="info-box-text">Average download speed</span>
                                            <span className="info-box-number">186 Mbps</span>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
