import express from "express";
const router = express.Router();
import User from "../controllers/main";

router.get('/data', User.test);
// router.get('/test', User.getAllChargers);

module.exports = router;