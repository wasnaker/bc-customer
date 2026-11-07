# Rencana: Otorisasi Edit Branch & Staff Berbasis Scope

Status: **rencana (belum ada kode yang diubah)**
Modul: `bc-customer` (api + web), host `brocoders-api` / `brocoders-react-web`
Tanggal disusun: 2026-11-07

---

## 1. Tujuan

Memberi hak edit yang **terbatas pada lingkup data** milik user, tanpa
menghardcode role/ID:

| Skenario | Target perilaku |
|---|---|
| **Vera Amelia** (user 39) — role `Customer Admin`, `Customer Branch Admin`, `Customer` | Boleh **edit branch & staff di semua branch** milik customer **16 (PT Borneo Energi Lestari)**: branch 38, 39, 40, 41. Tidak boleh menyentuh branch customer lain (mis. 42–45 milik customer 17). |
| **Maria Magdalena Sitorus** (user 44) — role `Customer Branch Admin`, `Customer` | Hanya boleh **edit branch & staff di branch 43** (Cabang Bandar Lampung PT Bahari Perkasa Abadi). Branch 42, 44, 45 milik customer yang sama **ditolak**. |
| **Admin** (role 1) | Tetap boleh semuanya (bypass global, tanpa assignment scope). |

Arti "edit" di sini: `update:branch` dan `update:staff`. `create`/`delete`
tidak diminta dan **tidak** ikut dilonggarkan pada fase 1 (lihat §11).

---

## 2. Kondisi saat ini (terverifikasi)

### 2.1 Guard hanya memeriksa permission, tidak memeriksa scope

`api/src/customer/security/customer-access.guard.ts`:

- Permission diturunkan dari method HTTP + resource:
  `GET→read`, `POST→create`, `PATCH|PUT→update`, `DELETE→delete`.
- Resource diambil dari metadata `@CustomerResource(...)`, fallback `customer`.
- Lalu **union** semua role user:
  ```ts
  for (const roleId of roleIds) {
    if (await this.options.authorize(roleId, permission)) return true;
  }
  throw new ForbiddenException();
  ```
- `options.authorize` di host = `ModuleAuthorizationService.hasPermission(roleId, permission)`
  yang hanya `JOIN role → permission`. **Tidak ada konsep branch/customer.**

Konsekuensi: siapa pun yang punya permission `update:branch` boleh mengedit
**branch mana pun** di database.

### 2.2 Permission di database (hasil query, bukan asumsi)

```
 role_id | role_name             | permission
---------+-----------------------+-------------
   3     | Customer Admin        | create/read/update/delete:branch
   3     | Customer Admin        | create/read/update/delete:staff
   3     | Customer Admin        | create/read/update/delete:customer
   4     | Customer Branch Admin | create:staff, read:branch, read:staff,
         |                       | update:staff, delete:staff
   5     | Customer              | read:branch, read:staff
```

- **Role 4 belum punya `update:branch`.** Jadi Maria saat ini bahkan tidak
  bisa edit branch-nya sendiri — bukan soal scope, tapi permission-nya tidak ada.
- Role 4 **punya** `update:staff` (tanpa scope) → Maria saat ini bisa mengedit
  staff **semua branch**.

### 2.3 Sumber scope sudah ada tapi tidak dipakai

Tabel `module_role_assignment` (`moduleId='customer'`):

| userId | roleKey | scopeType | scopeId | arti |
|---|---|---|---|---|
| 39 | `customer-admin` | customer | 16 | Vera → seluruh customer 16 |
| 39 | `customer-branch-admin` | branch | 38 | Vera → branch 38 |
| 39 | `customer` | branch | 38 | Vera → branch 38 |
| 44 | `customer-branch-admin` | branch | 43 | Maria → branch 43 |
| 44 | `customer` | branch | 43 | Maria → branch 43 |

`bc-customer/api/src/customer/customer.manifest.ts` sudah mendeklarasikan
`roles[].scope` (`customer` / `branch` / `global`) dan permission per role.

