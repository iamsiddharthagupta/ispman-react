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
            <div className="login-box">
                <div className="card">
                    <div className="card-body login-card-body">
                        <p className="login-box-msg">Sign in to manage your network</p>

                        {status && (
                            <div className="alert alert-success" role="status">
                                {status}
                            </div>
                        )}

                        <form onSubmit={submit}>
                            <div className="input-group mb-3">
                                <input
                                    id="email"
                                    type="email"
                                    className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                                    placeholder="Email"
                                    value={data.email}
                                    onChange={(event) => setData('email', event.target.value)}
                                    autoComplete="username"
                                    autoFocus
                                    required
                                    aria-invalid={Boolean(errors.email)}
                                />
                                <div className="input-group-text">
                                    <span className="bi bi-envelope" />
                                </div>
                                {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                            </div>

                            <div className="input-group mb-3">
                                <input
                                    id="password"
                                    type="password"
                                    className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                                    placeholder="Password"
                                    value={data.password}
                                    onChange={(event) => setData('password', event.target.value)}
                                    autoComplete="current-password"
                                    required
                                    aria-invalid={Boolean(errors.password)}
                                />
                                <div className="input-group-text">
                                    <span className="bi bi-lock" />
                                </div>
                                {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                            </div>

                            <div className="row">
                                <div className="col-8">
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
                                </div>
                                <div className="col-4">
                                    <button type="submit" className="btn btn-primary w-100" disabled={processing}>
                                        {processing ? 'Wait...' : 'Sign in'}
                                    </button>
                                </div>
                            </div>
                        </form>

                        {canResetPassword && (
                            <p className="mb-1 mt-3">
                                <Link href="/forgot-password">I forgot my password</Link>
                            </p>
                        )}
                        <p className="mb-0 mt-2">
                            <Link href="/register">Create an account</Link>
                        </p>
                    </div>
                </div>
            </div>
        </AuthLayout>
    );
}
