
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Textarea } from '@/shared/components/ui/textarea';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Copy } from 'lucide-react';

interface PasteTextDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (title: string, content: string) => void;
}

const PasteTextDialog = ({ open, onOpenChange, onSubmit }: PasteTextDialogProps) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsLoading(true);
    try {
      await onSubmit(title.trim() || 'Pasted Text', content.trim());
      setTitle('');
      setContent('');
      onOpenChange(false);
    } catch (error) {
      console.error('Error adding text source:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setContent(text);
    } catch (error) {
      console.error('Failed to read clipboard:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Copy className="h-5 w-5 text-gray-600" />
            <span>Add Text Source</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="text-title">Title (optional)</Label>
            <Input
              id="text-title"
              placeholder="Enter a title for this text..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="text-content">Content</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handlePasteFromClipboard}
              >
                <Copy className="h-4 w-4 mr-2" />
                Paste from clipboard
              </Button>
            </div>
            <Textarea
              id="text-content"
              placeholder="Paste or type your text here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={12}
              required
              className="min-h-[300px]"
            />
            <p className="text-xs text-gray-500">
              {content.length} characters
            </p>
          </div>

          <div className="flex space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={!content.trim() || isLoading}
            >
              {isLoading ? 'Adding...' : 'Add Source'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PasteTextDialog;
