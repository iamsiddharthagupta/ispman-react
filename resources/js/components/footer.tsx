import { createElement } from 'react';

interface FooterProps {
    variant?: 'admin' | 'guest';
}

export default function Footer() {
    return createElement(
        'footer',
        { className: 'app-footer' },
        createElement('strong', null, 'ISPMan'),
        createElement('span', { className: 'float-end d-none d-sm-inline' }, 'Version 1.0.0'),
    );
}
