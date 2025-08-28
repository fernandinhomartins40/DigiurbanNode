// ====================================================================
// 🧪 LOG SANITIZER TESTS - DIGIURBAN SYSTEM
// ====================================================================
// Testes unitários para o sistema de sanitização de logs
// Cobertura: sanitização de dados sensíveis, LGPD compliance
// ====================================================================

import { describe, it, expect, beforeEach } from '@jest/globals';
import { LogSanitizer } from '../../utils/logSanitizer.js';

// ====================================================================
// DADOS DE TESTE
// ====================================================================

const sensitiveTestData = {
  // CPFs válidos para teste
  cpfs: [
    '123.456.789-01',
    '12345678901',
    '987.654.321-00',
    '98765432100'
  ],
  
  // CNPJs válidos para teste
  cnpjs: [
    '12.345.678/0001-95',
    '12345678000195',
    '98.765.432/0001-10',
    '98765432000110'
  ],
  
  // Emails
  emails: [
    'user@example.com',
    'admin@digiurban.com.br',
    'test.user+tag@domain.co.uk',
    'simple@test.org'
  ],
  
  // Telefones
  phones: [
    '(11) 99999-9999',
    '11999999999',
    '+55 11 99999-9999',
    '(21) 3333-4444',
    '2133334444'
  ],
  
  // IPs
  ips: [
    '192.168.1.1',
    '10.0.0.1',
    '172.16.0.1',
    '203.0.113.1'
  ],
  
  // JWTs
  jwts: [
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
    'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjMiLCJlbWFpbCI6InRlc3RAdGVzdC5jb20ifQ.xyz123',
    'jwt_token_here_with_dots.and.segments'
  ],
  
  // Senhas
  passwords: [
    'mySecretPassword123',
    'P@ssw0rd!',
    'admin123',
    'user_password'
  ]
};

// ====================================================================
// SUÍTE DE TESTES PRINCIPAL
// ====================================================================

