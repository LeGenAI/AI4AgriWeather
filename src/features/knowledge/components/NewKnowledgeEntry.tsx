import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link } from 'react-router-dom';
import { useCreateNotebook } from '@/hooks/useNotebooks';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import UnifiedHeader from '@/components/layout/UnifiedHeader';
import { 
  ArrowLeft,
  Book,
  Wheat,
  Cloud,
  Bug,
  DollarSign,
  FileText,
  Loader2,
  Plus
} from 'lucide-react';
import { useToast } from '@/shared/hooks/use-toast';

const knowledgeCategories = [
  { 
    id: 'weather', 
    name: 'Weather & Climate', 
    icon: Cloud, 
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    description: 'Weather forecasts, climate patterns, seasonal information'
  },
  { 
    id: 'crops', 
    name: 'Crop Management', 
    icon: Wheat, 
    color: 'bg-green-100 text-green-800 border-green-200',
    description: 'Planting guides, harvest times, crop varieties, cultivation techniques'
  },
  { 
    id: 'pests', 
    name: 'Pest & Disease', 
    icon: Bug, 
    color: 'bg-orange-100 text-orange-800 border-orange-200',
    description: 'Pest identification, disease prevention, treatment methods'
  },
  { 
    id: 'market', 
    name: 'Market Information', 
    icon: DollarSign, 
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    description: 'Market prices, selling strategies, buyer information'
  },
  { 
    id: 'general', 
    name: 'General Farming', 
    icon: FileText, 
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    description: 'General agricultural knowledge, techniques, and resources'
  }
];

const suggestedTopics = {
  weather: [
    'Seasonal rainfall patterns in Tanzania',
    'How to interpret weather forecasts for farming',
    'Climate change impacts on agriculture',
    'Best practices during dry seasons'
  ],
  crops: [
    'Maize cultivation best practices',
    'Coffee farming techniques',
    'Rice growing in Tanzania',
    'Organic farming methods'
  ],
  pests: [
    'Fall armyworm identification and control',
    'Coffee berry disease prevention',
    'Integrated pest management strategies',
    'Natural pesticide alternatives'
  ],
  market: [
    'Understanding commodity prices',
    'When to sell your harvest',
    'Cooperative marketing benefits',
    'Export opportunities for farmers'
  ],
  general: [
    'Soil health and fertility management',
    'Water conservation techniques',
    'Farm record keeping',
    'Agricultural technology adoption'
  ]
};

export function NewKnowledgeEntry() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const createNotebook = useCreateNotebook();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    
    // Auto-suggest title prefix based on category
    if (!title) {
      const category = knowledgeCategories.find(c => c.id === categoryId);
      if (category) {
        setTitle(`${category.name}: `);
      }
    }
  };

  const handleSuggestedTopic = (topic: string) => {
    setTitle(topic);
    setDescription(`Knowledge entry about: ${topic}`);
  };

  const handleCreate = async () => {
    if (!title.trim()) {
      toast({
        title: "Title Required",
        description: "Please enter a title for your knowledge entry.",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    
    try {
      const result = await createNotebook.mutateAsync({
        title: title.trim(),
        description: description.trim() || undefined,
      });

      toast({
        title: "Knowledge Entry Created",
        description: "Your new knowledge entry has been created successfully.",
      });

      // Navigate to the new knowledge entry
      navigate(`/knowledge/${result.id}`);
    } catch (error) {
      console.error('Error creating knowledge entry:', error);
      toast({
        title: "Creation Failed",
        description: "Failed to create knowledge entry. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-emerald-50">
      <UnifiedHeader 
        variant="full"
        title="New Knowledge Entry" 
        subtitle="Create agricultural knowledge documentation"
        showBackButton 
        onBackClick={() => navigate('/knowledge')} 
      />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Category Selection */}
          <Card>
            <CardHeader>
              <CardTitle>{t('knowledge.chooseCategory')}</CardTitle>
              <CardDescription>
                {t('knowledge.selectType')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {knowledgeCategories.map((category) => {
                  const IconComponent = category.icon;
                  return (
                    <Card
                      key={category.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        selectedCategory === category.id 
                          ? 'ring-2 ring-green-500 bg-green-50' 
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => handleCategorySelect(category.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-3">
                          <div className={`p-2 rounded-lg ${category.color}`}>
                            <IconComponent className="h-5 w-5" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-sm">{category.name}</h3>
                            <p className="text-xs text-gray-600 mt-1">
                              {category.description}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Suggested Topics */}
          {selectedCategory && (
            <Card>
              <CardHeader>
                <CardTitle>Suggested Topics</CardTitle>
                <CardDescription>
                  Popular topics for {knowledgeCategories.find(c => c.id === selectedCategory)?.name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-2">
                  {suggestedTopics[selectedCategory as keyof typeof suggestedTopics]?.map((topic, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="text-left justify-start h-auto p-3 whitespace-normal"
                      onClick={() => handleSuggestedTopic(topic)}
                    >
                      <Plus className="h-3 w-3 mr-2 flex-shrink-0" />
                      {topic}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Entry Details */}
          <Card>
            <CardHeader>
              <CardTitle>{t('knowledge.entryDetails')}</CardTitle>
              <CardDescription>
                {t('knowledge.provideBasic')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">{t('knowledge.titleRequired')}</Label>
                <Input
                  id="title"
                  placeholder={t('knowledge.titlePlaceholder')}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="text-lg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">{t('knowledge.descriptionOptional')}</Label>
                <Textarea
                  id="description"
                  placeholder={t('knowledge.descriptionPlaceholder')}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="flex items-center justify-between pt-4">
                <p className="text-sm text-gray-600">
                  {t('knowledge.addSourcesAfter')}
                </p>
                <Button 
                  onClick={handleCreate}
                  disabled={!title.trim() || isCreating}
                  size="lg"
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {t('knowledge.creating')}
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      {t('knowledge.createKnowledgeEntry')}
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Tips */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-6">
              <h3 className="font-semibold text-blue-900 mb-2">💡 Tips for creating effective knowledge entries</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Use descriptive titles that clearly indicate the topic</li>
                <li>• Upload relevant documents, PDFs, or web links as sources</li>
                <li>• Ask the AI assistant questions to explore the topic deeply</li>
                <li>• Organize related information under appropriate categories</li>
                <li>• Update entries as you learn new information</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}