
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const useSourceDelete = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();

  const deleteSource = useMutation({
    mutationFn: async (sourceId: string) => {
      console.log('Starting source deletion process for:', sourceId);
      
      try {
        // First, get the source details including file information
        const { data: source, error: fetchError } = await supabase
          .from('sources')
          .select('id, title, file_path, type')
          .eq('id', sourceId)
          .single();

        if (fetchError) {
          console.error('Error fetching source:', fetchError);
          throw new Error('Failed to find source');
        }

        console.log('Found source to delete:', source.title, 'with file_path:', source.file_path);

        // Delete the file from storage if it exists
        if (source.file_path) {
          console.log('Deleting file from storage:', source.file_path);
          
          const { error: storageError } = await supabase.storage
            .from('sources')
            .remove([source.file_path]);

          if (storageError) {
            console.error('Error deleting file from storage:', storageError);
            // Don't throw here - we still want to delete the database record
            // even if the file deletion fails (file might already be gone)
          } else {
            console.log('File deleted successfully from storage');
          }
        } else {
          console.log('No file to delete from storage (URL-based source or no file_path)');
        }

        // Delete the source record from the database
        const { error: deleteError } = await supabase
          .from('sources')
          .delete()
          .eq('id', sourceId);

        if (deleteError) {
          console.error('Error deleting source from database:', deleteError);
          throw deleteError;
        }
        
        console.log('Source deleted successfully from database');
        return source;
      } catch (error) {
        console.error('Error in source deletion process:', error);
        throw error;
      }
    },
    onSuccess: (deletedSource) => {
      console.log('Delete mutation success, invalidating queries');
      queryClient.invalidateQueries({ queryKey: ['sources'] });
      toast({
        title: "Source deleted",
        description: `"${deletedSource?.title || 'Source'}" has been successfully deleted.`,
      });
    },
    onError: (error: any) => {
      console.error('Delete mutation error:', error);
      
      let errorMessage = "Failed to delete the source. Please try again.";
      
      // Provide more specific error messages based on the error type
      if (error?.code === 'PGRST116') {
        errorMessage = "Source not found or you don't have permission to delete it.";
      } else if (error?.message?.includes('foreign key')) {
        errorMessage = "Cannot delete source due to data dependencies. Please contact support.";
      } else if (error?.message?.includes('network')) {
        errorMessage = "Network error. Please check your connection and try again.";
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  return {
    deleteSource: deleteSource.mutate,
    isDeleting: deleteSource.isPending,
  };
};
