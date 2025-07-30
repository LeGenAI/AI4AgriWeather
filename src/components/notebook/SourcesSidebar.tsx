
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, MoreVertical, Trash2, Edit, Loader2, Tag, Wheat, Calendar, MapPin } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from '@/components/ui/context-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import AddSourcesDialog from './AddSourcesDialog';
import RenameSourceDialog from './RenameSourceDialog';
import SourceContentViewer from '@/components/chat/SourceContentViewer';
import { ProcessingStatusIcon } from './ProcessingStatus';
import { useSources } from '@/hooks/useSources';
import { useSourceDelete } from '@/hooks/useSourceDelete';
import { Citation } from '@/types/message';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import ProcessingStatus from './ProcessingStatus';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

interface SourcesSidebarProps {
  hasSource: boolean;
  notebookId?: string;
  selectedCitation?: Citation | null;
  onCitationClose?: () => void;
  setSelectedCitation?: (citation: Citation | null) => void;
}

const SourcesSidebar = ({
  hasSource,
  notebookId,
  selectedCitation,
  onCitationClose,
  setSelectedCitation
}: SourcesSidebarProps) => {
  const [showAddSourcesDialog, setShowAddSourcesDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showRenameDialog, setShowRenameDialog] = useState(false);
  const [selectedSource, setSelectedSource] = useState<any>(null);
  const [selectedSourceForViewing, setSelectedSourceForViewing] = useState<any>(null);
  const { toast } = useToast();

  const {
    sources,
    isLoading
  } = useSources(notebookId);

  const {
    deleteSource,
    isDeleting
  } = useSourceDelete();

  // Get the source content for the selected citation
  const getSourceContent = (citation: Citation) => {
    const source = sources?.find(s => s.id === citation.source_id);
    return source?.content || '';
  };

  // Get the source summary for the selected citation
  const getSourceSummary = (citation: Citation) => {
    const source = sources?.find(s => s.id === citation.source_id);
    return source?.summary || '';
  };

  // Get the source URL for the selected citation
  const getSourceUrl = (citation: Citation) => {
    const source = sources?.find(s => s.id === citation.source_id);
    return source?.url || '';
  };

  // Get the source summary for a selected source
  const getSelectedSourceSummary = () => {
    return selectedSourceForViewing?.summary || '';
  };

  // Get the source content for a selected source  
  const getSelectedSourceContent = () => {
    return selectedSourceForViewing?.content || '';
  };

  // Get the source URL for a selected source
  const getSelectedSourceUrl = () => {
    return selectedSourceForViewing?.url || '';
  };

  
  const renderSourceIcon = (type: string) => {
    const iconMap: Record<string, string> = {
      'pdf': '/file-types/PDF.svg',
      'text': '/file-types/TXT.png',
      'website': '/file-types/WEB.svg',
      'youtube': '/file-types/MP3.png',
      'audio': '/file-types/MP3.png',
      'doc': '/file-types/DOC.png',
      'multiple-websites': '/file-types/WEB.svg',
      'copied-text': '/file-types/TXT.png'
    };

    const iconUrl = iconMap[type] || iconMap['text']; // fallback to TXT icon

    return (
      <img 
        src={iconUrl} 
        alt={`${type} icon`} 
        className="w-full h-full object-contain" 
        onError={(e) => {
          // Fallback to a simple text indicator if image fails to load
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
          target.parentElement!.innerHTML = '📄';
        }} 
      />
    );
  };

  const getStatusTooltip = (status: string) => {
    switch (status) {
      case 'uploading':
        return '업로드 중';
      case 'processing':
        return '처리 중';
      case 'completed':
        return '완료';
      case 'failed':
        return '실패';
      case 'pending':
        return '대기 중';
      default:
        return '알 수 없음';
    }
  };

  const handleRemoveSource = (source: any) => {
    setSelectedSource(source);
    setShowDeleteDialog(true);
  };

  const handleRenameSource = (source: any) => {
    setSelectedSource(source);
    setShowRenameDialog(true);
  };

  const handleRetrySource = async (source: any) => {
    // TODO: Implement retry logic
    console.log('Retrying source processing:', source.id);
    toast({
      title: "재시도 중",
      description: `${source.title} 파일의 처리를 다시 시도합니다.`,
    });
  };

  const handleSourceClick = (source: any) => {
    console.log('SourcesSidebar: Source clicked from list', {
      sourceId: source.id,
      sourceTitle: source.title
    });

    // Clear any existing citation state first
    if (setSelectedCitation) {
      setSelectedCitation(null);
    }

    // Set the selected source for viewing
    setSelectedSourceForViewing(source);

    // Create a mock citation for the selected source without line data (this prevents auto-scroll)
    const mockCitation: Citation = {
      citation_id: -1, // Use negative ID to indicate this is a mock citation
      source_id: source.id,
      source_title: source.title,
      source_type: source.type,
      chunk_index: 0,
      excerpt: 'Full document view'
      // Deliberately omitting chunk_lines_from and chunk_lines_to to prevent auto-scroll
    };

    console.log('SourcesSidebar: Created mock citation', mockCitation);

    // Set the mock citation after a small delay to ensure state is clean
    setTimeout(() => {
      if (setSelectedCitation) {
        setSelectedCitation(mockCitation);
      }
    }, 50);
  };

  const handleBackToSources = () => {
    console.log('SourcesSidebar: Back to sources clicked');
    setSelectedSourceForViewing(null);
    onCitationClose?.();
  };

  const confirmDelete = () => {
    if (selectedSource) {
      deleteSource(selectedSource.id);
      setShowDeleteDialog(false);
      setSelectedSource(null);
    }
  };

  // If we have a selected citation, show the content viewer
  if (selectedCitation) {
    console.log('SourcesSidebar: Rendering content viewer for citation', {
      citationId: selectedCitation.citation_id,
      sourceId: selectedCitation.source_id,
      hasLineData: !!(selectedCitation.chunk_lines_from && selectedCitation.chunk_lines_to),
      isFromSourceList: selectedCitation.citation_id === -1
    });

    // Determine which citation to display and get appropriate content/summary/url
    const displayCitation = selectedCitation;
    const sourceContent = selectedSourceForViewing ? getSelectedSourceContent() : getSourceContent(selectedCitation);
    const sourceSummary = selectedSourceForViewing ? getSelectedSourceSummary() : getSourceSummary(selectedCitation);
    const sourceUrl = selectedSourceForViewing ? getSelectedSourceUrl() : getSourceUrl(selectedCitation);

    return (
      <div className="w-full bg-gray-50 border-r border-gray-200 flex flex-col h-full overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900 cursor-pointer hover:text-gray-700" onClick={handleBackToSources}>
              Sources
            </h2>
            <Button variant="ghost" onClick={handleBackToSources} className="p-2 [&_svg]:!w-6 [&_svg]:!h-6">
              <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor">
                <path d="M440-440v240h-80v-160H200v-80h240Zm160-320v160h160v80H520v-240h80Z" />
              </svg>
            </Button>
          </div>
        </div>
        
        <SourceContentViewer 
          citation={displayCitation} 
          sourceContent={sourceContent} 
          sourceSummary={sourceSummary}
          sourceUrl={sourceUrl}
          className="flex-1 overflow-hidden" 
          isOpenedFromSourceList={selectedCitation.citation_id === -1}
        />
      </div>
    );
  }

  return (
    <div className="w-full bg-gray-50 border-r border-gray-200 flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-900">Sources</h2>
        </div>
        
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" className="flex-1" onClick={() => setShowAddSourcesDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1 h-full">
        <div className="p-4">
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-sm text-gray-600">Loading sources...</p>
            </div>
          ) : sources && sources.length > 0 ? (
            <div className="space-y-4">
              {/* Processing files summary */}
              {sources.some(s => s.processing_status === 'uploading' || s.processing_status === 'processing') && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                  <div className="flex items-center gap-2 text-sm text-blue-700">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="font-medium">
                      {sources.filter(s => s.processing_status === 'uploading' || s.processing_status === 'processing').length}개 파일 처리 중
                    </span>
                  </div>
                </div>
              )}
              
              {/* Sort sources - processing files first */}
              {[...sources].sort((a, b) => {
                // Priority order: uploading/processing > failed > pending > completed
                const statusPriority: Record<string, number> = {
                  'uploading': 0,
                  'processing': 1,
                  'failed': 2,
                  'pending': 3,
                  'completed': 4
                };
                
                const aPriority = statusPriority[a.processing_status] ?? 5;
                const bPriority = statusPriority[b.processing_status] ?? 5;
                
                return aPriority - bPriority;
              }).map((source) => (
                <ContextMenu key={source.id}>
                  <ContextMenuTrigger>
                    <Card 
                      className={`p-3 border cursor-pointer transition-all ${
                        source.processing_status === 'uploading' || source.processing_status === 'processing'
                          ? 'border-blue-200 bg-blue-50/30 hover:bg-blue-50/50'
                          : source.processing_status === 'failed'
                          ? 'border-red-200 bg-red-50/30 hover:bg-red-50/50'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`} 
                      onClick={() => handleSourceClick(source)}>
                      <div className="flex items-start justify-between space-x-3">
                        <div className="flex items-center space-x-2 flex-1 min-w-0">
                          <div className="w-6 h-6 bg-white rounded border border-gray-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
                            {renderSourceIcon(source.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-sm text-gray-900 truncate block">{source.title}</span>
                            {/* 분류 정보 표시 */}
                            {source.metadata?.classification && (
                              <div className="mt-1 flex flex-wrap gap-1">
                                {/* 카테고리 */}
                                {source.metadata.classification.category && (
                                  <Badge variant="secondary" className="text-xs py-0 h-5">
                                    <Tag className="h-3 w-3 mr-1" />
                                    {source.metadata.classification.category}
                                  </Badge>
                                )}
                                {/* 주요 작물 (최대 2개) */}
                                {source.metadata.classification.crops?.slice(0, 2).map((crop: string) => (
                                  <Badge key={crop} variant="outline" className="text-xs py-0 h-5">
                                    <Wheat className="h-3 w-3 mr-1" />
                                    {crop}
                                  </Badge>
                                ))}
                                {/* 계절 정보 */}
                                {source.metadata.classification.seasons?.length > 0 && (
                                  <Badge variant="outline" className="text-xs py-0 h-5">
                                    <Calendar className="h-3 w-3 mr-1" />
                                    {source.metadata.classification.seasons[0]}
                                  </Badge>
                                )}
                                {/* 더 많은 분류가 있을 경우 */}
                                {((source.metadata.classification.crops?.length > 2) || 
                                  (source.metadata.classification.activities?.length > 0) ||
                                  (source.metadata.classification.regions?.length > 0)) && (
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger>
                                        <Badge variant="outline" className="text-xs py-0 h-5">+더보기</Badge>
                                      </TooltipTrigger>
                                      <TooltipContent className="max-w-sm">
                                        <div className="space-y-2 text-sm">
                                          {source.metadata.classification.crops?.length > 2 && (
                                            <div>
                                              <strong>작물:</strong> {source.metadata.classification.crops.join(', ')}
                                            </div>
                                          )}
                                          {source.metadata.classification.activities?.length > 0 && (
                                            <div>
                                              <strong>활동:</strong> {source.metadata.classification.activities.join(', ')}
                                            </div>
                                          )}
                                          {source.metadata.classification.regions?.length > 0 && (
                                            <div>
                                              <strong>지역:</strong> {source.metadata.classification.regions.join(', ')}
                                            </div>
                                          )}
                                          <div>
                                            <strong>신뢰도:</strong> {(source.metadata.classification.confidence * 100).toFixed(0)}%
                                          </div>
                                        </div>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex-shrink-0 py-[4px]">
                          {(source.processing_status === 'uploading' || source.processing_status === 'processing') ? (
                            <Popover>
                              <PopoverTrigger asChild>
                                <button className="focus:outline-none">
                                  <ProcessingStatusIcon status={source.processing_status} />
                                </button>
                              </PopoverTrigger>
                              <PopoverContent className="w-80" align="end">
                                <ProcessingStatus 
                                  status={source.processing_status}
                                  progress={source.uploadProgress?.progress || 0}
                                  estimatedTimeRemaining={source.uploadProgress?.estimatedTimeRemaining}
                                  error={source.uploadProgress?.error}
                                />
                              </PopoverContent>
                            </Popover>
                          ) : (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div>
                                    <ProcessingStatusIcon status={source.processing_status} />
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{getStatusTooltip(source.processing_status)}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </div>
                      </div>
                    </Card>
                  </ContextMenuTrigger>
                  <ContextMenuContent>
                    {source.processing_status === 'failed' && (
                      <ContextMenuItem onClick={() => handleRetrySource(source)} className="text-blue-600 focus:text-blue-600">
                        <Loader2 className="h-4 w-4 mr-2" />
                        Retry processing
                      </ContextMenuItem>
                    )}
                    <ContextMenuItem onClick={() => handleRenameSource(source)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Rename source
                    </ContextMenuItem>
                    <ContextMenuItem onClick={() => handleRemoveSource(source)} className="text-red-600 focus:text-red-600">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remove source
                    </ContextMenuItem>
                  </ContextMenuContent>
                </ContextMenu>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-200 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <span className="text-gray-400 text-2xl">📄</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Saved sources will appear here</h3>
              <p className="text-sm text-gray-600 mb-4">Click Add source above to add PDFs, text, or audio files.</p>
            </div>
          )}
        </div>
      </ScrollArea>

      <AddSourcesDialog 
        open={showAddSourcesDialog} 
        onOpenChange={setShowAddSourcesDialog} 
        notebookId={notebookId} 
      />

      <RenameSourceDialog 
        open={showRenameDialog} 
        onOpenChange={setShowRenameDialog} 
        source={selectedSource} 
        notebookId={notebookId} 
      />

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {selectedSource?.title}?</AlertDialogTitle>
            <AlertDialogDescription>
              You're about to delete this source. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete} 
              className="bg-red-600 hover:bg-red-700" 
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default SourcesSidebar;
