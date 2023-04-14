import express from 'express';
import controller from './stocksController';

const router = express.Router();

router.post('/stocks', controller.create);
router.get('/stocks', controller.getAll);
router.post('/stocks/find', controller.findStock);

export default router;
