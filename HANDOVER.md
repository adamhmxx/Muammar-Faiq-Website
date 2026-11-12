# Panduan Handover: Website Muammar Faiq + CMS

Panduan lengkap dari awal sampai akhir untuk menyerahkan project ini ke client.
Jangan menulis password, token, atau hash di dokumen ini, di chat, atau di repo.

**Peran**
- **Developer**: yang membangun dan menyerahkan.
- **Client**: pemilik baru (Muammar Faiq).

**Susunan sistem (supaya jelas apa saja yang diserahkan)**

| Bagian | Fungsi | Dipegang di |
|---|---|---|
| Repo kode | Semua file situs + `content.json` (isi konten) | GitHub |
| Hosting | Menayangkan situs, menjalankan login CMS | Vercel |
| Domain | `muammarfaiq.com` | Registrar + Cloudflare |
| CMS | Halaman `/admin`, menyimpan perubahan sebagai commit | Berjalan di Vercel, menulis ke GitHub |

Alur CMS: client login di `/admin` → klik **Save changes** → server menulis commit ke GitHub memakai `GITHUB_TOKEN` → Vercel deploy ulang (±1 menit) → perubahan tampil. Token tersimpan hanya di Vercel dan tidak pernah dikirim ke browser.

---

## Tahap 0. Sebelum mulai (Developer)

- [ ] **Cek masa berlaku domain.** `muammarfaiq.com` berakhir **17 Nov 2026**. Perpanjang dulu sebelum apa pun, karena kalau kedaluwarsa situs mati dan domain bisa hilang. Domain terdaftar di akun Cloudflare lain (name server leonard/nora); pemilik akun itu yang bisa memperpanjang atau memindahkannya.
- [ ] Pastikan client punya akun **GitHub** dan **Vercel** (login Vercel pakai GitHub paling mudah). Kalau akan memegang domain sendiri, juga akun **Cloudflare**.
- [ ] Putuskan siapa yang memegang domain setelah handover (lihat Tahap 5).
- [ ] **Backup**: simpan salinan repo di komputermu.
  ```bash
  git clone https://github.com/adamhmxx/muammar-faiq-website.git backup-muammar-faiq
  ```
- [ ] Pastikan situs saat ini berjalan normal sebelum diserahkan (bukan menyerahkan masalah).

---

## Tahap 1. Transfer repo GitHub (Developer, lalu Client)

1. Developer: buka repo → **Settings** → gulir ke bawah sampai **Danger Zone** → **Transfer ownership**.
2. Isi username GitHub client, ketik nama repo untuk konfirmasi, lalu transfer.
3. Client: cek email atau notifikasi GitHub, lalu klik **Accept**.
4. (Opsional) Kalau developer masih perlu mengubah kode: client membuka repo → **Settings → Collaborators → Add people** → tambahkan username developer. Tanpa ini developer tidak bisa push lagi.

Setelah transfer, alamat repo berubah menjadi `username-client/nama-repo`. Catat alamat barunya.

---

## Tahap 2. Token GitHub baru (Client)

Token lama milik developer berhenti berlaku untuk repo yang sudah pindah. Client membuat yang baru dari akunnya sendiri.

1. Buka https://github.com/settings/personal-access-tokens/new
2. **Token name**: `cms-muammar-faiq`
3. **Expiration**: 1 tahun. Catat tanggalnya di kalender.
4. **Repository access**: *Only select repositories* → pilih repo situs ini.
5. **Repository permissions** → **Contents** → **Read and write**.
6. **Generate token**, lalu salin (diawali `github_pat_...`). Token hanya tampil sekali. Simpan di password manager.

---

## Tahap 3. Password CMS (Client atau Developer)

Password tidak disimpan langsung. Yang disimpan di Vercel adalah **hash**-nya.

### 3a. Buat hash
Buka aplikasi **Terminal** (Mac: Cmd+Spasi, ketik `Terminal`). Perlu Node.js; cek dengan `node -v`.

