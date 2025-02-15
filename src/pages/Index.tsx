
import { useState } from 'react';
import CommandInput from '@/components/CommandInput';
import ResponseView from '@/components/ResponseView';
import CommandHistory from '@/components/CommandHistory';
import { redis } from '@/lib/redis';
import { useToast } from '@/components/ui/use-toast';

interface CommandResult {
  command: string;
  result: any;
  timestamp: number;
}

const Index = () => {
  const [history, setHistory] = useState<CommandResult[]>([]);
  const [lastResponse, setLastResponse] = useState<CommandResult | null>(null);
  const { toast } = useToast();

  const executeCommand = (commandStr: string) => {
    const tokens = commandStr.split(' ');
    const command = tokens[0].toUpperCase();
    const args = tokens.slice(1);

    let result;
    try {
      switch (command) {
        case 'SET':
          if (args.length < 2) throw new Error('SET requires key and value');
          const ttl = args[3] && args[2]?.toUpperCase() === 'EX' ? parseInt(args[3]) : undefined;
          result = redis.set(args[0], args[1], ttl);
          break;
        case 'GET':
          if (args.length !== 1) throw new Error('GET requires exactly one key');
          result = redis.get(args[0]);
          break;
        case 'DEL':
          if (args.length !== 1) throw new Error('DEL requires exactly one key');
          result = redis.del(args[0]);
          break;
        case 'TTL':
          if (args.length !== 1) throw new Error('TTL requires exactly one key');
          result = redis.ttl(args[0]);
          break;
        default:
          throw new Error(`Unknown command: ${command}`);
      }

      const response = {
        command: commandStr,
        result,
        timestamp: Date.now(),
      };

      setLastResponse(response);
      setHistory((prev) => [response, ...prev]);

    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-2 mb-8">
          <h1 className="text-4xl font-bold tracking-tight">Mini Redis</h1>
          <p className="text-muted-foreground">
            A lightweight Redis-like key-value store implementation
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-[2fr,1fr]">
          <div className="space-y-6">
            <CommandInput onExecute={executeCommand} />
            <ResponseView response={lastResponse} />
          </div>
          <CommandHistory history={history} />
        </div>
      </div>
    </div>
  );
};

export default Index;
