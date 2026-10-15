import { Request, Response } from 'express';
import { CrudController, handleError } from './crudController';
import { sessionService } from '../services/sessionService';
import { renderSessionSeatMap } from '../services/seatMapService';

export class SessionController extends CrudController {
  constructor() {
    super(sessionService);
  }

  seatMap = async (req: Request, res: Response) => {
    try {
      const png = await renderSessionSeatMap(Number(req.params.id));
      // Sem cache: a disponibilidade muda a cada reserva
      res.set({ 'Content-Type': 'image/png', 'Cache-Control': 'no-store' }).send(png);
    } catch (err) {
      handleError(res, err);
    }
  };
}