`brocoders-api/src/module-runtime/module-authorization.service.ts` **sudah
punya** `hasModulePermission(userId, moduleId, permission, scopeType, scopeId)`
yang membaca `module_role_assignment`, **tetapi tidak dipanggil di mana pun**
(`grep` hanya menemukan deklarasinya).

### 2.4 Topologi data

```
customer 16 PT Borneo Energi Lestari → branch 38 (HO), 39, 40, 41
customer 17 PT Bahari Perkasa Abadi   → branch 42 (HO), 43, 44, 45
```

### 2.5 Cakupan assignment belum lengkap

- User dengan role 3/4/5 di `user_roles_role`: **121 baris**, 66 `Customer`,
  11 `Customer Admin`, 44 `Customer Branch Admin`.
- User yang punya baris `module_role_assignment` untuk modul customer: **44 user**
  (99 baris).
- **77 user** dengan role customer **tidak punya assignment** (mis. 101, 102,
  201–220). Mereka semua punya `staff` → `branch` (jadi scope-nya bisa diturunkan),
  tetapi harus di-backfill sebelum enforcement dinyalakan.

### 2.6 Lapisan frontend

- `can(permission, user)` (`brocoders-react-web/src/core/modules/can.ts`)
  hanya tahu **permission**, tidak tahu scope. Tombol edit/delete di
  `branch-page.tsx` / `staff-page.tsx` **tidak digating sama sekali**.
- `web/src/modules/customer/module.manifest.ts`:
  - halaman `/admin/customer/branch` **tanpa** `permission` → siapa pun yang
    login bisa membukanya;
  - item menu `branch` juga **tanpa** `permission`.
- `GET /customer/me/branch` sudah ada dan self-scoped (`@CustomerSelfBranch`),
  dipakai banner impersonasi. Belum ada endpoint yang mengembalikan **daftar**
  scope user.

### 2.7 Yang tidak bisa dilakukan lewat edit

- `CreateBranchDto` tidak punya `customerId` → branch **tidak bisa dipindah**
  ke customer lain lewat `PATCH /customer/branches/:id`.
- `CreateStaffDto`/`UpdateStaffDto` tidak punya `branchId` → staff **tidak bisa
  dipindah** antar branch.
- Ini menyederhanakan scope check: target scope selalu = branch/customer saat ini.

---

## 3. Gap yang harus ditutup

| # | Gap | Dampak |
|---|---|---|
| G1 | Role 4 tidak punya `update:branch` | Maria tidak bisa edit branch sendiri |
| G2 | `update:staff` role 4 tanpa scope | Maria bisa edit staff semua branch |
| G3 | Guard tidak tahu target branch/customer | Customer Admin pun tidak dibatasi; tidak ada isolasi antar customer |
| G4 | `hasModulePermission` tidak dipakai | Scope yang sudah di-seed tidak berefek |
| G5 | 77 user tanpa assignment | Enforcement langsung = 403 massal |
| G6 | `isHeadOffice` bisa diubah branch-admin | Branch admin bisa "menaikkan" branch-nya jadi HO (integritas data) |
| G7 | Frontend tanpa gating & halaman branch tanpa permission | UX menyesatkan (tombol muncul, API 403) |
| G8 | Read endpoint tidak scoped | Maria melihat semua branch/staff (walau tidak bisa edit) |

---

## 4. Prinsip desain

1. **Tidak ada hardcode role/ID.** Keputusan diambil dari:
   - permission di tabel `permission` / `roles_permissions_role`,
   - nama role pada **manifest** modul (`moduleManifest.roles[].name`) untuk
     menentukan apakah user "scope-managed",
   - baris `module_role_assignment` untuk batas scope.
2. **Dua lapis, keduanya wajib lolos**:
   - **Lapis 1 — permission (global):** union permission semua role user,
     seperti sekarang. Gagal → 403.
   - **Lapis 2 — scope:** hanya untuk user yang punya role milik manifest
     customer. Target request harus berada di dalam assignment user. Gagal → 403.
