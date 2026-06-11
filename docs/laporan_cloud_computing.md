# LAPORAN EVALUASI AKHIR SEMESTER (EAS) CLOUD COMPUTING
## EDUMENTOR AI: SISTEM PEMBELAJARAN ADAPTIF BERBASIS AI DENGAN ARSITEKTUR CLOUD NATIVE DAN MULTI-CLOUD STORAGE
**Mendukung Sustainable Development Goals (SDGs) No. 4: Pendidikan Berkualitas**

---

## DAFTAR ISI
1. **BAB I: PENDAHULUAN**
   - 1.1 Latar Belakang Masalah
   - 1.2 Sustainable Development Goals (SDGs) No. 4: Pendidikan Berkualitas
   - 1.3 Rumusan Masalah
   - 1.4 Tujuan dan Manfaat Proyek
2. **BAB II: ANALISIS DAN PERANCANGAN SISTEM**
   - 2.1 Deskripsi Fungsional Sistem
   - 2.2 Desain Basis Data (Database Schema)
   - 2.3 Arsitektur Modul Pembelajaran Adaptif (Adaptive Learning)
   - 2.4 Dokumentasi API (Application Programming Interface)
3. **BAB III: ARSITEKTUR CLOUD NATIVE DAN MULTI-CLOUD**
   - 3.1 Konsep Cloud Native & Segmentasi VPC (Virtual Private Cloud)
   - 3.2 Topologi Jaringan & Aturan Keamanan (Firewall / Security Groups)
   - 3.3 Pendekatan Multi-Cloud dengan Cloudflare R2 Object Storage
   - 3.4 Distribusi Konten & Akses Cepat dengan Cloudflare CDN
4. **BAB IV: INTEGRASI ARTIFICIAL INTELLIGENCE (AI)**
   - 5.1 Peran AI Engine di EduMentor AI
   - 5.2 Implementasi API Google Gemini
   - 5.3 Rekayasa Prompt (Prompt Engineering) & Skema Penataan JSON
5. **BAB V: CONTAINERIZATION & CI/CD PIPELINE**
   - 5.1 Dockerization (Dockerfile Frontend & Backend)
   - 5.2 Orkestrasi Container Lokal dengan Docker Compose
   - 5.3 Alur Pipeline CI/CD Berbasis GitHub Actions
6. **BAB VI: TUTORIAL DEPLOYMENT & MANUAL GUIDE**
   - 6.1 Prasyarat Deployment (Prerequisites)
   - 6.2 Deployment Lokal Menggunakan Docker Compose
   - 6.3 Otomatisasi Infrastruktur Cloud Menggunakan Terraform (IaC)
   - 6.4 Deployment Produksi Menggunakan Pipeline CI/CD
7. **BAB VII: MONITORING SISTEM & STRATEGI PEMELIHARAAN**
   - 7.1 Strategi Monitoring Sumber Daya VM
   - 7.2 Manajemen Log Sistem (Logging)
   - 7.3 Strategi Backup Database & Skalabilitas (Autoscaling)
8. **BAB VIII: KESIMPULAN DAN REKOMENDASI**
   - 8.1 Kesimpulan
   - 8.2 Rekomendasi Pengembangan Lanjutan

---

## BAB I: PENDAHULUAN

### 1.1 Latar Belakang Masalah
Di era digitalisasi saat ini, kebutuhan akan efisiensi pembelajaran menjadi sangat krusial, terutama bagi pelajar dan mahasiswa di tingkat pendidikan tinggi. Volume materi akademis yang sangat besar, baik dalam bentuk dokumen PDF buku referensi, slide presentasi (PPT), maupun dokumen teks (.docx), seringkali membuat mahasiswa mengalami *cognitive overload* atau kewalahan dalam memilah informasi penting.

Pembelajaran konvensional sering kali tidak mampu memfasilitasi kebutuhan individu secara unik. Setiap mahasiswa memiliki kecepatan belajar (*learning pace*) dan metode pemahaman konsep yang berbeda. Beberapa mahasiswa lebih menyukai ringkasan poin penting (*summarization*), sementara yang lain membutuhkan peta konsep yang terstruktur secara kronologis (*learning path*) untuk memahami suatu topik dari tingkat dasar hingga mahir. 

Untuk menjembatani kesenjangan ini, diperlukan sebuah platform pembelajaran digital cerdas (*Learning Management System* / LMS berbasis AI) yang mampu memproses dokumen akademis secara otomatis, menyusun kurikulum adaptif sesuai isi dokumen tersebut, menyediakan evaluasi kognitif interaktif secara real-time, serta menyediakan layanan asisten akademik virtual yang selalu siap menjawab pertanyaan terkait isi modul belajar tersebut.

