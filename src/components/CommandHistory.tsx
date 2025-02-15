
import React from 'react';

interface HistoryItem {
  command: string;
  result: any;
  timestamp: number;
}

interface CommandHistoryProps {
  history: HistoryItem[];
}

const CommandHistory: React.FC<CommandHistoryProps> = ({ history }) => {
  return (
    <div className="glass-panel rounded-lg p-4">
      <h2 className="text-sm font-medium mb-4">Command History</h2>
      <div className="space-y-2">
        {history.map((item, index) => (
          <div key={index} className="history-item rounded p-2 text-sm">
            <div className="text-primary-foreground/60">{item.command}</div>
            <div className="text-xs text-muted-foreground">
              {new Date(item.timestamp).toLocaleTimeString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CommandHistory;
