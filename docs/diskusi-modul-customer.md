# Diskusi Arsitektur: Modul Customer & Skala 30 Modul

Status: **sudah dijawab — lihat Keputusan Final & Pertanyaan Lanjutan (H1–H13)**
Tanggal: 3 November 2026
Lokasi: `bc-customer/docs/diskusi-modul-customer.md`

---

## Cara menjawab

1. Isi bagian **Jawaban:** di bawah setiap pertanyaan (satu baris atau lebih).
2. Kalau setuju dengan rekomendasi, cukup tulis `setuju` atau `pakai rekomendasi`.
3. Kalau ada pertanyaan yang belum relevan, tulis `nanti`.
4. Ringkasan cepat ada di bagian **Tabel Keputusan Cepat** — boleh diisi di sana saja, bagian detail dipakai kalau perlu konteks.

---

## Tabel Keputusan Cepat

| ID | Pertanyaan singkat | Rekomendasi saya | Jawaban Anda |
| --- | --- | --- | --- |
| A1 | 30 repo (api+web per modul) atau 60 repo (backend & frontend terpisah)? | 30 repo, satu repo per modul berisi `api/` + `web/` | sepakat satu repo per module|
| A2 | Satu tag per modul untuk api+web, atau dua tag? | Satu tag per modul | satu tag|
| A3 | `bc-region` dibekukan sebagai golden template? | Ya, bekukan v0.3.5 sebagai template | ya golden template v1|
| B1 | Rename pakai skrip teruji atau manual `sed`? | Skrip + checklist verifikasi | buat script boleh|
| B2 | Modul baru menyalin seluruh isi region atau kerangka saja? | Kerangka + hanya komponen yang dipakai | region module sangat sedernaha cocok di salin semua hanya perlu ganti entity |
| B3 | Permission per sub-entitas atau satu permission modul? | `read/create/update/delete:customer` + `*:branch` + `*:staff` | permission per module|
| B4 | `api/dist` ikut di-commit seperti region? | Ikut, konsisten dengan region | konsisten |
| C1 | Branch & Staff satu modul dengan Customer atau modul terpisah? | Modul terpisah kalau dipakai modul lain | satu module|
| C2 | Relasi Customer–Branch–Staff bagaimana? | Branch 1–N Staff, Branch 1–N Customer, Staff opsional di Customer |Branch 1–N Staff, HO atau Customer |
| C3 | Branch/Staff akan dipakai modul lain? | Perlu dikonfirmasi | ya, setiap branch akan memiliki aktifitas masing-masing |
| C4 | Customer/Branch perlu multi-tenant (company) scoping? | Belum, kecuali sudah pasti | di indonesia ada NITKU jadi pelu field vat-type : enum(npwp,nitku)|
| D1 | `city` = kabupaten/kota? Butuh kecamatan? | Kabupaten/kota; kecamatan belum | city = relasi ke region city, prvovice juga relasi ke region|
| D2 | Alamat disimpan sebagai FK, kode+snapshot, atau teks? | Kode + snapshot, tanpa FK | saya kurang paham intinya text dan relasi city, province dari region |
| D3 | Satu alamat atau banyak alamat per customer? | Banyak (billing/shipping) via tabel `customer_address` | 1 alamat ber branch (HO) dianggap branch|
| D4 | Branch & Staff juga punya alamat? | Ya, pakai kontrak alamat yang sama | ya setiap branch punya 1 orang admin, full akses di branch tersebut|
| D5 | Dropdown wilayah untuk user non-admin? | Endpoint referensi read-only cukup JWT | ya|
| D6 | Boleh menambah `code` BPS di `regency` (region)? | Ya, kalau ingin kunci kota stabil | ini wewenang admi aplikasi user hanya bisa select / readonly|
| E1 | Modul impor `@/core`, `@/components` host langsung, atau lewat SDK? | SDK `@wasnaker/module-sdk` | saya tidak paham, seperti region saat ini saja|
| E2 | Update core ke 30 modul: manual atau codemod? | Pin versi + codemod bertahap | bertahap karena isi module beda beda sesuai kebutuhan|
| E3 | Tiap repo modul punya CI sendiri? | Ya, copy `module-package.yml` | ya |
| E4 | Manifest menyatakan dependency ke modul lain (`requires: ["region"]`)? | Ya | ya |
| E5 | Alokasi `position` menu & widget lintas 30 modul bagaimana? | Blok per modul (lihat detail) | ya sesuai urutan pengerjaan module saja|
| F1 | Semua 30 modul terpasang bersamaan di satu host? | Perlu dikonfirmasi | ya|
| F2 | Ukur baseline build sebelum 30 modul? | Ya, ukur 1 vs 3 vs 10 modul | saya tidak paham|
| F3 | Distribusi modul: git SHA, tag, atau private registry? | Private registry jangka panjang | ya melalui github nantinya private|
| F4 | Urutan migrasi lintas modul siapa yang menjamin? | Host, berbasis dependency manifest | ya, host|

---

## Fakta & Kondisi Saat Ini (konteks, tidak perlu dijawab)

### Git `bc-customer`
- Remote `github.com/wasnaker/bc-customer` baru berisi `LICENSE` + `README.md` (commit `e79e86c`).
- Seluruh kode modul masih **untracked**; `.gitignore` sudah dipasang dan `node_modules` sudah ter-ignore.
- `api/dist` belum di-ignore.
- `README.md` masih menyebut "Region module"; ada file nyasar `READM1E.md`.
sudah saya rename
- Isi modul = 100% salinan `bc-region`, termasuk nama package `@wasnaker/module-region`.
sesuaikan namanya

### Modul `bc-region` (bahan clone)
- Satu repo berisi `api/` + `web/`.
- 302 kemunculan kata `region` di 32 file (belum termasuk 76 file `api/dist`).
- Yang harus ikut rename: nama package, folder `web/src/modules/<x>`, `alias` manifest, permission `*:<x>`, namespace i18n `module-<x>`, route `/admin/<x>`, id widget dashboard, nama class, `moduleManifest.id`, nama tabel, nama migration, seed service, `files`/`exports` di `package.json`, README/INTEGRATION.
- `province.isoCode` terisi 38/38 (mis. `11` Aceh, `32` Jawa Barat).
- `regency` tidak punya kode; unik hanya `(provinceId, name)`; `id` serial per-database.
- `RegionSeedService` upsert berdasarkan `isoCode` dan menimpa `name`.
- Endpoint `GET /region/provinces` dijaga permission `read:region`.

### Host
- Frontend `brocoders-react-web`: `node_modules` 992 MB, `transpilePackages` otomatis dari semua dependency `@wasnaker/module-*`.
- Backend `brocoders-api`: `node_modules` 438 MB.
- Satu repo modul untuk dev butuh ±130 MB `node_modules` sendiri.

apakah bisa `node_modules` shared ?.

### Yang sudah disepakati
- Modul dibuat dengan **clone dari region + rename**, bukan tulis ulang dari nol.
- **Satu repo per modul** (backend + frontend di dalamnya).
- Customer akan punya entitas **Branch** dan **Staff**.
- Alamat menyimpan **city** dan **province**.

---

## A. Struktur Repo & Rilis

### A1. 30 repo atau 60 repo?
Maksud "repo terpisah backend, frontend" perlu dipastikan:
- (a) **30 repo**, tiap repo berisi `api/` + `web/` seperti `bc-region` *(rekomendasi)*
- (b) **60 repo**, backend dan frontend benar-benar repo sendiri

