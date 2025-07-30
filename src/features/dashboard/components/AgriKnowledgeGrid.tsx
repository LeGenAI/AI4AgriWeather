import React, { useState, useMemo } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Badge } from '@/shared/components/ui/badge';
import { Checkbox } from '@/shared/components/ui/checkbox';
import NotebookCard from './NotebookCard';
import BulkActions from './BulkActions';
import { Check, Grid3X3, List, ChevronDown, Search, Filter, Plus } from 'lucide-react';
import { useNotebooks } from '@/hooks/useNotebooks';
import { useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/shared/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/components/ui/dialog';
import { 
  AGRICULTURAL_CATEGORIES, 
  KNOWLEDGE_TEMPLATES, 
  getCategoryIcon, 
  getCategoryColor,
  getCategoryName 
} from '@/utils/agricultureTemplates';

const AgriKnowledgeGrid = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('Most recent');
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [selectedEntries, setSelectedEntries] = useState<string[]>([]);
  
  const {
    notebooks,
    isLoading,
    createNotebook,
    isCreating
  } = useNotebooks();
  const navigate = useNavigate();

  // Filter and search notebooks
  const filteredNotebooks = useMemo(() => {
    if (!notebooks) return [];
    
    let filtered = [...notebooks];
    
    // Filter by category
    if (filterCategory !== 'all') {
      filtered = filtered.filter(notebook => 
        notebook.category === filterCategory
      );
    }
    
    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(notebook =>
        notebook.title.toLowerCase().includes(query) ||
        notebook.description?.toLowerCase().includes(query) ||
        notebook.tags?.some(tag => tag.toLowerCase().includes(query)) ||
        notebook.crop_types?.some(crop => crop.toLowerCase().includes(query))
      );
    }
    
    return filtered;
  }, [notebooks, filterCategory, searchQuery]);

  // Sort notebooks
  const sortedNotebooks = useMemo(() => {
    const sorted = [...filteredNotebooks];
    
    if (sortBy === 'Most recent') {
      return sorted.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
    } else if (sortBy === 'Title') {
      return sorted.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === 'Category') {
      return sorted.sort((a, b) => (a.category || '').localeCompare(b.category || ''));
    }
    
    return sorted;
  }, [filteredNotebooks, sortBy]);

  const handleCreateFromTemplate = (template: any) => {
    createNotebook({
      title: template.title,
      description: template.description,
      category: template.category,
      subcategory: template.subcategory,
      tags: template.tags,
      crop_types: template.crop_types,
      difficulty_level: template.difficulty_level,
      knowledge_type: template.knowledge_type,
      season: template.season,
      icon: template.icon,
      color: template.color,
      is_template: false,
      template_category: template.id,
    }, {
      onSuccess: data => {
        console.log('Navigating to notebook:', data.id);
        navigate(`/notebook/${data.id}`);
        setShowTemplateDialog(false);
      },
      onError: error => {
        console.error('Failed to create notebook:', error);
      }
    });
  };

  const handleCreateBlank = () => {
    createNotebook({
      title: 'New Knowledge Entry',
      description: '',
      category: 'general_farming',
      knowledge_type: 'guide',
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
    const target = e.target as HTMLElement;
    const isDeleteAction = target.closest('[data-delete-action="true"]') || target.closest('.delete-button') || target.closest('[role="dialog"]');
    const isCheckboxAction = target.closest('[data-checkbox-action="true"]') || target.closest('input[type="checkbox"]');
    
    if (isDeleteAction || isCheckboxAction) {
      console.log('Click prevented due to action');
      return;
    }
    navigate(`/notebook/${notebookId}`);
  };

  const handleSelectEntry = (entryId: string, checked: boolean) => {
    if (checked) {
      setSelectedEntries(prev => [...prev, entryId]);
    } else {
      setSelectedEntries(prev => prev.filter(id => id !== entryId));
    }
  };

  const handleRefresh = () => {
    // This will be handled by the useNotebooks hook's real-time updates
    window.location.reload();
  };

  // Get category stats for filter dropdown
  const categoryStats = useMemo(() => {
    const stats = { all: notebooks?.length || 0 };
    notebooks?.forEach(notebook => {
      const category = notebook.category || 'general_farming';
      stats[category] = (stats[category] || 0) + 1;
    });
    return stats;
  }, [notebooks]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Stats skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-24 bg-gray-200 rounded-lg animate-pulse"></div>
          ))}
        </div>
        
        {/* Grid skeleton */}
        <div className="text-center py-16">
          <p className="text-gray-600">Loading knowledge entries...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Bulk Actions */}
      <BulkActions
        selectedEntries={selectedEntries}
        allEntries={sortedNotebooks}
        onSelectionChange={setSelectedEntries}
        onRefresh={handleRefresh}
      />

      {/* Header with search and filters */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search knowledge entries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {/* Category filter */}
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                All Categories ({categoryStats.all})
              </SelectItem>
              <DropdownMenuSeparator />
              {Object.entries(AGRICULTURAL_CATEGORIES).map(([key, category]) => (
                <SelectItem key={key} value={key}>
                  <div className="flex items-center space-x-2">
                    <span>{category.icon}</span>
                    <span>{category.name}</span>
                    <span className="text-gray-500">({categoryStats[key] || 0})</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-4">
          {/* Sort dropdown */}
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
              <DropdownMenuItem onClick={() => setSortBy('Category')} className="flex items-center justify-between">
                Category
                {sortBy === 'Category' && <Check className="h-4 w-4" />}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Create dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700 text-white" disabled={isCreating}>
                <Plus className="h-4 w-4 mr-2" />
                {isCreating ? 'Creating...' : 'Create'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Create Knowledge Entry</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleCreateBlank}>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                    📝
                  </div>
                  <div>
                    <p className="font-medium">Blank Entry</p>
                    <p className="text-sm text-gray-500">Start from scratch</p>
                  </div>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowTemplateDialog(true)}>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                    📋
                  </div>
                  <div>
                    <p className="font-medium">From Template</p>
                    <p className="text-sm text-gray-500">Use agricultural templates</p>
                  </div>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Results summary */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <div>
          Showing {sortedNotebooks.length} of {notebooks?.length || 0} knowledge entries
          {filterCategory !== 'all' && (
            <span> in {getCategoryName(filterCategory)}</span>
          )}
          {searchQuery && (
            <span> matching "{searchQuery}"</span>
          )}
        </div>
        
        {(filterCategory !== 'all' || searchQuery) && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => {
              setFilterCategory('all');
              setSearchQuery('');
            }}
          >
            Clear filters
          </Button>
        )}
      </div>

      {/* Knowledge entries grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {sortedNotebooks.map(notebook => (
          <div key={notebook.id} onClick={e => handleNotebookClick(notebook.id, e)}>
            <NotebookCard 
              notebook={{
                id: notebook.id,
                title: notebook.title,
                date: new Date(notebook.updated_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                }),
                sources: notebook.sources?.[0]?.count || 0,
                icon: notebook.icon || getCategoryIcon(notebook.category || 'general_farming'),
                color: notebook.color || getCategoryColor(notebook.category || 'general_farming'),
                category: notebook.category,
                tags: notebook.tags,
                crop_types: notebook.crop_types,
                difficulty_level: notebook.difficulty_level,
                knowledge_type: notebook.knowledge_type,
              }}
              isSelected={selectedEntries.includes(notebook.id)}
              onSelect={handleSelectEntry}
              showCheckbox={true}
            />
          </div>
        ))}
      </div>

      {/* Empty state */}
      {sortedNotebooks.length === 0 && (
        <div className="text-center py-16">
          <div className="max-w-md mx-auto">
            {searchQuery || filterCategory !== 'all' ? (
              <>
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No matching entries found</h3>
                <p className="text-gray-600 mb-4">
                  Try adjusting your search or filter criteria
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setFilterCategory('all');
                    setSearchQuery('');
                  }}
                >
                  Clear filters
                </Button>
              </>
            ) : (
              <>
                <div className="text-6xl mb-4">🌾</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No knowledge entries yet</h3>
                <p className="text-gray-600 mb-4">
                  Start building your agricultural knowledge base
                </p>
                <Button onClick={() => setShowTemplateDialog(true)}>
                  Create your first entry
                </Button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Template selection dialog */}
      <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Choose a Knowledge Entry Template</DialogTitle>
            <DialogDescription>
              Select from our agricultural templates to get started quickly
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            {KNOWLEDGE_TEMPLATES.map(template => (
              <div
                key={template.id}
                className="p-4 border rounded-lg cursor-pointer hover:border-green-500 transition-colors"
                onClick={() => handleCreateFromTemplate(template)}
              >
                <div className="flex items-start space-x-3">
                  <div className={`w-10 h-10 ${template.color} rounded-lg flex items-center justify-center text-lg`}>
                    {template.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 mb-1">{template.title}</h4>
                    <p className="text-sm text-gray-600 mb-2">{template.description}</p>
                    <div className="flex flex-wrap gap-1">
                      <Badge variant="secondary" className="text-xs">
                        {getCategoryName(template.category)}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {template.knowledge_type}
                      </Badge>
                      {template.difficulty_level && (
                        <Badge variant="outline" className="text-xs">
                          {template.difficulty_level}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTemplateDialog(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AgriKnowledgeGrid;