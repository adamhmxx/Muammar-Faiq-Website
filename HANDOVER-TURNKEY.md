# Handover "Terima Beres": client hanya menerima URL + password

Untuk kasus: **developer menyiapkan semuanya sendiri, client tidak perlu setup apa pun**. Client menerima URL admin dan password, lalu langsung mengedit. Kepemilikan akun diserahkan belakangan lewat undangan (satu klik dari client).

Panduan lain: `HANDOVER.md` (client ikut setup), `CMS-SETUP.md` (rincian teknis CMS).
Jangan menulis password, token, atau hash di dokumen ini, di chat, atau di repo.

**Peran**: *Developer* = yang menyiapkan dan menyerahkan. *Client* = Muammar Faiq.

## Gambaran

| Fase | Siapa | Hasil |
|---|---|---|
| 1. Persiapan | Developer | Domain aman, backup, akun wadah (org/team) siap |
| 2. Setup penuh | Developer | Situs + CMS jalan di wadah netral, sudah diuji |
| 3. Serah pakai | Developer → Client | Client menerima URL + password, langsung bisa edit |
| 4. Serah kepemilikan | Developer + Client | Org/team dan domain pindah ke client (1-4 minggu kemudian) |
| 5. Penutupan | Developer | Akses dan token developer dicabut, selesai |

**Satu hal yang tidak bisa dilewati:** domain dan pembayaran tidak bisa dipindah tanpa persetujuan client. Fase 4 membutuhkan client, tapi hanya untuk menerima undangan dan menyetujui transfer.

---

## Fase 1. Persiapan (Developer)

- [ ] **Perpanjang domain.** `muammarfaiq.com` berakhir **17 Nov 2026**. Domain terdaftar di akun Cloudflare lain (name server leonard/nora); pemilik akun itu yang bisa memperpanjang. Lakukan ini paling dulu.
- [ ] **Backup repo:**
  ```bash
  git clone https://github.com/adamhmxx/muammar-faiq-website.git backup-muammar-faiq
  ```
- [ ] Pastikan situs saat ini berjalan normal.
- [ ] Siapkan password manager untuk menyimpan semua kredensial project (jangan simpan di chat atau repo).
- [ ] Tentukan nama org, misalnya `muammar-faiq-site` (nama GitHub org harus unik).

## Fase 2. Setup penuh di wadah netral (Developer)

### 2a. GitHub Organization
1. GitHub → foto profil → **Your organizations** → **New organization** → pilih paket **Free** → isi nama dan email kontak.
2. Repo → **Settings** → **Danger Zone** → **Transfer ownership** → pilih org tadi. Alamat repo berubah menjadi `org/nama-repo`; catat.
3. Di org: **Settings → Third-party access / Personal access tokens**: pastikan *fine-grained tokens* diizinkan untuk org ini (jika ada pembatasan, aktifkan).

### 2b. Token GitHub
1. https://github.com/settings/personal-access-tokens/new
2. **Resource owner**: pilih **org** (bukan akun pribadimu).
3. **Repository access**: hanya repo situs. **Permissions → Contents: Read and write**.
4. **Expiration**: 1 tahun; catat tanggalnya.
5. Generate dan simpan token di password manager.

> Token ini terikat ke **akunmu**. Kalau kamu keluar dari org nanti, token berhenti bekerja. Karena itu Fase 4 mewajibkan token diganti dengan milik client.

