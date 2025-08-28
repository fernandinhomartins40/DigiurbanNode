const SENSITIVE_FIELDS = [
  'password', 'password_hash', 'token', 'refresh_token', 
  'authorization', 'cookie', 'secret', 'key', 'hash',
  'cpf', 'cnpj', 'phone', 'address', 'senha', 'email',
  'user_agent', 'ip_address', 'session_id', 'csrf_token'
];

// Patterns para detectar dados sensíveis em strings
const SENSITIVE_PATTERNS = [
  {
    name: 'JWT_TOKEN',
    pattern: /eyJ[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*/g,
    replacement: '[JWT-REDACTED]'
  },
  {
    name: 'CPF',
    pattern: /\d{3}\.?\d{3}\.?\d{3}-?\d{2}/g,
    replacement: '[CPF-REDACTED]'
  },
  {
    name: 'CNPJ',
    pattern: /\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}/g,
    replacement: '[CNPJ-REDACTED]'
  },
  {
    name: 'EMAIL',
    pattern: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
    replacement: '[EMAIL-REDACTED]'
  },
  {
    name: 'PHONE',
    pattern: /(?:\+55\s?)?(?:\(\d{2}\)\s?)?(?:9?\d{4}-?\d{4})/g,
    replacement: '[PHONE-REDACTED]'
  },
  {
    name: 'IP_ADDRESS',
    pattern: /\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b/g,
    replacement: '[IP-REDACTED]'
  },
  {
    name: 'CREDIT_CARD',
    pattern: /\b(?:\d{4}[-\s]?){3}\d{4}\b/g,
    replacement: '[CARD-REDACTED]'
  }
];

export class LogSanitizer {
  /**
   * Sanitizar objeto removendo campos sensíveis
   */
  static sanitize(data: any): any {
    if (data === null || data === undefined) {
      return data;
    }

    if (typeof data === 'string') {
      return this.sanitizeString(data);
    }

    if (typeof data === 'number' || typeof data === 'boolean') {
      return data;
    }

    if (data instanceof Date) {
      return data;
    }

    if (Array.isArray(data)) {
      return data.map(item => this.sanitize(item));
    }

    if (typeof data === 'object') {
      const sanitized: any = {};
      
      for (const [key, value] of Object.entries(data)) {
        const lowercaseKey = key.toLowerCase();
        
        // Verificar se a chave contém campo sensível
        if (SENSITIVE_FIELDS.some(field => lowercaseKey.includes(field.toLowerCase()))) {
          sanitized[key] = '[REDACTED]';
        } else if (typeof value === 'object') {
          sanitized[key] = this.sanitize(value);
        } else if (typeof value === 'string') {
          sanitized[key] = this.sanitizeString(value);
        } else {
          sanitized[key] = value;
        }
      }
      
      return sanitized;
    }

    return data;
  }

  /**
   * Sanitizar string aplicando patterns de dados sensíveis
   */
  static sanitizeString(str: string): string {
    if (typeof str !== 'string') {
      return str;
    }

    let sanitized = str;

    // Aplicar todos os patterns
    SENSITIVE_PATTERNS.forEach(pattern => {
      sanitized = sanitized.replace(pattern.pattern, pattern.replacement);
    });

    return sanitized;
  }

  /**
   * Sanitizar headers HTTP
   */
  static sanitizeHeaders(headers: any): any {
    const sanitized = { ...headers };
    
    const sensitiveHeaders = [
      'authorization', 'cookie', 'set-cookie', 'x-auth-token',
      'x-api-key', 'x-csrf-token', 'x-session-token'
    ];

    sensitiveHeaders.forEach(header => {
      if (sanitized[header]) {
        sanitized[header] = '[REDACTED]';
      }
      if (sanitized[header.toUpperCase()]) {
        sanitized[header.toUpperCase()] = '[REDACTED]';
      }
    });

    return sanitized;
  }

  /**
   * Sanitizar query parameters
   */
  static sanitizeQuery(query: any): any {
    if (!query || typeof query !== 'object') {
      return query;
    }

    const sanitized = { ...query };
    const sensitiveParams = ['password', 'token', 'secret', 'key', 'email'];

    sensitiveParams.forEach(param => {
      if (sanitized[param]) {
        sanitized[param] = '[REDACTED]';
      }
    });

    return sanitized;
  }

  /**
   * Sanitizar dados de erro
   */
  static sanitizeError(error: any): any {
    if (!error) {
      return error;
    }

    const sanitized = {
      name: error.name,
      message: this.sanitizeString(error.message || ''),
      stack: error.stack ? this.sanitizeStackTrace(error.stack) : undefined,
      code: error.code,
      status: error.status || error.statusCode
    };

    // Remover propriedades undefined
    Object.keys(sanitized).forEach(key => {
      if (sanitized[key] === undefined) {
        delete sanitized[key];
      }
    });

    return sanitized;
  }

  /**
   * Sanitizar stack trace
   */
  private static sanitizeStackTrace(stack: string): string {
    // Remover caminhos absolutos e informações sensíveis do stack trace
    return stack
      .replace(/\/[^\s]+\//g, '[PATH]/')  // Caminhos
      .replace(/at .+ \(.+\)/g, 'at [FUNCTION] ([PATH])')  // Funções
      .split('\n')
      .slice(0, 10)  // Limitar linhas do stack
      .join('\n');
  }

  /**
   * Sanitizar request completo
   */
  static sanitizeRequest(req: any): any {
    if (!req) {
      return req;
    }

    return {
      method: req.method,
      url: this.sanitizeString(req.url || req.originalUrl || ''),
      headers: this.sanitizeHeaders(req.headers || {}),
      query: this.sanitizeQuery(req.query || {}),
      body: this.sanitize(req.body || {}),
      params: this.sanitize(req.params || {}),
      ip: '[IP-REDACTED]',
      userAgent: '[USER-AGENT-REDACTED]'
    };
  }

  /**
   * Criar versão segura de dados para logging
   */
  static createSafeLogData(data: any, context?: string): any {
    const sanitized = this.sanitize(data);
    
    return {
      context: context || 'unknown',
      timestamp: new Date().toISOString(),
      data: sanitized,
      _sanitized: true
    };
  }

  /**
   * Verificar se dados contêm informações sensíveis (para auditoria)
   */
  static containsSensitiveData(data: any): boolean {
    const dataStr = JSON.stringify(data).toLowerCase();
    
    return SENSITIVE_FIELDS.some(field => 
      dataStr.includes(field.toLowerCase())
    ) || SENSITIVE_PATTERNS.some(pattern => 
      pattern.pattern.test(dataStr)
    );
  }
}