import { Router } from "express";
import { accessTokenValidation } from "../middlewares/validation.middleware.js";
const router = Router();

router.get("/add-contact", accessTokenValidation);
// router.post("/remove-contact", accessTokenValidation, );
// router.post("/list-contact", accessTokenValidation, );

export default router;
