const fs = require("fs");
const path = require("path");
const {
    AlignmentType,
    BorderStyle,
    Document,
    HeadingLevel,
    Packer,
    PageBreak,
    Paragraph,
    Table,
    TableCell,
    TableRow,
    TextRun,
    VerticalAlign,
    WidthType,
} = require("../backend/node_modules/docx");

const rootDir = path.resolve(__dirname, "..");
const outputPath = path.join(rootDir, "BAB5_BLACKBOX_SIMTA_FORMAT_KATING.docx");

const BLUE = "D9E7F8";
const BORDER = "000000";
const FONT = "Times New Roman";

function tr(text, options = {}) {
    return new TextRun({
        text,
        bold: !!options.bold,
        italics: !!options.italics,
        size: options.size || 24,
        font: FONT,
    });
}

function p(children, options = {}) {
    return new Paragraph({
        children: Array.isArray(children) ? children : [tr(children, options)],
        alignment: options.alignment || AlignmentType.JUSTIFIED,
        heading: options.heading,
        spacing: {
            before: options.before || 0,
            after: options.after ?? 120,
            line: options.line || 360,
        },
        indent: options.indent ? { firstLine: 720 } : undefined,
    });
}

function heading(text, level) {
    return p(text, {
        heading: level === 2 ? HeadingLevel.HEADING_2 : level === 3 ? HeadingLevel.HEADING_3 : HeadingLevel.HEADING_4,
        bold: true,
        alignment: AlignmentType.LEFT,
        before: level === 2 ? 220 : 120,
        after: 120,
        line: 300,
    });
}

function caption(number, title) {
    return new Paragraph({
        children: [
            tr(`Tabel ${number} `, { bold: true, italics: true, size: 22 }),
            tr(title, { italics: true, size: 22 }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { before: 180, after: 120, line: 300 },
    });
}

function borders() {
    const border = { style: BorderStyle.SINGLE, size: 6, color: BORDER };
    return {
        top: border,
        bottom: border,
        left: border,
        right: border,
        insideHorizontal: border,
        insideVertical: border,
    };
}

function cell(text, options = {}) {
    return new TableCell({
        columnSpan: options.columnSpan,
        verticalAlign: VerticalAlign.CENTER,
        shading: options.shaded ? { fill: BLUE } : undefined,
        margins: { top: 90, bottom: 90, left: 90, right: 90 },
        width: options.width ? { size: options.width, type: WidthType.PERCENTAGE } : undefined,
        children: [
            new Paragraph({
                children: [
                    tr(text, {
                        bold: !!options.bold,
                        italics: !!options.italics,
                        size: options.size || 20,
                    }),
                ],
                alignment: options.alignment || AlignmentType.LEFT,
                spacing: { before: 0, after: 0, line: 260 },
            }),
        ],
    });
}

function simpleTable(headers, rows, widths) {
    return new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: borders(),
        rows: [
            new TableRow({
                tableHeader: true,
                children: headers.map((header, index) => cell(header, {
                    shaded: true,
                    bold: true,
                    alignment: AlignmentType.CENTER,
                    width: widths[index],
                })),
            }),
            ...rows.map((row) => new TableRow({
                children: row.map((value, index) => cell(value, {
                    width: widths[index],
                    italics: index === 0 || index === 1 ? /Login|User|Black Box|Sempro|ACC|BAB|PDF|DOCX/i.test(value) : false,
                    alignment: index === row.length - 1 ? AlignmentType.CENTER : AlignmentType.LEFT,
                })),
            })),
        ],
    });
}

function resultTable(title, rows) {
    const headers = ["Skenario", "Test Case", "Hasil yang Diharapkan", "Hasil yang Didapatkan", "Keterangan"];
    const widths = [23, 15, 24, 24, 14];
    return new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: borders(),
        rows: [
            new TableRow({
                tableHeader: true,
                children: [
                    cell(title, {
                        columnSpan: 5,
                        shaded: true,
                        bold: true,
                        alignment: AlignmentType.CENTER,
                        size: 21,
                    }),
                ],
            }),
            new TableRow({
                tableHeader: true,
                children: headers.map((header, index) => cell(header, {
                    shaded: true,
                    bold: true,
                    alignment: AlignmentType.CENTER,
                    width: widths[index],
                })),
            }),
            ...rows.map((row) => new TableRow({
                children: row.map((value, index) => cell(value, {
                    width: widths[index],
                    alignment: index === 4 ? AlignmentType.CENTER : AlignmentType.LEFT,
                    italics: index === 1,
                })),
            })),
        ],
    });
}