3. **Fail-closed**: target tidak bisa di-resolve, assignment kosong, atau
   role scope-managed tapi tidak punya assignment → **tolak**.
4. **Admin bypass berbasis data**, bukan `roleId === 1`: user yang tidak punya
   satu pun role dengan nama yang dideklarasikan manifest (`Customer Admin`,
   `Customer Branch Admin`, `Customer`) dianggap **global** dan hanya tunduk
   pada lapis 1. Role `Admin` tidak ada di manifest → lolos sebagai global.
5. **Permission grant & scope enforcement dirilis bersamaan** (satu deploy),
   supaya tidak ada jendela di mana role 4 bisa mengedit semua branch.

---

## 5. Desain implementasi

### 5.1 Manifest: tambah `update:branch` ke `customer-branch-admin`

`bc-customer/api/src/customer/customer.manifest.ts`:

```diff
     {
       key: 'customer-branch-admin',
       name: 'Customer Branch Admin',
       description: 'Administrator limited to one assigned branch.',
       scope: 'branch',
-      permissions: ['read:branch', 'read:staff', 'create:staff', 'update:staff', 'delete:staff'],
+      permissions: ['read:branch', 'update:branch', 'read:staff', 'create:staff', 'update:staff', 'delete:staff'],
     },
```

`ModulePermissionSeedService` sudah idempotent dan menautkan permission
manifest ke role core **berdasarkan nama role**, jadi `npm run seed:run:relational`
akan menambahkan baris `roles_permissions_role` untuk role "Customer Branch Admin".

Tetap tambahkan **migration modul** agar tidak bergantung pada seed manual:

```sql
-- bc-customer/api/src/customer/database/migrations/<ts>-GrantBranchAdminUpdateBranch.ts
INSERT INTO "roles_permissions_role" ("roleId", "permissionId")
SELECT r.id, p.id
FROM "role" r, "permission" p
WHERE r.name = 'Customer Branch Admin'
  AND p.name = 'update:branch'
ON CONFLICT DO NOTHING;
```

> Catatan: migration modul terdaftar otomatis lewat `BACKEND_MODULE_MIGRATIONS`
> di `src/database/data-source.ts`, jadi ikut `npm run migration:run`.

### 5.2 Opsi modul: tambah callback scope

`bc-customer/api/src/customer/customer.options.ts`:

```ts
export interface CustomerScopeTarget {
  /** Customer pemilik data target (diisi bila bisa diturunkan). */
  customerId?: number | string;
  /** Branch target (diisi bila target adalah branch atau staff). */
  branchId?: number | string;
}

export interface CustomerModuleOptions {
  authorize: (roleId: number | string, permission: string) => boolean | Promise<boolean>;

  /**
   * Opsional; bila tidak disediakan guard jatuh ke perilaku lama (permission saja).
   * Host mengimplementasikan pemetaan: permission global + scope assignment.
   */
  authorizeScoped?: (
    userId: number | string,
    permission: string,
    target: CustomerScopeTarget,
  ) => boolean | Promise<boolean>;
}
```

Modul **tidak** mengimpor entity host (paket npm terpisah), jadi callback ini
satu-satunya jalur yang bersih — konsisten dengan pola `authorize` yang ada.

### 5.3 Host: implementasi `authorizeScoped`

`brocoders-api/src/module-runtime/module-authorization.service.ts`:

