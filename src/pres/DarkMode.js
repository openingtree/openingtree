import CookieManager from '../app/CookieManager';

export const handleDarkMode = () => {
    const darkModeThemeIsCurrentlySet = document.body.classList.contains('dark-theme');

    const settings = CookieManager.getSettingsCookie() || {};

    if (settings.darkMode !== darkModeThemeIsCurrentlySet) {
        toggleDarkModeStyles();
    }
};

const toggleDarkModeStyles = () => {
    const navBar = document.querySelector('nav');
    navBar.classList.toggle('navbar-light');
    navBar.classList.toggle('navbar-dark');
    navBar.classList.toggle('bg-dark');
    navBar.classList.toggle('bg-light');

    toggleLogo();

    document.body.classList.toggle('dark-theme');
};

const toggleLogo = () => {
    const darkModeThemeIsCurrentlySet = document.body.classList.contains('dark-theme');
    const logo = document.querySelector('nav.navbar img');

    const logoSrc = darkModeThemeIsCurrentlySet ? '/opening-tree-logo.png' : '/opening-tree-logo-white.png';

    logo.setAttribute('src', logoSrc);
};
