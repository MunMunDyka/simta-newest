DAFTAR ISI

KATA PENGANTAR	2
DAFTAR ISI	4
DAFTAR GAMBAR	6
DAFTAR TABEL	7
BAB I
PENDAHULUAN	1
1.1 Latar Belakang	1
1.2 Rumusan Masalah	4
1.3 Batasan Masalah	5
1.4 Hipotesa	5
1.5 Tujuan dan Manfaat	6
1.6 Sistematika Penulisan	6
BAB II
TINJAUAN PUSTAKA	8
2.1 Teori Utama	8
2.1.1 Sistem	8
2.1.2 Informasi	8
2.1.3 Manajemen	9
2.1.4 Sistem Informasi	10
2.1.5 Sistem Informasi Manajemen (SIM)	10
2.1.6 Tugas Akhir	11
2.1.7 Komunikasi Akademik Daring	11
2.1.8 Dokumentasi dan Version Control	12
2.1.9 Electronic Document Management System (EDMS)	13
2.1.10 Dashboard dan Monitoring Sistem	13
2.1.11 Sistem Notifikasi Otomatis	14
2.1.12 Website	14
2.1.13 Basis Data	15
2.1.14 Unified Modeling Language (UML)	15
2.1.15 Metode Prototyping	20
2.1.16 Pengujian Black-Box	22
2.1.17 System Usability Scale (SUS)	23
2.2 Teori Pendukung	25
2.2.1 Visual Studio Code	25
2.2.2 Framework React	25
2.2.3 Platform Backend Node.js	26
2.2.4 Basis Data NoSQL (MongoDB)	27
2.2.5 Github	28
2.2.6 Vercel Hosting	28
2.2.7 Draw.io	29
2.3 Penelitian Terdahulu	29
BAB III
METODOLOGI PENELITIAN	35
3.1 Kerangka Penelitian	35
3.2 Metode Pengumpulan Data	38
3.3 Metode Perancangan Sistem	39
3.4 Metode Pengujian Sistem	41
3.5 Lokasi dan Jadwal Penelitian	41
DAFTAR PUSTAKA	43
LAMPIRAN	48

BAB I
PENDAHULUAN

Latar Belakang
Integrasi teknologi informasi dalam tata kelola akademik perguruan tinggi telah menjadi kebutuhan mendesak untuk menjamin efisiensi dan transparansi layanan. Christoval dkk. (2025) menegaskan bahwa transformasi dari sistem manual ke sistem berbasis Web sangat krusial untuk meminimalkan kesalahan pencatatan (human Error) dan mempercepat akses informasi bagi sivitas akademika. Namun, observasi di lapangan menunjukkan bahwa proses bimbingan skripsi di Fakultas Teknologi Informasi Institut Teknologi Batam (ITEBA) masih berjalan secara konvensional. Interaksi antara dosen dan mahasiswa umumnya mengandalkan aplikasi pesan instan (WhatsApp) atau surat elektronik (e-mail) tanpa adanya sistem terpusat.
Dampak ketidakefisienan manajemen tugas akhir terbukti bersifat sistemik dan lintas angkatan. Validasi masalah dalam penelitian ini dilakukan melalui observasi, wawancara, dan penyebaran kuesioner. Observasi awal dilakukan pada mahasiswa angkatan 2021 yang belum lulus tepat waktu pada semester 8 sehingga harus menambah masa studi hingga semester 9. Temuan tersebut kemudian diperkuat melalui wawancara dengan beberapa mahasiswa tingkat atas yang menunjukkan bahwa keterlambatan penyelesaian tugas akhir cenderung berkaitan dengan proses bimbingan. Untuk mendukung temuan awal tersebut, peneliti juga menyebarkan kuesioner kepada 15 mahasiswa tingkat atas di lingkungan Fakultas Teknologi Informasi (FTIN) dan 7 mahasiswa aktif sistem informasi angkatan 2022 pada semester 7 yang sedang mengambil tugas akhir.
Hasil kuesioner menunjukkan bahwa permasalahan bimbingan tugas akhir masih terjadi secara nyata. Pada kelompok mahasiswa tingkat atas, 53,3% responden mengalami kendala dalam validasi versi dokumen revisi karena arsip perbaikan tertimbun dalam riwayat percakapan. Pada mahasiswa aktif angkatan 2022, 100% responden masih menggunakan WhatsApp sebagai media utama bimbingan, sedangkan 71,4% responden mengaku kesulitan memantau progres bimbingan karena belum adanya sistem pelacakan yang terstruktur. Temuan ini menunjukkan bahwa permasalahan utama tidak hanya terletak pada komunikasi bimbingan, tetapi juga pada pengelolaan dokumen revisi dan pemantauan progres yang belum terintegrasi.

Gambar 1.1 Distribusi Penggunaan Media Komunikasi Bimbingan


Gambar 1.2 Analisis Kendala Dokumentasi dan Monitoring Mahasiswa

Selain dari perspektif mahasiswa, kendala juga dialami oleh dosen pembimbing. Hasil wawancara dengan Ketua Program Studi Sistem Informasi menunjukkan bahwa ITEBA belum memiliki sistem bimbingan tugas akhir yang terpusat. Kondisi ini diperkuat oleh hasil kuesioner terhadap 6 dosen Prodi Sistem Informasi, di mana rata-rata dosen membimbing 8â€“10 mahasiswa per semester. Dengan metode manual, dosen masih kesulitan memantau progres mahasiswa secara kolektif karena belum tersedia dashboard terpusat dengan skor mean 3,83. Dosen juga harus menelusuri riwayat pesan satu per satu untuk memeriksa status revisi, yang berdampak pada kurang efisiennya pengelolaan file dan membebani penyimpanan perangkat dengan skor mean 4,17. Tingginya inefisiensi tersebut mendorong kebutuhan terhadap fitur pelacakan revisi otomatis dengan skor mean 4,83. Kondisi ini menunjukkan bahwa proses bimbingan belum berjalan secara terstruktur dan terdokumentasi, padahal SOP Tugas Akhir ITEBA menegaskan bahwa pembimbingan harus berlangsung secara terstruktur dan tercatat.

Gambar 1. 3 Analisis Urgensi Fitur Berdasarkan Perspektif Dosen

Kelemahan utama dalam bimbingan manual adalah ketidakteraturan alur komunikasi dan dokumentasi. Untuk mengatasi hal ini, diperlukan media komunikasi terpusat yang terintegrasi langsung dengan dokumen skripsi. Sistem yang diusulkan akan menyediakan fitur Komentar Interaktif pada setiap halaman revisi, sehingga umpan balik dosen terekam secara kontekstual. Selain aspek komunikasi, integritas dokumen juga menjadi prioritas. Penerapan konsep Version Control System (VCS) akan memastikan setiap draf revisi tersimpan rapi sebagai versi yang berbeda (V1, V2, dst), memudahkan dosen melacak progres perbaikan mahasiswa (Soplanit dkk., 2023).
Sejumlah penelitian terbaru telah menawarkan solusi melalui pengembangan sistem Monitoring berbasis Web. Setiawan dkk. (2024) membuktikan bahwa rancang bangun sistem Monitoring bimbingan menggunakan teknologi modern seperti ReactJS mampu mengefisienkan komunikasi dosen-mahasiswa dan mempermudah pemantauan progres. Namun, mayoritas sistem yang ada saat ini masih berfokus pada fungsi penyimpanan dokumen semata, tanpa memperhatikan aspek integritas riwayat perubahan (versioning) dan responsivitas komunikasi yang kontekstual.
Guna meningkatkan kedisiplinan, sistem ini juga dilengkapi dengan Notifikasi Otomatis (WhatsApp Gateway) yang berfungsi sebagai pengingat Real-time untuk setiap aktivitas bimbingan (Waton dkk., 2025). Berdasarkan permasalahan tersebut, penelitian ini bertujuan untuk merancang dan membangun Sistem Manajemen Tugas Akhir Terintegrasi Berbasis Web untuk optimalisasi proses bimbingan. Sistem yang diusulkan difokuskan pada tiga aspek utama, yaitu manajemen bimbingan, pengelolaan riwayat revisi dokumen melalui version control, dan monitoring progres bimbingan. Selain itu, sistem juga dilengkapi dengan notifikasi otomatis sebagai fitur pendukung untuk membantu pengingat aktivitas bimbingan. Sistem akan dikembangkan menggunakan metode prototyping agar antarmuka yang dibangun sesuai dengan kebutuhan interaksi dosen dan mahasiswa di ITEBA.

Rumusan Masalah
Berdasarkan latar belakang di atas, rumusan masalah yang diangkat dalam penelitian ini adalah :
Bagaimana merancang dan membangun Sistem Manajemen Tugas Akhir Terintegrasi berbasis web untuk mendukung proses bimbingan pada Program Studi Sistem Informasi di Fakultas Teknologi Informasi ITEBA?
Bagaimana menerapkan fitur version control pada sistem untuk mengelola riwayat revisi dokumen tugas akhir agar terdokumentasi dengan baik dan mudah dilacak?
Bagaimana notifikasi otomatis dapat mendukung monitoring progres bimbingan tugas akhir pada Program Studi Sistem Informasi di Fakultas Teknologi Informasi ITEBA?

Batasan Masalah
Sistem Manajemen Tugas Akhir Terintegrasi ini diimplementasikan secara khusus pada lingkup Program Studi Sistem Informasi di Fakultas Teknologi Informasi ITEBA dan Pengguna sistem dibatasi pada tiga peran utama, yaitu Administrator (Koordinator Tugas Akhir), Dosen Pembimbing, dan Mahasiswa tingkat akhir Program Studi Sistem Informasi.
Fitur utama sistem difokuskan pada manajemen bimbingan, pengelolaan riwayat revisi dokumen melalui version control, dan monitoring progres bimbingan, dengan notifikasi otomatis sebagai fitur pendukung.
Sistem yang dibangun merupakan prototype berbasis web yang berdiri sendiri, sedangkan integrasi dengan SIAKAD ITEBA hanya bersifat simulasi data untuk kebutuhan pengujian.

Hipotesa
H0 : Tidak terdapat peningkatan efektivitas proses bimbingan tugas akhir setelah menggunakan sistem informasi manajemen tugas akhir berbasis web, yang ditunjukkan melalui fitur sistem, pengelolaan revisi, nilai System Usability Scale (SUS), serta monitoring dibandingkan metode manual.
H1 :Terdapat peningkatan efektivitas proses bimbingan tugas akhir setelah menggunakan sistem informasi manajemen tugas akhir berbasis web, yang ditunjukkan melalui dukungan fitur sistem, pengelolaan revisi menggunakan version control, pencapaian nilai System Usability Scale (SUS) â‰¥ 70, serta peningkatan keteraturan monitoring dibandingkan metode manual.