```ts
async authorizeScoped(
  userId: number | string,
  moduleId: string,
  permission: string,
  target: { customerId?: string | number; branchId?: string | number },
): Promise<boolean> {
  const id = Number(userId);
  if (!Number.isSafeInteger(id) || id <= 0) return false;

  const user = await this.usersRepository.findOne({
    where: { id },
    relations: { roles: { permissions: true } },
  });
  if (!user) return false;
  const roles = user.roles?.length ? user.roles : user.role ? [user.role] : [];

  // Lapis 1 — permission global (union semua role).
  const granted = roles.some((role) =>
    role.permissions?.some((p) => p.name === permission),
  );
  if (!granted) return false;

  // Admin / role non-modul → global, tidak dibatasi assignment.
  const manifest = BACKEND_MODULE_MANIFESTS.find((m) => m.id === moduleId);
  const managedNames = new Set((manifest?.roles ?? []).map((r) => r.name));
  if (!roles.some((role) => managedNames.has(role.name))) return true;

  // Lapis 2 — scope. Fail-closed bila tidak ada assignment.
  const assignments = await this.assignmentsRepository.find({
    where: { userId: id, moduleId },
  });
  return assignments.some(
    (a) =>
      a.scopeType === 'global' ||
      (a.scopeType === 'customer' &&
        target.customerId != null &&
        a.scopeId === String(target.customerId)) ||
      (a.scopeType === 'branch' &&
        target.branchId != null &&
        a.scopeId === String(target.branchId)),
  );
}
```

Wiring di `src/app.module.ts` (dan `src/database/seeds/relational/seed.module.ts`):

```ts
useFactory: (authorization: ModuleAuthorizationService) => ({
  authorize: (roleId, permission) => authorization.hasPermission(roleId, permission),
  authorizeScoped: (userId, permission, target) =>
    authorization.authorizeScoped(userId, 'customer', permission, target),
}),
```

Karena semua modul memakai factory yang sama (`definition.manifest.id !== 'impersonate'`),
isi `moduleId` diambil dari `definition.manifest.id`, bukan literal.

### 5.4 Modul: resolver target + guard scope

File baru: `api/src/customer/security/customer-scope.decorator.ts`

```ts
export type CustomerScopeSource =
  | { kind: 'customer-param'; param: string }        // :customerId
  | { kind: 'customer-lookup'; param: string }       // :id → customer
  | { kind: 'branch-param'; param: string }          // :branchId
  | { kind: 'branch-lookup'; param: string }         // :id → branch
  | { kind: 'staff-lookup'; param: string };         // :id → staff → branch

export const CustomerScope = (source: CustomerScopeSource) =>
  SetMetadata(CUSTOMER_SCOPE_METADATA, source);
```

File baru: `api/src/customer/security/customer-scope.guard.ts`

Alur:
1. Skip bila `@CustomerSelfBranch`.
2. Baca `@CustomerResource` → permission (reuse logika method→action).
3. Baca `@CustomerScope` → resolve target:
   - `customer-param`: `{ customerId: param }`
   - `customer-lookup`: `{ customerId: param }` (+ lookup untuk validasi 404 lebih awal)
   - `branch-param`: `{ branchId: param, customerId: branch.customerId }` (lookup)
   - `branch-lookup`: `{ branchId: param, customerId: branch.customerId }`
   - `staff-lookup`: `{ branchId: staff.branchId, customerId: branch.customerId }`
4. Bila `options.authorizeScoped` ada → panggil dengan `request.user.id`
   (bukan role). Gagal → `ForbiddenException`.
5. Bila target tidak bisa di-resolve untuk aksi tulis → **403** (fail-closed).

Guard ini didaftarkan **setelah** `CustomerAccessGuard` pada controller
(`@UseGuards(AuthGuard('jwt'), CustomerAccessGuard, CustomerScopeGuard)`),
sehingga lapis permission tetap berjalan lebih dulu dan pesan error tetap jelas.

### 5.5 Pemetaan route → target scope

