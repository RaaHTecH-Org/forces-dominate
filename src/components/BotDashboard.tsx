import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BotSiteSearch } from './bot/BotSiteSearch';
import { BotMonitorList } from './bot/BotMonitorList';
import { BotAlerts } from './bot/BotAlerts';
import { BotTaskList } from './bot/BotTaskList';
import { CustomSiteBuilder } from './bot/CustomSiteBuilder';
import { Bot, Search, Monitor, ShoppingCart, CreditCard, Bell, Activity, Settings } from 'lucide-react';

interface BotStats {
  total_monitors: number;
  active_monitors: number;
  total_alerts: number;
  unread_alerts: number;
  completed_tasks: number;
  pending_tasks: number;
}

export const BotDashboard: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState<BotStats>({
    total_monitors: 0,
    active_monitors: 0,
    total_alerts: 0,
    unread_alerts: 0,
    completed_tasks: 0,
    pending_tasks: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadStats();
      setupRealtimeSubscriptions();
    }
  }, [user]);

  const loadStats = async () => {
    try {
      const [monitorsRes, alertsRes, tasksRes] = await Promise.all([
        supabase.from('bot_monitors').select('id, is_active').eq('user_id', user?.id),
        supabase.from('bot_alerts').select('id, is_read').eq('user_id', user?.id),
        supabase.from('bot_tasks').select('id, status').eq('user_id', user?.id)
      ]);

      const monitors = monitorsRes.data || [];
      const alerts = alertsRes.data || [];
      const tasks = tasksRes.data || [];

      setStats({
        total_monitors: monitors.length,
        active_monitors: monitors.filter(m => m.is_active).length,
        total_alerts: alerts.length,
        unread_alerts: alerts.filter(a => !a.is_read).length,
        completed_tasks: tasks.filter(t => t.status === 'completed').length,
        pending_tasks: tasks.filter(t => ['pending', 'running'].includes(t.status)).length
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setupRealtimeSubscriptions = () => {
    const alertsChannel = supabase
      .channel('bot_alerts_changes')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'bot_alerts', filter: `user_id=eq.${user?.id}` },
        (payload) => {
          toast({
            title: "New Alert!",
            description: payload.new.message,
          });
          loadStats();
        }
      )
      .subscribe();

    const tasksChannel = supabase
      .channel('bot_tasks_changes')
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'bot_tasks', filter: `user_id=eq.${user?.id}` },
        () => loadStats()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(alertsChannel);
      supabase.removeChannel(tasksChannel);
    };
  };

  const runGlobalMonitor = async () => {
    try {
      setIsLoading(true);
      toast({
        title: "Starting Monitor Check",
        description: "Checking all active monitors for updates...",
      });

      const { data, error } = await supabase.functions.invoke('bot-monitor', {
        body: { action: 'check_all_monitors' }
      });

      if (error) throw error;

      toast({
        title: "Monitor Check Complete",
        description: `Checked ${data.monitors_checked} monitors, generated ${data.alerts_generated} alerts`,
      });

      loadStats();
    } catch (error) {
      console.error('Error running global monitor:', error);
      toast({
        title: "Error",
        description: "Failed to run monitor check",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-muted-foreground">Please log in to access the bot dashboard.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Bot className="h-8 w-8 text-primary" />
            Target Bot Dashboard
          </h1>
          <p className="text-muted-foreground">Monitor products across all major e-commerce sites</p>
        </div>
        <Button onClick={runGlobalMonitor} disabled={isLoading}>
          <Activity className="h-4 w-4 mr-2" />
          {isLoading ? 'Checking...' : 'Check All Monitors'}
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Monitors</CardTitle>
            <Monitor className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active_monitors}</div>
            <p className="text-xs text-muted-foreground">of {stats.total_monitors} total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unread Alerts</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.unread_alerts}</div>
            <p className="text-xs text-muted-foreground">of {stats.total_alerts} total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.pending_tasks}</div>
            <p className="text-xs text-muted-foreground">{stats.completed_tasks} completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bot Status</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <Badge variant={stats.active_monitors > 0 ? "default" : "secondary"}>
                {stats.active_monitors > 0 ? "Active" : "Idle"}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">Real-time monitoring</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Tabs */}
      <Tabs defaultValue="search" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="search" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Search
          </TabsTrigger>
          <TabsTrigger value="monitors" className="flex items-center gap-2">
            <Monitor className="h-4 w-4" />
            Monitors
          </TabsTrigger>
          <TabsTrigger value="alerts" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Alerts
          </TabsTrigger>
          <TabsTrigger value="tasks" className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            Tasks
          </TabsTrigger>
          <TabsTrigger value="sites" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Sites
          </TabsTrigger>
          <TabsTrigger value="checkout" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Checkout
          </TabsTrigger>
        </TabsList>

        <TabsContent value="search" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Product Search</CardTitle>
              <CardDescription>
                Search for products across all supported e-commerce sites
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BotSiteSearch onStatsUpdate={loadStats} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Monitors</CardTitle>
              <CardDescription>
                Track price changes and stock availability
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BotMonitorList onStatsUpdate={loadStats} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Alerts & Notifications</CardTitle>
              <CardDescription>
                Price drops, stock alerts, and bot notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BotAlerts onStatsUpdate={loadStats} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Bot Tasks</CardTitle>
              <CardDescription>
                ATC attempts, monitoring runs, and automated actions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BotTaskList onStatsUpdate={loadStats} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sites" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Site Management</CardTitle>
              <CardDescription>
                Configure custom sites and manage scraping configurations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CustomSiteBuilder onSiteAdded={loadStats} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="checkout" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Quick Checkout</CardTitle>
              <CardDescription>
                Fast checkout for monitored products
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Select a monitored product to enable quick checkout
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};