import { Router } from 'express';
import { MovieController } from '../controllers/movieController';
import { crudRouter } from './crudRouter';

const router = Router();
const movieController = new MovieController();

router.get('/:id/sessions', movieController.findSessions);

export default crudRouter(movieController, router);
