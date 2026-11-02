import { Head, Link, useForm } from '@inertiajs/react';
import { FormEvent } from 'react';
import AuthLayout from '../../layouts/auth-layout';

interface LoginProps {
    status?: string;
    canResetPassword?: boolean;
}

export default function Login({ status, canResetPassword = false }: LoginProps) {
    const { data, setData, post, processing, errors, reset } = useForm<{
        email: string;
        password: string;
        remember: boolean;
    }>({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (event: FormEvent) => {
        event.preventDefault();
        post('/login', { onFinish: () => reset('password') });
    };

    return (
        <AuthLayout action={<Link href="/register">Create account</Link>}>
            <Head title="Sign in" />
            <div className="auth-page">
                <div className="auth-box">
                    <div className="card auth-card">
                        <div className="card-body auth-card-body">
                            <div className="auth-brand">
                                <span className="auth-brand-mark" aria-hidden="true">
                                    <i className="bi bi-router-fill" />
                                </span>
                                <span>ISPMan</span>
                            </div>
                            <div className="auth-heading">
                                <h1>Welcome back</h1>
                                <p>Sign in to manage your network.</p>
                            </div>

                            {status && (
                                <div className="alert alert-success auth-status" role="status">
                                    {status}
                                </div>
                            )}

                            <form onSubmit={submit} className="auth-form">
                                <div className="mb-3">
                                    <label className="auth-field-label" htmlFor="email">
                                        Email address
                                    </label>
                                    <div className="input-group auth-input-group">
                                        <span className="input-group-text" aria-hidden="true">
                                            <i className="bi bi-envelope" />
                                        </span>
                                        <input
                                            id="email"
                                            type="email"
                                            className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                                            placeholder="you@example.com"
                                            value={data.email}
                                            onChange={(event) => setData('email', event.target.value)}
                                            autoComplete="username"
                                            autoFocus
                                            required
                                            aria-invalid={Boolean(errors.email)}
                                            aria-describedby={errors.email ? 'email-error' : undefined}
                                        />
                                    </div>
                                    {errors.email && (
                                        <div id="email-error" className="auth-field-error" role="alert">
                                            {errors.email}
                                        </div>
                                    )}
                                </div>

                                <div className="mb-3">
                                    <label className="auth-field-label" htmlFor="password">
                                        Password
                                    </label>
                                    <div className="input-group auth-input-group">
                                        <span className="input-group-text" aria-hidden="true">
                                            <i className="bi bi-lock" />
                                        </span>
                                        <input
                                            id="password"
                                            type="password"
                                            className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                                            placeholder="Enter your password"
                                            value={data.password}
                                            onChange={(event) => setData('password', event.target.value)}
                                            autoComplete="current-password"
                                            required
                                            aria-invalid={Boolean(errors.password)}
                                            aria-describedby={errors.password ? 'password-error' : undefined}
                                        />
                                    </div>
                                    {errors.password && (
                                        <div id="password-error" className="auth-field-error" role="alert">
                                            {errors.password}
                                        </div>
                                    )}
                                </div>

                                <div className="auth-options">
                                    <div className="form-check">
                                        <input
                                            id="remember"
                                            type="checkbox"
                                            className="form-check-input"
                                            checked={data.remember}
                                            onChange={(event) => setData('remember', event.target.checked)}
                                        />
                                        <label className="form-check-label" htmlFor="remember">
                                            Remember me
                                        </label>
                                    </div>
                                    {canResetPassword && <Link href="/forgot-password">Forgot password?</Link>}
                                </div>

                                <button type="submit" className="btn btn-primary w-100 auth-submit" disabled={processing}>
                                    {processing && <span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />}
                                    {processing ? 'Signing in...' : 'Sign in'}
                                    {!processing && <i className="bi bi-arrow-right ms-2" aria-hidden="true" />}
                                </button>
                            </form>

                            <div className="auth-footer">
                                <span>New to ISPMan?</span> <Link href="/register">Create an account</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthLayout>
    );
}
