// Components
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import AuthAdminLTELayout from '@/layouts/auth/auth-adminlte-layout';

export default function ConfirmPassword() {
    const { data, setData, post, processing, errors, reset } = useForm({
        password: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('password.confirm'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <AuthAdminLTELayout
            title="Confirm password"
            description="This is a secure area of the application. Please confirm your password before continuing."
        >
            <Head title="Confirm password" />

            <form onSubmit={submit}>
                <div className="input-group mb-3">
                    <input
                        type="password"
                        className="form-control"
                        placeholder="Password"
                        name="password"
                        autoComplete="current-password"
                        value={data.password}
                        autoFocus
                        onChange={(e) => setData('password', e.target.value)}
                    />
                    <div className="input-group-text">
                        <span className="bi bi-lock-fill"></span>
                    </div>
                </div>
                <InputError message={errors.password} />

                <div className="row">
                    <div className="col-12">
                        <button type="submit" className="btn btn-primary btn-block" disabled={processing}>
                            {processing ? 'Confirming...' : 'Confirm Password'}
                        </button>
                    </div>
                </div>
            </form>
        </AuthAdminLTELayout>
    );
}
