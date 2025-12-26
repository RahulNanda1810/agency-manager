const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth.middleware");

const auth = require("../middleware/auth.middleware");
const {
  createClient,
  getClients,
  getClientById,
  updateClient,
  deleteClient
} = require("../controllers/client.controller");


router.post("/", auth, createClient);
router.get("/", auth, getClients);
router.get("/:id", auth, getClientById);
router.put("/:id", authMiddleware, updateClient);
router.delete("/:id", authMiddleware, deleteClient);


module.exports = router;
const { createClientValidator, updateClientValidator } =
  require("../validators/client.validator");
const validate = require("../validators/validate");

router.post("/", authMiddleware, createClientValidator, validate, createClient);
router.put("/:id", authMiddleware, updateClientValidator, validate, updateClient);
