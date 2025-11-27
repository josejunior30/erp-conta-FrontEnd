# ERP Project — Finanças conectadas com Pluggy (Frontend)

> **Pitch rápido:** SPA em React + TypeScript que autentica usuário, conecta instituições financeiras via **Pluggy**, lista **contas** e **transações** com filtros e feedbacks de UX (loading, erros, modais). Pronto para avaliação técnica e demo em poucos minutos.

---

## ✨ Principais funcionalidades

- **Autenticação JWT** (login, guarda de rotas públicas/privadas, expiração automática).
- **Conexão Pluggy** via widget (`react-pluggy-connect`) com fluxo de:
  - gerar **connectToken** no backend;
  - abrir widget;
  - tratar **success**, **error**, **close**;
  - checar se há contas já conectadas.
- **Contas conectadas**: cards com saldo disponível/contábil, tipo (corrente, poupança, crédito etc.) e instituição.
- **Transações por conta**: tabela com **filtros de data** (`DD/MM/AAAA`), status e paginação no serviço (page size configurável).
- **UX cuidada**: estados de carregamento, mensagens de erro/sucesso, modais e acessibilidade básica (rótulos, `aria-*`).
- **Sair / Desincronizar**: logout e remoção de itens locais via API.

---

## 🧱 Stack técnica

- **React 19 + Vite 7 + TypeScript 5.9** — dev server rápido e DX moderna.
- **React Router 7** — rotas e guards (`RequireAuth`, `PublicOnlyRoute`).
- **Axios** — cliente HTTP com **interceptor** para Authorization.
- **Bootstrap 5** — estilos utilitários e responsividade.
- **react-pluggy-connect** — widget oficial para conectar instituições.
- Extras: `react-icons`, ESLint 9 (TS/React Hooks/Refresh), Babel React Compiler.

---

## 🗺️ Arquitetura & Fluxo

**Fluxo de alto nível**
1. Login chama `POST /auth/login` → recebe `token` JWT.
2. JWT é salvo em `localStorage` e decodificado para o **ContextToken**.
3. Página **Conectar ao Pluggy**:
   - tenta descobrir se já há itens (contas) conectados;
   - se não, obtém `connectToken` em `POST /api/pluggy/connect-token` e abre o widget;
   - no **success**, marca como conectado.
4. Página **Contas** consome `GET /api/pluggy/items` e mostra cards.
5. Página **Transações** consome `GET /api/pluggy/accounts/:accountId/transactions` com filtros.

---

## 🔗 Rotas

| Rota                          | Proteção        | Descrição                           |
|------------------------------|-----------------|-------------------------------------|
| `/`                          | Pública (apenas se **não** autenticado) | Login |
| `/connect-pluggy`            | Privada         | Conectar e checar contas Pluggy     |
| `/transacoes`                | Privada         | Listagem de contas                  |
| `/transacoes/:accountId`     | Privada         | Transações da conta                 |
| `/logout`                    | Pública         | Utilitário de logout                |

---

## 🧩 Endpoints esperados (backend)

> **Base:** `http://localhost:8080` (ver `src/util/system.ts` → `BASE_URL`)  
> **Backend do projeto:** https://github.com/josejunior30/erp-gestao-conta

- `POST /auth/login` → `{ "token": "string" }`  
  - JWT deve conter `exp` e payload compatível com `AccessTokenPayloadDTO`.

- `POST /api/pluggy/connect-token` → `{ "connectToken": "string" }`

- `GET /api/pluggy/items` → `ItemDetailsDto[]`  
  - Cada item pode conter `accounts[]`, `connector{ name, type, country, institutionUrl }`.

- `DELETE /api/pluggy/items` → `{ "deleted": number }` **ou** `204 No Content`

- `GET /api/pluggy/items/:itemId` → `ItemDetailsDto`

- `GET /api/pluggy/accounts/:accountId/transactions?from&to&status&pageSize` →  
  ```json
  {
    "itemId": "string",
    "totalCount": 0,
    "totalInflow": 0,
    "totalOutflow": 0,
    "net": 0,
    "transactions": [
      {
        "id": "string",
        "dateTime": "2025-01-01T12:00:00Z",
        "description": "string",
        "amount": 0,
        "amountFormatted": "R$ 0,00",
        "status": "POSTED|PENDING"
      }
    ]
  }
   ---
# 1) Instalar dependências
npm install

# 2) Rodar em desenvolvimento (Vite em http://localhost:5173)
npm run dev

# 3) Lint (opcional)
npm run lint

# 4) Build de produção
npm run build

# 5) Preview do build (servido em http://localhost:4173)
npm run preview

