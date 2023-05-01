import express from 'express';
import controller from './cryptoController';

const router = express.Router();

router.post('/crypto', controller.create);
router.get('/crypto', controller.getAll);
router.get('/cryptoList', controller.getList);
router.post('/getCryptoPriceByDate', controller.getCryptoPriceByDate);
router.post('/search', controller.search);

export default router;