Tujuan dan Manfaat
1.5.1 Tujuan Penelitian:
Menghasilkan rancang bangun Sistem Manajemen Tugas Akhir Terintegrasi berbasis web yang mendukung proses bimbingan pada Program Studi Sistem Informasi di Fakultas Teknologi Informasi ITEBA.
Menerapkan fitur version control untuk mengelola riwayat revisi dokumen tugas akhir secara terstruktur dan mudah dilacak.
Menghasilkan sistem yang mendukung monitoring progres bimbingan melalui notifikasi otomatis serta memiliki tingkat kelayakan penggunaan dengan nilai SUS minimal 70.
1.5.2 Manfaat Penelitian:
Bagi Mahasiswa: penelitian ini memberikan kemudahan dalam mengunggah dokumen bimbingan, menelusuri riwayat revisi, dan memantau progres tugas akhir secara lebih terstruktur.
Bagi Dosen Pembimbing: sistem yang dikembangkan diharapkan dapat membantu memantau progres mahasiswa secara terpusat, memberikan umpan balik dengan lebih efektif, serta menelusuri riwayat revisi tanpa harus mencari pada riwayat percakapan.
Bagi Institusi (ITEBA): penelitian ini dapat menjadi sarana pendukung pengelolaan data bimbingan tugas akhir yang lebih terstruktur guna meningkatkan mutu layanan akademik.


Sistematika Penulisan
Sistematika Penulis laporan tugas akhir ini disusun sebagai berikut :
BAB I â€“ Pendahuluan
Menjelaskan latar belakang, perumusan masalah, tujuan, batasan masalah dan indikator keberhasilan sistem, serta sistematika penulisan yang akan diikuti dalam penelitian ini.

BAB II â€“ Tinjauan Pustaka
Berisi teori-teori yang mendukung penelitian, hasil penelitian terdahulu, serta konsep dasar pengembangan sistem informasi bimbingan skripsi.
BAB III â€“ Metodologi Penelitian
Menjelaskan metode penelitian yang digunakan, termasuk tahapan pengumpulan data, analisis kebutuhan, perancangan sistem, dan pengujian prototipe.
BAB IV â€“ Analisis dan Perancangan Membahas analisis sistem yang sedang berjalan dan sistem yang diusulkan, analisis kebutuhan sistem, serta tahapan perancangan yang meliputi desain antarmuka, struktur basis data, dan Flowchart sistem.
BAB V â€“ Hasil dan Implementasi Menguraikan hasil perancangan sistem yang telah dibangun, proses pengujian sistem, serta implementasi akhir dari sistem informasi manajemen tugas akhir.
BAB VI â€“ Kesimpulan dan Saran Menjabarkan kesimpulan yang diperoleh dari hasil penelitian dan memberikan saran-saran untuk pengembangan sistem pada penelitian selanjutnya.


BAB II
TINJAUAN PUSTAKA

Teori Utama
Sistem
Secara fundamental, sistem didefinisikan sebagai entitas yang terdiri dari sekumpulan komponen atau elemen yang saling terintegrasi dan berinteraksi dalam suatu batasan lingkungan untuk mencapai tujuan spesifik. Literatur terkini menyepakati bahwa esensi dari sebuah sistem adalah sinergi antar-bagian meliputi perangkat keras, perangkat lunak, dan pengguna yang bekerja secara harmonis untuk memproses masukan (Input) menjadi luaran (Output) yang bernilai guna (Nabila & Jananto, 2025; Pratiwi dkk., 2023; Andrianto & Suyatno, 2024).
Di sisi lain, terdapat perspektif berbeda yang lebih menekankan pada aspek prosedural dibandingkan komponen fisik. Menurut Valentine (2024) serta Safira Armah (2024) sistem dipandang sebagai suatu jaringan kerja dari prosedur-prosedur yang saling berhubungan, berkumpul bersama-sama untuk melakukan suatu kegiatan atau menyelesaikan sasaran tertentu.
Mengacu pada definisi di atas, sistem dalam konteks penelitian ini dipahami sebagai kesatuan integratif antara aplikasi Web (perangkat lunak), infrastruktur Server (perangkat keras), serta dosen dan mahasiswa (pengguna) yang berinteraksi dalam prosedur bimbingan tugas akhir.
Informasi
Secara konseptual, informasi didefinisikan sebagai hasil transformasi data mentah yang telah melalui proses klasifikasi dan interpretasi sehingga memiliki makna strategis bagi penggunanya. Kualitas pengorganisasian data ini menjadi faktor fundamental yang menentukan akurasi pengambilan keputusan manajerial dalam suatu organisasi (Aliazas dkk., 2024; Prasetyo dkk., 2024).
Selain aspek pengolahan, efektivitas informasi juga sangat bergantung pada mekanisme penyajiannya. Data yang dikelola dan disajikan dalam format yang terstruktur secara logis terbukti lebih mudah dipahami, sehingga mampu mendukung kelancaran aktivitas operasional harian secara optimal dan meminimalisir ambiguitas (Pulungan dkk., 2023; Sanjaya & Saputra, 2023).
Dalam penelitian ini, konsep informasi difokuskan pada penyajian status revisi, komentar dosen, dan jadwal bimbingan secara transparan dan Real-time untuk mencegah kesalahan komunikasi yang sering terjadi pada metode bimbingan konvensional.
Manajemen
Dalam perspektif organisasi modern, manajemen dipandang sebagai mekanisme vital untuk mengorkestrasi sumber daya manusia dan teknis guna mencapai sasaran strategis secara efektif dan efisien. Literatur terkini menegaskan bahwa manajemen yang efektif tidak sekadar bersifat administratif, melainkan melibatkan transformasi pola kerja dan pengendalian holistik terhadap perencanaan agar selaras dengan visi institusi (Galuh Ajeng Fildzah Amalia dkk., 2024; Nizamuddin Silmi dkk., 2024).
Operasionalisasi manajemen bertumpu pada siklus fungsi fundamental yang dikenal sebagai POAC (Planning, Organizing, Actuating, Controlling). Penerapan siklus ini secara disiplin mulai dari perencanaan target, pengorganisasian sumber daya, pelaksanaan teknis, hingga pengawasan mutu terbukti menjadi determinan utama dalam menjamin kelancaran layanan publik dan kepatuhan terhadap standar operasional (Asni dkk., 2023).
Mengacu pada prinsip tersebut, penelitian ini mengadopsi fungsi manajemen untuk merestrukturisasi tata kelola tugas akhir di ITEBA. Fokus utamanya adalah menata alur Plotting pembimbing (pengorganisasian) dan memantau kepatuhan jadwal revisi (pengawasan) dalam satu platform terpadu.

