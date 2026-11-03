# Wasnaker Customer module

The Customer module is the pilot implementation of the Wasnaker modular package
contract. This repository is the **single source of truth** for the module's
backend and frontend capabilities.

## Capabilities

- `@wasnaker/module-customer/api` — NestJS module, services, entities and seed provider.
- `@wasnaker/module-customer/api/manifest` — backend module metadata and permissions.
- `@wasnaker/module-customer/api/migrations` — PostgreSQL migration classes.
- `@wasnaker/module-customer/web` — React/Next.js page and UI exports.
- `@wasnaker/module-customer/manifest` — frontend navigation and dashboard manifest.
- `@wasnaker/module-customer/locales/<language>` — module-owned translations.

A module may expose API, web, or both. Hosts install the same package and import
only the capability they use. API and web dependencies are optional peers so an
API-only host does not install a React runtime, and a web-only host does not
install NestJS.

## Backend build and host integration

See [API integration](api/INTEGRATION.md). The API is compiled to CommonJS
because the current NestJS host uses CommonJS. The nested `api/package.json`
sets the package scope to CommonJS without changing the ESM web package scope.

Install with an immutable Git commit SHA. Git dependency installation runs the
package `prepare` script to build the backend output. The host owns the
PostgreSQL connection, authentication strategy, role IDs, migration runner and
seed lifecycle. The module owns its API implementation, schema migration and
seed data.

## Frontend integration

See [Frontend package](web/PACKAGE.md). Next.js hosts transpile the web source
package and load locale resources directly from its exports.

## Development

```bash
npm install
npm run build:api
npm run verify:api-package
```
