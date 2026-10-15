import { Router } from 'express';
import { CrudController } from '../controllers/crudController';

export function crudRouter(controller: CrudController, router = Router()) {
  router.get('/', controller.getAll);
  router.get('/:id', controller.getById);
  router.post('/', controller.create);
  router.patch('/:id', controller.update);
  router.delete('/:id', controller.delete);
  return router;
}
