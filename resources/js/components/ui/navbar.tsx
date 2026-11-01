import { Link, router, usePage } from '@inertiajs/react';
import { FormEvent, useEffect, useState } from 'react';
import { ColorTheme, getSavedColorTheme, saveColorTheme } from '../../lib/color-theme';
import { appRoute } from '../../lib/app-route';

interface CustomerSearchResult {
    id: number;
    name: string;
    username: string;
    phone: string;
    email: string | null;
}

type CustomerSearchStatus = 'idle' | 'loading' | 'results' | 'empty' | 'error';

export default function Navbar() {
    const [colorTheme, setSelectedColorTheme] = useState<ColorTheme>(getSavedColorTheme);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<CustomerSearchResult[]>([]);
    const [searchStatus, setSearchStatus] = useState<CustomerSearchStatus>('idle');
    const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
    const { auth } = usePage<{
        auth: {
            user: {
                name: string;
                email: string;
            } | null;
        };
    }>().props;
    const { url } = usePage();
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

    useEffect(() => {
        const query = searchQuery.trim();

        if (query.length < 2) {
            setSearchResults([]);
            setSearchStatus('idle');
            return;
        }

        const controller = new AbortController();
        setSearchResults([]);
        setSearchStatus('loading');

        const timeout = window.setTimeout(async () => {
            try {
                const response = await fetch(
                    appRoute(url, `/customers/search?q=${encodeURIComponent(query)}`),
                    {
                        headers: { Accept: 'application/json' },
                        signal: controller.signal,
                    },
                );

                if (!response.ok) {
                    throw new Error(`Customer search failed with status ${response.status}`);
                }

                const results = (await response.json()) as CustomerSearchResult[];
                setSearchResults(results);
                setSearchStatus(results.length > 0 ? 'results' : 'empty');
            } catch {
                if (!controller.signal.aborted) {
                    setSearchResults([]);
                    setSearchStatus('error');
                }
            }
        }, 250);

        return () => {
            window.clearTimeout(timeout);
            controller.abort();
        };
    }, [searchQuery, url]);

    function submitSearch(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (searchResults[0]) {
            router.visit(appRoute(url, `/customers/${searchResults[0].id}`));
        }
    }

    function clearSearch() {
        setSearchQuery('');
        setSearchResults([]);
        setSearchStatus('idle');
        setMobileSearchOpen(false);
    }

    return (
        <nav className="app-header navbar navbar-expand bg-body">
            <div className="container-fluid position-relative">

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
                className={`navbar-search ms-3 position-relative ${mobileSearchOpen ? '' : 'd-none d-md-block'}`}
                role="search"
                onSubmit={submitSearch}
                style={
                    mobileSearchOpen
                        ? {
                              position: 'absolute',
                              top: '100%',
                              left: 0,
                              right: 0,
                              width: 'auto',
                              zIndex: 1030,
                              margin: 0,
                              padding: '0.75rem',
                              background: 'var(--bs-body-bg)',
                              boxShadow: 'var(--bs-box-shadow)',
                          }
                        : undefined
                }
                >
                <label htmlFor="navbar-search-input" className="visually-hidden">
                    Search customers
                </label>

                <div className="navbar-search-field">
                    <input
                    type="search"
                    id="navbar-search-input"
                    name="q"
                    className="form-control"
                    placeholder="Search customers…"
                    autoComplete="off"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    aria-label="Search customers by name, username, phone, or email"
                    aria-expanded={searchQuery.trim().length > 0}
                    aria-controls="navbar-customer-search-results"
                    />

                    <button
                    className="navbar-search-submit"
                    type="submit"
                    aria-label="Open first matching customer"
                    >
                    <i className="bi bi-search" aria-hidden="true"></i>
                    </button>
                </div>
                {searchQuery.trim().length > 0 && (
                    <div
                        id="navbar-customer-search-results"
                        className="dropdown-menu show w-100 mt-1"
                        role="listbox"
                    >
                        {searchQuery.trim().length < 2 && (
                            <span className="dropdown-item-text text-body-secondary">
                                Enter at least 2 characters to search.
                            </span>
                        )}
                        {searchStatus === 'loading' && (
                            <span className="dropdown-item-text text-body-secondary">Searching customers…</span>
                        )}
                        {searchStatus === 'empty' && (
                            <span className="dropdown-item-text text-body-secondary">No customers found.</span>
                        )}
                        {searchStatus === 'error' && (
                            <span className="dropdown-item-text text-danger">
                                Unable to search customers. Please try again.
                            </span>
                        )}
                        {searchResults.map((customer) => (
                            <Link
                                key={customer.id}
                                href={appRoute(url, `/customers/${customer.id}`)}
                                className="dropdown-item text-wrap"
                                role="option"
                                aria-selected="false"
                                onClick={clearSearch}
                            >
                                <span className="d-block fw-semibold">{customer.name}</span>
                                <small className="text-body-secondary">
                                    {customer.username} · {customer.phone}
                                </small>
                            </Link>
                        ))}
                    </div>
                )}
                </form>

                {/* End Navbar Links */}
                <ul className="navbar-nav ms-auto">

                {/* Mobile Search */}
                <li className="nav-item d-md-none">
                    <button
                    className="nav-link border-0 bg-transparent"
                    type="button"
                    aria-label={mobileSearchOpen ? 'Close customer search' : 'Search customers'}
                    aria-expanded={mobileSearchOpen}
                    onClick={() => setMobileSearchOpen((open) => !open)}
                    >
                    <i className="bi bi-search" aria-hidden="true"></i>
                    </button>
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
                        style={{ width: 90, height: 90, border: '3px solid var(--bs-border-color-translucent)', fontSize: '2rem' }}
                        aria-hidden="true"
                        >
                        {initials}
                        </div>

                        <p>
                        {name}
                        {user?.email && <small>{user.email}</small>}
                        </p>
                    </li>

                    {/* User Footer */}
                    <li className="user-footer">
                        <Link href="/settings/password" className="btn btn-outline-secondary">
                        Edit Password
                        </Link>

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