### 1.2 Sustainable Development Goals (SDGs) No. 4: Pendidikan Berkualitas
Sustainable Development Goals (SDGs) merupakan agenda global yang dirumuskan oleh Perserikatan Bangsa-Bangsa (PBB) demi kesejahteraan manusia dan pelestarian bumi. Salah satu pilar utamanya adalah **SDGs Goal 4: Quality Education (Pendidikan Berkualitas)**. Indikator utama dari SDGs Goal 4 meliputi:
1. **Pemerataan Akses Belajar:** Memastikan semua anak perempuan dan laki-laki mendapatkan akses pendidikan gratis, setara, dan berkualitas yang mengarah pada hasil belajar yang relevan dan efektif.
2. **Penerapan Teknologi Inovatif:** Memanfaatkan teknologi informasi dan komunikasi untuk memperluas jangkauan pendidikan, mempermudah akses materi belajar mandiri, dan meningkatkan keterampilan literasi digital mahasiswa.
3. **Pembelajaran Adaptif dan Sepanjang Hayat:** Mempromosikan kesempatan belajar sepanjang hayat untuk semua orang melalui instrumen pembelajaran mandiri yang dapat diakses di mana saja dan kapan saja.

Proyek **EduMentor AI** mendukung pencapaian SDGs No. 4 ini dengan menyediakan sistem pembelajaran mandiri yang cerdas, efisien, dan inklusif. Melalui pemanfaatan *Cloud Computing* dan *Artificial Intelligence*, EduMentor AI mendemokratisasi akses edukasi berkualitas tinggi. Pengguna dapat mengunggah file materi kuliah secara mandiri, lalu membiarkan AI bertindak asisten pribadi yang menyusun modul-modul belajar adaptif, merangkum konten, menyusun kuis kognitif otomatis, dan menjawab pertanyaan edukasional secara instan.

### 1.3 Rumusan Masalah
Berdasarkan latar belakang di atas, rumusan masalah dalam perancangan aplikasi EduMentor AI ini adalah:
1. Bagaimana merancang arsitektur aplikasi LMS berbasis AI yang mendukung akses belajar mandiri secara adaptif?
2. Bagaimana mengimplementasikan sistem infrastruktur berbasis *Cloud Native* yang aman, andal, dan modular menggunakan segmentasi VPC (Virtual Private Cloud)?
3. Bagaimana menerapkan persyaratan *Multi-Cloud* untuk penyimpanan dokumen akademis menggunakan Cloudflare R2 Object Storage yang terpisah dari komputasi utama aplikasi?
4. Bagaimana merancang alur integrasi kecerdasan buatan (*Artificial Intelligence*) menggunakan API pihak ketiga (Google Gemini API) untuk mengekstrak, merangkum, dan menyusun peta materi?
5. Bagaimana merancang alur containerization (Docker) dan integrasi CI/CD (*Continuous Integration / Continuous Deployment*) agar proses rilis fitur dapat berjalan secara otomatis tanpa *downtime*?

### 1.4 Tujuan dan Manfaat Proyek
**Tujuan Proyek:**
1. Membangun aplikasi web EduMentor AI yang memiliki fitur ekstraksi teks, ringkasan otomatis (AI Summary), pembuatan modul belajar (AI Learning Path), evaluasi kognitif (AI Quiz), dan asisten tanya jawab (AI Tutor).
2. Menerapkan arsitektur cloud native pada platform cloud (Amazon Web Services) dengan segmentasi VPC untuk Frontend, Backend, dan Database, lengkap dengan NAT Gateway untuk keamanan outbound backend.
3. Mengintegrasikan penyimpanan object storage Cloudflare R2 secara multi-cloud yang berbeda dari platform komputasi utama (AWS).
4. Menyusun skrip orkestrasi Docker Compose untuk lokal dev dan skrip Terraform untuk penyediaan infrastruktur otomatis (*Infrastructure as Code*) tanpa men-hardcode rahasia sensitif (menggunakan Terraform variables).
5. Membangun pipeline CI/CD yang andal menggunakan GitHub Actions.

**Manfaat Proyek:**
1. **Bagi Mahasiswa:** Mempermudah pemahaman materi kuliah secara mendalam, terarah, dan interaktif sesuai gaya belajar masing-masing individu secara efisien.
2. **Bagi Dosen/Pengajar:** Membantu dalam otomatisasi penyusunan ringkasan bahan ajar dan soal kuis yang berkualitas berdasarkan dokumen modul kuliah.
3. **Bagi Tim Developer & Cloud Engineers:** Menjadi referensi implementasi nyata arsitektur aplikasi modern berstandar industri dengan teknologi cloud-native, multi-cloud, dan AI integration.

---

## BAB II: ANALISIS DAN PERANCANGAN SISTEM

