export const handleDarkMode = (darkMode) => {
    const darkModeThemeIsCurrentlySet = document.body.classList.contains('dark-theme');
    if (darkMode !== darkModeThemeIsCurrentlySet) {
        document.body.classList.toggle('dark-theme');
    }
};
export const logoName = (darkMode) => {
    return darkMode? 'opening-tree-logo-white.png':'opening-tree-logo.png'
}
export const rowContentColor = (darkMode) => {
    return darkMode ? 'white' : 'grey'
}
