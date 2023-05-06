import express from 'express';
import controller from './currencyController';

const router = express.Router();

router.post('/currency', controller.create);
router.post('/currencyExchange', controller.exchangeCurrency);

router.post('/currency/list', controller.getAll);
router.get('/initCurrencies', controller.initCurrencies);

export default router;
