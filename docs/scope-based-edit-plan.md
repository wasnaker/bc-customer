# Implementasi Scope Authorization untuk bc-customer

Status: **implementasi backend dan UI sudah di-commit; rollout production tetap menunggu audit/backfill assignment dan pengujian PostgreSQL**
Tanggal revisi: 2026-11-07

Dokumen ini adalah rencana implementasi khusus modul Customer. Kontrak universal ada di [scope-authorization-architecture.md](./scope-authorization-architecture.md). Keputusan di sini wajib mengikuti kontrak tersebut.

## 1. Hasil yang diwajibkan

| User / role | Akses yang diharapkan |
|---|---|
| Vera Amelia (user 39): Customer Admin + Customer Branch Admin + Customer | Edit branch dan staff di customer 16 (branch 38–41); tidak boleh mengakses customer 17 (branch 42–45). |
| Maria Magdalena Sitorus (user 44): Customer Branch Admin + Customer | Edit branch 43 dan staff pada branch 43 saja; branch 42, 44, 45 ditolak. |
| Global administrator | Akses global hanya jika Authorization Core mengenali grant administrator eksplisit; tidak berdasarkan role ID atau ketiadaan role module. |

Target ini merupakan acceptance scenario dari data demo. ID, nama, dan hubungan harus diverifikasi ulang di database sebelum backfill atau test integrasi; jangan menjadikannya konstanta produksi.

## 2. Kondisi repository yang diperiksa

Per 2026-11-07:
- Host `brocoders-api` setelah evaluator scope universal dan pin module: `dde44ba44dba0c3d49ac596129147af471d8dd09`.
- Host `brocoders-react-web` setelah pin module customer untuk UI scope-aware: `5f510742e61d3af7d0e8d7a8c5f1df1eb93422ba`.
- `bc-customer` code commit yang dipin oleh kedua host: `d01caf1ab6c3c801700672c96b22ee0bd961d2d6`.
- `bc-customer` dokumentasi terbaru pada `main`: `fd0057f795dd3bcf258ab8e2ebcb28f146d83117`.
- `bc-equipment` kontrak module options scope: `a1abe2a47c8a41a70bf1493b883da6bb7d07c820`.
- `bc-region` kontrak module options scope: `e9cbdd97bb7b4211f1bb08b6d6c4feaae4d91f36`.

Implementasi yang sudah di-commit:
- Host `ModuleAuthorizationService.hasScopedModulePermission` mengevaluasi permission dan assignment dari role yang sama: role module memakai `moduleId + moduleRoleKey`, sedangkan custom role core memakai key internal `core-role:<roleId>` dan `scopeTypes` manifest. Bypass sistem hanya dari wildcard core `*`.
- Host `resolveModuleScopes` mengembalikan scope yang benar-benar dimiliki role pemegang permission; callback memuat ulang role user dari database pada setiap request.
- Host seed service mengikat role manifest ke identitas stabil `moduleId + moduleRoleKey` dan menolak wildcard dari module.
- `CustomerScopeGuard` memvalidasi target customer/branch/staff/document dari database dan fail-closed bila callback scoped tidak tersedia.
- Endpoint list customer/branch/staff menerapkan scope pada query database sebelum pagination dan count; detail dan mutasi resource menggunakan target scope tersimpan.
- Endpoint self-service `GET /customer/me/scope` menyediakan konteks untuk UX; bukan otoritas keamanan.
- Frontend branch/staff page menyembunyikan filter dan aksi yang tidak didukung scope; backend tetap menjadi enforcement utama.
- `bc-region` dan `bc-equipment` telah menerima kontrak callback scope universal pada module options agar host dapat menyediakan bentuk opsi yang sama.

Belum dilakukan:
- Audit live dan dry-run backfill pada database PostgreSQL.
- Eksekusi test suite/build di lingkungan repository; commit telah dibuat melalui GitHub, tetapi belum ada hasil CI/build yang dapat diverifikasi dari sesi ini.
- Verifikasi data demo Vera/Maria pada database aktif.
- Kebijakan create customer: `POST /customer` masih menggunakan permission `create:customer` tanpa scope target karena resource belum ada saat create. Sebelum production, putuskan secara eksplisit apakah hanya global administrator yang boleh membuat customer atau apakah ada proses assignment customer-scope khusus.

