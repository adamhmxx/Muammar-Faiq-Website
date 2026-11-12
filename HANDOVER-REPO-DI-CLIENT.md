# Handover: repo sudah di akun GitHub client

Kasus: repo GitHub **sudah ditransfer ke akun client**. Developer menyiapkan sisanya; client hanya melakukan dua hal kecil (±15-20 menit, dipandu), lalu menerima URL + password dan langsung mengedit.

Jangan menulis password, token, atau hash di dokumen ini, di chat, atau di repo.

**Peran**: *Developer* = yang menyiapkan. *Client* = Muammar Faiq (pemilik repo).

## Kenapa client tetap perlu bertindak
- Token GitHub hanya bisa dibuat untuk repo milik akun sendiri atau organisasi tempat kita menjadi member. Developer **tidak bisa** membuat token untuk repo pribadi milik client.
- Token lama milik developer tidak berlaku lagi untuk repo yang sudah pindah, sehingga **Save di CMS gagal** sampai ada token baru.
- Project Vercel lama milik developer kemungkinan terputus dari repo dan tidak bisa mengambil repo pribadi milik orang lain.

Maka client hanya perlu: **(1) membuat token** dan **(2) menghubungkan repo ke Vercel**. Sisanya developer.

---

## Fase 0. Sebelum mulai (Developer)

- [ ] **Perpanjang domain.** `muammarfaiq.com` berakhir **17 Nov 2026**. Domain ada di akun Cloudflare lain (name server leonard/nora); pemilik akun itu yang bisa memperpanjang. Lakukan paling dulu.
- [ ] Minta client memastikan alamat repo barunya: `username-client/nama-repo`.
- [ ] Siapkan password CMS (di password manager), hash, dan `SESSION_SECRET` (Fase 3).
- [ ] Jadwalkan sesi 20 menit dengan client (screen share atau WhatsApp).

---

## Fase 1. Client membuat token GitHub (±5 menit)

Client mengerjakan ini di akunnya sendiri:

1. Buka https://github.com/settings/personal-access-tokens/new
2. **Token name**: `cms-muammar-faiq`
3. **Expiration**: 1 tahun. Catat tanggalnya.
4. **Repository access**: *Only select repositories* → pilih repo situs ini.
5. **Repository permissions** → **Contents** → **Read and write**.
6. Klik **Generate token** dan salin tokennya (diawali `github_pat_...`). Token hanya tampil sekali.
7. Simpan di password manager. Jangan kirim lewat chat biasa. Pilihan: client yang memasukkannya langsung ke Vercel (Fase 2), atau mengirim lewat saluran aman.

---

## Fase 2. Client menghubungkan repo ke Vercel (±10 menit)

**Pilihan A: client import ke Vercel miliknya sendiri (disarankan)**
1. Buka https://vercel.com dan login dengan GitHub.
2. **Add New → Project** → pilih repo situs → **Import**.
3. Isi **Environment Variables** (scope Production) sebelum Deploy. Client mengisi `GITHUB_TOKEN`; sisanya diisi developer lewat panduan atau dikirim lewat saluran aman:

| Key | Value |
|---|---|
| `GITHUB_TOKEN` | token dari Fase 1 |
| `ADMIN_PASSWORD_HASH` | satu baris `scrypt$...` (Fase 3) |
| `SESSION_SECRET` | string acak 32+ karakter (Fase 3) |
| `GITHUB_REPO` | `username-client/nama-repo` |
| `GITHUB_BRANCH` | `main` (opsional) |

4. Klik **Deploy**, lalu buka `https://<nama-project>.vercel.app` dan pastikan situs tampil.

**Pilihan B: client mengundang developer ke Vercel Team miliknya**
Butuh paket Pro. Client membuat Team dan mengundang developer, lalu developer mengimpor repo dan mengisi env var sendiri (client hanya menyediakan token).

---

## Fase 3. Developer menyiapkan password dan secret

