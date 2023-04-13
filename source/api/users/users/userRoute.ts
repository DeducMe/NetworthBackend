import express from 'express';
import controller from './userController';

const router = express.Router();

router.post('/user/register', controller.create);
router.post('/user/login', controller.login);
router.post('/user/getById', controller.getUser); // get users byId Array
router.get('/user', controller.getAll);

export default router;