### 2.1 Deskripsi Fungsional Sistem
EduMentor AI dirancang dengan beberapa fitur fungsional utama yang saling berintegrasi melalui RESTful API:
1. **Autentikasi Pengguna (Auth System):** Registrasi dan login menggunakan JWT (JSON Web Token) dengan enkripsi password menggunakan `bcrypt`.
2. **Unggah Materi (Upload Document):** Pengguna dapat mengunggah file berupa PDF, Word (.docx), atau Teks biasa (.txt). Teks di dalam file tersebut diekstrak secara otomatis oleh backend menggunakan parser parser PDF (`pdf-parse`) atau Word (`mammoth`).
3. **Pembuatan Ringkasan (AI Summary):** Sistem mengirimkan teks ekstraksi dokumen ke Google Gemini API untuk dirangkum menjadi konsep inti dalam format Markdown dengan rumus LaTeX (untuk topik sains/teknik).
4. **Pembuatan Modul Adaptif (AI Learning Path):** AI memecah teks dokumen yang panjang menjadi 4-6 modul pembelajaran yang terurut dan bertahap lengkap dengan estimasi waktu baca. Modul disimpan ke basis data dan dibuka secara bertahap (*unlocked sequentially*) setelah pengguna menandai selesai modul sebelumnya.
5. **Evaluasi Kognitif (AI Quiz Generator):** Setelah semua modul diselesaikan, AI membuat 10 pertanyaan pilihan ganda yang bervariasi tingkat kesulitannya (mudah, sedang, sulit) beserta penjelasan jawaban yang komprehensif. Pengguna dapat melacak skor hasil pengerjaan kuis.
6. **Konsultasi Interaktif (AI Tutor Chat):** Chatbot tutor akademis interaktif yang khusus menjawab pertanyaan pengguna hanya berdasarkan materi dokumen yang diunggah.

### 2.2 Desain Basis Data (Database Schema)
Basis data yang digunakan adalah relational database MySQL dengan rancangan schema ternormalisasi untuk menjamin integritas data:

```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100),
  email VARCHAR(100) UNIQUE,
  password VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE materials (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(255),
  file_url TEXT,
  content LONGTEXT,
  summary LONGTEXT,
  summary_generated BOOLEAN DEFAULT FALSE,
  learning_path_generated BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE learning_modules (
  id INT AUTO_INCREMENT PRIMARY KEY,
  material_id INT NOT NULL,
  title VARCHAR(255),
  content LONGTEXT,
  estimated_minutes INT DEFAULT 10,
  order_number INT,
  FOREIGN KEY (material_id) REFERENCES materials(id) ON DELETE CASCADE
);

CREATE TABLE user_progress (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  module_id INT NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  progress_percentage INT DEFAULT 0,
  completed_at TIMESTAMP NULL,
  UNIQUE(user_id, module_id),
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY(module_id) REFERENCES learning_modules(id) ON DELETE CASCADE
);

CREATE TABLE quizzes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  material_id INT NOT NULL,
  title VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(material_id) REFERENCES materials(id) ON DELETE CASCADE
);

CREATE TABLE quiz_questions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  quiz_id INT NOT NULL,
  question TEXT,
  option_a TEXT,
  option_b TEXT,
  option_c TEXT,
  option_d TEXT,
  correct_answer CHAR(1),
  explanation TEXT,
  FOREIGN KEY(quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
);

CREATE TABLE quiz_attempts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  quiz_id INT NOT NULL,
  score INT,
  total_questions INT,
  answers TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY(quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
);
```

### 2.3 Arsitektur Modul Pembelajaran Adaptif (Adaptive Learning)
Sistem pembelajaran adaptif di EduMentor AI beroperasi menggunakan model *linear progression validation*:
1. Saat file materi diunggah, ia masuk ke tabel `materials`.
2. Setelah generate learning path, dihasilkan 4-6 record di tabel `learning_modules`.
3. Di frontend, modul ditampilkan dalam struktur alur belajar step-by-step. Modul ke-`n` hanya dapat dibuka jika ada record progress penyelesaian di tabel `user_progress` untuk modul ke-`n-1`.
4. Final Quiz (Kuis Akhir) hanya dapat diakses setelah seluruh modul di dalam materi tersebut berstatus completed (bernilai true pada `is_completed`).
5. AI Tutor Chat membatasi konteks jawaban hanya dari field `content` di tabel `materials` untuk menghindari halusinasi jawaban AI di luar topik materi kuliah yang bersangkutan.

### 2.4 Dokumentasi API (Application Programming Interface)
Endpoints API backend diatur dalam kategori modul REST:

| Kategori | Method | Endpoint | Fungsi | Autentikasi |
| :--- | :--- | :--- | :--- | :--- |
| **Auth** | POST | `/api/auth/register` | Mendaftarkan pengguna baru | Publik |
| **Auth** | POST | `/api/auth/login` | Login pengguna dan mengembalikan token JWT | Publik |
| **Material** | GET | `/api/materials` | Mengambil seluruh materi pengguna | JWT |
| **Material** | POST | `/api/materials/upload` | Mengunggah file materi (PDF/Word/TXT) | JWT |
| **Material** | PUT | `/api/materials/:id` | Memperbarui judul materi | JWT |
| **Material** | DELETE | `/api/materials/:id` | Menghapus materi beserta semua relasi | JWT |
| **Material** | GET | `/api/materials/:id/modules` | Mengambil modul pembelajaran materi | JWT |
| **Material** | POST | `/api/materials/modules/:moduleId/complete` | Menandai selesai modul belajar | JWT |
| **AI Engine**| POST | `/api/ai/summary/:id` | Generate ringkasan dengan Gemini API | JWT |
| **AI Engine**| POST | `/api/ai/learning-path/:id` | Generate 4-6 modul belajar berurutan | JWT |
| **AI Engine**| POST | `/api/ai/quiz/:id` | Generate 10 soal kuis pilihan ganda | JWT |
| **AI Engine**| POST | `/api/ai/tutor/:id` | Tanya jawab dengan AI Tutor terkait materi | JWT |
| **Quiz** | GET | `/api/quizzes/material/:materialId` | Mengambil kuis berdasarkan materi | JWT |
| **Quiz** | GET | `/api/quizzes/:id` | Mengambil detail pertanyaan kuis | JWT |
| **Quiz** | POST | `/api/quizzes/:id/submit` | Mengirim jawaban kuis dan menyimpan skor | JWT |

