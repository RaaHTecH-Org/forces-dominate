import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { analytics } from '@/lib/analytics';

export const usePageTracking = () => {
  const location = useLocation();

  useEffect(() => {
    // Track page views
    analytics.page(location.pathname, {
      search: location.search,
      hash: location.hash,
    });
  }, [location]);
};