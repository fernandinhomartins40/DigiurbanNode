// ====================================================================
// 🧪 RATE LIMITER MIDDLEWARE TESTS - DIGIURBAN SYSTEM
// ====================================================================
// Testes unitários para o middleware de rate limiting
// Cobertura: rate limiting por IP, sliding window, fallback stores
// ====================================================================

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { Request, Response, NextFunction } from 'express';
import { rateLimiterMiddleware, createRateLimiter, PersistentRateStore } from '../../middleware/rateLimiter.js';
import { waitFor } from '../setup.js';

// ====================================================================
// MOCKS E SETUP
// ====================================================================

// Mock da Response do Express
const mockResponse = (): Partial<Response> => ({
  status: jest.fn().mockReturnThis(),
  json: jest.fn().mockReturnThis(),
  send: jest.fn().mockReturnThis(),
  setHeader: jest.fn().mockReturnThis(),
  locals: {}
});

// Mock da Request do Express
const mockRequest = (ip: string = '127.0.0.1', user?: any): Partial<Request> => ({
  ip,
  headers: {
    'user-agent': 'test-agent',
    'x-forwarded-for': ip
  },
  user,
  path: '/api/test',
  method: 'GET'
});

const mockNext: NextFunction = jest.fn();

// ====================================================================
// SUÍTE DE TESTES PRINCIPAL
// ====================================================================

