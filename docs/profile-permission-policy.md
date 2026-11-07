# Kebijakan Permission Profile Customer

Status: **keputusan role final disetujui 2026-11-07**

## Matriks akses

| Role | Menu Customer | Profile |
|---|---|---|
| Customer Admin | Tidak tampil | My Company + My Branch + My Staff |
| Customer Branch Admin | Tidak tampil | My Company + My Staff |
| Customer | Tidak tampil | My Company |

## Permission khusus Profile

| Permission | Customer Admin | Customer Branch Admin | Customer |
|---|---:|---:|---:|
| `read:my-customer-company` | Ya | Ya | Ya |
| `read:my-customer-branch` | Ya | Tidak | Tidak |
| `read:my-customer-staff` | Ya | Ya | Tidak |
| `update:my-customer-staff` | Ya | Ya | Tidak |

Permission Profile terpisah dari permission administrasi resource. `read:branch` tidak otomatis membuka tab My Branch. Permission `update:branch` beserta scope yang cocok tetap wajib untuk edit branch dari My Company.

## Implementasi frontend

- Manifest module menetapkan `menu: []`; menu Customer tidak ditampilkan kepada role mana pun.
- Tab My Company memakai `read:my-customer-company`.
- Tab My Branch memakai `read:my-customer-branch`.
- Tab My Staff memakai `read:my-customer-staff`; tombol Edit hanya ditampilkan bila scope `update:my-customer-staff` mencakup staff tersebut.
- Halaman administrasi yang sudah ada tetap memiliki permission route masing-masing. Keputusan menyembunyikan menu tidak dengan sendirinya menghapus izin route/API.
- Menu/tab visibility bukan batas keamanan. Backend tetap menolak request yang tidak memiliki permission atau scope.

## Implementasi backend

- `GET /customer/me/branch` menggunakan identitas JWT, mencari staff aktif yang terhubung, lalu branch/customer aktif. Client tidak boleh mengirim userId, customerId, atau branchId untuk menentukan record.
- Endpoint tersebut wajib `read:my-customer-company`.
- My Staff memakai endpoint Profile terpisah: `GET /customer/me/staff` dan `PATCH /customer/me/staff/:id`.
- List/count My Staff difilter di backend menggunakan `read:my-customer-staff`; update menggunakan `update:my-customer-staff`.
- Customer Admin memperoleh customer scope sehingga dapat melihat/mengubah staff pada seluruh branch dalam Company miliknya.
- Customer Branch Admin memperoleh branch scope sehingga hanya dapat melihat/mengubah staff pada branch yang ditugaskan.
- Target update di-resolve dari staff -> branch -> customer yang tersimpan di database. Client tidak dapat mengubah scope dengan mengirim ID customer/branch.
- Scope selalu diambil dari assignment role yang sama dengan permission. Permission dari satu role tidak boleh digabung dengan scope role lain.

## Negative tests

1. Ketiga role tidak melihat menu Customer.
2. Ketiga role melihat My Company; role tanpa permission Profile ditolak pada `GET /customer/me/branch`.
3. Hanya Customer Admin melihat My Branch.
4. Customer Branch Admin dan Customer tidak memperoleh tab My Branch.
5. Customer hanya tidak memperoleh tab My Staff dan ditolak oleh endpoint My Staff.
6. Customer Admin hanya melihat/mengubah staff dari customer scope miliknya.
7. Customer Branch Admin hanya melihat/mengubah staff dari branch scope miliknya.
8. Manipulasi ID staff tidak dapat mengubah staff di luar customer/branch scope.
9. Edit My Company memerlukan `update:branch` dan scope yang mencakup branch user.

## Catatan rollout

Manifest module mendefinisikan permission/role. Pastikan Authorization Core melakukan sinkronisasi manifest dan grant ke PostgreSQL sebelum menguji UI. Assignment scope existing tidak boleh diperluas otomatis. Build, unit test, API negative tests, dan PostgreSQL integration tests wajib lulus sebelum merge/deploy.
