
import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface Feature {
  category: string;
  title: string;
  description: string;
  example?: string;
  animation?: string;
}

const features: { [key: string]: Feature[] } = {
  "Core Features": [
    {
      category: "Storage",
      title: "Key-Value Store",
      description: "The fundamental building block. Store any value with a unique key, like storing user preferences or session data.",
      example: "SET user:1:name 'John' / GET user:1:name",
    },
    {
      category: "Storage",
      title: "Data Expiry (TTL)",
      description: "Set automatic expiration times for keys. Perfect for caching and temporary data storage.",
      example: "SET session:123 'data' EX 3600",
    },
    {
      category: "Persistence",
      title: "RDB & AOF",
      description: "RDB creates point-in-time snapshots, while AOF logs every write operation for durability.",
    },
    {
      category: "Data Structures",
      title: "Lists, Hashes, Sets",
      description: "Support for complex data structures. Lists for queues, Hashes for objects, Sets for unique collections.",
      example: "LPUSH mylist value / HSET user:1 name John age 30",
    }
  ],
  "Advanced Features": [
    {
      category: "Performance",
      title: "LRU/LFU Eviction",
      description: "Automatically remove least recently/frequently used items when memory is full.",
    },
    {
      category: "Scaling",
      title: "Cluster Mode",
      description: "Distribute data across multiple nodes for horizontal scaling and higher availability.",
    },
    {
      category: "Performance",
      title: "Pipelining",
      description: "Batch multiple commands together to reduce network overhead and improve throughput.",
    },
    {
      category: "Consistency",
      title: "Transactions",
      description: "Execute multiple commands atomically, ensuring data consistency.",
      example: "MULTI / SET x 1 / SET y 2 / EXEC",
    }
  ],
  "Bonus Features": [
    {
      category: "Extensibility",
      title: "Lua Scripting",
      description: "Execute custom Lua scripts for complex operations atomically.",
    },
    {
      category: "Specialized",
      title: "Geo-Spatial",
      description: "Store and query location-based data efficiently.",
      example: "GEOADD locations 151.2094 -33.8688 'Sydney'",
    },
    {
      category: "Probabilistic",
      title: "Bloom Filters",
      description: "Space-efficient probabilistic data structure for membership testing.",
    },
    {
      category: "Security",
      title: "ACL & Auth",
      description: "Role-based access control and authentication for secure data access.",
    }
  ]
};

const FeaturePage = () => {
  const [selectedCategory, setSelectedCategory] = useState("Core Features");

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Features Overview</h1>
          <p className="text-muted-foreground">
            Comprehensive guide to Mini Redis capabilities
          </p>
        </div>

        <div className="flex gap-4 justify-center">
          {Object.keys(features).map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg transition-all ${
                selectedCategory === category
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary hover:bg-secondary/80'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features[selectedCategory].map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass-panel p-6 rounded-lg space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <div className="h-3 w-3 rounded-full bg-primary animate-pulse" />
                </div>
                <h3 className="text-lg font-semibold">{feature.title}</h3>
              </div>
              <p className="text-muted-foreground">{feature.description}</p>
              {feature.example && (
                <div className="bg-secondary/50 p-3 rounded-md">
                  <code className="text-sm font-mono">{feature.example}</code>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FeaturePage;
