# Handover: situs + CMS

Dokumen ini untuk memindahkan kepemilikan situs ke client. Panduan teknis CMS ada di `CMS-SETUP.md`.
Jangan menulis password, token, atau hash di dokumen ini atau di repo.

**Peran:** *Pemilik lama* = yang menyerahkan. *Client* = pemilik baru.

## Persiapan (pemilik lama)
- [ ] Buat password CMS baru (minimal 10 karakter) dan hash-nya: `node tools/hash-password.js "password-baru"`
- [ ] Siapkan nilai acak untuk `SESSION_SECRET`: `openssl rand -base64 48`
- [ ] Pastikan domain tidak kedaluwarsa (muammarfaiq.com berakhir 17 Nov 2026) dan tentukan siapa yang memegang zona DNS
- [ ] Client sudah punya akun GitHub dan akun Vercel (login Vercel dengan GitHub paling mudah)

## 1. Transfer repo GitHub (pemilik lama)
1. Repo → Settings → paling bawah *Danger Zone* → **Transfer ownership**
2. Isi username GitHub client dan konfirmasi
3. Client menerima undangan dan klik **Accept**

## 2. Token GitHub baru (client)
1. GitHub → Settings → Developer settings → Fine-grained tokens → **Generate new token**
2. Repository access: hanya repo ini
3. Permissions: **Contents: Read and write**
4. Simpan token di password manager (hanya tampil sekali)

## 3. Import ke Vercel (client)
1. Vercel → Add New → Project → pilih repo → Import
2. Isi Environment Variables (scope Production) sebelum Deploy:

| Nama | Isi |
|---|---|
| `GITHUB_TOKEN` | token dari langkah 2 |
| `ADMIN_PASSWORD_HASH` | hash password baru |
| `SESSION_SECRET` | string acak 32+ karakter |
| `GITHUB_REPO` | `username-client/nama-repo` |
| `GITHUB_BRANCH` | `main` (opsional) |

3. Klik **Deploy**, lalu pastikan `<project>.vercel.app` tampil

## 4. Pindahkan domain
1. Project **lama**: Settings → Domains → hapus `muammarfaiq.com` dan `www`
2. Project **baru**: Settings → Domains → tambah `muammarfaiq.com` dan `www.muammarfaiq.com`
3. Pasang record DNS yang diminta Vercel di zona DNS domain (biasanya `www` CNAME ke Vercel; apex A record `76.76.21.21`)

## 5. Uji sebagai client
- [ ] Situs terbuka di `https://muammarfaiq.com` dan `www`
- [ ] `/admin` bisa login dengan password baru
- [ ] Ubah satu teks → **Save changes** → tunggu ±1 menit → perubahan tampil dan ada commit baru di GitHub
- [ ] Upload satu gambar kecil (di bawah 3 MB) dan pastikan muncul

## 6. Bersihkan (pemilik lama)
- [ ] Hapus project Vercel lama
- [ ] Cabut token GitHub lama (Settings → Developer settings → Tokens → Revoke)
- [ ] Pastikan tidak ada password atau token lama tersimpan di tempat lain

## Pegangan harian client
- Edit konten di `/admin`; sesi berlaku 12 jam. Setiap Save = satu commit, Vercel deploy ±1 menit.
- Ganti password: ganti `ADMIN_PASSWORD_HASH` di Vercel, lalu Redeploy.
- Logout semua sesi: ganti `SESSION_SECRET`, lalu Redeploy.
- Kompres video di bawah 3 MB sebelum diunggah lewat CMS (batas Vercel).
- Perpanjang domain sebelum tanggal kedaluwarsa.
