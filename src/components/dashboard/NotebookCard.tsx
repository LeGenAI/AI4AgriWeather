import React, { useState } from 'react';
import { Trash2, Calendar, Target, Sprout } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { useNotebookDelete } from '@/hooks/useNotebookDelete';
import { getCategoryName } from '@/utils/agricultureTemplates';

interface NotebookCardProps {
  notebook: {
    id: string;
    title: string;
    date: string;
    sources: number;
    icon: string;
    color: string;
    hasCollaborators?: boolean;
    category?: string;
    tags?: string[];
    crop_types?: string[];
    difficulty_level?: string;
    knowledge_type?: string;
  };
  isSelected?: boolean;
  onSelect?: (id: string, selected: boolean) => void;
  showCheckbox?: boolean;
}

const NotebookCard = ({
  notebook,
  isSelected = false,
  onSelect,
  showCheckbox = false
}: NotebookCardProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const {
    deleteNotebook,
    isDeleting
  } = useNotebookDelete();

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    console.log('Delete button clicked for notebook:', notebook.id);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    console.log('Confirming delete for notebook:', notebook.id);
    deleteNotebook(notebook.id);
    setShowDeleteDialog(false);
  };

  const handleCheckboxChange = (checked: boolean) => {
    if (onSelect) {
      onSelect(notebook.id, checked);
    }
  };

  // Generate CSS classes from color name
  const colorName = notebook.color || 'gray';
  const backgroundClass = `bg-${colorName}-100`;
  const borderClass = `border-${colorName}-200`;

  return <div 
      className={`rounded-lg border ${borderClass} ${backgroundClass} p-4 hover:shadow-md transition-shadow cursor-pointer relative flex flex-col h-64 ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
    >
      {/* Selection checkbox */}
      {showCheckbox && (
        <div className="absolute top-3 left-3 z-10" data-checkbox-action="true">
          <Checkbox
            checked={isSelected}
            onCheckedChange={handleCheckboxChange}
            className="bg-white shadow-sm"
          />
        </div>
      )}

      <div className="absolute top-3 right-3" data-delete-action="true">
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogTrigger asChild>
            <button onClick={handleDeleteClick} className="p-1 hover:bg-red-50 rounded text-gray-400 hover:text-red-500 transition-colors delete-button" disabled={isDeleting} data-delete-action="true">
              <Trash2 className="h-4 w-4" />
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this knowledge entry?</AlertDialogTitle>
              <AlertDialogDescription>
                You're about to delete this knowledge entry and all of its content. This cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-600 hover:bg-red-700" disabled={isDeleting}>
                {isDeleting ? 'Deleting...' : 'Delete'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
      
      {/* Header with icon and category */}
      <div className="flex items-start justify-between mb-3">
        <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-white/50">
          <span className="text-2xl">{notebook.icon}</span>
        </div>
        {notebook.category && (
          <Badge variant="secondary" className="text-xs bg-white/70">
            {getCategoryName(notebook.category)}
          </Badge>
        )}
      </div>
      
      {/* Title */}
      <h3 className="text-gray-900 mb-3 pr-2 line-clamp-2 text-lg font-medium leading-tight flex-grow-0">
        {notebook.title}
      </h3>
      
      {/* Agricultural metadata */}
      <div className="flex-grow space-y-2">
        {/* Knowledge type and difficulty */}
        <div className="flex items-center gap-2 flex-wrap">
          {notebook.knowledge_type && (
            <Badge variant="outline" className="text-xs px-2 py-0.5">
              <Target className="h-3 w-3 mr-1" />
              {notebook.knowledge_type}
            </Badge>
          )}
          {notebook.difficulty_level && (
            <Badge variant="outline" className="text-xs px-2 py-0.5">
              {notebook.difficulty_level}
            </Badge>
          )}
        </div>
        
        {/* Crop types */}
        {notebook.crop_types && notebook.crop_types.length > 0 && (
          <div className="flex items-center gap-1 flex-wrap">
            <Sprout className="h-3 w-3 text-green-600 flex-shrink-0" />
            <div className="flex gap-1 flex-wrap">
              {notebook.crop_types.slice(0, 2).map(crop => (
                <Badge key={crop} variant="secondary" className="text-xs bg-green-100 text-green-800">
                  {crop.replace('_', ' ').toUpperCase()}
                </Badge>
              ))}
              {notebook.crop_types.length > 2 && (
                <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                  +{notebook.crop_types.length - 2}
                </Badge>
              )}
            </div>
          </div>
        )}
        
        {/* Tags */}
        {notebook.tags && notebook.tags.length > 0 && (
          <div className="flex gap-1 flex-wrap">
            {notebook.tags.slice(0, 2).map(tag => (
              <Badge key={tag} variant="outline" className="text-xs">
                #{tag}
              </Badge>
            ))}
            {notebook.tags.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{notebook.tags.length - 2} more
              </Badge>
            )}
          </div>
        )}
      </div>
      
      {/* Footer with date and sources */}
      <div className="flex items-center justify-between text-sm text-gray-500 mt-auto pt-2 border-t border-white/30">
        <div className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          <span>{notebook.date}</span>
        </div>
        <span>{notebook.sources} source{notebook.sources !== 1 ? 's' : ''}</span>
      </div>
    </div>;
};

export default NotebookCard;
