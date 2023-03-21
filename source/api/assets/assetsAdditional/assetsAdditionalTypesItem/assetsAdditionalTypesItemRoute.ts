import express from 'express';
import controller from './assetsAdditionalTypesItemController';

const router = express.Router();

router.post('/assetsTypesItem', controller.create);
router.get('/assetsTypesItem', controller.getAll);

export default router;