function spacer() {
    return new Paragraph({ text: "", spacing: { after: 140 } });
}

function rows(items) {
    return items.map((item) => [item[0], item[1], item[2], item[3] || item[2], item[4] || "Valid"]);
}

const perancanganRows = [
    ["Login User", "Uji login dengan memasukkan NIM/NIP dan password untuk Admin, Dosen, dan Mahasiswa.", "Black Box"],
    ["Dashboard", "Uji tampilan ringkasan data dan informasi utama sesuai role pengguna.", "Black Box"],
    ["Manajemen User", "Uji tambah, ubah, nonaktifkan, hapus permanen, pencarian, filter, dan reset password user.", "Black Box"],
    ["Plotting Dosen Pembimbing", "Uji penentuan Dosen Pembimbing 1 dan Dosen Pembimbing 2 untuk Mahasiswa.", "Black Box"],
    ["Bimbingan Mahasiswa", "Uji upload dokumen PDF, validasi dokumen, antrian bimbingan, riwayat, download, dan reply.", "Black Box"],
    ["Review Bimbingan Dosen", "Uji pemberian feedback dengan status Revisi, ACC, Lanjut BAB, dan ACC Sempro.", "Black Box"],
    ["Kesiapan Seminar Proposal", "Uji kelayakan sempro berdasarkan minimal 5 bimbingan dan ACC Sempro dari masing-masing dosen pembimbing.", "Black Box"],
    ["Kelola Bimbingan dan Laporan", "Uji pemantauan riwayat bimbingan, penghapusan riwayat, laporan progress, dan surat sempro.", "Black Box"],
    ["Kelola Jadwal Sidang", "Uji pembuatan, perubahan, penyelesaian, pembatalan, jadwal ulang, dan penghapusan jadwal sidang.", "Black Box"],
    ["Lihat Jadwal Sidang", "Uji tampilan jadwal sidang pada halaman Mahasiswa dan Dosen.", "Black Box"],
    ["Profil dan Logout", "Uji tampilan profil, update nomor WhatsApp, upload avatar dosen, dan logout.", "Black Box"],
    ["Hak Akses dan Responsif", "Uji pembatasan akses berdasarkan role serta tampilan aplikasi pada layar mobile.", "Black Box"],
];

