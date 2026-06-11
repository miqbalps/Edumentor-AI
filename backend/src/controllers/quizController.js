const pool=
  require("../config/db");

exports.getQuiz=
  async(req,res)=>{

    try{

      const quizId=
        req.params.id;

      const [quizRows]=
        await pool.query(
          `
          SELECT q.title AS quiz_title, m.title AS material_title, q.material_id AS material_id
          FROM quizzes q
          JOIN materials m ON m.id = q.material_id
          WHERE q.id = ?
          `,
          [quizId]
        );

      if(!quizRows.length){
        return res.status(404).json({ message: "Quiz tidak ditemukan" });
      }

      const [questions]=
        await pool.query(
          `
          SELECT
            id,
            question,
            option_a,
            option_b,
            option_c,
            option_d
          FROM quiz_questions
          WHERE quiz_id=?
          `,
          [quizId]
        );

      res.json({
        quiz_title: quizRows[0].quiz_title,
        material_title: quizRows[0].material_title,
        material_id: quizRows[0].material_id,
        questions: questions
      });

    }catch(error){

      res.status(500).json({
        message:error.message
      });

    }

  };

exports.submitQuiz=
  async(req,res)=>{

    try{

      const quizId=
        req.params.id;

      const {
        answers
      }=req.body;

      const [questions]=
        await pool.query(
          `
          SELECT *
          FROM quiz_questions
          WHERE quiz_id=?
          `,
          [quizId]
        );

      let score=0;

      questions.forEach(
        question=>{

          if(
            answers[
              question.id
            ]===
            question.correct_answer
          ){

            score++;

          }

        }
      );

      await pool.query(
        `
        INSERT INTO quiz_attempts
        (
          user_id,
          quiz_id,
          score,
          total_questions,
          answers
        )
        VALUES(?,?,?,?,?)
        `,
        [
          req.user.id,
          quizId,
          score,
          questions.length,
          JSON.stringify(answers)
        ]
      );

      res.json({
        score,
        total:
          questions.length,
        percentage:
          Math.round(
            (
              score/
              questions.length
            )*100
          )
      });

    }catch(error){

      res.status(500).json({
        message:error.message
      });

    }

  };

exports.getQuizByMaterial=async(req,res)=>{
  try{

    const materialId=
      req.params.materialId;

    const [rows]=
      await pool.query(
        `
        SELECT *
        FROM quizzes
        WHERE material_id=?
        LIMIT 1
        `,
        [materialId]
      );

    if(!rows.length){
      return res.json(null);
    }

    const quiz = rows[0];

    const [attempts]=
      await pool.query(
        `
        SELECT *
        FROM quiz_attempts
        WHERE quiz_id=? AND user_id=?
        ORDER BY id DESC
        LIMIT 1
        `,
        [quiz.id, req.user.id]
      );

    quiz.latest_attempt = attempts.length > 0 ? {
      ...attempts[0],
      percentage: Math.round((attempts[0].score / attempts[0].total_questions) * 100)
    } : null;

    res.json(quiz);

  }catch(error){

    res.status(500).json({
      message:error.message
    });

  }
};

exports.getQuizHistory=async(req,res)=>{
  try{

    const [rows]=
      await pool.query(
        `
        SELECT
          qa.id,
          qa.score,
          qa.total_questions,
          qa.created_at,
          q.title,
          q.id AS quiz_id
        FROM quiz_attempts qa
        JOIN quizzes q
        ON q.id=qa.quiz_id
        WHERE qa.user_id=?
        ORDER BY qa.created_at DESC
        `,
        [req.user.id]
      );

    res.json(rows);

  }catch(error){

    res.status(500).json({
      message:error.message
    });

  }
};

exports.getQuizReview=async(req,res)=>{
  try{

    const attemptId=req.params.attemptId;

    const [attemptRows]=
      await pool.query(
        `
        SELECT qa.quiz_id, qa.answers, q.title AS quiz_title, m.title AS material_title, q.material_id AS material_id
        FROM quiz_attempts qa
        JOIN quizzes q ON q.id = qa.quiz_id
        JOIN materials m ON m.id = q.material_id
        WHERE qa.id = ? AND qa.user_id = ?
        `,
        [attemptId, req.user.id]
      );

    if(!attemptRows.length){
      return res.status(404).json({ message: "Riwayat kuis tidak ditemukan" });
    }

    const { quiz_id, answers: answersJson, quiz_title, material_title, material_id } = attemptRows[0];
    const userAnswers = answersJson ? (typeof answersJson === 'string' ? JSON.parse(answersJson) : answersJson) : {};

    const [questions]=
      await pool.query(
        `
        SELECT
          id,
          question,
          option_a,
          option_b,
          option_c,
          option_d,
          correct_answer,
          explanation
        FROM quiz_questions
        WHERE quiz_id=?
        `,
        [quiz_id]
      );

    res.json({
      quiz_title,
      material_title,
      material_id,
      user_answers: userAnswers,
      questions: questions
    });

  }catch(error){

    res.status(500).json({
      message:error.message
    });

  }
};

exports.deleteQuizAttempt = async (req, res) => {
  try {
    const { attemptId } = req.params;

    const [result] = await pool.query(
      `DELETE FROM quiz_attempts WHERE id = ? AND user_id = ?`,
      [attemptId, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Riwayat kuis tidak ditemukan" });
    }

    res.json({ success: true, message: "Riwayat kuis berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};