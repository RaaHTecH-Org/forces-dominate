import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, XCircle, Info, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ErrorMessageProps {
  error: string | null;
  type?: 'error' | 'warning' | 'info' | 'success';
  className?: string;
  onDismiss?: () => void;
}

const typeConfig = {
  error: {
    icon: XCircle,
    className: 'border-destructive/20 bg-destructive/10 text-destructive',
  },
  warning: {
    icon: AlertTriangle,
    className: 'border-orange-200 bg-orange-50 text-orange-800 dark:border-orange-900 dark:bg-orange-950 dark:text-orange-200',
  },
  info: {
    icon: Info,
    className: 'border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-200',
  },
  success: {
    icon: CheckCircle,
    className: 'border-green-200 bg-green-50 text-green-800 dark:border-green-900 dark:bg-green-950 dark:text-green-200',
  },
};

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ 
  error, 
  type = 'error',
  className,
  onDismiss 
}) => {
  if (!error) return null;

  const { icon: Icon, className: typeClassName } = typeConfig[type];

  return (
    <Alert className={cn(typeClassName, className)}>
      <Icon className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <span>{error}</span>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="ml-2 opacity-70 hover:opacity-100 transition-opacity"
            aria-label="Dismiss"
          >
            <XCircle className="h-4 w-4" />
          </button>
        )}
      </AlertDescription>
    </Alert>
  );
};