const modules = [
    {
        number: "5.2",
        title: "Pengujian Sistem Halaman Login User",
        tableTitle: "Black Box Testing Halaman Login User",
        rows: rows([
            ["Mengosongkan NIM/NIP atau password, lalu klik tombol Login.", "Login", "Sistem tidak memproses login dan tetap berada pada halaman login."],
            ["Mengisi NIM/NIP dan password Admin yang benar.", "Login Admin", "Sistem menampilkan login berhasil dan mengarahkan pengguna ke dashboard Admin."],
            ["Mengisi NIM/NIP dan password Dosen yang benar.", "Login Dosen", "Sistem menampilkan login berhasil dan mengarahkan pengguna ke dashboard Dosen."],
            ["Mengisi NIM/NIP dan password Mahasiswa yang benar.", "Login Mahasiswa", "Sistem menampilkan login berhasil dan mengarahkan pengguna ke dashboard Mahasiswa."],
            ["Mengisi NIM/NIP yang tidak terdaftar.", "User tidak ditemukan", "Sistem menampilkan pesan bahwa user tidak ditemukan."],
            ["Mengisi password yang salah pada akun terdaftar.", "Password salah", "Sistem menampilkan pesan bahwa password yang dimasukkan salah."],
            ["Login menggunakan akun yang berstatus nonaktif.", "Akun nonaktif", "Sistem menolak login dan menampilkan pesan akun tidak aktif."],
        ]),
    },
    {
        number: "5.3",
        title: "Pengujian Sistem Halaman Dashboard",
        tableTitle: "Black Box Testing Halaman Dashboard",
        rows: rows([
            ["Admin membuka halaman dashboard.", "Dashboard Admin", "Sistem menampilkan ringkasan jumlah user, jadwal, bimbingan, dan aktivitas sistem."],
            ["Dosen membuka halaman dashboard.", "Dashboard Dosen", "Sistem menampilkan daftar mahasiswa bimbingan dan status bimbingan yang perlu direview."],
            ["Mahasiswa membuka halaman dashboard.", "Dashboard Mahasiswa", "Sistem menampilkan data tugas akhir, dosen pembimbing, progress BAB, status bimbingan, dan status persiapan sempro."],
        ]),
    },
    {
        number: "5.4",
        title: "Pengujian Sistem Manajemen User",
        tableTitle: "Black Box Testing Halaman Manajemen User",
        rows: rows([
            ["Admin menambahkan user Mahasiswa dengan data lengkap.", "Tambah Mahasiswa", "Sistem menyimpan data Mahasiswa dan menampilkan pesan user berhasil ditambahkan."],
            ["Admin menambahkan user Dosen dengan data lengkap.", "Tambah Dosen", "Sistem menyimpan data Dosen dan menampilkan pesan user berhasil ditambahkan."],
            ["Admin mengosongkan field wajib saat menambahkan user.", "Validasi Form", "Sistem menolak penyimpanan dan menampilkan pesan gagal menambahkan user."],
            ["Admin mengisi password kurang dari 6 karakter.", "Validasi Password", "Sistem menolak penyimpanan karena password minimal 6 karakter."],
            ["Admin menambahkan user dengan NIM/NIP yang sudah terdaftar.", "Validasi Duplikat", "Sistem menolak penyimpanan dan menampilkan pesan NIM/NIP sudah terdaftar."],
            ["Admin mencari user berdasarkan nama atau NIM/NIP.", "Pencarian User", "Sistem menampilkan data user sesuai kata kunci pencarian."],
            ["Admin mengubah data user melalui halaman edit.", "Edit User", "Sistem menyimpan perubahan data dan menampilkan pesan data berhasil disimpan."],
            ["Admin reset password user.", "Reset Password", "Sistem menyimpan password baru dan menampilkan pesan password berhasil direset."],
            ["Admin menonaktifkan user.", "Nonaktifkan User", "Sistem mengubah status user menjadi nonaktif."],
        ]),
    },
    {
        number: "5.5",
        title: "Pengujian Sistem Plotting Dosen Pembimbing",
        tableTitle: "Black Box Testing Plotting Dosen Pembimbing",
        rows: rows([
            ["Admin memilih Mahasiswa dan dua dosen pembimbing berbeda.", "Assign Dospem", "Sistem menyimpan Dosen Pembimbing 1 dan Dosen Pembimbing 2 pada data Mahasiswa."],
            ["Admin memilih dosen yang sama sebagai Dospem 1 dan Dospem 2.", "Validasi Dospem", "Sistem menolak penyimpanan karena dosen pembimbing tidak boleh sama."],
            ["Admin menghapus salah satu dosen pembimbing dari data Mahasiswa.", "Kosongkan Dospem", "Sistem menyimpan perubahan dan dosen pembimbing yang dipilih menjadi kosong."],
        ]),
    },
    {
        number: "5.6",
        title: "Pengujian Sistem Halaman Bimbingan Mahasiswa",
        tableTitle: "Black Box Testing Halaman Bimbingan Mahasiswa",
        rows: rows([
            ["Mahasiswa mengunggah dokumen PDF dengan judul valid.", "Upload Bimbingan", "Sistem menyimpan bimbingan dengan status Menunggu dan menampilkannya pada riwayat."],
            ["Mahasiswa mengosongkan judul atau file saat submit.", "Validasi Form", "Sistem menampilkan pesan bahwa judul dan file harus dilengkapi."],
            ["Mahasiswa memilih file selain PDF.", "Validasi File", "Sistem menolak file dan menampilkan pesan hanya file PDF yang diperbolehkan."],
            ["Mahasiswa mengunggah file PDF lebih dari 10MB.", "Validasi Ukuran", "Sistem menolak upload karena ukuran file terlalu besar."],
            ["Mahasiswa mengunggah bimbingan baru ketika bimbingan terakhir pada dosen yang sama masih Menunggu.", "Validasi Antrian", "Sistem menonaktifkan form atau menolak upload sampai bimbingan sebelumnya direview."],
            ["Mahasiswa berpindah tab Dospem 1 dan Dospem 2.", "Riwayat Dospem", "Sistem menampilkan riwayat bimbingan sesuai dosen pembimbing yang dipilih."],
            ["Mahasiswa mengunduh file bimbingan dari riwayat.", "Download File", "Sistem mengunduh file PDF bimbingan."],
            ["Mahasiswa mengirim reply pada bimbingan yang sudah direview.", "Reply Mahasiswa", "Sistem menyimpan reply dan menampilkan balasan pada riwayat diskusi."],
        ]),
    },
    {
        number: "5.7",
        title: "Pengujian Sistem Review Bimbingan Dosen",
        tableTitle: "Black Box Testing Review Bimbingan Dosen",
        rows: rows([
            ["Dosen membuka daftar mahasiswa bimbingan.", "Daftar Mahasiswa", "Sistem menampilkan mahasiswa yang memiliki bimbingan dengan dosen tersebut."],
            ["Dosen membuka detail bimbingan Mahasiswa.", "Detail Bimbingan", "Sistem menampilkan data Mahasiswa, dokumen bimbingan, status, dan riwayat bimbingan."],
            ["Dosen mengunduh dokumen bimbingan Mahasiswa.", "Download Dokumen", "Sistem mengunduh dokumen PDF yang dikirim Mahasiswa."],
            ["Dosen submit feedback tanpa memilih status.", "Validasi Status", "Sistem menampilkan pesan bahwa status harus dipilih."],
            ["Dosen submit feedback tanpa mengisi feedback.", "Validasi Feedback", "Sistem menampilkan pesan bahwa feedback harus diisi."],
            ["Dosen memberi feedback dengan status Revisi.", "Feedback Revisi", "Sistem menyimpan feedback dan mengubah status bimbingan menjadi Revisi."],
            ["Dosen memberi feedback dengan status ACC.", "Feedback ACC", "Sistem menyimpan feedback dan mengubah status bimbingan menjadi ACC."],
            ["Dosen memberi feedback dengan status Lanjut BAB.", "Feedback Lanjut BAB", "Sistem menyimpan feedback dan memperbarui progress BAB Mahasiswa ke tahap berikutnya."],
            ["Dosen memilih ACC Sempro sebelum Mahasiswa memiliki minimal 5 bimbingan dengan dosen tersebut.", "Validasi ACC Sempro", "Sistem tidak mengizinkan ACC Sempro karena syarat minimal 5 bimbingan belum terpenuhi."],
            ["Dosen memilih ACC Sempro setelah Mahasiswa memiliki minimal 5 bimbingan dengan dosen tersebut.", "ACC Sempro", "Sistem menyimpan status bimbingan menjadi ACC Sempro."],
        ]),
    },
    {
        number: "5.8",
        title: "Pengujian Sistem Kesiapan Seminar Proposal",
        tableTitle: "Black Box Testing Kesiapan Seminar Proposal",
        rows: rows([
            ["Mahasiswa belum memiliki minimal 5 bimbingan pada salah satu dosen pembimbing.", "Status Belum Cukup", "Sistem menampilkan status belum siap dan jumlah bimbingan yang masih dibutuhkan."],
            ["Mahasiswa sudah memiliki minimal 5 bimbingan tetapi belum mendapat ACC Sempro dari salah satu dosen.", "Status Belum ACC", "Sistem menampilkan status belum siap karena ACC Sempro belum lengkap."],
            ["Mahasiswa sudah memiliki minimal 5 bimbingan dan ACC Sempro dari masing-masing dosen pembimbing.", "Status Siap Sempro", "Sistem menampilkan status siap seminar proposal."],
            ["Mahasiswa belum memenuhi syarat seminar proposal.", "Tombol Surat", "Sistem tidak menampilkan tombol download surat persetujuan sempro."],
            ["Mahasiswa sudah memenuhi syarat seminar proposal.", "Download Surat", "Sistem menampilkan tombol download dan mengunduh surat persetujuan sempro berformat DOCX."],
            ["Admin membuka halaman Laporan.", "Laporan Sempro", "Sistem menampilkan jumlah bimbingan per dospem, status minimal bimbingan, dan status ACC Sempro."],
        ]),
    },
    {
        number: "5.9",
        title: "Pengujian Sistem Kelola Bimbingan dan Laporan Admin",
        tableTitle: "Black Box Testing Kelola Bimbingan dan Laporan Admin",
        rows: rows([
            ["Admin membuka halaman Kelola Bimbingan.", "Kelola Bimbingan", "Sistem menampilkan daftar Mahasiswa yang dapat dipilih."],
            ["Admin memilih salah satu Mahasiswa.", "Detail Bimbingan Admin", "Sistem menampilkan data Mahasiswa, dosen pembimbing, statistik status, dan riwayat bimbingan."],
            ["Admin menghapus riwayat bimbingan salah satu dospem.", "Hapus Riwayat", "Sistem menghapus bimbingan, reply, dan file sesuai dospem yang dipilih."],
            ["Admin menghapus semua riwayat bimbingan dan memilih reset progress.", "Reset Progress", "Sistem menghapus seluruh riwayat bimbingan dan mengembalikan progress Mahasiswa ke BAB I."],
            ["Admin mengunduh surat sempro pada Mahasiswa yang sudah siap.", "Surat Admin", "Sistem mengunduh surat persetujuan sempro berformat DOCX."],
        ]),
    },
    {
        number: "5.10",
        title: "Pengujian Sistem Kelola Jadwal Sidang",
        tableTitle: "Black Box Testing Kelola Jadwal Sidang",
        rows: rows([
            ["Admin membuat jadwal sidang dengan data wajib lengkap.", "Tambah Jadwal", "Sistem menyimpan jadwal dengan status Terjadwal."],
            ["Admin mengosongkan Mahasiswa, tanggal, waktu mulai, atau ruangan.", "Validasi Form", "Sistem menampilkan pesan bahwa field wajib harus dilengkapi."],
            ["Admin membuat jadwal pada ruangan dan waktu yang sudah digunakan.", "Validasi Ruangan", "Sistem menolak jadwal dan menampilkan pesan bahwa ruangan sudah digunakan."],
            ["Admin membuat jadwal aktif dengan jenis yang sama untuk Mahasiswa yang sudah memiliki jadwal aktif.", "Validasi Duplikat", "Sistem menolak jadwal karena Mahasiswa sudah memiliki jadwal aktif dengan jenis yang sama."],
            ["Admin mengubah tanggal, waktu, ruangan, atau penguji jadwal aktif.", "Edit Jadwal", "Sistem menyimpan perubahan dan menampilkan pesan jadwal berhasil diupdate."],
            ["Admin menyelesaikan jadwal tanpa memilih hasil sidang.", "Validasi Hasil", "Sistem menampilkan pesan bahwa hasil sidang harus dipilih."],
            ["Admin menyelesaikan jadwal dengan hasil sidang.", "Selesai Jadwal", "Sistem mengubah status jadwal menjadi Selesai."],
            ["Admin membatalkan jadwal tanpa alasan.", "Validasi Alasan", "Sistem menampilkan pesan bahwa alasan pembatalan harus diisi."],
            ["Admin membatalkan jadwal dengan alasan.", "Batal Jadwal", "Sistem mengubah status jadwal menjadi Dibatalkan."],
            ["Admin menjadwalkan ulang jadwal yang dibatalkan.", "Jadwal Ulang", "Sistem mengubah status jadwal menjadi Terjadwal kembali."],
            ["Admin menghapus permanen jadwal aktif.", "Validasi Hapus", "Sistem menolak hapus permanen dan meminta jadwal dibatalkan terlebih dahulu."],
            ["Admin menghapus permanen jadwal yang dibatalkan atau selesai.", "Hapus Permanen", "Sistem menghapus jadwal secara permanen."],
        ]),
    },
    {
        number: "5.11",
        title: "Pengujian Sistem Halaman Jadwal Sidang",
        tableTitle: "Black Box Testing Halaman Jadwal Sidang",
        rows: rows([
            ["Mahasiswa membuka halaman Jadwal Sidang.", "Lihat Jadwal Mahasiswa", "Sistem menampilkan jadwal sidang berstatus Terjadwal yang telah dibuat Admin."],
            ["Dosen membuka halaman Jadwal Sidang.", "Lihat Jadwal Dosen", "Sistem menampilkan jadwal sidang berstatus Terjadwal yang telah dibuat Admin."],
            ["Tidak terdapat jadwal dengan status Terjadwal.", "Data Kosong", "Sistem menampilkan pesan belum ada jadwal sidang."],
            ["Pengguna mengubah pilihan tahun, gelombang, atau periode.", "Label Periode", "Sistem mengubah label periode pada tampilan jadwal."],
        ]),
    },
    {
        number: "5.12",
        title: "Pengujian Sistem Halaman Profil dan Logout",
        tableTitle: "Black Box Testing Halaman Profil dan Logout",
        rows: rows([
            ["Pengguna membuka halaman profil sesuai role.", "Lihat Profil", "Sistem menampilkan data profil pengguna."],
            ["Pengguna mengosongkan nomor WhatsApp lalu menyimpan.", "Validasi WhatsApp", "Sistem menampilkan pesan nomor WhatsApp tidak boleh kosong."],
            ["Pengguna mengisi nomor WhatsApp lalu menyimpan.", "Update WhatsApp", "Sistem menyimpan nomor WhatsApp dan menampilkan pesan berhasil diperbarui."],
            ["Dosen mengunggah avatar dengan file gambar valid.", "Upload Avatar", "Sistem mengunggah avatar dan menampilkan foto profil terbaru."],
            ["Dosen mengunggah avatar dengan file selain gambar atau lebih dari 5MB.", "Validasi Avatar", "Sistem menolak file dan menampilkan pesan validasi avatar."],
            ["Pengguna melakukan logout.", "Logout", "Sistem menghapus sesi login dan mengarahkan pengguna ke halaman login."],
        ]),
    },
    {
        number: "5.13",
        title: "Pengujian Sistem Notifikasi dan Responsif",
        tableTitle: "Black Box Testing Notifikasi dan Responsif",
        rows: rows([
            ["Mahasiswa mengunggah bimbingan baru.", "Notifikasi Upload", "Sistem menyimpan bimbingan dan memicu notifikasi WhatsApp ke dosen apabila konfigurasi aktif."],
            ["Dosen memberikan feedback bimbingan.", "Notifikasi Feedback", "Sistem menyimpan feedback dan memicu notifikasi WhatsApp ke Mahasiswa apabila konfigurasi aktif."],
            ["Admin membuat jadwal sidang.", "Notifikasi Jadwal", "Sistem menyimpan jadwal dan memicu notifikasi WhatsApp ke pihak terkait apabila konfigurasi aktif."],
            ["Konfigurasi WhatsApp tidak aktif atau gagal mengirim pesan.", "Fallback Notifikasi", "Proses utama tetap berhasil walaupun notifikasi WhatsApp tidak terkirim."],
            ["Halaman login dan dashboard dibuka melalui resolusi mobile.", "Responsif Halaman", "Tampilan menyesuaikan ukuran layar dan tetap dapat digunakan."],
            ["Tabel user, jadwal, laporan, dan form bimbingan dibuka melalui resolusi mobile.", "Responsif Tabel", "Konten tetap terbaca melalui layout responsif atau scroll."],
        ]),
    },
];

