import express from 'express';
import controller from './assetsController';

const router = express.Router();

router.post('/assets', controller.create);
router.post('/getAssets', controller.getAll);

export default router;
