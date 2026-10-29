import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import AuthAdminLTELayout from '@/layouts/auth/auth-adminlte-layout';

interface RegisterForm {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
}

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm<RegisterForm>({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <AuthAdminLTELayout title="Register" description="Register a new membership">
            <Head title="Register" />
            <form onSubmit={submit}>
                <div className="input-group mb-3">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Full name"
                        required
                        autoFocus
                        tabIndex={1}
                        autoComplete="name"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        disabled={processing}
                    />
                    <div className="input-group-text">
                        <span className="bi bi-person"></span>
                    </div>
                </div>
                <InputError message={errors.name} />

                <div className="input-group mb-3">
                    <input
                        type="email"
                        className="form-control"
                        placeholder="Email"
                        required
                        tabIndex={2}
                        autoComplete="email"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        disabled={processing}
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
                        tabIndex={3}
                        autoComplete="new-password"
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        disabled={processing}
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
                        required
                        tabIndex={4}
                        autoComplete="new-password"
                        value={data.password_confirmation}
                        onChange={(e) => setData('password_confirmation', e.target.value)}
                        disabled={processing}
                    />
                    <div className="input-group-text">
                        <span className="bi bi-lock-fill"></span>
                    </div>
                </div>
                <InputError message={errors.password_confirmation} />

                <div className="row">
                    <div className="col-8">
                        <div className="icheck-primary">
                            <input
                                type="checkbox"
                                id="agree"
                                name="terms"
                                value="agree"
                            />
                            <label htmlFor="agree">
                                I agree to the <a href="#">terms</a>
                            </label>
                        </div>
                    </div>
                    <div className="col-4">
                        <button type="submit" className="btn btn-primary btn-block" tabIndex={5} disabled={processing}>
                            {processing ? 'Registering...' : 'Register'}
                        </button>
                    </div>
                </div>

                <div className="social-auth-links text-center">
                    <p>- OR -</p>
                </div>

                <p className="mb-1">
                    <Link href={route('login')}>I already have a membership</Link>
                </p>
            </form>
        </AuthAdminLTELayout>
    );
}