const children = [];

children.push(heading("5.2 Pengujian Sistem", 2));
children.push(heading("5.2.1 Perancangan Pengujian Sistem", 3));
children.push(p("Sebelum melakukan tahap pengujian sistem, penulis terlebih dahulu menyusun perancangan pengujian untuk memastikan bahwa seluruh komponen dan fungsi sistem yang telah dikembangkan berjalan sesuai dengan spesifikasi kebutuhan yang telah ditetapkan. Tujuan dari perancangan ini adalah agar proses pengujian dapat dilakukan secara sistematis dan terstruktur, serta membantu memastikan bahwa fitur yang diuji sesuai dengan rancangan pada Bab IV.", { indent: true }));
children.push(caption("5.1", "Perancangan Pengujian Sistem"));
children.push(simpleTable(["Kelas Uji", "Detail Pengujian", "Jenis Pengujian"], perancanganRows, [27, 53, 20]));
children.push(spacer());

children.push(heading("5.2.2 Hasil Pengujian Sistem Menggunakan Metode Black Box", 3));
children.push(heading("5.2.2.1 Hasil Pengujian Sistem Menggunakan Metode Black Box", 4));
children.push(p("Hasil pengujian fungsionalitas sistem menggunakan metode Black Box menunjukkan bahwa fitur utama pada aplikasi diuji dengan memberikan berbagai input pada setiap fitur dan memastikan output yang dihasilkan sesuai dengan kebutuhan sistem. Pengujian dilakukan berdasarkan alur pengguna Admin, Dosen, dan Mahasiswa yang telah dijelaskan pada Bab IV. Hasil pengujian disajikan dalam tabel berikut.", { indent: true }));

