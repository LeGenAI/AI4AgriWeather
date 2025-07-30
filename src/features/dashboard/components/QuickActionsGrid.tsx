import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { 
  Cloud, 
  Wheat, 
  Calendar,
  TrendingUp
} from 'lucide-react';
import { Link } from 'react-router-dom';

export function QuickActionsGrid() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>
          Common tasks and information
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" asChild className="h-auto flex-col py-4">
            <Link to="/chat">
              <Cloud className="h-8 w-8 mb-2 text-blue-600" />
              <span>Ask About Weather</span>
            </Link>
          </Button>
          <Button variant="outline" asChild className="h-auto flex-col py-4">
            <Link to="/knowledge">
              <Wheat className="h-8 w-8 mb-2 text-green-600" />
              <span>Knowledge Base</span>
            </Link>
          </Button>
          <Button variant="outline" asChild className="h-auto flex-col py-4">
            <Link to="/crops">
              <Calendar className="h-8 w-8 mb-2 text-orange-600" />
              <span>Planting Calendar</span>
            </Link>
          </Button>
          <Button variant="outline" asChild className="h-auto flex-col py-4">
            <Link to="/community">
              <TrendingUp className="h-8 w-8 mb-2 text-purple-600" />
              <span>Market Prices</span>
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}