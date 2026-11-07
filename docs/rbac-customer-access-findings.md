# Temuan Akses dan RBAC Modul Customer

Dokumen ini mencatat temuan terkait kontrol akses (RBAC) dan otorisasi scoped pada modul `bc-customer`.

## Ringkasan Temuan

1. **Penyebab Utama Menu/Halaman Customer Dapat Diakses Role Customer (id=5):**
   - Role `Customer` (id=5) memiliki permission `read:customer` yang terdaftar di tabel junction `roles_permissions_role`.
   - Manifest modul `bc-customer` mendefinisikan permission pada parent/child menu:
     - Parent menu (`/admin/customer/branch`) membutuhkan permission `read:branch`.
     - Submenu (`/admin/customer` / `customers`) membutuhkan permission `read:customer`.
     - Halaman admin (`/admin/customer`) diamankan dengan `withPageRequiredAuth(Customer, { permission: "read:customer" })`.
   - Karena role `Customer` diberikan permission `read:customer` dan `read:branch`, fungsi pengecekan `can("read:customer", user)` mengembalikan `true`, sehingga menu dan halaman tersebut lolos validasi akses.

2. **Isu Akses Admin Global (Role Admin id=1):**
   - Pada arsitektur scoped authorization modul baru (`ModuleAuthorizationService`), role admin non-modul memerlukan permission core wildcard `*` (`moduleId = NULL`) agar diizinkan melakukan bypass global pada pemeriksaan scope list.
   - Sebelumnya, database tidak memiliki permission `*` sehingga query list mengembalikan `[]` (`No customers yet.`) meskipun data di database tersedia.
   - Masalah ini telah diperbaiki dengan menyertakan permission wildcard `*` ke dalam `DEFAULT_PERMISSIONS` pada seeder core (`permission-seed.service.ts`) dan otomatis di-link ke role `Admin` (id=1).