Sistem Informasi
Sistem informasi merupakan kombinasi terstruktur antara teknologi dan aktivitas manusia. Christoval dkk. (2025) mendefinisikan sistem informasi sebagai alat strategis yang mengumpulkan, memproses, menyimpan, dan mendistribusikan informasi. Definisi serupa dikemukakan oleh Soplanit dkk. (2023) yang menyoroti peran sistem informasi dalam menjaga integritas data dokumen penting untuk mendukung pengambilan keputusan dan kontrol dalam organisasi.
Di lingkungan akademik, urgensi sistem informasi semakin meningkat. Penelitian Kurozy dkk. (2025) membuktikan bahwa implementasi sistem informasi berbasis Web dengan metode Prototype mampu mempercepat alur administrasi dan memusatkan data yang sebelumnya tersebar, sehingga meminimalkan risiko human Error.
Dapat disimpulkan bahwa sistem informasi bimbingan skripsi yang dibangun bukan sekadar alat administrasi, melainkan solusi strategis untuk meningkatkan efisiensi Monitoring dan transparansi proses akademik di Fakultas Teknologi Informasi.
Sistem Informasi Manajemen (SIM)
Sistem Informasi Manajemen (SIM) dimaknai sebagai sistem terpadu yang dirancang khusus untuk menyajikan informasi bagi kebutuhan manajerial guna mengendalikan aktivitas organisasi. Fungsi utamanya adalah mengintegrasikan proses bisnis internal yang kompleks menjadi satu pangkalan data yang komprehensif, sehingga manajemen dapat melihat gambaran besar (big picture) kinerja organisasi secara cepat dan akurat (Christoval dkk., 2025; Safira Armah & Rayyan Firdaus, 2024).
Dalam ranah akademik, SIM memiliki peran spesifik yang lebih dalam dibandingkan sistem pemrosesan data biasa. SIM dituntut mampu menangani logika bisnis yang unik, seperti analisis beban kerja dosen, rasio kelulusan mahasiswa tepat waktu, dan kepatuhan terhadap standar prosedur, yang memerlukan kemampuan analisis data untuk mendukung kebijakan pimpinan prodi (Hany Maria Valentine dkk., 2024; Nabila & Jananto, 2025).
Berdasarkan pemahaman tersebut, penelitian ini membangun SIM yang bertujuan memberikan kendali penuh kepada Program Studi di ITEBA untuk memantau siklus hidup tugas akhir secara end-to-end, mulai dari proses pengajuan judul hingga pelaksanaan yudisium.
Tugas Akhir
Tugas akhir merupakan salah satu bentuk pembelajaran dan evaluasi akademik pada pendidikan tinggi yang digunakan untuk memastikan ketercapaian kompetensi lulusan. Pada program sarjana atau sarjana terapan, tugas akhir dapat berbentuk skripsi, prototipe, proyek, atau bentuk lain yang sejenis, baik secara individu maupun berkelompok (Kementerian Pendidikan, Kebudayaan, Riset, dan Teknologi, 2023).
Menurut Standar operasional prosedur (SOP) di Institut Teknologi Batam (2022), Tugas akhir juga dipahami sebagai karya tulis ilmiah yang merupakan aplikasi dari seluruh kompetensi mahasiswa yang diperoleh selama perkuliahan. Dalam proses penelitian dan penyusunannya, mahasiswa dibimbing oleh dosen pembimbing agar mampu menghasilkan karya ilmiah yang berkualitas, tepat waktu, dan dapat dipertanggungjawabkan secara ilmia.
Dalam penelitian ini, tugas akhir dipahami tidak hanya sebagai hasil akhir berupa karya ilmiah, tetapi juga sebagai proses akademik yang memerlukan pengelolaan bimbingan, dokumentasi revisi, dan pemantauan progres secara terstruktur. Oleh karena itu, sistem yang dikembangkan diarahkan untuk mendukung proses bimbingan tugas akhir agar lebih terdokumentasi, terpusat, dan mudah dipantau oleh dosen maupun mahasiswa.
Komunikasi Akademik Daring
Komunikasi akademik daring adalah proses pertukaran informasi pembelajaran yang dimediasi oleh teknologi internet. Nugraha (2022) menjelaskan bahwa dalam konteks bimbingan skripsi, komunikasi daring memberikan fleksibilitas waktu (asynchronous), memungkinkan mahasiswa melaporkan progres tanpa terbatas jam kerja kantor dan lokasi fisik.
Meskipun fleksibel, komunikasi daring membutuhkan wadah khusus agar tetap formal dan terdokumentasi. (Waton dkk., 2025) menegaskan perlunya sistem yang terintegrasi dengan notifikasi otomatis untuk mencegah informasi revisi yang tercecer di aplikasi pesan instan pribadi dan memastikan mahasiswa selalu ingat dengan tenggat waktu bimbingan.
Fitur komunikasi daring dalam sistem ini dirancang tidak untuk menggantikan tatap muka sepenuhnya, melainkan untuk memastikan setiap umpan balik dosen terdokumentasi dalam Database yang aman dan mudah ditelusuri kembali.
Dokumentasi dan Version Control
Dokumentasi merupakan elemen vital dalam tata kelola akademik untuk menjamin keamanan arsip dan kemudahan penelusuran kembali data. Aliazas dkk. (2024) menekankan bahwa pengelolaan dokumen elektronik yang efektif di perguruan tinggi harus didukung oleh sistem yang mampu melacak riwayat penyimpanan dan perubahan data (Tracking) guna memastikan integritas arsip dari risiko duplikasi atau kehilangan.
Dalam konteks pengerjaan skripsi, konsep ini diterjemahkan secara teknis melalui penerapan Version Control System (VCS). Menurut Soplanit dkk. (2023)  VCS memungkinkan dosen dan mahasiswa untuk melacak setiap revisi secara detail, termasuk siapa yang mengubah dan kapan perubahan dilakukan. Hal ini sejalan dengan temuan OrbÃ¡n (2023) yang menyatakan bahwa transparansi penilaian akademik meningkat signifikan ketika riwayat evolusi dokumen dapat diakses secara transparan.
Konsep ini diadopsi ke dalam fitur sistem, di mana setiap kali mahasiswa mengunggah perbaikan, sistem akan otomatis menyimpannya sebagai "versi baru" tanpa menimpa fail lama. Hal ini memungkinkan perbandingan progres revisi dilakukan secara akurat.
Electronic Document Management System (EDMS)
Electronic Document Management System (EDMS) merupakan sistem berbasis digital yang dirancang untuk menyimpan, mengelola, dan melacak dokumen secara terpusat. Menurut Aliazas dkk. (2024) penerapan EDMS membantu organisasi meningkatkan efisiensi operasional melalui pengarsipan digital, kontrol versi dokumen, serta mekanisme keamanan akses berbasis peran (role-based access Control).
Keunggulan sistem ini juga relevan dalam pengelolaan arsip akademik. Yulius & Susetyo (2023) menjelaskan bahwa aplikasi manajemen dokumen berbasis digital mampu mengatasi kendala penyimpanan fisik yang rentan rusak atau hilang, sekaligus mempercepat proses pencarian kembali data (retrieval) saat dibutuhkan.
Oleh karena itu, konsep EDMS diintegrasikan ke dalam sistem ini untuk mengatur alur unggahan fail skripsi. Sistem dirancang agar setiap draf revisi tersimpan aman dengan penanda waktu (timestamp) yang valid, memastikan bahwa riwayat perkembangan skripsi mahasiswa terekam secara utuh dan transparan.
Dashboard dan Monitoring Sistem
Dashboard adalah antarmuka visual yang menyajikan ringkasan data penting dalam satu tampilan terpusat untuk membantu pengambilan keputusan yang cepat. Azis (2025) menjelaskan bahwa dalam konteks sistem akademik, Dashboard berfungsi memvisualisasikan data perkembangan siswa secara Real-time, sehingga memudahkan pengajar dalam melakukan evaluasi kinerja tanpa harus mengolah data mentah secara manual.
Efektivitas fitur ini diperkuat oleh penelitian Nabila & Jananto (2025), yang menunjukkan bahwa penggunaan Dashboard Monitoring berbasis Web mampu meningkatkan akurasi pemantauan akademik. Informasi yang disajikan secara grafis (seperti diagram batang atau lingkaran) terbukti lebih mudah dipahami oleh pengambil keputusan dibandingkan laporan berbasis teks konvensional.
Dengan melakukan perancangan Dashboard khusus untuk Dosen Pembimbing yang menampilkan statistik mahasiswa bimbingan, status revisi terakhir, serta notifikasi tenggat waktu. Hal ini bertujuan agar dosen dapat dengan mudah memprioritaskan mahasiswa yang membutuhkan perhatian khusus.
Sistem Notifikasi Otomatis
Sistem notifikasi otomatis berfungsi memberikan peringatan Real-time kepada pengguna terkait aktivitas sistem yang memerlukan perhatian segera. Sulistiawan dkk. (2025) menyatakan bahwa implementasi fitur notifikasi, seperti penggunaan WhatsApp Gateway, terbukti efektif meningkatkan transparansi dan kecepatan respon pengguna dalam sebuah sistem informasi pelayanan.
Relevansi fitur ini dalam konteks akademik diperkuat oleh penelitian (Waton dkk., 2025), yang menemukan bahwa integrasi notifikasi otomatis pada sistem bimbingan tugas akhir secara signifikan meningkatkan kedisiplinan mahasiswa terhadap jadwal bimbingan, karena pesan pengingat langsung masuk ke perangkat pribadi mereka tanpa perlu membuka aplikasi secara berkala.
Fitur ini diterapkan dalam sistem untuk memberikan peringatan dini kepada mahasiswa mengenai tenggat waktu revisi dan memberitahu dosen saat ada pengajuan baru. Tujuannya adalah mencegah kemacetan komunikasi yang sering terjadi pada metode manual akibat pesan yang tertumpuk atau terlewat.
Website
Secara fundamental, Website didefinisikan sebagai kumpulan halaman digital yang saling terhubung dalam jaringan internet untuk menyajikan informasi multimedia yang dapat diakses secara global. Inti dari teknologi ini adalah kemampuannya memfasilitasi pertukaran data antara Server dan pengguna melalui peramban (Browser) tanpa batasan waktu dan geografis (Nur dkk., 2023; Salmi & Darmatasia, 2023; Yarpriransa dkk., 2023).
Dalam perkembangannya, arsitektur Website telah berevolusi dari sekadar halaman statis menjadi Aplikasi Web (WebApps) dinamis yang mampu menangani logika bisnis kompleks (Lazuardy & Anggraini, 2022). Transformasi ini dinilai krusial untuk kebutuhan akademik modern karena memungkinkan interaksi dua arah yang responsif antara dosen dan mahasiswa, bukan hanya sekadar menampilkan pengumuman satu arah (Nugraha, 2022).
Oleh karena itu, Website dalam penelitian ini dipahami sebagai platform aplikasi berbasis jaringan yang fleksibel, memungkinkan pengelolaan administrasi tugas akhir dilakukan secara terpusat dan Real-time tanpa memerlukan instalasi khusus di sisi pengguna.
Basis Data
Secara umum, basis data merupakan suatu sistem yang berfungsi sebagai gudang data. Basis data menyimpan sekumpulan data berdasarkan ketentuan tertentu dan saling berkaitan, sehingga dapat mendukung proses penyimpanan, pengelolaan, perubahan, pembaruan, dan pemulihan data secara lebih efisien (Annisa Rahmawita dkk., 2023).
Dalam kajian lain, basis data diartikan sebagai sekumpulan data yang terintegrasi dan dirancang agar dapat menyediakan data yang dibutuhkan oleh organisasi atau sistem. Basis data yang disusun secara terstruktur akan membantu mengurangi redundansi, meningkatkan efisiensi, dan mendukung pengelolaan data yang lebih baik (Rafianto & Voutama, 2025)
Dalam penelitian ini, basis data digunakan untuk menyimpan data bimbingan, dokumen revisi, riwayat perubahan, dan progres mahasiswa secara terpusat. Dengan demikian, basis data mendukung proses bimbingan agar lebih terstruktur dan mudah dipantau.
.
Unified Modeling Language (UML)
Unified Modeling Language (UML) adalah bahasa standar yang digunakan untuk memodelkan perangkat lunak. Menurut Anardani dkk. (2023), UML berfungsi sebagai alat vital dalam tahap perancangan untuk membentuk gambaran konseptual tentang struktur sistem yang akan dibangun, sehingga pengembangan sistem informasi memiliki desain yang baik dan terstruktur sebelum masuk ke tahap implementasi.


Menurut Sulistiawan dkk. (2025), UML terdiri dari beberapa diagram utama yang umum digunakan dalam perancangan sistem, antara lain:
Use Case Diagram â€“ menggambarkan hubungan antara aktor (pengguna) dan fungsi sistem.
Tabel 2.1 Usecase Diagram
Simbol
Keterangan


Aktor : Tokoh atau orang yang berinteraksi dengan sistem dan mampu menerima sekaligus memberi informasi dari sistem.


Use Case : Fungsi dari sistem yang dirancang sehingga pengguna dapat mengetahui dari setiap kegunaan sistem yang dibangun.


Asosiasi: Garis yang menghubungkan Use Case dengan aktor.


Generalisasi: Hubungan antara Use Case dengan aktor dengan makna secara khusus atau umum.


Include :Pemanggilan Use Case oleh Use Case dalam sebuah sistem.


Extend :Penambahan Use Case yang dapat berdiri sendiri, sesuai ketentuan yang terpenuhi.

Sumber : decoding


Activity Diagram â€“ menjelaskan alur kerja dari suatu proses dalam sistem.
Tabel 2.2 Activity Diagram
Simbol
Keterangan


Activity : Kegiatan atau langkah operasional yang terjadi dalam proses.


Decision Node : Titik percabangan untuk menentukan alur proses berdasarkan kondisi tertentu.


Initial Node : Menunjukkan titik mulai dari seluruh rangkaian aktivitas.


Activity Final Node : Titik akhir yang menandakan seluruh proses telah selesai.


Fork Node : Memecah atau menggabungkan beberapa aliran aktivitas yang berjalan paralel.


Swimlane :Pembagi area yang menunjukkan peran atau pihak yang bertanggung jawab dalam alur aktivitas.

