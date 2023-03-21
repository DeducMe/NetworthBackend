import express from 'express';
import controller from './profileController';

const router = express.Router();

router.get('/profile', controller.get);
router.put('/profile', controller.put);

export default router;