| Route | Permission | Target |
|---|---|---|
| `PATCH /customer/branches/:id` | `update:branch` | `branch-lookup :id` → `{branchId, customerId}` |
| `DELETE /customer/branches/:id` | `delete:branch` | `branch-lookup :id` (role 4 tidak punya → hanya admin/customer-admin) |
| `POST /customer/:customerId/branches` | `create:branch` | `customer-param :customerId` |
| `POST /customer/branches/:branchId/staff` | `create:staff` | `branch-param :branchId` |
| `PATCH /customer/staff/:id` | `update:staff` | `staff-lookup :id` |
| `DELETE /customer/staff/:id` | `delete:staff` | `staff-lookup :id` |
| `PATCH /customer/:id` (customer) | `update:customer` | `customer-lookup :id` |
| `DELETE /customer/:id` (customer) | `delete:customer` | `customer-lookup :id` |

Route `create:customer` (`POST /customer`) tidak punya target yang bisa
di-resolve → **hanya** lolos lapis 1 (permission global). Role 4 tidak punya
`create:customer`, dan Customer Admin memang berhak membuat customer baru di
lingkungan demo; bila kelak perlu dibatasi, tambahkan aturan tersendiri.
Route `GET` tidak memakai `@CustomerScope` di fase 1 (lihat §5.7).

Tanpa baris `PATCH /customer/:id` di atas, Customer Admin (role 3, yang punya
`update:customer` global) masih bisa mengedit customer lain — itu celah isolasi
antar-customer yang harus ikut ditutup pada deploy yang sama.

### 5.6 Aturan khusus `isHeadOffice`

Mengubah `isHeadOffice` menyentuh identitas perusahaan, bukan branch itu saja.
Aturan: perubahan `isHeadOffice` hanya diizinkan bila user punya akses
**customer-scope** (bukan branch-scope) terhadap customer pemilik branch.

Implementasi: di `CustomerScopeGuard`, bila `request.body.isHeadOffice !== undefined`
dan nilainya berbeda dari nilai sekarang, panggil `authorizeScoped` dengan
`target = { customerId }` **saja** (tanpa `branchId`) sehingga hanya assignment
`scopeType='customer'` yang cocok. Vera lolos, Maria 403.

### 5.7 Read scoping (fase 2, desain sudah disiapkan)

Agar daftar yang tampil konsisten dengan yang boleh diedit, endpoint baca
difilter berdasarkan assignment user:

- `GET /customer/branches` → hanya branch yang lolos (customer-scope atau
  branch-scope).
- `GET /customer/:customerId/branches` → 403 bila `customerId` di luar scope.
- `GET /customer/branches/:branchId/staff` → 403 bila branch di luar scope.
- `GET /customer/staff` → staff yang branch-nya di dalam scope.

Implementasi: `BranchService`/`StaffService` menerima `scope` opsional
(`{ customerIds: string[]; branchIds: string[]; global: boolean }`) dari
controller, lalu repository menambahkan predicate `WHERE`. Alternatif yang
lebih kecil risikonya: tetap permission-only untuk baca, tetapi frontend
menyembunyikan baris di luar scope (§5.8). **Rekomendasi: kerjakan §5.8 dulu,
§5.7 menyusul.**

### 5.8 Frontend

1. **Endpoint baru** `GET /customer/me/scope` (self-scoped, `@CustomerSelfBranch`):

   ```json
   {
     "global": false,
     "customerIds": ["16"],
     "branchIds": ["38", "39", "40", "41"],
     "primary": { "customerId": "16", "customerName": "PT Borneo Energi Lestari",
                  "branchId": "38", "branchName": "Kantor Pusat PT Borneo Energi Lestari" }
   }
   ```

   Untuk Admin: `{ "global": true, "customerIds": [], "branchIds": [] }`.
   Implementasi membaca `module_role_assignment` lewat callback host
   (`resolveScope(userId)` di options) supaya modul tidak mengimpor entity host.

2. **Gating tombol** di `branch-page.tsx` / `staff-page.tsx`:

   ```tsx
   const canEditRow = can("update:branch", user) &&
     (scope.global || scope.customerIds.includes(row.customerId) ||
      scope.branchIds.includes(row.id));
   ```

   Tombol Edit/Delete hanya dirender bila lolos. Ini kosmetik — API tetap
   menolak (§5.4) sehingga tidak ada celah keamanan bila UI salah.