Sumber :dicoding

Sequence Diagram â€“ menggambarkan interaksi antar objek berdasarkan urutan waktu.
Tabel 2.3 Sequence Diagram
Simbol
Keterangan


Aktor : Entitas eksternal, baik berupa pengguna manusia maupun sistem lain, yang berinteraksi langsung dengan sistem.


Activation Box : Representasi periode aktif di mana sebuah objek sedang melakukan pemrosesan tugas atau menunggu respons. Durasi waktu digambarkan secara vertikal.


Lifeline : Garis vertikal yang memvisualisasikan keberadaan dan rentang hidup sebuah objek atau partisipan selama interaksi berlangsung.


Objek : Representasi instansi dari sebuah kelas yang berpartisipasi dan memiliki peran spesifik dalam skenario sistem.


Message : Komunikasi antar objek yang mentransfer informasi atau memicu operasi tertentu dari satu lifeline ke lifeline lainnya.

Sumber : dicoding

Class Diagram â€“ memperlihatkan struktur kelas dan relasi antar entitas dalam sistem.
Tabel 2.4 Class Diagram
Simbol
Deskripsi


Class : Kumpulan objek dengan atribut dan operasi serupa; terdiri dari nama kelas, atribut, dan operasi..


Association : Hubungan statis antar kelas untuk memungkinkan pertukaran data.


Generalization : Relasi pewarisan di mana sub-kelas mewarisi sifat dan perilaku dari super-kelas.


Dependency : Ketergantungan di mana perubahan pada satu kelas dapat memengaruhi kelas lain yang menggunakannya.


Aggregation : Hubungan part-of yang longgar; objek bagian tetap ada meski objek induk dihapus.


Composition : Agregasi kuat, objek bagian bergantung penuh pada objek induk dan musnah bersamanya.

Sumber : dicoding

Dalam sistem bimbingan skripsi berbasis Web, UML digunakan untuk menggambarkan relasi antara aktor seperti mahasiswa dan dosen, alur revisi, serta proses komunikasi data antara Frontend ReactJS dan Backend Node.js. Penggunaan UML memastikan desain sistem terarah dan meminimalkan miskomunikasi dalam pengembangan perangkat lunak.

Gambar 2.1 Logo UML (Sumber : Wikipedia)
Metode Prototyping
Metode Prototyping adalah model pengembangan sistem yang dilakukan dengan membangun purwarupa awal sistem, kemudian dievaluasi dan disempurnakan berdasarkan umpan balik pengguna hingga diperoleh bentuk sistem yang sesuai kebutuhan. Kurozy dkk (2025) menjelaskan bahwa metode ini merupakan penerapan praktis dari siklus hidup pengembangan sistem yang dimodifikasi untuk kebutuhan yang dinamis, sehingga risiko kegagalan akibat ketidaksesuaian spesifikasi dapat diminimalkan.
Keunggulan metode ini ditegaskan oleh Alfahri & Nisa (2025), yang menyatakan bahwa penerapan metode prototyping dapat meningkatkan kepuasan pengguna karena pengguna dilibatkan secara langsung dalam proses evaluasi sistem. Dalam konteks sistem bimbingan tugas akhir, Christoval dkk. (2025) menambahkan bahwa prototyping memungkinkan pengembang membangun model sistem secara bertahap, sehingga fitur-fitur utama seperti unggah revisi, pemberian umpan balik, dan pemantauan progres dapat diuji kelayakannya sebelum sistem dikembangkan secara penuh.
Menurut Mallu dkk. (2023), model pengembangan prototyping merupakan rangkaian aktivitas sistematis guna menghasilkan produk berkualitas. Tahapan metode tersebut dalam penelitian ini dijabarkan sebagai berikut:
Analisis kebutuhan, Tahap ini melibatkan pemahaman mendalam mengenai kebutuhan pengguna dan persyaratan sistem yang akan dibangun. Proses ini mencakup identifikasi tujuan utama perangkat lunak, pemodelan alur kerja, serta pengumpulan informasi mendasar untuk menentukan arah pengembangan.
Desain prototype, langkah awal yang dilakukan pengembang untuk merancang spesifikasi perangkat lunak sesuai keinginan pelanggan. Tahapan ini bertujuan untuk memberikan gambaran visual atau fungsional awal agar kebutuhan sistem dapat didefinisikan secara jelas.
Evaluasi prototype, Tim pengembang melakukan komunikasi intensif dengan pengguna untuk mencatat dan memvalidasi setiap kebutuhan yang telah dituangkan dalam rancangan. Validasi ini berfungsi untuk meminimalkan risiko ketidaksesuaian fungsional sebelum sistem masuk ke tahap teknis yang lebih kompleks.
Mengkodekan Sistem, Tahap pengkodean melibatkan proses penerjemahan hasil dokumen desain ke dalam baris-baris kode menggunakan bahasa pemrograman tertentu. Tujuannya adalah untuk mengubah spesifikasi yang telah disepakati menjadi sebuah sistem fungsional yang dapat dibaca oleh komputer.
Pengujian Sistem, Proses evaluasi yang krusial untuk mendeteksi adanya cacat (defects) atau masalah teknis sebelum software dirilis. Hal ini mencakup pemeriksaan fungsi dan kinerja sistem guna memastikan jaminan kualitas bagi pengguna akhir.
Evaluasi sistem, Untuk memastikan kualitas produk, terutama terkait ketersediaan fungsi yang diinginkan dan minimnya kesalahan (bug). Kualitas sistem diukur berdasarkan tingkat kepuasan pelanggan dan kesesuaian atribut fungsional terhadap ekspektasi pengguna (User).
Implementasi sistem, Setelah melalui tahap pengujian dan evaluasi, perangkat lunak dinyatakan sebagai produk siap pakai yang mampu memberikan dukungan operasional bagi pengguna. Selanjutnya, sistem masuk ke tahap pemeliharaan untuk menjaga relevansi fungsionalitasnya terhadap kebutuhan pelanggan dalam jangka waktu panjang.
Pemilihan metode ini didasarkan pada kebutuhan agar purwarupa sistem bimbingan tugas akhir dapat diuji lebih awal oleh pihak program studi. Dengan demikian, masukan dosen dan mahasiswa terhadap alur bimbingan, pengelolaan revisi, dan monitoring progres dapat segera diakomodasi sebelum sistem masuk ke tahap pengembangan akhir.


Gambar 2.2 Model Pengembangan Prototype ( Sumber:Dicoding )
Pengujian Black-Box
Black Box Testing adalah metode pengujian perangkat lunak yang berfokus pada fungsionalitas sistem tanpa melihat struktur kode internalnya. Kartono dkk. (2024) menjelaskan bahwa metode ini dipilih karena kemampuannya untuk mengevaluasi sistem dengan berfokus pada Input dan Output yang diberikan pengguna, guna mengidentifikasi potensi masalah pada area yang paling rentan tanpa perlu memeriksa kode internal program
Penerapan metode ini dalam sistem berbasis Web sangat efektif. (Christoval dkk., 2025)menggunakan Black Box Testing untuk menguji fitur krusial seperti Login, manajemen data, dan validasi formulir. Hasilnya membuktikan bahwa metode ini mampu mendeteksi kesalahan logika (logic Error) sebelum sistem diserahkan kepada pengguna akhir, Hal serupa ditemukan oleh Wijaya dkk. (2024) yang menyatakan bahwa teknik Equivalence Partitioning dalam Black Box Testing sangat efisien untuk memastikan bahwa sistem dapat menangani berbagai variasi data Input tanpa mengalami kegagalan fungsi (crash). Jenis-jenis pengujian black-box yang umum digunakan meliputi:
Equivalence Partitioning â€“ mengelompokkan data uji ke dalam kelas valid dan invalid untuk memastikan semua kondisi diuji.
Boundary Value Analysis â€“ memeriksa nilai batas (maksimum dan minimum) untuk menghindari kesalahan logika.
Decision Table Testing â€“ menggunakan kombinasi aturan dan kondisi untuk memverifikasi logika keputusan sistem.
Dalam penelitian ini, pengujian Black Box digunakan untuk memvalidasi seluruh fitur fungsional sistem bimbingan skripsi, mulai dari proses autentikasi hingga alur unggah dokumen revisi, guna memastikan sistem berjalan bebas Bug dan siap digunakan.

Gambar 2.3 Blackbox Testing ( Sumber : itbox.id )
System Usability Scale (SUS)
System Usability Scale (SUS) adalah metode pengukuran kegunaan perangkat lunak yang populer karena kesederhanaan dan keakuratannya. Kurozy dkk. (2025) mendefinisikan SUS sebagai instrumen pengujian yang terdiri dari 10 pernyataan dengan skala Likert 1-5, yang dirancang untuk menilai persepsi pengguna terhadap efektivitas, efisiensi, dan kepuasan dalam menggunakan sebuah sistem aplikasi.
Penggunaan SUS sangat relevan untuk mengevaluasi sistem berbasis Web secara objektif. Apsari & Putra (2025) menjelaskan bahwa metode ini mampu memberikan gambaran komprehensif mengenai tingkat penerimaan pengguna (user acceptance) melalui pengukuran aspek kegunaan dan kepuasan secara simultan dalam satu instrumen pengujian. Perhitungan skor SUS dilakukan berdasarkan aturan penilaian pada setiap butir pernyataan,
Tabel 2.5 Perhitungan System Usability Scale (SUS)
Jenis Butir
Nomor Item
Aturan Perhitungan
Pernyataan positif
1, 3, 5, 7, 9
Skor jawaban âˆ’ 1
Pernyataan negatif
2, 4, 6, 8, 10
5 âˆ’ skor jawaban



Rumus perhitungan skor SUS dari 1 responden adalah sebagai berikut:

Keterangan:
R1 sampai R10 merupakan skor jawaban responden pada masing-masing item pernyataan SUS.
SUS rata-rata=Total semua skor SUSJumlah responden
Perhitungan skor SUS dilakukan untuk setiap responden terlebih dahulu, kemudian nilai tersebut dirata-ratakan untuk memperoleh nilai keseluruhan sistem. Interpretasi skor SUS menjadi kunci dalam menentukan kelayakan sistem. (Kurozy dkk., 2025) memaparkan bahwa skor SUS dapat diklasifikasikan ke dalam kategori penerimaan (Acceptability Ranges). Skor di atas rata-rata (68) menunjukkan bahwa sistem dapat diterima dengan baik oleh pengguna, sedangkan skor di bawah itu mengindikasikan perlunya perbaikan mendasar pada desain antarmuka.
Dalam penelitian digunakan metode SUS sebagai alat ukur kuantitatif untuk mengevaluasi tingkat kepuasan dosen dan mahasiswa terhadap sistem bimbingan skripsi yang dibangun. Hasil skor SUS akan menjadi dasar pengambilan keputusan apakah sistem sudah layak diimplementasikan di lingkungan ITEBA atau memerlukan revisi desain.

