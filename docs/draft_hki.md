# DRAFT PERMOHONAN PENDAFTARAN HAK CIPTA (HKI)
## PROGRAM KOMPUTER: EDUMENTOR AI

Format draf ini disusun untuk pengajuan Hak Kekayaan Intelektual (HKI) di bawah Direktorat Jenderal Kekayaan Intelektual (DJKI) Kementerian Hukum dan Hak Asasi Manusia Republik Indonesia.

---

### I. PROFIL FORMULIR PENGAJUAN

* **Jenis Permohonan:** Hak Cipta Baru
* **Jenis Ciptaan:** Program Komputer
* **Judul Ciptaan:** EduMentor AI - Sistem Pembelajaran Mandiri Adaptif Berbasis AI dengan Arsitektur Cloud Native dan Multi-Cloud Storage

---

### II. DATA PENCIPTA & PEMEGANG HAK CIPTA

* **Nama Kelompok / Lembaga:** Kelompok Cloud Computing AA-BB ITENAS
* **Daftar Anggota Pencipta:**
  1. (Nama Anggota 1) - NIM: (NIM Anggota 1)
  2. (Nama Anggota 2) - NIM: (NIM Anggota 2)
  3. (Nama Anggota 3) - NIM: (NIM Anggota 3)
* **Kewarganegaraan:** Indonesia
* **Alamat:** Jalan Penghulu K.H. Mustapa No. 23, Bandung, Jawa Barat, 40124
* **Lembaga Afiliasi:** Institut Teknologi Nasional (ITENAS) Bandung

---

### III. DATA PENGUMUMAN PERTAMA KALI

* **Tanggal Pengumuman:** 19 Juni 2025
* **Tempat/Kota Pengumuman:** Bandung, Indonesia
* **Negara Pengumuman:** Indonesia

---

### IV. URAIAN SINGKAT CIPTAAN (DESKRIPSI KARYA)

**EduMentor AI** merupakan suatu ciptaan program komputer berupa platform perangkat lunak berbasis web (*Learning Management System* / LMS) cerdas yang dirancang untuk mendukung konsep pembelajaran adaptif (*adaptive learning*) mandiri bagi pelajar maupun mahasiswa. Ciptaan ini dibangun menggunakan arsitektur modular yang membagi fungsionalitas sistem ke dalam Frontend berbasis React JS dan Backend berbasis Node.js Express.

Fitur inovasi utama yang menjadi hak kekayaan intelektual pada ciptaan program komputer ini meliputi:

1. **AI Document Parser & Text Extractor:** Modul backend cerdas yang mampu memproses berkas digital dokumen akademis (seperti PDF, .docx, dan .txt) secara otomatis, lalu mengekstrak seluruh konten tekstual mentah menggunakan parser independen tanpa merusak struktur dokumen asli.
2. **AI Cognitive Summary Generator:** Integrasi cerdas dengan API Large Language Model (LLM) Google Gemini untuk menghasilkan ringkasan akademis yang padat, terstruktur dengan format Markdown, serta mendukung notasi rumus matematika/sains dalam standar LaTeX secara otomatis.
3. **AI Adaptive Learning Path Creator:** Algoritma penyusun alur peta konsep belajar mandiri secara sekuensial. AI memotong dokumen materi yang panjang menjadi 4 hingga 6 modul pembelajaran adaptif lengkap dengan estimasi durasi belajar, yang disimpan ke database relasional dan diakses secara bertahap (*unlocked sequentially*) oleh pengguna berdasarkan kemajuan belajarnya.
4. **AI Interactive Cognitive Evaluator (Quiz Generator):** Sistem pembuat instrumen evaluasi kognitif otomatis yang menghasilkan 10 butir soal pilihan ganda interaktif dengan 3 tingkat kesulitan bervariasi (mudah, sedang, sulit) beserta penjelasan rasional jawaban.
5. **AI Context-Aware Academic Tutor Chatbot:** Layanan asisten akademik virtual (chatbot) berbasis AI yang bertindak sebagai tutor pribadi. Tutor ini membatasi basis pengetahuannya hanya pada teks materi dokumen akademis yang diunggah pengguna untuk menghindari bias informasi (*AI hallucination*).
6. **Multi-Cloud Native Infrastructure Bridge:** Sistem integrasi penyimpanan cloud (*Object Storage*) yang dirancang dengan metode multi-cloud. Program komputer dideploy secara kontainer (Docker) pada cloud provider utama (seperti AWS), sedangkan berkas dokumen digital diunggah secara multi-cloud ke bucket cloud provider pendukung (seperti Cloudflare R2) dengan sistem fallback penyimpanan lokal yang dinamis.

---

### V. KODE SUMBER UTAMA (SOURCE CODE SNIPPET) - LAMPIRAN WAJIB

Sebagai bagian dari persyaratan dokumentasi HKI DJKI, berikut disematkan potongan kode sumber inti yang merepresentasikan orisinalitas algoritma integrasi AI dan Multi-Cloud Bridge pada EduMentor AI:

#### 1. Algoritma Integrasi Gemini AI Engine (`geminiService.js`)
```javascript
const { GoogleGenAI } = require("@google/genai");
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function generateLearningPath(content) {
  const responseStream = await ai.models.generateContentStream({
    model: "gemma-4-26b-a4b-it",
    contents: `Analisis materi berikut: ${content}. Pecah menjadi 4-6 modul pembelajaran adaptif. Return JSON valid.`
  });
  let text = "";
  for await (const chunk of responseStream) {
    if (chunk.text) text += chunk.text;
  }
  return text;
}
```

#### 2. Algoritma Multi-Cloud Storage Gateway (`storageService.js`)
```javascript
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const fs = require("fs");
let s3Client = null;
const bucketName = process.env.R2_BUCKET_NAME;

if (process.env.R2_ACCOUNT_ID && process.env.R2_ACCESS_KEY_ID && bucketName) {
  s3Client = new S3Client({
    region: "auto",
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
  });
}

const uploadFile = async (file) => {
  if (s3Client && bucketName) {
    const destination = `materials/${Date.now()}_${file.originalname}`;
    const fileStream = fs.createReadStream(file.path);
    await s3Client.send(new PutObjectCommand({
      Bucket: bucketName,
      Key: destination,
      Body: fileStream,
      ContentType: file.mimetype
    }));
    const publicUrl = `${process.env.R2_PUBLIC_URL}/${destination}`;
    fs.unlink(file.path, () => {});
    return publicUrl;
  }
  return file.path.replace(/\\/g, "/");
};
```