> **Jawaban:**
- (a) **30 repo**, tiap repo berisi `api/` + `web/` seperti `bc-region` 

### A2. Satu tag atau dua tag per modul?
Kalau satu repo: satu tag `v0.1.0` mewakili api+web sekaligus *(rekomendasi)*. Kalau 60 repo: perlu aturan versi api vs web.

> **Jawaban:**
satu tag `v0.1.0` mewakili api+web sekaligus

### A3. `bc-region` dibekukan sebagai golden template?
- (a) Ya, bekukan `v0.3.5` sebagai template; region tetap jalan tapi tidak lagi jadi bahan clone *(rekomendasi)*
- (b) Tidak, region terus berkembang dan sesekali di-clone ulang

> **Jawaban:**
(a) Ya, bekukan `v0.3.5` sebagai template; region tetap jalan tapi tidak lagi jadi bahan clone *(rekomendasi)*
---

## B. Strategi Clone & Rename

### B1. Siapa/apa yang mengeksekusi rename?
- (a) Skrip rename + checklist verifikasi (daftar token eksplisit, bukan `sed s/region/customer/g` buta) *(rekomendasi)*
- (b) Manual per file
- (c) Saya punya cara sendiri

> **Jawaban:**
(a) Skrip rename + checklist verifikasi (daftar token eksplisit, bukan `sed s/region/customer/g` buta) *(rekomendasi)*

### B2. Cakupan salinan
- (a) Salin seluruh isi region, termasuk dashboard widget dan seed 514 regency *(paling cepat, tapi membawa kode tak relevan)*
- (b) Salin kerangka + hanya komponen yang dipakai Customer *(rekomendasi)*

> **Jawaban:**
(a) Salin seluruh isi region, termasuk dashboard widget dan seed 514 regency *(paling cepat, tapi membawa kode tak relevan)*
tetapi hanya sedikit yang tidak relevan; dibangkan tulis ulang akan banyak distorsi

### B3. Granularitas permission
- (a) Satu set: `read/create/update/delete:customer`
- (b) Per sub-entitas: `*:customer`, `*:branch`, `*:staff` *(rekomendasi kalau Branch/Staff punya halaman sendiri)*

> **Jawaban:**
- (b) Per sub-entitas: `*:customer`, `*:branch`, `*:staff` *(rekomendasi kalau Branch/Staff punya halaman sendiri)*

### B4. `api/dist` di-commit?
- (a) Ya, seperti region *(rekomendasi, konsisten)*
- (b) Tidak, di-ignore dan dibangun saat install

> **Jawaban:**
- (a) Ya, seperti region *(rekomendasi, konsisten)*

---

## C. Batas Modul Customer (Branch & Staff)

### C1. Branch & Staff masuk modul `bc-customer` atau modul sendiri?
- (a) Satu modul `bc-customer` berisi Customer + Branch + Staff
- (b) Modul terpisah: `bc-customer`, `bc-branch`, `bc-staff` *(rekomendasi kalau akan dipakai modul lain)*
- (c) Customer + Staff satu modul, Branch modul sendiri

> **Jawaban:**
- (a) Satu modul `bc-customer` berisi Customer + Branch + Staff

### C2. Kardinalitas relasi
Contoh yang saya asumsikan:
- Branch 1–N Staff
- Branch 1–N Customer
- Customer punya Staff penanggung jawab (opsional)

Benar? Kalau tidak, tulis relasi yang diinginkan.

> **Jawaban:**
- Branch 1–N Staff
- Customer 1–N Branch 

### C3. Apakah Branch/Staff dipakai modul lain?
Misalnya transaksi, payroll, inventory, assignment. Kalau ya, keduanya lebih baik jadi modul sendiri supaya tidak ada import antar-modul.

> **Jawaban:**
Memang branch melakukan transaksi, tapi tidak perlu module tersendiri
customer ini module jenis actor (memiliki staff, ada 4 module actor, customer sebagai pilot project)

### C4. Multi-tenant / company scoping?
Apakah Customer/Branch dibatasi per perusahaan/tenant? `bc-region` tidak punya konsep ini; kalau perlu, itu perubahan di core (guard + query), bukan rename.

> **Jawaban:**
branch per customer tidak dibatasi

### C5. Data awal (seed)
Apakah modul Customer perlu seed (mis. branch default, staff contoh), atau mulai kosong?
> **Jawaban:**
perlu seed lengkap sampai file (nib, npwp dll)


---

## D. Alamat & Relasi ke Region

### D1. Definisi `city`
- `city` = kabupaten/kota (regency)? 
- Apakah perlu sampai kecamatan/kelurahan? (region sekarang hanya province + regency)

> **Jawaban:**
- `city` = kabupaten/kota (regency)? 
- Tidak perlu 
zipcode pakai

### D2. Cara simpan alamat
- (a) **FK** ke `province`/`regency`
- (b) **Kode + snapshot**, tanpa FK *(rekomendasi)*:
  `provinceCode` (= isoCode), `provinceName`, `cityName`, `cityType`, `postalCode`, `addressLine`
- (c) **Teks bebas** `province` + `city`

Alasan rekomendasi: modul tetap independen, `id` region tidak stabil antar-environment, dan seed region menimpa nama sehingga snapshot menjaga histori alamat.

> **Jawaban:**
seed kita termasuk id untuk autonumber; maka akan selalu sama

### D3. Satu atau banyak alamat per customer?
- (a) Satu alamat di tabel `customer`
- (b) Banyak alamat (`customer_address` dengan `type`: billing/shipping/lain) *(rekomendasi kalau perlu pengiriman)*

> **Jawaban:**
- (a) Satu alamat di tabel `customer`

### D4. Branch & Staff juga punya alamat?
Kalau ya, pakai kontrak alamat yang sama (bukan copy-paste 3 kali).

> **Jawaban:**
- Branch punya alamat
- alamat staff di module customer tidak terpkai tetapi terpakai di 1 module actor lainnya

### D5. Dropdown wilayah untuk user non-admin
`GET /region/provinces` butuh `read:region`. User yang hanya punya akses customer tidak bisa mengambil daftar wilayah.
- (a) Beri semua user `read:region`
- (b) Region menyediakan endpoint referensi read-only cukup JWT *(rekomendasi)*
- (c) Dropdown hanya untuk admin

> **Jawaban:**
- (b) Region menyediakan endpoint referensi read-only cukup JWT *(rekomendasi)*

### D6. Tambah `code` BPS di `regency`?
Kalau ingin kunci kota yang stabil (bukan nama), region perlu migrasi + update seed 514 baris.

> **Jawaban:**
ya silahkan seed termaasuk id
---

## E. Kontrak & Konsistensi 30 Modul

### E1. Modul impor langsung ke internal host atau lewat SDK?
Sekarang modul mengimpor `@/core/table/use-table`, `@/core/master-detail/*`, `@/components/small-table`, `@/services/api/*`.
- (a) Tetap langsung *(paling murah sekarang, rapuh untuk 30 modul)*
- (b) SDK `@wasnaker/module-sdk` yang mengekspor `SmallTable`, `useTable`, `useMasterDetail`, API client, UI kit *(rekomendasi)*

> **Jawaban:**
- (a) Tetap langsung *(paling murah sekarang, rapuh untuk 30 modul)*

