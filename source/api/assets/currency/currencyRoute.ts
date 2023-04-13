import express from 'express';
import controller from './currencyController';

const router = express.Router();

router.post('/currency', controller.create);
router.post('/currencyExchange', controller.exchangeCurrency);

router.get('/currency', controller.getAll);

export default router;
