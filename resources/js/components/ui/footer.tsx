interface FooterProps {
    variant?: 'admin' | 'guest';
}

export default function Footer() {
    return (
        <>
            <footer className="app-footer">
                <div className="float-end d-none d-sm-inline">Version 1.0</div>
                <strong>
                    Copyright &copy; 2014-2026&nbsp;
                    <a href="#" className="text-decoration-none">Endeavour Technologies</a>.
                </strong>{' '}
                All rights reserved.
            </footer>
        </>
    );
}
