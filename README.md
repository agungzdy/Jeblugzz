# Dunex Dashboard

Dua halaman statis (murni HTML/CSS/JS, tanpa server/backend), siap dihost di GitHub Pages:

- **`index.html`** — Rekap Dashboard (ringkasan, tren, tabel rekap per tanggal)
- **`live.html`** — Live Monitoring (auto-refresh dari sheet **Summary Outbound**, filter, popup pixel-art 10 menit sebelum ETD)

## 1. Cara deploy ke GitHub Pages
1. Buat repo baru di GitHub, upload semua isi folder ini (`index.html`, `live.html`, `assets/`).
2. Masuk ke **Settings → Pages**, pilih branch `main` dan folder `/ (root)`, lalu Save.
3. Tunggu ~1 menit, dashboard akan aktif di `https://<username>.github.io/<repo>/`.

## 2. Live Monitoring — sudah otomatis
`live.html` mengambil data langsung dari Google Sheet **Dunex Monitoring**, tab **Summary Outbound**
(`gid=830486441`), lewat CSV export publik — tidak perlu API key. Kolom yang dibaca: `ID TRIP`,
`Destination`, `Actual Standby`, `ETD`, `ATD`, `Delay Status`.

**Syarat:** sheet harus tetap di-share sebagai "Anyone with the link – Viewer". Kalau nanti akses
diubah jadi privat, fetch dari browser akan gagal (browser tidak bisa login).

Pengaturan bisa diubah di `assets/app.js` bagian `CONFIG`:
```js
REFRESH_SECONDS: 20,       // interval auto-refresh tabel
ETD_ALERT_MINUTES: 10,     // popup muncul X menit sebelum ETD
ALERT_DURATION_MS: 5000,   // popup tampil 5 detik
ALERT_COOLDOWN_MIN: 5,     // jarak minimal antar popup untuk trip yang sama
```

## 3. Rekap Dashboard — perlu satu langkah manual
Sumber datamu yang satu lagi ada di **Lark (bytedance.larkoffice.com)**. Lark mewajibkan login, dan
tidak menyediakan link CSV publik seperti Google Sheets, jadi halaman statis ini **tidak bisa menariknya
otomatis** (butuh backend + kredensial Lark Open API, di luar cakupan situs statis).

Tiga opsi paling praktis, dari yang paling gampang:

1. **Upload manual (sudah tersedia di `index.html`)** — tiap hari, buka tab tanggal di Lark →
   `File / Export → Download as CSV` → upload lewat tombol "Pilih File CSV" di panel kanan dashboard.
   Kolom yang dibaca: `Tanggal, ID TRIP, Destination, Actual Standby, ETD, ATD, Delay Status`
   (kolom `Tanggal` opsional — kalau kosong, tanggal diambil dari ETD).
2. **Mirror ke Google Sheet** — salin/`IMPORTRANGE` data harian dari Lark ke satu Google Sheet, publish
   sheet itu "Anyone with link", lalu isi `RECAP_CSV_URL` di bagian bawah `index.html` dengan link CSV
   export-nya (format sama seperti di `assets/app.js`, tinggal ganti `SHEET_ID`/`gid`). Setelah itu rekap
   akan ikut auto-load setiap halaman dibuka.
3. **Proxy backend (kalau butuh full-otomatis)** — buat Cloudflare Worker / Vercel Function kecil yang
   memanggil Lark Open API pakai App ID & Secret, lalu mengembalikan CSV/JSON publik yang bisa di-fetch
   `index.html`. Ini di luar cakupan file yang dibuat sekarang karena butuh kredensial punyamu.

## 4. Popup peringatan ETD
Di `live.html`, setiap refresh mengecek semua trip yang **belum berangkat** (`ATD` masih "-"). Kalau
selisih waktu ke `ETD` ≤ 10 menit, muncul popup besar berisi ikon pixel-art (gudang untuk "Sorting
Center", truk untuk "Hub"), nama destinasi, No Trip, dan hitung mundur — otomatis hilang setelah 5 detik.
Kalau beberapa trip trigger bersamaan, popup akan tampil bergantian satu per satu.

## 5. Struktur file
```
dunex-dashboard/
├── index.html          # Rekap Dashboard
├── live.html            # Live Monitoring
├── assets/
│   ├── style.css         # tema warna pink→ungu (mengikuti desain di screenshot)
│   ├── app.js             # CONFIG, parser CSV, fetch Google Sheet, format tanggal
│   └── pixel-art.js       # sprite pixel-art (SVG) untuk popup
└── README.md
```
