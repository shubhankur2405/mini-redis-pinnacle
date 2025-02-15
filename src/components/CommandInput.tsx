
import React, { useState } from 'react';
import CodeEditor from '@uiw/react-textarea-code-editor';
import { Button } from './ui/button';
import { useToast } from './ui/use-toast';

interface CommandInputProps {
  onExecute: (command: string) => void;
}

const CommandInput: React.FC<CommandInputProps> = ({ onExecute }) => {
  const [command, setCommand] = useState('');
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!command.trim()) {
      toast({
        title: "Error",
        description: "Please enter a command",
        variant: "destructive",
      });
      return;
    }
    onExecute(command.trim());
    setCommand('');
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-2">
      <div className="glass-panel rounded-lg p-2">
        <CodeEditor
          value={command}
          language="redis"
          placeholder="Enter Redis command (e.g., SET key value)"
          onChange={(e) => setCommand(e.target.value)}
          padding={15}
          style={{
            fontSize: 14,
            backgroundColor: 'transparent',
            fontFamily: 'JetBrains Mono, monospace',
          }}
          className="command-input min-h-[60px] w-full rounded-md border-none focus:outline-none"
        />
      </div>
      <Button 
        type="submit"
        className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
      >
        Execute
      </Button>
    </form>
  );
};

export default CommandInput;
