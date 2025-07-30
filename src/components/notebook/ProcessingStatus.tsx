import React from 'react';
import { 
  Loader2, 
  CheckCircle, 
  XCircle, 
  Upload, 
  Clock,
  AlertCircle 
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProcessingStatusProps {
  status: 'pending' | 'uploading' | 'processing' | 'completed' | 'failed';
  progress?: number;
  estimatedTimeRemaining?: number; // in seconds
  error?: string;
  className?: string;
}

const ProcessingStatus: React.FC<ProcessingStatusProps> = ({
  status,
  progress = 0,
  estimatedTimeRemaining,
  error,
  className
}) => {
  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const getStatusConfig = () => {
    switch (status) {
      case 'pending':
        return {
          icon: <Clock className="h-5 w-5" />,
          color: 'text-gray-500',
          bgColor: 'bg-gray-100',
          borderColor: 'border-gray-300',
          progressColor: 'bg-gray-400',
          label: '대기 중',
          description: '처리를 기다리고 있습니다'
        };
      case 'uploading':
        return {
          icon: <Upload className="h-5 w-5 animate-pulse" />,
          color: 'text-blue-500',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-300',
          progressColor: 'bg-blue-500',
          label: '업로드 중',
          description: '파일을 업로드하고 있습니다'
        };
      case 'processing':
        return {
          icon: <Loader2 className="h-5 w-5 animate-spin" />,
          color: 'text-orange-500',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-300',
          progressColor: 'bg-orange-500',
          label: '처리 중',
          description: '문서를 분석하고 있습니다'
        };
      case 'completed':
        return {
          icon: <CheckCircle className="h-5 w-5" />,
          color: 'text-green-500',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-300',
          progressColor: 'bg-green-500',
          label: '완료',
          description: '처리가 완료되었습니다'
        };
      case 'failed':
        return {
          icon: <XCircle className="h-5 w-5" />,
          color: 'text-red-500',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-300',
          progressColor: 'bg-red-500',
          label: '실패',
          description: error || '처리 중 오류가 발생했습니다'
        };
      default:
        return {
          icon: <AlertCircle className="h-5 w-5" />,
          color: 'text-gray-500',
          bgColor: 'bg-gray-100',
          borderColor: 'border-gray-300',
          progressColor: 'bg-gray-400',
          label: '알 수 없음',
          description: '상태를 확인할 수 없습니다'
        };
    }
  };

  const config = getStatusConfig();
  const showProgress = (status === 'uploading' || status === 'processing') && progress > 0;
  const showEstimatedTime = estimatedTimeRemaining && estimatedTimeRemaining > 0 && 
    (status === 'uploading' || status === 'processing');

  return (
    <div className={cn('space-y-2', className)}>
      {/* Status Header */}
      <div className="flex items-center gap-2">
        <div className={cn('p-1.5 rounded-full', config.bgColor, config.borderColor, 'border')}>
          <div className={config.color}>
            {config.icon}
          </div>
        </div>
        <div className="flex-1">
          <div className={cn('font-medium text-sm', config.color)}>
            {config.label}
          </div>
          <div className="text-xs text-gray-500">
            {config.description}
          </div>
        </div>
        {showProgress && (
          <div className="text-sm font-medium text-gray-700">
            {Math.round(progress)}%
          </div>
        )}
      </div>

      {/* Progress Bar */}
      {showProgress && (
        <div className="space-y-1">
          <div className="relative h-2 w-full overflow-hidden rounded-full bg-gray-200">
            <div 
              className={cn("h-full transition-all", config.progressColor)}
              style={{ width: `${progress}%` }}
            />
          </div>
          {showEstimatedTime && (
            <div className="text-xs text-gray-500 text-right">
              예상 남은 시간: {formatTime(estimatedTimeRemaining)}
            </div>
          )}
        </div>
      )}

      {/* Error Message */}
      {status === 'failed' && error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-2 mt-2">
          <p className="text-xs text-red-700">{error}</p>
        </div>
      )}
    </div>
  );
};

// Compact version for use in lists
export const ProcessingStatusIcon: React.FC<{
  status: ProcessingStatusProps['status'];
  className?: string;
}> = ({ status, className }) => {
  const getIconConfig = () => {
    switch (status) {
      case 'pending':
        return {
          icon: <Clock className="h-4 w-4" />,
          color: 'text-gray-500'
        };
      case 'uploading':
        return {
          icon: <Upload className="h-4 w-4 animate-pulse" />,
          color: 'text-blue-500'
        };
      case 'processing':
        return {
          icon: <Loader2 className="h-4 w-4 animate-spin" />,
          color: 'text-orange-500'
        };
      case 'completed':
        return {
          icon: <CheckCircle className="h-4 w-4" />,
          color: 'text-green-500'
        };
      case 'failed':
        return {
          icon: <XCircle className="h-4 w-4" />,
          color: 'text-red-500'
        };
      default:
        return {
          icon: <AlertCircle className="h-4 w-4" />,
          color: 'text-gray-500'
        };
    }
  };

  const config = getIconConfig();

  return (
    <div className={cn(config.color, className)}>
      {config.icon}
    </div>
  );
};

export default ProcessingStatus;