---

## BAB III: ARSITEKTUR CLOUD NATIVE DAN MULTI-CLOUD

### 3.1 Konsep Cloud Native & Segmentasi VPC (Virtual Private Cloud)
Aplikasi EduMentor AI menggunakan pendekatan arsitektur *Cloud Native* yang menekankan pada penggunaan container (Docker), otomatisasi infrastruktur (Terraform), pembagian service terpisah, dan isolasi jaringan tingkat tinggi untuk keamanan data. 

Untuk meminimalisir risiko kebocoran data dan membatasi *blast radius* serangan siber, sistem jaringan AWS VPC dibagi menjadi beberapa sub-jaringan terisolasi (segmentasi VPC/Subnets) dengan perlindungan NAT Gateway:
1. **Frontend VPC Subnet (Public Subnet):** Tempat menempatkan VM Frontend (Web Server Nginx yang melayani static assets React). Subnet ini bersifat public karena harus dapat diakses langsung oleh client via internet melalui bantuan Internet Gateway.
2. **Backend VPC Subnet (Private Subnet):** Tempat menjalankan aplikasi API Node.js Express. Subnet ini bersifat private untuk keamanan. Ia tidak menerima trafik masuk secara langsung dari luar melainkan hanya dari Frontend VM via port 5000. Untuk mengakses layanan internet luar (seperti memanggil API Google Gemini), Backend VM merutekan koneksi keluar (*outbound*) secara aman melewati **AWS NAT Gateway** yang diletakkan di public subnet.
3. **Database VPC Subnet (Private Subnet):** Subnet paling terisolasi untuk database MySQL RDS. Database diletakkan di subnet ini tanpa IP Publik, hanya dapat diakses secara internal oleh Backend VM melalui port 3306.
4. **Cloudflare R2 Storage (Multi-Cloud Bridge):** Jaringan dan media penyimpanan object storage di luar AWS (Cloudflare) yang diakses privat melalui kredensial token terenkripsi.

```
       [ CLIENT BROWSER ]
               │
               ▼ (Port 80/8080 - Cloudflare CDN)
   ┌───────────────────────┐
   │  Frontend Subnet (Pub)│  (AWS EC2 Instance)
   │  [ Frontend React VM ]│
   └───────────┬───────────┘
               │
               ▼ (Port 5000 - Internal Routing)
   ┌───────────────────────┐        ┌───────────────────────┐
   │  Backend Subnet (Priv)│───────>│  NAT Gateway (Public) │ ──> [ Google Gemini API ]
   │  [ Backend Node.js ]  │        └───────────────────────┘
   └───────┬───────────┬───┘
           │           │
           │(Port 3306)│ (API Request HTTPS - Port 443)
           ▼           ▼
   ┌───────────────┐ ┌───────────────┐
   │ Database Subnet │ │ Cloudflare R2 │
   │  [ AWS RDS    │ │  [ CDN-Backed │
   │    MySQL ]    │ │   Storage ]   │
   └───────────────┘ └───────────────┘
```

### 3.2 Topologi Jaringan & Aturan Keamanan (Firewall / Security Groups)
Keamanan lalu lintas data pada topologi jaringan ini diatur secara ketat melalui AWS Security Groups (Firewall):
* **Rule 1 (Ingress Frontend):** Izinkan trafik TCP port 80/8080/22 dari source `0.0.0.0/0` (semua alamat internet) ke instance dengan tag `frontend-vm`.
* **Rule 2 (Ingress Backend):** Izinkan trafik TCP port 5000 hanya jika sumbernya memiliki Security Group ID `frontend_sg`. Blokir seluruh trafik dari source lain.
* **Rule 3 (Ingress Database):** Izinkan trafik TCP port 3306 hanya jika sumbernya memiliki Security Group ID `backend_sg`. Blokir seluruh akses luar langsung.
* **Rule 4 (Private Subnet Routing):** Rute default `0.0.0.0/0` pada private subnet backend dialihkan menuju target `nat_gateway_id` untuk memastikan backend aman saat terhubung ke internet.

### 3.3 Pendekatan Multi-Cloud dengan Cloudflare R2 Object Storage
Ketentuan wajib pada arsitektur infrastruktur proyek ini adalah penerapan **Multi-Cloud**. Hal ini bertujuan untuk menghindari *vendor lock-in* (ketergantungan pada satu provider cloud) dan meningkatkan *disaster recovery* (pemulihan bencana) serta optimalisasi biaya penyimpanan.

