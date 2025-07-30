
import React, { useState, useMemo } from 'react';
import { Button } from '@/shared/components/ui/button';
import NotebookCard from './NotebookCard';
import { Check, Grid3X3, List, ChevronDown } from 'lucide-react';
import { useNotebooks } from '@/hooks/useNotebooks';
import { useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';

const NotebookGrid = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('Most recent');
  const {
    notebooks,
    isLoading,
    createNotebook,
    isCreating
  } = useNotebooks();
  const navigate = useNavigate();

  const sortedNotebooks = useMemo(() => {
    if (!notebooks) return [];
    
    const sorted = [...notebooks];
    
    if (sortBy === 'Most recent') {
      return sorted.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
    } else if (sortBy === 'Title') {
      return sorted.sort((a, b) => a.title.localeCompare(b.title));
    }
    
    return sorted;
  }, [notebooks, sortBy]);

  const handleCreateNotebook = () => {
    createNotebook({
      title: 'Untitled notebook',
      description: ''
    }, {
      onSuccess: data => {
        console.log('Navigating to notebook:', data.id);
        navigate(`/notebook/${data.id}`);
      },
      onError: error => {
        console.error('Failed to create notebook:', error);
      }
    });
  };

  const handleNotebookClick = (notebookId: string, e: React.MouseEvent) => {
    // Check if the click is coming from a delete action or other interactive element
    const target = e.target as HTMLElement;
    const isDeleteAction = target.closest('[data-delete-action="true"]') || target.closest('.delete-button') || target.closest('[role="dialog"]');
    if (isDeleteAction) {
      console.log('Click prevented due to delete action');
      return;
    }
    navigate(`/notebook/${notebookId}`);
  };

  if (isLoading) {
    return <div className="text-center py-16">
        <p className="text-gray-600">Loading notebooks...</p>
      </div>;
  }

  return <div>
      <div className="flex items-center justify-between mb-8">
        <Button className="bg-black hover:bg-gray-800 text-white rounded-full px-6" onClick={handleCreateNotebook} disabled={isCreating}>
          {isCreating ? 'Creating...' : '+ Create new'}
        </Button>
        
        <div className="flex items-center space-x-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center space-x-2 bg-white rounded-lg border px-3 py-2 cursor-pointer hover:bg-gray-50 transition-colors">
                <span className="text-sm text-gray-600">{sortBy}</span>
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => setSortBy('Most recent')} className="flex items-center justify-between">
                Most recent
                {sortBy === 'Most recent' && <Check className="h-4 w-4" />}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy('Title')} className="flex items-center justify-between">
                Title
                {sortBy === 'Title' && <Check className="h-4 w-4" />}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {sortedNotebooks.map(notebook => <div key={notebook.id} onClick={e => handleNotebookClick(notebook.id, e)}>
            <NotebookCard notebook={{
          id: notebook.id,
          title: notebook.title,
          date: new Date(notebook.updated_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          }),
          sources: notebook.sources?.[0]?.count || 0,
          icon: notebook.icon || '📝',
          color: notebook.color || 'bg-gray-100'
        }} />
          </div>)}
      </div>
    </div>;
};

export default NotebookGrid;
