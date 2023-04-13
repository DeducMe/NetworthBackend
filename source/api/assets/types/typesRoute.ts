import express from 'express';
import controller from './typesController';

const router = express.Router();

router.post('/types', controller.create);
router.get('/types', controller.getAll);

export default router;
