export const handleDarkMode = (darkMode) => {
    const darkModeThemeIsCurrentlySet = document.body.classList.contains('dark-theme');


    if (darkMode !== darkModeThemeIsCurrentlySet) {
        toggleDarkModeStyles();
    }
};
export const logoName = (darkMode) => {
    return darkMode? 'opening-tree-logo-white.png':'opening-tree-logo.png'
}
export const rowContentColor = (darkMode) => {
    return darkMode ? 'white' : 'grey'
}

const toggleDarkModeStyles = () => {
    const navBar = document.querySelector('nav');
    navBar.classList.toggle('navbar-light');
    navBar.classList.toggle('navbar-dark');
    navBar.classList.toggle('bg-dark');
    navBar.classList.toggle('bg-light');

    document.body.classList.toggle('dark-theme');
};

