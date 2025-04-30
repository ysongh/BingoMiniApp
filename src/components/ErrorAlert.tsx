import { X, AlertTriangle } from 'lucide-react';

interface ErrorAlertProps {
  message: string;
  title?: string;
  onClose?: () => void;
  variant?: 'default' | 'destructive';
  className?: string;
}

export default function ErrorAlert({
  message,
  title = 'Error',
  onClose,
  variant = 'destructive',
  className = '',
}: ErrorAlertProps) {
  const colorClasses = {
    default: 'bg-red-50 text-red-800 border-red-300',
    destructive: 'bg-red-100 text-red-900 border-red-500',
  };

  return (
    <div className={`rounded-md border p-4 mb-4 ${colorClasses[variant]} ${className}`} role="alert">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <AlertTriangle className="h-5 w-5 text-red-500" />
        </div>
        <div className="ml-3 flex-1">
          {title && <h3 className="text-sm font-medium">{title}</h3>}
          <div className="text-sm mt-1">{message}</div>
        </div>
        {onClose && (
          <button
            type="button"
            className="ml-auto -mx-1.5 -my-1.5 bg-red-50 text-red-500 rounded-md p-1.5 inline-flex items-center justify-center hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            onClick={onClose}
            aria-label="Close"
          >
            <span className="sr-only">Close</span>
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}