import express from 'express';
import controller from './assetsAdditionalTypesController';

const router = express.Router();

router.get('/assetsTypes', controller.getAll);

export default router;