### E2. Strategi update core ke 30 repo
- (a) Pin versi SDK, upgrade bertahap per modul *(rekomendasi)*
- (b) Codemod otomatis setiap ada breaking change
- (c) Keduanya

> **Jawaban:**
- (a) Pin versi SDK, upgrade bertahap per modul *(rekomendasi)*

### E3. CI per repo modul
`bc-region` punya `.github/workflows/module-package.yml`. Apakah semua modul menyalinnya (build api + `verify:api-package`)?

> **Jawaban:**
saya tidak paham, anggap Ya

### E4. Dependency antar modul dinyatakan di manifest?
Misalnya `bc-customer` butuh data referensi region → `requires: ["region"]`, sehingga host bisa menolak/memberi peringatan kalau region tidak terpasang.

> **Jawaban:**
perlu, tetapi kadang mengganggu saat development

### E5. Alokasi `position` menu & widget dashboard
Dengan 30 modul, `position` harus punya blok agar tidak tabrakan. Contoh: region 60, customer 100–109, branch 110–119, staff 120–129. Setuju pola blok per modul?

> **Jawaban:**
ya silakan
---

## F. Operasional & Build

### F1. Semua 30 modul terpasang bersamaan?
Atau modul dipasang per klien/implementasi?

> **Jawaban:**
ya 30 module untuk 1 aplikasi, dan bisa bertambah

### F2. Ukur baseline build
Sebelum 30 modul: ukur build Next dengan 1, 3, dan 10 modul. Kalau 30 modul membuat build tidak nyaman, solusinya modul web dikirim sebagai JS hasil build (tidak perlu `transpilePackages`).
Setuju saya ukur?

> **Jawaban:**
ya, setuju

### F3. Distribusi modul
- (a) `github:...#sha` seperti sekarang *(sederhana, install lambat karena clone + `prepare` 30×)*
- (b) Tag (`#v0.1.0`) *(lebih mudah dibaca, tetap clone)*
- (c) Private registry / GitHub Packages *(rekomendasi jangka panjang)*

> **Jawaban:**

setuju (a), perlu peningkatan ke (b) ?; setiap commit naik versi minor ? delete tag ke 10 ?

### F4. Urutan migrasi & seed lintas modul
Kalau `customer` punya FK ke tabel modul lain, siapa yang menjamin urutan migrasi? Rekomendasi: host membaca dependency dari manifest modul, bukan urutan alfabet.

> **Jawaban:**
kita nnati seperti apa

---

## G. Catatan Tambahan dari Anda

(Tulis bebas di sini: hal lain yang belum tercakup, koreksi asumsi, atau keputusan yang sudah final.)

> 
- semua id menggunakan biginteger
- semua tabel memiliki ulid
- code (misal `Customer code`, `Equipment code`, `Quotation number`, `Invoice number` mengguankan 6 digit pakai base16 ? base32 ?) diambil dari id + salt number di menu setting masing masing modul misal salt number customer = 162141 baca `Customr code` menjai (kalau pakai base32) : base32()


---

## 1. Keputusan Final (dari jawaban Anda)

### Repo & rilis
- **Satu repo per modul**, berisi `api/` + `web/`. Total 30 repo untuk 30 modul.
- **Satu tag per modul** (`v0.1.0`) mewakili api+web sekaligus.
- `bc-region` **dibekukan sebagai golden template v1** (v0.3.5); tidak lagi jadi bahan clone setelah template dipakai.
- **`api/dist` di-commit** (konsisten dengan region).
- Tiap repo modul punya **CI sendiri** (copy `module-package.yml`).

### Clone & rename
- Modul baru dibuat dengan **skrip rename + checklist verifikasi**, bukan `sed` buta.
- **Salin seluruh isi region** lalu ganti entity; kode yang tidak relevan sedikit, lebih murah daripada tulis ulang.
- **Permission per sub-entitas**: `*:customer`, `*:branch`, `*:staff`.
  ⚠️ Tabel cepat menulis "permission per module" — perlu dikonfirmasi (lihat H13).

### Batas modul Customer
- **Satu modul `bc-customer`** berisi **Customer + Branch + Staff**.
- Relasi: **Customer 1–N Branch**, **Branch 1–N Staff**; **HO dianggap branch**.
- Customer adalah **modul actor** (ada 4 modul actor; customer jadi pilot project).
- Branch melakukan transaksi, tapi **tidak** jadi modul sendiri.
- **Tanpa tenant/company scoping**.
- **Seed lengkap** termasuk dokumen (NIB, NPWP, dll).
- Kebutuhan pajak Indonesia: **NITKU**, field **`vatType` enum (`npwp`, `nitku`)** (lihat H4).

### Alamat & region
- `city` = **kabupaten/kota (regency)**; **tidak perlu kecamatan/kelurahan**; gunakan **zipcode**.
- Arah: **relasi ke region** (province & city), bukan teks bebas — dengan catatan id region harus deterministik (lihat 2.5 dan H1–H3).
- **Satu alamat** per entitas; **branch punya alamat**; alamat staff tidak dipakai di modul customer, tetapi dipakai salah satu modul actor lain.
- Region menyediakan **endpoint referensi read-only cukup JWT** (bukan `read:region`).
- `regency` **ditambah kode BPS**; seed menyertakan id.
- Region tetap **hanya admin aplikasi** yang boleh mengubah; user hanya select/read-only.

### Kontrak & operasional
- Modul **impor langsung** ke internal host (`@/core`, `@/components`, `@/services`) — tanpa SDK.
- Update core ke 30 modul: **bertahap**, tiap modul butuh kode berbeda.
- Manifest menyatakan **dependency antar modul** (`requires`), tetapi harus bisa dilonggarkan saat development.
- `position` menu/widget: **blok per modul**, mengikuti urutan pengerjaan.
- **30 modul terpasang di satu aplikasi**, dan bisa bertambah.
- **Ukur baseline build** sebelum 30 modul.
- Distribusi: **git SHA sekarang**, naik ke **tag**, lalu **private GitHub**.
- **Host** yang menjamin urutan migrasi berbasis dependency manifest.

### Aturan global data (dari bagian G)
- Semua **id bigint**.
- Semua tabel punya **ULID**.
- **Code 6 karakter** (base16/base32) dari **id + salt** per modul (contoh salt customer `162141`).

---

## 2. Jawaban atas Pertanyaan Anda

### 2.1 "Apakah `node_modules` bisa shared?" (halaman Fakta)
Bisa, dan sebenarnya **sudah** untuk sisi host:
- Semua modul di-install ke **satu** `node_modules` host (FE 992 MB, API 438 MB). 30 modul hanya menambah source (±0,4 MB/modul), bukan 30 pohon dependency.
- Syarat: React/Next/Nest/TypeORM/TanStack/Radix tetap di **`peerDependencies`** modul (region sudah begitu). Kalau ada yang masuk `dependencies`, akan muncul duplikat React/Next → error aneh.

Yang **belum** shared adalah `node_modules` milik tiap repo modul saat development (±130 MB × 30). Untuk itu, berurutan dari termurah:
1. **pnpm global store** — tiap repo tetap punya `node_modules`, tapi isinya hardlink ke store global; hemat ±80–90% disk. Tidak perlu ubah struktur repo.
2. **Workspace** (pnpm/npm) — satu `node_modules` untuk semua modul; paling rapi, tapi struktur repo berubah.
3. **Private registry** — install cepat, tanpa clone 30 repo.

Rekomendasi: **pnpm store** dulu saat modul mulai banyak, lalu private registry untuk rilis.

