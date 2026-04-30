import express from 'express';
import { loginWithGoogle } from '../controllers/auth.controller';

const router = express.Router();

router.post('/google', loginWithGoogle);

export default router;
