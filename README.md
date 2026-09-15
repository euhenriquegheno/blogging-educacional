# API Blogging

Blog institucional onde professores publicam materiais para a comunidade
acadêmica. O projeto é composto por uma API REST (Fastify + TypeORM + MySQL)
e uma interface React consumida por três perfis de usuário: Administrador,
Professor e Aluno.

## Tecnologias

- **Backend**: Node.js, TypeScript, Fastify, TypeORM, MySQL, `@fastify/jwt`,
  bcrypt, Zod, Jest
- **Frontend**: React + Vite, TypeScript, React Router, Tailwind CSS, `fetch`
  nativo, Vitest + Testing Library
- **Infraestrutura**: Docker / Docker Compose (dev e produção), GitHub Actions
  (CI + publicação das imagens no Docker Hub)

## Arquitetura

```text
Backend:  HTTP routes/controllers -> use cases -> repositories -> TypeORM/MySQL
Frontend: pages -> features (api/components/context) -> services/api-client -> Backend
```

- **Controllers** validam requisições com Zod e formam respostas HTTP.
- **Use cases** concentram as regras de negócio (autenticação, autorização,
  CRUD de posts/usuários, comentários).
- **Repositories** isolam consultas e gravações no MySQL via TypeORM.
- **Entities**: `usuario` (com o campo `tipo`: Administrador/Professor/Aluno),
  `publicacao` e `comentario`, relacionadas entre si.
- **Frontend** organizado por *features* (`auth`, `posts`), com contexto de
  sessão (`AuthProvider`), guarda de rotas (`ProtectedRoute`) e um roteador
  central em `src/app/config/router.tsx`.

Detalhes de arquitetura, decisões de projeto e relato de desafios estão em
[`docs/DOCUMENTACAO.md`](docs/DOCUMENTACAO.md).

## Perfis de usuário e permissões

| Ação | Visitante | Aluno | Professor | Administrador |
|------|:---:|:---:|:---:|:---:|
| Listar/ler posts | ✅ | ✅ | ✅ | ✅ |
| Comentar em um post | ❌ | ✅ | ✅ | ✅ |
| Criar/editar os próprios posts | ❌ | ❌ | ✅ | ✅ |
| Editar/excluir qualquer post | ❌ | ❌ | ❌ | ✅ |
| Criar contas de usuário | ❌ | ❌ | ❌ | ✅ |

Autenticação via `POST /login`, com JWT válido por 24 horas. Não há
self-signup: contas são criadas apenas pelo Administrador.

## Configuração local (sem Docker)

**Backend**

```bash
cd backend
npm ci
cp .env.example .env        # preencher DATABASE_*, JWT_SECRET (MySQL local ou via docker compose up -d db)
npm run start:dev           # API em http://localhost:3000, docs em /docs
```

**Frontend**

```bash
cd frontend
npm ci
cp .env.example .env        # VITE_API_URL=http://localhost:3000
npm run dev                 # Vite dev server em http://localhost:5173
```

## Rodando com Docker

Copie o `.env.example` da raiz para `.env` e preencha as credenciais do MySQL
e a `VITE_API_URL` antes de subir os containers. O arquivo `backend/.env`
(a partir de `backend/.env.example`) também é necessário, pois é consumido
diretamente pelo container da API.

**Desenvolvimento** (hot reload no backend e no frontend):

```bash
docker compose -f docker-compose.dev.yml up --build
```

- API: `http://localhost:3000` (docs em `/docs`)
- Frontend: `http://localhost:5173`
- MySQL: `localhost:3306`

**Produção** (build otimizado, frontend servido por Nginx, com MySQL local):

```bash
docker compose up --build
```

- API: `http://localhost:3000`
- Frontend: `http://localhost:8080`

### Primeiro acesso (criar o Administrador inicial)

Como não há self-signup e **todas** as rotas de `/user` exigem um
Administrador já autenticado, um banco novo não tem nenhum usuário — logo,
ninguém consegue logar. Rode o script de seed uma vez, com os containers no
ar, para criar o primeiro Administrador:

```bash
docker compose exec api node build/scripts/seed-admin.js
```

Por padrão ele cria `admin@blog.com` / `admin123` (idempotente — rodar de
novo não duplica nem falha se o usuário já existir). Para customizar,
defina `SEED_ADMIN_EMAIL`, `SEED_ADMIN_SENHA`, `SEED_ADMIN_NOME` e
`SEED_ADMIN_CPF` no `backend/.env` antes de rodar o comando. Troque a senha
padrão (ou crie outro admin e apague este) antes de expor a aplicação
publicamente.

