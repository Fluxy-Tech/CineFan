import { Router } from 'express';
import { SessionController } from '../controllers/sessionController';
import { crudRouter } from './crudRouter';

const router = Router();
const sessionController = new SessionController();

router.get('/:id/seats.png', sessionController.seatMap);

export default crudRouter(sessionController, router);
