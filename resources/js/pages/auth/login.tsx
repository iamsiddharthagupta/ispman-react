import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import AuthAdminLTELayout from '@/layouts/auth/auth-adminlte-layout';

interface LoginForm {
    email: string;
    password: string;
    remember: boolean;
    [key: string]: any;
}

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
}

export default function Login({ status, canResetPassword }: LoginProps) {
    const { data, setData, post, processing, errors, reset } = useForm<LoginForm>({
        email: '',
        password: '',
        remember: false,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <AuthAdminLTELayout title="Log in" description="Sign in to start your session">
            <Head title="Log in" />

            {status && <div className="alert alert-success mb-3">{status}</div>}

            <form onSubmit={submit}>
                <div className="input-group mb-3">
                    <input
                        type="email"
                        className="form-control"
                        placeholder="Email"
                        required
                        autoFocus
                        tabIndex={1}
                        autoComplete="email"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                    />
                    <div className="input-group-text">
                        <span className="bi bi-envelope"></span>
                    </div>
                </div>
                <InputError message={errors.email} />

                <div className="input-group mb-3">
                    <input
                        type="password"
                        className="form-control"
                        placeholder="Password"
                        required
                        tabIndex={2}
                        autoComplete="current-password"
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                    />
                    <div className="input-group-text">
                        <span className="bi bi-lock-fill"></span>
                    </div>
                </div>
                <InputError message={errors.password} />

                <div className="row">
                    <div className="col-8">
                        <div className="form-check">
                            <input
                                className="form-check-input"
                                type="checkbox"
                                id="remember"
                                tabIndex={3}
                                checked={data.remember}
                                onChange={(e) => setData('remember', e.target.checked)}
                            />
                            <label className="form-check-label" htmlFor="remember">
                                Remember Me
                            </label>
                        </div>
                    </div>
                    <div className="col-4">
                        <button type="submit" className="btn btn-primary btn-block" tabIndex={4} disabled={processing}>
                            {processing ? 'Signing in...' : 'Sign In'}
                        </button>
                    </div>
                </div>

                {canResetPassword && (
                    <p className="mb-1">
                        <Link href={route('password.request')} className="text-center">
                            I forgot my password
                        </Link>
                    </p>
                )}

                <p className="mb-0">
                    <Link href={route('register')} className="text-center">
                        Register a new membership
                    </Link>
                </p>
            </form>
        </AuthAdminLTELayout>
    );
}
