# Cloud Patterns Implementation

## Overview
This project implements two key cloud design patterns to enhance reliability, performance, and scalability.

## 1. Cache Aside Pattern

### Implementation
- **Service**: todos-api (Node.js)
- **Cache Store**: Redis
- **Pattern Type**: Lazy loading cache

### How it works
1. Application checks cache first for requested data
2. On cache miss: fetch from database + store in cache
3. On cache hit: return data directly from cache
4. On data modification: invalidate relevant cache entries

### Benefits
- Improved response times for frequently accessed data
- Reduced database load
- Better application scalability

### Code Location
- Cache service: `todos-api/src/services/cacheService.js`
- Implementation: `todos-api/src/controllers/todosController.js`

### Metrics
- Cache hit ratio monitoring
- Response time improvements
- Database query reduction

## 2. Circuit Breaker Pattern

### Implementation  
- **Services**: Inter-service communication
- **Library**: Opossum (Node.js)
- **Protected Calls**: todos-api → users-api, todos-api → auth-api

### States
- **Closed**: Normal operation, requests flow through
- **Open**: Failures detected, requests blocked, fallback responses
- **Half-Open**: Testing if service recovered

### Configuration
- Failure threshold: 50% error rate
- Timeout: 3 seconds
- Reset timeout: 30 seconds
- Rolling window: 10 seconds

### Benefits
- Prevents cascade failures
- Graceful degradation
- Faster failure detection
- Automatic recovery testing

### Code Location
- Circuit breaker service: `todos-api/src/services/circuitBreakerService.js`
- Implementation: `todos-api/src/services/externalApiService.js`

## Monitoring & Observability

Both patterns include comprehensive logging and metrics:
- Cache performance metrics
- Circuit breaker state changes
- Response time monitoring
- Error rate tracking

## Future Patterns
Additional patterns that could be implemented:
- **Auto Scaling**: Horizontal pod autoscaler based on CPU/memory
- **Federated Identity**: Centralized authentication with OAuth/SAML