Snapshot assignment lama (44 user memiliki assignment dan 77 user belum memiliki assignment) tidak dianggap fakta terkini. Query audit dan dry-run backfill wajib dijalankan ulang pada database target. Jangan anggap implementasi siap production sebelum gate pada §10 lulus.

## 3. Keputusan desain yang tidak boleh dilanggar

1. **Global admin:** hanya bypass bila Authorization Core mengenali grant administrator eksplisit (wildcard/system-admin capability yang dikelola core). Role yang tidak ada di manifest bukan admin.
2. **Permission + scope satu role:** satu role harus sekaligus memiliki permission dan assignment scope yang cocok. Tidak boleh permission dari Role A dipasangkan dengan assignment Role B.
3. **Fail-closed:** resolver atau callback scope tidak tersedia, target tidak ditemukan, assignment kosong/tidak cocok, atau manifest tidak valid → deny.
4. **Read scoping wajib:** seluruh list, count, detail, dan relasi turunan difilter di API sebelum pagination/count. Frontend hanya UX.
5. **Scope universal:** host menyediakan evaluator generik; Customer menyediakan resolver branch/customer. Host tidak meng-hardcode tabel Customer.
6. **Backend adalah otoritas:** tidak ada endpoint scoped yang dapat kembali ke permission-only fallback.
7. **PostgreSQL:** assignment, migration, constraints, audit, dan query tetap menggunakan PostgreSQL.

## 4. Matriks permission dan scope

Manifest Customer saat ini mendeklarasikan role:
- `customer-admin` — customer scope;
- `customer-branch-admin` — branch scope;
- `customer` — branch scope.

Perubahan manifest yang direncanakan:
- Tambahkan `update:branch` ke `customer-branch-admin` sesuai acceptance scenario.
- Jangan menambahkan permission lain di luar kebutuhan yang disetujui.
- Permission role tetap dikelola melalui module manifest dan Authorization Core; jangan hardcode role ID.

Evaluasi contoh:
- Vera: role `customer-admin` dengan assignment `customer:16` dapat mengakses scope path branch 38/39/40/41 yang memiliki ancestor customer 16. Assignment branch 38 milik role lain tidak memperluas customer scope.
- Maria: role `customer-branch-admin` dengan assignment `branch:43` dapat mengakses branch 43; role `customer` juga hanya berlaku sesuai assignment roleKey-nya.
- Jika role memiliki permission tetapi assignment untuk roleKey itu tidak ada, role tersebut tidak memberi akses.

## 5. Resolusi target

Tambahkan kontrak module-side yang tidak mengimpor entity host. Bentuk konseptual:

```ts
interface CustomerAuthorizationTarget {
  scopes: Array<{ type: 'customer' | 'branch'; id: string }>;
}
```

Resolver target:
- customer route: load customer dari database Customer; hasil `customer:id`;
- branch route: load branch dari database; hasil `branch:id` + `customer:branch.customerId`;
- staff route: load staff lalu branch; hasil `branch:id` + `customer:branch.customerId`;
- customer document: load dokumen dan resolve owner aktual (customer/branch/staff), lalu turunkan scope owner;
- list query: berikan scope filter yang telah diverifikasi ke repository; jangan menerima daftar scope dari client.

ID request tidak boleh dianggap scope sebelum record dan parent-nya ditemukan. Scope dari body tidak pernah menggantikan scope tersimpan.

## 6. Inventaris endpoint dan enforcement

Semua endpoint di bawah wajib dievaluasi. Endpoint self-service hanya dikecualikan dari permission module bila target seluruhnya diturunkan dari authenticated user di server.

