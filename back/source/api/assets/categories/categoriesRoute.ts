import express from 'express';
import controller from './categoriesController';

const router = express.Router();

router.post('/categories', controller.create);
router.get('/categories', controller.getAll);

export default router;
