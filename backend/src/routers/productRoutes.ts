import { Router } from 'express';
import { getProductReport, listProducts } from '../controllers/productController';

const router = Router();

router.get('/products', listProducts);
router.get('/products/:productId', getProductReport);

export default router;