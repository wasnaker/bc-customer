# Audit Sistem Akses RBAC & Module Authorization

## Overview
Audit ini dilakukan untuk menginvestigasi masalah dimana user dengan role `customer` dapat melihat menu modul (region & equipment), namun mendapatkan redirect (403/401) saat mengakses halaman terkait.

## Temuan Utama

### 1. Ketidakkonsistenan Implementasi Guard (Backend)
- **`CustomerAccessGuard` (bc-customer)**: Sudah menerapkan pengecekan multi-role (union dari semua `roleIds` user).
- **`RegionAccessGuard` (bc-region) & `EquipmentAccessGuard` (bc-equipment)**: Masih menggunakan implementasi *legacy* yang hanya memeriksa `request.user?.role?.id` (singular). Guard ini akan gagal jika user memiliki role `customer` di tabel `user_roles_role` namun tidak memiliki role tersebut di field `role` singular.

### 2. Keterbatasan `ModuleAuthorizationService`
`ModuleAuthorizationService.hasPermission()` di backend core saat ini hanya mendukung pengecekan satu `roleId` tunggal terhadap permission. Sistem tidak mendukung *iterasi* semua role yang dimiliki user, sehingga user dengan multi-role seringkali gagal otorisasi meskipun salah satu role-nya memiliki permission yang diperlukan.

### 3. Masalah Seeding
- Role `Customer` tidak tersedia di seeder host (`RoleSeedService`).
- Role hanya tersedia di manifest modul, namun seeder `ModulePermissionSeedService` akan melewatkan pemberian permission jika role `Customer` tidak ditemukan di DB.

### 4. Perilaku Frontend
- `module-page-content.tsx` sudah benar dalam menerapkan filter akses.
- `withPageRequiredAuth` di `src/services/auth/with-page-required-auth.tsx` secara default membiarkan semua user terautentikasi masuk karena `!options?.roles?.length` selalu `true`.
- Redirect terjadi karena backend menolak akses (403), bukan karena frontend secara proaktif menyembunyikan halaman.

## Review Commit 01453aa
Commit `01453aa` memperbarui `UserMapper` untuk memastikan `domainEntity.roles` diisi dengan benar dari `raw.roles` atau jatuh kembali ke `raw.role` (legacy).
- **Status**: Perbaikan ini sangat krusial agar backend memiliki akses ke daftar role lengkap (multi-role) dari database.
- **Kesimpulan**: Commit ini **TIDAK menyelesaikan** masalah otorisasi karena guard backend belum menggunakan daftar role lengkap tersebut.

## Rencana Perbaikan
1.  **Backend Migration/Seed**: Menambahkan role `Customer` ke tabel `roles`.
2.  **Guard Refactoring**: Memperbarui `RegionAccessGuard` dan `EquipmentAccessGuard` untuk mendukung pengecekan multi-role (menggunakan union `roles[]`).
3.  **Core Service Update**: Memperbarui `ModuleAuthorizationService` agar mendukung pengecekan permission terhadap seluruh daftar role user.