Rodando localmente sem Docker, ou via `docker-compose.dev.yml`, use
`npm run seed:admin` (ou `docker compose -f docker-compose.dev.yml exec
api npm run seed:admin`) em vez do comando acima — a imagem de
desenvolvimento não tem o build compilado, mas tem o `tsx`. O mesmo
comando com `build/scripts/seed-admin.js` funciona também com o
`docker-compose.external-db.yml`, trocando `docker compose` por
`docker compose -f docker-compose.external-db.yml`.

**Produção com banco de dados externo** (ex.: MySQL gerenciado na AWS RDS,
Supabase etc.) — sem subir banco local:

```bash
docker compose -f docker-compose.external-db.yml up --build
```

Preencha `backend/.env` com os dados de conexão do banco externo
(`DATABASE_HOST`, `DATABASE_PORT`, `DATABASE_USER`, `DATABASE_PASSWORD`,
`DATABASE_NAME`, `JWT_SECRET`) e garanta que o banco esteja acessível a
partir de onde os containers rodam (ex.: liberar a porta 3306 no Security
Group da RDS apenas para a origem do backend). Como `synchronize` só é
`true` em `NODE_ENV=development`, as tabelas não são criadas
automaticamente em produção: rode a API **uma vez** com
`NODE_ENV=development` apontada para o banco externo para criar o schema
via TypeORM, depois volte para `NODE_ENV=production`.

## Swagger

Com a API em execução, abra `http://localhost:3000/docs` para consultar e
testar interativamente os endpoints documentados.

## API de postagens

| Método | Rota | Autenticação | Descrição |
| --- | --- | --- | --- |
| GET | `/posts?page=1&limit=10` | pública | Lista postagens paginadas. |
| GET | `/posts/search?q=termo` | pública | Busca no título ou conteúdo. |
| GET | `/posts/:id` | pública | Obtém uma postagem pelo UUID. |
| POST | `/posts` | Professor/Administrador | Cria uma postagem. |
| PUT | `/posts/:id` | Professor (próprio post) / Administrador | Atualiza uma postagem. |
| DELETE | `/posts/:id` | Professor (próprio post) / Administrador | Exclui uma postagem. |

## API de comentários

| Método | Rota | Autenticação | Descrição |
| --- | --- | --- | --- |
| GET | `/posts/:id/comments?page=1&limit=10` | pública | Lista comentários de um post. |
| POST | `/posts/:id/comments` | qualquer usuário autenticado | Cria um comentário no post. |

## API de usuários

| Método | Rota | Autenticação | Descrição |
| --- | --- | --- | --- |
| POST | `/login` | pública | Autentica e retorna um JWT válido por 24h. |
| POST | `/user` | Administrador | Cria um usuário (`tipo`: Administrador/Professor/Aluno). |
| GET | `/user?page=1&limit=10` | Administrador | Lista usuários. |
| GET | `/user/:id` | Administrador | Obtém um usuário. |
| PUT | `/user/:id` | Administrador | Atualiza um usuário. |
| DELETE | `/user/:id` | Administrador | Exclui um usuário. |

## Testes

**Backend** (dentro de `backend/`):

```bash
npm test
npm run test:coverage
```

Cobertura mínima exigida: 20% em linhas, instruções, funções e branches
(`backend/jest.config.js`).

**Frontend** (dentro de `frontend/`):

```bash
npm run test
```

## Integração contínua e imagens Docker

O workflow em `.github/workflows/main.yml` roda em pull requests e pushes
para `main`:

1. `validate-backend`: instala dependências, roda os testes com cobertura e
   builda o backend.
2. `validate-frontend`: instala dependências, roda os testes e builda o
   frontend.
3. `publish-image` (somente em push para `main`, após os dois anteriores
   passarem): publica no Docker Hub as imagens `blogging-educacional` (backend) e
   `blogging-educacional-frontend` (frontend), com as tags `latest` e o hash do
   commit.

Configure estes secrets no GitHub:

- `DOCKERHUB_USERNAME`
- `DOCKERHUB_TOKEN`

## Documentação complementar

- [`docs/DOCUMENTACAO.md`](docs/DOCUMENTACAO.md) — arquitetura, guia de uso e
  relato de experiências/desafios.
