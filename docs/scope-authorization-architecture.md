# Arsitektur Otorisasi Berbasis Permission dan Scope

Status: **rancangan normatif — implementasi bertahap**
Tanggal: 2026-11-07

Dokumen ini menetapkan kontrak bersama antara Brocoders Authorization Core (host) dan module API. Setiap modul tetap memiliki domain data dan resolver scope sendiri; host menjadi satu-satunya otoritas untuk mengevaluasi role, permission, assignment, dan keputusan akses.

## 1. Tujuan dan batas tanggung jawab

- Better Auth/JWT mengautentikasi identitas dan sesi.
- Brocoders Authorization Core mengelola role global, permission, role-permission, module role registration, dan module role assignment di PostgreSQL.
- Module mendeklarasikan permission, role, dan jenis scope yang didukung melalui manifest.
- Module API mengidentifikasi resource target dan menerjemahkannya menjadi scope path yang tervalidasi dari database modul.
- Frontend hanya menyelaraskan navigasi dan affordance UI. Frontend bukan enforcement keamanan.

Module tidak boleh mengakses tabel authorization host secara langsung atau membuat salinan role/permission lokal. Module tidak boleh membuat role global baru di luar registrasi manifest yang disetujui core.

## 2. Model keputusan akses

Setiap keputusan selain endpoint self-service harus memenuhi semua kondisi berikut:

1. Identitas user dan sesi valid.
2. Permission dimiliki oleh role yang relevan.
3. Untuk role module-managed, assignment scope milik **role yang sama** harus mencakup target.
4. Target resource dan seluruh hubungan induknya berhasil di-resolve dan divalidasi.
5. Jika salah satu informasi tidak tersedia, keputusan adalah deny (fail-closed).

Tidak boleh menggabungkan permission dari Role A dengan assignment scope milik Role B. Multi-role berarti setiap role dievaluasi sebagai satu pasangan permission + assignment; akses diberikan jika setidaknya satu pasangan lengkap lolos.

### 2.1 Global administrator

Global administrator dikenali oleh Authorization Core melalui permission wildcard yang eksplisit dan dikelola core (mis. `*.*` atau konstanta permission global yang disepakati core), bukan melalui:
- angka role yang di-hardcode;
- nama role yang tidak dikenal module;
- ketiadaan module role;
- assignment scope yang kosong.

Core memvalidasi wildcard tersebut hanya dapat diberikan melalui administrasi global yang berwenang. Module tidak dapat mendeklarasikan wildcard untuk role miliknya. Jika kontrak wildcard yang ada belum memenuhi aturan ini, core harus menambahkan capability/flag system-admin yang eksplisit sebelum enforcement scope diaktifkan.

### 2.2 Module role dan assignment

Identitas role module adalah pasangan `(moduleId, roleKey)`, bukan nama tampilan. Nama role tetap unik secara global sesuai kebijakan role registry. Setiap assignment mengacu ke pasangan module-role yang tepat.

Assignment minimal memuat:
- `userId`, `moduleId`, `roleKey`;
- `scopeType`, `scopeId`;
- `assignedBy`, `createdAt`, `updatedAt`.

Role yang tidak memiliki assignment yang valid tidak memperoleh akses scoped. Role non-module tidak otomatis memperoleh akses global. Hanya global administrator yang dikenali core yang bypass scope.

## 3. Kontrak scope universal

Scope adalah identitas lingkup domain, bukan daftar kolom tetap yang ditanamkan ke host. Nilai `scopeType` berupa identifier stabil yang dideklarasikan/didukung module, misalnya `global`, `customer`, `branch`, `group`, `subgroup`, atau `resource`.

Module menyediakan resolver target yang menghasilkan daftar ancestor scope tervalidasi, misalnya:

```ts
interface AuthorizationScope {
  type: string;
  id: string;
}

interface AuthorizationTarget {
  scopes: readonly AuthorizationScope[];
}
```

Contoh target branch customer:
```ts
{
  scopes: [
    { type: 'branch', id: '43' },
    { type: 'customer', id: '17' }
  ]
}
```

Assignment `branch:43` cocok dengan branch itu; assignment `customer:17` cocok dengan semua target yang berada di customer 17. Assignment `global` hanya berlaku bila role/manifest memang mengizinkan global scope dan core memvalidasi assignment tersebut.

Core tidak menebak relasi customer/branch atau hierarchy module lain. Resolver module wajib memeriksa bahwa target benar-benar ada dan hubungan parent-child valid di PostgreSQL sebelum menyerahkan scope path ke core.

