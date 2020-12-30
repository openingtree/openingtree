import ReactGA from 'react-ga';

export function initializeAnalytics (segment, darkMode, openingBookType){
    ReactGA.initialize('UA-159149755-1');
    ReactGA.set({ dimension2: segment, 
        dimension1: darkMode,  
        dimension3: openingBookType
    });

}
export function trackPageView() {
    ReactGA.pageview(window.location.pathname);
}

export function trackEvent(category, action, label, value, nonInteraction) {
    ReactGA.event({
        category: category,
        action: action,
        label: label,
        value: value,
        nonInteraction:nonInteraction
      })
}

