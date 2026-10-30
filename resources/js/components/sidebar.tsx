import { Link } from '@inertiajs/react';

export default function Sidebar() {
    return (
        <aside className="app-sidebar bg-body-secondary shadow" data-bs-theme="dark">
            <div className="sidebar-brand">
                <Link href="/dashboard" className="brand-link">
                    <span className="brand-text fw-light">ISPMan</span>
                </Link>
            </div>
            <div className="sidebar-wrapper">
                <nav className="mt-2">
                    <ul className="nav sidebar-menu flex-column" data-lte-toggle="treeview" role="menu" data-accordion="false">
                        <li className="nav-item">
                            <Link href="/dashboard" className="nav-link active">
                                <i className="nav-icon bi bi-speedometer2" />
                                <p>Dashboard</p>
                            </Link>
                        </li>
                    </ul>
                </nav>
            </div>
        </aside>
    );
}
