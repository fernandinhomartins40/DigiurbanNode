# DigiUrban - Sistema de Gestão Municipal

Sistema completo de gestão municipal com frontend React + TypeScript e backend Node.js + SQLite3.

## Estrutura do Projeto

```
DigiurbanNode/
├── frontend/          # Aplicação React + TypeScript
│   ├── src/
│   ├── public/
│   └── package.json
├── backend/           # API Node.js + Express + SQLite3
│   ├── src/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── config/
│   │   └── types/
│   ├── database/
│   │   ├── migrations/
│   │   └── seeds/
│   └── package.json
└── README.md
```

## Instalação e Configuração

### Backend

1. Navegue até a pasta backend:
```bash
cd backend
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env
# Edite o arquivo .env com suas configurações
```

4. Execute as migrations do banco:
```bash
npm run db:migrate
```

5. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

### Frontend

1. Navegue até a pasta frontend:
```bash
cd frontend
```

2. Instale as dependências:
```bash
npm install
```

3. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

## Scripts Disponíveis

### Backend
- `npm run dev` - Servidor em modo desenvolvimento
- `npm run build` - Build para produção
- `npm run start` - Inicia servidor de produção
- `npm run db:migrate` - Executa migrations
- `npm run db:seed` - Popula banco com dados iniciais

### Frontend  
- `npm run dev` - Servidor de desenvolvimento
- `npm run build` - Build para produção
- `npm run preview` - Preview do build

## Tecnologias Utilizadas

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS
- Shadcn/ui
- React Router DOM
- React Hook Form
- Zustand (Estado global)

### Backend
- Node.js
- Express.js
- TypeScript
- SQLite3 (better-sqlite3)
- JWT para autenticação
- Winston para logs
- Helmet para segurança
- bcryptjs para hash de senhas

## Funcionalidades

- ✅ Sistema de autenticação JWT
- ✅ Gestão de usuários
- ✅ Dashboard administrativo
- ✅ Sistema de permissões
- ✅ Módulos municipais (Saúde, Educação, Obras, etc.)
- ✅ Interface responsiva
- ✅ API RESTful
- ✅ Banco de dados SQLite3
- ✅ Sistema de migrations
- ✅ Logs estruturados
- ✅ Middleware de segurança

## Contribuição

1. Faça fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request