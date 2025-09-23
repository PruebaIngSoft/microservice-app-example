'use strict';

class CacheService {
    constructor(redisClient) {
        this._redisClient = redisClient;
        this._defaultTTL = 300; // 5 minutes
    }

    // Cache Aside Pattern: Check cache first
    async get(key) {
        return new Promise((resolve, reject) => {
            this._redisClient.get(key, (err, result) => {
                if (err) {
                    console.error('Redis GET error:', err);
                    resolve(null); // Fallback to null on error
                } else {
                    try {
                        resolve(result ? JSON.parse(result) : null);
                    } catch (parseErr) {
                        console.error('JSON parse error:', parseErr);
                        resolve(null);
                    }
                }
            });
        });
    }

    // Cache Aside Pattern: Store in cache after database read
    async set(key, value, ttl = this._defaultTTL) {
        return new Promise((resolve, reject) => {
            const serializedValue = JSON.stringify(value);
            this._redisClient.setex(key, ttl, serializedValue, (err) => {
                if (err) {
                    console.error('Redis SET error:', err);
                }
                resolve(); // Don't fail the operation if cache fails
            });
        });
    }

    // Cache Aside Pattern: Invalidate cache on data modification
    async del(key) {
        return new Promise((resolve, reject) => {
            this._redisClient.del(key, (err) => {
                if (err) {
                    console.error('Redis DEL error:', err);
                }
                resolve(); // Don't fail the operation if cache fails
            });
        });
    }

    generateUserTodosKey(username) {
        return `todos:user:${username}`;
    }
}

module.exports = CacheService;