Dalam rancangan sistem produksi EduMentor AI:
* **Layanan Utama (Compute & Database):** Dihosting di cloud provider utama, yaitu **Amazon Web Services (AWS)** menggunakan EC2 (untuk Frontend dan Backend VM) dan RDS MySQL (untuk database).
* **Layanan Object Storage (Bucket):** Menggunakan **Cloudflare R2 Storage** untuk menampung file PDF, Word, atau dokumen belajar yang diunggah pengguna.

Cloudflare R2 menggunakan API yang sepenuhnya kompatibel dengan standar AWS S3 (S3-Compatible API). Backend API Node.js di AWS EC2 berkomunikasi secara aman dengan Cloudflare R2 Bucket menggunakan SDK S3 Node.js (`@aws-sdk/client-s3`) dengan mengonfigurasi endpoint kustom (`https://<account_id>.r2.cloudflarestorage.com`) yang terenkripsi.

### 3.4 Distribusi Konten & Akses Cepat dengan Cloudflare CDN
Untuk mempercepat waktu muat halaman aplikasi (*loading time*) bagi pengguna di berbagai lokasi geografis, sistem diintegrasikan dengan **Cloudflare CDN (Content Delivery Network)**:
1. **Proxy Frontend CDN:** DNS Record domain aplikasi utama diarahkan ke IP Publik Frontend VM AWS EC2 dengan status proxy aktif (`proxied = true`). Cloudflare bertindak sebagai CDN dan Web Application Firewall (WAF) di depan server AWS Anda, menyaring ancaman DDoS dan men-cache aset statis frontend (JS, CSS, HTML).
2. **Proxy Storage CDN:** DNS Record subdomain penyimpanan file (misalnya `materials.domain.com`) dipetakan secara CNAME ke R2 Storage endpoint dengan status proxy aktif. Semua berkas materi PDF berukuran besar di-cache di *Edge Locations* Cloudflare di seluruh dunia, memungkinkan transfer file yang sangat cepat dengan latensi seminimal mungkin.

---

## BAB IV: INTEGRASI ARTIFICIAL INTELLIGENCE (AI)

### 4.1 Peran AI Engine di EduMentor AI
Kecerdasan Buatan (AI) bertindak sebagai generator konten pembelajaran adaptif utama di aplikasi ini. Integrasi AI dipusatkan pada backend API menggunakan model besar (Large Language Model) dari keluarga Gemini. EduMentor AI menggunakan API Google Gemini secara langsung tanpa perantara library berat pihak ketiga guna menjaga latensi API sekecil mungkin.

### 4.2 Implementasi API Google Gemini
Pada berkas `backend/src/services/geminiService.js`, integrasi dilakukan menggunakan SDK resmi Google Gen AI (`@google/genai`):

```javascript
const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    timeout: 300000, // Menghindari kegagalan timeout untuk dokumen sangat panjang
  },
});
```

Model LLM yang ditargetkan adalah `gemma-4-26b-a4b-it` yang memiliki kemampuan penalaran instruksi terstruktur (instruction following) sangat tinggi, atau model cepat berlatensi rendah seperti `gemini-2.5-flash` tergantung kebutuhan skalabilitas sistem.

### 4.3 Rekayasa Prompt (Prompt Engineering) & Skema Penataan JSON
Untuk menjamin respons AI dapat dibaca dengan aman oleh sistem backend (sebelum dimasukkan ke database), digunakan teknik **Structured Prompting** dan **JSON Output Constraint**.

#### A. Pembuatan Ringkasan (generateSummary)
Prompt menginstruksikan model untuk meringkas dokumen secara padat maksimal 250 kata, menggunakan format Markdown, LaTeX untuk persamaan matematika/fisika, serta blockcode khusus untuk potongan kode pemrograman. Contoh prompt:
> "Kamu adalah tutor akademik profesional. Analisis materi berikut: [Teks Materi]. Buat ringkasan pembelajaran yang padat dan mudah dipahami mahasiswa. ATURAN: Gunakan Markdown, maksimal 250 kata, rumus matematika wajib menggunakan format LaTeX ($...$ atau $$...$$)."

#### B. Pembuatan Peta Pembelajaran (generateLearningPath)
Tantangan terbesar adalah memaksa model mengeluarkan format JSON yang 100% valid agar bisa diparse oleh backend dengan fungsi `JSON.parse()`. Prompt dirancang seketat mungkin:
> "Return JSON valid. Jangan gunakan markdown di luar field content. Contoh format: { 'modules': [ { 'title': '...', 'estimated_minutes': 20, 'content': '...' } ] }. Semua karakter backslash untuk LaTeX wajib di-escape ganda (\\\\) agar JSON valid."

Sistem backend juga dilengkapi fungsi pembersih substring JSON (`parseGeminiJson`) untuk memitigasi jika model AI tetap menyertakan tag markdown penutup codeblock seperti ` ```json ... ``` `.

---

## BAB V: CONTAINERIZATION & CI/CD PIPELINE

### 5.1 Dockerization (Dockerfile Frontend & Backend)
Proses containerization mengemas seluruh dependensi, library, dan runtime lingkungan aplikasi ke dalam sebuah *Image* Docker yang konsisten dan independen. Hal ini menjamin aplikasi berjalan dengan performa yang sama di komputer lokal developer (*development*), server pengujian (*staging*), maupun server produksi cloud (*production*).

