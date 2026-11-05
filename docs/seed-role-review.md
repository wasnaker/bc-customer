# Review Seeder dan Role `bc-customer`

Role modul Customer **bukan** role inti dan tidak boleh ditambahkan ke tabel `role`.

## Model role

Tabel `role` tetap menyimpan role inti host, yaitu `admin` dan `user`. Modul Customer mendeklarasikan tepat tiga role melalui manifest:

| Key | Scope assignment | Fungsi |
|---|---|---|
| `customer-admin` | `customer` | Mengelola customer/perusahaan, cabang, dan staff pada lingkup customer serta menunjuk Branch Admin. |
| `branch-admin` | `branch` | Mengelola staff pada branch yang menjadi scope-nya. |
| `customer` | `branch` | Role staff biasa dengan permission sesuai manifest pada branch tersebut. |

Assignment disimpan di tabel host `module_role_assignment` menggunakan `moduleId = 'customer'`, `roleKey`, `scopeType`, dan `scopeId`. Role modul tidak mengubah `user.roleId`.

## Penugasan pada data demo saat ini

Data demo saat ini memiliki tepat satu staff pada setiap branch. Karena staff tersebut sekaligus menjadi pengelola awal, penugasannya adalah:

1. **Staff pada branch:** `customer` pada scope branch dan `branch-admin` pada scope branch yang sama.
2. **Staff pada kantor pusat (HO):** `customer` dan `branch-admin` pada scope branch HO, serta `customer-admin` pada scope customer pemilik HO.

Penugasan admin tersebut hanya berlaku untuk staff yang sudah ada di dataset demo saat ini. Ini bukan kombinasi role default untuk semua staff selanjutnya.

## Staff yang dibuat setelah ini

- Staff baru secara default hanya memperoleh role modul `customer` pada branch tempat ia terdaftar.
- Role `branch-admin` hanya diberikan jika staff tersebut ditunjuk sebagai pengelola branch.
- Role `customer-admin` hanya diberikan jika staff tersebut ditunjuk sebagai pengelola customer/perusahaan.
- Penunjukan admin harus dilakukan secara eksplisit melalui mekanisme pengelolaan assignment, bukan ditebak dari nama akun atau teks jabatan.
- Maksimal satu Branch Admin per branch dan satu Customer Admin per customer, kecuali aturan bisnis tersebut kelak diubah secara eksplisit.

## Seeder demo

- Seeder mempertahankan nilai role inti (`user.roleId`) sesuai data sumber; role assignment modul tidak menggantinya.
- Data customer, branch, staff, dan hubungan `staff.userId` dipertahankan.
- Seeder membuat assignment tiga role di atas untuk staff demo berdasarkan `branch.isHeadOffice`.
- Assignment dibuat idempotent menggunakan unique conflict target sehingga proses seed ulang tidak menggandakan assignment.
- Akun host ID 1–2 tidak disentuh oleh dataset demo.

## Batas implementasi

Otorisasi wajib dilakukan di backend. Untuk resource branch, Customer Admin harus diotorisasi berdasarkan customer pemilik branch; Branch Admin dan Customer hanya boleh mengakses branch yang menjadi scope assignment-nya. Query data juga wajib dibatasi berdasarkan scope, bukan sekadar menyembunyikan menu di frontend.
