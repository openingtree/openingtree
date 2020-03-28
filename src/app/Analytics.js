import ReactGA from 'react-ga';
ReactGA.initialize('UA-159149755-1');

export function trackPageView() {
    ReactGA.pageview(window.location.pathname);
}

export function trackEvent(category, action, label, value) {
    ReactGA.event({
        category: category,
        action: action,
        label: label,
        value: value
      })
}