#### A. Dockerfile Backend (`backend/Dockerfile`)
Dockerfile backend menggunakan pendekatan **multi-stage build** untuk mengurangi ukuran image akhir serta meningkatkan keamanan dengan tidak menyertakan modul development di runtime produksi.
* **Stage 1 (Builder):** Menginstal semua dependensi npm (`npm ci`), menyalin kode sumber backend, dan menyiapkan aplikasi.
* **Stage 2 (Runner):** Menggunakan image dasar node alpine yang sangat ringan, menginstal dependensi produksi saja (`npm ci --only=production`), lalu menyalin kode backend hasil kompilasi dari builder.

#### B. Dockerfile Frontend (`frontend/Dockerfile`)
Dockerfile frontend juga dirancang dengan konsep **multi-stage**:
* **Stage 1 (Builder):** Menginstal node modules, menerima argumen build `VITE_API_URL`, lalu mengompilasi kode React Vite menjadi file-file statis (HTML, JS, CSS) di folder `dist`.
* **Stage 2 (Server):** Menyalin folder `dist` tersebut ke dalam direktori server web **Nginx** (`/usr/share/nginx/html`). Nginx bertindak sebagai web server statis berkinerja tinggi yang mengekspos port 80.

### 5.2 Orkestrasi Container Lokal dengan Docker Compose
Untuk menyatukan dan menjalankan service frontend, backend, serta database secara lokal di komputer pengujian, digunakan `docker-compose.yml` di root direktori proyek. 
Sistem orkestrasi lokal ini mengonfigurasi:
1. **Network (`edumentor_network`):** Bridge network yang menghubungkan ketiga container agar saling mengenali host name masing-masing secara dinamis (misalnya, backend mengakses database via host name `mysql` bukan IP address mentah).
2. **Volume (`mysql_data`):** Untuk menjaga persistensi data basis data MySQL lokal meskipun container dihentikan atau dihapus.
3. **Database Initialization:** Melakukan mounting file SQL schema (`database/schema.sql`) ke folder `/docker-entrypoint-initdb.d/` pada MySQL container sehingga basis data dan tabel langsung terbuat secara otomatis saat compose pertama kali dijalankan.
4. **Healthcheck:** Container backend dikonfigurasi untuk hanya berjalan setelah database MySQL benar-benar siap menerima koneksi (berstatus `service_healthy`).

### 5.3 Alur Pipeline CI/CD Berbasis GitHub Actions
Penerapan CI/CD (*Continuous Integration & Continuous Deployment*) otomatis mengeliminasi proses deployment manual yang rentan terhadap kesalahan (*human error*). File `.github/workflows/ci-cd.yml` mendefinisikan 3 tahapan (*jobs*) utama:

```
[ PUSH CODE TO MAIN BRANCH ]
             │
             ▼
┌─────────────────────────┐
│  Job 1: Build & Test    │ ── Check linting & compile source code
└────────────┬────────────┘
             │ (Pass)
             ▼
┌─────────────────────────┐
│  Job 2: Dockerize &     │ ── Build Docker Images and push to
│         Push Registry   │    Docker Hub Registry with SHA Tags
└────────────┬────────────┘
             │ (Pass)
             ▼
┌─────────────────────────┐
│  Job 3: SSH Deploy      │ ── Execute script on Cloud VM to pull
│         to Staging/Prod │    latest images and restart services
└─────────────────────────┘
```

1. **Build & Test Job:** Dijalankan setiap kali ada push atau Pull Request ke branch `main`. Job ini bertugas mengunduh dependensi npm frontend & backend, memeriksa error kode, serta mengompilasi kode.
2. **Dockerize & Push Job:** Menggunakan Docker Buildx untuk membuild image Docker frontend & backend, lalu melakukan login dan mengunggah image ke registry publik (Docker Hub atau GitHub Container Registry) menggunakan tag `latest` dan tag unik berdasarkan commit SHA.
3. **Deploy Job:** Menggunakan SSH action untuk masuk ke VM produksi Cloud secara aman menggunakan private key SSH. Di dalam VM, skrip akan menarik repositori terbaru, login to Docker Hub, mengunduh image terbaru (`docker-compose pull`), dan melakukan restart service secara otomatis tanpa *downtime* (`docker-compose up -d --remove-orphans`).

---

## BAB VI: TUTORIAL DEPLOYMENT & MANUAL GUIDE

### 6.1 Prasyarat Deployment (Prerequisites)
Sebelum melakukan deployment, pastikan perangkat keras dan perangkat lunak berikut telah siap:
* **Sistem Operasi:** Windows (dengan Laragon/WSL), macOS, atau Linux Ubuntu.
* **Perangkat Lunak Lokal:** Docker Desktop (versi >= 24.0.0), Node.js (versi >= 20.x), dan Git.
* **Akun Layanan Cloud:** Akun Amazon Web Services (AWS) dengan kredensial aktif, Akun Cloudflare untuk domain & API Token R2, serta Google Gemini API Key.
* **Akun Docker Hub:** Untuk menyimpan image container di pipeline CI/CD.

