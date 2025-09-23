'use strict';
const cache = require('memory-cache');
const CacheService = require('./cacheService');
const {Annotation, 
    jsonEncoder: {JSON_V2}} = require('zipkin');

const OPERATION_CREATE = 'CREATE',
      OPERATION_DELETE = 'DELETE';

class TodoController {
    constructor({tracer, redisClient, logChannel}) {
        this._tracer = tracer;
        this._redisClient = redisClient;
        this._logChannel = logChannel;
        this._cacheService = new CacheService(redisClient);
    }

    // Cache Aside Pattern Implementation
    async list(req, res) {
        const username = req.user.username;
        const cacheKey = this._cacheService.generateUserTodosKey(username);

        try {
            // 1. Check cache first (Cache Aside Pattern)
            console.log(`[CACHE-ASIDE] Checking cache for user: ${username}`);
            let todoData = await this._cacheService.get(cacheKey);

            if (todoData) {
                console.log(`[CACHE-ASIDE] Cache HIT for user: ${username}`);
                res.json({
                    items: Object.values(todoData.items),
                    source: 'cache',
                    cacheHit: true
                });
                return;
            }

            // 2. Cache miss - get from "database" (memory-cache in this case)
            console.log(`[CACHE-ASIDE] Cache MISS for user: ${username}`);
            todoData = this._getTodoDataFromDatabase(username);

            // 3. Store in cache for next time (Cache Aside Pattern)
            await this._cacheService.set(cacheKey, todoData, 600); // 10 minutes TTL
            console.log(`[CACHE-ASIDE] Data cached for user: ${username}`);

            res.json({
                items: Object.values(todoData.items),
                source: 'database',
                cacheHit: false
            });

        } catch (error) {
            console.error('Error in list operation:', error);
            // Fallback to direct database access
            const todoData = this._getTodoDataFromDatabase(username);
            res.json({
                items: Object.values(todoData.items),
                source: 'database_fallback',
                cacheHit: false
            });
        }
    }

    async create(req, res) {
        const username = req.user.username;
        const cacheKey = this._cacheService.generateUserTodosKey(username);

        try {
            // Get current data
            const data = this._getTodoDataFromDatabase(username);
            const todo = {
                content: req.body.content,
                id: data.lastInsertedID
            };
            
            // Update data
            data.items[data.lastInsertedID] = todo;
            data.lastInsertedID++;
            this._setTodoDataInDatabase(username, data);

            // Cache Aside Pattern: Invalidate cache on data modification
            console.log(`[CACHE-ASIDE] Invalidating cache for user: ${username} (CREATE operation)`);
            await this._cacheService.del(cacheKey);

            this._logOperation(OPERATION_CREATE, username, todo.id);

            res.json({
                ...todo,
                cacheInvalidated: true
            });

        } catch (error) {
            console.error('Error in create operation:', error);
            res.status(500).json({ error: 'Failed to create todo' });
        }
    }

    async delete(req, res) {
        const username = req.user.username;
        const cacheKey = this._cacheService.generateUserTodosKey(username);
        const id = req.params.taskId;

        try {
            // Update data
            const data = this._getTodoDataFromDatabase(username);
            delete data.items[id];
            this._setTodoDataInDatabase(username, data);

            // Cache Aside Pattern: Invalidate cache on data modification  
            console.log(`[CACHE-ASIDE] Invalidating cache for user: ${username} (DELETE operation)`);
            await this._cacheService.del(cacheKey);

            this._logOperation(OPERATION_DELETE, username, id);

            res.status(204).json({ cacheInvalidated: true });

        } catch (error) {
            console.error('Error in delete operation:', error);
            res.status(500).json({ error: 'Failed to delete todo' });
        }
    }

    _logOperation(opName, username, todoId) {
        this._tracer.scoped(() => {
            const traceId = this._tracer.id;
            this._redisClient.publish(this._logChannel, JSON.stringify({
                zipkinSpan: traceId,
                opName: opName,
                username: username,
                todoId: todoId,
            }));
        });
    }

    // Renamed to clarify this is "database" access
    _getTodoDataFromDatabase(userID) {
        var data = cache.get(userID);
        if (data == null) {
            data = {
                items: {
                    '1': {
                        id: 1,
                        content: "Create new todo",
                    },
                    '2': {
                        id: 2,
                        content: "Update me",
                    },
                    '3': {
                        id: 3,
                        content: "Delete example ones",
                    }
                },
                lastInsertedID: 4 // Fixed: should be 4, not 3
            };

            this._setTodoDataInDatabase(userID, data);
        }
        return data;
    }

    _setTodoDataInDatabase(userID, data) {
        cache.put(userID, data);
    }
}

module.exports = TodoController;