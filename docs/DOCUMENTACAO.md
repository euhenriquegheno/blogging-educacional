# Documentação do Projeto — API Blogging

## 1. Visão geral

O **API Blogging** é um blog institucional onde professores publicam
materiais para a comunidade acadêmica. O projeto parte de uma API REST já
existente (Fastify + TypeORM, originalmente em PostgreSQL, com CRUD de
posts e usuários) e evolui em duas frentes:

- **Backend**: migração do banco para MySQL, autenticação via JWT,
  autorização por tipo de usuário e um novo recurso de comentários.
- **Frontend**: uma interface React que consome a API acima, com áreas
  distintas para visitantes, alunos, professores e administradores.

## 2. Arquitetura

### 2.1 Visão em camadas

- **Controllers** recebem a requisição HTTP, validam o corpo/parâmetros com
  Zod e delegam a regra de negócio ao use case correspondente.
- **Use cases** concentram as regras de negócio (autenticar usuário, criar
  post, verificar se o professor é dono do post antes de editar/excluir
  etc.), sem depender diretamente do Fastify ou do TypeORM.
- **Repositories** isolam o acesso ao banco (TypeORM), permitindo trocar a
  implementação (por exemplo, repositórios em memória usados nos testes)
  sem alterar as regras de negócio.
- **Entities** (TypeORM) definem as tabelas `usuario`, `publicacao` e
  `comentario` e os relacionamentos entre elas.
- No **frontend**, cada feature (`auth`, `posts`) concentra sua própria
  camada de API (`*-api.ts`), componentes e, no caso de `auth`, o contexto
  de sessão. As páginas (`src/pages`) compõem esses blocos e são registradas
  no roteador central (`src/app/config/router.tsx`).

### 2.2 Modelo de dados

```
    USUARIO {
        int id
        string nome
        string email
        string senha_hash
        string cpf
        enum tipo "ADMINISTRADOR | PROFESSOR | ALUNO"
    }
    PUBLICACAO {
        uuid id
        string titulo
        text conteudo
        int usuario_id
    }
    COMENTARIO {
        uuid id
        text conteudo
        datetime criadoEm
        int usuario_id
        uuid publicacao_id
    }
```

O campo `tipo` do usuário (enum `TipoUsuario`: `ADMINISTRADOR = 1`,
`PROFESSOR = 2`, `ALUNO = 3`) é a base de toda a autorização do sistema,
tanto no backend (middlewares) quanto no frontend (guarda de rotas e
navegação condicional).

### 2.3 Autenticação e autorização

- `POST /login` recebe `email`/`senha`, valida a senha com `bcrypt.compare`
  contra o hash armazenado e assina um JWT (`@fastify/jwt`) com payload
  `{ sub: usuario.id, tipo: usuario.tipo }` e validade de **24 horas**.
- O middleware `verifyJwt` protege rotas que exigem autenticação,
  retornando `401` quando o token está ausente ou inválido.
- O middleware `verifyUserType([...tipos])` retorna `403` quando o usuário
  autenticado não pertence a um dos tipos permitidos para a rota.
- Regra de posse: um Professor só edita/exclui os próprios posts (o use
  case compara `usuario.id` com o `usuario_id` da publicação e lança
  `ForbiddenError` em caso de divergência); o Administrador tem acesso
  irrestrito a qualquer post e é o único que pode criar contas de usuário.
- No frontend, o `AuthProvider` decodifica o JWT, mantém a sessão em
  `localStorage` e expõe `usuario`/`token` via `useAuth()`. O componente
  `ProtectedRoute` usa esse contexto para redirecionar para `/login`
  (sem sessão) ou para `/` (sessão válida, mas tipo não autorizado).

### 2.4 Infraestrutura e containers

| Serviço | Papel | Porta (produção) | Porta (dev) |
|---|---|---|---|
| `db` | MySQL 8, com healthcheck | 3306 | 3306 |
| `api` | Backend Fastify | 3000 | 3000 (hot reload via `tsx watch`) |
| `web` | Frontend servido por Nginx (build estático) | 8080 | 5173 (Vite dev server) |

Os Dockerfiles de backend e frontend usam multi-stage builds com estágios
`development` e `production`, selecionados via `target` em cada
`docker-compose*.yml`. Em desenvolvimento, o código-fonte é montado como
volume para permitir hot reload; em produção, apenas os artefatos
compilados (backend) ou o build estático (frontend, servido por Nginx com
fallback de rotas para suportar o React Router) entram na imagem final.

## 3. Guia de uso

### 3.1 Subindo o projeto

Veja o passo a passo completo (local e via Docker) no [`README.md`](../README.md).
Resumo:

```bash
# Produção (stack completa)
cp .env.example .env
cp backend/.env.example backend/.env
docker compose up --build
# API em http://localhost:3000 (docs em /docs) | Frontend em http://localhost:8080

# Desenvolvimento (hot reload)
docker compose -f docker-compose.dev.yml up --build
# API em http://localhost:3000 | Frontend em http://localhost:5173
```

### 3.2 Fluxos por perfil de usuário

- **Visitante (não autenticado)**: acessa a listagem de posts (com busca e
  paginação) e a leitura de um post completo, incluindo os comentários já
  existentes. Não vê o formulário de comentário nem qualquer ação de
  criação/edição.
