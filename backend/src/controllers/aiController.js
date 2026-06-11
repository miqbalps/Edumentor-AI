const pool=require("../config/db");

const {
  generateSummary,
  generateLearningPath,
  generateQuiz,
  askTutor
}=require("../services/geminiService");

const parseGeminiJson=(text)=>{
  const start=
    text.indexOf("{");

  const end=
    text.lastIndexOf("}");

  if(
    start===-1||
    end===-1
  ){
    throw new Error(
      "Invalid Gemini JSON response"
    );
  }

  const jsonContent = text.slice(start, end + 1);
  const sanitized = jsonContent.replace(/(?<!\\)\\(?!["\\/bfnrt]|u[0-9a-fA-F]{4})/g, "\\\\");

  return JSON.parse(sanitized);
};

exports.createSummary=async(
  req,
  res
)=>{
  try{

    const materialId=
      req.params.id;

    const [rows]=
      await pool.query(
        `
        SELECT *
        FROM materials
        WHERE id=?
        AND user_id=?
        `,
        [
          materialId,
          req.user.id
        ]
      );

    const material=
      rows[0];

    if(!material){
      return res.status(404).json({
        success:false,
        message:
          "Material not found"
      });
    }

    if(!material.content){
      return res.status(400).json({
        success:false,
        message:
          "Material content is empty"
      });
    }

    if(material.summary){
      return res.json({
        success:true,
        summary:
          material.summary
      });
    }

    const summary=
      await generateSummary(
        material.content
      );

    await pool.query(
      `
      UPDATE materials
      SET
        summary=?,
        summary_generated=TRUE
      WHERE id=?
      `,
      [
        summary,
        materialId
      ]
    );

    res.json({
      success:true,
      summary
    });

  }catch(error){

    console.error(error);

    res.status(500).json({
      success:false,
      message:
        error.message
    });

  }
};

exports.createLearningPath=async(
  req,
  res
)=>{
  try{

    const materialId=
      req.params.id;

    const [rows]=
      await pool.query(
        `
        SELECT *
        FROM materials
        WHERE id=?
        AND user_id=?
        `,
        [
          materialId,
          req.user.id
        ]
      );

    const material=
      rows[0];

    if(!material){
      return res.status(404).json({
        success:false,
        message:
          "Material not found"
      });
    }

    if(!material.content){
      return res.status(400).json({
        success:false,
        message:
          "Material content is empty"
      });
    }

    const [existing]=
      await pool.query(
        `
        SELECT id
        FROM learning_modules
        WHERE material_id=?
        LIMIT 1
        `,
        [materialId]
      );

    if(existing.length>0){
      return res.json({
        success:true,
        message:
          "Learning path already exists"
      });
    }

    const result=
      await generateLearningPath(
        material.content
      );

    let parsed;
    try {
      parsed = parseGeminiJson(result);
    } catch (parseError) {
      const fs = require("fs");
      const path = require("path");
      const errorLogPath = path.join(__dirname, "../../uploads/learning_path_error.log");
      fs.writeFileSync(errorLogPath, result);
      console.error("Gemini JSON parsing failed. Raw response saved to:", errorLogPath);
      throw parseError;
    }

    if(
      !parsed.modules||
      !Array.isArray(
        parsed.modules
      )
    ){
      throw new Error(
        "Modules not found in Gemini response"
      );
    }

    for(
      let i=0;
      i<parsed.modules.length;
      i++
    ){

      const module=
        parsed.modules[i];

      await pool.query(
        `
        INSERT INTO learning_modules
        (
          material_id,
          title,
          content,
          order_number,
          estimated_minutes
        )
        VALUES(?,?,?,?,?)
        `,
        [
          materialId,
          module.title,
          module.content,
          i+1,
          module.estimated_minutes||15
        ]
      );
    }

    await pool.query(
      `
      UPDATE materials
      SET
        learning_path_generated=TRUE
      WHERE id=?
      `,
      [materialId]
    );

    res.json({
      success:true,
      moduleCount:
        parsed.modules.length,
      modules:
        parsed.modules
    });

  }catch(error){

    console.error(error);

    res.status(500).json({
      success:false,
      message:
        error.message
    });

  }
};

exports.createQuiz=
  async(req,res)=>{

    try{

      const materialId=
        req.params.id;

      const userId=
        req.user.id;

      const [materialRows]=
        await pool.query(
          `
          SELECT *
          FROM materials
          WHERE id=?
          AND user_id=?
          `,
          [
            materialId,
            userId
          ]
        );

      const material=
        materialRows[0];

      if(!material){

        return res.status(404).json({
          success:false,
          message:
            "Material not found"
        });

      }

      const [allModules]=
        await pool.query(
          `
          SELECT id
          FROM learning_modules
          WHERE material_id=?
          `,
          [materialId]
        );

      if(
        allModules.length===0
      ){

        return res.status(400).json({
          success:false,
          message:
            "Learning path belum dibuat"
        });

      }

      const [completedModules]=
        await pool.query(
          `
          SELECT up.module_id
          FROM user_progress up
          JOIN learning_modules lm
          ON lm.id=up.module_id
          WHERE lm.material_id=?
          AND up.user_id=?
          AND up.is_completed=TRUE
          `,
          [
            materialId,
            userId
          ]
        );

      if(
        completedModules.length!==
        allModules.length
      ){

        return res.status(400).json({
          success:false,
          message:
            "Selesaikan seluruh modul terlebih dahulu"
        });

      }

      const [existingQuiz]=
        await pool.query(
          `
          SELECT *
          FROM quizzes
          WHERE material_id=?
          LIMIT 1
          `,
          [materialId]
        );

      if(
        existingQuiz.length>0
      ){

        return res.json({
          success:true,
          quizId:
            existingQuiz[0].id,
          existing:true
        });

      }

      const [modules]=
        await pool.query(
          `
          SELECT
          title,
          content
          FROM learning_modules
          WHERE material_id=?
          ORDER BY order_number
          `,
          [materialId]
        );

      const modulesText=
        modules
          .map(
            module=>
              `
${module.title}

${module.content}
`
          )
          .join("\n\n");

      const result=
        await generateQuiz(
          material.title,
          modulesText
        );

      const parsed=
        parseGeminiJson(
          result
        );

      if(
        !parsed.questions||
        !Array.isArray(
          parsed.questions
        )
      ){

        throw new Error(
          "Questions not found in Gemini response"
        );

      }

      const [quizResult]=
        await pool.query(
          `
          INSERT INTO quizzes
          (
            material_id,
            title
          )
          VALUES(?,?)
          `,
          [
            materialId,
            `${material.title} Quiz`
          ]
        );

      const quizId=
        quizResult.insertId;

      for(
        const question
        of parsed.questions
      ){

        await pool.query(
          `
          INSERT INTO quiz_questions
          (
            quiz_id,
            question,
            option_a,
            option_b,
            option_c,
            option_d,
            correct_answer,
            explanation
          )
          VALUES(?,?,?,?,?,?,?,?)
          `,
          [
            quizId,
            question.question,
            question.option_a,
            question.option_b,
            question.option_c,
            question.option_d,
            question.correct_answer,
            question.explanation
          ]
        );

      }

      res.json({
        success:true,
        quizId,
        existing:false
      });

    }catch(error){

      console.error(error);

      res.status(500).json({
        success:false,
        message:
          error.message
      });

    }

  };
  
exports.askMaterialTutor=
  async(req,res)=>{
    try{

      const materialId=
        req.params.id;

      const {question}=
        req.body;

      if(!question){

        return res.status(400).json({
          message:"Question required"
        });

      }

      const [rows]=
        await pool.query(
          `
          SELECT *
          FROM materials
          WHERE id=?
          AND user_id=?
          `,
          [
            materialId,
            req.user.id
          ]
        );

      const material=
        rows[0];

      if(!material){

        return res.status(404).json({
          message:"Material not found"
        });

      }

      const answer=
        await askTutor(
          material.content,
          question
        );

      res.json({
        answer
      });

    }catch(error){

      console.error(error);

      res.status(500).json({
        message:error.message
      });

    }
  };