### 2.2 "Saya tidak paham" — apa itu ukur baseline build (F2)
Artinya: kita catat **waktu build Next.js** dengan jumlah modul berbeda, lalu pakai angkanya untuk menebak kondisi 30 modul.
- Ukur build dengan **1 modul** (sekarang), lalu **3**, lalu **10**.
- Kalau kenaikan mendekati linear dan proyeksi 30 modul masih wajar (mis. < 5–8 menit), pertahankan `transpilePackages`.
- Kalau terlalu lambat, modul web dikirim sebagai **JS hasil build** (`dist`), sehingga host tidak perlu mengompilasi TS tiap modul.

Ini hanya pengukuran, tidak mengubah fitur.

### 2.3 Versioning, tag, dan "hapus tag" (F3)
- Sekarang: **SHA** (immutable, paling aman).
- Setelah API modul stabil: **tag** (`v0.1.0`) supaya mudah dibaca manusia. Lockfile tetap mencatat SHA hasil resolve, jadi build tidak berubah diam-diam.
- **Jangan hapus tag.** Tag murah dan menjadi jejak rilis. Kalau ingin tampilan "10 rilis terakhir", pakai **GitHub Releases**, bukan menghapus tag.
- Saran naik versi: perbaikan → **patch** (`0.1.1`), fitur → **minor** (`0.2.0`), breaking → **mayor** (`1.0.0`). Untuk fase `0.x`, breaking change boleh naik minor asal dicatat di changelog.

### 2.4 "`requires` di manifest kadang mengganggu development" (E4)
Dibuat **dua tingkat**:
- **hard**: host menolak start kalau dependency tidak ada (untuk dependency yang benar-benar wajib, mis. FK).
- **soft**: host hanya memberi peringatan dan menonaktifkan fitur terkait (mis. dropdown alamat kalau region tidak terpasang).

Ditambah saklar development: `MODULE_DEPS_STRICT=false` agar peringatan tidak memblokir saat coding.

### 2.5 Koreksi penting: "seed kita termasuk id, jadi selalu sama" (D2)
**Saat ini belum.** Seed region **tidak menulis `id`**; `id` berasal dari `SERIAL`. Yang terjadi sekarang:
- `province` id `1..38`, `regency` id `1..514`, berurutan sesuai seed — **kebetulan** deterministik karena insert berurutan di DB baru.
- Risiko: DB yang sudah pernah di-seed sebagian, ada data dihapus, eller seed dijalankan ulang di DB lama → id bisa berbeda. `SERIAL` tidak pernah memakai ulang id yang sudah terpakai.

Agar klaim "selalu sama" benar-benar terjamin, seed harus:
1. Menulis **`id` eksplisit** untuk province & regency.
2. Menjalankan `setval` pada sequence setelah seed.
3. Region memakai **bigint** (sesuai aturan global Anda).

Kalau ini dilakukan, **FK ke region aman lintas environment**, dan alamat boleh menyimpan `provinceId`/`cityId` (bukan teks).

### 2.6 FK vs teks — penjelasan sederhana (D2)
- **FK**: kolom alamat menyimpan **id** provinsi/kota. Database menolak id yang tidak ada, dan nama wilayah selalu ikut data region terbaru. Konsekuensi: modul customer **wajib** punya modul region.
- **Teks**: kolom menyimpan **nama** provinsi/kota. Customer tetap jalan tanpa region, tetapi salah ketik tidak terdeteksi dan nama lama tidak ikut perubahan.

Karena Anda memilih **relasi** dan id akan dibuat deterministik, rekomendasi saya: **FK**, dengan `ON DELETE RESTRICT` agar data region tidak bisa dihapus kalau masih dipakai customer.

### 2.7 Konsekuensi teknis: bigint, ULID, dan code 6 karakter
- **bigint di JavaScript**: `bigint` tidak aman dikirim sebagai `number` (presisi hilang di atas 2^53). API harus mengirim `id` sebagai **string**, dan entity memakai transformer `bigint ↔ string`. Ini keputusan kontrak API, bukan detail kecil.
- **ULID**: `char(26)`, unique index, dibuat saat insert. ULID bisa jadi **identifier publik** (URL/API), sementara bigint tetap primary key internal.
- **Code 6 karakter**: base32 Crockford (alfabet `0-9A-Z` tanpa I/L/O/U) memberi 32^6 ≈ **1,07 miliar** kombinasi. Dua pilihan:
  - **reversible**: `code = base32((id × A + salt) mod 32^6)` — bisa di-decode kembali ke id.
  - **hash/acak**: `code = base32(hash(id, salt))` — tidak bisa di-decode, wajib unique index + retry saat tabrakan.
- **Salt harus dibekukan** setelah kode pertama terbit. Kalau salt diubah, semua kode berubah dan referensi lama rusak. Simpan salt di settings modul, dan **kode disimpan permanen** di tabel (tidak dihitung ulang saat dibaca).

### 2.8 Empat modul actor
Karena customer adalah **actor** dan akan ada 4 modul actor, sebaiknya `bc-customer` menjadi **template actor v1**:
- Entitas inti: **Actor (Customer)** + **Branch** (alamat, NITKU) + **Staff** (alamat, dipakai modul actor lain).
- Tiga modul actor lainnya mewarisi pola yang sama, hanya beda nama & field khusus.

---

## 3. Pertanyaan Lanjutan (H1–H13) — isi jawaban di sini

### H1. Region ikut diubah ke bigint + ULID?
Golden template v1 ingin "semua id bigint, semua tabel ULID", tetapi region sekarang `int` + tanpa ULID.
- (a) **Ya**: migrasi region ke bigint + tambah `ulid` + `code` BPS di regency + seed id eksplisit; jadikan region bagian template v1 *(rekomendasi agar konsisten)*
- (b) Tidak: region tetap `int`; hanya modul baru bigint/ULID (tidak konsisten, FK bigint→int)

> **Jawaban:**
- (b) Tidak: region tetap `int`; hanya modul baru bigint/ULID (tidak konsisten, FK bigint→int)

### H2. Bentuk relasi alamat ke region
- (a) **FK penuh** dengan TypeORM relation, modul customer mengimpor entity region (`@wasnaker/module-region/api/entities`) *(rekomendasi jika region hard dependency)*
- (b) **Kolom FK saja** (`provinceId`, `cityId`) tanpa import entity; nama wilayah diambil lewat API region
- (c) Kode + snapshot (tanpa FK)

> **Jawaban:**
- (a) **FK penuh** dengan TypeORM relation, modul customer mengimpor entity region (`@wasnaker/module-region/api/entities`) *(rekomendasi jika region hard dependency)*
saya baru kali ini menggunakan API backend; 

### H3. Region hard atau soft dependency?
- (a) **Hard**: customer tidak bisa start tanpa region
- (b) **Soft**: tanpa region, customer tetap jalan tetapi pilihan alamat dinonaktifkan *(rekomendasi untuk development)*
- (c) Hard di produksi, soft di development

> **Jawaban:**
- (b) **Soft**: tanpa region, customer tetap jalan tetapi pilihan alamat dinonaktifkan *(rekomendasi untuk development)*

### H4. Penempatan field pajak (NITKU/NPWP)
- (a) `customer`: `npwp`; `branch`: `nitku`, `vatType` (`npwp`/`nitku`) *(rekomendasi, sesuai aturan Indonesia)*
- (b) Semua di `branch`
- (c) Semua di `customer`
- Field lain yang perlu disiapkan: `nib`, `npwpNumber`, `nitkuNumber`, `isPkp`?

