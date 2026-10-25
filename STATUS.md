# STATUS — Situs OSIS Lemanco (OsisLemanco-sman2trk.github.io)

_Disusun 25 Oktober 2026 dari isi repo (commit terakhir 19 Okt 2026). Hanya fakta yang tertulis di repo; yang tidak bisa diverifikasi dari repo ditandai._

## Ringkasan
Situs statis OSIS SMA Negeri 2 Tarakan: pengurus per periode, program kerja, kegiatan, pengumuman. Repo public. Hanya tiga commit, semuanya 19 Okt (desain awal, lalu perbaikan tampilan hero, langit malam, perjalanan waktu yang diadaptasi dari situs Rohis).

## Stack
HTML, CSS, JavaScript tanpa build (`js/app.js` ±214 baris, `css/style.css` ±172 baris). Isi di `data/*.json`. Ada `.nojekyll`, jadi disiapkan untuk GitHub Pages. Alamat yang diharapkan mengikuti nama repo; belum saya buka.

## Sudah ada
- Halaman: beranda, kegiatan, pengumuman, pengurus, program.
- Warna mengikuti logo dan menandai jenis konten (merah pengumuman, kuning program, hijau kegiatan, biru pengurus).
- Entri contoh bertanda `"sample": true` menampilkan lencana "Contoh".

## Belum / terbuka
- **Isi masih placeholder.** Nama semua pengurus periode 2026/2027 kosong (Pembina, Ketua, Wakil ketua, Sekretaris, Bendahara). Motto, Instagram, TikTok, dan email di `site.json` kosong. Hanya tautan YouTube dan situs sekolah yang terisi.
- Entri contoh: 2 dari 2 kegiatan, 3 dari 3 program, dan 1 dari 2 pengumuman bertanda sample. README meminta menghapusnya sebelum situs dibagikan.
- Tidak ada panel admin; mengubah isi berarti mengedit `data/*.json` di GitHub.
- Tidak ada tes dan tidak ada CI.

## Hal yang perlu diwaspadai
- Jangan membagikan situs sebelum entri contoh dihapus dan nama pengurus diisi.
- Data pengurus (nama siswa) bersifat publik di repo public; pastikan ada izin sebelum mengisinya.

## Dokumen penting
`README.md`.

## Langkah berikutnya (usulan, bukan dari repo)
Isi `data/pengurus.json` dengan nama pengurus yang sudah disetujui, dan hapus entri bertanda `sample`.

---
Perbarui file ini di akhir tiap sesi kerja: tanggal, apa yang selesai, apa yang terbuka.
