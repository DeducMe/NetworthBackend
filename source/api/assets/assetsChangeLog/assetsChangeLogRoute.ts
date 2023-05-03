import express from 'express';
import controller from './assetsChangeLogController';

const router = express.Router();

router.post('/assetsChangeLog', controller.create);
router.get('/assetsChangeLog', controller.getAll);
router.delete('/assetsChangeLog/delete', controller.deleteRow);

export default router;
