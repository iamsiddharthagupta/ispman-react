declare global {
    interface Window {
        route?: (name: string) => string;
    }
}

export function appRoute(currentUrl: string, path: string): string {
    if (typeof window !== 'undefined' && window.route) {
        const plansUrl = new URL(window.route('plans.index'), window.location.origin);
        const basePath = plansUrl.pathname.replace(/\/plans\/?$/, '');

        return `${window.location.origin}${basePath}${path.startsWith('/') ? path : `/${path}`}`;
    }

    const currentPath = currentUrl.split(/[?#]/, 1)[0];
    const routeStart = currentPath.search(/\/(?:dashboard|plans|customers|renew-plan|collect-payment)(?:\/|$)/);
    const basePath = routeStart === -1 ? '' : currentPath.slice(0, routeStart);

    return `${basePath}${path.startsWith('/') ? path : `/${path}`}`;
}
