# API Type System

> Use this file to understand how the project handles API types before adding any new endpoints or response shapes.

---

## Overview

The client's API types are **100% auto-generated from OpenAPI**. There are no hand-maintained response interfaces for existing routes.

### Pipeline

```
php artisan l5-swagger:generate
        ↓
server/storage/api-docs/api-docs.json   (OpenAPI JSON spec)
        ↓
npx openapi-typescript → client/src/types/api.d.ts   (generated, do NOT edit)
```

Run the whole pipeline with:

```bash
cd client && npm run update:types
```

This command lives in `client/package.json` → `scripts.update:types`.

---

## How to Consume Types

`client/src/types/api-contracts.ts` exports named response types derived from `api.d.ts` using utility types:

```ts
// api-contracts.ts
export type FetchEventsResponse = ApiPayload<"/api/events", "get">;
export type FetchContractsResponse = ApiPayload<"/api/contracts", "get">;
```

Fetch functions import these named types:

```ts
// fetchEvents.ts
import type { FetchEventsResponse } from "@/types/api-contracts";

return await apiFetch<FetchEventsResponse>(url, { method: "GET" });
```

---

## Rules

> [!IMPORTANT]
> **Never hand-write response interfaces** for existing or new API endpoints.
> Always add `#[OA\...]` attributes to the PHP controller action first,
> run `npm run update:types`, then derive the type from `ApiPayload<path, method>` in `api-contracts.ts`.

> [!CAUTION]
> Adding a new endpoint **without OpenAPI annotations** breaks the type chain.
> The `api.d.ts` file will not include the new route, forcing a manual interface workaround — avoid this.

---

## Adding a New Endpoint — Checklist

1. Add the controller action with full `#[OA\Get(...)]` / `#[OA\Post(...)]` attributes including all parameters and response schemas.
2. Register the route in `server/routes/web.php`.
3. Run `cd client && npm run update:types` to regenerate `api.d.ts`.
4. Add a named export in `client/src/types/api-contracts.ts`:
   ```ts
   export type FetchMyThingResponse = ApiPayload<"/api/my-thing", "get">;
   ```
5. Use that type in the fetch function.

---

## Extending an Existing Endpoint (preferred over new routes)

If you only need to add an optional query parameter to an existing endpoint (e.g. `with_events=true` on `/api/contracts`):

1. Add the new `OA\QueryParameter` annotation to the existing action.
2. Extend the `OA\Response` schema with the new optional field (use `nullable: true` or mark as optional).
3. Run `npm run update:types`.
4. Update `FetchContractsResponse` (or the relevant type) — it will automatically reflect the new field.
5. Update the fetch function signature and the query hook params.

This approach keeps the route surface minimal and the type system consistent.
