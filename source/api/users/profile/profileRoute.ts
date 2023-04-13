import express from 'express';
import controller from './profileController';

const router = express.Router();

router.get('/profile', controller.get);
router.get('/profile/networth', controller.getNetworth);

router.put('/profile/currency', controller.setCurrency);

router.put('/profile', controller.put);

export default router;
