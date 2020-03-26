import ReactGA from 'react-ga';
ReactGA.initialize('UA-159149755-1');

export function trackPageView() {
    ReactGA.pageview(window.location.pathname);
}
