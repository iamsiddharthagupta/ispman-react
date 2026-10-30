import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { ColorTheme, getSavedColorTheme, saveColorTheme } from '../../lib/color-theme';

export default function Navbar() {
    const [colorTheme, setSelectedColorTheme] = useState<ColorTheme>(getSavedColorTheme);
    const { auth } = usePage<{
        auth: {
            user: {
                name: string;
                email: string;
            } | null;
        };
    }>().props;
    const user = auth.user;
    const name = user?.name ?? 'User';
    const initials =
        name
            .trim()
            .split(/\s+/)
            .filter(Boolean)
            .slice(0, 2)
            .map((part) => [...part][0])
            .join('')
            .toUpperCase() || 'U';

    return (
        <nav className="app-header navbar navbar-expand bg-body">
            <div className="container-fluid">

                {/* Start Navbar Links */}
                <ul className="navbar-nav">
                    <li className="nav-item">
                        <a
                        className="nav-link"
                        data-lte-toggle="sidebar"
                        href="#"
                        role="button"
                        aria-label="Toggle sidebar"
                        >
                        <i className="bi bi-list"></i>
                        </a>
                    </li>

                    <li className="nav-item d-none d-md-block">
                        <Link href="/dashboard" className="nav-link">
                            Dashboard
                        </Link>
                    </li>

                </ul>

                {/* Navbar Search */}
                <form
                className="navbar-search d-none d-md-block ms-3"
                role="search"
                action=""
                >
                <label htmlFor="navbar-search-input" className="visually-hidden">
                    Search
                </label>

                <div className="navbar-search-field">
                    <input
                    type="search"
                    id="navbar-search-input"
                    name="q"
                    className="form-control"
                    placeholder="Search…"
                    autoComplete="off"
                    />

                    <button
                    className="navbar-search-submit"
                    type="submit"
                    aria-label="Submit search"
                    >
                    <i className="bi bi-search" aria-hidden="true"></i>
                    </button>
                </div>
                </form>

                {/* End Navbar Links */}
                <ul className="navbar-nav ms-auto">

                {/* Mobile Search */}
                <li className="nav-item d-md-none">
                    <a
                    className="nav-link"
                    href="./pages/search-results.html"
                    aria-label="Search"
                    >
                    <i className="bi bi-search" aria-hidden="true"></i>
                    </a>
                </li>

                {/* Notifications Dropdown */}
                <li className="nav-item dropdown">
                    <a
                    className="nav-link"
                    data-bs-toggle="dropdown"
                    href="#"
                    aria-label="Notifications: 15 unread"
                    >
                    <i className="bi bi-bell-fill"></i>
                    <span className="navbar-badge badge text-bg-warning">15</span>
                    </a>

                    <div className="dropdown-menu dropdown-menu-lg dropdown-menu-end">
                    <span className="dropdown-item dropdown-header">
                        15 Notifications
                    </span>

                    <div className="dropdown-divider"></div>

                    <a href="#" className="dropdown-item">
                        <i className="bi bi-envelope me-2"></i>
                        4 new messages
                        <span className="float-end text-secondary fs-7">3 mins</span>
                    </a>

                    <div className="dropdown-divider"></div>

                    <a href="#" className="dropdown-item">
                        <i className="bi bi-people-fill me-2"></i>
                        8 friend requests
                        <span className="float-end text-secondary fs-7">
                        12 hours
                        </span>
                    </a>

                    <div className="dropdown-divider"></div>

                    <a href="#" className="dropdown-item">
                        <i className="bi bi-file-earmark-fill me-2"></i>
                        3 new reports
                        <span className="float-end text-secondary fs-7">2 days</span>
                    </a>

                    <div className="dropdown-divider"></div>

                    <a href="#" className="dropdown-item dropdown-footer">
                        See All Notifications
                    </a>
                    </div>
                </li>

                {/* Language Menu */}
                <li className="nav-item dropdown">
                    <a
                    className="nav-link"
                    href="#"
                    id="language-menu"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                    aria-label="Change language, current language English"
                    >
                    <i className="bi bi-translate" aria-hidden="true"></i>
                    </a>

                    <ul
                    className="dropdown-menu dropdown-menu-end"
                    aria-labelledby="language-menu"
                    >
                    <li>
                        <a
                        className="dropdown-item active"
                        href="#"
                        hrefLang="en"
                        aria-current="true"
                        >
                        English
                        <i className="bi bi-check-lg ms-2" aria-hidden="true"></i>
                        </a>
                    </li>

                    <li>
                        <a className="dropdown-item" href="#" hrefLang="es">
                        Español
                        </a>
                    </li>

                    <li>
                        <a className="dropdown-item" href="#" hrefLang="fr">
                        Français
                        </a>
                    </li>

                    <li>
                        <a className="dropdown-item" href="#" hrefLang="de">
                        Deutsch
                        </a>
                    </li>

                    <li>
                        <a className="dropdown-item" href="#" hrefLang="ar">
                        العربية
                        </a>
                    </li>
                    </ul>
                </li>

                {/* Fullscreen Toggle */}
                <li className="nav-item">
                    <a
                    className="nav-link"
                    href="#"
                    data-lte-toggle="fullscreen"
                    aria-label="Toggle fullscreen"
                    >
                    <i
                        data-lte-icon="maximize"
                        className="bi bi-arrows-fullscreen"
                    ></i>

                    <i
                        data-lte-icon="minimize"
                        className="bi bi-fullscreen-exit d-none"
                    ></i>
                    </a>
                </li>

                {/* Color Mode Toggle */}
                <li className="nav-item dropdown">
                    <a
                    className="nav-link"
                    href="#"
                    id="bd-theme"
                    aria-label="Toggle color scheme"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                    >
                    <i className={`bi bi-sun-fill ${colorTheme !== 'light' ? 'd-none' : ''}`}></i>
                    <i className={`bi bi-moon-fill ${colorTheme !== 'dark' ? 'd-none' : ''}`}></i>
                    <i className={`bi bi-circle-half ${colorTheme !== 'auto' ? 'd-none' : ''}`}></i>
                    </a>

                    <ul
                    className="dropdown-menu dropdown-menu-end"
                    aria-labelledby="bd-theme"
                    style={{ "--bs-dropdown-min-width": "8rem" } as React.CSSProperties}
                    >
                    <li>
                        <button
                        type="button"
                        className={`dropdown-item d-flex align-items-center ${colorTheme === 'light' ? 'active' : ''}`}
                        data-bs-theme-value="light"
                        aria-pressed={colorTheme === 'light'}
                        onClick={() => {
                            saveColorTheme('light');
                            setSelectedColorTheme('light');
                        }}
                        >
                        <i className="bi bi-sun-fill me-2"></i>
                        Light
                        <i className={`bi bi-check-lg ms-auto ${colorTheme === 'light' ? '' : 'd-none'}`}></i>
                        </button>
                    </li>

                    <li>
                        <button
                        type="button"
                        className={`dropdown-item d-flex align-items-center ${colorTheme === 'dark' ? 'active' : ''}`}
                        data-bs-theme-value="dark"
                        aria-pressed={colorTheme === 'dark'}
                        onClick={() => {
                            saveColorTheme('dark');
                            setSelectedColorTheme('dark');
                        }}
                        >
                        <i className="bi bi-moon-fill me-2"></i>
                        Dark
                        <i className={`bi bi-check-lg ms-auto ${colorTheme === 'dark' ? '' : 'd-none'}`}></i>
                        </button>
                    </li>

                    <li>
                        <button
                        type="button"
                        className={`dropdown-item d-flex align-items-center ${colorTheme === 'auto' ? 'active' : ''}`}
                        data-bs-theme-value="auto"
                        aria-pressed={colorTheme === 'auto'}
                        onClick={() => {
                            saveColorTheme('auto');
                            setSelectedColorTheme('auto');
                        }}
                        >
                        <i className="bi bi-circle-half me-2"></i>
                        Auto
                        <i className={`bi bi-check-lg ms-auto ${colorTheme === 'auto' ? '' : 'd-none'}`}></i>
                        </button>
                    </li>
                    </ul>
                </li>

                {/* User Menu */}
                <li className="nav-item dropdown user-menu">
                    <a
                    href="#"
                    className="nav-link dropdown-toggle"
                    data-bs-toggle="dropdown"
                    >
                    <span
                        className="user-image rounded-circle shadow bg-primary text-white d-inline-flex align-items-center justify-content-center fw-semibold"
                        aria-hidden="true"
                    >
                        {initials}
                    </span>

                    <span className="d-none d-md-inline">
                        {name}
                    </span>
                    </a>

                    <ul className="dropdown-menu dropdown-menu-lg dropdown-menu-end">

                    {/* User Image */}
                    <li className="user-header text-bg-primary">
                        <div
                        className="rounded-circle shadow bg-white text-primary d-flex align-items-center justify-content-center fw-bold mx-auto"
                        style={{ width: 90, height: 90, border: '3px solid var(--bs-border-color-translucent)' }}
                        aria-hidden="true"
                        >
                        {initials}
                        </div>

                        <p>
                        {name}
                        {user?.email && <small>{user.email}</small>}
                        </p>
                    </li>

                    {/* User Body */}
                    {/* <li className="user-body">
                        <div className="row">
                        <div className="col-4 text-center">
                            <a href="#">Followers</a>
                        </div>

                        <div className="col-4 text-center">
                            <a href="#">Sales</a>
                        </div>

                        <div className="col-4 text-center">
                            <a href="#">Friends</a>
                        </div>
                        </div>
                    </li> */}

                    {/* User Footer */}
                    <li className="user-footer">
                        <a href="#" className="btn btn-outline-secondary">
                        Profile
                        </a>

                        <Link
                        href="/logout"
                        method="post"
                        as="button"
                        className="btn btn-outline-danger float-end">
                        Sign out
                        </Link>
                    </li>

                    </ul>
                </li>

                </ul>
            </div>
        </nav>
    );
}