- Kalau muncul error `dyld: Symbol not found` (Mac lama), pasang Node 18: https://nodejs.org/dist/v18.20.4/node-v18.20.4.pkg lalu tutup dan buka Terminal lagi.
- Kalau `command not found`, pasang Node LTS dari https://nodejs.org.

Dari folder repo (atau dengan menyalin file `tools/hash-password.js`):

```bash
node tools/hash-password.js "password-pilihan"
```

Password minimal 10 karakter, panjang, dan acak (password manager bisa membuatkan). Hasilnya satu baris panjang diawali `scrypt$`. **Itu yang dimasukkan ke Vercel, bukan passwordnya.**

Tanpa file apa pun (Mac/Linux):

```bash
node -e 'const c=require("crypto"),s=c.randomBytes(16);console.log("scrypt$"+s.toString("hex")+"$"+c.scryptSync(process.argv[1],s,64).toString("hex"))' "password-pilihan"
```

Salin hanya dari huruf `s` di `scrypt` sampai karakter terakhir. **Jangan ikut menyalin spasi atau baris kosong di ujung**, karena hash jadi tidak cocok dan login akan selalu gagal (Vercel menampilkan ikon peringatan kuning kalau ada).

### 3b. Buat SESSION_SECRET
```bash
openssl rand -base64 48
```

---

## Tahap 4. Deploy di Vercel milik client (Client)

1. Login ke https://vercel.com dengan akun client.
2. **Add New → Project** → pilih repo situs → **Import**.
3. Sebelum menekan Deploy, buka **Environment Variables** dan isi (scope **Production**):

| Key | Value |
|---|---|
| `GITHUB_TOKEN` | token dari Tahap 2 |
| `ADMIN_PASSWORD_HASH` | satu baris `scrypt$...` dari 3a |
| `SESSION_SECRET` | hasil 3b |
| `GITHUB_REPO` | `username-client/nama-repo` |
| `GITHUB_BRANCH` | `main` (opsional) |

4. Klik **Deploy**. Setelah selesai, buka alamat `https://<nama-project>.vercel.app` dan pastikan situs tampil.

Kalau mengubah env var di kemudian hari, selalu **Redeploy** (Deployments → ⋯ → Redeploy), karena nilai baru baru berlaku setelah deploy ulang.

---

## Tahap 5. Domain dan DNS

Pilih salah satu skenario.

### Skenario A: Domain tetap di akun lama, developer mengelola DNS
Paling cepat, tapi client belum memiliki domainnya. Disarankan hanya sebagai langkah sementara.

### Skenario B: Domain dipindah ke akun Cloudflare client (disarankan)
1. Client membuat akun Cloudflare dan memastikan zona `muammarfaiq.com` ada di akunnya (Add a site).
2. Pemilik akun lama memindahkan domain (Cloudflare Registrar transfer atau mengubah name server di registrar ke name server milik zona client). Perubahan name server bisa memakan waktu sampai 24-48 jam untuk menyebar.
3. Pastikan domain **diperpanjang** (auto-renew aktif, kartu pembayaran terpasang).

### Memasang domain ke project Vercel baru
1. Di project Vercel **lama** (developer): Settings → Domains → hapus `muammarfaiq.com` dan `www.muammarfaiq.com`.
2. Di project Vercel **baru** (client): Settings → Domains → tambahkan kedua domain itu.
3. Pasang record DNS yang ditampilkan Vercel di zona DNS (Cloudflare → DNS → Records). Ikuti nilai yang tampil di Vercel; umumnya:

| Tipe | Nama | Isi |
|---|---|---|
| A | `@` (apex) | `76.76.21.21` |
| CNAME | `www` | `cname.vercel-dns.com` |

   Untuk record di Cloudflare, set **Proxy status = DNS only** (awan abu-abu) agar sertifikat Vercel terbit tanpa masalah.
4. Tunggu sampai di Vercel kedua domain berstatus **Valid Configuration** dan HTTPS aktif.

Catatan kondisi saat ini: `www` sudah mengarah ke Vercel, sedangkan apex (tanpa www) belum resolve. Selesaikan apex dulu sebelum handover.

---

