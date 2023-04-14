import express from 'express';
import controller from './cryptoController';

const router = express.Router();

router.post('/crypto', controller.create);
router.get('/crypto', controller.getAll);

export default router;
