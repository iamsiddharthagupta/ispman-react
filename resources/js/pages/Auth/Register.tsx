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
            <div className="register-box">
                <div className="card">
                    <div className="card-body register-card-body">
                        <p className="register-box-msg">Register a new account</p>

                        {status && (
                            <div className="alert alert-info" role="status">
                                {status}
                            </div>
                        )}

                        <form onSubmit={submit}>
                            <div className="input-group mb-3">
                                <input
                                    id="name"
                                    type="text"
                                    className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                                    placeholder="Full name"
                                    value={data.name}
                                    onChange={(event) => setData('name', event.target.value)}
                                    autoComplete="name"
                                    autoFocus
                                    required
                                    aria-invalid={Boolean(errors.name)}
                                />
                                <div className="input-group-text">
                                    <span className="bi bi-person" />
                                </div>
                                {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                            </div>

                            <div className="input-group mb-3">
                                <input
                                    id="email"
                                    type="email"
                                    className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                                    placeholder="Email"
                                    value={data.email}
                                    onChange={(event) => setData('email', event.target.value)}
                                    autoComplete="email"
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
                                    autoComplete="new-password"
                                    required
                                    aria-invalid={Boolean(errors.password)}
                                />
                                <div className="input-group-text">
                                    <span className="bi bi-lock" />
                                </div>
                                {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                            </div>

                            <div className="input-group mb-3">
                                <input
                                    id="password_confirmation"
                                    type="password"
                                    className={`form-control ${errors.password_confirmation ? 'is-invalid' : ''}`}
                                    placeholder="Confirm password"
                                    value={data.password_confirmation}
                                    onChange={(event) => setData('password_confirmation', event.target.value)}
                                    autoComplete="new-password"
                                    required
                                    aria-invalid={Boolean(errors.password_confirmation)}
                                />
                                <div className="input-group-text">
                                    <span className="bi bi-lock" />
                                </div>
                                {errors.password_confirmation && <div className="invalid-feedback">{errors.password_confirmation}</div>}
                            </div>

                            <button type="submit" className="btn btn-primary w-100" disabled={processing}>
                                {processing ? 'Creating account...' : 'Create account'}
                            </button>
                        </form>

                        <p className="mb-0 mt-3">
                            <Link href="/">I already have an account</Link>
                        </p>
                    </div>
                </div>
            </div>
        </AuthLayout>
    );
}
