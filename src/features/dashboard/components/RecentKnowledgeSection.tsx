import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { 
  Cloud, 
  Wheat, 
  AlertTriangle,
  Book,
  Plus
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

interface KnowledgeEntry {
  id: string;
  title: string;
  description?: string;
  updated_at?: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface RecentKnowledgeSectionProps {
  knowledgeEntries: KnowledgeEntry[];
  isLoading: boolean;
}

function getKnowledgeIcon(title: string) {
  const titleLower = title.toLowerCase();
  if (titleLower.includes('weather') || titleLower.includes('climate')) return Cloud;
  if (titleLower.includes('crop') || titleLower.includes('plant')) return Wheat;
  if (titleLower.includes('pest') || titleLower.includes('disease')) return AlertTriangle;
  return Book;
}

export function RecentKnowledgeSection({ knowledgeEntries, isLoading }: RecentKnowledgeSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Recent Knowledge Entries</span>
          <Link to="/knowledge" className="text-sm font-normal text-blue-600 hover:underline">
            View All →
          </Link>
        </CardTitle>
        <CardDescription>
          Your latest agricultural insights
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-500">Loading...</p>
          </div>
        ) : knowledgeEntries.length > 0 ? (
          <div className="space-y-3">
            {knowledgeEntries.map((entry) => {
              const IconComponent = entry.icon;
              return (
                <div key={entry.id} className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                  <div className="p-1 bg-green-100 rounded">
                    <IconComponent className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link 
                      to={`/knowledge/${entry.id}`}
                      className="font-medium text-sm text-gray-900 hover:text-green-600 truncate block"
                    >
                      {entry.title}
                    </Link>
                    {entry.description && (
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                        {entry.description}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      {entry.updated_at 
                        ? formatDistanceToNow(new Date(entry.updated_at), { addSuffix: true })
                        : 'Recently'
                      }
                    </p>
                  </div>
                </div>
              );
            })}
            <Button asChild variant="outline" className="w-full mt-2">
              <Link to="/knowledge/new">
                <Plus className="h-4 w-4 mr-2" />
                Add New Knowledge
              </Link>
            </Button>
          </div>
        ) : (
          <div className="text-center py-6">
            <Book className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-sm text-gray-600 mb-3">No knowledge entries yet</p>
            <Button asChild size="sm">
              <Link to="/knowledge/new">
                <Plus className="h-4 w-4 mr-2" />
                Create First Entry
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export { getKnowledgeIcon };