// resources/js/Layouts/AdminLayout.tsx
import { Link } from '@inertiajs/react';
import { ReactNode } from 'react';

interface AdminLayoutProps {
    children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
    return (
        <div className="app-wrapper">
            {/* Navbar Header */}
            <nav className="app-header navbar navbar-expand bg-body shadow">
                <div className="container-fluid">
                    <ul className="navbar-nav">
                        <li className="nav-item">
                            <a className="nav-link" data-lte-toggle="sidebar" href="#" role="button">
                                <i className="bi bi-list"></i>
                            </a>
                        </li>
                    </ul>
                    <ul className="navbar-nav ms-auto">
                        <li className="nav-item">
                            <Link href="/logout" method="post" as="button" className="nav-link btn btn-link border-0">
                                <i className="bi bi-box-arrow-right"></i>
                                <span className="ms-2">Logout</span>
                            </Link>
                        </li>
                    </ul>
                </div>
            </nav>

            {/* Sidebar Navigation */}
            <aside className="app-sidebar bg-body-secondary shadow" data-bs-theme="dark">
                <div className="sidebar-brand">
                    <Link href="/dashboard" className="brand-link">
                        <span className="brand-text fw-light">AdminLTE 4 TSX</span>
                    </Link>
                </div>
                <div className="sidebar-wrapper">
                    <nav className="mt-2">
                        <ul className="nav sidebar-menu flex-column" data-lte-toggle="treeview" role="menu" data-accordion="false">
                            <li className="nav-item">
                                <Link href="/dashboard" className="nav-link">
                                    <i className="nav-icon bi bi-speedometer"></i>
                                    <p>Dashboard</p>
                                </Link>
                            </li>
                        </ul>
                    </nav>
                </div>
            </aside>

            {/* Content Body */}
            <main className="app-main py-4">
                <div className="container-fluid">
                    {children}
                </div>
            </main>

            {/* Footer */}
            <footer className="app-footer">
                <strong>Copyright &copy; 2026.</strong> All rights reserved.
            </footer>
        </div>
    );
}
