import { Router } from 'express';
import { UserController } from '../controllers/userController';
import { crudRouter } from './crudRouter';

const router = Router();
const userController = new UserController();

// Precisa vir antes de /:id
router.get('/by-document', userController.findUserByDocument);
router.get('/:id/purchases', userController.findPurchases);

export default crudRouter(userController, router);
