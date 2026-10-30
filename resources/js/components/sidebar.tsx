import { Link } from '@inertiajs/react';

export default function Sidebar() {
    return (
        <aside className="app-sidebar bg-body-secondary shadow" data-bs-theme="dark">

            <div className="sidebar-brand">
                <Link href="/dashboard" className="brand-link">
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
                <label htmlFor="sidebar-search-input" className="visually-hidden">Filter menu</label>
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
                            <Link href="/dashboard" className="nav-link active">
                                <i className="nav-icon fas fa-tachometer-alt" />
                                <p>Dashboard</p>
                            </Link>
                        </li>
                    </ul>
                </nav>
            </div>
        </aside>
    );
}