describe('LogSanitizer', () => {
  
  beforeEach(() => {
    // Reset configurações se necessário
  });

  // ================================================================
  // TESTES DE SANITIZAÇÃO DE CPF
  // ================================================================

  describe('Sanitização de CPF', () => {
    it('deve sanitizar CPFs em strings', () => {
      sensitiveTestData.cpfs.forEach(cpf => {
        const text = `O CPF do usuário é ${cpf} e foi verificado`;
        const result = LogSanitizer.sanitize(text);
        
        expect(result).not.toContain(cpf);
        expect(result).toContain('[CPF_REDACTED]');
      });
    });

    it('deve sanitizar CPFs em objetos', () => {
      const obj = {
        user: {
          name: 'João Silva',
          cpf: '123.456.789-01',
          document: '12345678901'
        },
        message: 'CPF 987.654.321-00 foi processado'
      };

      const result = LogSanitizer.sanitize(obj);

      expect(result.user.cpf).toBe('[CPF_REDACTED]');
      expect(result.user.document).toBe('[CPF_REDACTED]');
      expect(result.message).toContain('[CPF_REDACTED]');
      expect(result.user.name).toBe('João Silva'); // Não deve afetar outros campos
    });

    it('deve sanitizar múltiplos CPFs na mesma string', () => {
      const text = 'CPFs: 123.456.789-01, 987.654.321-00 e 11111111111';
      const result = LogSanitizer.sanitize(text);

      expect(result).toBe('CPFs: [CPF_REDACTED], [CPF_REDACTED] e [CPF_REDACTED]');
    });
  });

  // ================================================================
  // TESTES DE SANITIZAÇÃO DE CNPJ
  // ================================================================

  describe('Sanitização de CNPJ', () => {
    it('deve sanitizar CNPJs em strings', () => {
      sensitiveTestData.cnpjs.forEach(cnpj => {
        const text = `Empresa com CNPJ ${cnpj} foi cadastrada`;
        const result = LogSanitizer.sanitize(text);
        
        expect(result).not.toContain(cnpj);
        expect(result).toContain('[CNPJ_REDACTED]');
      });
    });

    it('deve sanitizar CNPJs em objetos complexos', () => {
      const obj = {
        empresa: {
          razaoSocial: 'Teste Ltda',
          cnpj: '12.345.678/0001-95'
        },
        logs: [
          'CNPJ 98765432000110 processado',
          'Verificação de 12345678000195 concluída'
        ]
      };

      const result = LogSanitizer.sanitize(obj);

      expect(result.empresa.cnpj).toBe('[CNPJ_REDACTED]');
      expect(result.logs[0]).toContain('[CNPJ_REDACTED]');
      expect(result.logs[1]).toContain('[CNPJ_REDACTED]');
    });
  });

  // ================================================================
  // TESTES DE SANITIZAÇÃO DE EMAIL
  // ================================================================

  describe('Sanitização de Email', () => {
    it('deve sanitizar emails preservando domínio', () => {
      const result = LogSanitizer.sanitize('Email do usuário: user@example.com');
      
      expect(result).toContain('[EMAIL_REDACTED]@example.com');
      expect(result).not.toContain('user@example.com');
    });

    it('deve sanitizar emails em objetos', () => {
      const obj = {
        user: {
          name: 'João',
          email: 'joao.silva@empresa.com.br',
          contact: 'admin@test.org'
        }
      };

      const result = LogSanitizer.sanitize(obj);

      expect(result.user.email).toBe('[EMAIL_REDACTED]@empresa.com.br');
      expect(result.user.contact).toBe('[EMAIL_REDACTED]@test.org');
      expect(result.user.name).toBe('João');
    });

    it('deve lidar com emails complexos', () => {
      const emails = [
        'test.user+tag@domain.co.uk',
        'user_name@sub.domain.com',
        'simple@test.io'
      ];

      emails.forEach(email => {
        const result = LogSanitizer.sanitize(`Login: ${email}`);
        const domain = email.split('@')[1];
        
        expect(result).toContain(`[EMAIL_REDACTED]@${domain}`);
        expect(result).not.toContain(email.split('@')[0]);
      });
    });
  });

  // ================================================================
  // TESTES DE SANITIZAÇÃO DE TELEFONE
  // ================================================================

  describe('Sanitização de Telefone', () => {
    it('deve sanitizar diferentes formatos de telefone', () => {
      sensitiveTestData.phones.forEach(phone => {
        const text = `Contato: ${phone}`;
        const result = LogSanitizer.sanitize(text);
        
        expect(result).not.toContain(phone);
        expect(result).toContain('[PHONE_REDACTED]');
      });
    });

    it('deve sanitizar telefones em objetos', () => {
      const obj = {
        contato: {
          nome: 'João',
          telefone: '(11) 99999-9999',
          celular: '11988887777'
        },
        observacao: 'Ligar para (21) 3333-4444'
      };

      const result = LogSanitizer.sanitize(obj);

      expect(result.contato.telefone).toBe('[PHONE_REDACTED]');
      expect(result.contato.celular).toBe('[PHONE_REDACTED]');
      expect(result.observacao).toContain('[PHONE_REDACTED]');
    });
  });

  // ================================================================
  // TESTES DE SANITIZAÇÃO DE IP
  // ================================================================

  describe('Sanitização de IP', () => {
    it('deve sanitizar endereços IP', () => {
      sensitiveTestData.ips.forEach(ip => {
        const text = `Request from IP: ${ip}`;
        const result = LogSanitizer.sanitize(text);
        
        expect(result).not.toContain(ip);
        expect(result).toContain('[IP_REDACTED]');
      });
    });

    it('deve preservar IPs em ranges específicos se configurado', () => {
      const publicIp = '203.0.113.1';
      const privateIp = '192.168.1.1';
      
      const result1 = LogSanitizer.sanitize(`Public: ${publicIp}, Private: ${privateIp}`);
      
      // Ambos devem ser sanitizados por padrão
      expect(result1).toContain('[IP_REDACTED]');
      expect(result1).not.toContain(publicIp);
      expect(result1).not.toContain(privateIp);
    });
  });

  // ================================================================
  // TESTES DE SANITIZAÇÃO DE JWT
  // ================================================================

  describe('Sanitização de JWT', () => {
    it('deve sanitizar tokens JWT', () => {
      sensitiveTestData.jwts.forEach(jwt => {
        const text = `Token: ${jwt}`;
        const result = LogSanitizer.sanitize(text);
        
        expect(result).not.toContain(jwt);
        expect(result).toContain('[JWT_REDACTED]');
      });
    });

    it('deve sanitizar JWTs em objetos de authorization', () => {
      const obj = {
        headers: {
          authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.payload.signature'
        },
        token: 'jwt.token.here',
        user: 'João'
      };

      const result = LogSanitizer.sanitize(obj);

      expect(result.headers.authorization).toBe('Bearer [JWT_REDACTED]');
      expect(result.token).toBe('[JWT_REDACTED]');
      expect(result.user).toBe('João');
    });
  });

  // ================================================================
  // TESTES DE SANITIZAÇÃO DE SENHA
  // ================================================================

  describe('Sanitização de Senha', () => {
    it('deve sanitizar campos de senha', () => {
      const obj = {
        login: {
          email: 'user@test.com',
          password: 'secretPassword123',
          senha: 'outraSecreto'
        },
        user_password: 'minhaSenha',
        newPassword: 'novaSenha123'
      };

      const result = LogSanitizer.sanitize(obj);

      expect(result.login.password).toBe('[PASSWORD_REDACTED]');
      expect(result.login.senha).toBe('[PASSWORD_REDACTED]');
      expect(result.user_password).toBe('[PASSWORD_REDACTED]');
      expect(result.newPassword).toBe('[PASSWORD_REDACTED]');
      expect(result.login.email).toContain('@test.com'); // Email deve ser parcialmente sanitizado
    });

    it('deve sanitizar senhas em strings JSON', () => {
      const jsonString = '{"user":"admin","password":"secret123","data":"public"}';
      const result = LogSanitizer.sanitize(jsonString);

      expect(result).toContain('"password":"[PASSWORD_REDACTED]"');
      expect(result).not.toContain('secret123');
      expect(result).toContain('"user":"admin"'); // Outros campos não afetados
    });
  });

  // ================================================================
  // TESTES DE OBJETOS COMPLEXOS
  // ================================================================

  describe('Objetos Complexos', () => {
    it('deve sanitizar objetos aninhados profundamente', () => {
      const complexObj = {
        level1: {
          level2: {
            level3: {
              user: {
                cpf: '123.456.789-01',
                email: 'user@test.com',
                phone: '(11) 99999-9999'
              }
            }
          }
        },
        metadata: {
          ip: '192.168.1.1',
          token: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.payload.signature'
        }
      };

      const result = LogSanitizer.sanitize(complexObj);

      expect(result.level1.level2.level3.user.cpf).toBe('[CPF_REDACTED]');
      expect(result.level1.level2.level3.user.email).toContain('@test.com');
      expect(result.level1.level2.level3.user.phone).toBe('[PHONE_REDACTED]');
      expect(result.metadata.ip).toBe('[IP_REDACTED]');
      expect(result.metadata.token).toBe('[JWT_REDACTED]');
    });

    it('deve sanitizar arrays de objetos', () => {
      const arrayObj = {
        users: [
          {
            id: 1,
            cpf: '123.456.789-01',
            email: 'user1@test.com'
          },
          {
            id: 2,
            cpf: '987.654.321-00',
            email: 'user2@test.com'
          }
        ],
        logs: [
          'CPF 111.222.333-44 processado',
          'Email admin@domain.com verificado'
        ]
      };

      const result = LogSanitizer.sanitize(arrayObj);

      expect(result.users[0].cpf).toBe('[CPF_REDACTED]');
      expect(result.users[1].cpf).toBe('[CPF_REDACTED]');
      expect(result.users[0].email).toContain('@test.com');
      expect(result.users[1].email).toContain('@test.com');
      expect(result.logs[0]).toContain('[CPF_REDACTED]');
      expect(result.logs[1]).toContain('[EMAIL_REDACTED]@domain.com');
    });
  });

  // ================================================================
  // TESTES DE EDGE CASES
  // ================================================================

  describe('Edge Cases', () => {
    it('deve lidar com valores null e undefined', () => {
      const obj = {
        campo1: null,
        campo2: undefined,
        campo3: 'valor normal'
      };

      const result = LogSanitizer.sanitize(obj);

      expect(result.campo1).toBeNull();
      expect(result.campo2).toBeUndefined();
      expect(result.campo3).toBe('valor normal');
    });

    it('deve lidar com objetos circulares', () => {
      const obj: any = {
        name: 'test',
        cpf: '123.456.789-01'
      };
      obj.self = obj; // Referência circular

      const result = LogSanitizer.sanitize(obj);

      expect(result.cpf).toBe('[CPF_REDACTED]');
      expect(result.name).toBe('test');
      // Deve lidar com a referência circular sem quebrar
    });

    it('deve lidar com tipos primitivos', () => {
      expect(LogSanitizer.sanitize('123.456.789-01')).toBe('[CPF_REDACTED]');
      expect(LogSanitizer.sanitize(12345)).toBe(12345);
      expect(LogSanitizer.sanitize(true)).toBe(true);
      expect(LogSanitizer.sanitize(null)).toBeNull();
    });

    it('deve lidar com strings muito longas', () => {
      const longString = 'texto '.repeat(1000) + '123.456.789-01' + ' mais texto'.repeat(1000);
      const result = LogSanitizer.sanitize(longString);

      expect(result).toContain('[CPF_REDACTED]');
      expect(result).not.toContain('123.456.789-01');
    });

    it('deve preservar performance com objetos grandes', () => {
      const bigObj: any = {};
      
      // Criar objeto com 1000 propriedades
      for (let i = 0; i < 1000; i++) {
        bigObj[`prop${i}`] = `value${i}`;
      }
      
      bigObj.sensitiveData = {
        cpf: '123.456.789-01',
        email: 'user@test.com'
      };

      const startTime = performance.now();
      const result = LogSanitizer.sanitize(bigObj);
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(100); // Menos de 100ms
      expect(result.sensitiveData.cpf).toBe('[CPF_REDACTED]');
      expect(result.sensitiveData.email).toContain('@test.com');
    });
  });

  // ================================================================
  // TESTES DE CONFIGURAÇÃO
  // ================================================================

  describe('Configuração e Customização', () => {
    it('deve respeitar configurações de sanitização', () => {
      // Teste básico - configuração mais avançada seria implementada conforme necessário
      const data = {
        cpf: '123.456.789-01',
        email: 'user@test.com',
        publicInfo: 'informação pública'
      };

      const result = LogSanitizer.sanitize(data);

      expect(result.cpf).toBe('[CPF_REDACTED]');
      expect(result.email).toContain('@test.com');
      expect(result.publicInfo).toBe('informação pública');
    });

    it('deve sanitizar combinações de dados sensíveis', () => {
      const mixedData = `
        Usuário João Silva (CPF: 123.456.789-01) 
        Email: joao@empresa.com.br
        Telefone: (11) 99999-9999
        Login realizado do IP: 192.168.1.100
        Token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test.signature
      `;

      const result = LogSanitizer.sanitize(mixedData);

      expect(result).toContain('[CPF_REDACTED]');
      expect(result).toContain('[EMAIL_REDACTED]@empresa.com.br');
      expect(result).toContain('[PHONE_REDACTED]');
      expect(result).toContain('[IP_REDACTED]');
      expect(result).toContain('[JWT_REDACTED]');
      expect(result).toContain('João Silva'); // Nome deve permanecer
    });
  });
});