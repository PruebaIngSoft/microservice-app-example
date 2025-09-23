'use strict';
const axios = require('axios');
const circuitBreakerService = require('./circuitBreakerService');

// Mock external API calls (since users-api might be down)
const callUsersApi = async (username) => {
    const usersApiUrl = process.env.USERS_API_ADDRESS || 'http://users-api:8002';
    
    try {
        const response = await axios.get(`${usersApiUrl}/users/${username}`, {
            timeout: 2000,
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        // Simulate different types of failures for demo
        if (Math.random() < 0.3) { // 30% chance of timeout simulation
            const timeoutError = new Error('Request timeout');
            timeoutError.code = 'ETIMEDOUT';
            throw timeoutError;
        }
        throw new Error(`Users API error: ${error.message}`);
    }
};

const callAuthApi = async (token) => {
    const authApiUrl = process.env.AUTH_API_ADDRESS || 'http://auth-api:8000';
    
    try {
        const response = await axios.post(`${authApiUrl}/verify`, 
            { token }, 
            {
                timeout: 2000,
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data;
    } catch (error) {
        throw new Error(`Auth API error: ${error.message}`);
    }
};

// Create circuit breakers with fallback functions
const usersApiBreaker = circuitBreakerService.createBreaker('users-api', callUsersApi);
const authApiBreaker = circuitBreakerService.createBreaker('auth-api', callAuthApi);

// Configure fallback functions
usersApiBreaker.fallback((username) => {
    console.log(`[CIRCUIT-BREAKER] Users API fallback for: ${username}`);
    return {
        username: username,
        name: 'Unknown User',
        email: `${username}@example.com`,
        fallback: true
    };
});

authApiBreaker.fallback((token) => {
    console.log(`[CIRCUIT-BREAKER] Auth API fallback for token verification`);
    return {
        valid: false,
        fallback: true,
        message: 'Authentication service unavailable'
    };
});

class ExternalApiService {
    async getUserInfo(username) {
        try {
            console.log(`[CIRCUIT-BREAKER] Calling Users API for: ${username}`);
            const result = await usersApiBreaker.fire(username);
            return result;
        } catch (error) {
            console.error(`[CIRCUIT-BREAKER] Users API call failed for ${username}:`, error.message);
            throw error;
        }
    }

    async verifyToken(token) {
        try {
            console.log(`[CIRCUIT-BREAKER] Verifying token with Auth API`);
            const result = await authApiBreaker.fire(token);
            return result;
        } catch (error) {
            console.error(`[CIRCUIT-BREAKER] Auth API call failed:`, error.message);
            throw error;
        }
    }

    getBreakerStats() {
        return circuitBreakerService.getAllBreakerStats();
    }

    // Method to simulate failures for demo purposes
    simulateFailure(serviceName, shouldFail = true) {
        const breaker = circuitBreakerService.getBreaker(serviceName);
        if (breaker && shouldFail) {
            // Force circuit to open by simulating multiple failures
            console.log(`[DEMO] Simulating failures for ${serviceName}`);
            for (let i = 0; i < 6; i++) {
                breaker.emit('failure', new Error('Simulated failure'));
            }
        }
    }
}

module.exports = new ExternalApiService();