### 6.2 Deployment Lokal Menggunakan Docker Compose
Ikuti langkah-langkah berikut untuk menjalankan EduMentor AI secara instan menggunakan Docker Compose di lingkungan lokal:

1. **Clone Repositori:**
   ```bash
   git clone https://github.com/username/edumentor-ai.git
   cd edumentor-ai
   ```

2. **Konfigurasi Variabel Lingkungan (.env):**
   Salin file `.env` di dalam folder `backend/` dan sesuaikan nilainya:
   ```env
   PORT=5000
   DB_HOST=mysql
   DB_USER=root
   DB_PASSWORD=rootpassword
   DB_NAME=edumentor
   JWT_SECRET=edumentor_secret_key_123
   GEMINI_API_KEY=AIzaSyYourGeminiApiKeyHere
   
   # Cloudflare R2 Credentials (Dikosongkan jika ingin local fallback)
   R2_ACCOUNT_ID=
   R2_ACCESS_KEY_ID=
   R2_SECRET_ACCESS_KEY=
   R2_BUCKET_NAME=
   R2_PUBLIC_URL=
   ```
   *(Catatan: Jika kredensial R2 dibiarkan kosong, sistem secara otomatis mengaktifkan fitur fallback ke local directory `backend/uploads/` sehingga aplikasi tetap dapat berjalan secara normal).*

3. **Jalankan Docker Compose:**
   ```bash
   docker-compose up -d --build
   ```

4. **Verifikasi Container:**
   Pastikan ketiga container berjalan dengan sukses:
   ```bash
   docker ps
   ```
   Aplikasi dapat diakses melalui browser pada alamat:
   * **Frontend React:** `http://localhost:8080`
   * **Backend API:** `http://localhost:5000`

### 6.3 Otomatisasi Infrastruktur Cloud Menggunakan Terraform (IaC)
Untuk menyediakan infrastruktur komputasi dan jaringan di AWS dan Cloudflare secara otomatis tanpa men-hardcode kata sandi atau token sensitif:

1. **Masuk ke Direktori Terraform:**
   ```bash
   cd terraform
   ```

2. **Konfigurasi Variabel Terraform (`terraform.tfvars`):**
   Buat berkas variabel `terraform.tfvars` untuk menginput nilai-nilai sensitif:
   ```hcl
   db_password           = "SangatRahasia123!"
   cloudflare_api_token  = "TokenApiCloudflareAnda"
   cloudflare_account_id = "AccountIdCloudflareAnda"
   cloudflare_zone_id    = "ZoneIdDomainAnda"
   app_domain            = "edumentor.ai"
   storage_domain        = "materials.edumentor.ai"
   ```

3. **Inisialisasi Provider Terraform:**
   ```bash
   terraform init
   ```

4. **Eksekusi Provisioning:**
   ```bash
   terraform apply -auto-approve
   ```
   Terraform akan otomatis membuat VPC AWS di region Sydney (`ap-southeast-2`), NAT Gateway, VM EC2 untuk frontend dan backend, DB RDS MySQL, Cloudflare R2 Bucket, serta DNS records (A & CNAME) dengan proxy CDN Cloudflare aktif secara otomatis.

### 6.4 Deployment Produksi Menggunakan Pipeline CI/CD
Agar otomatisasi deployment dari GitHub ke VM AWS EC2 berjalan dengan lancar, atur beberapa kredensial rahasia (*Secrets*) pada repositori GitHub Anda:

1. Masuk ke halaman repositori di GitHub.
2. Navigasikan ke **Settings** > **Secrets and variables** > **Actions**.
3. Tambahkan Secrets berikut:
   * `DOCKERHUB_USERNAME`: Username Docker Hub Anda.
   * `DOCKERHUB_TOKEN`: Personal Access Token Docker Hub.
   * `SERVER_HOST`: Alamat IP Publik VM AWS EC2 Anda.
   * `SERVER_USER`: Username akses SSH VM (misalnya: `ubuntu`).
   * `SERVER_SSH_KEY`: Isi dari file private key SSH (`.pem`) yang diunduh dari AWS EC2.

---

## BAB VII: MONITORING SISTEM & STRATEGI PEMELIHARAAN

### 7.1 Strategi Monitoring Sumber Daya VM
Dalam sistem produksi, monitoring kinerja VM komputasi (Frontend & Backend) sangat penting untuk menjaga ketersediaan sistem (*high availability*). Beberapa metrik utama yang harus dipantau meliputi:
1. **CPU Utilization:** Persentase penggunaan prosesor. Jika terus berada di atas 80% dalam waktu lama, perlu dilakukan *vertical scaling* (menaikkan tipe instance AWS EC2) atau *horizontal scaling*.
2. **Memory Usage (RAM):** Memantau kebocoran memori (*memory leaks*) pada proses Node.js backend.
3. **Disk I/O and Disk Space:** Memastikan media penyimpanan lokal tidak penuh oleh file-file log sistem atau file unggahan sementara.
4. **Network Bandwidth:** Memantau throughput lalu lintas data masuk (*ingress*) dan keluar (*egress*).

