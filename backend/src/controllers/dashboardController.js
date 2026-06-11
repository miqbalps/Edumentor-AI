const pool=require("../config/db");

exports.getStats=async(req,res)=>{
  try{

    const userId=req.user.id;

    const [[materials]]=await pool.query(`
      SELECT COUNT(*) total
      FROM materials
      WHERE user_id=?
    `,[userId]);

    const [[quizAttempts]]=await pool.query(`
      SELECT COUNT(*) total
      FROM quiz_attempts
      WHERE user_id=?
    `,[userId]);

    const [[avgScore]]=await pool.query(`
      SELECT AVG(
        (score*100)/total_questions
      ) avgScore
      FROM quiz_attempts
      WHERE user_id=?
    `,[userId]);

    const [[bestScore]]=await pool.query(`
      SELECT MAX(
        (score*100)/total_questions
      ) bestScore
      FROM quiz_attempts
      WHERE user_id=?
    `,[userId]);

    const [materialProgress]=await pool.query(`
      SELECT
      m.id,
      (
        SELECT COUNT(*)
        FROM learning_modules lm
        WHERE lm.material_id=m.id
      ) total_modules,
      (
        SELECT COUNT(*)
        FROM user_progress up
        JOIN learning_modules lm
        ON lm.id=up.module_id
        WHERE lm.material_id=m.id
        AND up.user_id=?
        AND up.is_completed=TRUE
      ) completed_modules
      FROM materials m
      WHERE m.user_id=?
    `,[userId,userId]);

    let completedMaterials=0;
    let inProgressMaterials=0;
    let notStartedMaterials=0;

    let totalModules=0;
    let totalCompletedModules=0;

    for(const item of materialProgress){

      totalModules+=item.total_modules;
      totalCompletedModules+=item.completed_modules;

      if(item.total_modules===0){
        continue;
      }

      if(item.completed_modules===0){
        notStartedMaterials++;
      }else if(
        item.completed_modules===item.total_modules
      ){
        completedMaterials++;
      }else{
        inProgressMaterials++;
      }

    }

    const overallProgress=
      totalModules===0
        ? 0
        : Math.round(
            (
              totalCompletedModules/
              totalModules
            )*100
          );

    const [recentMaterials]=await pool.query(`
      SELECT
      id,
      title,
      created_at
      FROM materials
      WHERE user_id=?
      ORDER BY id DESC
      LIMIT 5
    `,[userId]);

    const [recentActivities]=await pool.query(`
      SELECT * FROM (
        SELECT 
          'module' AS type,
          lm.title AS title,
          up.completed_at AS created_at,
          NULL AS score_pct
        FROM user_progress up
        JOIN learning_modules lm ON lm.id = up.module_id
        WHERE up.user_id = ? AND up.is_completed = TRUE

        UNION ALL

        SELECT 
          'quiz' AS type,
          q.title AS title,
          qa.created_at AS created_at,
          ROUND((qa.score * 100) / qa.total_questions) AS score_pct
        FROM quiz_attempts qa
        JOIN quizzes q ON q.id = qa.quiz_id
        WHERE qa.user_id = ?

        UNION ALL

        SELECT 
          'material' AS type,
          m.title AS title,
          m.created_at AS created_at,
          NULL AS score_pct
        FROM materials m
        WHERE m.user_id = ?
      ) AS activities
      ORDER BY created_at DESC
      LIMIT 5
    `,[userId, userId, userId]);

    res.json({
      totalMaterials:materials.total,
      completedMaterials,
      inProgressMaterials,
      notStartedMaterials,
      totalQuizAttempts:quizAttempts.total,
      averageScore:Math.round(
        avgScore.avgScore||0
      ),
      bestScore:Math.round(
        bestScore.bestScore||0
      ),
      overallProgress,
      recentMaterials,
      recentActivities
    });

  }catch(error){

    console.error(error);

    res.status(500).json({
      message:error.message
    });

  }
};