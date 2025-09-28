'use strict';
const CircuitBreaker = require('opossum');

const options = {
    timeout: 3000,                  // 3 seconds timeout
    errorThresholdPercentage: 50,   // Open after 50% failures
    resetTimeout: 30000,            // Try again after 30 seconds
    rollingCountTimeout: 10000,     // 10 second rolling window
    rollingCountBuckets: 10,        // Number of buckets for rolling window
    volumeThreshold: 5              // Minimum calls before calculating error rate
};

class CircuitBreakerService {
    constructor() {
        this.breakers = new Map();
    }

    createBreaker(name, asyncFunction, customOptions = {}) {
        const finalOptions = { ...options, ...customOptions };
        const breaker = new CircuitBreaker(asyncFunction, finalOptions);
        
        // Event listeners for monitoring
        breaker.on('open', () => {
            console.log(`[CIRCUIT-BREAKER] ${name} is OPEN - blocking requests`);
        });
        
        breaker.on('halfOpen', () => {
            console.log(`[CIRCUIT-BREAKER] ${name} is HALF-OPEN - testing service`);
        });
        
        breaker.on('close', () => {
            console.log(`[CIRCUIT-BREAKER] ${name} is CLOSED - normal operation`);
        });

        breaker.on('failure', (error) => {
            console.log(`[CIRCUIT-BREAKER] ${name} failure:`, error.message);
        });

        breaker.on('success', () => {
            console.log(`[CIRCUIT-BREAKER] ${name} success`);
        });

        breaker.on('fallback', (result) => {
            console.log(`[CIRCUIT-BREAKER] ${name} fallback executed`);
        });
        
        this.breakers.set(name, breaker);
        return breaker;
    }

    getBreaker(name) {
        return this.breakers.get(name);
    }

    getBreakerStats(name) {
        const breaker = this.breakers.get(name);
        if (!breaker) return null;

        return {
            name: name,
            state: breaker.state,
            stats: breaker.stats,
            isOpen: breaker.opened,
            isHalfOpen: breaker.halfOpen,
            isClosed: breaker.closed
        };
    }

    getAllBreakerStats() {
        const stats = {};
        for (const [name, breaker] of this.breakers) {
            stats[name] = this.getBreakerStats(name);
        }
        return stats;
    }
}

module.exports = new CircuitBreakerService();