## Tahap 6. Uji sebagai client (Client, disaksikan Developer)

- [ ] Situs terbuka di `https://muammarfaiq.com` dan `https://www.muammarfaiq.com`, tampil normal di desktop dan HP.
- [ ] `https://muammarfaiq.com/admin` terbuka dan bisa login dengan password baru.
- [ ] Ubah satu teks, klik **Save changes**, tunggu ±1 menit. Perubahan tampil di situs, dan di GitHub muncul commit baru.
- [ ] Upload satu gambar kecil (di bawah 3 MB) dan pastikan tampil.
- [ ] Logout, lalu login ulang.

---

## Tahap 7. Bersih-bersih (Developer)

- [ ] Hapus project Vercel lama (Settings → paling bawah → Delete Project), setelah domain pindah.
- [ ] Cabut token GitHub lama: GitHub → Settings → Developer settings → Personal access tokens → **Revoke**.
- [ ] Hapus password, hash, dan token lama dari catatan, chat, dan screenshot.
- [ ] Hapus backup lokal kalau kesepakatan kerja mengharuskan, atau simpan dengan sepengetahuan client.

---

## Tahap 8. Serah terima (Developer → Client)

Kirim lewat saluran aman (password manager atau pesan terenkripsi, bukan email biasa):

- [ ] URL admin: `https://muammarfaiq.com/admin`
- [ ] Password CMS (dikirim terpisah dari URL)
- [ ] Dokumen ini dan `CMS-SETUP.md`
- [ ] Daftar akun yang kini dipegang client: GitHub (repo), Vercel (hosting), Cloudflare/registrar (domain)
- [ ] Tanggal penting: domain berakhir, token GitHub berakhir

Konfirmasi tertulis dari client bahwa semua akses sudah diterima dan diuji.

---

## Pegangan harian untuk client

**Mengedit konten**
1. Buka `/admin` dan login.
2. Edit teks, gambar, atau video, lalu **Save changes**.
3. Tunggu ±1 menit, lalu hard refresh situs (Cmd/Ctrl+Shift+R).

**Aturan**
- Sesi login berlaku 12 jam, lalu login ulang.
- Setiap file upload maksimal **3 MB**. Kompres video besar dulu.
- Gunakan gambar yang sudah dioptimalkan agar situs tetap cepat.

**Perawatan berkala**
- **Domain**: perpanjang sebelum kedaluwarsa, aktifkan auto-renew.
- **Token GitHub**: sebelum kedaluwarsa, buat token baru, ganti `GITHUB_TOKEN` di Vercel, lalu Redeploy.
- **Ganti password CMS**: buat hash baru (Tahap 3a), ganti `ADMIN_PASSWORD_HASH`, Redeploy.
- **Logout semua sesi**: ganti `SESSION_SECRET`, Redeploy.

---

## Troubleshooting

| Gejala | Penyebab umum | Solusi |
|---|---|---|
| Login selalu gagal | Hash salah salin (ada spasi/baris baru di ujung) atau belum Redeploy | Isi ulang `ADMIN_PASSWORD_HASH` tanpa spasi, Redeploy |
| Login berhasil, Save gagal | `GITHUB_TOKEN` kedaluwarsa, salah izin, atau `GITHUB_REPO` salah | Buat token baru (Contents: Read and write, repo yang benar), cek `GITHUB_REPO`, Redeploy |
| Save berhasil, situs tidak berubah | Deploy gagal atau cache browser | Cek tab Deployments di Vercel; hard refresh |
| Upload gagal | File di atas 3 MB | Kompres file |
| Situs tidak terbuka di domain, tapi `.vercel.app` jalan | DNS atau domain belum terpasang | Cek Settings → Domains di Vercel dan record DNS |
| Apex jalan, `www` tidak (atau sebaliknya) | Salah satu record DNS hilang | Tambah record A `@` dan CNAME `www` |
| Deploy tidak jalan otomatis setelah transfer repo | Koneksi Vercel ke repo putus | Import ulang repo di Vercel milik client |
| Push dari komputer ditolak (403) | Akses ke repo berubah setelah transfer | Client menambahkan developer sebagai collaborator |