3. **Manifest** (`module.manifest.ts`):

   ```diff
   - { path: "/admin/customer/branch", component: BranchPage, ... },
   + { path: "/admin/customer/branch", component: BranchPage, ..., permission: "read:branch" },
   ...
   - { slug: "branch", ..., href: "/admin/customer/branch", position: 2 },
   + { slug: "branch", ..., href: "/admin/customer/branch", position: 2, permission: "read:branch" },
   ```

4. **Menu parent** tetap `read:customer`. Akibatnya Maria (role 4 tanpa
   `read:customer`) tidak melihat parent menu — item `branch`/`staff` adalah
   anak dari parent tersebut. Perlu keputusan: **§11 Q1**. Rekomendasi: parent
   tidak memakai permission dan mengandalkan aturan "parent tampil bila
   minimal satu anak lolos" yang sudah ada di `resolve-menu.ts`.

---

## 6. Backfill data (wajib sebelum enforcement)

### 6.1 Prasyarat: semua user punya staff → branch

```sql
SELECT u.id, u."firstName", u."lastName"
FROM "user" u
JOIN user_roles_role ur ON ur."userId" = u.id AND ur."roleId" IN (3,4,5)
LEFT JOIN staff s ON s."userId" = u.id
WHERE s.id IS NULL;
```

Bila ada hasil → user tersebut **tidak bisa** diberi scope otomatis; harus
di-assign manual atau akunnya dinonaktifkan. (Data saat ini: 77 user tanpa
assignment semuanya punya `staff`.)

### 6.2 Backfill assignment (idempotent, berbasis nama role)

```sql
-- Customer: branch scope untuk setiap user yang punya staff
INSERT INTO "module_role_assignment" ("userId","moduleId","roleKey","scopeType","scopeId")
SELECT s."userId", 'customer', 'customer', 'branch', s."branchId"::varchar
FROM staff s
JOIN user_roles_role ur ON ur."userId" = s."userId"
JOIN role r ON r.id = ur."roleId" AND r.name = 'Customer'
WHERE s."userId" IS NOT NULL
ON CONFLICT ("moduleId","roleKey","userId","scopeType","scopeId") DO NOTHING;

-- Customer Branch Admin: branch scope
INSERT INTO "module_role_assignment" ("userId","moduleId","roleKey","scopeType","scopeId")
SELECT s."userId", 'customer', 'customer-branch-admin', 'branch', s."branchId"::varchar
FROM staff s
JOIN user_roles_role ur ON ur."userId" = s."userId"
JOIN role r ON r.id = ur."roleId" AND r.name = 'Customer Branch Admin'
WHERE s."userId" IS NOT NULL
ON CONFLICT ("moduleId","roleKey","userId","scopeType","scopeId") DO NOTHING;

-- Customer Admin: customer scope, hanya bila staff ada di head office
INSERT INTO "module_role_assignment" ("userId","moduleId","roleKey","scopeType","scopeId")
SELECT s."userId", 'customer', 'customer-admin', 'customer', b."customerId"::varchar
FROM staff s
JOIN branch b ON b.id = s."branchId" AND b."isHeadOffice" = TRUE
JOIN user_roles_role ur ON ur."userId" = s."userId"
JOIN role r ON r.id = ur."roleId" AND r.name = 'Customer Admin'
WHERE s."userId" IS NOT NULL
ON CONFLICT ("moduleId","roleKey","userId","scopeType","scopeId") DO NOTHING;
```

Catatan: `Customer Admin` yang **tidak** ber-head-office tidak mendapat
customer-scope otomatis. Mereka akan ditolak (fail-closed) sampai di-assign
manual — laporkan daftarnya sebelum deploy.

### 6.3 Verifikasi hasil

