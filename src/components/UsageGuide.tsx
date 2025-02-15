
import React, { useState, useEffect } from 'react';

interface CommandExample {
  command: string;
  description: string;
  example: string;
  output: string;
}

const commands: CommandExample[] = [
  {
    command: 'SET',
    description: 'Set a key-value pair, optionally with expiration',
    example: 'SET username john',
    output: 'OK'
  },
  {
    command: 'GET',
    description: 'Retrieve a value by key',
    example: 'GET username',
    output: 'john'
  },
  {
    command: 'DEL',
    description: 'Delete a key',
    example: 'DEL username',
    output: '1'
  },
  {
    command: 'TTL',
    description: 'Get time-to-live for a key in seconds',
    example: 'SET token abc EX 60',
    output: 'OK (then try: TTL token)'
  }
];

const UsageGuide: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % commands.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="glass-panel rounded-lg p-6 space-y-4">
      <h2 className="text-lg font-semibold mb-4">Command Guide</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {commands.map((cmd, index) => (
          <div
            key={cmd.command}
            className={`p-4 rounded-lg transition-all duration-300 transform ${
              index === currentIndex
                ? 'bg-primary/10 scale-105'
                : 'bg-white/5 hover:bg-white/10'
            }`}
          >
            <div className="font-mono text-primary font-medium">{cmd.command}</div>
            <div className="text-sm text-muted-foreground mt-2">{cmd.description}</div>
            <div className="mt-2 font-mono text-sm opacity-75">{cmd.example}</div>
            <div className="mt-1 text-xs text-primary/70">Output: {cmd.output}</div>
          </div>
        ))}
      </div>
      <div className="text-sm text-muted-foreground mt-4">
        <span className="font-medium">Pro Tip:</span> Set expiring keys with{' '}
        <code className="px-1 py-0.5 rounded bg-muted">SET key value EX seconds</code>
      </div>
    </div>
  );
};

export default UsageGuide;
