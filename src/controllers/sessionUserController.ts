import { Request, Response } from 'express';
import { CrudController, handleError } from './crudController';
import { sessionUserService } from '../services/sessionUserService';

export class SessionUserController extends CrudController {
  constructor() {
    super(sessionUserService);
  }

  // 200 (e não 201): o pedido foi aceito, mas a reserva dos assentos é confirmada depois, pelo worker
  create = async (req: Request, res: Response) => {
    try {
      res.status(200).json(await sessionUserService.create(req.body ?? {}));
    } catch (err) {
      handleError(res, err);
    }
  };
}
