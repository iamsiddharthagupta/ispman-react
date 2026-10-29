import { Link } from '@inertiajs/react';

interface AuthAdminLTELayoutProps {
    children: React.ReactNode;
    title?: string;
    description?: string;
}

export default function AuthAdminLTELayout({ children, title, description }: AuthAdminLTELayoutProps) {
    return (
        <div className="login-page">
            <div className="login-box">
                <div className="login-logo">
                    <Link href={route('home')}>
                        <b>Admin</b>LTE
                    </Link>
                </div>

                <div className="card">
                    <div className="card-body login-card-body">
                        <p className="login-box-msg">{description}</p>
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
