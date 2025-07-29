import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle, Activity, Globe, Database, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SystemHealth {
  database: 'healthy' | 'warning' | 'error';
  crawler: 'healthy' | 'warning' | 'error';
  sites: number;
  lastCheck: string;
}

const BotSystemStatus: React.FC = () => {
  const [health, setHealth] = useState<SystemHealth>({
    database: 'healthy',
    crawler: 'healthy',
    sites: 0,
    lastCheck: new Date().toISOString()
  });
  const [isChecking, setIsChecking] = useState(false);

  const checkSystemHealth = async () => {
    setIsChecking(true);
    try {
      // Check database connectivity
      const { data: sites, error: dbError } = await supabase
        .from('bot_sites')
        .select('id')
        .eq('status', 'active');

      // Check crawler function with simple ping
      let crawlerStatus: 'healthy' | 'warning' | 'error' = 'healthy';
      try {
        const { data: crawlerTest, error: crawlerError } = await supabase.functions.invoke('custom-crawler', {
          body: {
            action: 'test_selectors',
            url: 'https://httpbin.org/html',
            selectors: { title: 'title' }
          }
        });
        
        // Check if the function is responsive (even if it returns an error due to environment constraints)
        if (crawlerError && crawlerError.message?.includes('PermissionDenied')) {
          crawlerStatus = 'warning'; // Function is running but has environment constraints
        } else if (crawlerError) {
          crawlerStatus = 'error';
        }
      } catch (error) {
        console.error('Crawler test failed:', error);
        crawlerStatus = 'error';
      }

      setHealth({
        database: dbError ? 'error' : 'healthy',
        crawler: crawlerStatus,
        sites: sites?.length || 0,
        lastCheck: new Date().toISOString()
      });

      toast.success("System health check completed");
    } catch (error) {
      console.error('Health check failed:', error);
      toast.error("Health check failed");
      setHealth(prev => ({
        ...prev,
        database: 'error',
        crawler: 'error',
        lastCheck: new Date().toISOString()
      }));
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkSystemHealth();
  }, []);

  const getStatusIcon = (status: 'healthy' | 'warning' | 'error') => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusColor = (status: 'healthy' | 'warning' | 'error') => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'error':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Bot System Status
        </CardTitle>
        <CardDescription>
          Real-time monitoring of the bot system health and connectivity
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Button 
            onClick={checkSystemHealth} 
            disabled={isChecking}
            variant="outline"
            size="sm"
          >
            <Zap className="h-4 w-4 mr-2" />
            {isChecking ? 'Checking...' : 'Run Health Check'}
          </Button>
          <span className="text-sm text-muted-foreground">
            Last check: {new Date(health.lastCheck).toLocaleTimeString()}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              <span className="text-sm font-medium">Database</span>
            </div>
            <div className="flex items-center gap-2">
              {getStatusIcon(health.database)}
              <Badge className={getStatusColor(health.database)}>
                {health.database}
              </Badge>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              <span className="text-sm font-medium">Crawler</span>
            </div>
            <div className="flex items-center gap-2">
              {getStatusIcon(health.crawler)}
              <Badge className={getStatusColor(health.crawler)}>
                {health.crawler}
              </Badge>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              <span className="text-sm font-medium">Active Sites</span>
            </div>
            <Badge variant="secondary">
              {health.sites} sites
            </Badge>
          </div>
        </div>

        <div className="p-4 bg-muted rounded-lg">
          <h4 className="text-sm font-medium mb-2">System Features</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>✅ Custom Puppeteer-based web crawler</li>
            <li>✅ Real-time price and stock monitoring</li>
            <li>✅ Multi-site product search</li>
            <li>✅ Automated alert system</li>
            <li>✅ User authentication and personalization</li>
            <li>✅ Guest access for basic features</li>
            <li>✅ Configurable site selectors</li>
            <li>✅ Rate limiting and anti-detection</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default BotSystemStatus;