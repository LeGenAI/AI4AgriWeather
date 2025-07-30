import React, { useState, useEffect } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { MoreVertical, Plus, Edit, Bot, User, Loader2, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';
import { useNotes, Note } from '@/hooks/useNotes';
import { useAudioOverview } from '@/hooks/useAudioOverview';
import { useNotebooks } from '@/hooks/useNotebooks';
import { useSources } from '@/hooks/useSources';
import { useQueryClient } from '@tanstack/react-query';
import NoteEditor from './NoteEditor';
import AudioPlayer from './AudioPlayer';
import { Citation } from '@/types/message';

interface StudioSidebarProps {
  notebookId?: string;
  isExpanded?: boolean;
  onCitationClick?: (citation: Citation) => void;
}

const StudioSidebar = ({
  notebookId,
  isExpanded,
  onCitationClick
}: StudioSidebarProps) => {
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [isCreatingNote, setIsCreatingNote] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const {
    notes,
    isLoading,
    createNote,
    updateNote,
    deleteNote,
    isCreating,
    isUpdating,
    isDeleting
  } = useNotes(notebookId);
  const {
    notebooks
  } = useNotebooks();
  const {
    sources
  } = useSources(notebookId);
  const {
    generateAudioOverview,
    refreshAudioUrl,
    autoRefreshIfExpired,
    isGenerating,
    isAutoRefreshing,
    generationStatus,
    checkAudioExpiry
  } = useAudioOverview(notebookId);
  const queryClient = useQueryClient();
  const notebook = notebooks?.find(n => n.id === notebookId);
  const hasValidAudio = notebook?.audio_overview_url && !checkAudioExpiry(notebook.audio_url_expires_at);
  const currentStatus = generationStatus || notebook?.audio_overview_generation_status;
  
  // Check if at least one source has been successfully processed
  const hasProcessedSource = sources?.some(source => 
    source.processing_status === 'completed' || 
    source.processing_status === 'processed'
  ) || false;
  
  // Debug logging for source processing status
  console.log('🔍 Sources processing status check:', {
    sourcesCount: sources?.length || 0,
    hasProcessedSource,
    sourceStatuses: sources?.map(s => ({ id: s.id, title: s.title, status: s.processing_status })) || []
  });

  // Auto-refresh expired URLs
  useEffect(() => {
    if (!notebookId || !notebook?.audio_overview_url) return;
    
    const checkAndRefresh = async () => {
      if (checkAudioExpiry(notebook.audio_url_expires_at)) {
        console.log('Detected expired audio URL, initiating auto-refresh...');
        await autoRefreshIfExpired(notebookId, notebook.audio_url_expires_at);
      }
    };

    // Check immediately
    checkAndRefresh();

    // Set up periodic check every 5 minutes
    const interval = setInterval(checkAndRefresh, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [notebookId, notebook?.audio_overview_url, notebook?.audio_url_expires_at, autoRefreshIfExpired, checkAudioExpiry]);

  const handleCreateNote = () => {
    setIsCreatingNote(true);
    setEditingNote(null);
  };

  const handleEditNote = (note: Note) => {
    console.log('StudioSidebar: Opening note', {
      noteId: note.id,
      sourceType: note.source_type
    });
    setEditingNote(note);
    setIsCreatingNote(false);
  };

  const handleSaveNote = (title: string, content: string) => {
    if (editingNote) {
      // Only allow updating user notes, not AI responses
      if (editingNote.source_type === 'user') {
        updateNote({
          id: editingNote.id,
          title,
          content
        });
      }
    } else {
      createNote({
        title,
        content,
        source_type: 'user'
      });
    }
    setEditingNote(null);
    setIsCreatingNote(false);
  };

  const handleDeleteNote = () => {
    if (editingNote) {
      deleteNote(editingNote.id);
      setEditingNote(null);
    }
  };

  const handleCancel = () => {
    setEditingNote(null);
    setIsCreatingNote(false);
  };

  const handleGenerateAudio = () => {
    if (notebookId) {
      generateAudioOverview(notebookId);
      setAudioError(false);
    }
  };

  const handleAudioError = () => {
    setAudioError(true);
  };

  const handleAudioRetry = () => {
    // Regenerate the audio overview
    handleGenerateAudio();
  };

  const handleAudioDeleted = () => {
    // Refresh the notebooks data to update the UI
    if (notebookId) {
      queryClient.invalidateQueries({
        queryKey: ['notebooks']
      });
    }
    setAudioError(false);
  };

  const handleUrlRefresh = (notebookId: string) => {
    refreshAudioUrl(notebookId);
  };

  const getStatusDisplay = () => {
    if (isAutoRefreshing) {
      return {
        icon: null,
        text: "Refreshing URL...",
        description: "Updating audio access"
      };
    }
    
    if (currentStatus === 'generating' || isGenerating) {
      return {
        icon: <Loader2 className="h-4 w-4 animate-spin text-blue-600" />,
        text: "Generating audio...",
        description: "This may take a few minutes"
      };
    } else if (currentStatus === 'failed') {
      return {
        icon: <AlertCircle className="h-4 w-4 text-red-600" />,
        text: "Generation failed",
        description: "Please try again"
      };
    } else if (currentStatus === 'completed' && hasValidAudio) {
      return {
        icon: <CheckCircle2 className="h-4 w-4 text-green-600" />,
        text: "Ready to play",
        description: "Audio overview available"
      };
    }
    return null;
  };

  const isEditingMode = editingNote || isCreatingNote;
  const getPreviewText = (note: Note) => {
    if (note.source_type === 'ai_response') {
      // Use extracted_text if available, otherwise parse the content
      if (note.extracted_text) {
        return note.extracted_text;
      }
      try {
        const parsed = JSON.parse(note.content);
        if (parsed.segments && parsed.segments[0]) {
          return parsed.segments[0].text;
        }
      } catch (e) {
        // If parsing fails, use content as-is
      }
    }

    // For user notes or fallback, use the content directly
    const contentToUse = note.content;
    return contentToUse.length > 100 ? contentToUse.substring(0, 100) + '...' : contentToUse;
  };

  if (isEditingMode) {
    return <div className="w-full bg-gray-50 border-l border-gray-200 flex flex-col h-full overflow-hidden">
        <NoteEditor note={editingNote || undefined} onSave={handleSaveNote} onDelete={editingNote ? handleDeleteNote : undefined} onCancel={handleCancel} isLoading={isCreating || isUpdating || isDeleting} onCitationClick={onCitationClick} />
      </div>;
  }

  return <div className="w-full bg-gray-50 border-l border-gray-200 flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b border-gray-200 flex-shrink-0">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Studio</h2>
        
        {/* Audio Overview */}
        <Card className="p-4 mb-4 border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-gray-900">Audio Overview</h3>
          </div>

          {hasValidAudio && !audioError && currentStatus !== 'generating' && !isAutoRefreshing ? <AudioPlayer 
              audioUrl={notebook.audio_overview_url} 
              title="Deep Dive Conversation" 
              notebookId={notebookId} 
              expiresAt={notebook.audio_url_expires_at} 
              onError={handleAudioError} 
              onRetry={handleAudioRetry} 
              onDeleted={handleAudioDeleted}
              onUrlRefresh={handleUrlRefresh}
            /> : <Card className="p-3 border border-gray-200">
              {/* Hide this div when generating or auto-refreshing */}
              {currentStatus !== 'generating' && !isGenerating && !isAutoRefreshing && <div className="flex items-center space-x-3 mb-3">
                  <div className="w-8 h-8 rounded flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#111827">
                      <path d="M280-120v-123q-104-14-172-93T40-520h80q0 83 58.5 141.5T320-320h10q5 0 10-1 13 20 28 37.5t32 32.5q-10 3-19.5 4.5T360-243v123h-80Zm20-282q-43-8-71.5-40.5T200-520v-240q0-50 35-85t85-35q50 0 85 35t35 85v160H280v80q0 31 5 60.5t15 57.5Zm340 2q-50 0-85-35t-35-85v-240q0-50 35-85t85-35q50 0 85 35t35 85v240q0 50-35 85t-85 35Zm-40 280v-123q-104-14-172-93t-68-184h80q0 83 58.5 141.5T640-320q83 0 141.5-58.5T840-520h80q0 105-68 184t-172 93v123h-80Zm40-360q17 0 28.5-11.5T680-520v-240q0-17-11.5-28.5T640-800q-17 0-28.5 11.5T600-760v240q0 17 11.5 28.5T640-480Zm0-160Z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">Deep Dive conversation</h4>
                    <p className="text-sm text-gray-600">Two hosts</p>
                  </div>
                </div>}
              
              {/* Status Display */}
              {getStatusDisplay() && <div className="flex items-center space-x-2 mb-3 p-2 rounded-md bg-transparent">
                  {getStatusDisplay()!.icon}
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900">{getStatusDisplay()!.text}</p>
                    <p className="text-xs text-slate-900">{getStatusDisplay()!.description}</p>
                  </div>
                </div>}
              
              {/* Audio error div */}
              {audioError && <div className="flex items-center space-x-2 mb-3 p-2 bg-red-50 rounded-md">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <div className="flex-1">
                    <p className="text-sm text-red-600">Audio unavailable</p>
                  </div>
                  <Button size="sm" variant="outline" onClick={handleAudioRetry} className="text-red-600 border-red-300 hover:bg-red-50">
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Retry
                  </Button>
                </div>}
              
              <div className="flex space-x-2">
                <Button size="sm" onClick={handleGenerateAudio} disabled={isGenerating || currentStatus === 'generating' || !hasProcessedSource || isAutoRefreshing} className="flex-1 text-white bg-slate-900 hover:bg-slate-800">
                  {isGenerating || currentStatus === 'generating' ? <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </> : 'Generate'}
                </Button>
              </div>
            </Card>}
        </Card>

        {/* Notes Section */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-gray-900">Notes</h3>
            
          </div>
          
          <Button variant="outline" size="sm" className="w-full mb-4" onClick={handleCreateNote}>
            <Plus className="h-4 w-4 mr-2" />
            Add note
          </Button>
        </div>
      </div>

      {/* Saved Notes Area */}
      <ScrollArea className="flex-1 h-full">
        <div className="p-4">
          {isLoading ? <div className="text-center py-8">
              <p className="text-sm text-gray-600">Loading notes...</p>
            </div> : notes && notes.length > 0 ? <div className="space-y-3">
              {notes.map(note => <Card key={note.id} className="p-3 border border-gray-200 hover:bg-gray-50 cursor-pointer" onClick={() => handleEditNote(note)}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        {note.source_type === 'ai_response' ? <Bot className="h-3 w-3 text-blue-600" /> : <User className="h-3 w-3 text-gray-600" />}
                        <span className="text-xs text-gray-500 uppercase">
                          {note.source_type === 'ai_response' ? 'AI Response' : 'Note'}
                        </span>
                      </div>
                      <h4 className="font-medium text-gray-900 truncate">{note.title}</h4>
                      <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                        {getPreviewText(note)}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(note.updated_at).toLocaleDateString()}
                      </p>
                    </div>
                    {note.source_type === 'user' && <Button variant="ghost" size="sm" className="ml-2">
                        <Edit className="h-3 w-3" />
                      </Button>}
                  </div>
                </Card>)}
            </div> : <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-200 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <span className="text-gray-400 text-2xl">📄</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Saved notes will appear here</h3>
              <p className="text-sm text-gray-600">
                Save a chat message to create a new note, or click Add note above.
              </p>
            </div>}
        </div>
      </ScrollArea>
    </div>;
};

export default StudioSidebar;
