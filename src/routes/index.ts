import { Router } from 'express';
import { CrudController } from '../controllers/crudController';
import { crudRouter } from './crudRouter';
import userRoutes from './userRoutes';
import { categoryService } from '../services/categoryService';
import { movieService } from '../services/movieService';
import { snackService } from '../services/snackService';
import { sessionService } from '../services/sessionService';
import { SessionUserController } from '../controllers/sessionUserController';
import { ticketService } from '../services/ticketService';
import { snacksUserService } from '../services/snacksUserService';
import { peopleService } from '../services/peopleService';

const routes = Router();

routes.use('/categories', crudRouter(new CrudController(categoryService)));
routes.use('/movies', crudRouter(new CrudController(movieService)));
routes.use('/snacks', crudRouter(new CrudController(snackService)));
routes.use('/sessions', crudRouter(new CrudController(sessionService)));
routes.use('/session-users', crudRouter(new SessionUserController()));
routes.use('/tickets', crudRouter(new CrudController(ticketService)));
routes.use('/snacks-users', crudRouter(new CrudController(snacksUserService)));
routes.use('/people', crudRouter(new CrudController(peopleService)));
routes.use('/users', userRoutes);

export default routes;
