import { Link, usePage } from '@inertiajs/react';
import { appRoute } from '../../lib/app-route';

export default function Sidebar() {
    const { url } = usePage();
    const dashboardUrl = appRoute(url, '/dashboard');
    const plansUrl = appRoute(url, '/plans');
    const customersUrl = appRoute(url, '/customers');
    const renewPlan = appRoute(url, '/renew-plan');
    const collectPayment = appRoute(url, '/collect-payment');

    return (
        <aside className="app-sidebar bg-body-secondary shadow" data-bs-theme="dark">
            <div className="sidebar-brand">
                <Link href={dashboardUrl} className="brand-link">
                    <span className="brand-icon">
                        <i className="bi bi-diagram-3-fill"></i>
                    </span>

                    <span className="brand-text">
                        <span className="brand-isp">ISP</span>
                        <span className="brand-man">Man</span>
                    </span>

                    <span className="brand-version">2.0</span>
                </Link>
            </div>

            <div className="sidebar-search" role="search">
                <label htmlFor="sidebar-search-input" className="visually-hidden">
                    Filter menu
                </label>
                <input
                    type="search"
                    id="sidebar-search-input"
                    className="form-control form-control-sm"
                    placeholder="Filter menu…"
                    autoComplete="off"
                    data-lte-toggle="sidebar-search"
                    data-lte-target="#navigation"
                />
                <p className="fs-7 text-secondary mt-2 mb-0" data-lte-search-empty role="status" hidden>
                    No matching pages.
                </p>
            </div>

            <div className="sidebar-wrapper">
                <nav className="mt-2">
                    <ul className="nav sidebar-menu flex-column" data-lte-toggle="treeview" role="menu" data-accordion="false" id="navigation">
                        <li className="nav-item">
                            <Link href={dashboardUrl} className={`nav-link${url.split('?')[0].endsWith('/dashboard') ? ' active' : ''}`}>
                                <i className="nav-icon fa-solid fa-gauge" />
                                <p>Dashboard</p>
                            </Link>
                        </li>

                        <li className="nav-header">Operations</li>
                        <li className="nav-item">
                            <Link href={renewPlan} className={`nav-link${url.split('?')[0].includes('/renew-plan') ? ' active' : ''}`}>
                                <i className="nav-icon fa-solid fa-arrows-rotate" />
                                <p>Renew Plan</p>
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link href={collectPayment} className={`nav-link${url.split('?')[0].includes('/collect-payment') ? ' active' : ''}`}>
                                <i className="nav-icon fa-solid fa-hand-holding-dollar" />
                                <p>Collect Payment</p>
                            </Link>
                        </li>

                        <li className="nav-header">Customer Management</li>
                        <li className="nav-item">
                            <Link href={customersUrl} className={`nav-link${url.split('?')[0].includes('/customers') ? ' active' : ''}`}>
                                <i className="nav-icon fa-regular fa-user" />
                                <p>Customers</p>
                            </Link>
                        </li>

                        <li className="nav-header">Plan Management</li>
                        <li className="nav-item">
                            <Link href={plansUrl} className={`nav-link${url.split('?')[0].includes('/plans') ? ' active' : ''}`}>
                                <i className="nav-icon fa-solid fa-wifi" />
                                <p>Plans</p>
                            </Link>
                        </li>

                        <li className="nav-header">Setting</li>
                        <li className="nav-item">
                            <Link href="#" className="nav-link">
                                <i className="nav-icon fa-solid fa-gear" />
                                <p>Change Password</p>
                            </Link>
                        </li>
                    </ul>
                </nav>
            </div>
        </aside>
    );
}
