import { Request, Response } from 'express';
import { CrudController, handleError } from './crudController';
import { userService } from '../services/userService';

export class UserController extends CrudController {
  constructor() {
    super(userService);
  }

  findUserByDocument = async (req: Request, res: Response) => {
    try {
      const { document } = req.query;
      if (typeof document !== 'string') {
        return res.status(400).json({ success: false, error: 'Informe ?document=' });
      }
      const user = await userService.findByDocument(document);
      if (!user) return res.status(404).json({ success: false, error: 'Usuário não encontrado' });
      res.json({ success: true, client: user });
    } catch (err) {
      handleError(res, err);
    }
  };

  findPurchases = async (req: Request, res: Response) => {
    try {
      res.json(await userService.findPurchases(Number(req.params.id)));
    } catch (err) {
      handleError(res, err);
    }
  };
}