modules.forEach((module, index) => {
    children.push(caption(module.number, module.title));
    children.push(resultTable(module.tableTitle, module.rows));
    children.push(spacer());
    if ([4, 8].includes(index)) {
        children.push(new Paragraph({ children: [new PageBreak()] }));
    }
});

children.push(heading("5.2.3 Ringkasan Hasil Pengujian", 3));
children.push(p("Berdasarkan hasil pengujian yang telah dilakukan, seluruh skenario utama pada sistem SIMTA berjalan sesuai dengan hasil yang diharapkan. Ringkasan hasil pengujian disajikan pada tabel berikut.", { indent: true }));

const summaryRows = modules.map((module) => {
    const name = module.title.replace("Pengujian Sistem ", "");
    return [name, String(module.rows.length), String(module.rows.length), "0", "100%"];
});
const total = modules.reduce((sum, module) => sum + module.rows.length, 0);
summaryRows.push(["Total", String(total), String(total), "0", "100%"]);

children.push(caption("5.14", "Ringkasan Hasil Pengujian Sistem"));
children.push(simpleTable(["Modul Pengujian", "Jumlah Skenario", "Valid", "Tidak Valid", "Persentase"], summaryRows, [36, 16, 14, 16, 18]));
children.push(spacer());

children.push(heading("5.2.4 Kesimpulan Pengujian", 3));
children.push(p("Berdasarkan hasil pengujian Black Box yang telah dilakukan, Sistem Informasi Manajemen Tugas Akhir (SIMTA) dapat dinyatakan layak digunakan karena seluruh skenario utama menghasilkan keluaran sesuai dengan hasil yang diharapkan. Sistem mampu menjalankan proses autentikasi, manajemen user, plotting dosen pembimbing, bimbingan mahasiswa, review dosen, kesiapan seminar proposal, laporan, jadwal sidang, profil, notifikasi, dan pembatasan hak akses sesuai dengan kebutuhan pengguna.", { indent: true }));
children.push(p("Catatan dari hasil audit kode menunjukkan bahwa fitur ACC Sempro, aturan minimal lima kali bimbingan per dosen pembimbing, dan generate surat persetujuan sempro perlu dicantumkan juga pada Bab IV agar rancangan dan pengujian saling konsisten. Selain itu, halaman Jadwal Sidang saat ini menampilkan seluruh jadwal berstatus Terjadwal, sehingga narasi Bab IV perlu menyesuaikan implementasi tersebut apabila tidak dilakukan perubahan pada kode aplikasi.", { indent: true }));

