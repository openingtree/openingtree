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

export const toggleBoardTheme = () => {

}

export const togglePieceSet = () => {
    
}

setPieceSet = (newPieceSet) => {
    let root = document.documentElement.style
    let currentPieceSet = root.getProperty("--piece-set");
    if (currentPieceSet === newPieceSet) {
        return
    }

    root.setProperty("--piece-w","url()");

}