### 2c. Password CMS
1. Buat password panjang dan acak di password manager.
2. Buat hash di Terminal (butuh Node.js; Mac lama: pasang Node 18 dari https://nodejs.org/dist/v18.20.4/node-v18.20.4.pkg):
   ```bash
   node tools/hash-password.js "password-dari-password-manager"
   ```
   Salin hanya satu baris `scrypt$...`. **Jangan ikut menyalin spasi atau baris kosong di ujung** (hash jadi tidak cocok).
3. Buat `SESSION_SECRET`:
   ```bash
   openssl rand -base64 48
   ```

### 2d. Vercel
Dua jalur; pilih sesuai paketmu.

**Jalur 1: Vercel Team (disarankan, mudah diserahkan nanti)**
1. Vercel → buat **Team** (Team di Vercel umumnya paket Pro; ada masa trial) lalu hubungkan GitHub org (pasang Vercel GitHub App di org).
2. Project lama: Settings → General → paling bawah **Transfer Project** → pilih Team baru. Atau **Add New → Project** di Team lalu import repo org.
3. Cek **Environment Variables** di project baru dan pastikan semuanya terisi (isi ulang bila hilang):

| Key | Value |
|---|---|
| `GITHUB_TOKEN` | token dari 2b |
| `ADMIN_PASSWORD_HASH` | satu baris `scrypt$...` |
| `SESSION_SECRET` | hasil `openssl rand` |
| `GITHUB_REPO` | `org/nama-repo` |
| `GITHUB_BRANCH` | `main` (opsional) |

4. **Redeploy**.

**Jalur 2: tetap di akun Vercel pribadimu dulu**
Import repo org ke akun pribadimu, isi env var seperti tabel di atas. Pada Fase 4 client mengimpor ulang ke Vercel miliknya (lihat `HANDOVER.md`, Tahap 4).

### 2e. Domain dan DNS
1. Di project Vercel: Settings → Domains → tambah `muammarfaiq.com` dan `www.muammarfaiq.com` (hapus dulu dari project lama jika ada).
2. Pasang DNS yang ditampilkan Vercel di zona DNS, umumnya:

| Tipe | Nama | Isi |
|---|---|---|
| A | `@` | `76.76.21.21` |
| CNAME | `www` | `cname.vercel-dns.com` |

   Di Cloudflare set **Proxy status = DNS only** (awan abu-abu).
3. Tunggu status **Valid Configuration** dan HTTPS aktif. Catatan kondisi sekarang: `www` sudah mengarah ke Vercel, apex belum resolve; selesaikan apex di langkah ini.

### 2f. Uji menyeluruh
- [ ] `https://muammarfaiq.com` dan `www` terbuka di desktop dan HP
- [ ] `/admin` terbuka dan login dengan password baru
- [ ] Ubah satu teks → **Save changes** → tunggu ±1 menit → tampil, dan ada commit baru di GitHub
- [ ] Upload satu gambar kecil (di bawah 3 MB) dan tampil
- [ ] Logout, login ulang
- [ ] Kembalikan teks percobaan ke aslinya

## Fase 3. Serah pakai (Developer → Client)

Kirim lewat saluran aman (password manager bersama, atau pesan terenkripsi; **URL dan password dikirim terpisah**):

- [ ] URL: `https://muammarfaiq.com/admin`
- [ ] Password CMS
- [ ] Panduan cepat (Lampiran A di bawah) dengan tanggal dan kontak sudah diisi
- [ ] Penjelasan singkat: situs dan domain masih diurus developer sampai serah kepemilikan, dan tanggalnya sudah disepakati (Fase 4)

Setelah ini client bisa langsung mengedit.

## Fase 4. Serah kepemilikan (Developer + Client), paling lambat sesuai kesepakatan

Lakukan ketika client siap (misalnya 1-4 minggu setelah serah pakai). Client hanya perlu menerima undangan dan membuat satu token.

### 4a. GitHub org
1. Client membuat akun GitHub (kalau belum).
2. Developer: org → **People → Invite member** → username client → role **Owner**.
3. Client menerima undangan. Developer tidak perlu lagi menjadi Owner; turunkan jadi *Member*/*Collaborator* atau keluar setelah semuanya selesai.

### 4b. Token baru dari client
Token developer berhenti bekerja kalau developer keluar dari org. Ganti sebelum itu:
1. Client membuat token baru: https://github.com/settings/personal-access-tokens/new
   - Resource owner: **org**, repo situs saja, **Contents: Read and write**, expiration 1 tahun.
2. Client (atau developer di layar client) mengganti `GITHUB_TOKEN` di Vercel dengan token baru.
3. **Redeploy**, lalu uji Save di `/admin`.
4. Developer mencabut tokennya (GitHub → Settings → Developer settings → Revoke).

### 4c. Vercel
- Jalur 1 (Team): undang client sebagai **Owner** di Team, pindahkan tagihan ke kartu client, lalu developer keluar dari Team.
- Jalur 2: client import repo ke Vercel miliknya, isi env var (token baru, hash, secret, `GITHUB_REPO`), Deploy, lalu pindahkan domain, dan project developer dihapus.

### 4d. Domain
1. Client membuat akun registrar/Cloudflare dan memasang kartu pembayaran.
2. Pemilik domain saat ini menginisiasi transfer atau mengubah name server ke zona milik client, dan client menyetujui.
3. Pastikan **auto-renew aktif** dan tanggal kedaluwarsa tercatat.
4. Setelah DNS berpindah, cek ulang `muammarfaiq.com` dan `www` (HTTPS aktif, situs dan `/admin` terbuka).

### 4e. Password CMS (opsional tapi disarankan)
Setelah kepemilikan pindah, ganti password supaya hanya client yang tahu:
1. Client membuat password baru di password manager.
2. Buat hash baru (Fase 2c), ganti `ADMIN_PASSWORD_HASH`, dan ganti `SESSION_SECRET` untuk melogout semua sesi.
3. **Redeploy**.

## Fase 5. Penutupan (Developer)

- [ ] Semua tercentang di Fase 4; uji final di domain utama (login, edit, Save, tampil)
- [ ] Token developer dicabut
- [ ] Developer keluar dari org dan Team, atau tersisa hanya sebagai collaborator bila ada kontrak perawatan
- [ ] Hapus project Vercel lama dan salinan kredensial dari catatan pribadi
- [ ] Kirim ke client: daftar akun yang kini mereka pegang, tanggal penting, dan dokumen ini
- [ ] Konfirmasi tertulis dari client bahwa serah terima selesai

---

## Hal yang harus disepakati dengan client di awal

| Hal | Isi kesepakatan |
|---|---|
| Waktu serah kepemilikan | Tanggal atau durasi (misalnya maksimal 4 minggu setelah serah pakai) |
| Biaya | Siapa menanggung domain, hosting, dan paket Vercel sampai serah kepemilikan |
| Dukungan | Apa yang termasuk perawatan (token, ganti password, perpanjang domain) dan biayanya |
| Risiko | Sebelum serah kepemilikan, kalau developer tidak bisa dihubungi, client tidak bisa mengurus domain atau password |
| Hosting komersial | Kalau situs ini bisnis, paket Hobby Vercel tidak cocok (ketentuan non-komersial); pertimbangkan Pro |

## Tanggal penting (isi dan simpan di kalender)

| Item | Tanggal | Pengingat |
|---|---|---|
| Domain berakhir | 17 Nov 2026 | 30 hari dan 7 hari sebelumnya |
| Token GitHub berakhir | ______ | 14 hari sebelumnya |
| Serah kepemilikan | ______ | |

## Troubleshooting

| Gejala | Penyebab umum | Solusi |
|---|---|---|
| Login selalu gagal | Hash salah salin (ada spasi/baris baru di ujung), atau belum Redeploy | Isi ulang `ADMIN_PASSWORD_HASH`, Redeploy |
| Login berhasil, Save gagal | Token kedaluwarsa, salah izin, `GITHUB_REPO` salah, atau pemilik token sudah keluar dari org | Buat token baru (Resource owner = org, Contents: Read and write), perbarui `GITHUB_TOKEN`, Redeploy |
| Save berhasil, situs tidak berubah | Deploy gagal atau cache | Cek tab Deployments di Vercel; hard refresh |
| Upload gagal | File di atas 3 MB | Kompres file |
| Situs tidak terbuka di domain tapi `.vercel.app` jalan | DNS atau domain belum terpasang | Cek Domains di Vercel dan record DNS |
| Deploy otomatis tidak jalan setelah repo dipindah | Vercel GitHub App belum terpasang di org | Pasang aplikasi di org atau import ulang repo |

---

## Lampiran A. Panduan cepat untuk client (kirim ke client)

**Cara masuk**
1. Buka `https://muammarfaiq.com/admin`.
2. Masukkan password.

**Cara mengubah konten**
1. Ubah teks, gambar, atau video.
2. Klik **Save changes**.
3. Tunggu sekitar 1 menit, lalu buka situs dan tekan Cmd/Ctrl+Shift+R.

**Yang perlu diingat**
- Login berlaku 12 jam, lalu login ulang.
- Ukuran file upload maksimal 3 MB. Video lebih besar dikompres dulu.
- Setiap Save langsung tayang. Cek dulu sebelum menyimpan.

**Kalau ada masalah**
- Tidak bisa login: cek password dan pastikan tidak ada spasi di ujung. Kalau lupa, hubungi developer.
- Save gagal: biasanya token kedaluwarsa. Hubungi developer.
- Situs tidak berubah: tunggu 2-3 menit, hard refresh, lalu hubungi developer kalau masih sama.

**Kontak dan tanggal penting**
- Developer: ______
- Domain berakhir: ______ (pastikan auto-renew aktif)
- Serah kepemilikan akun dijadwalkan: ______
