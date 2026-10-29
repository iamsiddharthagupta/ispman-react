// Components
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

import AuthAdminLTELayout from '@/layouts/auth/auth-adminlte-layout';

export default function VerifyEmail({ status }: { status?: string }) {
    const { post, processing } = useForm({});

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('verification.send'));
    };

    return (
        <AuthAdminLTELayout title="Verify email" description="Please verify your email address by clicking on the link we just emailed to you.">
            <Head title="Email verification" />

            {status === 'verification-link-sent' && (
                <div className="alert alert-success mb-3">
                    A new verification link has been sent to the email address you provided during registration.
                </div>
            )}

            <form onSubmit={submit} className="text-center">
                <div className="row">
                    <div className="col-12">
                        <button type="submit" className="btn btn-primary btn-block" disabled={processing}>
                            {processing ? 'Sending...' : 'Resend Verification Email'}
                        </button>
                    </div>
                </div>

                <p className="mt-3 mb-1">
                    <Link href={route('logout')} method="post">Log out</Link>
                </p>
            </form>
        </AuthAdminLTELayout>
    );
}
