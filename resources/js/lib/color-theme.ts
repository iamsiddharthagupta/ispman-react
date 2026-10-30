export type ColorTheme = 'light' | 'dark' | 'auto';

const storageKey = 'color-theme';
let removeSystemThemeListener: (() => void) | undefined;

export function getSavedColorTheme(): ColorTheme {
    if (typeof window === 'undefined') {
        return 'auto';
    }

    const savedTheme = window.localStorage.getItem(storageKey);

    return savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'auto' ? savedTheme : 'auto';
}

export function applyColorTheme(theme: ColorTheme): void {
    removeSystemThemeListener?.();

    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');
    const applyTheme = () => {
        const resolvedTheme = theme === 'auto' ? (systemTheme.matches ? 'dark' : 'light') : theme;

        document.documentElement.setAttribute('data-bs-theme', resolvedTheme);
    };

    applyTheme();

    if (theme === 'auto') {
        systemTheme.addEventListener('change', applyTheme);
        removeSystemThemeListener = () => systemTheme.removeEventListener('change', applyTheme);
    } else {
        removeSystemThemeListener = undefined;
    }
}

export function saveColorTheme(theme: ColorTheme): void {
    window.localStorage.setItem(storageKey, theme);
    applyColorTheme(theme);
}