---

## Ringkasan urutan (versi satu halaman)

1. Perpanjang domain, backup repo.
2. Transfer repo GitHub ke client, client Accept.
3. Client buat token GitHub (Contents: Read and write, hanya repo ini).
4. Buat hash password dan `SESSION_SECRET`.
5. Client import repo ke Vercel, isi 4-5 env var, Deploy.
6. Pindahkan domain: hapus dari project lama, tambah ke project baru, pasang DNS.
7. Uji `/admin`: login, edit, Save, cek commit dan situs.
8. Hapus project Vercel lama, cabut token lama.
9. Serahkan akses dan dokumen lewat saluran aman.

---

## Lampiran A. Skrip sesi setup bersama (Model B: akun milik client)

Perkiraan 1-2 jam, lewat screen share. Client yang mengetik di akunnya sendiri; developer memandu. Tujuannya: semua kepemilikan atas nama client, dan setelah ini client hanya perlu login ke `/admin`.

**Sebelum sesi (kirim ke client sehari sebelumnya)**
- [ ] Siapkan email aktif dan kartu pembayaran (untuk domain; hosting jika memakai paket berbayar)
- [ ] Pasang password manager (1Password, Bitwarden, atau bawaan browser)
- [ ] Siapkan Terminal dan Node.js, atau developer yang menjalankan perintah hash di komputernya sendiri tanpa menyimpan password client

**Urutan di sesi**
1. Client membuat akun GitHub, Vercel (login pakai GitHub), dan Cloudflare/registrar kalau domain akan dipindah. (10-15 menit)
2. Developer transfer repo, client Accept (Tahap 1). (5 menit)
3. Client membuat token GitHub (Tahap 2), simpan di password manager. (5 menit)
4. Client menentukan password CMS sendiri di password manager. Hash dibuat di komputer client atau di komputer developer dengan layar client terlihat; passwordnya tidak dikirim lewat chat (Tahap 3). (10 menit)
5. Client import repo ke Vercel dan mengisi env var (Tahap 4). (10-15 menit)
6. Pindahkan domain dan pasang DNS (Tahap 5). Bagian ini bisa menunggu propagasi sampai 24-48 jam. (15-30 menit kerja)
7. Uji bersama (Tahap 6), lalu bersih-bersih (Tahap 7). (15 menit)
8. Client mencatat tanggal penting di kalender: **domain berakhir** dan **token GitHub berakhir**. (5 menit)

**Hasil akhir yang harus dipegang client**
- URL admin dan password (di password manager client)
- Akun GitHub, Vercel, dan domain atas nama client
- Dokumen ini

---

## Lampiran B. Panduan Cepat Client (non-teknis)

**Cara masuk**
1. Buka `https://muammarfaiq.com/admin`
2. Masukkan password, lalu masuk.

**Cara mengubah konten**
1. Ubah teks, gambar, atau video yang diinginkan.
2. Klik **Save changes**.
3. Tunggu sekitar 1 menit, lalu buka situs dan tekan Cmd/Ctrl+Shift+R untuk melihat hasilnya.

**Yang perlu diingat**
- Login berlaku 12 jam, setelah itu login lagi.
- Ukuran file upload maksimal 3 MB. Video lebih besar dikompres dulu.
- Setiap Save langsung tayang di situs. Cek dulu sebelum menyimpan.

**Kalau ada masalah**
- Tidak bisa login: pastikan password benar dan tidak ada spasi di ujung. Kalau lupa, hubungi developer untuk membuat password baru.
- Save gagal: kemungkinan token GitHub kedaluwarsa. Hubungi developer.
- Situs tidak berubah setelah Save: tunggu 2-3 menit dan hard refresh. Kalau masih sama, hubungi developer.

**Tanggal penting (isi saat setup)**
- Domain berakhir: ______ (pastikan auto-renew aktif)
- Token GitHub berakhir: ______ (buat token baru dan beri tahu developer sebelum tanggal ini)
- Kontak developer: ______