- **Aluno**: além do que o visitante vê, consegue comentar em qualquer
  post depois de autenticado.
- **Professor**: cria novos posts (`/posts/novo`) e edita/exclui apenas os
  próprios posts. Tentar acessar a área administrativa redireciona para a
  página inicial.
- **Administrador**: acessa a área administrativa (`/admin`), que lista
  todos os posts do sistema com opções de editar/excluir qualquer um deles,
  e cria novas contas de usuário definindo o `tipo` (Administrador,
  Professor ou Aluno).

Como não há self-signup **e** todas as rotas de `/user` exigem um
Administrador já autenticado, um banco novo não tem nenhuma conta — não dá
para criar o primeiro Administrador pelo Swagger nem pela interface. Por
isso existe o script `backend/src/scripts/seed-admin.ts`
(`npm run seed:admin` local, ou `docker compose exec api node
build/scripts/seed-admin.js` em qualquer um dos composes), que cria um
Administrador padrão (`admin@blog.com` / `admin123`, customizável por
variáveis de ambiente) caso nenhum usuário exista ainda. Veja o
[`README.md`](../README.md#primeiro-acesso-criar-o-administrador-inicial)
para o passo a passo completo.

## 4. Testes e integração contínua

- **Backend**: testes unitários com Jest, cobrindo casos de uso (login,
  autorização por posse do post, CRUD de posts/usuários, criação e
  listagem de comentários) e testes de rota com `app.inject` para os
  códigos de status (`401`/`403`/`200`/`201`). Cobertura mínima exigida:
  20% em linhas, instruções, funções e branches.
- **Frontend**: testes de componente/página com Vitest + Testing Library,
  cobrindo formulários (login, criação/edição de post, criação de usuário),
  guarda de rotas e navegação condicional por tipo de usuário, usando
  mocks de `fetch` para isolar a camada de API.
- **CI (GitHub Actions — `.github/workflows/main.yml`)**: em cada pull
  request e push para `main`, dois jobs independentes (`validate-backend`
  e `validate-frontend`) instalam dependências, rodam os testes e fazem o
  build de cada aplicação. Em push para `main`, após os dois jobs
  passarem, o job `publish-image` builda e publica no Docker Hub as
  imagens `blogging-educacional` (backend) e `blogging-educacional-frontend` (frontend),
  com as tags `latest` e o hash do commit.

## 5. Relato de experiências e desafios

O desenvolvimento partiu de uma API já existente (CRUD de posts e usuários
em PostgreSQL, sem autenticação) e evoluiu em etapas bem delimitadas, o que
trouxe alguns desafios específicos:

- **Migração de PostgreSQL para MySQL**: o maior cuidado foi garantir que a
  troca de driver do TypeORM (`pg` → `mysql2`) não alterasse o
  comportamento das entidades já existentes, além de modelar corretamente
  o serviço de banco no Docker Compose (imagem `mysql:8`, variáveis de
  ambiente, volume nomeado e `healthcheck` via `mysqladmin ping`) para que
  o container da API só suba depois do banco estar realmente saudável
  (`depends_on.condition: service_healthy`).
- **Autenticação e autorização retroativas**: como as rotas de posts e
  usuários já existiam sem proteção, foi preciso introduzir os middlewares
  de JWT e de tipo de usuário sem quebrar os testes existentes, e reforçar
  a regra de "posse" do post (Professor só edita/exclui o próprio
  conteúdo) diretamente nos casos de uso, não apenas na camada HTTP —
  garantindo que a regra valesse tanto para a API quanto para qualquer
  cliente futuro.
- **Consistência entre backend e frontend**: o campo `tipo` do usuário
  precisou de uma fonte única de verdade (o enum `TipoUsuario`) replicada
  de forma consistente na guarda de rotas do frontend
  (`ProtectedRoute`) e nos middlewares do backend, para evitar
  divergência entre o que a interface permite navegar e o que a API
  realmente autoriza.
- **Containerização do frontend para a entrega final**: como o frontend
  foi construído depois do backend já estar consolidado, foi necessário
  criar um Dockerfile multi-stage próprio (build com Vite + Node e serving
  estático via Nginx, com fallback de rotas para o React Router) e um novo
  job de CI, mantendo os dois serviços (`api` e `web`) validados e
  publicados de forma independente, mas coordenados pelo mesmo
  `docker-compose.yml`.
- **Testes de UI dependentes de rede**: como o frontend usa `fetch`
  nativo, os testes de página precisaram mockar consistentemente as
  chamadas HTTP para isolar o comportamento da interface do
  comportamento real da API, mantendo os testes rápidos e determinísticos.
- **Bootstrap do primeiro Administrador**: como não há self-signup e as
  rotas de `/user` exigem um Administrador autenticado, um banco novo
  fica sem nenhuma forma de criar a primeira conta — um problema clássico
  de "ovo e galinha" da autorização. Esse gap só apareceu ao simular a
  entrega do zero (clonar o repositório, subir os containers e tentar
  logar), o que reforçou a importância de testar o fluxo completo a
  partir de um ambiente limpo, não só incrementalmente durante o
  desenvolvimento. A solução foi um script de seed idempotente
  (`backend/src/scripts/seed-admin.ts`) que cria um Administrador padrão
  apenas se nenhum usuário existir ainda.

## 6. Video
https://youtu.be/YRWSrShEHRA
