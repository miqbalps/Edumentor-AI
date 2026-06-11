const router = require("express").Router();

const authMiddleware =
  require("../middleware/authMiddleware");

const {
  createSummary,
  createLearningPath,
  createQuiz,
  askMaterialTutor
} = require("../controllers/aiController");

router.post(
  "/summary/:id",
  authMiddleware,
  createSummary
);

router.post(
  "/learning-path/:id",
  authMiddleware,
  createLearningPath
);

router.post(
  "/quiz/:id",
  authMiddleware,
  createQuiz
);

router.post(
  "/tutor/:id",
  authMiddleware,
  askMaterialTutor
);

module.exports = router;