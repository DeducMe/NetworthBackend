import express from 'express';
import controller from './assetsController';

const router = express.Router();

router.post('/assets', controller.create);
router.post('/getAssets', controller.getAll);
router.delete('/assets/delete', controller.deleteRow);
router.get('/assets/filters', controller.getFilterVariants);

export default router;
