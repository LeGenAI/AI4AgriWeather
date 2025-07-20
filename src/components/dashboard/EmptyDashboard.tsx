import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, FileText, Globe, Video, Wheat, Cloud, Bug, TrendingUp, Plus, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNotebooks } from '@/hooks/useNotebooks';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { KNOWLEDGE_TEMPLATES, getCategoryName } from '@/utils/agricultureTemplates';
const EmptyDashboard = () => {
  const navigate = useNavigate();
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const {
    createNotebook,
    isCreating
  } = useNotebooks();
  
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
    console.log('Create notebook button clicked');
    console.log('isCreating:', isCreating);
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
  return (
    <div className="text-center py-16">
      <div className="mb-12">
        <div className="text-6xl mb-6">🌾</div>
        <h2 className="text-3xl font-medium text-gray-900 mb-4">Start Your Agricultural Knowledge Journey</h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Build a comprehensive knowledge base for your farm with AI-powered agricultural insights and templates
        </p>
      </div>

      {/* Knowledge Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mb-12">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200 p-6 text-center">
          <div className="w-12 h-12 bg-blue-500 rounded-lg mx-auto mb-4 flex items-center justify-center">
            <Cloud className="h-6 w-6 text-white" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Weather & Climate</h3>
          <p className="text-gray-600 text-sm">Track weather patterns and climate impacts on your crops</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200 p-6 text-center">
          <div className="w-12 h-12 bg-green-500 rounded-lg mx-auto mb-4 flex items-center justify-center">
            <Wheat className="h-6 w-6 text-white" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Crop Management</h3>
          <p className="text-gray-600 text-sm">Plan planting, fertilization, and harvest activities</p>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg border border-red-200 p-6 text-center">
          <div className="w-12 h-12 bg-red-500 rounded-lg mx-auto mb-4 flex items-center justify-center">
            <Bug className="h-6 w-6 text-white" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Pest & Disease</h3>
          <p className="text-gray-600 text-sm">Identify and manage agricultural pests and diseases</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200 p-6 text-center">
          <div className="w-12 h-12 bg-purple-500 rounded-lg mx-auto mb-4 flex items-center justify-center">
            <TrendingUp className="h-6 w-6 text-white" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Market Information</h3>
          <p className="text-gray-600 text-sm">Track prices and market trends for your products</p>
        </div>
      </div>

      {/* Source Types */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
        <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
          <div className="w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
            <FileText className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Agricultural Documents</h3>
          <p className="text-gray-600">Research papers, farming guides, and technical reports</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
          <div className="w-12 h-12 bg-green-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
            <Globe className="h-6 w-6 text-green-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Online Resources</h3>
          <p className="text-gray-600">Agricultural websites, extension services, and market data</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
          <div className="w-12 h-12 bg-purple-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
            <Video className="h-6 w-6 text-purple-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Multimedia Content</h3>
          <p className="text-gray-600">Training videos, audio guides, and visual references</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
        <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
          <DialogTrigger asChild>
            <Button size="lg" className="bg-green-600 hover:bg-green-700" disabled={isCreating}>
              <Sparkles className="h-5 w-5 mr-2" />
              Start with Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Choose an Agricultural Template</DialogTitle>
              <DialogDescription>
                Select from our pre-built templates to get started quickly with proven agricultural knowledge structures
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              {KNOWLEDGE_TEMPLATES.slice(0, 6).map(template => (
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
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>

        <Button 
          onClick={handleCreateBlank} 
          size="lg" 
          variant="outline" 
          className="border-green-600 text-green-600 hover:bg-green-50" 
          disabled={isCreating}
        >
          <Plus className="h-5 w-5 mr-2" />
          {isCreating ? 'Creating...' : 'Start from Scratch'}
        </Button>
      </div>
    </div>
  );
};
export default EmptyDashboard;