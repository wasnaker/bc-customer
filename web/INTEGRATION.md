# Integrasi Module Customer ke brocoders-react-web

Module Customer dipasang sebagai package, bukan disalin ke source host. Repository
ini adalah satu-satunya source of truth untuk halaman, komponen, hooks, service,
manifest, dan resource bahasa Customer.

## 1. Pasang package

Dari root `brocoders-react-web`:

```bash
npm run module:add -- customer --ref <tag-atau-commit>
```

Perintah tersebut memasang `@wasnaker/module-customer` sebagai dependency Git
yang dikunci ke ref yang diberikan, lalu membangkitkan manifest registry dan
registry resource i18n. Jangan menyalin atau mengedit isi package di frontend.

Untuk menghapus:

```bash
npm run module:rm -- customer
```

## 2. Daftarkan route host

Next.js membutuhkan route entry fisik di host. Route ini hanya adapter tipis;
implementasi halaman tetap berada di package:

`src/app/admin/customer/page.tsx`:

```tsx
import type { Metadata } from "next";
import { getServerTranslation } from "@/services/i18n";
import { getRequestLanguage } from "@/services/i18n/get-request-language";
import Customer from "@/app/[language]/admin/customer/page-content";

export async function generateMetadata(): Promise<Metadata> {
  const language = await getRequestLanguage();
  const { t } = await getServerTranslation(language, "module-customer");
  return { title: t("module-customer:title") };
}

export default function Page() {
  return <Customer />;
}
```

`src/app/[language]/admin/customer/page-content.tsx`:

```tsx
"use client";

import { RoleEnum } from "@/services/api/types/role";
import withPageRequiredAuth from "@/services/auth/with-page-required-auth";
import { CustomerPage } from "@wasnaker/module-customer";

function Customer() {
  return <CustomerPage />;
}

export default withPageRequiredAuth(Customer, { roles: [RoleEnum.ADMIN] });
```

## 3. Kontrak package

- Manifest: `@wasnaker/module-customer/manifest`
- Public API halaman/komponen: `@wasnaker/module-customer`
- Resource bahasa: `@wasnaker/module-customer/locales/<language>`
- Host menyediakan alias `@/*`, auth, API client, routing, UI primitives,
  React Query, dan peer dependencies.
- Host menjalankan `transpilePackages` untuk module packages.
- Manifest dan locale registry dibangkitkan dari dependency package; tidak ada
  source module yang disalin ke `src/modules` atau folder locale host.

## 4. Endpoint API

Semua request menggunakan API_URL host (`/api/v1`):

| Aksi | Endpoint |
|------|----------|
| List provinsi | `GET /v1/customer/provinces?page&limit&filters&sort` |
| Detail provinsi | `GET /v1/customer/provinces/:id` |
| CRUD provinsi | `POST/PATCH/DELETE /v1/customer/provinces` |
| List kab/kota | `GET /v1/customer/regencies?filters=...` |
| Detail kab/kota | `GET /v1/customer/regencies/:id` |
| CRUD kab/kota | `POST/PATCH/DELETE /v1/customer/regencies` |

## 5. Pengembangan lokal

Edit kode hanya di repository `bc-customer`. Setelah perubahan diuji, buat
commit/tag baru dan perbarui ref dependency di host. Jangan melakukan hotfix
pada salinan package di repository frontend.