1. Buat password panjang dan acak di password manager (minimal 10 karakter).
2. Buat hash di Terminal. Butuh Node.js (Mac lama: pasang Node 18 dari https://nodejs.org/dist/v18.20.4/node-v18.20.4.pkg):
   ```bash
   node tools/hash-password.js "password-dari-password-manager"
   ```
   Salin hanya satu baris `scrypt$...`, **tanpa spasi atau baris kosong di ujung** (hash jadi tidak cocok, dan Vercel menampilkan ikon peringatan kuning).
3. Buat `SESSION_SECRET`:
   ```bash
   openssl rand -base64 48
   ```
4. Kirim hash dan secret ke client lewat saluran aman, atau mintalah client memasukkannya sambil dipandu. Setelah semua env var terisi: **Redeploy** (Deployments → ⋯ → Redeploy).

---

## Fase 4. Domain dan DNS

1. Project Vercel **lama** (developer): Settings → Domains → hapus `muammarfaiq.com` dan `www.muammarfaiq.com`.
2. Project Vercel **baru** (client): Settings → Domains → tambahkan kedua domain itu.
3. Pasang DNS yang ditampilkan Vercel di zona DNS, umumnya:

| Tipe | Nama | Isi |
|---|---|---|
| A | `@` | `76.76.21.21` |
| CNAME | `www` | `cname.vercel-dns.com` |

   Di Cloudflare set **Proxy status = DNS only** (awan abu-abu). Ikuti nilai yang tampil di Vercel jika berbeda.
4. Tunggu status **Valid Configuration** dan HTTPS aktif. Kondisi saat ini: `www` sudah mengarah ke Vercel, apex belum resolve; selesaikan di langkah ini.

Soal pemilik domain: selama domain di akun Cloudflare lain, hanya pemilik akun itu yang bisa mengubah DNS dan memperpanjang. Rencanakan transfer ke akun client (Fase 7).

---

## Fase 5. Uji menyeluruh (Developer, bersama client bila perlu)

- [ ] `https://muammarfaiq.com` dan `www` terbuka di desktop dan HP
- [ ] `https://muammarfaiq.com/admin` terbuka dan login dengan password baru
- [ ] Ubah satu teks → **Save changes** → tunggu ±1 menit → tampil, dan ada commit baru di repo client
- [ ] Upload satu gambar kecil (di bawah 3 MB) dan tampil
- [ ] Logout, lalu login ulang
- [ ] Kembalikan teks percobaan ke aslinya

---

## Fase 6. Serah pakai (Developer → Client)

Kirim lewat saluran aman (**URL dan password dikirim terpisah**):

- [ ] URL: `https://muammarfaiq.com/admin`
- [ ] Password CMS
- [ ] Panduan cepat (Lampiran di bawah) dengan tanggal dan kontak sudah diisi
- [ ] Daftar akun yang kini dipegang client: GitHub (repo), Vercel (hosting)

Bersih-bersih setelahnya:
- [ ] Hapus project Vercel lama milik developer
- [ ] Cabut token GitHub lama di akun developer (Settings → Developer settings → Tokens → Revoke)
- [ ] Hapus password, hash, dan token lama dari catatan, chat, dan screenshot

---

## Fase 7. Domain ke akun client (kapan pun siap, sesuai kesepakatan)

1. Client membuat akun Cloudflare/registrar dan memasang kartu pembayaran.
2. Pemilik domain saat ini memindahkan domain (transfer registrar, atau mengubah name server ke zona milik client). Client harus menyetujui.
3. Aktifkan **auto-renew** dan catat tanggal kedaluwarsa.
4. Setelah DNS berpindah, cek ulang `muammarfaiq.com` dan `www` (HTTPS aktif, situs dan `/admin` terbuka).

---

## Perawatan berkala

| Hal | Kapan | Cara |
|---|---|---|
| Perpanjang domain | Tiap tahun (berakhir 17 Nov 2026) | Auto-renew aktif, kartu terpasang |
| Token GitHub berakhir | Sesuai tanggal expiration | Buat token baru (Fase 1), ganti `GITHUB_TOKEN` di Vercel, Redeploy |
| Ganti password CMS | Bila perlu | Buat hash baru, ganti `ADMIN_PASSWORD_HASH`, Redeploy |
| Logout semua sesi | Bila perlu | Ganti `SESSION_SECRET`, Redeploy |

## Troubleshooting

| Gejala | Penyebab umum | Solusi |
|---|---|---|
| Login selalu gagal | Hash salah salin (spasi/baris baru di ujung), atau belum Redeploy | Isi ulang `ADMIN_PASSWORD_HASH`, Redeploy |
| Login berhasil, Save gagal | Token kedaluwarsa, salah izin, atau `GITHUB_REPO` salah | Token baru (Contents: Read and write, repo yang benar), perbarui `GITHUB_REPO`, Redeploy |
| Save berhasil, situs tidak berubah | Deploy gagal atau cache | Cek tab Deployments di Vercel; hard refresh |
| Upload gagal | File di atas 3 MB | Kompres file |
| Situs tidak terbuka di domain, tapi `.vercel.app` jalan | DNS atau domain belum terpasang | Cek Domains di Vercel dan record DNS |
| Deploy otomatis tidak jalan | Vercel belum terhubung ke repo | Import ulang repo di Vercel milik client |
| Developer tidak bisa push ke repo | Developer bukan collaborator | Client: repo → Settings → Collaborators → Add people |

---

## Lampiran. Panduan cepat client (kirim ke client)

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
- Token GitHub berakhir: ______
