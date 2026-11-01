import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { FormEvent } from 'react';
import AdminLayout from '../../layouts/dashboard-layout';
import { appRoute } from '../../lib/app-route';

export default function Password() {
    const { url } = usePage();
    const { data, setData, put, processing, errors, reset, recentlySuccessful } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const submit = (event: FormEvent) => {
        event.preventDefault();
        put(appRoute(url, '/settings/password'), {
            onFinish: () => reset(),
        });
    };

    return (
        <AdminLayout>
            <Head title="Change password" />
            <div className="app-content-header">
                <div className="container-fluid">
                    <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
                        <h3 className="mb-0">Change password</h3>
                        <ol className="breadcrumb mb-0">
                            <li className="breadcrumb-item">
                                <Link href={appRoute(url, '/dashboard')}>Dashboard</Link>
                            </li>
                            <li className="breadcrumb-item active" aria-current="page">
                                Change password
                            </li>
                        </ol>
                    </div>
                </div>
            </div>

            <div className="app-content">
                <div className="container-fluid">
                    <div className="row justify-content-center">
                        <div className="col-lg-8 col-xl-6">
                            <div className="card">
                                <div className="card-body">
                                    {recentlySuccessful && (
                                        <div className="alert alert-success" role="status">
                                            Password updated successfully.
                                        </div>
                                    )}

                                    <form onSubmit={submit}>
                                        <div className="mb-3">
                                            <label htmlFor="current_password" className="form-label">
                                                Current password
                                            </label>
                                            <input
                                                id="current_password"
                                                type="password"
                                                className={`form-control${errors.current_password ? ' is-invalid' : ''}`}
                                                value={data.current_password}
                                                onChange={(event) => setData('current_password', event.target.value)}
                                                autoComplete="current-password"
                                                required
                                                aria-invalid={Boolean(errors.current_password)}
                                            />
                                            {errors.current_password && <div className="invalid-feedback">{errors.current_password}</div>}
                                        </div>

                                        <div className="mb-3">
                                            <label htmlFor="password" className="form-label">
                                                New password
                                            </label>
                                            <input
                                                id="password"
                                                type="password"
                                                className={`form-control${errors.password ? ' is-invalid' : ''}`}
                                                value={data.password}
                                                onChange={(event) => setData('password', event.target.value)}
                                                autoComplete="new-password"
                                                required
                                                aria-invalid={Boolean(errors.password)}
                                            />
                                            {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                                        </div>

                                        <div className="mb-3">
                                            <label htmlFor="password_confirmation" className="form-label">
                                                Confirm new password
                                            </label>
                                            <input
                                                id="password_confirmation"
                                                type="password"
                                                className="form-control"
                                                value={data.password_confirmation}
                                                onChange={(event) => setData('password_confirmation', event.target.value)}
                                                autoComplete="new-password"
                                                required
                                            />
                                        </div>
                                    </form>
                                </div>
                                <div className="card-footer">
                                    <button type="submit" className="btn btn-primary float-end" disabled={processing}>
                                        {processing ? 'Updating password...' : 'Update password'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
