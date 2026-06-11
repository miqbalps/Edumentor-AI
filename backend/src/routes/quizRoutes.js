const router=require("express").Router();

const authMiddleware=
  require("../middleware/authMiddleware");

const {
  getQuiz,
  submitQuiz,
  getQuizByMaterial,
  getQuizHistory,
  getQuizReview,
  deleteQuizAttempt
}=require(
  "../controllers/quizController"
);

router.get(
  "/history",
  authMiddleware,
  getQuizHistory
);

router.get(
  "/material/:materialId",
  authMiddleware,
  getQuizByMaterial
);

router.get(
  "/attempts/:attemptId/review",
  authMiddleware,
  getQuizReview
);

router.delete(
  "/attempts/:attemptId",
  authMiddleware,
  deleteQuizAttempt
);

router.get(
  "/:id",
  authMiddleware,
  getQuiz
);

router.post(
  "/:id/submit",
  authMiddleware,
  submitQuiz
);

module.exports=router;