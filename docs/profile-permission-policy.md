# Kebijakan Permission Profile Customer

Status: **kontrak implementasi untuk Profile My Company dan My Branch**

## Tujuan

Informasi perusahaan milik akun yang sedang login ditampilkan melalui Profile. Role standar `Customer` tidak boleh memperoleh akses ke menu atau halaman administrasi Customer, dan tidak boleh membaca data customer lain.

## Permission Profile (terpisah dari permission resource)

| Permission | Fungsi |
|---|---|
| `read:my-customer-company` | Membaca branch/perusahaan yang terhubung ke user login |
| `read:my-customer-branch` | Membaca seluruh branch milik customer user login melalui tab My Branch |

Permission Profile hanya membuka kapabilitas Profile. Operasi edit tetap membutuhkan `update:branch` beserta scope yang sesuai. Permission resource seperti `read:branch` tidak otomatis membuka tab Profile.

## Matriks role

| Permission | Customer Admin | Customer Branch Admin | Customer |
|---|---:|---:|---:|
| `read:my-customer-company` | Ya | Ya | Ya |
| `read:my-customer-branch` | Ya | Tidak | Tidak |
| `read:customer` | Ya | Tidak | Tidak |
| `read:branch` | Ya | Ya | Tidak |
| `read:staff` | Ya | Ya | Tidak |
| `update:branch` | Ya | Ya | Tidak |
| `update:staff` | Ya | Ya | Tidak |

Role Customer tetap memiliki scope branch dan hanya dapat melihat company/branch miliknya melalui endpoint self-service. Customer Branch Admin masih dapat menggunakan menu administrasi Branch/Staff dalam branch scope-nya, tetapi tidak memperoleh tab My Branch. Customer Admin memperoleh tab My Branch dalam customer scope.

## Endpoint dan enforcement

- `GET /customer/me/branch`: identitas user diambil dari JWT; server mencari staff aktif, branch aktif, dan customer aktif. Tidak menerima userId/customerId/branchId dari client. Wajib `read:my-customer-company` dan scope target harus mencakup branch sendiri.
- `GET /customer/me/branches`: identitas dan customer scope diturunkan dari user login; tidak menerima customerId dari client. Wajib `read:my-customer-branch`; hasil hanya branch dari customer scope yang terverifikasi.
- `PATCH /customer/branches/:id`: tetap membutuhkan `update:branch` dan scope resource target. Tombol Edit di My Company hanya ditampilkan bila scope update mencakup branch sendiri.
- `GET /customer`, `GET /customer/branches`, `GET /customer/staff` serta detail/mutasi tetap menggunakan permission resource dan scoped authorization. Tidak ada fallback berdasarkan role name atau ID.
- `GET /customer/me/scope` hanya menyediakan affordance UI; bukan otoritas akses. Backend mengevaluasi ulang permission dan scope pada setiap request.

## Frontend

- Manifest Profile tab menggunakan permission khusus Profile.
- Halaman/menu administrasi tetap menggunakan permission resource.
- Root menu Customer menggunakan `read:branch`; role Customer tidak memilikinya sehingga menu tidak tampil.
- Menyembunyikan menu/tab bukan kontrol keamanan. Direct URL dan request API harus tetap ditolak backend.

## Negative tests wajib

1. Role Customer tidak dapat membuka menu/halaman Customer, Branch, Staff, maupun API list/detail/mutasi resource.
2. Role Customer tetap dapat membaca `/customer/me/branch` miliknya, tetapi tidak dapat mengubah branch.
3. Customer Branch Admin dapat membaca/edit branch sendiri dan staff sesuai scope, tetapi tidak dapat membuka tab/endpoint My Branch.
4. Customer Admin dapat membaca My Branch hanya untuk customer yang ditugaskan.
5. Mengubah ID/query/body tidak dapat mengakses customer atau branch lain.
6. User tanpa assignment scope atau dengan assignment role lain ditolak (fail-closed).

## Rollout

Permission baru didaftarkan melalui manifest module dan disinkronkan oleh Authorization Core. Seeder tidak boleh mengubah assignment scope secara otomatis. Setelah deploy, jalankan module registration/seed sesuai lifecycle host, lalu verifikasi role-permission dan assignment pada PostgreSQL. Jangan menyatakan rollout production selesai sebelum negative API tests dan PostgreSQL integration tests lulus.
