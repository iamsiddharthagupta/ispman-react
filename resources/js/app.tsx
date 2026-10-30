import 'bootstrap-icons/font/bootstrap-icons.css';
import 'overlayscrollbars/styles/overlayscrollbars.css';
import 'admin-lte/dist/css/adminlte.min.css';
import 'bootstrap';
import 'admin-lte';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';

const appName = import.meta.env.VITE_APP_NAME || 'ISPMan';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) => resolvePageComponent(`./pages/${name}.tsx`, import.meta.glob('./pages/**/*.tsx')),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(<App {...props} />);
    },
    progress: { color: '#2563eb' },
});
