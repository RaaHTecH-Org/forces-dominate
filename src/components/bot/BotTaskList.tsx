import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Progress } from '@/components/ui/progress';
import { Clock, CheckCircle, XCircle, Loader2, ShoppingCart, CreditCard, Monitor, Search, MoreHorizontal } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface BotTask {
  id: string;
  task_type: string;
  status: string;
  config: any;
  result: any;
  scheduled_at: string;
  started_at: string;
  completed_at: string;
  created_at: string;
  bot_monitors: {
    product_name: string;
    product_url: string;
  };
}

interface BotTaskListProps {
  onStatsUpdate: () => void;
}

const getTaskIcon = (taskType: string) => {
  switch (taskType) {
    case 'atc':
      return <ShoppingCart className="h-4 w-4" />;
    case 'checkout':
      return <CreditCard className="h-4 w-4" />;
    case 'monitor':
      return <Monitor className="h-4 w-4" />;
    case 'search':
      return <Search className="h-4 w-4" />;
    default:
      return <MoreHorizontal className="h-4 w-4" />;
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed':
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    case 'failed':
      return <XCircle className="h-4 w-4 text-red-600" />;
    case 'running':
      return <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />;
    case 'pending':
    default:
      return <Clock className="h-4 w-4 text-orange-600" />;
  }
};

const getStatusVariant = (status: string) => {
  switch (status) {
    case 'completed':
      return 'default';
    case 'failed':
      return 'destructive';
    case 'running':
      return 'secondary';
    case 'pending':
    default:
      return 'outline';
  }
};

const getTaskProgress = (task: BotTask) => {
  switch (task.status) {
    case 'completed':
      return 100;
    case 'failed':
      return 0;
    case 'running':
      return 50;
    case 'pending':
    default:
      return 10;
  }
};

export const BotTaskList: React.FC<BotTaskListProps> = ({ onStatsUpdate }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tasks, setTasks] = useState<BotTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed' | 'failed'>('all');

  useEffect(() => {
    if (user) {
      loadTasks();
      setupRealtimeSubscription();
    }
  }, [user, filter]);

  const loadTasks = async () => {
    try {
      let query = supabase
        .from('bot_tasks')
        .select(`
          *,
          bot_monitors (
            product_name,
            product_url
          )
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setTasks(data || []);
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('bot_tasks_changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'bot_tasks', filter: `user_id=eq.${user?.id}` },
        () => {
          loadTasks();
          onStatsUpdate();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const retryTask = async (taskId: string) => {
    try {
      // This is a simplified retry - in a real implementation, 
      // you'd want to recreate the task based on its original config
      toast({
        title: "Retry Task",
        description: "Task retry functionality would be implemented here",
      });
    } catch (error) {
      console.error('Error retrying task:', error);
    }
  };

  const taskCounts = {
    all: tasks.length,
    pending: tasks.filter(t => ['pending', 'running'].includes(t.status)).length,
    completed: tasks.filter(t => t.status === 'completed').length,
    failed: tasks.filter(t => t.status === 'failed').length
  };

  if (isLoading) {
    return <div className="text-center py-4">Loading tasks...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Filter Buttons */}
      <div className="flex items-center gap-2 flex-wrap">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('all')}
        >
          All Tasks ({taskCounts.all})
        </Button>
        <Button
          variant={filter === 'pending' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('pending')}
        >
          <Clock className="h-3 w-3 mr-1" />
          Active ({taskCounts.pending})
        </Button>
        <Button
          variant={filter === 'completed' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('completed')}
        >
          <CheckCircle className="h-3 w-3 mr-1" />
          Completed ({taskCounts.completed})
        </Button>
        <Button
          variant={filter === 'failed' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('failed')}
        >
          <XCircle className="h-3 w-3 mr-1" />
          Failed ({taskCounts.failed})
        </Button>
      </div>

      {/* Tasks List */}
      {tasks.length === 0 ? (
        <div className="text-center py-8">
          <MoreHorizontal className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            {filter === 'all' ? 'No tasks yet' : `No ${filter} tasks`}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Tasks will appear here when you use bot features
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => (
            <Card key={task.id} className="border-l-4 border-l-primary">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="mt-1">
                      {getTaskIcon(task.task_type)}
                    </div>
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant={getStatusVariant(task.status)} className="flex items-center gap-1">
                          {getStatusIcon(task.status)}
                          {task.status}
                        </Badge>
                        <Badge variant="outline">
                          {task.task_type.toUpperCase()}
                        </Badge>
                      </div>

                      <h3 className="font-medium line-clamp-1">
                        {task.bot_monitors?.product_name || 'Bot Task'}
                      </h3>

                      {/* Progress Bar */}
                      <Progress value={getTaskProgress(task)} className="h-2" />

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs text-muted-foreground">
                        <div>
                          Created: {formatDistanceToNow(new Date(task.created_at))} ago
                        </div>
                        {task.started_at && (
                          <div>
                            Started: {formatDistanceToNow(new Date(task.started_at))} ago
                          </div>
                        )}
                        {task.completed_at && (
                          <div>
                            Completed: {formatDistanceToNow(new Date(task.completed_at))} ago
                          </div>
                        )}
                      </div>

                      {/* Task Result/Message */}
                      {task.result && (
                        <div className="mt-2 p-2 bg-muted rounded text-xs">
                          <div className="font-medium">
                            {task.result.success ? '✅' : '❌'} {task.result.message}
                          </div>
                          {task.config && (
                            <div className="mt-1 opacity-70">
                              Config: {JSON.stringify(task.config, null, 0).substring(0, 100)}...
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 ml-2">
                    {task.status === 'failed' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => retryTask(task.id)}
                      >
                        Retry
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};