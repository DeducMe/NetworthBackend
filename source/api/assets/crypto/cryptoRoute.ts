import express from 'express';
import controller from './cryptoController';

const router = express.Router();

router.post('/crypto', controller.create);
router.get('/crypto', controller.getAll);
router.get('/crypto/list', controller.getList);
router.post('/getCryptoPriceByDate', controller.getCryptoPriceByDate);
router.post('/crypto/search', controller.search);
router.delete('/crypto/delete', controller.deleteRow);

export default router;
