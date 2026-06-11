<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# GuFix

## Rodar localmente

Pré-requisitos:
- Node.js 20+
- MySQL 8+

1. Instale dependências:
   `npm install`
2. Crie `.env` com base em `.env.example`.
3. Execute o schema do banco:
   `mysql -u root -p < mysql-schema.sql`
4. Rode a API:
   `npm run dev:api`
5. Em outro terminal, rode o frontend:
   `npm run dev`

## Deploy

- Build: `npm run build`
- Start: `npm run start`
- Em produção, o frontend precisa alcançar a API Express. Se a API ficar no mesmo domínio, `/api/...` funciona direto. Se ficar em outro domínio, configure `VITE_API_BASE_URL` no build do frontend.
- Cadastro e login salvam no MySQL somente quando `npm run start` está rodando com `MYSQL_HOST`, `MYSQL_USER`, `MYSQL_PASSWORD` e `MYSQL_DATABASE` configurados.

## Observação importante

Atualmente a interface ainda possui integrações Firebase em parte do fluxo.
A API MySQL (`server/index.ts`) já está pronta para a migração do frontend.

## Biometria (WebAuthn)

- O login biométrico usa WebAuthn com validação no backend e credenciais salvas no MySQL.
- Para produção, configure no `.env`:
  - `WEBAUTHN_RP_NAME`
  - `WEBAUTHN_RP_ID` (ex.: seu domínio)
  - `WEBAUTHN_RP_ORIGIN` (ex.: `https://seu-dominio.com`)
- Execute migração para tabela `webauthn_credentials` e coluna `usuarios.password_hash` se seu banco já existir.
