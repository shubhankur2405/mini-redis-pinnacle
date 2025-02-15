
import React from 'react';

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

  return (
    <div className="glass-panel rounded-lg p-4 space-y-2">
      <div className="flex justify-between items-center text-sm text-muted-foreground">
        <span className="font-medium">Response</span>
        <span>{new Date(response.timestamp).toLocaleTimeString()}</span>
      </div>
      <div className="response-text text-sm">
        <div className="text-primary-foreground/60">> {response.command}</div>
        <div className="mt-1 font-medium">{formatResult(response.result)}</div>
      </div>
    </div>
  );
};

export default ResponseView;
