# Kebijakan Permission Profile Customer

Status: **keputusan role final disetujui 2026-11-07**

## Matriks akses

| Role | Menu Customer | Profile |
|---|---|---|
| Customer Admin | Tidak tampil | My Company + My Branch |
| Customer Branch Admin | Tidak tampil | My Company |
| Customer | Tidak tampil | My Company |

## Permission khusus Profile

| Permission | Customer Admin | Customer Branch Admin | Customer |
|---|---:|---:|---:|
| `read:my-customer-company` | Ya | Ya | Ya |
| `read:my-customer-branch` | Ya | Tidak | Tidak |

Permission Profile terpisah dari permission resource. `read:branch` tidak otomatis membuka tab My Branch. Permission `update:branch` beserta scope yang cocok tetap wajib untuk edit branch dari My Company.

## Implementasi frontend

- Manifest module menetapkan `menu: []`; menu Customer tidak ditampilkan kepada role mana pun.
- Tab My Company memakai `read:my-customer-company`.
- Tab My Branch memakai `read:my-customer-branch`.
- Halaman administrasi yang sudah ada tetap memiliki permission route masing-masing. Keputusan menyembunyikan menu tidak dengan sendirinya menghapus izin route/API; itu perubahan kebijakan terpisah.
- Menu/tab visibility bukan batas keamanan. Backend harus tetap menolak request yang tidak memiliki permission atau scope.

## Implementasi backend

- `GET /customer/me/branch` menggunakan identitas JWT, mencari staff aktif yang terhubung, lalu branch/customer aktif. Client tidak boleh mengirim userId, customerId, atau branchId untuk menentukan record.
- Endpoint tersebut wajib `read:my-customer-company`; guard memeriksa permission terhadap role-role user yang terautentikasi.
- Edit branch tetap menggunakan endpoint resource yang ada dengan `update:branch` dan customer/branch scope.
- My Branch hanya ditampilkan kepada Customer Admin. UI saat ini mengambil branch melalui endpoint branch list yang difilter scope di backend; query customerId dari UI bukan sumber otorisasi.
- Scope selalu diambil dari assignment role yang sama dengan permission. Tidak boleh menggabungkan permission satu role dengan scope role lain.

## Negative tests

1. Ketiga role tidak melihat menu Customer.
2. Ketiga role melihat My Company; role tanpa permission Profile ditolak pada `GET /customer/me/branch`.
3. Hanya Customer Admin melihat My Branch.
4. Customer Branch Admin dan Customer tidak memperoleh tab My Branch.
5. Customer Admin hanya melihat branch dari customer scope yang diberikan.
6. Manipulasi ID/query/body tidak dapat mengakses customer/branch lain.
7. Edit My Company memerlukan `update:branch` dan scope yang mencakup branch user.

## Catatan rollout

Manifest module mendefinisikan permission/role. Pastikan Authorization Core melakukan sinkronisasi manifest dan grant ke PostgreSQL sebelum menguji UI. Assignment scope existing tidak boleh diperluas otomatis. Build, unit test, API negative tests, dan PostgreSQL integration tests wajib lulus sebelum merge/deploy.