Teori Pendukung
Visual Studio Code
Visual Studio Code adalah perangkat lunak penyunting kode sumber berbasis teks yang dikembangkan Microsoft untuk memfasilitasi perancangan struktur halaman web secara efektif. (Wilyanto dkk., 2023) menjelaskan bahwa keunggulan aplikasi ini terletak pada antarmuka yang intuitif serta fleksibilitasnya dalam mendukung berbagai bahasa pemrograman. Penggunaan alat ini sangat krusial bagi pengembang untuk meningkatkan produktivitas dalam manajemen proyek digital secara efisien.
Implementasi teknologi ini terbukti andal sebagai lingkungan pengembangan sistem informasi yang kompleks. penggunaan Visual Studio Code mampu meningkatkan efisiensi operasional melalui fitur integrasi alat bantu pengujian dan pratinjau hasil pengkodean secara cepat. Karakteristik ini menjamin proses pengembangan perangkat lunak dapat berjalan dengan tingkat akurasi teknis yang tinggi (Nyoman dkk., 2025)
Visual Studio Code digunakan sebagai alat pendukung untuk menulis, mengelola, menguji, dan memperbaiki kode program. Dengan demikian, proses pengembangan Sistem Manajemen Tugas Akhir berbasis web dapat dilakukan secara lebih efisien dan terstruktur.

Gambar 2.4 Visual Studio Code ( Sumber : code.visualstudio.com)
Framework React
ReactJS adalah pustaka (Library) JavaScript open-source yang dikembangkan oleh Meta untuk membangun antarmuka pengguna yang efisien. Lazuardy & Anggraini. (2022) menjelaskan bahwa keunggulan fundamental React terletak pada mekanisme Virtual DOM yang meminimalkan beban rendering ulang pada peramban, serta arsitektur berbasis komponen (component-based) yang memungkinkan kode program disusun secara modular dan dapat digunakan kembali (reusable).
Penerapan teknologi ini terbukti efektif dalam pengembangan sistem modern. Penelitian (Setiawan dkk., 2024) menunjukkan bahwa penggunaan ReactJS pada sistem Monitoring akademik mampu meningkatkan responsivitas antarmuka secara signifikan, sehingga interaksi pengguna dengan data berjalan lancar tanpa jeda waktu muat yang lama.
Berdasarkan keunggulan teknis tersebut, dipilihnya ReactJS sebagai fondasi antarmuka (Frontend) sistem ini. Kemampuannya dalam menangani pembaruan data secara efisien sangat krusial untuk fitur status bimbingan dan kolom komentar revisi yang membutuhkan interaksi Real-time.

Gambar 2.5 React ( Sumber : React.dev)
Platform Backend Node.js
Node.js adalah lingkungan eksekusi (runtime environment) JavaScript yang berjalan di sisi Server. Andrianto & Suyatno. (2024) menjelaskan bahwa Node.js menjadi fondasi utama untuk pengembangan Server-side aplikasi Web yang efisien dan scalable karena kemampuannya menangani banyak permintaan secara bersamaan.
Keunggulan ini diperkuat oleh Christoval dkk. (2025) yang menyatakan bahwa teknologi Web modern seperti Node.js menjadi fondasi penting dalam membangun sistem informasi yang cepat, aman, dan mampu menangani pertumbuhan data yang dinamis.
Keunggulan utama Node.js adalah scalability, kemampuan menangani ribuan koneksi klien secara paralel, serta kemudahan integrasi dengan API modern. Dalam sistem informasi bimbingan skripsi, Node.js digunakan untuk mengelola permintaan seperti unggahan dokumen revisi, pengiriman pesan antar pengguna, dan notifikasi otomatis dari Server ke pengguna.

Gambar 2.6 NodeJS ( Sumber : NodeJS.org)
Basis Data NoSQL (MongoDB)
MongoDB adalah sistem manajemen basis data NoSQL yang berorientasi dokumen (document-oriented). Andrianto & Suyatno (2024) menjelaskan bahwa MongoDB menyimpan data dalam format BSON (Binary JSON) yang dinamis dan fleksibel. Berbeda dengan basis data relasional yang kaku, MongoDB memungkinkan penyimpanan data yang strukturnya dapat bervariasi dalam satu koleksi, serta menawarkan kinerja yang lebih cepat dalam menangani data tidak terstruktur.
Pemanfaatan MongoDB dalam pengembangan sistem informasi berbasis Web juga terbukti efisien. Penelitian Sanjaya & Saputra (2023), menunjukkan bahwa penggunaan MongoDB sangat efektif untuk menangani manajemen data yang dinamis dan fluktuatif tanpa membebani kinerja Server, menjadikannya solusi penyimpanan yang andal untuk aplikasi modern.
Dengan adanya fleksibilitas MongoDB sangat sesuai untuk kebutuhan sistem ini, khususnya dalam menyimpan metadata revisi skripsi yang kompleks, seperti riwayat komentar, versi PDF, dan log aktivitas bimbingan yang strukturnya dapat berkembang seiring penambahan fitur.

Gambar 2.7 MongoDB ( Sumber : MongoDB.com )
Github
GitHub merupakan platform kolaborasi berbasis cloud yang memanfaatkan sistem kendali versi Git untuk mengelola proyek perangkat lunak secara periodik. Tohamba & Aksara (2026) menekankan bahwa penggunaan platform ini efektif dalam meningkatkan manajemen proyek tim menyiapkan mahasiswa terhadap standar kolaborasi di dunia industri.
Penerapan GitHub mampu meminimalisir kesalahan akibat human error dan menjaga konsistensi rilis aplikasi melalui otomatisasi proses deployment. Integrasi ini menjamin setiap perubahan kode sumber terdokumentasi secara kronologis sehingga alur kerja pengembangan menjadi lebih transparan dan akuntabel (Prayatman dkk., 2026).
GitHub ini digunakan sebagai infrastruktur utama untuk mengelola repositori kode dan dokumen bimbingan secara terintegrasi. Hal ini bertujuan mendukung optimalisasi bimbingan melalui fitur version control yang memudahkan pelacakan riwayat revisi tugas akhir.