> **Jawaban:**
- (a) `customer`: `npwp`; `branch`: `nitku`, `vatType` (`npwp`/`nitku`) *(rekomendasi, sesuai aturan Indonesia)*
- Field lain yang perlu disiapkan: `nib`, `npwpNumber`, `nitkuNumber`, `isPkp`?

### H5. HO (Head Office) itu apa?
- (a) **Satu branch** dengan flag `isHeadOffice`; setiap customer wajib punya tepat satu HO *(rekomendasi)*
- (b) Entitas terpisah di luar branch
- (c) HO adalah customer itu sendiri (customer tanpa branch)

> **Jawaban:**
- (a) **Satu branch** dengan flag `isHeadOffice`; setiap customer wajib punya tepat satu HO *(rekomendasi)* dan 1 orang admin

### H6. Alamat customer disimpan di mana? (jawaban D3 masih ambigu)
- (a) Hanya di **branch HO**; tabel `customer` tidak punya alamat *(paling konsisten dengan "HO dianggap branch")*
- (b) Di `customer` **dan** di setiap branch (duplikasi)
- (c) Di `customer` saja; branch tidak punya alamat (bertentangan dengan D4)

> **Jawaban:**
- (a) Hanya di **branch HO**; tabel `customer` tidak punya alamat *(paling konsisten dengan "HO dianggap branch")*

### H7. Staff selalu milik branch?
- (a) Ya, `staff.branchId` wajib *(rekomendasi)*
- (b) Bisa langsung ke customer/HO (`staff.branchId` nullable + `customerId`)
- Field staff yang dipakai modul actor lain: apa saja? (mis. `nip`, `jabatan`, `email`, `phone`, alamat)

> **Jawaban:**
- (a) Ya, `staff.branchId` wajib *(rekomendasi)*

### H8. Seed dokumen (NIB/NPWP) dan File
`File` adalah entity milik **host** — modul tidak boleh menulis entity File sendiri.
- (a) Seed hanya membuat **metadata** dokumen (nama file, path, tipe), file fisik disiapkan terpisah
- (b) Seed benar-benar membuat file di storage (butuh host FileService)
- (c) Seed tanpa dokumen dulu; dokumen diisi manual lewat UI

> **Jawaban:**
- (b) Seed benar-benar membuat file di storage (butuh host FileService)

### H9. Code 6 karakter: reversible atau acak?
- (a) **Reversible** dari id + salt (bisa di-decode) *(rekomendasi kalau kode dipakai untuk referensi eksternal)*
- (b) Hash/acak + unique index + retry
- Setuju kode **disimpan permanen** dan salt **tidak boleh diubah** setelah terbit?

> **Jawaban:**
- Setuju kode **disimpan permanen** dan salt **tidak boleh diubah** setelah terbit?

### H10. Empat modul actor apa saja?
Sebutkan nama modulnya (mis. customer, supplier, vendor, partner). Customer jadi **template actor v1**?

> **Jawaban:**
customer, surveyor, association, agency (lembaga pemerintah tingkat provinsi)

### H11. Struktur UI Customer
- (a) **Master-detail 2 panel** seperti region: daftar customer, panel detail dengan tab **Branch** dan **Staff** *(rekomendasi, mengikuti pola yang sudah ada)*
- (b) Tiga halaman terpisah (Customer, Branch, Staff)

> **Jawaban:**
semua module menggunaka component SmallTable
- (b) Tiga halaman terpisah (Customer, Branch, Staff)
karena branch akan memiliki beberapa tab; seperti peralatan dan staff
staff memiliki beberapa tab seperti dokumen legalitas (terutama di surveyor)

### H12. Alokasi `position` menu
- (a) Satu menu "Customer" (`position` 100) dengan tab Branch/Staff di dalamnya *(rekomendasi, sidebar tidak terlalu panjang)*
- (b) Tiga menu terpisah: customer 100–109, branch 110–119, staff 120–129

> **Jawaban:**
- (c) Tiga menu terpisah: customer 100, branch 101, staff 102
kan kita menggunakan SmallTable

### H13. Konfirmasi permission (jawaban B3 saling bertentangan)
- (a) **12 permission**: `read/create/update/delete` × `customer`, `branch`, `staff` *(pilihan detail B3)*
- (b) **4 permission** saja: `*:customer` untuk seluruh isi modul *(tulisan "permission per module" di tabel cepat)*

> **Jawaban:**
- (a) **12 permission**: `read/create/update/delete` × `customer`, `branch`, `staff` *(pilihan detail B3)*

---

## 4. Rencana Kerja (diperbarui setelah H1–H13)

| Fase | Pekerjaan | Hasil |
| --- | --- | --- |
| 1 | Region 0.4.0 (kecil, **tetap `int`, tanpa ULID** sesuai H1): `code` BPS di `regency`, seed id eksplisit + `setval`, endpoint referensi read-only cukup JWT | Region layak jadi rujukan FK |
| 2 | Skrip rename `region → customer` + checklist; rename repo `bc-customer`; commit pertama | Repo customer bersih dari nama region |
| 3 | Skema modul: entity Customer/Branch/Staff (+Peralatan, lihat I6), id bigint + ULID, kolom FK `int` ke region, migrasi, seed (termasuk file, lihat I5) | Skema DB modul |
| 4 | API 12 permission + manifest (`requires` soft) + 3 halaman SmallTable dengan tab | Modul berjalan |
| 5 | Integrasi host + uji CRUD & master-detail | 1 modul terbukti |
| 6 | Ukur build 1 / 3 / 10 modul | Keputusan `transpilePackages` vs prebuilt |
| 7 | CI + tag + private GitHub | Siap 30 modul |

---

## 5. Konfirmasi Jawaban H1–H13 (plus konsekuensinya)

| ID | Keputusan Anda | Konsekuensi / catatan |
| --- | --- | --- |
| H1 | (b) Region tetap `int`, tanpa ULID; hanya modul baru bigint+ULID | Kolom FK di customer (`provinceId`, `cityId`) bertipe **int**, bukan bigint. Hanya id milik customer/branch/staff yang bigint+ULID. Tetap perlu seed id eksplisit agar FK stabil (lihat 2.5) |
| H2 | (a) FK penuh + import entity region | `bc-customer` menambah dependency `@wasnaker/module-region` (versi terkunci). Modul tidak bisa di-build tanpa region ter-install |
| H3 | (b) Soft dependency | **Bentrok dengan H2**: FK membutuhkan tabel region. Penyelesaian diusulkan di I1 |
| H4 | (a) `customer`: npwp; `branch`: nitku + `vatType` | Daftar field lengkap dikonfirmasi di I2 |
| H5 | (a) HO = satu branch ber-flag + **1 orang admin** | Cara menandai admin branch dikonfirmasi di I3 |
| H6 | (a) Alamat hanya di branch (HO); tabel customer tanpa alamat | Tabel `customer` tidak punya kolom alamat |
| H7 | (a) `staff.branchId` wajib | Daftar field staff dikonfirmasi di I4 |
| H8 | (b) Seed benar-benar membuat file di storage | Butuh **FileService host** disuntikkan ke modul; detail di I5 |
| H9 | Kode disimpan permanen + salt dibekukan: **ya** | Reversible vs acak **belum dipilih** → I7 |
| H10 | Actor = customer, surveyor, association, agency | `bc-customer` menjadi **template actor v1** untuk 3 modul lainnya |
| H11 | (b) Halaman terpisah, semua memakai **SmallTable** | Branch punya tab (peralatan & staff); staff punya tab (dokumen legalitas). Muncul entitas "Peralatan" → I6; tabel dokumen → I9 |
| H12 | (c) Tiga menu terpisah: customer 100, branch 101, staff 102 | Tetap dalam blok 100–109 milik customer |
| H13 | (a) **12 permission** (`read/create/update/delete` × customer, branch, staff) | Manifest + seed permission mengikuti ini |

