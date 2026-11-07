# Backend package

The backend capability is built as CommonJS JavaScript plus TypeScript declarations.
This is intentional: the NestJS host currently compiles to CommonJS, while the web
entry point remains TypeScript source consumed by Next.js `transpilePackages`.

## Install

```bash
npm install github:wasnaker/bc-customer#<immutable-commit-sha>
```

Pin an immutable commit SHA in both `package.json` and `package-lock.json`.

## Universal API package contract

Every backend-capable module exposes:

- `<package>/api`: its NestJS module and public API exports.
- `<package>/api/manifest`: named `moduleManifest`, including module ID,
  version, capabilities and permission definitions.
- `<package>/api/definition`: named `moduleDefinition`, the canonical host
  integration contract. It contains the manifest, `registerAsync()`, entity
  classes, migration classes and seed service classes.
- `<package>/api/entities`: named `moduleEntities` array.
- `<package>/api/migrations`: named `moduleMigrations` array.
- `<package>/api/seeds`: named `moduleSeedServices` array.

A module without entities, migrations or seed providers exports an empty array.
The package owns controllers, DTOs, domain, services, entities, repositories,
migrations, permissions and seed data. It never owns the host's database
connection, JWT strategy, roles table or permission persistence.

## Register in NestJS

The host scans installed `@wasnaker/module-*` dependencies and generates its
backend module registry. Each API package's `moduleDefinition.registerAsync()`
is called automatically with the host authorization adapter. The host should
not add a package-specific `CustomerModule` import or manually list its entities,
migrations or seed services.

The module enforces `read:customer`, `create:customer`, `update:customer` and
`delete:customer` at the API boundary. The host supplies the authorization
adapter and resolves permissions from its PostgreSQL role-permission relation.

## PostgreSQL lifecycle

The host owns one PostgreSQL DataSource. Its generated registry automatically
collects each installed API module's entities and migration classes for both
NestJS runtime TypeORM configuration and the standalone TypeORM CLI DataSource.
Migration execution remains an explicit deployment operation; package install
and application startup never run migrations.

The host's explicit relational seed runner discovers module seed service
providers from the same definitions. Each module seed must be idempotent.
Permission definitions are seeded before module seeds, and the host's default
admin role receives newly registered permissions without overwriting existing
role assignments.

## Build locally

```bash
npm run build:api
npm run verify:api-package
```
