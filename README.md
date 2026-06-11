# EduMentor AI: Cloud Native adaptive Learning LMS with AI Integration
**Mendukung Sustainable Development Goals (SDGs) No. 4: Pendidikan Berkualitas**

EduMentor AI adalah aplikasi Learning Management System (LMS) berbasis *Cloud Native* dan *Multi-Cloud* yang memanfaatkan kecerdasan buatan (*Artificial Intelligence*) untuk menyusun pembelajaran adaptif (*adaptive learning*) secara otomatis dari dokumen materi kuliah yang diunggah pengguna.

---

## 🚀 Fitur Utama

- **Unggah Dokumen:** Ekstraksi teks otomatis dari file PDF, Word (.docx), dan Teks (.txt).
- **AI Ringkasan Materi (Summary):** Menghasilkan ringkasan padat konsep inti perkuliahan dalam format Markdown dan rumus LaTeX.
- **AI Peta Belajar (Learning Path):** Menyusun dokumen panjang menjadi 4-6 modul belajar yang terurut secara logis lengkap dengan estimasi waktu baca.
- **Alur Belajar Sekuensial (Adaptive Learning Progress):** Modul ke-`n` hanya dapat diakses setelah modul ke-`n-1` selesai dipelajari. Kuis akhir hanya terbuka setelah semua modul selesai.
- **AI Kuis Kognitif (Quiz Generator):** Membuat 10 pertanyaan pilihan ganda interaktif dengan tingkat kesulitan yang bervariasi beserta pembahasan rasionil jawaban.
- **AI Tutor Akademik (Context-Aware Tutor):** Chatbot tutor interaktif untuk berkonsultasi mengenai materi dokumen secara spesifik tanpa halusinasi informasi di luar materi.

---

## 📐 Arsitektur Sistem & Cloud Native

EduMentor AI dirancang menggunakan standar arsitektur cloud native modern dengan segmentasi jaringan VPC (Virtual Private Cloud) terisolasi di AWS:

1. **Frontend Subnet (Public):** Menjalankan React (Vite) Web App di dalam container Nginx dengan akses publik.
2. **Backend Subnet (Private):** Menjalankan RESTful API Node.js Express. Hanya dapat diakses dari Frontend VM (port 5000). Menggunakan **AWS NAT Gateway** untuk koneksi keluar secara aman (port 443) saat memanggil API Gemini.
3. **Database Subnet (Private):** Database **AWS RDS MySQL** yang terisolasi total, hanya menerima trafik dari Backend VM (port 3306).
4. **Multi-Cloud Bucket Storage:** Penyimpanan dokumen akademis terisolasi menggunakan **Cloudflare R2 Storage**, terpisah dari provider hosting komputasi utama (AWS) untuk kepatuhan arsitektur Multi-Cloud. Didistribusikan secara cepat menggunakan **Cloudflare CDN**.

---

## 🛠️ Tech Stack

- **Frontend:** React (Vite), TailwindCSS v4, React Router, React Markdown, Rehype KaTeX.
- **Backend:** Node.js, Express, Multer, PDF-Parse, Mammoth.
- **Database:** AWS RDS MySQL 8.0.
- **AI Engine:** Google Gemini API (Model `gemma-4-26b-a4b-it` / `gemini-2.5-flash`).
- **Object Storage:** Cloudflare R2 (menggunakan S3-compatible client `@aws-sdk/client-s3`).
- **CDN & DNS:** Cloudflare CDN.
- **Containerization:** Docker, Docker Compose.
- **Infrastructure as Code (IaC):** Terraform (AWS & Cloudflare provider).
- **CI/CD Pipeline:** GitHub Actions.

---

## 📂 Struktur Repositori

