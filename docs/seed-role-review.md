# Review Seeder dan Role `bc-customer`

Dokumen ini mengikuti rancangan role modul Customer yang disepakati. Role modul **bukan** role inti dan tidak boleh ditambahkan ke tabel `role`.

## Model role

Tabel `role` tetap hanya menyimpan role inti host:
- `admin` — administrator platform.
- `user` — akun pengguna biasa.

Modul Customer mendeklarasikan tepat tiga role melalui manifest:

| Key | Scope assignment | Fungsi |
|---|---|---|
| `customer-admin` | `customer` | Satu pengelola pada lingkup perusahaan/customer; mengelola customer, cabang, dan staff serta menunjuk Branch Admin. |
| `branch-admin` | `branch` | Satu pengelola untuk satu cabang; mengelola staff pada cabangnya. |
| `customer` | `branch` | Akun staff biasa; akses baca sesuai permission manifest pada cabangnya. |

Assignment disimpan di tabel host `module_role_assignment` menggunakan `moduleId = 'customer'`, `roleKey`, `scopeType`, dan `scopeId`. Scope tidak digantikan dengan role ID baru.

## Aturan penugasan

1. Akun staff yang ditautkan ke suatu branch memperoleh role modul `customer` pada branch tersebut secara default.
2. Staff yang ditunjuk sebagai Customer Admin memperoleh assignment `customer-admin` pada customer terkait.
3. Staff yang ditunjuk sebagai Branch Admin memperoleh assignment `branch-admin` pada branch terkait.
4. Customer Admin dan Branch Admin **bukan** anggota role `customer` untuk branch yang sama. Penunjukan admin harus dilakukan secara eksplisit melalui mekanisme pengelolaan assignment, bukan ditebak dari nama akun atau teks jabatan.
5. Maksimal satu Customer Admin per customer dan satu Branch Admin per branch. Validasi keunikan ini harus ditegakkan pada service/API assignment, bukan hanya UI.
6. Pengguna dapat memiliki beberapa assignment bila memang ditunjuk pada scope berbeda; jangan menggabungkan assignment menjadi satu role inti.

## Seeder demo

- Akun demo milik modul (ID 3–46) menggunakan role inti `user`, bukan `admin`.
- Data customer, branch, staff, dan hubungan `staff.userId` dipertahankan.
- Setelah data demo dimasukkan, setiap user yang terhubung ke staff mendapat assignment `customer` pada branch staff tersebut, kecuali user itu sudah memiliki assignment admin yang eksplisit pada scope terkait.
- Seeder tidak menetapkan Customer Admin atau Branch Admin berdasarkan asumsi dari nama email, nama staff, atau jabatan. Penunjukan admin harus berasal dari data penugasan yang eksplisit.
- Seeder bersifat idempotent dan tidak mengubah akun host ID 1–2.

## Batas implementasi

Role assignment tidak mengubah `user.roleId` dan tidak menambah record pada tabel `role`. Otorisasi wajib dilakukan di backend. Untuk resource branch, Customer Admin harus diotorisasi berdasarkan customer pemilik branch; Branch Admin dan Customer hanya boleh mengakses branch yang menjadi scope assignment-nya. Query data juga wajib dibatasi berdasarkan scope, bukan sekadar menyembunyikan menu di frontend.

