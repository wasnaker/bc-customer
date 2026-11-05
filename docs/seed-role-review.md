# Review Temuan Seed & Role `bc-customer`

Dokumen ini merangkum status basis data dan usulan perubahan untuk role user demo pada modul `bc-customer`.

## Status Saat Ini (Snapshot 2026-11-05)

1.  **Tabel `role`**: Hanya ada 2 role sistem core: `1 (Admin)` dan `2 (User)`.
2.  **User Demo**: Terdapat 44 user demo (id 3–46) yang dibuat oleh seeder `bc-customer`. Saat ini **seluruhnya memiliki `roleId = 1` (Admin)**.
3.  **Struktur Staff**:
    *   Total staff: 46 orang.
    *   Semua staff terhubung ke `user` lewat `userId`.
    *   Staff tersebar di 11 Kantor Pusat (Head Office) dan 33 Cabang.
4.  **Manifest Modul**: Commit terbaru (`cf5304d`) sudah mendeklarasikan 3 role baru di level kode (namun belum ada di DB):
    *   `customer-admin`: Akses penuh level customer (HO).
    *   `branch-admin`: Akses terbatas level cabang (Staff CRUD).
    *   `customer`: Akses baca saja di level cabang.

## Analisis Peran (Staff vs Kantor)

Berdasarkan data `branch` dan `staff` saat ini:

| Tipe Lokasi | Jumlah Lokasi | Jumlah Staff Terkait | User ID |
| :--- | :--- | :--- | :--- |
| **Kantor Pusat (HO)** | 11 | 13 staff | 3, 7, 11, 15, 19, 23, 27, 31, 35, 39, 43 |
| **Cabang (Branch)** | 33 | 33 staff | Sisanya (4-46, kecuali di atas) |

*Catatan: Kantor Pusat PT Niaga Sentosa Raya (id 34) memiliki staff Mega Utami (id 35).*

## Rencana Perubahan Seeder

Sesuai permintaan, user demo akan dikelompokkan sebagai berikut:

### 1. Penambahan Role ke DB
Perlu mekanisme untuk memasukkan 3 role baru ke tabel `role`. Usulan ID:
*   `3`: **Customer Admin**
*   `4`: **Branch Admin**
*   `5`: **Customer**

### 2. Update Role pada User Demo
User accounts (id 3-46) di `customer-demo-data.sql.ts` akan diupdate `roleId`-nya:

| Jabatan Staff | Lokasi | Role yang Diberikan | Role ID (Usulan) |
| :--- | :--- | :--- | :--- |
| **Staff di Kantor Pusat** | Head Office | Customer Admin + Branch Admin + Customer | `3` |
| **Staff di Cabang** | Branch | Branch Admin + Customer | `4` |

*Catatan: Sistem saat ini hanya mendukung 1 `roleId` per user. Role ID `3` (Customer Admin) secara hierarki (berdasarkan permission di manifest) sudah mencakup semua permission `branch-admin` dan `customer`.*

## Pertimbangan Teknis

1.  **Idempotensi**: Seeder menggunakan `ON CONFLICT (id) DO UPDATE`, jadi perubahan `roleId` akan langsung diaplikasikan saat seeder dijalankan ulang.
2.  **Mapping Permission**: Setelah role baru dibuat di DB, tabel `roles_permissions_role` harus diisi sesuai dengan daftar permission di `customer.manifest.ts`.
3.  **Host Registry**: Host perlu diupdate untuk mendukung field `roles` pada manifest agar sinkronisasi role & permission bisa otomatis di masa depan. Saat ini harus dilakukan manual via SQL atau service khusus di module.

---
*Silakan review temuan ini sebelum saya melanjutkan ke implementasi update seeder.*
