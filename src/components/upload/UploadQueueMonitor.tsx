import React, { useEffect } from 'react';
import { useUploadQueue } from '@/hooks/useUploadQueue';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Upload,
  Pause,
  Play,
  X,
  RotateCcw,
  MoreVertical,
  CheckCircle,
  AlertCircle,
  Clock,
  Loader2,
  ChevronUp,
  ChevronDown,
  Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

interface UploadQueueMonitorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  minimized?: boolean;
  onMinimize?: () => void;
}

export const UploadQueueMonitor: React.FC<UploadQueueMonitorProps> = ({
  open,
  onOpenChange,
  minimized = false,
  onMinimize
}) => {
  const {
    queueState,
    removeFromQueue,
    clearQueue,
    pauseQueue,
    resumeQueue,
    retryItem,
    updatePriority,
    setConcurrentLimit,
    getQueueStats,
    setShowMonitor
  } = useUploadQueue();

  const stats = getQueueStats();
  const hasActiveUploads = stats.uploading > 0 || stats.processing > 0;

  // 큐가 비어있고 모든 작업이 완료되면 모니터 숨기기
  useEffect(() => {
    if (stats.total === 0) {
      setShowMonitor(false);
    }
  }, [stats.total, setShowMonitor]);

  // 상태별 아이콘 가져오기
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'waiting':
        return <Clock className="h-4 w-4 text-gray-500" />;
      case 'uploading':
      case 'processing':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'paused':
        return <Pause className="h-4 w-4 text-yellow-500" />;
      default:
        return null;
    }
  };

  // 상태별 배지 색상
  const getStatusBadgeVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'failed':
        return 'destructive';
      case 'waiting':
      case 'paused':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  // 파일 크기 포맷
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // 미니 뷰
  if (minimized && stats.total > 0) {
    return (
      <Card className="fixed bottom-4 right-4 w-80 shadow-lg z-50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              <CardTitle className="text-sm">업로드 진행 중</CardTitle>
            </div>
            <div className="flex items-center gap-1">
              {queueState.isPaused ? (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => resumeQueue()}
                  className="h-8 w-8 p-0"
                >
                  <Play className="h-4 w-4" />
                </Button>
              ) : hasActiveUploads && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => pauseQueue()}
                  className="h-8 w-8 p-0"
                >
                  <Pause className="h-4 w-4" />
                </Button>
              )}
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onOpenChange(true)}
                className="h-8 w-8 p-0"
              >
                <ChevronUp className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => clearQueue()}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pb-3">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">전체 진행률</span>
              <span>{Math.round((stats.completed / stats.total) * 100)}%</span>
            </div>
            <Progress value={(stats.completed / stats.total) * 100} className="h-2" />
            <div className="flex gap-2 text-xs">
              {stats.uploading > 0 && (
                <Badge variant="outline" className="text-xs">
                  업로드 중 {stats.uploading}
                </Badge>
              )}
              {stats.waiting > 0 && (
                <Badge variant="secondary" className="text-xs">
                  대기 중 {stats.waiting}
                </Badge>
              )}
              {stats.failed > 0 && (
                <Badge variant="destructive" className="text-xs">
                  실패 {stats.failed}
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // 전체 뷰
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              <DialogTitle>업로드 큐 관리</DialogTitle>
            </div>
            <div className="flex items-center gap-2">
              {/* 동시 업로드 설정 */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" variant="ghost">
                    <Settings className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <div className="px-2 py-1.5 text-sm font-semibold">
                    동시 업로드 수: {queueState.concurrentLimit}
                  </div>
                  {[1, 2, 3, 5, 10].map(limit => (
                    <DropdownMenuItem
                      key={limit}
                      onClick={() => setConcurrentLimit(limit)}
                      className={cn(
                        queueState.concurrentLimit === limit && "bg-accent"
                      )}
                    >
                      {limit}개
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* 일시정지/재개 버튼 */}
              {queueState.isPaused ? (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => resumeQueue()}
                >
                  <Play className="h-4 w-4 mr-1" />
                  재개
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => pauseQueue()}
                  disabled={!hasActiveUploads}
                >
                  <Pause className="h-4 w-4 mr-1" />
                  일시정지
                </Button>
              )}

              {/* 전체 삭제 */}
              <Button
                size="sm"
                variant="outline"
                onClick={() => clearQueue()}
                disabled={stats.total === 0}
              >
                전체 삭제
              </Button>

              {/* 최소화 */}
              {onMinimize && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    onMinimize();
                    onOpenChange(false);
                  }}
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
          <DialogDescription>
            총 {stats.total}개 파일 • 업로드 중 {stats.uploading}개 • 대기 중 {stats.waiting}개
          </DialogDescription>
        </DialogHeader>

        {/* 통계 요약 */}
        {stats.total > 0 && (
          <div className="grid grid-cols-6 gap-2 py-2">
            <Card className="p-3 text-center">
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-xs text-muted-foreground">전체</div>
            </Card>
            <Card className="p-3 text-center">
              <div className="text-2xl font-bold text-gray-500">{stats.waiting}</div>
              <div className="text-xs text-muted-foreground">대기 중</div>
            </Card>
            <Card className="p-3 text-center">
              <div className="text-2xl font-bold text-blue-500">{stats.uploading}</div>
              <div className="text-xs text-muted-foreground">업로드 중</div>
            </Card>
            <Card className="p-3 text-center">
              <div className="text-2xl font-bold text-blue-500">{stats.processing}</div>
              <div className="text-xs text-muted-foreground">처리 중</div>
            </Card>
            <Card className="p-3 text-center">
              <div className="text-2xl font-bold text-green-500">{stats.completed}</div>
              <div className="text-xs text-muted-foreground">완료</div>
            </Card>
            <Card className="p-3 text-center">
              <div className="text-2xl font-bold text-red-500">{stats.failed}</div>
              <div className="text-xs text-muted-foreground">실패</div>
            </Card>
          </div>
        )}

        {/* 큐 아이템 목록 */}
        <ScrollArea className="h-[400px] w-full rounded-md border">
          {queueState.items.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              업로드 대기 중인 파일이 없습니다.
            </div>
          ) : (
            <div className="p-4 space-y-2">
              {queueState.items
                .sort((a, b) => {
                  // 우선순위순 정렬, 같으면 생성시간순
                  if (a.priority !== b.priority) {
                    return a.priority - b.priority;
                  }
                  return a.createdAt.getTime() - b.createdAt.getTime();
                })
                .map((item) => (
                  <Card key={item.id} className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        {getStatusIcon(item.status)}
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm truncate max-w-xs">
                              {item.file.name}
                            </span>
                            <Badge variant={getStatusBadgeVariant(item.status)} className="text-xs">
                              {item.status === 'waiting' && '대기 중'}
                              {item.status === 'uploading' && '업로드 중'}
                              {item.status === 'processing' && '처리 중'}
                              {item.status === 'completed' && '완료'}
                              {item.status === 'failed' && '실패'}
                              {item.status === 'paused' && '일시정지'}
                            </Badge>
                            {item.priority !== 5 && (
                              <Badge variant="outline" className="text-xs">
                                우선순위 {item.priority}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>{formatFileSize(item.file.size)}</span>
                            <span>•</span>
                            <span>
                              {formatDistanceToNow(item.createdAt, {
                                addSuffix: true,
                                locale: ko
                              })}
                            </span>
                            {item.retryCount > 0 && (
                              <>
                                <span>•</span>
                                <span className="text-yellow-600">
                                  재시도 {item.retryCount}/{item.maxRetries}
                                </span>
                              </>
                            )}
                          </div>
                          {(item.status === 'uploading' || item.status === 'processing') && (
                            <Progress value={item.progress} className="h-1.5 mt-2" />
                          )}
                          {item.error && (
                            <div className="text-xs text-red-500 mt-1">
                              {item.error}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* 액션 메뉴 */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {item.status === 'failed' && (
                            <DropdownMenuItem onClick={() => retryItem(item.id)}>
                              <RotateCcw className="h-4 w-4 mr-2" />
                              재시도
                            </DropdownMenuItem>
                          )}
                          {item.status === 'waiting' && (
                            <>
                              <DropdownMenuItem onClick={() => updatePriority(item.id, 1)}>
                                <ChevronUp className="h-4 w-4 mr-2" />
                                우선순위 높이기
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => updatePriority(item.id, 10)}>
                                <ChevronDown className="h-4 w-4 mr-2" />
                                우선순위 낮추기
                              </DropdownMenuItem>
                            </>
                          )}
                          <DropdownMenuItem
                            onClick={() => removeFromQueue(item.id)}
                            className="text-red-600"
                          >
                            <X className="h-4 w-4 mr-2" />
                            삭제
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </Card>
                ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};