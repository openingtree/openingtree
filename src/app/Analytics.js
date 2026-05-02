import ReactGA from 'react-ga4';

/**
 * Initializes GA4 and sets persistent parameters correctly for version 2.1.0
 */
export function initializeAnalytics(segment, darkMode, openingBookType) {
  ReactGA.initialize('G-47BSVW3S7F', {
    // gtagOptions sends these parameters directly to the 'config' command
    // this ensures they are attached to the very first pageview hit.
    gtagOptions: {
      user_segment: segment,
      dark_mode: darkMode,
      opening_book: openingBookType
    }
  });

  // This ensures any hits sent AFTER initialization also carry these values
  ReactGA.set({
    user_segment: segment,
    dark_mode: darkMode,
    opening_book: openingBookType
  });
}

/**
 * Tracks a pageview. 
 */
export function trackPageView() {
  ReactGA.send({ 
    hitType: 'pageview', 
    page: window.location.pathname + window.location.search 
  });
}

/**
 * Tracks custom events.
 * Note: react-ga4 maps 'category' to 'event_category' automatically.
 */
export function trackEvent(category, action, label, value, nonInteraction) {
  ReactGA.event({
    category: category,
    action: action,
    label: label,
    value: value,
    nonInteraction: nonInteraction
  });
}