| Endpoint | Resource | Scope source | Enforcement |
|---|---|---|---|
| `GET /customer`, `GET /customer/:id` | customer | customer record | filter list/count; detail 404/403 di luar scope |
| `POST /customer` | customer baru | target belum ada | hanya global administrator core (`*`); Customer Admin customer-scoped ditolak |
| `PATCH/DELETE /customer/:id` | customer | customer record | customer scope |
| `GET /customer/branches` | branch | branch + customer | scoped list/count sebelum pagination |
| `GET /customer/:customerId/branches` | branch | customer param + record | customer scope |
| `POST /customer/:customerId/branches` | branch | parent customer | create dalam customer scope |
| `GET /customer/branches/:id` | branch | branch record | branch/customer scope |
| `PATCH/DELETE /customer/branches/:id` | branch | branch record | scope target tersimpan |
| `GET /customer/staff` | staff | staff → branch → customer | scoped list/count sebelum pagination |
| `GET /customer/branches/:branchId/staff` | staff | branch parent | branch/customer scope |
| `POST /customer/branches/:branchId/staff` | staff | branch parent | create dalam branch scope |
| `GET /customer/staff/:id` | staff | staff → branch → customer | scope target tersimpan |
| `PATCH/DELETE /customer/staff/:id` | staff | staff → branch → customer | scope target tersimpan |
| `GET/POST /customer/documents` | document | document owner | resolve ownerType/ownerId dan enforce owner scope |
| `PATCH/DELETE /customer/documents/:id` | document | stored document owner | resolve dari dokumen tersimpan, bukan request body |
| `GET /customer/me/branch` | self-service | authenticated user → staff → branch | self-only; tidak menerima userId/branchId dari client |
| `GET /customer/me/scope` | self-service | authenticated user assignments | mengembalikan scope untuk UX; bukan bukti otorisasi API |

Bila endpoint create customer tetap global untuk Customer Admin, kebijakan itu harus dinyatakan eksplisit dalam manifest/policy dan diuji. Jangan membuat pengecualian implisit karena route tidak memiliki target scope.

## 7. Kebijakan khusus Branch

- `isHeadOffice` hanya boleh diubah oleh role yang memiliki customer scope atas customer pemilik branch.
- Saat field `isHeadOffice` berubah, resolver harus menggunakan customer pemilik branch dari database.
- Constraint unik parsial satu head office per customer yang sudah ada harus dipertahankan.
- Perubahan harus atomik/transaksional; kegagalan constraint ditangani sebagai konflik validasi.
- Branch admin tidak dapat menjadikan branch sendiri sebagai head office.
- Jika perubahan owner/customer atau pemindahan branch ditambahkan kelak, wajib memeriksa scope asal dan tujuan.

## 8. Backfill dan kualitas data

SQL audit dan backfill yang dapat direview:
- [scope-assignment-audit.sql](./sql/scope-assignment-audit.sql) — read-only preflight.
- [scope-assignment-backfill.sql](./sql/scope-assignment-backfill.sql) — idempotent, memvalidasi prasyarat dan default berakhir dengan `ROLLBACK`; ubah ke `COMMIT` hanya setelah hasil dry-run dan output review disetujui.

Jangan jalankan backfill langsung dari dokumen. Buat query dry-run yang menampilkan:
- user dan seluruh role;
- staff record yang terhubung;
- branch dan customer pemilik;
- assignment existing per `moduleId + roleKey + scopeType + scopeId`;
- assignment duplikat/invalid, user tanpa staff, banyak staff, branch/customer tidak aktif;
- role module tanpa assignment dan assignment tanpa role aktif.

Aturan backfill:
- `Customer` → branch assignment dari staff → branch yang terverifikasi.
- `Customer Branch Admin` → branch assignment dari staff → branch yang terverifikasi.
- `Customer Admin` → customer assignment hanya dari relasi bisnis yang eksplisit dan tervalidasi (mis. staff berada di head office yang unik dan valid), atau manual assignment yang disetujui. Jangan mengubah branch assignment menjadi customer scope secara otomatis hanya karena user memiliki branch.
- Jangan menghapus atau memperluas assignment existing secara otomatis.
- Idempotent dengan unique key yang ada.
- Eksekusi dalam transaksi, sediakan laporan sebelum/sesudah, dan simpan audit actor/source.
- Enforcement tidak boleh diaktifkan sampai semua user terdampak terpetakan atau secara eksplisit ditolak/dinonaktifkan sesuai keputusan operasional.