```sql
-- Harus 0: user scope-managed tanpa assignment
SELECT u.id, string_agg(DISTINCT r.name, ', ')
FROM "user" u
JOIN user_roles_role ur ON ur."userId" = u.id
JOIN role r ON r.id = ur."roleId"
WHERE r.name IN ('Customer Admin','Customer Branch Admin','Customer')
  AND NOT EXISTS (
    SELECT 1 FROM module_role_assignment m
    WHERE m."userId" = u.id AND m."moduleId" = 'customer')
GROUP BY u.id;

-- Cek dua akun uji
SELECT "userId","roleKey","scopeType","scopeId"
FROM module_role_assignment WHERE "userId" IN (39,44) AND "moduleId"='customer';
```

---

## 7. Urutan rollout

| Fase | Isi | Gate |
|---|---|---|
| **P0** | Backfill §6.2 di DB, verifikasi §6.3 = 0 baris | Tidak ada perubahan kode |
| **P1** | Manifest role 4 + migration `update:branch`; `authorizeScoped` di host + wiring; `CustomerScopeGuard` + decorator + pemetaan route; `me/scope` | **Satu deploy** (grant + enforcement bersamaan) |
| **P2** | Frontend: gating tombol, permission halaman/menu branch | Deploy terpisah, aman |
| **P3** | Read scoping §5.7 | Opsional, setelah P2 stabil |
| **P4** | Bersihkan `console.log` debug di `can.ts`, `resolve-menu.ts`, `module-page-content.tsx` (temuan sampingan) | Boleh kapan saja |

Rilis modul mengikuti konvensi repo: commit di `bc-customer` → push →
bump pin SHA yang sama di `brocoders-api` dan `brocoders-react-web` →
`npm install` → build/restart.

---

## 8. Rencana pengujian

### 8.1 Unit test (bc-customer)

- `CustomerScopeGuard`:
  - target `branch-lookup` di luar scope → `ForbiddenException`
  - assignment kosong untuk user scope-managed → 403
  - user tanpa role manifest → lolos (admin path)
  - `authorizeScoped` tidak disediakan → fallback permission-only (kompatibilitas)
  - `isHeadOffice` berubah dengan hanya branch-scope → 403
- `moduleManifest`: `customer-branch-admin` punya `update:branch`;
  `customer-branch-admin.scope === 'branch'`.

### 8.2 Integration (curl, dengan token impersonasi / login langsung)

Siapkan dua token: Vera (39) dan Maria (44).

| # | Request | Vera (customer 16) | Maria (branch 43) |
|---|---|---|---|
| T1 | `PATCH /api/v1/customer/branches/39` `{ "position": ... }` / field aman | 200 | 403 |
| T2 | `PATCH /api/v1/customer/branches/43` | 403 | 200 |
| T3 | `PATCH /api/v1/customer/branches/42` | 403 | 403 |
| T4 | `PATCH /api/v1/customer/branches/44` | 403 | 403 |
| T5 | `PATCH /api/v1/customer/staff/<staff branch 43>/:id` | 200 | 200 |
| T6 | `PATCH /api/v1/customer/staff/<staff branch 40>/:id` | 200 | 403 |
| T7 | `PATCH /api/v1/customer/staff/<staff customer 17>/:id` | 403 | 403 |
| T8 | `POST /api/v1/customer/16/branches` | 200 | 403 |
| T9 | `PATCH /api/v1/customer/branches/43` `{ "isHeadOffice": true }` | 403 (branch 43 bukan HO) | 403 |
| T10 | `PATCH /api/v1/customer/branches/38` `{ "isHeadOffice": ... }` | 200 | 403 |
| T11 | Admin (role 1) `PATCH /api/v1/customer/branches/45` | — | — → 200 |
| T12 | `GET /api/v1/customer/me/scope` | `customerIds:[16]`, `branchIds:[38..41]` | `branchIds:[43]` |
| T13 | `PATCH /api/v1/customer/16` (profil customer) | 200 | 403 |
| T14 | `PATCH /api/v1/customer/17` (customer lain) | 403 | 403 |

