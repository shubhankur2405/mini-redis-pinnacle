import React from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Check, RefreshCw, Database, ListOrdered, MessageSquare, SplitSquareVertical } from 'lucide-react';
import { redis } from '@/lib/redis';

const FeatureSection = ({ 
  title, 
  description, 
  children 
}: { 
  title: string; 
  description: string; 
  children: React.ReactNode;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="p-6 rounded-lg bg-card border shadow-sm"
  >
    <h3 className="text-xl font-semibold mb-2">{title}</h3>
    <p className="text-muted-foreground mb-4">{description}</p>
    {children}
  </motion.div>
);

const RDBFeature = () => {
  const [saving, setSaving] = React.useState(false);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => setSaving(false), 2000);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Button onClick={handleSave} disabled={saving}>
          <Database className="w-4 h-4 mr-2" />
          {saving ? 'Saving...' : 'Save Snapshot'}
        </Button>
        {saving && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="flex items-center text-green-500"
          >
            <Check className="w-4 h-4 mr-1" />
            Snapshot saved
          </motion.div>
        )}
      </div>
      <motion.div
        className="relative h-32 bg-secondary/20 rounded-lg overflow-hidden"
        initial={{ width: '0%' }}
        animate={{ width: saving ? '100%' : '0%' }}
        transition={{ duration: 2 }}
      >
        <div className="absolute inset-0 bg-primary/10" />
      </motion.div>
    </div>
  );
};

const SortedSetFeature = () => {
  const [items, setItems] = React.useState([
    { score: 100, member: 'player1' },
    { score: 85, member: 'player2' },
    { score: 95, member: 'player3' },
  ]);

  const sortItems = () => {
    setItems([...items].sort((a, b) => b.score - a.score));
  };

  return (
    <div className="space-y-4">
      <Button onClick={sortItems}>
        <ListOrdered className="w-4 h-4 mr-2" />
        Sort by Score
      </Button>
      <div className="space-y-2">
        {items.map((item, index) => (
          <motion.div
            key={item.member}
            layout
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center justify-between p-3 bg-secondary/10 rounded-lg"
          >
            <span>{item.member}</span>
            <span className="font-mono">{item.score}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const PubSubFeature = () => {
  const [messages, setMessages] = React.useState<string[]>([]);
  const [publishing, setPublishing] = React.useState(false);
  const [channel, setChannel] = React.useState("default-channel");
  const [subscribed, setSubscribed] = React.useState(false);
  const [newMessage, setNewMessage] = React.useState("");
  const [newChannel, setNewChannel] = React.useState("");
  const userId = React.useRef(`User-${Math.random().toString(36).slice(2, 6)}`);

  React.useEffect(() => {
    const handleMessage = (message: string) => {
      setMessages(prev => [`${message}`, ...prev]);
    };

    if (subscribed) {
      redis.subscribe(channel, handleMessage);
    }

    return () => {
      if (subscribed) {
        redis.unsubscribe(channel, handleMessage);
      }
    };
  }, [channel, subscribed]);

  const publish = () => {
    if (!newMessage.trim()) return;
    setPublishing(true);
    const formattedMessage = `${userId.current}: ${newMessage}`;
    redis.publish(channel, formattedMessage);
    setNewMessage("");
    setTimeout(() => setPublishing(false), 500);
  };

  const toggleSubscription = () => {
    if (!subscribed && newChannel.trim()) {
      setChannel(newChannel);
    }
    setSubscribed(!subscribed);
    if (subscribed) {
      setMessages([]);
    }
  };

  return (
    <div className="space-y-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-2 bg-primary/5 rounded-lg text-sm text-muted-foreground"
      >
        Your ID: {userId.current}
      </motion.div>

      <div className="flex flex-col gap-4">
        <div className="flex gap-2 items-center">
          <input
            type="text"
            value={newChannel}
            onChange={(e) => setNewChannel(e.target.value)}
            placeholder="Enter channel name"
            className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 flex-1"
            disabled={subscribed}
          />
          <Button 
            onClick={toggleSubscription}
            variant={subscribed ? "destructive" : "default"}
            disabled={!newChannel.trim() && !subscribed}
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            {subscribed ? 'Unsubscribe' : 'Subscribe'}
          </Button>
        </div>

        <div className="flex gap-2 items-center">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Enter your message"
            className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 flex-1"
          />
          <Button 
            onClick={publish} 
            disabled={publishing || !newMessage.trim()}
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Publish
          </Button>
        </div>
      </div>

      {subscribed && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="p-3 bg-green-500/10 text-green-600 rounded-lg"
        >
          Subscribed to channel: {channel}
        </motion.div>
      )}

      <div className="space-y-2 max-h-48 overflow-y-auto">
        {messages.map((msg, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="p-3 bg-secondary/10 rounded-lg"
          >
            {msg}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const TransactionFeature = () => {
  const [steps, setSteps] = React.useState<string[]>([]);
  const [executing, setExecuting] = React.useState(false);

  const executeTransaction = () => {
    setExecuting(true);
    setSteps([]);
    const transaction = [
      'BEGIN TRANSACTION',
      'SET key1 "value1"',
      'INCR counter',
      'COMMIT'
    ];

    transaction.forEach((step, index) => {
      setTimeout(() => {
        setSteps(prev => [...prev, step]);
        if (index === transaction.length - 1) {
          setExecuting(false);
        }
      }, index * 1000);
    });
  };

  return (
    <div className="space-y-4">
      <Button onClick={executeTransaction} disabled={executing}>
        <SplitSquareVertical className="w-4 h-4 mr-2" />
        Execute Transaction
      </Button>
      <div className="space-y-2">
        {steps.map((step, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="p-3 bg-secondary/10 rounded-lg font-mono text-sm"
          >
            {step}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const Features = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold tracking-tight"
          >
            Features
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground"
          >
            Explore our Redis-like implementation features
          </motion.p>
        </div>

        <Tabs defaultValue="rdb" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="rdb">RDB Persistence</TabsTrigger>
            <TabsTrigger value="sorted-sets">Sorted Sets</TabsTrigger>
            <TabsTrigger value="pubsub">Pub/Sub</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
          </TabsList>

          <TabsContent value="rdb">
            <FeatureSection
              title="RDB Persistence"
              description="Snapshot-based persistence that saves the dataset to disk at specified intervals."
            >
              <RDBFeature />
            </FeatureSection>
          </TabsContent>

          <TabsContent value="sorted-sets">
            <FeatureSection
              title="Sorted Sets"
              description="Ordered collections of unique members, where each member has an associated score."
            >
              <SortedSetFeature />
            </FeatureSection>
          </TabsContent>

          <TabsContent value="pubsub">
            <FeatureSection
              title="Pub/Sub Messaging"
              description="Pattern-based publish/subscribe messaging system."
            >
              <PubSubFeature />
            </FeatureSection>
          </TabsContent>

          <TabsContent value="transactions">
            <FeatureSection
              title="Transactions"
              description="Execute multiple commands atomically with MULTI/EXEC."
            >
              <TransactionFeature />
            </FeatureSection>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Features;
