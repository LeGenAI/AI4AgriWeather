
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Textarea } from '@/shared/components/ui/textarea';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Copy, ClipboardPaste } from 'lucide-react';

interface CopiedTextDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (title: string, content: string) => void;
}

const CopiedTextDialog = ({
  open,
  onOpenChange,
  onSubmit
}: CopiedTextDialogProps) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-populate with clipboard content when dialog opens
  useEffect(() => {
    if (open) {
      navigator.clipboard.readText()
        .then(text => {
          if (text && text.trim()) {
            setContent(text);
            // Generate a default title based on content length
            const words = text.trim().split(' ').slice(0, 8).join(' ');
            setTitle(words.length > 50 ? words.substring(0, 50) + '...' : words);
          }
        })
        .catch(err => {
          console.log('Could not read clipboard:', err);
        });
    }
  }, [open]);

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(title.trim(), content.trim());
      setTitle('');
      setContent('');
      onOpenChange(false);
    } catch (error) {
      console.error('Error submitting copied text:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setTitle('');
    setContent('');
    onOpenChange(false);
  };

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setContent(text);
        if (!title.trim()) {
          const words = text.trim().split(' ').slice(0, 8).join(' ');
          setTitle(words.length > 50 ? words.substring(0, 50) + '...' : words);
        }
      }
    } catch (err) {
      console.error('Could not read clipboard:', err);
    }
  };

  const isValid = title.trim() !== '' && content.trim() !== '';
  const characterCount = content.length;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Copy className="h-5 w-5 text-purple-600" />
            <span>Add Copied Text</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-4">
              This dialog automatically reads from your clipboard. You can also manually paste content below.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium">
              Title
            </Label>
            <Input
              id="title"
              placeholder="Enter a title for this content..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="content" className="text-sm font-medium">
                Content
              </Label>
              <Button
                variant="outline"
                size="sm"
                onClick={handlePasteFromClipboard}
                className="flex items-center space-x-1"
              >
                <ClipboardPaste className="h-4 w-4" />
                <span>Paste from Clipboard</span>
              </Button>
            </div>
            <Textarea
              id="content"
              placeholder="Your copied content will appear here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[200px] resize-y"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>{characterCount} characters</span>
              {characterCount > 10000 && (
                <span className="text-amber-600">Large content may take longer to process</span>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={!isValid || isSubmitting}
            >
              {isSubmitting ? 'Adding...' : 'Add Copied Text'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CopiedTextDialog;
