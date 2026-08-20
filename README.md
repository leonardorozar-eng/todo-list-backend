# To-Do List - Backend (API REST)

API REST desenvolvida para a **Avaliação Prática de Recuperação - Desenvolvimento de Sistema To-Do List**.

## Tecnologias

- **Node.js** + **Express**
- **Prisma ORM** + **SQLite** (banco relacional)
- **JWT** (jsonwebtoken) para autenticação
- **bcryptjs** para hash de senhas
- **CORS** habilitado para integração com o frontend

## Estrutura do Projeto

```
todo-backend/
├── prisma/
│   └── schema.prisma          # Modelagem do banco (User e Task)
├── src/
│   ├── middleware/
│   │   └── auth.js            # Middleware de autenticação JWT
│   ├── routes/
│   │   ├── auth.js            # Cadastro e Login
│   │   ├── users.js           # CRUD de Usuários
│   │   └── tasks.js           # CRUD de Tarefas (vinculadas ao usuário)
│   └── server.js              # Ponto de entrada da aplicação
├── referencias.http           # Arquivo de testes da API (REST Client)
├── DER.jpg                    # Diagrama de Entidade e Relacionamento
├── .env.example
├── package.json
└── README.md
```

## Diagrama de Entidade e Relacionamento (DER)

O arquivo `DER.jpg` deve estar na raiz deste repositório (adicione-o a partir do zip se ainda não estiver).

**Relacionamento:**
- Um **User** possui **várias Tasks** (1:N)
- Cada **Task** pertence a **um único User**
- Ao excluir um usuário, suas tarefas são excluídas automaticamente (Cascade)

## Como rodar localmente

### 1. Pré-requisitos
- Node.js 18+ instalado

### 2. Instalação

```bash
git clone https://github.com/leonardorozar-eng/todo-list-backend.git
cd todo-list-backend
npm install
```

### 3. Configuração do Banco de Dados

```bash
# Cria o arquivo .env (copie do exemplo)
cp .env.example .env

# Gera o cliente Prisma
npx prisma generate

# Cria as tabelas no banco (migration)
npx prisma migrate dev --name init
```

### 4. Iniciar o servidor

```bash
npm run dev
```

A API estará disponível em: **http://localhost:3001**

### 5. Testando a API

1. Abra o arquivo `referencias.http` no VS Code
2. Instale a extensão **REST Client**
3. Execute as requisições na ordem (register → login → tasks)

## Endpoints Principais

| Método | Rota              | Descrição                          | Auth |
|--------|-------------------|------------------------------------|------|
| POST   | /auth/register    | Cadastro de usuário                | Não  |
| POST   | /auth/login       | Login (retorna JWT)                | Não  |
| GET    | /users            | Dados do usuário logado            | Sim  |
| GET    | /users/:id        | Buscar usuário por ID              | Sim  |
| PUT    | /users/:id        | Atualizar usuário                  | Sim  |
| DELETE | /users/:id        | Excluir usuário (+ tarefas)        | Sim  |
| GET    | /tasks            | Listar tarefas do usuário          | Sim  |
| GET    | /tasks/:id        | Buscar tarefa por ID               | Sim  |
| POST   | /tasks            | Criar tarefa                       | Sim  |
| PUT    | /tasks/:id        | Atualizar tarefa                   | Sim  |
| DELETE | /tasks/:id        | Excluir tarefa                     | Sim  |

## Segurança (RNF-03)

- Senhas com hash (bcrypt)
- Rotas protegidas com JWT
- Usuário **nunca** consegue ver ou manipular tarefas de outro usuário
