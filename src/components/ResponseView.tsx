
import React from 'react';
import { format } from 'date-fns';
import { redis } from '@/lib/redis';

interface ResponseViewProps {
  response: {
    command: string;
    result: any;
    timestamp: number;
  } | null;
}

const ResponseView: React.FC<ResponseViewProps> = ({ response }) => {
  if (!response) return null;

  const formatResult = (result: any) => {
    if (result === null) return '(nil)';
    if (typeof result === 'number') return result.toString();
    return result;
  };

  const getEntryMetrics = (key: string) => {
    return redis.getMetrics(key);
  };

  const renderMetrics = () => {
    const tokens = response.command.split(' ');
    const command = tokens[0].toUpperCase();
    if (command === 'GET' && tokens[1]) {
      const metrics = getEntryMetrics(tokens[1]);
      if (metrics) {
        return (
          <div className="text-xs text-muted-foreground mt-2 space-y-1">
            <div>Last Accessed: {format(metrics.lastAccessed, 'HH:mm:ss')}</div>
            <div>Access Count: {metrics.accessCount}</div>
          </div>
        );
      }
    }
    return null;
  };

  return (
    <div className="glass-panel rounded-lg p-4 space-y-2">
      <div className="flex justify-between items-center text-sm text-muted-foreground">
        <span className="font-medium">Response</span>
        <span>{new Date(response.timestamp).toLocaleTimeString()}</span>
      </div>
      <div className="response-text text-sm">
        <div className="text-primary-foreground/60">{`>`} {response.command}</div>
        <div className="mt-1 font-medium">{formatResult(response.result)}</div>
        {renderMetrics()}
      </div>
    </div>
  );
};

export default ResponseView;
