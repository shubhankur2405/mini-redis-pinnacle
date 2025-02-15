
import React, { useState } from 'react';
import { motion } from 'framer-motion';

const ArchitectureDiagram = () => (
  <div className="w-full h-64 bg-secondary/20 rounded-lg p-4 flex items-center justify-center">
    <div className="text-center text-muted-foreground">
      Architecture diagram placeholder
    </div>
  </div>
);

const SystemDesignPage = () => {
  const [activeTab, setActiveTab] = useState<'hld' | 'lld'>('hld');

  const sections = {
    hld: [
      {
        title: "System Components",
        content: [
          "In-Memory Data Store: Core key-value storage engine",
          "Persistence Layer: RDB snapshots and AOF logs",
          "Network Layer: TCP server with RESP protocol",
          "Replication Manager: Master-slave coordination",
        ]
      },
      {
        title: "Data Flow",
        content: [
          "Client request processing pipeline",
          "Command execution and response handling",
          "Background tasks (expiry, persistence)",
          "Replication synchronization",
        ]
      },
      {
        title: "Scalability",
        content: [
          "Horizontal scaling through sharding",
          "Master-slave replication for read scaling",
          "Connection pooling and multiplexing",
          "Cluster management and coordination",
        ]
      }
    ],
    lld: [
      {
        title: "Data Structures",
        content: [
          "Hash tables for key-value mapping",
          "Skip lists for sorted sets",
          "Linked lists for list operations",
          "Radix trees for key space organization",
        ]
      },
      {
        title: "Memory Management",
        content: [
          "Memory allocator design",
          "LRU/LFU eviction implementations",
          "Reference counting and garbage collection",
          "Memory optimization techniques",
        ]
      },
      {
        title: "Concurrency Control",
        content: [
          "Lock-free data structures",
          "Atomic operations implementation",
          "Transaction isolation levels",
          "Event loop architecture",
        ]
      }
    ]
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">System Design</h1>
          <p className="text-muted-foreground">
            High-level and low-level design documentation
          </p>
        </div>

        <div className="flex gap-4 justify-center">
          <button
            onClick={() => setActiveTab('hld')}
            className={`px-4 py-2 rounded-lg transition-all ${
              activeTab === 'hld'
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary hover:bg-secondary/80'
            }`}
          >
            High-Level Design
          </button>
          <button
            onClick={() => setActiveTab('lld')}
            className={`px-4 py-2 rounded-lg transition-all ${
              activeTab === 'lld'
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary hover:bg-secondary/80'
            }`}
          >
            Low-Level Design
          </button>
        </div>

        <ArchitectureDiagram />

        <div className="grid gap-6 md:grid-cols-3">
          {sections[activeTab].map((section, index) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass-panel p-6 rounded-lg space-y-4"
            >
              <h3 className="text-lg font-semibold">{section.title}</h3>
              <ul className="space-y-2">
                {section.content.map((item, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-primary">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SystemDesignPage;