## 9. Frontend

- Manifest halaman dan menu menggunakan permission read yang benar.
- Parent menu tidak boleh menutup akses anak yang sah. Aturan parent/child harus mengikuti resolver menu host yang benar-benar terpasang dan diuji.
- `GET /customer/me/scope` hanya untuk menyelaraskan menu/tombol/row actions.
- Tombol edit/delete disembunyikan bila permission/scope UI tidak cocok, tetapi API tetap melakukan seluruh validasi.
- Jangan percaya scope yang dikirim browser; jangan cache scope sebagai otoritas.

## 10. Rollout bertahap dan commit boundaries

Setiap tahap harus berupa commit kecil yang dapat direview dan diuji. Jangan mengaktifkan enforcement sebelum semua prasyarat tahap sebelumnya lulus.

| Tahap | Repository | Perubahan | Gate sebelum lanjut |
|---|---|---|---|
| 0 | bc-customer | Dokumen arsitektur, implementasi, dan test plan diperbarui | Review desain |
| 1 | brocoders-api | Core evaluator permission+scope universal, admin bypass eksplisit, matching roleKey, unit tests | Test core lulus; legacy API tetap kompatibel |
| 2 | bc-customer | Resolver target customer/branch/staff/document dan callback contract; tanpa enforcement aktif | Unit tests resolver lulus |
| 3 | bc-customer + brocoders-api | Assignment audit/dry-run/backfill dan migration permission branch-admin | Hasil dry-run disetujui; no unresolved users |
| 4 | bc-customer | Enforcement update/create/delete di backend, fail-closed | Negative API tests lulus |
| 5 | bc-customer | Read filtering untuk list/count/detail dan dokumen | Pagination/count/detail konsisten |
| 6 | brocoders-react-web + bc-customer | Scope endpoint, route/menu permission, UI gating | UI tidak menyajikan aksi yang tidak diizinkan |
| 7 | semua repo terkait | Integration regression dan dokumentasi operasi | Test matrix penuh lulus; baru aktifkan enforcement production |

Tidak ada fallback permission-only pada route yang sudah ditandai scoped. Bila suatu tahap tidak bisa diselesaikan aman, hentikan di commit terakhir yang tetap kompatibel dan jangan aktifkan enforcement setengah jadi.

## 11. Acceptance criteria

- Vera dapat mengelola data di customer 16 saja.
- Maria dapat mengelola branch 43 dan staff branch 43 saja.
- User dengan permission tanpa assignment yang cocok ditolak.
- Permission Role A tidak dapat digabung dengan assignment Role B.
- Non-module role yang bukan global admin tidak memperoleh bypass.
- Global admin dikenali melalui core grant eksplisit, tanpa role ID hardcode.
- List, count, detail, export, dan dokumen tidak membocorkan record di luar scope.
- Manipulasi URL/body/query ID tidak melewati scope.
- Assignment revoke berlaku pada request berikutnya, meskipun sesi masih aktif.
- Semua keputusan deny/allow penting dan perubahan assignment dapat diaudit.
- Seluruh test berjalan pada PostgreSQL; tidak mengganti persistence dengan database lain.

## 12. Keputusan operasional yang harus diverifikasi sebelum rollout

1. Apakah wildcard global yang saat ini digunakan frontend (`*.*` atau format aktualnya) sudah menjadi permission core yang terlindungi? Jika tidak, buat system-admin capability di core.
2. Apakah endpoint create customer memang harus dapat digunakan Customer Admin, dan apakah targetnya global atau customer scoped?
3. Bagaimana mengelola Customer Admin yang tidak berada di head office: manual assignment customer scope dengan approval/audit adalah default aman.
4. Apakah dokumen polymorphic memiliki ownerType/ownerId yang konsisten dan foreign key/validasi owner? Bila tidak, perbaiki sebelum scope enforcement dokumen.
