import React, { useEffect } from 'react';
import { WifiOff, Wifi } from 'lucide-react';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { useToast } from '@/components/ui/use-toast';

export const NetworkStatus: React.FC = () => {
  const { isOnline, wasOffline } = useNetworkStatus();
  const { toast } = useToast();

  useEffect(() => {
    if (!isOnline) {
      toast({
        title: "No internet connection",
        description: "You're currently offline. Some features may not work.",
        variant: "destructive",
        duration: Infinity,
      });
    } else if (wasOffline) {
      toast({
        title: "Connection restored",
        description: "You're back online!",
        duration: 3000,
      });
    }
  }, [isOnline, wasOffline, toast]);

  if (!isOnline) {
    return (
      <div className="fixed bottom-4 left-4 z-50 bg-destructive text-destructive-foreground px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
        <WifiOff className="w-4 h-4" />
        <span className="text-sm">Offline</span>
      </div>
    );
  }

  return null;
};

export default NetworkStatus;