Catatan T9: branch 43 bukan head office, jadi perubahan `isHeadOffice` memang
harus ditolak untuk semua non-customer-scope.

### 8.3 Regresi

- Banner impersonasi tetap menampilkan Cabang/Customer/Role (§ sudah rilis).
- Login normal (bukan impersonasi) menghasilkan scope yang sama karena
  resolver memakai `request.user.id` (JWT strategy memuat ulang role dari DB).
- `GET /customer/me/branch` tidak terpengaruh.

---

## 9. Kriteria penerimaan

1. Maria (44) mendapat **200** saat `PATCH /customer/branches/43` dan
   `PATCH /customer/staff/:id` untuk staff branch 43.
2. Maria mendapat **403** untuk branch 42, 44, 45 dan staff-nya.
3. Vera (39) mendapat **200** untuk branch 38, 39, 40, 41 dan staff di dalamnya;
   **403** untuk branch 42–45.
4. Admin tetap **200** di semua branch.
5. User scope-managed tanpa assignment → **403** (tidak ada akses diam-diam).
6. Tidak ada ID role yang di-hardcode di kode permission/scope; daftar role
   berasal dari manifest + DB.
7. Pin `@wasnaker/module-customer` di API dan web memakai SHA yang sama;
   `./git-status.sh` bersih di 6 repo.

---

## 10. Risiko & mitigasi

| Risiko | Mitigasi |
|---|---|
| **Privilege escalation window**: `update:branch` diberikan ke role 4 sebelum scope guard aktif | Satu deploy (P1). Jangan pisah commit grant dan guard. |
| 77 user tanpa assignment → 403 massal | Backfill P0 + query verifikasi §6.3 wajib 0 baris sebelum deploy |
| Modul tidak bisa mengimpor entity host | Semua keputusan lewat callback `authorizeScoped` / `resolveScope` di options |
| `hasPermission` per-role vs per-user | `authorizeScoped` menerima `userId` dan melakukan union sendiri; `authorize` lama tidak diubah |
| Read masih unscoped → user melihat branch yang tidak bisa diedit | Frontend gating (P2) + read scoping (P3); API tetap menolak write |
| `isHeadOffice` disalahgunakan | Aturan §5.6 (butuh customer-scope) |
| Migration modul vs seed manual | Migration idempotent untuk `update:branch`; seed tetap dijalankan untuk manifest sync |
| Impersonasi | Scope memakai `request.user.id` (user target), konsisten dengan reload role di `jwt.strategy.ts` |

---

## 11. Pertanyaan terbuka

**Q1 — Menu untuk Customer Branch Admin.** Parent menu `customer` memakai
`permission: "read:customer"`. Role 4 tidak punya permission itu, sehingga
setelah gating anak-anaknya (`read:branch`, `read:staff`) Maria tetap tidak
melihat menu. Rekomendasi: hapus `permission` dari parent dan andalkan aturan
yang sudah ada di `resolve-menu.ts` ("parent tanpa permission tampil bila
minimal satu anak lolos"). Setuju?

**Q2 — `create`/`delete` branch & staff.** Plan ini hanya melonggarkan
`update:*` sesuai permintaan. Apakah Branch Admin juga perlu `create:staff` /
`delete:staff` (sudah dimiliki role 4, akan otomatis ter-scope) dan
`create:branch` / `delete:branch` (belum dimiliki role 4, disarankan tetap tidak)?

**Q3 — Customer Admin non-head-office.** Backfill §6.2 hanya memberi
customer-scope pada Customer Admin yang staff-nya di head office. Untuk yang
lain: assign manual, atau turunkan customer-scope dari branch mana pun yang
mereka miliki? Rekomendasi: assign manual (eksplisit, audit-able).

**Q4 — Read scoping (P3).** Setuju daftar branch/staff ikut difilter, atau
cukup tombol yang disembunyikan?
