const {GoogleGenAI}=require("@google/genai");

const ai=new GoogleGenAI({
  apiKey:process.env.GEMINI_API_KEY,
  httpOptions: {
    timeout: 300000, // 5 minutes
  },
});

async function generateSummary(content){

  const responseStream=
    await ai.models.generateContentStream({
      model:"gemma-4-26b-a4b-it",
      contents:`
    Kamu adalah tutor akademik profesional.

    Analisis materi berikut:

    ${content}

    Buat ringkasan pembelajaran yang padat dan mudah dipahami mahasiswa.

    ATURAN:

    - Gunakan Markdown.
    - Gunakan heading dan bullet list.
    - Maksimal 250 kata.
    - Fokus pada konsep inti.
    - Jangan menambahkan informasi yang tidak ada pada materi.
    - Jika terdapat kode program (source code) dalam penjelasan, Anda WAJIB menggunakan format code block markdown (fenced code block dengan tiga backticks \`\`\` nama_bahasa).

    Jika terdapat rumus matematika, statistik, machine learning, fisika, atau algoritma:

    - WAJIB gunakan LaTeX.
    - Inline equation gunakan:
    $rumus$

    - Block equation gunakan:

    $$
    rumus
    $$

    Format:

    # Ringkasan

    (paragraf 1-2)

    ## Poin Penting

    - poin 1
    - poin 2
    - poin 3
    - poin 4
    - poin 5

    # Kesimpulan

    (maksimal 2 kalimat)
    `
    });

  let text = "";
  for await (const chunk of responseStream) {
    if (chunk.text) {
      text += chunk.text;
    }
  }
  return text;
}

async function generateLearningPath(content){

  const responseStream=
    await ai.models.generateContentStream({
      model:"gemma-4-26b-a4b-it",
      contents:`
    Kamu adalah instructional designer, dosen universitas, dan penulis modul pembelajaran profesional.

    Materi:

    ${content}

    TUGAS:

    1. Analisis keseluruhan materi.
    2. Pecah menjadi 4-6 modul pembelajaran.
    3. Utamakan kedalaman materi dibanding jumlah modul.
    4. Setiap modul harus cukup lengkap untuk dipelajari secara mandiri.
    5. Jangan membuat modul terlalu pendek.

    ATURAN PENTING:

    - Return JSON valid.
    - Jangan gunakan markdown di luar field content (jangan membungkus response JSON ini dengan code block \`\`\`json ... \`\`\`).
    - Setiap modul harus terasa seperti satu halaman LMS.
    - Di dalam field "content", jika ada kode program (source code), Anda WAJIB menggunakan format code block markdown lengkap dengan tiga backticks pembuka (\`\`\`nama_bahasa) dan tiga backticks penutup (\`\`\`). Pastikan backticks tertulis lengkap di dalam string JSON tersebut. Contoh: "content": "Berikut adalah kodenya:\\n\\n\`\`\`python\\nprint('Halo')\\n\`\`\`"
    - Pisahkan setiap paragraf dengan baris kosong.
    - Gunakan heading markdown.

    RUMUS:

    Jika terdapat rumus matematika, statistik, machine learning, probabilitas, atau fisika:

    - WAJIB gunakan LaTeX.
    - Inline equation gunakan:
    $rumus$

    - Block equation gunakan:

    $$
    rumus
    $$

    Contoh:

    $$
    z=\\\\frac{x-\\\\mu}{\\\\sigma}
    $$

    - PENTING: Karena output berupa JSON, semua karakter backslash untuk rumus LaTeX WAJIB di-escape ganda (double backslash \\\\) agar JSON tetap valid. Contoh: tulis "\\\\frac" bukan "\\frac".

    STRUKTUR CONTENT WAJIB:

    # Tujuan Pembelajaran

    (paragraf)

    # Penjelasan Konsep

    (minimal 4-6 paragraf)

    # Poin Penting

    - poin 1
    - poin 2
    - poin 3
    - poin 4
    - poin 5

    # Contoh

    (minimal 2 paragraf)

    # Studi Kasus

    (minimal 2 paragraf)

    # Ringkasan Modul

    (minimal 1 paragraf)

    Format JSON:

    {
      "modules":[
        {
          "title":"...",
          "estimated_minutes":20,
          "content":"..."
        }
      ]
    }
    `
    });

  let text = "";
  for await (const chunk of responseStream) {
    if (chunk.text) {
      text += chunk.text;
    }
  }
  return text;
}

async function generateQuiz(
  materialTitle,
  materialContent
){

  const responseStream=
    await ai.models.generateContentStream({
      model:"gemma-4-26b-a4b-it",
      contents:`
    Kamu adalah dosen profesional.

    Materi:

    ${materialTitle}

    ${materialContent}

    Buat 10 soal pilihan ganda.

    ATURAN:

    - 4 soal mudah
    - 4 soal sedang
    - 2 soal sulit
    - Cakup seluruh materi
    - Jangan membuat soal yang jawabannya ambigu

    Return JSON valid.

    Format:

    {
      "questions":[
        {
          "question":"...",
          "option_a":"...",
          "option_b":"...",
          "option_c":"...",
          "option_d":"...",
          "correct_answer":"A",
          "explanation":"..."
        }
      ] 
    }
    `
    });

  let text = "";
  for await (const chunk of responseStream) {
    if (chunk.text) {
      text += chunk.text;
    }
  }
  return text;
}

async function askTutor(
  materialContent,
  question
){

  const responseStream=
    await ai.models.generateContentStream({
      model:"gemma-4-26b-a4b-it",
      contents:`
      Kamu adalah AI Tutor EduMentor.

      Jawab hanya berdasarkan materi berikut.

      MATERI:

      ${materialContent}

      PERTANYAAN:

      ${question}

      ATURAN:

      - Gunakan Markdown.
      - Gunakan heading jika diperlukan.
      - Gunakan bullet list jika relevan.
      - Jelaskan seperti dosen kepada mahasiswa.
      - Berikan contoh sederhana jika memungkinkan.
      - Jangan mengarang informasi di luar materi.
      - Jika Anda menuliskan atau menyertakan kode program (source code), Anda WAJIB menggunakan format markdown code block (tiga backticks \`\`\` nama_bahasa).

      Jika terdapat rumus:

      - Gunakan LaTeX.
      - Inline:
      $rumus$

      - Block:

      $$
      rumus
      $$

      Jika jawaban tidak ditemukan dalam materi, jawab tepat:

      "Informasi tersebut tidak ditemukan pada materi yang diupload."
      `
    });

  let text = "";
  for await (const chunk of responseStream) {
    if (chunk.text) {
      text += chunk.text;
    }
  }
  return text;
}

module.exports={
  generateSummary,
  generateLearningPath,
  generateQuiz,
  askTutor
};