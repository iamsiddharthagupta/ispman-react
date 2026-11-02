import { Head, Link, useForm } from '@inertiajs/react';
import { FormEvent } from 'react';
import AuthLayout from '../../layouts/auth-layout';

interface RegisterProps {
    status?: string;
}

export default function Register({ status }: RegisterProps) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit = (event: FormEvent) => {
        event.preventDefault();
        post('/register', { onFinish: () => reset('password', 'password_confirmation') });
    };

    return (
        <AuthLayout action={<Link href="/">Sign in</Link>}>
            <Head title="Create account" />
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
                                <h1>Create your account</h1>
                                <p>Get started managing your network with ISPMan.</p>
                            </div>

                            {status && (
                                <div className="alert alert-info auth-status" role="status">
                                    {status}
                                </div>
                            )}

                            <form onSubmit={submit} className="auth-form">
                                <div className="mb-3">
                                    <label className="auth-field-label" htmlFor="name">
                                        Full name
                                    </label>
                                    <div className="input-group auth-input-group">
                                        <span className="input-group-text" aria-hidden="true">
                                            <i className="bi bi-person" />
                                        </span>
                                        <input
                                            id="name"
                                            type="text"
                                            className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                                            placeholder="Your name"
                                            value={data.name}
                                            onChange={(event) => setData('name', event.target.value)}
                                            autoComplete="name"
                                            autoFocus
                                            required
                                            aria-invalid={Boolean(errors.name)}
                                            aria-describedby={errors.name ? 'name-error' : undefined}
                                        />
                                    </div>
                                    {errors.name && (
                                        <div id="name-error" className="auth-field-error" role="alert">
                                            {errors.name}
                                        </div>
                                    )}
                                </div>

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
                                            autoComplete="email"
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
                                            placeholder="Create a password"
                                            value={data.password}
                                            onChange={(event) => setData('password', event.target.value)}
                                            autoComplete="new-password"
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

                                <div className="mb-3">
                                    <label className="auth-field-label" htmlFor="password_confirmation">
                                        Confirm password
                                    </label>
                                    <div className="input-group auth-input-group">
                                        <span className="input-group-text" aria-hidden="true">
                                            <i className="bi bi-shield-lock" />
                                        </span>
                                        <input
                                            id="password_confirmation"
                                            type="password"
                                            className={`form-control ${errors.password_confirmation ? 'is-invalid' : ''}`}
                                            placeholder="Enter your password again"
                                            value={data.password_confirmation}
                                            onChange={(event) => setData('password_confirmation', event.target.value)}
                                            autoComplete="new-password"
                                            required
                                            aria-invalid={Boolean(errors.password_confirmation)}
                                            aria-describedby={errors.password_confirmation ? 'password-confirmation-error' : undefined}
                                        />
                                    </div>
                                    {errors.password_confirmation && (
                                        <div id="password-confirmation-error" className="auth-field-error" role="alert">
                                            {errors.password_confirmation}
                                        </div>
                                    )}
                                </div>

                                <button type="submit" className="btn btn-primary w-100 auth-submit" disabled={processing}>
                                    {processing && <span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />}
                                    {processing ? 'Creating account...' : 'Create account'}
                                    {!processing && <i className="bi bi-arrow-right ms-2" aria-hidden="true" />}
                                </button>
                            </form>

                            <div className="auth-footer">
                                <span>Already have an account?</span> <Link href="/">Sign in</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthLayout>
    );
}
