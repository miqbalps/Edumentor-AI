const pool = require("../config/db");
const fs = require("fs");
const {PDFParse} = require("pdf-parse");
const mammoth = require("mammoth");
const path=require("path");

const {
  generateSummary,
  generateLearningPath,
} = require("../services/geminiService");
const { uploadFile, deleteFile } = require("../services/storageService");

const extractText = async (
  filePath,
  mimeType
) => {

  if (
    mimeType ===
    "application/pdf"
  ) {

    const buffer =
      fs.readFileSync(filePath);

    const parser =
      new PDFParse({
        data: buffer
      });

    await parser.load();

    const result =
      await parser.getText();

    await parser.destroy();

    return result.text;
  }

  if (
    mimeType ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {

    const result =
      await mammoth.extractRawText({
        path: filePath
      });

    return result.value;
  }

  if (
    mimeType ===
    "text/plain"
  ) {

    return fs.readFileSync(
      filePath,
      "utf8"
    );
  }

  throw new Error(
    "Unsupported file type"
  );
};

const parseGeminiJson = (
  text
) => {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1) {
    throw new Error("Invalid Gemini JSON response");
  }
  const jsonContent = text.slice(start, end + 1);
  const sanitized = jsonContent.replace(/(?<!\\)\\(?!["\\/bfnrt]|u[0-9a-fA-F]{4})/g, "\\\\");
  return JSON.parse(sanitized);
};

exports.getMaterials = async (
  req,
  res
) => {
  try {
    const [rows] =
      await pool.query(
        `
        SELECT *
        FROM materials
        WHERE user_id = ?
        ORDER BY id DESC
        `,
        [req.user.id]
      );

    res.json(rows);
  } catch (error) {
    res.status(500).json({
      message:
        error.message,
    });
  }
};

exports.uploadMaterial=async(req,res)=>{
  try{
    if(!req.file){
      return res.status(400).json({
        success:false,
        message:"File is required"
      });
    }

    const content=await extractText(
      req.file.path,
      req.file.mimetype
    );

    if(!content||content.trim().length<20){
      return res.status(400).json({
        success:false,
        message:"Document content is empty"
      });
    }

    // Upload to bucket (or save local if credentials not available)
    const fileUrl = await uploadFile(req.file);

    const [result]=await pool.query(
      `
      INSERT INTO materials
      (
        user_id,
        title,
        file_url,
        content,
        summary_generated,
        learning_path_generated
      )
      VALUES(?,?,?,?,?,?)
      `,
      [
        req.user.id,
        req.file.originalname,
        fileUrl,
        content,
        false,
        false
      ]
    );

    res.status(201).json({
      success:true,
      materialId:result.insertId
    });

  }catch(error){

    console.error(error);

    res.status(500).json({
      success:false,
      message:error.message
    });

  }
};

exports.createMaterial = async (
  req,
  res
) => {
  try {
    const {
      title,
      content,
    } = req.body;

    if (
      !title ||
      !content
    ) {
      return res.status(400).json({
        message:
          "Title and content are required",
      });
    }

    const [result] =
      await pool.query(
        `
        INSERT INTO materials
        (
          user_id,
          title,
          content
        )
        VALUES(?,?,?)
        `,
        [
          req.user.id,
          title,
          content,
        ]
      );

    res.status(201).json({
      success: true,
      id: result.insertId,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message:
        error.message,
    });
  }
};

exports.getMaterialById=
  async(req,res)=>{
    try{

      const [rows]=
        await pool.query(
          `
          SELECT *
          FROM materials
          WHERE id=?
          AND user_id=?
          `,
          [
            req.params.id,
            req.user.id
          ]
        );

      if(!rows.length){
        return res.status(404).json({
          message:
            "Material not found"
        });
      }

      const material=
        rows[0];

      material.file_type=
        path.extname(
          material.file_url||""
        )
        .replace(".","")
        .toLowerCase();

      res.json(material);

    }catch(error){

      res.status(500).json({
        message:error.message
      });

    }
  };

exports.getModulesByMaterial=
  async(req,res)=>{
    try{

      const materialId=
        req.params.id;

      const userId=
        req.user.id;

      const [rows]=
        await pool.query(
          `
          SELECT
          lm.*,
          CASE
            WHEN up.id IS NULL
            THEN FALSE
            ELSE TRUE
          END completed
          FROM learning_modules lm
          LEFT JOIN user_progress up
          ON up.module_id=lm.id
          AND up.user_id=?
          AND up.is_completed=TRUE
          WHERE lm.material_id=?
          ORDER BY lm.order_number
          `,
          [
            userId,
            materialId
          ]
        );

      res.json(rows);

    }catch(error){

      res.status(500).json({
        message:error.message
      });

    }
  };

exports.completeModule =
  async (req, res) => {
    try {
      const moduleId =
        req.params.moduleId;

      const userId =
        req.user.id;

      const [existing] =
        await pool.query(
          `
          SELECT id
          FROM user_progress
          WHERE user_id = ?
          AND module_id = ?
          `,
          [
            userId,
            moduleId,
          ]
        );

      if (
        existing.length > 0
      ) {
        return res.json({
          success: true,
          message:
            "Already completed",
        });
      }

      await pool.query(
        `
        INSERT INTO user_progress
        (
          user_id,
          module_id,
          is_completed,
          progress_percentage,
          completed_at
        )
        VALUES(?,?,?,?,NOW())
        `,
        [
          userId,
          moduleId,
          true,
          100,
        ]
      );

      res.json({
        success: true,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message:
          error.message,
      });
    }
  };

exports.getMaterialProgress =
  async (req, res) => {
    try {
      const materialId =
        req.params.id;

      const userId =
        req.user.id;

      const [[total]] =
        await pool.query(
          `
          SELECT COUNT(*) total
          FROM learning_modules
          WHERE material_id = ?
          `,
          [materialId]
        );

      const [[completed]] =
        await pool.query(
          `
          SELECT COUNT(*) completed
          FROM user_progress up
          JOIN learning_modules lm
          ON lm.id = up.module_id
          WHERE lm.material_id = ?
          AND up.user_id = ?
          AND up.is_completed = TRUE
          `,
          [
            materialId,
            userId,
          ]
        );

      const percentage =
        total.total === 0
          ? 0
          : Math.round(
              (
                completed.completed /
                total.total
              ) * 100
            );

      res.json({
        totalModules:
          total.total,
        completedModules:
          completed.completed,
        percentage,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message:
          error.message,
      });
    }
  };

exports.deleteMaterial = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(
      `SELECT file_url FROM materials WHERE id = ? AND user_id = ?`,
      [id, req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "Materi tidak ditemukan" });
    }

    const { file_url } = rows[0];

    await pool.query(
      `DELETE FROM materials WHERE id = ? AND user_id = ?`,
      [id, req.user.id]
    );

    if (file_url) {
      await deleteFile(file_url);
    }

    res.json({ success: true, message: "Materi berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateMaterial = async (req, res) => {
  try {
    const { id } = req.params;
    const { title } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: "Judul materi tidak boleh kosong" });
    }

    const [result] = await pool.query(
      `UPDATE materials SET title = ? WHERE id = ? AND user_id = ?`,
      [title.trim(), id, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Materi tidak ditemukan" });
    }

    res.json({ success: true, message: "Judul materi berhasil diperbarui" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};