---

## 6. Pertanyaan Terakhir (I1–I9) — isi jawaban di sini

### I1. Menyelesaikan bentrok H2 (FK) vs H3 (soft)
- (a) Kalau region tidak terpasang → host **tidak mendaftarkan modul customer** sama sekali + peringatan (modul "mati", bukan rusak) *(rekomendasi — FK tetap aman)*
- (b) Region jadi **hard** dependency (mengubah H3)
- (c) FK dilepas menjadi kolom `int` biasa tanpa constraint database

> **Jawaban:**
- (b) Region jadi **hard** dependency (mengubah H3)

### I2. Daftar field pajak (lanjutan H4)
Usulan konkret:
- `customer`: `npwpNumber` varchar(20), `isPkp` boolean default false
- `branch`: `nitkuNumber` varchar(24), `vatType` enum(`npwp`,`nitku`) default `npwp`
- NIB: sebagai **dokumen** (file), atau juga butuh kolom `nibNumber`?

> **Jawaban:**
semuanya field varchar; file sebagai validasi

### I3. "1 orang admin" per branch (lanjutan H5)
- (a) Staff dengan flag `isBranchAdmin`, tepat satu per branch *(rekomendasi)*
- (b) Staff dengan kolom `role` enum (`admin`, `staff`)
- (c) Admin branch = akun login host terpisah, bukan staff

> **Jawaban:**
di tabel customer ada field userId; single field; berbeda dengan tabel staff; relasi ke tabel user (setiap staff bisa login)

### I4. Field staff (lanjutan H7)
Usulan default: `name`, `email`, `phone`, `position` (jabatan), `nip` (nullable), `addressLine`. Ada field lain?

> **Jawaban:**
ya

### I5. Seed file (lanjutan H8=b)
- Driver storage host sekarang apa? (S3 / lokal)
- File fixture apa yang di-upload seed? (mis. PDF contoh yang disimpan di repo modul)
- Boleh saya pakai **FileService host** yang disuntikkan lewat module options?

> **Jawaban:**
bagaimana cara wordpress mengelola file; di aplikasi ini juga ada foto staff

### I6. Peralatan (equipment) di tab branch
- (a) Bagian dari modul `bc-customer` (tabel `equipment`, FK branch) *(rekomendasi kalau peralatan hanya milik branch)*
- (b) Modul terpisah `bc-equipment`
- (c) Belum sekarang

> **Jawaban:**
nanti saja

### I7. Code 6 karakter — reversible atau acak? (belum terjawab di H9)
- (a) **Reversible**: `code = base32((id × A + salt) mod 32^6)` — bisa di-decode balik ke id *(rekomendasi kalau kode dipakai referensi eksternal)*
- (b) Acak/hash + unique index + retry

> **Jawaban:**
apa pilihan anda ?

### I8. Penomoran code untuk entitas lain (quotation, invoice, dll)
- (a) Pola `id + salt` dibuat sebagai **fungsi kecil di host/core**, dipakai semua modul *(rekomendasi — konsisten di 30 modul)*
- (b) Tiap modul menulis fungsinya sendiri

> **Jawaban:**
- (a) Pola `id + salt` dibuat sebagai **fungsi kecil di host/core**, dipakai semua modul *(rekomendasi — konsisten di 30 modul)*

### I9. Tabel dokumen legalitas (tab staff/branch)
- (a) **Satu tabel dokumen generik per modul** (`ownerType` + `ownerId` + file) — dipakai branch, staff, customer *(rekomendasi)*
- (b) Tabel terpisah per entitas (`branch_document`, `staff_document`)

> **Jawaban:**
- (a) **Satu tabel dokumen generik per modul** (`ownerType` + `ownerId` + file) — dipakai branch, staff, customer *(rekomendasi)*

---

## 7. Kontrak Final (hasil I1–I9)

> Catatan I7: Anda menanyakan pilihan saya → saya pilih **(a) reversible**, alasan ada di bawah.

| ID | Keputusan final | Penjelasan |
| --- | --- | --- |
| I1 | **Region = hard dependency** (menggantikan H3-b) | `bc-customer` tidak boleh terpasang tanpa `bc-region`. Manifest `requires: ["region"]` bersifat wajib; kalau region tidak ada, host menolak mendaftarkan modul customer (fail-fast, bukan rusak diam-diam) |
| I2 | Semua field pajak **varchar**; file sebagai bukti/validasi | `customer.npwpNumber` varchar(20), `customer.nibNumber` varchar(20), `branch.nitkuNumber` varchar(24), `branch.vatType` varchar(10) (`npwp`/`nitku`, default `npwp`). `isPkp` tidak dibuat dulu (mudah ditambah) |
| I3 | Login: `customer.userId` (satu akun per customer) + setiap staff bisa login via `staff.userId` | FK ke tabel `user` host — **tipe `int`** (user host memakai int, bukan bigint). Interpretasi lengkap dikonfirmasi di J1 |
| I4 | Field staff disetujui | `name`, `email`, `phone`, `position`, `nip` (nullable), `addressLine` + region FK nullable (untuk modul actor lain) |
| I5 | File dikelola seperti media WordPress | Host sudah punya tabel `file` (id UUID, path) + FilesService, driver **local** saat ini (S3 tersedia). Seed membuat baris `file` + menyalin file fixture ke storage. Foto staff = kolom `photoId` → `file` |
| I6 | Peralatan (equipment) **ditunda** | Tidak ada tabel equipment di v1 |
| I7 | **(a) Reversible** — pilihan saya | `code = base32((id × A + salt) mod 32^6)`, Crockford Base32 (tanpa I/L/O/U). Alasan: deterministik, tanpa retry tabrakan, bisa di-decode untuk dukungan. Kode disimpan permanen, salt dibekukan per modul (di Settings) |
| I8 | Fungsi `id + salt` di **host/core** | Dipakai semua modul agar 30 modul konsisten |
| I9 | **Satu tabel dokumen generik** per modul | `customer_document`: `ownerType` (`customer`/`branch`/`staff`) + `ownerId` + `type` + `number` + `fileId` → `file` |

### Skema tabel modul customer (v1)

**customer**
| Kolom | Tipe | Catatan |
| --- | --- | --- |
| `id` | bigint PK | dikirim API sebagai **string** |
| `ulid` | char(26) unique | identifier publik |
| `code` | char(6) unique | base32(id+salt) |
| `name` | varchar(190) | |
| `npwpNumber` | varchar(20) nullable | |
| `nibNumber` | varchar(20) nullable | |
| `userId` | int nullable → `user` | akun utama customer |
| `isActive` | boolean default true | |