## 4. Algoritme evaluasi

Untuk setiap role user:

1. Core memuat role beserta permission dan metadata pemilik module.
2. Jika role adalah global administrator yang diakui core, izinkan sesuai kebijakan global.
3. Jika role module-managed:
   - pastikan permission dimiliki role itu;
   - pastikan roleKey cocok dengan manifest/registrasi;
   - cari assignment untuk user + moduleId + roleKey;
   - pastikan scope assignment ada di target scope path, atau global assignment yang sah.
4. Lanjutkan role berikutnya bila pasangan tersebut tidak lengkap.
5. Deny jika tidak ada satu pun role yang memenuhi semua kondisi.

Pengecekan permission dan scope harus dilakukan dalam satu service/API authorization core agar tidak ada celah antar guard atau perbedaan aturan.

## 5. Enforcement backend

- Semua endpoint read, create, update, delete, export, download, dan bulk harus memiliki kebijakan akses yang eksplisit.
- Read scoping wajib dilakukan di backend pada query/repository sebelum pagination dan count. Menyembunyikan baris di frontend tidak cukup.
- Detail endpoint harus menolak resource di luar scope, termasuk ID yang dimanipulasi.
- Create harus memeriksa parent scope dari route/body yang sudah divalidasi.
- Update/delete harus resolve scope dari data yang tersimpan, bukan mempercayai ID atau scope dari request body.
- Jika perubahan mengubah parent/owner, otorisasi harus memeriksa scope asal dan tujuan; bila fitur pemindahan tidak didukung, DTO harus menolak field tersebut.
- Endpoint self-service hanya boleh bypass permission module bila identitas user diambil dari sesi dan semua target diturunkan dari relasi milik user di server.

## 6. Assignment lifecycle dan audit

Perubahan assignment harus dilakukan melalui Authorization Core:
- hanya actor yang memiliki permission administrasi assignment yang boleh memberi, mengubah, atau mencabut assignment;
- validasi bahwa moduleId/roleKey/scopeType terdaftar dan scopeId benar-benar ada dilakukan oleh core melalui kontrak validator module;
- assignment tidak boleh ditinggalkan sebagai grant aktif setelah role module dicabut;
- perubahan role atau assignment harus segera memengaruhi request berikutnya; jangan mengandalkan role/scope lama dalam JWT;
- catat actor, subject, module, roleKey, scope lama/baru, waktu, dan alasan perubahan;
- revoke dan perubahan assignment harus idempotent dan aman terhadap retry.

## 7. Migrasi dan rollout

1. Audit role manifest, role registry, permission, assignment, serta seluruh route.
2. Validasi kualitas data dan buat laporan dry-run backfill. Jangan menyalakan enforcement bila ada user scoped tanpa mapping yang dapat dipertanggungjawabkan.
3. Terapkan schema/core API yang kompatibel dan tetap mempertahankan legacy permission guard sementara.
4. Backfill assignment dengan transaksi/idempotency; assignment customer-level tidak boleh disimpulkan dari branch sembarang.
5. Aktifkan scope enforcement per module setelah test dan verifikasi data.
6. Aktifkan backend read filtering sebelum UI gating.
7. Hapus fallback permission-only untuk endpoint scoped setelah semua module siap.
8. Audit log, metrik deny, dan prosedur rollback wajib tersedia.

## 8. Larangan desain

- Tidak ada bypass karena role tidak dikenal atau tidak ada di manifest.
- Tidak ada fallback ke permission-only jika callback/resolver scope hilang.
- Tidak ada pencampuran permission dari satu role dengan scope role lain.
- Tidak ada scope yang hanya diperiksa di frontend.
- Tidak ada asumsi bahwa satu user hanya memiliki satu role, satu assignment, atau satu staff record.
- Tidak ada penggunaan role ID atau nama tampilan sebagai identitas authorization yang stabil.
- Tidak ada backfill otomatis yang memperluas akses melebihi data hubungan yang dapat diverifikasi.

## 9. Kriteria selesai

- Authorization Core menjadi satu-satunya evaluator permission + scope.
- Semua module menggunakan kontrak scope universal.
- Semua endpoint terinventarisasi dan terlindungi di backend.
- List/count/detail konsisten dengan scope.
- Global admin bypass eksplisit dan diuji.
- Multi-role diuji tanpa privilege composition lintas role.
- Assignment create/update/revoke diaudit dan berlaku segera.
- Negative security tests lulus untuk ID tampering, missing assignment, revoked assignment, dan cross-tenant access.
