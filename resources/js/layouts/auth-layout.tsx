import { ReactNode } from 'react';
import { Footer, Navbar } from '../components';

interface AuthLayoutProps {
    children: ReactNode;
    action: ReactNode;
}

export default function AuthLayout({ children, action }: AuthLayoutProps) {
    return (
        <div className="min-vh-100 d-flex flex-column" data-bs-theme="light">
            <main className="flex-grow-1 d-flex align-items-center justify-content-center px-3 py-4">{children}</main>
        </div>
    );
}
