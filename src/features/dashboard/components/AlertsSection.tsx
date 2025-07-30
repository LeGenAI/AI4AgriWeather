import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface Alert {
  type: 'warning' | 'info';
  message: string;
  urgent: boolean;
}

interface AlertsSectionProps {
  alerts: Alert[];
}

export function AlertsSection({ alerts }: AlertsSectionProps) {
  if (alerts.length === 0) return null;

  return (
    <div className="mb-6 space-y-3">
      {alerts.map((alert, index) => (
        <div
          key={index}
          className={`p-4 rounded-lg flex items-start space-x-3 ${
            alert.type === 'warning' 
              ? 'bg-orange-50 border border-orange-200' 
              : 'bg-blue-50 border border-blue-200'
          }`}
        >
          <AlertTriangle className={`h-5 w-5 ${
            alert.type === 'warning' ? 'text-orange-600' : 'text-blue-600'
          }`} />
          <p className={`text-sm ${
            alert.type === 'warning' ? 'text-orange-800' : 'text-blue-800'
          }`}>
            {alert.message}
          </p>
        </div>
      ))}
    </div>
  );
}