import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Wheat, 
  Calendar, 
  MapPin, 
  Tag, 
  Activity,
  Globe,
  BarChart3,
  FileText
} from 'lucide-react';

interface ClassificationResult {
  category: string;
  subcategory?: string;
  crops: string[];
  seasons: string[];
  activities: string[];
  regions: string[];
  confidence: number;
  keywords: string[];
  language: string;
}

interface Source {
  id: string;
  title: string;
  type: string;
  metadata?: {
    classification?: ClassificationResult;
    [key: string]: any;
  };
  [key: string]: any;
}

interface AgricultureClassificationViewProps {
  sources: Source[];
}

const AgricultureClassificationView: React.FC<AgricultureClassificationViewProps> = ({ sources }) => {
  // 분류된 소스만 필터링
  const classifiedSources = sources.filter(source => source.metadata?.classification);

  // 통계 계산
  const statistics = React.useMemo(() => {
    const stats = {
      totalDocuments: classifiedSources.length,
      categories: {} as Record<string, number>,
      crops: {} as Record<string, number>,
      seasons: {} as Record<string, number>,
      activities: {} as Record<string, number>,
      regions: {} as Record<string, number>,
      languages: {} as Record<string, number>,
      avgConfidence: 0
    };

    let totalConfidence = 0;

    classifiedSources.forEach(source => {
      const classification = source.metadata?.classification;
      if (!classification) return;

      // 카테고리 집계
      stats.categories[classification.category] = (stats.categories[classification.category] || 0) + 1;

      // 언어 집계
      stats.languages[classification.language] = (stats.languages[classification.language] || 0) + 1;

      // 신뢰도 누적
      totalConfidence += classification.confidence;

      // 작물 집계
      classification.crops.forEach(crop => {
        stats.crops[crop] = (stats.crops[crop] || 0) + 1;
      });

      // 계절 집계
      classification.seasons.forEach(season => {
        stats.seasons[season] = (stats.seasons[season] || 0) + 1;
      });

      // 활동 집계
      classification.activities.forEach(activity => {
        stats.activities[activity] = (stats.activities[activity] || 0) + 1;
      });

      // 지역 집계
      classification.regions.forEach(region => {
        stats.regions[region] = (stats.regions[region] || 0) + 1;
      });
    });

    stats.avgConfidence = classifiedSources.length > 0 ? totalConfidence / classifiedSources.length : 0;

    return stats;
  }, [classifiedSources]);

  // Top N 항목 가져오기
  const getTopItems = (items: Record<string, number>, limit: number = 5) => {
    return Object.entries(items)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit);
  };

  return (
    <div className="p-4 space-y-4">
      {/* 통계 요약 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">총 문서</p>
              <p className="text-2xl font-bold">{statistics.totalDocuments}</p>
            </div>
            <FileText className="h-8 w-8 text-gray-400" />
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">작물 종류</p>
              <p className="text-2xl font-bold">{Object.keys(statistics.crops).length}</p>
            </div>
            <Wheat className="h-8 w-8 text-green-500" />
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">평균 신뢰도</p>
              <p className="text-2xl font-bold">{(statistics.avgConfidence * 100).toFixed(0)}%</p>
            </div>
            <BarChart3 className="h-8 w-8 text-blue-500" />
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">언어</p>
              <p className="text-2xl font-bold">{Object.keys(statistics.languages).length}</p>
            </div>
            <Globe className="h-8 w-8 text-purple-500" />
          </div>
        </Card>
      </div>

      {/* 상세 분류 정보 */}
      <Tabs defaultValue="crops" className="w-full">
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="crops">작물</TabsTrigger>
          <TabsTrigger value="categories">카테고리</TabsTrigger>
          <TabsTrigger value="seasons">계절</TabsTrigger>
          <TabsTrigger value="activities">활동</TabsTrigger>
          <TabsTrigger value="regions">지역</TabsTrigger>
        </TabsList>

        <TabsContent value="crops" className="mt-4">
          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Wheat className="h-5 w-5 mr-2" />
              작물별 문서 분포
            </h3>
            <div className="space-y-2">
              {getTopItems(statistics.crops, 10).map(([crop, count]) => (
                <div key={crop} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{crop}</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${(count / statistics.totalDocuments) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 w-12 text-right">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="mt-4">
          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Tag className="h-5 w-5 mr-2" />
              카테고리별 문서 분포
            </h3>
            <div className="space-y-2">
              {getTopItems(statistics.categories).map(([category, count]) => (
                <div key={category} className="flex items-center justify-between">
                  <Badge>{category}</Badge>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${(count / statistics.totalDocuments) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 w-12 text-right">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="seasons" className="mt-4">
          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              계절별 문서 분포
            </h3>
            <div className="space-y-2">
              {getTopItems(statistics.seasons).map(([season, count]) => (
                <div key={season} className="flex items-center justify-between">
                  <Badge variant="secondary">{season}</Badge>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-orange-500 h-2 rounded-full"
                        style={{ width: `${(count / statistics.totalDocuments) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 w-12 text-right">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="activities" className="mt-4">
          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              농업 활동별 문서 분포
            </h3>
            <div className="space-y-2">
              {getTopItems(statistics.activities, 10).map(([activity, count]) => (
                <div key={activity} className="flex items-center justify-between">
                  <Badge variant="outline">{activity.replace(/_/g, ' ')}</Badge>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-purple-500 h-2 rounded-full"
                        style={{ width: `${(count / statistics.totalDocuments) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 w-12 text-right">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="regions" className="mt-4">
          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <MapPin className="h-5 w-5 mr-2" />
              지역별 문서 분포
            </h3>
            <div className="space-y-2">
              {getTopItems(statistics.regions, 10).map(([region, count]) => (
                <div key={region} className="flex items-center justify-between">
                  <Badge variant="secondary">{region}</Badge>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-indigo-500 h-2 rounded-full"
                        style={{ width: `${(count / statistics.totalDocuments) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 w-12 text-right">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 문서 목록 */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">분류된 문서 목록</h3>
        <ScrollArea className="h-64">
          <div className="space-y-2">
            {classifiedSources.map(source => (
              <div key={source.id} className="border rounded-lg p-3 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{source.title}</h4>
                    <div className="mt-1 flex flex-wrap gap-1">
                      <Badge variant="secondary" className="text-xs">
                        {source.metadata?.classification?.category}
                      </Badge>
                      {source.metadata?.classification?.crops.slice(0, 3).map(crop => (
                        <Badge key={crop} variant="outline" className="text-xs">
                          {crop}
                        </Badge>
                      ))}
                      {source.metadata?.classification?.confidence && (
                        <Badge variant="outline" className="text-xs">
                          {(source.metadata.classification.confidence * 100).toFixed(0)}% 신뢰도
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </Card>
    </div>
  );
};

export default AgricultureClassificationView;