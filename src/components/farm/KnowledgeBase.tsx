import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNotebooks } from '@/hooks/useNotebooks';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import AppHeader from '@/components/ui/AppHeader';
import { 
  Plus, 
  Search, 
  Book, 
  Calendar,
  Wheat,
  Cloud,
  Bug,
  DollarSign,
  FileText,
  Clock,
  Eye,
  Trash2,
  MoreHorizontal
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const useKnowledgeCategories = () => {
  const { t } = useTranslation();
  return [
    { id: 'weather', name: t('knowledge.weatherClimate'), icon: Cloud, color: 'bg-blue-100 text-blue-800' },
    { id: 'crops', name: t('knowledge.cropManagement'), icon: Wheat, color: 'bg-green-100 text-green-800' },
    { id: 'pests', name: t('knowledge.pestDisease'), icon: Bug, color: 'bg-orange-100 text-orange-800' },
    { id: 'market', name: t('knowledge.marketInfo'), icon: DollarSign, color: 'bg-purple-100 text-purple-800' },
    { id: 'general', name: t('knowledge.generalFarming'), icon: FileText, color: 'bg-gray-100 text-gray-800' }
  ];
};

export function KnowledgeBase() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { data: notebooks = [], isLoading, error } = useNotebooks();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const knowledgeCategories = useKnowledgeCategories();

  const filteredNotebooks = notebooks.filter(notebook => {
    const matchesSearch = notebook.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notebook.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = !selectedCategory || 
                           notebook.title?.toLowerCase().includes(selectedCategory) ||
                           notebook.description?.toLowerCase().includes(selectedCategory);
    
    return matchesSearch && matchesCategory;
  });

  const getCategoryFromTitle = (title: string) => {
    const titleLower = title.toLowerCase();
    if (titleLower.includes('weather') || titleLower.includes('climate') || titleLower.includes('rain')) {
      return knowledgeCategories.find(c => c.id === 'weather');
    }
    if (titleLower.includes('crop') || titleLower.includes('plant') || titleLower.includes('seed')) {
      return knowledgeCategories.find(c => c.id === 'crops');
    }
    if (titleLower.includes('pest') || titleLower.includes('disease') || titleLower.includes('insect')) {
      return knowledgeCategories.find(c => c.id === 'pests');
    }
    if (titleLower.includes('market') || titleLower.includes('price') || titleLower.includes('sell')) {
      return knowledgeCategories.find(c => c.id === 'market');
    }
    return knowledgeCategories.find(c => c.id === 'general');
  };

  const getNotebookIcon = (title: string) => {
    const category = getCategoryFromTitle(title);
    return category?.icon || FileText;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-emerald-50">
        <AppHeader />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your knowledge base...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-emerald-50">
        <AppHeader />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600">Error loading knowledge base: {error.message}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-emerald-50">
      <AppHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder={t('knowledge.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {/* Category Filters */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(null)}
            >
              {t('knowledge.allCategories')}
            </Button>
            {knowledgeCategories.map((category) => {
              const IconComponent = category.icon;
              return (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(selectedCategory === category.id ? null : category.id)}
                  className="flex items-center gap-1"
                >
                  <IconComponent className="h-3 w-3" />
                  {category.name}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Empty State */}
        {filteredNotebooks.length === 0 && !searchTerm && (
          <Card className="text-center py-12">
            <CardContent>
              <Book className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {t('knowledge.startBuilding')}
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                {t('knowledge.storeImportant')}
              </p>
              <Button asChild>
                <Link to="/knowledge/new">
                  <Plus className="h-4 w-4 mr-2" />
                  {t('knowledge.createFirst')}
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Search Results Empty State */}
        {filteredNotebooks.length === 0 && searchTerm && (
          <Card className="text-center py-12">
            <CardContent>
              <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {t('knowledge.noResults')}
              </h3>
              <p className="text-gray-600 mb-4">
                {t('knowledge.noMatch')} "{searchTerm}"
              </p>
              <Button variant="outline" onClick={() => setSearchTerm('')}>
                {t('knowledge.clearSearch')}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Knowledge Base Grid */}
        {filteredNotebooks.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNotebooks.map((notebook) => {
              const IconComponent = getNotebookIcon(notebook.title || '');
              const category = getCategoryFromTitle(notebook.title || '');
              
              return (
                <Card key={notebook.id} className="hover:shadow-lg transition-shadow group">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <IconComponent className="h-5 w-5 text-green-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-lg truncate">
                            {notebook.title || 'Untitled Knowledge Entry'}
                          </CardTitle>
                          {category && (
                            <Badge className={category.color} variant="secondary">
                              {category.name}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link to={`/knowledge/${notebook.id}`}>
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="mb-4 line-clamp-3">
                      {notebook.description || 'No description available'}
                    </CardDescription>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>
                          {notebook.updated_at 
                            ? formatDistanceToNow(new Date(notebook.updated_at), { addSuffix: true })
                            : 'Recently'
                          }
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>
                          {notebook.created_at 
                            ? new Date(notebook.created_at).toLocaleDateString()
                            : 'Today'
                          }
                        </span>
                      </div>
                    </div>
                    
                    <Button asChild className="w-full mt-4" variant="outline">
                      <Link to={`/knowledge/${notebook.id}`}>
                        Open Knowledge Entry
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Stats Summary */}
        {notebooks.length > 0 && (
          <Card className="mt-8">
            <CardContent className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-green-600">{notebooks.length}</p>
                  <p className="text-sm text-gray-600">{t('knowledge.totalEntries')}</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-600">
                    {notebooks.filter(n => getCategoryFromTitle(n.title || '').id === 'weather').length}
                  </p>
                  <p className="text-sm text-gray-600">{t('knowledge.weatherEntries')}</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">
                    {notebooks.filter(n => getCategoryFromTitle(n.title || '').id === 'crops').length}
                  </p>
                  <p className="text-sm text-gray-600">{t('knowledge.cropEntries')}</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-orange-600">
                    {notebooks.filter(n => getCategoryFromTitle(n.title || '').id === 'pests').length}
                  </p>
                  <p className="text-sm text-gray-600">{t('knowledge.pestEntries')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}