Gambar 2.8 Github (Sumber : Github.com)
Vercel Hosting
Vercel adalah platform deployment berbasis cloud yang dioptimalkan untuk pengembang frontend guna mempublikasikan aplikasi web secara instan. Vercel (2026) menjelaskan bahwa keunggulan platform ini terletak pada fitur otomatisasi alur kerja dari pengembangan hingga produksi melalui integrasi repositori Git yang mulus.
Penerapan teknologi ini terbukti efektif dalam menjamin skalabilitas dan kecepatan akses aplikasi web melalui jaringan Edge Network. Penelitian (Maretta Putri dkk., 2026) menunjukkan bahwa penggunaan Vercel mampu mempermudah publikasi media informasi digital dengan performa yang stabil dan keamanan yang terjamin.
Vercel dalam penelitian ini digunakan sebagai infrastruktur hosting untuk mempublikasikan Sistem Manajemen Tugas Akhir agar dapat diakses secara daring oleh dosen dan mahasiswa. Hal ini bertujuan untuk menjamin ketersediaan layanan bimbingan serta mempermudah proses pemantauan progres tugas akhir di lingkungan ITEBA.
Draw.io
Draw.io adalah aplikasi pemodelan visual berbasis web yang digunakan untuk merancang diagram sistem berorientasi objek secara terstruktur. Noneng Marthiawati dkk (2024) menjelaskan bahwa ketersediaan fitur diagram UML yang lengkap pada platform ini sangat krusial dalam mendukung tahapan analisis kebutuhan perangkat lunak agar lebih sistematis.
Pemanfaatan Draw.io terbukti efektif dalam memvisualisasikan alur kerja kompleks melalui diagram alir yang intuitif. Karakteristik ini mampu meningkatkan pemahaman logika sistem secara signifikan serta menjamin dokumentasi rancangan tetap konsisten dan rapi selama proses pengembangan berlangsung (Firdaus dkk., 2025)
Dalam penelitian ini digunakan untuk merancang diagram UML dan alur kerja sistem manajemen tugas akhir. Hal ini bertujuan untuk memberikan gambaran visual yang jelas mengenai interaksi pengguna dan arsitektur sistem agar tahap pengkodean lebih terarah.
Penelitian Terdahulu
Beberapa penelitian terdahulu yang relevan dengan topik pengembangan sistem informasi bimbingan skripsi berbasis Web telah dilakukan oleh berbagai peneliti, baik di tingkat nasional maupun internasional. Penelitian-penelitian tersebut memberikan gambaran umum mengenai metode, teknologi, serta fitur yang dapat diadaptasi dalam sistem yang dikembangkan pada penelitian ini.
Tabel 2.6 Penelitian Terdahulu
Penulis dan Judul
Pembahasan
Persamaan
Perbedaan
Metode
Setiawan, Gunawan, & Tenriawaru (2024). Rancang Bangun Sistem Informasi Monitoring Bimbingan Tugas Akhir Berbasis Web Menggunakan Framework ReactJS
Membahas pengembangan sistem Monitoring tugas akhir yang responsif menggunakan teknologi Frontend modern untuk efisiensi pemantauan.
Sama-sama membangun sistem Monitoring bimbingan berbasis Web dan menggunakan Framework ReactJS.
Penelitian Setiawan menggunakan basis data MySQL, sedangkan penelitian ini menggunakan MongoDB dan menambahkan fitur Version Control.
Prototyping, ReactJS
Kurozy, D. N., Pratama, R. G., & Muhammad, A. E. (2025). Penerapan Metode Prototype Pada Perancangan Sistem Pendaftaran Mahasiswa Baru
Menerapkan metode Prototype untuk menghasilkan sistem administrasi akademik yang sesuai kebutuhan pengguna.
Sama-sama menggunakan metode pengembangan Prototyping untuk memastikan kesesuaian fitur.
Objek penelitian Kurozy adalah pendaftaran mahasiswa, sedangkan penelitian ini adalah Bimbingan Skripsi dengan fitur revisi.
Prototyping, Web System
(Yarpriransa dkk., 2023). Implementasi Metode Scrum pada Pengembangan Aplikasi Bimbingan Skripsi Online
Mengembangkan aplikasi bimbingan Online yang memfasilitasi interaksi chat Feedback dan Monitoring progres antara dosen dan mahasiswa.
Sama-sama fokus pada digitalisasi proses bimbingan skripsi dan fitur komunikasi daring.
Penelitian Yarpriransa menggunakan metode Scrum, sedangkan penelitian ini menggunakan Prototyping. Selain itu, sistem ini dilengkapi fitur Manajemen Versi Dokumen
Scrum, Web-based
Nugraha (2022). Web-Based Thesis Management Information System Design
Merancang sistem informasi manajemen skripsi untuk mempermudah pengarsipan data secara digital dan terstruktur.
Sama-sama bertujuan untuk manajemen pengarsipan dokumen skripsi secara digital.
Penelitian ini melengkapi fitur arsip dengan Notifikasi Otomatis (WhatsApp) dan pelacakan versi revisi.
Prototyping, Laravel
Salmi & Darmatasia (2023). Web-based thesis Management and Monitoring System
Membangun sistem Web untuk memantau siklus bimbingan dan pelaporan progres mahasiswa.
Sama-sama berfokus pada fitur Monitoring progres bimbingan mahasiswa.
Penelitian Salmi menggunakan metode Waterfall yang linear, sedangkan penelitian ini menggunakan Prototyping yang iteratif.
Waterfall, Web-based
Christoval dkk., (2025). Implementasi Sistem Informasi Perpustakaan Untuk GBI Antiokhia Berbasis Web Menggunakan Framework Adonis JS Pada Node JS Menggunakan Metode Prototype
Mengimplementasikan sistem informasi yang cepat dan aman menggunakan teknologi Backend berbasis Node.js.
Sama-sama menggunakan teknologi Node.js untuk performa Backend yang tinggi.
Objek penelitian Christoval adalah Perpustakaan, sedangkan penelitian ini diterapkan pada Bimbingan Skripsi.
Prototyping, Node.js
Soplanit dkk. (2023). Penerapan Version Control System Berbasis Web Menggunakan Next. JS, Nest. JS, Node. JS, dan MongoDB Pada Proses Pengerjaan Skripsi Mahasiswa
Menerapkan teknologi VCS untuk melacak perubahan dokumen skripsi agar riwayat pengerjaan mahasiswa terekam jelas.
Sama-sama menerapkan konsep Version Control System (VCS) pada dokumen skripsi.
Penelitian Soplanit fokus pada aspek teknis VCS, sedangkan penelitian ini mengintegrasikannya ke dalam Sistem Bimbingan Utuh dengan notifikasi.
VCS, Node.js
Waton, Weking, & Deta (2025). Penerapan API WhatsApp Fonnte Untuk Sistem Pengingat Jadwal Bimbingan Tugas Akhir Mahasiswa Berbasis Web
Menerapkan notifikasi otomatis via WhatsApp Gateway untuk meningkatkan kedisiplinan jadwal bimbingan.
Sama-sama mengimplementasikan fitur Notifikasi Otomatis untuk pengingat jadwal.
Penelitian Waton hanya fokus pada sistem pengingat, sedangkan penelitian ini menggabungkannya dengan manajemen revisi dokumen.
API Gateway, Web
Azis (2025). Rancangan Sistem Monitoring Siswa Berbasis Web Dengan Metode Waterfall
Membuat Dashboard visual untuk memantau perkembangan siswa secara Real-time.
Sama-sama menyediakan fitur Dashboard Monitoring visual.
Penelitian Azis menggunakan metode Waterfall, sedangkan penelitian ini menggunakan Prototyping.
Waterfall, Web
Aliazas dkk. (2024). Enhancing University Operations: A Study of the Electronic Document Management Systems (EDMS) of One Higher Education Institution
Menganalisis pentingnya manajemen dokumen elektronik (EDMS) untuk keamanan arsip institusi pendidikan.
Sama-sama mengadopsi konsep Electronic Document Management System (EDMS).
Penelitian Aliazas bersifat analisis studi kasus, sedangkan penelitian ini adalah Rancang Bangun (Development) sistem aplikasi.
EDMS Analysis
Andrianto & Suyatno (2024). Analisis Performa Load Testing Antara MySQL Dan MongoDB Pada RestAPI NodeJS Menggunakan Postman
Menguji performa basis data NoSQL (MongoDB) dalam arsitektur Node.js yang terbukti efisien.
Sama-sama menggunakan basis data MongoDB dan arsitektur RestAPI Node.js.
Penelitian Andrianto fokus pada pengujian performa (load testing), sedangkan penelitian ini pada pengembangan fitur fungsional sistem.
Load Testing, Node.js
Sanjaya & Saputra (2023). Pemanfaatan NextJS Dan MongoDB Dalam Sistem Informasi Web Manajemen Data Beras Pada Ud Sri Utami
Memanfaatkan MongoDB untuk pengelolaan data dinamis pada sistem informasi berbasis Web.
Sama-sama menggunakan MongoDB untuk menangani data yang strukturnya fleksibel.
Studi kasus Sanjaya adalah manajemen data beras, sedangkan penelitian ini adalah Dokumen Akademik.
NextJS, MongoDB
Alfahri & Nisa (2025). Implementasi SDLC Prototyping dalam Perancangan Website Profil Sekolah MIS Nahdhatul Islam
Menerapkan SDLC Prototyping untuk memastikan kepuasan pengguna terhadap antarmuka sistem.
Sama-sama menggunakan metodologi SDLC Prototyping.
Objek penelitian Alfahri adalah profil sekolah (sederhana), sedangkan penelitian ini adalah sistem transaksional bimbingan yang kompleks.
Prototyping, Web
Nabila & Jananto (2025). Sistem Informasi Monitoring Perkembangan Prestasi Akademik dan Wanprestasi Siswa di MA Nurus Sunnah Tembalang Kota Semarang Berbasis Web
Membangun sistem Monitoring akademik untuk evaluasi kinerja siswa secara digital.
Sama-sama berfokus pada Monitoring Akademik berbasis Web.
Studi kasus Nabila adalah Sekolah (MA), sedangkan penelitian ini adalah Perguruan Tinggi (ITEBA).
Web System
Pulungan dkk. (2023). Analisis Teknik Entity-Relationship Diagram Dalam Perancangan Database.
Menganalisis teknik penggunaan ERD yang tepat untuk memodelkan kebutuhan data dan hubungan antar entitas dalam sistem basis data.
Sama-sama menggunakan pendekatan ERD sebagai instrumen utama dalam perancangan struktur basis data sistem.
Penelitian Pulungan berfokus pada analisis literatur/teknis perancangan ERD secara umum, sedangkan penelitian ini implementasi langsung pada Sistem Manajemen Dokumen Skripsi.
Literature Review / Analysis


Dari beberapa penelitian di atas, dapat disimpulkan bahwa meskipun sistem informasi akademik berbasis Web telah banyak dikembangkan, belum ada penelitian yang secara khusus mengintegrasikan ReactJS, Node.js, dan MongoDB untuk sistem bimbingan skripsi yang menekankan aspek komunikasi Real-time, dokumentasi versi revisi, serta notifikasi otomatis.
Selain itu, penelitian terdahulu juga menunjukkan bahwa sebagian besar sistem masih menggunakan teknologi monolitik (seperti PHP/Laravel) dan berfokus pada pencatatan data, bukan interaksi dua arah antara dosen dan mahasiswa. Oleh karena itu, penelitian ini mengisi kesenjangan (research gap) dengan membangun sistem bimbingan skripsi berbasis Web yang interaktif dan terukur, menggunakan metode Prototyping agar pengguna dapat terlibat langsung dalam pengujian dan penyempurnaan sistem.


BAB III
METODOLOGI PENELITIAN

Kerangka Penelitian
Kerangka penelitian ini disusun sebagai panduan strategis untuk memastikan proses pengembangan Sistem Informasi Manajemen Tugas Akhir berjalan terstruktur dan tepat sasaran. Berdasarkan identifikasi masalah di lapangan, penelitian ini mengadopsi pendekatan kualitatif deskriptif untuk merancang solusi teknis yang relevan dengan kebutuhan sivitas akademika Fakultas Teknologi Informasi ITEBA. Alur tahapan penelitian yang akan dilaksanakan digambarkan secara sistematis pada Gambar 3.1 :

Gambar 3.1 Flowchart Kerangka Penelitian
Berdasarkan gambar di atas, berikut adalah rincian rencana kegiatan yang akan dilaksanakan pada setiap tahapan:
Masalah : Tahap ini didasari oleh fenomena ketidakefisienan pada pengelolaan tugas akhir di Fakultas Teknologi Informasi ITEBA yang saat ini masih bersifat konvensional dan belum terintegrasi. Masalah utama yang ditemukan adalah pengelolaan dokumen yang terfragmentasi, di mana proses bimbingan tersebar di berbagai media seperti WhatsApp, Cloud (GDrive), hingga berkas cetak (Hardcopy). Kondisi ini menyebabkan manajemen administrasi menjadi tidak teratur, risiko dokumen tercecer sangat tinggi, serta sulitnya melakukan pelacakan riwayat revisi secara kronologis.
Identifikasi Masalah : Untuk mendalami akar permasalahan tersebut, dilakukan tahap identifikasi melalui observasi lapangan dan diskusi intensif bersama Kepala Program Studi di lingkungan Fakultas Teknologi Informasi. Proses ini bertujuan untuk memetakan alur bimbingan yang berjalan saat ini guna memvalidasi titik-titik penghambat administrasi. Hasil identifikasi menunjukkan bahwa fragmentasi media komunikasi tersebut merupakan faktor utama yang menyebabkan respon koordinasi menjadi lambat dan menghambat transparansi pemantauan progres mahasiswa.
Pengumpulan Data : Pengumpulan data diawali dengan survei pendahuluan terhadap 15 mahasiswa senior lintas prodi di Fakultas Teknologi Informasi (FTIN) guna memvalidasi kendala sistemik fakultas. Selanjutnya, spesifikasi kebutuhan difokuskan pada Program Studi Sistem Informasi dengan melibatkan 42 mahasiswa angkatan 2021 ke atas sebagai data historis, 7 mahasiswa aktif angkatan 2022, serta 8 Dosen Pembimbing sebagai acuan utama perancangan sistem.
Analisis Kebutuhan Data yang telah dihimpun selanjutnya dianalisis untuk merumuskan spesifikasi kebutuhan sistem SIMTA (Sistem Informasi Manajemen Tugas Akhir), di mana berdasarkan keluhan dominan mengenai dokumen yang tercecer di aplikasi pesan instan, ditetapkan kebutuhan fitur prioritas meliputi modul Plotting pembimbing otomatis, manajemen revisi terpusat (Version Control), serta fitur pengingat jadwal bimbingan untuk mengatasi respon lambat.
Perancangan Sistem : Pada tahap ini, kebutuhan fitur diterjemahkan ke dalam desain teknis yang mencakup perancangan antarmuka (User Interface) sesuai profil pengguna di Prodi Sistem Informasi, serta penyusunan struktur basis data agar sistem mampu menangani penyimpanan riwayat revisi dokumen mahasiswa secara terstruktur guna menggantikan metode penyimpanan manual sebelumnya.
Pengembangan Sistem (Prototyping) : Sistem dibangun menggunakan metode Prototyping dengan teknologi MERN Stack (MongoDB, React, Node.js). Pada tahap ini, peneliti akan menulis kode program untuk merealisasikan fitur manajemen revisi dan komunikasi Real-time sesuai desain yang telah disetujui.
Pengujian Sistem : Sebelum diimplementasikan, kelayakan sistem divalidasi melalui pengujian fungsional menggunakan metode Black Box Testing dan dilanjutkan dengan pengujian tingkat kepuasan (Usability) menggunakan metode SUS (System Usability Scale) yang melibatkan 10 responden terdiri dari 3 Dosen Pembimbing dan 7 Mahasiswa Sistem Informasi untuk mewakili perspektif pengguna utama dengan nilai SUS (System Usability Scale) lebih dari 70.
Implementasi dan Evaluasi : Tahap akhir meliputi peluncuran sistem SIMTA dalam skala terbatas di Program Studi Sistem Informasi, yang diikuti dengan evaluasi akhir berdasarkan umpan balik pengguna untuk memastikan bahwa solusi yang dibangun efektif mengatasi ketidakefisienan administrasi yang sebelumnya terjadi.


