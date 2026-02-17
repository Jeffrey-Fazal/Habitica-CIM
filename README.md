# Habitica Proxy for ChatGPT Actions

This worker authenticates inbound requests with a single bearer token and injects Habitica-required headers upstream.

## Environment variables

Copy `.env.example` and set:

- `PROXY_BEARER_TOKEN` - token required in `Authorization: Bearer <token>` for all proxy requests
- `HABITICA_USER_ID` - Habitica user id used for `x-api-user`
- `HABITICA_API_TOKEN` - Habitica API token used for `x-api-key`
- `HABITICA_CLIENT_USER_ID` (optional) - tool author Habitica user id for `x-client` prefix; defaults to `HABITICA_USER_ID`
- `HABITICA_APP_NAME` - app identifier (no spaces), used in `x-client` as `<client_user_id>-<app_name>`

## Run locally

```bash
npm install -g wrangler
cp .env.example .dev.vars
# Fill in values in .dev.vars
wrangler dev
```

## Example request

```bash
curl -X GET "http://127.0.0.1:8787/habitica/tasks/user?type=todos" \
  -H "Authorization: Bearer YOUR_PROXY_BEARER_TOKEN"
```

## Notes

- Habitica requires `x-api-user`, `x-api-key`, and `x-client` headers.
- This proxy injects those headers on every upstream request to `https://habitica.com/api/v3`.
- ChatGPT Action clients only need to send `Authorization: Bearer <token>`.

## Quick manual test checklist

1. Start server with env vars configured (`wrangler dev`).
2. `GET /habitica/tasks/user` returns `200` when authorised.
3. Same call without `Authorization` header returns `401` with `{ "error": "unauthorised" }`.
4. `GET /habitica/tasks/user?type=todos` works and forwards the type filter.
5. Creating, updating, and deleting tasks through:
   - `POST /habitica/tasks/user`
   - `PUT /habitica/tasks/{taskId}`
   - `DELETE /habitica/tasks/{taskId}`
