import { Router } from 'express';
import { generateQuestion } from '../controllers/productController';

const router = Router();

router.post('/generate-question', generateQuestion);

export default router;