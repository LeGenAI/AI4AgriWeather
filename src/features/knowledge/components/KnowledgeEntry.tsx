import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useNotebook } from '@/hooks/useNotebooks';
import { useSources } from '@/hooks/useSources';
import { useChatMessages } from '@/hooks/useChatMessages';
import { useNotebookGeneration } from '@/hooks/useNotebookGeneration';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { Separator } from '@/shared/components/ui/separator';
import { Badge } from '@/shared/components/ui/badge';
import UnifiedHeader from '@/components/layout/UnifiedHeader';
import { 
  ArrowLeft,
  Plus,
  FileText,
  MessageSquare,
  Send,
  Paperclip,
  Mic,
  Book,
  Wheat,
  Cloud,
  Bug,
  DollarSign,
  Upload,
  Link as LinkIcon,
  Youtube,
  Loader2
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import AddSourcesDialog from '@/components/notebook/AddSourcesDialog';
import MarkdownRenderer from '@/components/notebook/MarkdownRenderer';
import ChatArea from '@/components/notebook/ChatArea';
import SourcesSidebar from '@/components/notebook/SourcesSidebar';
// Debug component removed for production

const knowledgeCategories = [
  { id: 'weather', name: 'Weather & Climate', icon: Cloud, color: 'bg-blue-100 text-blue-800' },
  { id: 'crops', name: 'Crop Management', icon: Wheat, color: 'bg-green-100 text-green-800' },
  { id: 'pests', name: 'Pest & Disease', icon: Bug, color: 'bg-orange-100 text-orange-800' },
  { id: 'market', name: 'Market Information', icon: DollarSign, color: 'bg-purple-100 text-purple-800' },
  { id: 'general', name: 'General Farming', icon: FileText, color: 'bg-gray-100 text-gray-800' }
];

export function KnowledgeEntry() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showAddSources, setShowAddSources] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const [questionToSend, setQuestionToSend] = useState<string | null>(null);
  
  const { data: notebook, isLoading: notebookLoading, error: notebookError } = useNotebook(id!);
  const { data: sources = [] } = useSources(id!);
  const { data: messages = [] } = useChatMessages(id!);
  
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

  if (notebookLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-emerald-50">
        <UnifiedHeader variant="full" showBackButton onBackClick={() => navigate('/knowledge')} />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-green-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading knowledge entry...</p>
          </div>
        </div>
      </div>
    );
  }

  if (notebookError || !notebook) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-emerald-50">
        <UnifiedHeader variant="full" showBackButton onBackClick={() => navigate('/knowledge')} />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600 mb-4">Knowledge entry not found</p>
            <Button asChild>
              <Link to="/knowledge">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Knowledge Base
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const category = getCategoryFromTitle(notebook.title || '');
  const IconComponent = category?.icon || FileText;

  const handleSendQuestion = (question: string) => {
    setQuestionToSend(question);
    setActiveTab('chat');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <UnifiedHeader 
        variant="full"
        title={notebook.title || 'Knowledge Entry'} 
        subtitle={notebook.description || category?.name}
        showBackButton 
        onBackClick={() => navigate('/knowledge')} 
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid lg:grid-cols-4 gap-6 h-[calc(100vh-180px)]">
          {/* Sources Sidebar */}
          <div className="lg:col-span-1">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Sources ({sources?.length || 0})
                </CardTitle>
                <CardDescription>
                  Documents and references for this knowledge entry
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <SourcesSidebar notebookId={id!} />
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-2">
            <Card className="h-full">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
                <div className="px-6 pt-6">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="chat" className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      AI Assistant
                    </TabsTrigger>
                    <TabsTrigger value="overview" className="flex items-center gap-2">
                      <Book className="h-4 w-4" />
                      Overview
                    </TabsTrigger>
                  </TabsList>
                </div>
                
                <TabsContent value="chat" className="flex-1 px-6 pb-6">
                  <ChatArea 
                    notebookId={id!} 
                    hasSource={sources.length > 0}
                    notebook={notebook}
                    questionToSend={questionToSend}
                    onQuestionSent={() => setQuestionToSend(null)}
                  />
                </TabsContent>
                
                <TabsContent value="overview" className="flex-1 px-6 pb-6">
                  <ScrollArea className="h-full">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Description</h3>
                        <p className="text-gray-600">
                          {notebook.description || 'No description available for this knowledge entry.'}
                        </p>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Entry Details</h3>
                        <dl className="space-y-2">
                          <div className="flex justify-between">
                            <dt className="text-sm text-gray-600">Created:</dt>
                            <dd className="text-sm font-medium">
                              {notebook.created_at ? new Date(notebook.created_at).toLocaleDateString() : 'Unknown'}
                            </dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="text-sm text-gray-600">Last Updated:</dt>
                            <dd className="text-sm font-medium">
                              {notebook.updated_at ? new Date(notebook.updated_at).toLocaleDateString() : 'Unknown'}
                            </dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="text-sm text-gray-600">Sources:</dt>
                            <dd className="text-sm font-medium">{sources.length} files</dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="text-sm text-gray-600">Conversations:</dt>
                            <dd className="text-sm font-medium">{messages.length} messages</dd>
                          </div>
                        </dl>
                      </div>

                      {notebook.example_questions && notebook.example_questions.length > 0 && (
                        <>
                          <Separator />
                          <div>
                            <h3 className="text-lg font-semibold mb-2">Suggested Questions</h3>
                            <div className="space-y-2">
                              {notebook.example_questions.map((question, index) => (
                                <Button
                                  key={index}
                                  variant="outline"
                                  className="w-full text-left justify-start h-auto p-3 whitespace-normal"
                                  onClick={() => handleSendQuestion(question)}
                                >
                                  {question}
                                </Button>
                              ))}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            </Card>
          </div>

          {/* Notes Sidebar */}
          <div className="lg:col-span-1">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="text-lg">Notes</CardTitle>
                <CardDescription>
                  Your personal notes and insights
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-gray-500 text-center py-8">
                  Notes feature coming soon...
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Add Sources Dialog */}
      <AddSourcesDialog
        open={showAddSources}
        onOpenChange={setShowAddSources}
        notebookId={id!}
      />
    </div>
  );
}