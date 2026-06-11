const router = require("express").Router();

const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const {
  createMaterial,
  getMaterials,
  getMaterialById,
  getModulesByMaterial,
  uploadMaterial,
  completeModule,
  getMaterialProgress,
  deleteMaterial,
  updateMaterial,
} = require("../controllers/materialController");

router.get(
  "/",
  authMiddleware,
  getMaterials
);

router.post(
  "/upload",
  authMiddleware,
  upload.single("file"),
  uploadMaterial
);

router.post(
  "/",
  authMiddleware,
  createMaterial
);

router.get(
  "/:id",
  authMiddleware,
  getMaterialById
);

router.put(
  "/:id",
  authMiddleware,
  updateMaterial
);

router.delete(
  "/:id",
  authMiddleware,
  deleteMaterial
);

router.get(
  "/:id/modules",
  authMiddleware,
  getModulesByMaterial
);

router.get(
  "/:id/progress",
  authMiddleware,
  getMaterialProgress
);

router.post(
  "/modules/:moduleId/complete",
  authMiddleware,
  completeModule
);

module.exports = router;