```text
edumentor-ai/
├── .github/workflows/   # Pipeline CI/CD GitHub Actions
│   └── ci-cd.yml
├── backend/             # Source Code Backend (Node.js Express)
│   ├── src/             # Logika API & Controllers
│   ├── uploads/         # Fallback penyimpanan file lokal
│   ├── Dockerfile       # Konfigurasi container backend
│   └── package.json
├── database/            # Skema Basis Data
│   └── schema.sql
├── docs/                # Laporan Resmi & Draf HKI
│   ├── laporan_cloud_computing.md
│   └── draft_hki.md
├── frontend/            # Source Code Frontend (React Vite)
│   ├── src/             # Komponen & Halaman React
│   ├── Dockerfile       # Konfigurasi container frontend
│   └── package.json
├── terraform/           # Infrastruktur IaC (AWS & Cloudflare)
│   └── main.tf
├── docker-compose.yml   # Orkestrasi local multi-container
└── README.md
```

---

## 🛠️ Cara Menjalankan Aplikasi

### A. Prasyarat (Prerequisites)
Pastikan Anda sudah menginstal:
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (versi terbaru)
- File Kredensial API Key Gemini dari Google AI Studio.

### B. Konfigurasi Environment (`.env`)
Buat file `.env` di dalam folder `backend/` dan sesuaikan nilainya:
```env
PORT=5000
DB_HOST=mysql
DB_USER=root
DB_PASSWORD=rootpassword
DB_NAME=edumentor
JWT_SECRET=edumentor_secret_token
GEMINI_API_KEY=AIzaSyYourGeminiApiKeyHere

# Cloudflare R2 Credentials (Opsional, jika kosong otomatis fallback ke penyimpanan lokal)
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
R2_PUBLIC_URL=
```

### C. Menjalankan Menggunakan Docker Compose (Instan)
Dari root folder repositori, jalankan perintah berikut di terminal:
```bash
docker-compose up -d --build
```
Aplikasi akan terbuild dan berjalan secara otomatis di latar belakang. Anda dapat mengakses layanan melalui browser:
- **Frontend App:** `http://localhost:8080`
- **Backend API:** `http://localhost:5000`

Untuk menghentikan seluruh layanan docker:
```bash
docker-compose down
```

---

## 📡 Dokumentasi API Utama

### 1. Autentikasi Pengguna
- **POST `/api/auth/register`** - Mendaftarkan akun baru.
- **POST `/api/auth/login`** - Mengembalikan token akses JWT jika berhasil.

### 2. Manajemen Materi
- **GET `/api/materials`** - Mengambil seluruh materi perkuliahan pengguna.
- **POST `/api/materials/upload`** - Unggah berkas dokumen (PDF/Word/TXT) menggunakan Multipart Form Data.
- **DELETE `/api/materials/:id`** - Menghapus materi beserta semua kuis, progress, dan berkas di Object Storage terkait.

### 3. Integrasi AI Engine
- **POST `/api/ai/summary/:id`** - Generate ringkasan materi akademis.
- **POST `/api/ai/learning-path/:id`** - Generate modul pembelajaran sekuensial.
- **POST `/api/ai/quiz/:id`** - Generate 10 kuis kognitif pilihan ganda.
- **POST `/api/ai/tutor/:id`** - Konsultasi interaktif dengan asisten AI tutor mengenai materi dokumen terkait.

---

## 📝 Dokumentasi Integrasi AI

### Prompt Engineering & Constraints
Semua interaksi AI diarahkan ke Google Gemini API menggunakan rekayasa instruksi (*prompt engineering*) yang ketat untuk memastikan format output terstruktur. Untuk fitur penyusunan *Learning Path* dan *Quiz*, model dipaksa mengembalikan representasi string format JSON valid yang dapat dibaca dan diparse secara langsung oleh backend Express sebelum disimpan ke database MySQL.

Contoh struktur skema JSON untuk Kuis:
```json
{
  "questions": [
    {
      "question": "Pertanyaan soal...",
      "option_a": "Opsi A",
      "option_b": "Opsi B",
      "option_c": "Opsi C",
      "option_d": "Opsi D",
      "correct_answer": "A",
      "explanation": "Penjelasan kunci jawaban..."
    }
  ]
}
```
Jika terjadi anomali pemformatan (misalnya AI mengembalikan tag code block markdown ` ```json ... ``` `), sistem parser backend akan membersihkan string tersebut terlebih dahulu secara otomatis.
