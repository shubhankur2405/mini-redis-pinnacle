# Mini Redis 

A lightweight and minimal Redis clone built for learning and experimentation. This project implements core Redis features such as key-value storage, persistence, transactions, and publish-subscribe messaging.

## 🚀 Deployment
[Live Demo](https://mini-redis-pinnacle.lovable.app/)

## 📌 Features
✅ **Key-Value Store** - Supports basic GET and SET operations  
✅ **Persistence (RDB Snapshots)** - Saves database state at intervals  
✅ **Transactions** - Supports MULTI, EXEC, and DISCARD commands  
✅ **In-Memory Storage** - High-speed operations for fast access  
✅ **Lightweight and Fast** - Optimized for performance and minimal resource usage  
✅ **Publish-Subscribe (Pub/Sub)** - Real-time messaging between clients

✅ **Persistence** -Data is automatically saved to localStorage every 5 seconds,Data is loaded from localStorage when the Redis instance is created.All operations that modify data trigger a save to storage

✅ **Eviction Policies** :Implemented both LRU (Least Recently Used) and LFU (Least Frequently Used) Default policy is LRU.Maximum entries limit (default: 1000).Automatic eviction when limit is reached
.Tracking of access time and frequency for each entry  

## 🛠 Installation
```bash
# Clone the repository
git clone https://github.com/shubhankur2405/mini-redis-pinnacle.git
cd mini-redis-pinnacle

# Install dependencies (if applicable)
npm install  # or pip install -r requirements.txt (if Python-based)

# Start the server
npm start  # or python server.py (if Python-based)
```

## 🎮 Usage
### Start the Redis Server
```bash
npm start  # or python server.py
```

### Basic Commands
```bash
SET user Kartikey
GET user
# Output: Kartikey

MULTI
SET balance 100
INCR balance
EXEC
# Output: 101
```

### RDB Persistence Example
```bash
SAVE  # Creates a snapshot (dump.rdb)
RESTART SERVER
GET user
# Output: Kartikey (Data restored!)
```

### Pub/Sub Messaging Example
```bash
SUBSCRIBE news
# Client 1: Subscribed to 'news'

PUBLISH news "Breaking: Mini Redis now supports Pub/Sub!"
# Output (Client 1): Breaking: Mini Redis now supports Pub/Sub!
```

## 🏗 High-Level Design (HLD)

### 1️⃣ Architecture Overview
- **Client-Server Model**: The system follows a TCP-based client-server architecture where multiple clients can send commands to the Redis server.
- **Command Execution Pipeline**: Commands are parsed and executed using an efficient event-driven mechanism.
- **In-Memory Storage**: All data is stored in an in-memory data structure for quick access.
- **Persistence Layer (RDB Snapshots)**: Periodic snapshots save the in-memory data to disk to prevent data loss.
- **Transaction Handling**: Commands are executed atomically when grouped under a transaction.
- **Pub/Sub Messaging**: Clients can subscribe to channels and receive real-time updates when a message is published.

### 2️⃣ Components Breakdown
```
mini-redis-pinnacle/
├── src/
│   ├── server.js        # Handles client requests and command execution
│   ├── storage.js       # Implements in-memory key-value store
│   ├── persistence.js   # RDB snapshot functionality for data persistence
│   ├── transactions.js  # Implements MULTI, EXEC, and DISCARD
│   ├── pubsub.js        # Implements Publish-Subscribe functionality
│   ├── networking.js    # Handles TCP client connections
│   ├── parser.js        # Parses incoming Redis commands
├── README.md            # Project documentation
├── package.json         # Dependencies (if Node.js-based)
└── dump.rdb             # Redis snapshot file
```

### 3️⃣ Workflow
1. **Client sends a command** (e.g., `SET key value` or `GET key`).
2. **Server parses the command** and determines the operation.
3. **Execution in in-memory storage** (hash maps, lists, etc.).
4. **If persistence is enabled**, data is periodically saved to `dump.rdb`.
5. **Transactions** execute multiple commands atomically.
6. **Pub/Sub messages** are sent to subscribed clients in real-time.
7. **Server responds** with success or error messages.

## 🤝 Contributing
Feel free to fork this repo, submit issues, or open pull requests. Contributions are welcome!

## 📜 License
This project is licensed under the MIT License.

---
💡 **Built for learning Redis internals and performance optimizations.**