describe('RateLimiter Middleware', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(async () => {
    // Limpar state interno dos rate limiters
    await waitFor(100);
  });

  // ================================================================
  // TESTES DE RATE LIMITING BÁSICO
  // ================================================================

  describe('Rate Limiting Básico', () => {
    it('deve permitir requests dentro do limite', async () => {
      const rateLimiter = createRateLimiter({
        windowMs: 1000,
        maxRequests: 5
      });

      const req = mockRequest() as Request;
      const res = mockResponse() as Response;
      const next = mockNext;

      // Fazer 3 requests - deve passar
      for (let i = 0; i < 3; i++) {
        await rateLimiter(req, res, next);
        expect(next).toHaveBeenCalled();
        jest.clearAllMocks();
      }
    });

    it('deve bloquear requests que excedem o limite', async () => {
      const rateLimiter = createRateLimiter({
        windowMs: 1000,
        maxRequests: 2
      });

      const req = mockRequest() as Request;
      const res = mockResponse() as Response;
      const next = mockNext;

      // Fazer 2 requests - deve passar
      for (let i = 0; i < 2; i++) {
        await rateLimiter(req, res, next);
        expect(next).toHaveBeenCalled();
        jest.clearAllMocks();
      }

      // Terceiro request deve ser bloqueado
      await rateLimiter(req, res, next);
      expect(res.status).toHaveBeenCalledWith(429);
      expect(next).not.toHaveBeenCalled();
    });

    it('deve incluir headers de rate limit', async () => {
      const rateLimiter = createRateLimiter({
        windowMs: 1000,
        maxRequests: 5
      });

      const req = mockRequest() as Request;
      const res = mockResponse() as Response;
      const next = mockNext;

      await rateLimiter(req, res, next);

      expect(res.setHeader).toHaveBeenCalledWith('X-RateLimit-Limit', 5);
      expect(res.setHeader).toHaveBeenCalledWith('X-RateLimit-Window', 1000);
      expect(res.setHeader).toHaveBeenCalledWith(
        expect.stringMatching(/X-RateLimit-/),
        expect.any(Number)
      );
    });
  });

  // ================================================================
  // TESTES DE SLIDING WINDOW
  // ================================================================

  describe('Sliding Window Algorithm', () => {
    it('deve resetar contador após window expirar', async () => {
      const rateLimiter = createRateLimiter({
        windowMs: 200, // Window pequeno para teste
        maxRequests: 2
      });

      const req = mockRequest() as Request;
      const res = mockResponse() as Response;
      const next = mockNext;

      // Esgotar limite
      for (let i = 0; i < 2; i++) {
        await rateLimiter(req, res, next);
        expect(next).toHaveBeenCalled();
        jest.clearAllMocks();
      }

      // Terceiro request deve ser bloqueado
      await rateLimiter(req, res, next);
      expect(res.status).toHaveBeenCalledWith(429);
      jest.clearAllMocks();

      // Esperar window expirar
      await waitFor(250);

      // Deve permitir novamente
      await rateLimiter(req, res, next);
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalledWith(429);
    });

    it('deve manter contador por IP separadamente', async () => {
      const rateLimiter = createRateLimiter({
        windowMs: 1000,
        maxRequests: 2
      });

      const req1 = mockRequest('192.168.1.1') as Request;
      const req2 = mockRequest('192.168.1.2') as Request;
      const res = mockResponse() as Response;
      const next = mockNext;

      // IP 1 - esgotar limite
      for (let i = 0; i < 2; i++) {
        await rateLimiter(req1, res, next);
        expect(next).toHaveBeenCalled();
        jest.clearAllMocks();
      }

      // IP 1 - deve ser bloqueado
      await rateLimiter(req1, res, next);
      expect(res.status).toHaveBeenCalledWith(429);
      jest.clearAllMocks();

      // IP 2 - deve passar normalmente
      await rateLimiter(req2, res, next);
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalledWith(429);
    });
  });

  // ================================================================
  // TESTES DE RATE LIMITING POR USUÁRIO
  // ================================================================

  describe('Rate Limiting por Usuário', () => {
    it('deve aplicar limite por usuário quando autenticado', async () => {
      const rateLimiter = createRateLimiter({
        windowMs: 1000,
        maxRequests: 2,
        keyGenerator: (req: Request) => {
          return req.user ? `user:${req.user.id}` : `ip:${req.ip}`;
        }
      });

      const user = { id: 'user-123', email: 'test@test.com' };
      const req1 = mockRequest('192.168.1.1', user) as Request;
      const req2 = mockRequest('192.168.1.2', user) as Request; // IP diferente, mesmo usuário
      const res = mockResponse() as Response;
      const next = mockNext;

      // Request 1 (IP 1, User 123)
      await rateLimiter(req1, res, next);
      expect(next).toHaveBeenCalled();
      jest.clearAllMocks();

      // Request 2 (IP 2, User 123) - mesmo usuário, deve contar junto
      await rateLimiter(req2, res, next);
      expect(next).toHaveBeenCalled();
      jest.clearAllMocks();

      // Request 3 (IP 1, User 123) - deve ser bloqueado
      await rateLimiter(req1, res, next);
      expect(res.status).toHaveBeenCalledWith(429);
    });

    it('deve usar IP quando usuário não autenticado', async () => {
      const rateLimiter = createRateLimiter({
        windowMs: 1000,
        maxRequests: 2,
        keyGenerator: (req: Request) => {
          return req.user ? `user:${req.user.id}` : `ip:${req.ip}`;
        }
      });

      const req = mockRequest() as Request; // Sem usuário
      const res = mockResponse() as Response;
      const next = mockNext;

      // Fazer requests - deve usar IP como key
      for (let i = 0; i < 2; i++) {
        await rateLimiter(req, res, next);
        expect(next).toHaveBeenCalled();
        jest.clearAllMocks();
      }

      // Terceiro request deve ser bloqueado
      await rateLimiter(req, res, next);
      expect(res.status).toHaveBeenCalledWith(429);
    });
  });

  // ================================================================
  // TESTES DE DIFERENTES TIPOS DE RATE LIMITER
  // ================================================================

  describe('Tipos de Rate Limiter', () => {
    it('deve aplicar rate limiter de login corretamente', async () => {
      const req = mockRequest() as Request;
      const res = mockResponse() as Response;
      const next = mockNext;

      // rateLimiterMiddleware.login tem limite mais restritivo
      // Fazer requests até o limite
      let requestCount = 0;
      let blocked = false;

      while (!blocked && requestCount < 10) {
        await rateLimiterMiddleware.login(req, res, next);
        
        if (res.status && (res.status as jest.Mock).mock.calls.length > 0) {
          const statusCalls = (res.status as jest.Mock).mock.calls;
          if (statusCalls.some(call => call[0] === 429)) {
            blocked = true;
          }
        } else {
          expect(next).toHaveBeenCalled();
        }
        
        requestCount++;
        jest.clearAllMocks();
      }

      expect(blocked).toBe(true);
      expect(requestCount).toBeLessThan(10); // Deve ser bloqueado antes de 10 requests
    });

    it('deve aplicar rate limiter de API corretamente', async () => {
      const req = mockRequest() as Request;
      const res = mockResponse() as Response;
      const next = mockNext;

      // Fazer algumas requests - API tem limite mais alto
      for (let i = 0; i < 5; i++) {
        await rateLimiterMiddleware.api(req, res, next);
        expect(next).toHaveBeenCalled();
        jest.clearAllMocks();
      }
    });

    it('deve aplicar rate limiter geral corretamente', async () => {
      const req = mockRequest() as Request;
      const res = mockResponse() as Response;
      const next = mockNext;

      // Fazer algumas requests gerais
      for (let i = 0; i < 10; i++) {
        await rateLimiterMiddleware.general(req, res, next);
        expect(next).toHaveBeenCalled();
        jest.clearAllMocks();
      }
    });
  });

  // ================================================================
  // TESTES DE PERSISTENT RATE STORE
  // ================================================================

  describe('PersistentRateStore', () => {
    let store: PersistentRateStore;

    beforeEach(() => {
      store = new PersistentRateStore();
    });

    afterEach(async () => {
      await store.resetAll();
    });

    it('deve incrementar contador corretamente', async () => {
      const key = 'test:key';
      const windowMs = 1000;

      const result1 = await store.increment(key, windowMs);
      expect(result1.totalHits).toBe(1);
      expect(result1.resetTime).toBeGreaterThan(Date.now());

      const result2 = await store.increment(key, windowMs);
      expect(result2.totalHits).toBe(2);
      expect(result2.resetTime).toBe(result1.resetTime); // Mesmo window
    });

    it('deve resetar contador após window expirar', async () => {
      const key = 'test:expire';
      const windowMs = 100;

      const result1 = await store.increment(key, windowMs);
      expect(result1.totalHits).toBe(1);

      // Esperar window expirar
      await waitFor(150);

      const result2 = await store.increment(key, windowMs);
      expect(result2.totalHits).toBe(1); // Deve resetar
      expect(result2.resetTime).toBeGreaterThan(result1.resetTime);
    });

    it('deve manter contadores separados por key', async () => {
      const key1 = 'test:key1';
      const key2 = 'test:key2';
      const windowMs = 1000;

      await store.increment(key1, windowMs);
      await store.increment(key1, windowMs);

      const result1 = await store.increment(key1, windowMs);
      const result2 = await store.increment(key2, windowMs);

      expect(result1.totalHits).toBe(3);
      expect(result2.totalHits).toBe(1);
    });

    it('deve resetar todos os contadores', async () => {
      const key1 = 'test:reset1';
      const key2 = 'test:reset2';
      const windowMs = 1000;

      await store.increment(key1, windowMs);
      await store.increment(key2, windowMs);

      await store.resetAll();

      const result1 = await store.increment(key1, windowMs);
      const result2 = await store.increment(key2, windowMs);

      expect(result1.totalHits).toBe(1);
      expect(result2.totalHits).toBe(1);
    });
  });

  // ================================================================
  // TESTES DE ERROR HANDLING
  // ================================================================

  describe('Error Handling', () => {
    it('deve continuar funcionando mesmo com erro interno', async () => {
      // Criar rate limiter que pode falhar internamente
      const rateLimiter = createRateLimiter({
        windowMs: 1000,
        maxRequests: 5,
        store: {
          increment: async () => {
            throw new Error('Store error');
          },
          resetAll: async () => {}
        } as any
      });

      const req = mockRequest() as Request;
      const res = mockResponse() as Response;
      const next = mockNext;

      // Deve permitir request mesmo com erro (failover para permitir)
      await rateLimiter(req, res, next);
      
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalledWith(429);
    });

    it('deve lidar com requests sem IP', async () => {
      const rateLimiter = createRateLimiter({
        windowMs: 1000,
        maxRequests: 5
      });

      const req = { ...mockRequest(), ip: undefined } as Request;
      const res = mockResponse() as Response;
      const next = mockNext;

      // Deve funcionar mesmo sem IP (usar fallback)
      await rateLimiter(req, res, next);
      expect(next).toHaveBeenCalled();
    });
  });

  // ================================================================
  // TESTES DE PERFORMANCE
  // ================================================================

  describe('Performance', () => {
    it('deve processar múltiplos requests rapidamente', async () => {
      const rateLimiter = createRateLimiter({
        windowMs: 60000,
        maxRequests: 1000
      });

      const req = mockRequest() as Request;
      const res = mockResponse() as Response;
      const next = mockNext;

      const startTime = performance.now();

      // Fazer 50 requests em paralelo
      const promises: Promise<void>[] = [];
      for (let i = 0; i < 50; i++) {
        promises.push(rateLimiter(req, res, next));
      }

      await Promise.all(promises);
      
      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(1000); // Menos de 1 segundo
      expect(next).toHaveBeenCalledTimes(50); // Todos devem passar
    });

    it('deve manter performance com muitas keys diferentes', async () => {
      const rateLimiter = createRateLimiter({
        windowMs: 60000,
        maxRequests: 10
      });

      const res = mockResponse() as Response;
      const next = mockNext;

      const startTime = performance.now();

      // Fazer requests com 100 IPs diferentes
      const promises: Promise<void>[] = [];
      for (let i = 0; i < 100; i++) {
        const req = mockRequest(`192.168.1.${i}`) as Request;
        promises.push(rateLimiter(req, res, next));
      }

      await Promise.all(promises);
      
      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(2000); // Menos de 2 segundos
      expect(next).toHaveBeenCalledTimes(100); // Todos devem passar
    });
  });
});