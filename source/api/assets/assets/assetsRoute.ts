import express from 'express';
import controller from './assetsController';

const router = express.Router();

router.post('/assets', controller.create);
router.post('/getAssets', controller.getAll);
router.delete('/assets/delete', controller.deleteRow);

export default router;
