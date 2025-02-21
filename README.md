# Mini Redis

A lightweight and minimal Redis clone built for learning and experimentation. This project implements core Redis features such as key-value storage, persistence, transactions, and publish-subscribe messaging.

## 🚀 Deployment

[Live Demo](https://mini-redis-pinnacle.lovable.app/)

## 📌 Features

✅ **Key-Value Store** - Supports basic GET and SET operations\
✅ **Persistence (RDB Snapshots)** - Saves database state at intervals\
✅ **Transactions** - Supports MULTI, EXEC, and DISCARD\
✅ **Publish-Subscribe Messaging** - Implements a pub/sub system\
✅ **LRU Caching** - Implements least recently used eviction policy\
✅ **Basic Replication** - Supports primary-replica setup\
✅ **TTL (Time-To-Live)** - Expires keys automatically after a set time

---

## 🏗 High-Level Design (HLD)

### System Overview

Mini Redis is designed as a single-node in-memory key-value store that mimics core Redis functionalities. It follows an event-driven architecture and uses an async I/O model for handling multiple client connections.

### Architecture Diagram

```
+----------------------+   +------------------+   +------------------+
|      Client         |-->|     Command      |-->|   Data Store     |
| (CLI / API Client)  |   |   Processor     |   |  (In-memory DB)  |
+----------------------+   +------------------+   +------------------+
         |                        |                      |
         v                        v                      v
+----------------------+   +------------------+   +------------------+
|    Pub/Sub Engine   |   |  Persistence    |   | Replication Manager |
+----------------------+   +------------------+   +------------------+
```

### Components

1. **Command Processor** - Parses and executes commands.
2. **In-Memory Data Store** - Stores key-value pairs.
3. **Persistence Manager** - Handles RDB snapshot saving.
4. **Pub/Sub Engine** - Manages message channels for communication.
5. **Replication Manager** - Ensures data synchronization between primary and replicas.

---

## 🔍 Low-Level Design (LLD)

### Key Data Structures

- **Dictionary (HashMap)** - Used for storing key-value pairs.
- **Doubly Linked List** - Implements LRU eviction policy.
- **Set and Hash Tables** - Support Redis-like data types.
- **Append-Only File (AOF) Log** - Ensures durability.

### Core Algorithms

- **GET/SET Operations**: Hash table lookups.
- **LRU Eviction**: Uses a priority queue to track key access order.
- **Persistence (RDB Snapshots)**: Periodic background saves using a forked process.
- **Replication**: Asynchronous log shipping to replica nodes.

---

## 🛠 Installation & Setup

```bash
# Clone the repository
git clone https://github.com/your-username/mini-redis.git
cd mini-redis

# Install dependencies
npm install  # or use yarn

# Run the server
npm start
```

---

## 📝 API Reference

| Command          | Description                     | Example                 |
| ---------------- | ------------------------------- | ----------------------- |
| `SET key value`  | Stores a key-value pair         | `SET user 123`          |
| `GET key`        | Retrieves the value of a key    | `GET user` → `123`      |
| `DEL key`        | Deletes a key-value pair        | `DEL user`              |
| `EXPIRE key n`   | Sets a TTL for a key (n sec)    | `EXPIRE user 10`        |
| `PUBLISH ch msg` | Sends a message to a channel    | `PUBLISH news "Hello!"` |
| `SUBSCRIBE ch`   | Subscribes to a message channel | `SUBSCRIBE news`        |

---

## ⚡ Performance & Benchmarking

To test performance:

```bash
redis-benchmark -n 10000 -c 50 -t set,get
```

Sample Results:

```
SET: 50,000 ops/sec
GET: 55,000 ops/sec
```

---

## 📌 Future Improvements

- Implement **AOF persistence** for better durability.
- Improve **multi-threading** for higher throughput.
- Add **Cluster Mode** for horizontal scaling.

---

## 🤝 Contributing

1. Fork the repository.
2. Create a new branch: `git checkout -b feature-branch`.
3. Make changes and commit: `git commit -m 'Added new feature'`.
4. Push to the branch: `git push origin feature-branch`.
5. Open a Pull Request.

---