Metode Pengumpulan Data
Untuk mendapatkan informasi yang akurat dan relevan dalam pembangunan sistem bimbingan skripsi berbasis Web menggunakan metode pengumpulan data sebagai berikut:

Observasi
Observasi dilakukan untuk mengamati secara langsung proses bimbingan skripsi yang berlangsung di lingkungan Fakultas Teknologi Informasi ITEBA. Observasi ini bertujuan untuk memperoleh gambaran nyata mengenai aktivitas pengajuan revisi, interaksi dosen-mahasiswa, serta kendala yang muncul akibat sistem manual. Teknik observasi yang digunakan bersifat non-partisipatif, di mana peneliti mencatat proses yang terjadi tanpa melakukan intervensi. Hasil observasi ini digunakan untuk memvalidasi masalah urgensi sistem.
Wawancara
Wawancara dalam penelitian ini merupakan proses interaksi langsung antara peneliti dan responden untuk memperoleh pemahaman mendalam. Wawancara dilakukan dengan Kepala Program Studi dan Dosen Pembimbing guna menggali informasi terkait kebutuhan manajerial dan fitur teknis yang diharapkan. Informasi yang diperoleh dari wawancara ini menjadi dasar utama dalam menyusun spesifikasi kebutuhan perangkat lunak
Studi Pustaka
Studi pustaka dilakukan dengan mengumpulkan data dari buku, jurnal ilmiah, dan artikel terkait pengembangan sistem informasi akademik. Referensi ini digunakan untuk memperkuat landasan teori mengenai metode Prototyping, teknologi ReactJS, dan manajemen basis data dokumen

Metode Perancangan Sistem
Metode pengembangan perangkat lunak yang digunakan dalam penelitian ini adalah metode prototyping. Metode ini dipilih karena memungkinkan peneliti membangun purwarupa sistem lebih awal, kemudian mengevaluasinya bersama pengguna agar sistem yang dikembangkan sesuai dengan kebutuhan proses bimbingan tugas akhir. Tahapan metode prototyping dalam penelitian ini disesuaikan dengan alur pengembangan sistem yang digunakan, yaitu sebagai berikut::
Analisis Kebutuhan : Pada tahap ini, peneliti mengidentifikasi kebutuhan sistem melalui observasi, wawancara, dan penyebaran kuesioner. Observasi dilakukan terhadap mahasiswa angkatan 2021 yang mengalami keterlambatan kelulusan. Wawancara dilakukan kepada beberapa mahasiswa tingkat atas serta Ketua Program Studi Sistem Informasi untuk mengetahui kendala utama dalam proses bimbingan. Selain itu, peneliti juga menyebarkan kuesioner kepada 15 mahasiswa tingkat atas di lingkungan Fakultas Teknologi Informasi (FTIN), 7 mahasiswa aktif Program Studi Sistem Informasi angkatan 2022 semester 7, serta 6 dosen Program Studi Sistem Informasi. Tahap ini bertujuan untuk memperoleh kebutuhan utama sistem, seperti unggah dokumen bimbingan, pemberian umpan balik, riwayat revisi, dan monitoring progres.
Pembuatan Desain Prototype : Setelah kebutuhan sistem diperoleh, peneliti menyusun rancangan awal dalam bentuk desain antarmuka dan alur proses yang kemudian diterjemahkan menjadi purwarupa (prototype) sistem agar dapat diuji. Tahap ini bertujuan untuk menggambarkan hubungan antara pengguna dengan fitur utama sistem seperti halaman unggah revisi, komentar dosen, dan pemantauan progress sekaligus menampilkan fungsi-fungsi utama aplikasi sehingga pengguna mendapatkan gambaran awal sistem yang akan dikembangkan.
Evaluasi Pengguna : Prototype yang telah dibuat kemudian ditunjukkan kepada pengguna untuk memperoleh masukan. Evaluasi dilakukan untuk mengetahui apakah tampilan, alur penggunaan, dan fungsi sistem sudah sesuai dengan kebutuhan dosen maupun mahasiswa dalam proses bimbingan tugas akhir, Apabila hasil evaluasi menunjukkan bahwa sistem belum memenuhi kebutuhan pengguna, maka proses akan dikembalikan ke tahap analisis kebutuhan untuk dilakukan perbaikan dan penyempurnaan.
Pengembangan Sistem : Setelah prototype disetujui, peneliti melanjutkan ke tahap pengembangan sistem secara lebih lengkap. Pada tahap ini, sistem dibangun menggunakan ReactJS pada sisi frontend, Node.js pada sisi backend, serta MongoDB sebagai basis data untuk menyimpan data bimbingan, dokumen revisi, dan progres mahasiswa.
Pengujian Sistem : Sistem yang telah dikembangkan kemudian diuji untuk memastikan bahwa setiap fungsi berjalan sesuai kebutuhan. Pengujian dilakukan terhadap fitur-fitur utama seperti unggah dokumen, pemberian komentar, riwayat revisi, notifikasi, dan monitoring progres
Evaluasi Sistem : Sistem yang telah dikembangkan selanjutnya dievaluasi untuk memastikan kesesuaiannya dengan kebutuhan pengguna. Apabila telah sesuai, maka sistem dapat digunakan. Namun, jika belum sesuai, dilakukan perbaikan berdasarkan umpan balik pengguna hingga sistem dinyatakan memenuhi kebutuhan.
Implementasi Sistem : Tahap akhir adalah penerapan sistem yang telah selesai dikembangkan dan diuji. Sistem yang dihasilkan diharapkan dapat mendukung proses bimbingan tugas akhir secara lebih terstruktur, terdokumentasi, dan mudah dipantau.

Metode Pengujian Sistem
Setelah sistem selesai dibangun, tahap pengujian dilakukan untuk memastikan kualitas perangkat lunak sebelum digunakan secara luas.
Black Box Testing: Pengujian ini berfokus pada evaluasi fungsionalitas sistem dengan cara mengamati hasil eksekusi data uji pada fitur-fitur utama seperti Login, Upload Revisi, dan Notifikasi. Kegiatan ini bertujuan untuk mendeteksi kesalahan fungsi maupun antarmuka, serta memastikan keluaran (Output) sistem berjalan sesuai logika yang diharapkan dan bebas dari Bug.
System Usability Scale (SUS): Pengujian kegunaan dilaksanakan dengan mendistribusikan kuesioner SUS kepada representasi pengguna (dosen dan mahasiswa) setelah mereka melakukan simulasi penggunaan aplikasi. Kegiatan ini bertujuan untuk mengukur skor kepuasan, efektivitas, dan efisiensi pengguna (user acceptance) secara terukur terhadap alur manajemen tugas akhir yang baru dikembangkan.

Lokasi dan Jadwal Penelitian
Lokasi Penelitian
Penelitian ini bertempat di Fakultas Teknologi Informasi, Institut Teknologi Batam (ITEBA), Jalan Gajah Mada, Sekupang, Batam. Lokasi ini dipilih mengingat tingginya intensitas bimbingan tugas akhir yang belum didukung oleh sistem dokumentasi terintegrasi, sehingga memerlukan optimalisasi manajerial berbasis teknologi.

Gambar 3.2 Lokasi Penelitian (ITEBA) ( Sumber : GoogleMaps)

Jadwal Penelitian
Penelitian direncanakan berlangsung selama 5 (lima) bulan, terhitung mulai dari tahap pengumpulan data pada bulan September 2025 hingga penyusunan laporan akhir.











DAFTAR PUSTAKA