**branch**
| Kolom | Tipe | Catatan |
| --- | --- | --- |
| `id` | bigint PK | |
| `ulid` | char(26) unique | |
| `code` | char(6) unique | |
| `customerId` | bigint FK customer | `ON DELETE CASCADE` |
| `name` | varchar(190) | |
| `isHeadOffice` | boolean default false | partial unique index: maksimal 1 HO per customer |
| `nitkuNumber` | varchar(24) nullable | |
| `vatType` | varchar(10) default `npwp` | |
| `addressLine` | varchar(255) | wajib utk HO (validasi aplikasi) |
| `postalCode` | varchar(10) nullable | |
| `provinceId` | int FK province, `RESTRICT` | |
| `cityId` | int FK regency, `RESTRICT` | |

**staff**
| Kolom | Tipe | Catatan |
| --- | --- | --- |
| `id` | bigint PK | tanpa `code` (tidak dipakai) |
| `ulid` | char(26) unique | |
| `branchId` | bigint FK branch, `RESTRICT` | wajib (H7) |
| `userId` | int nullable unique → `user` | setiap staff bisa login |
| `name`, `email`, `phone`, `position`, `nip`, `addressLine` | | `nip` nullable |
| `provinceId`, `cityId` | int nullable FK region | untuk modul actor lain |
| `photoId` | uuid nullable → `file` | foto staff |
| `isActive` | boolean default true | |

**customer_document**
| Kolom | Tipe | Catatan |
| --- | --- | --- |
| `id` | bigint PK | |
| `ulid` | char(26) unique | |
| `ownerType` | varchar(20) | `customer` / `branch` / `staff` |
| `ownerId` | bigint | tanpa FK (polimorfik), index `(ownerType, ownerId)` |
| `type` | varchar(50) | `nib`, `npwp`, `nitku`, `legalitas`, … |
| `number` | varchar(50) nullable | nomor dokumen |
| `fileId` | uuid FK `file` | |
| `issuedAt`, `expiresAt` | date nullable | |

### Catatan penting kontrak
- **Semua FK ke luar modul bertipe mengikuti pemilik tabel**: region `int`, `user` host `int`, `file` host `uuid`. Hanya relasi **antartabel dalam modul** yang bigint.
- Tepat satu HO per customer dijamin: partial unique index + validasi service (create customer = buat HO sekaligus).
- `code` hanya di `customer` dan `branch` (staff tidak butuh).

---

## 8. Konfirmasi Terakhir (J1–J3) — isi jawaban di sini

### J1. Interpretasi I3 — benar?
- `customer.userId` = satu akun utama customer (nullable).
- `staff.userId` = nullable + **unique** (satu akun per staff, tidak dipakai dua staff).
- "1 admin di HO" = staff HO yang akun user-nya diberi peran admin oleh host RBAC (tanpa flag tambahan di tabel staff).
- (a) Benar *(rekomendasi)* / (b) ada koreksi — tulis koreksinya

> **Jawaban:**
- (a) Benar *(rekomendasi)* 

### J2. Alamat branch: wajib atau opsional?
- (a) Wajib untuk HO, opsional untuk branch lain *(rekomendasi)*
- (b) Wajib untuk semua branch
- (c) Opsional untuk semua

> **Jawaban:**
- (b) Wajib untuk semua branch
kan bbisa beda kota beda provinsi

### J3. Prioritas mulai
- (a) Fase 1 dulu: region 0.4.0 (`code` BPS + seed id eksplisit + endpoint referensi JWT)
- (b) Fase 2 dulu: skrip rename `region → customer`
- (c) Fase 1 lalu Fase 2 berurutan *(rekomendasi)*

> **Jawaban:**
- (c) Fase 1 lalu Fase 2 berurutan *(rekomendasi)*

**Aturan default**: kalau J1–J3 tidak dijawab, saya pakai rekomendasi di atas dan mulai Fase 1.

---

## 9. Log Progres Pengerjaan

