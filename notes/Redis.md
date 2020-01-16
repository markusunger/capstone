_Redis_ (https://redis.io)  is an open source, in-memory data structure store, most commonly used as a database, a cache or a message broker.

# Data Structures

Redis keys are (binary-safe) strings and values can be one of several data structures:

- Strings
- Lists (implemented as linked lists, therefore making insert operations ath the head or tail very fast)
- Hashes (field-value pairs)
- Sets (unordered collections of unique strings with useful methods for testing if an element exists or creating intersections, unions etc.)
- Sorted Sets (similar to Sets but with an associated floating point score for each element that an be used for sorting, filtering etc.)
- Bitmaps (to do bit-oriented operations on a string type)
- HyperLogLogs (a probabilistic data structure for estimating the cardinality [distinct elements] of a set and is very efficient for that)

# Usage

`EXISTS <key(s)>` checks for the existence of a specific key (or multiple keys), returning an integer representing the number of existing keys (`0` if none are present etc.).

`DEL <key(s)>` deletes the key (or multiple keys) and returns an integer value representing the number of affected keys (`0` if the specified key did not exist, `1` when a key got deleted etc.).

`TYPE <key>` returns the type of the value (as a string) stored under the specified key.

## String operations

`SET <key> <value>` sets the specified key to a given value. If the key doesn't exist, it gets created; if it already exists, then by default the current value is overwritten with the new one (even if it doesn't match the current data structure).  
`SET` supports various options. An appended `NX` will set the key only if it *does not* already exist, while `XX` will set the key only if it *does* already exist.  
The return value of `SET` is a simple string and either `OK` (if the operation was executed successfully) or a so-called _null bulk string_ (`"$-1\r\n"`, meaning a binary safe string with no length and no data) that should be converted to the `null` equivalent of a client libraries language (like `nil` in Ruby or `null` in JS).  
Both the `EX <seconds>` or `PX <milliseconds>` options can be used to set a specific expiration time after which the key and its associated value is deleted. `TTL <key>` returns an integer value representing how much time is left before the key expires. `EXPIRE` can set a key to expire or change an already expiring key, `PERSIST` can remove expiry dates and make a key persistent forever.

`GET <key>` retrieves the current value for the specified key. If the key doesn't exist, `nil` gets returned as the same _null bulk string_ described under `SET`.

There are a few other helpful string operation commands available. `INCR` parses a string value as an integer and increments it by one. This is an atomic operation, so no race conditions are possible for two clients getting a value at the same time and then trying to increment it to the same nw value. `DECR`, `INCRBY` and `DECRBY` work in the expected way.  
`GETSET <key> <value>` sets a key to a new value and returns the old value previously stored under the key.

## List operations

`LPUSH <list-key> <value(s)>` and `RPUSH <list-key> <value(s)>` add items to a list at the head or tail. With `LRANGE <start-index> <end-index>`  all elements with indices being equal to the range limit or inside of the range will be returned.  
`LPOP <list-key>` and `RPOP <list-key>` remove elements fro meither the head or the tail of the list, returning them afterwards. Both return `null` if there are no elements in the list. 

A more thorough guide to Redis data structures (with hyperlinked commands etc.) can be found [here](https://redis.io/topics/data-types-intro).

# Persistence

Redis can be run as a pure in-memory store with no persistence after a server restart. For most use cases, though, some type of persistence is necessary to prevent a complete data loss during e.g. power outages, server errors etc.

There are two types of persistence offered by Redis:

- RDB snapshots
- AOF writes

## RDB

RDB creates a single-file representation of the Redis data at a specific point in time. Those snapshots can be created at certain intervals when at least a specified number of writes have occured. RDB snapshots are written by a forked process, meaning that the parent instance (i.e. the process serving requests) will never do the necessary disk I/O itself. 

To enable or configure RDB snapshotting, the `redis.conf` provides the `save` command in the form of `save <seconds> <changes>`. `save 900 1` enables snapshotting after 900 seconds (15 minute) when at least 1 key has changed.

RDB as the only persistence option is fine when it only needs to act as a backup or when data losses from a few minutes don't matter for the use case.

## AOF

AOF (append-only file) writes a persistent log of all operations. So on a server restart, it can play all operations in the correct order from the AOF and thus restore the complete dataset.
This log can easily be parsed as it contains the same command one would issue via e.g. `redis-cli` or can even be sent over a network to bring another Redis instance to the current dataset state.