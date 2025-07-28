// Simple analytics utility for production tracking
interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  timestamp?: number;
}

class Analytics {
  private isDev = import.meta.env.DEV;
  private events: AnalyticsEvent[] = [];

  track(eventName: string, properties?: Record<string, any>) {
    const event: AnalyticsEvent = {
      name: eventName,
      properties,
      timestamp: Date.now(),
    };

    if (this.isDev) {
      console.log('📊 Analytics Event:', event);
    } else {
      this.events.push(event);
      // In production, you would send this to your analytics service
      // Example: sendToAnalytics(event);
    }
  }

  identify(userId: string, traits?: Record<string, any>) {
    this.track('user_identified', { userId, ...traits });
  }

  page(pageName: string, properties?: Record<string, any>) {
    this.track('page_view', { page: pageName, ...properties });
  }

  // Get stored events (useful for debugging or batch sending)
  getEvents() {
    return this.events;
  }

  // Clear stored events
  clearEvents() {
    this.events = [];
  }
}

export const analytics = new Analytics();

// Hook for React components
export const useAnalytics = () => {
  return {
    track: analytics.track.bind(analytics),
    identify: analytics.identify.bind(analytics),
    page: analytics.page.bind(analytics),
  };
};