import { Request, Response } from 'express';
import { CrudController, handleError } from './crudController';
import { movieService } from '../services/movieService';
import { sessionService } from '../services/sessionService';

export class MovieController extends CrudController {
  constructor() {
    super(movieService);
  }

  findSessions = async (req: Request, res: Response) => {
    try {
      const { date, includePast } = req.query;
      res.json(
        await sessionService.findByMovie(Number(req.params.id), {
          date: typeof date === 'string' ? date : undefined,
          includePast: includePast === 'true',
        }),
      );
    } catch (err) {
      handleError(res, err);
    }
  };
}
