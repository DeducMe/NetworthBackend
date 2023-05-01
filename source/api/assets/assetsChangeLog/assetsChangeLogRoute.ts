import express from 'express';
import controller from './assetsChangeLogController';

const router = express.Router();

router.post('/assetsChangeLog', controller.create);
router.get('/assetsChangeLog', controller.getAll);

export default router;
