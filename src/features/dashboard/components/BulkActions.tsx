import React, { useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Badge } from '@/shared/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/shared/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/components/ui/alert-dialog';
import { 
  MoreVertical, 
  Archive, 
  Trash2, 
  Download, 
  Tag, 
  Copy,
  CheckCircle,
  X
} from 'lucide-react';
import { useToast } from '@/shared/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface KnowledgeEntry {
  id: string;
  title: string;
  category?: string;
  tags?: string[];
  crop_types?: string[];
  is_archived?: boolean;
}

interface BulkActionsProps {
  selectedEntries: string[];
  allEntries: KnowledgeEntry[];
  onSelectionChange: (selected: string[]) => void;
  onRefresh: () => void;
}

const BulkActions = ({ 
  selectedEntries, 
  allEntries, 
  onSelectionChange, 
  onRefresh 
}: BulkActionsProps) => {
  const [loading, setLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showArchiveDialog, setShowArchiveDialog] = useState(false);
  const { toast } = useToast();

  const selectedCount = selectedEntries.length;
  const totalCount = allEntries.length;
  const isAllSelected = selectedCount === totalCount && totalCount > 0;
  const isPartiallySelected = selectedCount > 0 && selectedCount < totalCount;

  const handleSelectAll = () => {
    if (isAllSelected) {
      onSelectionChange([]);
    } else {
      onSelectionChange(allEntries.map(entry => entry.id));
    }
  };

  const handleBulkArchive = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('notebooks')
        .update({ 
          is_archived: true,
          updated_at: new Date().toISOString()
        })
        .in('id', selectedEntries);

      if (error) throw error;

      toast({
        title: "Entries Archived",
        description: `${selectedCount} knowledge entries have been archived.`,
      });

      onSelectionChange([]);
      onRefresh();
    } catch (error) {
      console.error('Archive error:', error);
      toast({
        title: "Archive Failed",
        description: "Failed to archive entries. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setShowArchiveDialog(false);
    }
  };

  const handleBulkDelete = async () => {
    setLoading(true);
    try {
      // First delete related sources
      const { error: sourcesError } = await supabase
        .from('sources')
        .delete()
        .in('notebook_id', selectedEntries);

      if (sourcesError) throw sourcesError;

      // Then delete the notebooks
      const { error: notebooksError } = await supabase
        .from('notebooks')
        .delete()
        .in('id', selectedEntries);

      if (notebooksError) throw notebooksError;

      toast({
        title: "Entries Deleted",
        description: `${selectedCount} knowledge entries have been permanently deleted.`,
      });

      onSelectionChange([]);
      onRefresh();
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete entries. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setShowDeleteDialog(false);
    }
  };

  const handleExport = async () => {
    setLoading(true);
    try {
      // Get full data for selected entries
      const { data: entries, error } = await supabase
        .from('notebooks')
        .select(`
          *,
          sources (
            title,
            type,
            url,
            summary
          ),
          notes (
            title,
            content
          )
        `)
        .in('id', selectedEntries);

      if (error) throw error;

      // Create export data
      const exportData = {
        exported_at: new Date().toISOString(),
        entries_count: entries?.length || 0,
        entries: entries?.map(entry => ({
          id: entry.id,
          title: entry.title,
          description: entry.description,
          category: entry.category,
          subcategory: entry.subcategory,
          tags: entry.tags,
          crop_types: entry.crop_types,
          difficulty_level: entry.difficulty_level,
          knowledge_type: entry.knowledge_type,
          season: entry.season,
          created_at: entry.created_at,
          updated_at: entry.updated_at,
          sources: entry.sources,
          notes: entry.notes
        }))
      };

      // Download as JSON
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `agricultural-knowledge-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Export Complete",
        description: `${selectedCount} knowledge entries have been exported.`,
      });

      onSelectionChange([]);
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export entries. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDuplicate = async () => {
    setLoading(true);
    try {
      // Get the entries to duplicate
      const { data: originalEntries, error: fetchError } = await supabase
        .from('notebooks')
        .select('*')
        .in('id', selectedEntries);

      if (fetchError) throw fetchError;

      // Create duplicates
      const duplicates = originalEntries?.map(entry => ({
        ...entry,
        id: undefined, // Let Supabase generate new ID
        title: `Copy of ${entry.title}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));

      if (duplicates) {
        const { error: insertError } = await supabase
          .from('notebooks')
          .insert(duplicates);

        if (insertError) throw insertError;
      }

      toast({
        title: "Entries Duplicated",
        description: `${selectedCount} knowledge entries have been duplicated.`,
      });

      onSelectionChange([]);
      onRefresh();
    } catch (error) {
      console.error('Duplicate error:', error);
      toast({
        title: "Duplication Failed",
        description: "Failed to duplicate entries. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (selectedCount === 0) {
    return null;
  }

  return (
    <>
      <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg mb-4">
        <div className="flex items-center space-x-4">
          <Checkbox
            checked={isAllSelected}
            ref={(el) => {
              if (el) el.indeterminate = isPartiallySelected;
            }}
            onCheckedChange={handleSelectAll}
          />
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 text-blue-600" />
            <span className="font-medium text-blue-900">
              {selectedCount} selected
            </span>
            {selectedCount < totalCount && (
              <button
                onClick={handleSelectAll}
                className="text-blue-600 hover:text-blue-800 text-sm underline"
              >
                Select all {totalCount}
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onSelectionChange([])}
          >
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" disabled={loading}>
                <MoreVertical className="h-4 w-4 mr-1" />
                Actions
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Bulk Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              <DropdownMenuItem onClick={handleExport} disabled={loading}>
                <Download className="h-4 w-4 mr-2" />
                Export Selected
              </DropdownMenuItem>
              
              <DropdownMenuItem onClick={handleDuplicate} disabled={loading}>
                <Copy className="h-4 w-4 mr-2" />
                Duplicate Selected
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem 
                onClick={() => setShowArchiveDialog(true)} 
                disabled={loading}
              >
                <Archive className="h-4 w-4 mr-2" />
                Archive Selected
              </DropdownMenuItem>
              
              <DropdownMenuItem 
                onClick={() => setShowDeleteDialog(true)} 
                disabled={loading}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Selected
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Archive Confirmation Dialog */}
      <AlertDialog open={showArchiveDialog} onOpenChange={setShowArchiveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive Knowledge Entries?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to archive {selectedCount} knowledge entries? 
              Archived entries can be restored later but won't appear in your main view.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleBulkArchive}
              disabled={loading}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {loading ? 'Archiving...' : 'Archive Entries'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Knowledge Entries?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete {selectedCount} knowledge entries? 
              This action cannot be undone and will also delete all associated sources and notes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleBulkDelete}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700"
            >
              {loading ? 'Deleting...' : 'Delete Permanently'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default BulkActions;