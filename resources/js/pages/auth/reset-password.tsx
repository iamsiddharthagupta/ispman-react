import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import AuthAdminLTELayout from '@/layouts/auth/auth-adminlte-layout';

interface ResetPasswordProps {
    token: string;
    email: string;
}

interface ResetPasswordForm {
    token: string;
    email: string;
    password: string;
    password_confirmation: string;
}

export default function ResetPassword({ token, email }: ResetPasswordProps) {
    const { data, setData, post, processing, errors, reset } = useForm<ResetPasswordForm>({
        token: token,
        email: email,
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('password.store'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <AuthAdminLTELayout title="Reset password" description="Please enter your new password below">
            <Head title="Reset password" />

            <form onSubmit={submit}>
                <div className="input-group mb-3">
                    <input
                        type="email"
                        className="form-control"
                        placeholder="Email"
                        name="email"
                        autoComplete="email"
                        value={data.email}
                        readOnly
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
                        name="password"
                        autoComplete="new-password"
                        value={data.password}
                        autoFocus
                        onChange={(e) => setData('password', e.target.value)}
                    />
                    <div className="input-group-text">
                        <span className="bi bi-lock-fill"></span>
                    </div>
                </div>
                <InputError message={errors.password} />

                <div className="input-group mb-3">
                    <input
                        type="password"
                        className="form-control"
                        placeholder="Retype password"
                        name="password_confirmation"
                        autoComplete="new-password"
                        value={data.password_confirmation}
                        onChange={(e) => setData('password_confirmation', e.target.value)}
                    />
                    <div className="input-group-text">
                        <span className="bi bi-lock-fill"></span>
                    </div>
                </div>
                <InputError message={errors.password_confirmation} />

                <div className="row">
                    <div className="col-12">
                        <button type="submit" className="btn btn-primary btn-block" disabled={processing}>
                            {processing ? 'Resetting...' : 'Reset Password'}
                        </button>
                    </div>
                </div>
            </form>
        </AuthAdminLTELayout>
    );
}