Penerapan monitoring dapat diintegrasikan dengan layanan bawaan cloud provider (seperti **AWS CloudWatch**) yang dikonfigurasi untuk mengirimkan notifikasi peringatan (*alerts*) langsung ke Slack atau Email jika salah satu metrik melampaui ambang batas kritis.

### 7.2 Manajemen Log Sistem (Logging)
Log sistem sangat krusial untuk melacak bug dan menganalisis kesalahan pada API secara real-time. Pada backend Node.js, disarankan menggunakan library logging terstruktur seperti `winston` atau `pino`.
Strategi log yang diterapkan:
* **Log Tingkat Kepentingan (Log Levels):** Membagi log ke dalam kategori `info`, `warn`, dan `error`.
* **Standard Output redirection:** Semua log diarahkan ke standard output (stdout) sesuai prinsip *12-Factor App*, lalu ditangkap oleh Docker daemon.
* **Log Rotation:** Membatasi ukuran file log lokal pada server produksi agar tidak memenuhi kapasitas hard disk.

### 7.3 Strategi Backup Database & Skalabilitas (Autoscaling)
**Strategi Backup Database:**
* **Automated Daily Backup AWS RDS:** Database MySQL RDS dikonfigurasi untuk melakukan snapshot backup data otomatis setiap hari pada jam sepi trafik (misalnya pukul 02.00 dini hari). File backup disimpan secara aman di S3/R2 terenkripsi dan disimpan selama minimal 30 hari.
* **Point-in-Time Recovery (PITR):** Mengaktifkan binlog (*binary logging*) pada RDS MySQL agar data dapat direstorasi hingga ke menit atau detik tertentu sebelum terjadinya kegagalan sistem.

**Autoscaling (Skalabilitas Otomatis):**
Untuk menghadapi lonjakan trafik mahasiswa menjelang pekan ujian:
* **Horizontal Pod/VM Autoscaler:** Mengonfigurasi Auto Scaling Group (ASG) di AWS berdasarkan CPU threshold. Jika rata-rata utilisasi CPU dari VM backend melampaui 70%, Cloud Load Balancer akan menginstruksikan ASG untuk meluncurkan VM backend baru secara dinamis.

---

## BAB VIII: KESIMPULAN DAN REKOMENDASI

### 8.1 Kesimpulan
Proyek pengembangan **EduMentor AI** berhasil membuktikan bahwa kombinasi teknologi *Cloud Computing* dan *Artificial Intelligence* dapat diintegrasikan secara efektif untuk mendukung SDGs No. 4 (Pendidikan Berkualitas). 
Berdasarkan pengerjaan dan pengujian sistem, dapat ditarik beberapa kesimpulan penting:
1. Aplikasi EduMentor AI mampu menyediakan fitur pembelajaran adaptif secara andal, memproses file akademis (PDF, Word, TXT), merangkum konten dengan bantuan Google Gemini API, serta menghasilkan kurikulum belajar mandiri bertahap.
2. Arsitektur *Cloud Native* yang diimplementasikan melalui isolasi jaringan (VPC segmentasi subnets) dan perlindungan NAT Gateway meningkatkan keamanan infrastruktur aplikasi secara signifikan dengan membatasi akses database dan backend dari internet luar.
3. Penerapan pendekatan *Multi-Cloud* (komputasi utama di AWS Sydney, dan penyimpanan berkas dokumen di Cloudflare R2 Object Storage) berhasil memisahkan beban data dan mencegah ketergantungan penuh pada satu vendor cloud.
4. Penggunaan kontainer (Docker) dan orkestrasi (Docker Compose) mempermudah replikasi lingkungan sistem sehingga proses deployment lokal maupun cloud menjadi konsisten dan bebas dari kendala kecocokan versi OS (*environment parity*).
5. Pipeline CI/CD yang terintegrasi penuh melalui GitHub Actions mempercepat siklus rilis dan memastikan deployment berjalan secara otomatis dan aman.

### 8.2 Rekomendasi Pengembangan Lanjutan
Untuk meningkatkan skalabilitas dan fitur EduMentor AI di masa mendatang, direkomendasikan beberapa langkah pengembangan berikut:
1. **Implementasi Autoscaling VM & Serverless:** Bermigrasi ke arsitektur serverless (seperti AWS Fargate) untuk backend API agar alokasi resource komputasi dapat membesar dan mengecil secara instan sesuai beban request tanpa perlu mengelola server virtual secara manual.
2. **Penyempurnaan Parser Dokumen:** Mengintegrasikan model *OCR (Optical Character Recognition)* seperti AWS Textract pada ekstraksi teks untuk mendukung dokumen PDF hasil scan gambar atau tulisan tangan.
3. **Penyusunan Konten Multimedia AI:** Mengembangkan AI engine agar mampu menghasilkan peta konsep grafis (diagram alir menggunakan mermaid.js) secara visual pada modul pembelajaran, serta rekomendasi video penjelasan materi terkait secara otomatis dari YouTube API.
4. **Peningkatan Sistem Keamanan:** Mengintegrasikan WAF (Web Application Firewall) di layer Cloudflare CDN untuk melindungi API dari serangan umum seperti SQL Injection, Cross-Site Scripting (XSS), dan serangan DDoS.