| Fase | Isi | Status |
| --- | --- | --- |
| Fase 1 | region 0.4.0: kode BPS regency (514/514 terisi), seed id eksplisit + `setval`, endpoint referensi cukup JWT (mutasi tetap `read:region`). Host backend & frontend di-pin ke SHA `5452302`, migrasi + seed sudah jalan di produksi. Tag `v0.4.0` | ✅ Selesai |
| Fase 2 | Skrip `scripts/rename-from-region.mjs` (reusable utk 29 modul lain, ikut disimpan di bc-region); rename penuh region → customer (package `@wasnaker/module-customer`, permission `*:customer`, i18n `module-customer.json`, route `customer`). Commit pertama `c8896a5` | ✅ Selesai |
| Fase 3 | Entity + migrasi sesuai kontrak §7: `customer`, `branch` (addressLine wajib semua cabang, provinceId+cityId RESTRICT, partial unique HO), `staff` (tanpa code, userId nullable unique, nip/addressLine/region nullable), `customer_document` (ownerType+ownerId polimorfik, type/number, issuedAt/expiresAt). ULID + code Crockford Base32 otomatis. Commit `17819ca` | ✅ Selesai |
| Fase 4 | API: service + controller 3 entitas + dokumen, 12 permission (`read/create/update/delete` × `customer/branch/staff`), guard per-resource, validasi (maks 1 HO friendly 422, create customer = buat HO sekaligus dalam 1 transaksi, staff userId unik, validasi city∈province via raw query ke tabel region), DTO + repository (pattern bc-region), manifest `requires: ['region']`, migrasi lama bawaan template dihapus. Commit `40b40e4` | ✅ Selesai |
| Fase 5 | Integrasi host + frontend. Backend: package di-pin, registry di-generate, migrasi 4 tabel + seed 12 permission jalan (terverifikasi psql). Frontend: 3 halaman SmallTable (customer, branch, staff) + menu 100/101/102 + i18n 5 locale, route adapter host, build sukses. Uji e2e lolos: create customer+HO 1 transaksi (code via trigger AFTER INSERT), maks-1-HO 422, city∈province 422, staff userId unik 422, PATCH/DELETE (branch ber-staff 422 `branchHasStaff`), detail customer menyertakan headOffice, filter list format JSON string. Perbaikan selama fase: trigger `code` pakai `n / 32` (bukan `div`), nama migrasi harus lolos aturan last-13 TypeORM, serializer BigInt → string di mapper, path update bigint pakai `update()` + re-read (TypeORM menganggap `save()` dengan id BigInt sebagai insert baru), FK file dipetakan 422 `fileNotFound`. Commit utama modul: `17819ca`, `40b40e4`, `4ccf0bc`, `13413f6`, `eec406b`; host backend `dee5fb7`, host frontend `c65b8bf` | ✅ Selesai |
| Fase 5b | Perbaikan lintas-modul setelah laporan redirect sign-in. **Akar masalah redirect**: JWT memuat role + seluruh permission (dengan `description`) → cookie `auth-token-data` 4201 byte > batas browser ~4096 → cookie ditolak diam-diam → semua halaman admin memantul ke sign-in (bukan salah modul equipment/customer secara khusus). **Fix host API** (`brocoders-api` `3edd3ae`): JWT hanya menyimpan `role: {id}` — guard tetap valid (RolesGuard pakai `role.id`, permission modul selalu dibaca dari DB). Token 3889 → 180 karakter. **Fix bc-equipment** (`49a7f0a`): migrasi lama membawa warisan template region — termasuk migrasi berbahaya yang me-RENAME tabel `province`/`regency` milik region menjadi tabel equipment (dapat menghancurkan data region + FK modul lain). Diganti migrasi bersih `CreateEquipmentHierarchy` (tabel `equipment_group` + `equipment_subgroup` sendiri). **Fix bc-customer** (`274cd61`): dropdown wilayah meminta `limit=100` padahal endpoint region maks 50 → 422; disesuaikan ke 50. Verifikasi Playwright: login OK, cookie tersimpan, `/admin/region`, `/admin/equipment`, `/admin/customer`, `/admin/customer/branch`, `/admin/customer/staff` semua render + API 200 | ✅ Selesai |
| Fase 5c | Menu modul customer digabung jadi 1 induk collapsible + 3 anak (Customers/Branches/Staff) — permintaan user. **Host FE** (`brocoders-react-web` `de195fb`): `MenuItem.children` baru, `resolveMenu` rekursif (fail-closed per level — parent tanpa permission eksplisit tampil bila ≥1 anak lolos), sidebar render grup collapsible (`SidebarMenuSub`) dengan auto-expand saat pathname di sub-path; namespace label anak ikut di-subscribe. **Modul** (`bc-customer` `6817f7e`): manifest jadi 1 parent (slug `customer`, position 100, ikon Building2) dengan 3 anak ber-permission masing-masing; i18n `menu.parent` ditambah di 5 locale. Verifikasi Playwright: parent auto-expand di /admin/customer, 3 anak tampil, collapse/expand bekerja, klik anak navigasi benar, 0 console error | ✅ Selesai |
| Fase 5d | Tabel Branch halaman `/admin/customer/branch` kosong/tidak menampilkan semua branch — desain awal master-detail per customer (wajib pilih customer dulu, lalu hanya branch customer itu). **Fix modul** (`bc-customer` `112b9a5`): endpoint global baru `GET /customer/branches` (customerId opsional sebagai filter, `customerName` di-join, deklarasi route SEBELUM `:id` agar tidak tertangkap param — pola yang sama dengan `documents`), id non-numerik di `GET /customer/:id` kini 404 bukan 500 BigInt; Branch page tabel selalu tampil (tanpa customer = semua branch), customer jadi filter opsional + tombol reset, kolom Customer baru, i18n 5 locale. Verifikasi Playwright: 44 branch ter-render (10/halaman), filter "Sentosa" → 4 baris, reset → semua; nested `GET /customer/:id/branches` tetap jalan | ✅ Selesai |
| Fase 5e | Perbaikan nama branch seed (permintaan user): nama cabang wajib memuat nama perusahaan agar tidak membingungkan (contoh baik: "Kantor Pusat PT Niaga Sentosa Raya"). 37 baris DB diupdate — 4 HO placeholder ("Kantor Pusat Jakarta" dst) → "Kantor Pusat <NamaCustomer>", 33 cabang → "Cabang <Kota> <NamaCustomer>"; 44/44 kini memuat nama perusahaan. Contoh DTO `CreateBranchDto.name` ikut diperbaiki + deskripsi aturan penamaan (`146ea08`). Tidak ada seed file modul yang perlu diubah (modul tanpa seed wajib) | ✅ Selesai |
| Fase 5f | Halaman Staff `/admin/customer/staff` disamakan dengan Branch — permintaan user "1 user per branch; tampilkan di tabel". Endpoint global baru `GET /customer/staff` (branchId + customerId opsional — customerId difilter via join branch.customer, branchName+customerName di-join; route SEBELUM `:id`). Staff page: tabel selalu tampil (46 staff, 10/halaman), customer/branch jadi filter opsional ("Semua cabang" + reset), kolom Cabang & Pelanggan baru, kolom email = akun user ter-link (`admin.cabangXX@example.com`), kolom phone pindah ke detail. Fix bug: customerId ikut queryKey agar ganti filter memicu refetch (`bc-customer` `fd60c81`). Verifikasi Playwright: global 10 baris, filter "Baja" → 4, reset → semua, 0 console error | ✅ Selesai |
| Fase 5g | Kolom **Admin** di tabel Branch `/admin/customer/branch` — permintaan user. List global branch meng-load relasi `staff`; mapper turunkan `adminEmail` = staff ter-link user (`userId` terisi) pertama yang punya email, fallback staff pertama yang punya email (menghindari email palsu sisa e2e seperti `budi@berkah.test`). Fix tsc: sort comparator bigint-safe (`Number(a.id - b.id)`). i18n `table.admin` ×5 locale (`bc-customer` `7ecbd01`). Verifikasi Playwright: header `Code|Name|Customer|Admin|Address|Province|VAT Type`, Kantor Pusat CV Berkah Abadi → `admin.cabang05@example.com`, 0 console error. Catatan: relasi branch→user tidak langsung (via staff.userId); kolom Admin di tabel Customer (buat 1 akun per customer + link `customer.userId`) dibahas terpisah | ✅ Selesai |
| Fase 5h | Ganti 44 nama staff generik ("Admin Cabang <Kota>" / "Admin Kantor Pusat <Kota>", id 3–46) menjadi nama orang Indonesia realistis & unik (Ahmad Fauzi Lubis, Siti Rahmawati Putri, dst) — permintaan user. Nama akun user ter-link (`user.firstName/lastName`) ikut disamakan; email login `admin.cabangXX@example.com` & password tidak diubah (kolom Admin tabel Branch tetap berfungsi). Tidak ada perubahan kode — murni data. "Budi Santoso" (id 1, tanpa link user) dibiarkan; "Staf Duplikat" (id 2) masih menunggu keputusan hapus — terungkap ter-link ke user 1 (admin@example.com, Super Admin), artefak e2e | ✅ Selesai |
| Fase 5i | Hilangkan duplikasi Super Admin sebagai staff (tanpa hapus apa pun — permintaan user "jangan dihapus; usahakan jangan ada duplikat"): `staff` id 2 ("Staf Duplikat", ter-link user 1 = admin@example.com) di-**unlink** (`userId` → NULL) lalu diganti nama "Ratih Kumalasari". Akun Super Admin `admin@example.com` **tidak disentuh** — tetap utuh untuk login; yang diputus hanya relasi staff-nya. DB kini: 0 staff ter-link user 1, 46/46 nama unik. Verifikasi Playwright: login admin@example.com sukses, search "Ratih" → 1 baris tanpa akun user, 0 console error | ✅ Selesai |
| Fase 6 | Ukur waktu build Next.js dengan 1/3/10 modul → keputusan transpilePackages vs prebuilt | ⬜ |

Catatan teknis Fase 3:
- ~~`code` diisi otomatis setelah insert (`@AfterInsert`)~~ → **direvisi saat Fase 5**: `@AfterInsert` tidak andal di dalam transaksi `manager.save` (`event.queryRunner` undefined), jadi `code` diisi **trigger PostgreSQL AFTER INSERT** (`bc_customer_code6` + `trg_customer_code`/`trg_branch_code`, salt placeholder `1`). Repository melakukan re-read setelah save karena trigger AFTER INSERT tidak terbawa di nilai kembalian `save()`. Salt nanti dipindah ke Settings host (I7/I8).
- `staff.branchId` RESTRICT: branch tidak bisa dihapus kalau masih ada staff (harus pindahkan staff dulu).
- Semua FK keluar modul mengikuti tipe pemilik: region `int`, user host `int`, file host `uuid`.

> File diskusi ini sebelumnya sempat hilang karena tertimpa sinkronisasi folder; salinan aman ada di `/www/wwwroot/brocoders/diskusi-modul-customer.md` dan sekarang kembali diverken di `docs/`.
