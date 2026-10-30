import { ReactNode } from 'react';
import { Footer, Navbar, Sidebar } from '../components';

interface AdminLayoutProps {
    children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
    return (
        <div className="app-wrapper sidebar-expand-lg" data-bs-theme="light">
            <Navbar />
            <Sidebar />

            <main className="app-main">{children}</main>

            <Footer />
        </div>
    );
}
