import { Link } from '@inertiajs/react';

export default function Navbar() {
    return (
        <nav className="navbar navbar-expand bg-body border-bottom">
            <div className="container-fluid">
                <ul className="navbar-nav">
                    <li className="nav-item">
                        <button className="nav-link" data-lte-toggle="sidebar" type="button" aria-label="Toggle navigation">
                            <i className="bi bi-list" />
                        </button>
                    </li>
                    <li className="nav-item d-none d-md-block">
                        <Link href="/dashboard" className="nav-link fw-semibold">
                            ISPMan
                        </Link>
                    </li>
                </ul>
                <div className="ms-auto">
                    <Link href="/logout" method="post" as="button" className="btn btn-outline-danger">
                        <i className="bi bi-box-arrow-right me-1" aria-hidden="true" />
                        Logout
                    </Link>
                </div>
            </div>
        </nav>
    );
}