Aliazas, J. V., Dela Cruz, R., & Ilagan, N. (2024). Enhancing University Operations: A Study of the Electronic Document Management Systems (EDMS) of One Higher Education Institution. TWIST, 19(3), 229â€“237. https://twistjournal.net/twist/article/view/337
Anardani, S., Yunitasari, Y., & Sussolaikah, K. (2023). Analisis Perancangan Sistem Informasi Monitoring dan Evaluasi Kerjasama Menggunakan UML. remik, 7(1), 522â€“532. https://doi.org/10.33395/remik.v7i1.12070
Andrianto, L. D., & Suyatno, D. F. (2024). Analisis Performa Load Testing Antara Mysql Dan Nosql Mongodb Pada RestAPI Nodejs Menggunakan Postman. Journal of Emerging Information System and Business Intelligence (JEISBI), 5(1), 18â€“26. https://doi.org/10.26740/jeisbi.v5i1.58157
Annisa Rahmawita, Tania Azura Fahani, Rohima, R., Alwi Alviansha, & Nurbaiti, N. (2023). Implementasi Sistem Basis Data pada Sektor Pendidikan di Indonesia. INSOLOGI: Jurnal Sains dan Teknologi, 2(4), 684â€“689. https://doi.org/10.55123/insologi.v2i4.2287
Apsari, N. K. P. T., & Putra, I. N. T. A. (2025). Analisis usability aplikasi kesehatan digital Halodoc menggunakan metode System Usability Scale (SUS). Jurnal Informatika dan Teknik Elektro Terapan, 13(3S1). https://doi.org/10.23960/jitet.v13i3S1.8063
Asni, A., Dasalinda, D., & Chairunnisa, D. (2023). Penerapan Fungsi Manajemen POAC (Planning, Organizing, Actuating, And Controlling) dalam Layanan Bimbingan Dan Konseling Di Sekolah. Ideguru: Jurnal Karya Ilmiah Guru, 9(1), 357â€“364. https://doi.org/10.51169/ideguru.v9i1.840
Azis, A. A. (2025). Rancangan sistem monitoring siswa berbasis web dengan metode Waterfall. Jurnal Informatika dan Teknik Elektro Terapan, 13(3). https://doi.org/10.23960/jitet.v13i3.6676
Christoval, P., Harahap, S. Z., Nasution, M., & Masrizal, M. (2025). Implementasi Sistem Informasi Perpustakaan Untuk GBI Antiokhia Berbasis Web Menggunakan Framework Adonis JS Pada Node JS Menggunakan Metode Prototype. Jurnal Pendidikan Indonesia, 6(8), 3967. https://doi.org/10.59141/japendi.v6i8.8530
Galuh Ajeng Fildzah Amalia, Fira Aprilia Nur Rahma, Tri Cahyo Kuswarian, & Hesti Kusumaningrum. (2024). POAC dalam Transformasi Manajemen Sekolah: dari Teori ke Praktik. Harmoni Pendidikanâ€¯: Jurnal Ilmu Pendidikan, 2(1), 133â€“147. https://doi.org/10.62383/hardik.v2i1.1024
Hany Maria Valentine, & Lira Arum Kusumaning Thyas. (2024). Konsep Dasar Sistem Informasi Manajemen. Neptunus: Jurnal Ilmu Komputer Dan Teknologi Informasi, 2(2), 135â€“144. https://doi.org/10.61132/neptunus.v2i2.340
Kartono, F. K., Nursaadah, S., Nugroho, M. R., Tama, D. A., Mashudi, F. A., Wicaksono, A., & Nasir, M. (2024). Pengujian Black Box testing pada sistem website Osha Snack: Pendekatan teknik Boundary Value Analysis. Jurnal Kridatama Sains dan Teknologi, 6(02), 754â€“766. https://doi.org/10.53863/kst.v6i02.1407
Kurozy, D. N., Pratama, R. G., & Muhammad, A. E. (2025). Penerapan Metode Prototype Pada Perancangan Sistem Pendaftaran Mahasiswa Baru. JPNM Jurnal Pustaka Nusantara Multidisiplin, 3(1). https://doi.org/10.59945/jpnm.v3i1.300
Lazuardy, M. F. S., & Anggraini, D. (2022). Modern Front End Web Architectures with React.Js and Next.Js. International Research Journal of Advanced Engineering and Science (IRJAES), 7(1), 132â€“141. http://irjaes.com/wp-content/uploads/2022/02/IRJAES-V7N1P162Y22.pdf
Nabila, A. A., & Jananto, A. (2025). Sistem Informasi Monitoring Perkembangan Prestasi Akademik dan Wanprestasi Siswa di MA Nurus Sunnah Tembalang Kota Semarang Berbasis Web. Jurnal Ilmu Multidisiplin, 4(2), 688â€“697. https://doi.org/10.38035/jim.v4i2.923
Nizamuddin Silmi, Bambang Kurniawan, & Muhamad Subhan. (2024). PERENCANAAN DALAM ILMU PENGANTAR MANAJEMEN. Journal of Student Research, 2(1), 106â€“120. https://doi.org/10.55606/jsr.v2i1.1899
Nugraha, Y. (2022). Web-Based Thesis Management Information System Design. Sinkron, 6(4), 2602â€“2612. https://doi.org/10.33395/sinkron.v7i4.12244
Nur, S., Waita, R., & Asa, B. J. (2023). Rancang bangun sistem informasi desa Fudima dengan menggunakan metode Prototype di Desa Fudima. EDUSAINTEK: Jurnal Pendidikan, Sains dan Teknologi, 10(3), 804â€“815. https://doi.org/10.47668/edusaintek.v10i3.862
Nyoman, M., Sulistyo, D., & Roza, F. (2025). Rancangan Simulasi Web Pada Ground Check DVOR Menggunakan Visual Studio Code. Telekontranâ€¯: Jurnal Ilmiah Telekomunikasi, Kendali dan Elektronika Terapan, 13(2), 288â€“297. https://doi.org/10.34010/telekontran.v13i2.17515
OrbÃ¡n, L. L. (2023). Using version control to document genuine effort in written assignments: a protocol with examples for universities. Frontiers in Education, 8. https://doi.org/10.3389/feduc.2023.1169938
Prasetyo, A. P., Fauzi, A., & Pangestu, A. D. (2024). Aplikasi manajemen biro wisata & travel berbasis Java pada PT Global Service Wisata. Jurnal Riset Sistem Informasi, 1(1), 32â€“38. https://journal.smartpublisher.id/index.php/jissi/article/view/72
Pratiwi, I., Anardani, S., & Putera, A. R. (2023). Rancang Bangun Sistem Informasi Penjadwalan Mata Pelajaran dengan Metode Waterfall. JDMIS: Journal of Data Mining and Information System, 1(1), 20â€“28. https://doi.org/10.54259/jdmis.v1i1.1513
Pulungan, S. M., Febrianti, R., Lestari, T., Gurning, N., & Fitriana, N. (2023). Analisis Teknik Entity-Relationship Diagram Dalam Perancangan Database. Jurnal Ekonomi Manajemen dan Bisnis (JEMB), 1(2), 98â€“102. https://doi.org/10.47233/jemb.v1i2.533
Rafianto, G., & Voutama, A. (2025). IMPLEMENTASI BASIS DATA TERSTRUKTUR DENGAN PENCEGAHAN SQL INJECTION PADA SISTEM MANAJEMEN PENJUALAN. Jurnal Informatika dan Teknik Elektro Terapan, 13(2), 2023. https://doi.org/10.23960/jitet.v13i2.6354
Safira Armah, & Rayyan Firdaus. (2024). Konsep Dan Penerapan Sistem Informasi Manajemen. Jurnal Inovasi Manajemen, Kewirausahaan, Bisnis dan Digital, 1(3), 50â€“56. https://doi.org/10.61132/jimakebidi.v1i3.192
Salmi, & Darmatasia. (2023). Sistem manajemen dan monitoring bimbingan tugas akhir berbasis web. AGENTS: Journal of Artificial Intelligence and Data Science, 3(1), 1â€“8. https://doi.org/10.24252/jagti.v3i1.59
Sanjaya, M., & Saputra, P. R. N. (2023). Pemanfaatan NextJS dan MongoDB dalam sistem informasi web manajemen data beras pada UD Sri Utami. Information System For Educators And Professionals: Journal of Information System, 8(1), 25. https://doi.org/10.51211/isbi.v8i1.2414
Setiawan, L. O. M. I., Gunawan, & Tenriawaru, A. (2024). Rancang bangun sistem informasi monitoring bimbingan tugas akhir berbasis web menggunakan framework ReactJS. AnoaTIK: Jurnal Teknologi Informasi dan Komputer, 2(1), 39â€“50. https://doi.org/10.33772/anoatik.v2i1.25
Soplanit, A. R., Supiyanto, Saputro, A. D., Kmurawak, R. M., & Sampebua, M. R. (2023). Penerapan Version control system Berbasis Web Menggunakan Next.JS, Nest.JS, Node.JS, dan MongoDB Pada Proses Pengerjaan Skripsi Mahasiswa. Jurasik (Jurnal Riset Sistem Informasi dan Teknik Informatika), 8(2), 316â€“370. https://www.researchgate.net/publication/373238587_Penerapan_Version_control_system_Berbasis_Web_Menggunakan_NextJS_NestJS_NodeJS_dan_MongoDB_Pada_Proses_Pengerjaan_Skripsi_Mahasiswa
Sulistiawan, S., Maruf Nugroho, I., & Defriani, M. (2025). Implementasi Whatsapp Gateaway pada sistem informasi pengaduan masyarakat. JATI (Jurnal Mahasiswa Teknik Informatika), 9(5), 8493â€“8498. https://doi.org/10.36040/jati.v9i5.15090
Waton, I. M. B., Weking, A. N., & Deta, B. (2025). Penerapan Api Whatsapp Fonnte Untuk Sistem Pengingat Jadwal Bimbingan Tugas Akhir Mahasiswa Berbasis Web. Jurnal Teknik Mesin, Elektro dan Ilmu Komputer, 5(2), 229â€“241. https://doi.org/10.55606/teknik.v5i2.7614
Wijaya, C. S., Zulfahmi, M. D., & Sudrajat, A. W. (2024). Pengujian Black Box pada Aplikasi e-Promkes Berbasis Web Menggunakan Teknik Equivalence Partitions. Jurnal Rein (Rekayasa Informatika), 1(1), 52â€“56. https://journal.rekayasainformatika.com/index.php/JREIN/article/view/11
Wilyanto, N., Firnando, J., Franko, B., Tanzil, S. P., Tan, H. C., & Hartati, E. (2023). Pembuatan Website Menggunakan Visual Studio Code di SMA Xaverius 3 Palembang. FORDICATE, 3(1), 1â€“8. https://doi.org/10.35957/fordicate.v3i1.5057
Yarpriransa, Y., Saripurna, D., & Santoso, H. (2023). Implementasi Metode Scrum pada Pengembangan Aplikasi Bimbingan Skripsi Online. Hello World Jurnal Ilmu Komputer, 2(1), 42â€“57. https://doi.org/10.56211/helloworld.v2i1.228
Yulius, & Susetyo, Y. A. (2023). Analisis dan Penerapan Database Mongodb pada Aplikasi Manajemen Dokumen di PT. XYZ. Jurnal JTIK (Jurnal Teknologi Informasi dan Komunikasi), 7(4), 570â€“578. https://doi.org/10.35870/jtik.v7i4.1047
 Vercel. (2026). Vercel documentation. Diakses pada 13 Maret 2026, dari https://vercel.com/docs
Mallu, S., Jeprianto, Hendrawan, S. A., Widyastuti, R., Wardhani, D., Arni, S., Suyono, Wayahdi, M. R., Yahya, K., Nurmadewi, D., Mardiyanto, & Arifin, S. (2023). Rekayasa Perangkat Lunak. Deli Serdang: PT. Mifandi Mandiri Digital.

LAMPIRAN