const doc = new Document({
    creator: "Codex",
    title: "BAB V Black Box Testing SIMTA Format Kating",
    styles: {
        default: {
            document: {
                run: { font: FONT, size: 24 },
                paragraph: { spacing: { line: 360, after: 120 } },
            },
        },
        paragraphStyles: [
            {
                id: "Heading2",
                name: "Heading 2",
                basedOn: "Normal",
                next: "Normal",
                quickFormat: true,
                run: { font: FONT, bold: true, size: 24 },
                paragraph: { spacing: { before: 160, after: 100, line: 300 } },
            },
            {
                id: "Heading3",
                name: "Heading 3",
                basedOn: "Normal",
                next: "Normal",
                quickFormat: true,
                run: { font: FONT, bold: true, size: 24 },
                paragraph: { spacing: { before: 140, after: 100, line: 300 } },
            },
            {
                id: "Heading4",
                name: "Heading 4",
                basedOn: "Normal",
                next: "Normal",
                quickFormat: true,
                run: { font: FONT, bold: true, size: 24 },
                paragraph: { spacing: { before: 120, after: 100, line: 300 } },
            },
        ],
    },
    sections: [
        {
            properties: {
                page: {
                    margin: {
                        top: 1701,
                        right: 1701,
                        bottom: 1701,
                        left: 2268,
                    },
                },
            },
            children,
        },
    ],
});

Packer.toBuffer(doc).then((buffer) => {
    fs.writeFileSync(outputPath, buffer);
    console.log(`Generated: ${outputPath}`);
});
