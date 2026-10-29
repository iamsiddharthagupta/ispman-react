// Components
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import AuthAdminLTELayout from '@/layouts/auth/auth-adminlte-layout';

export default function ForgotPassword({ status }: { status?: string }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('password.email'));
    };

    return (
        <AuthAdminLTELayout title="Forgot password" description="Recover your password">
            <Head title="Forgot password" />

            {status && <div className="alert alert-success mb-3">{status}</div>}

            <form onSubmit={submit}>
                <div className="mb-3">
                    <div className="input-group">
                        <input
                            type="email"
                            className="form-control"
                            placeholder="Email"
                            name="email"
                            autoComplete="off"
                            value={data.email}
                            autoFocus
                            onChange={(e) => setData('email', e.target.value)}
                            disabled={processing}
                        />
                        <div className="input-group-text">
                            <span className="bi bi-envelope"></span>
                        </div>
                    </div>
                    <InputError message={errors.email} />
                </div>

                <div className="row">
                    <div className="col-12">
                        <div className="d-grid gap-2">
                            <button
                                type="submit"
                                className="btn btn-primary w-100"
                                disabled={processing}
                            >
                                {processing ? 'Sending...' : 'Send Password Reset Link'}
                            </button>
                        </div>
                    </div>
                </div>
            </form>

            <p className="mt-3 mb-0">
                <Link href={route('login')} className="text-center">
                    Login
                </Link>
            </p>
        </AuthAdminLTELayout>
    );
}
