import { Request, Response } from 'express';
import { BaseService } from '../services/baseService';
import { AppError } from '../utils/appError';

// Filtros por query string: campos id* e codeTicket viram número (ex.: /tickets?idUser=1)
const parseFilters = (query: Request['query']) => {
  const where: Record<string, any> = {};
  for (const [key, value] of Object.entries(query)) {
    if (typeof value !== 'string') continue;
    where[key] = /^id|^codeTicket$/.test(key) ? Number(value) : value;
  }
  return where;
};

export function handleError(res: Response, err: any) {
  if (err instanceof AppError) {
    return res.status(err.status).json({ success: false, error: err.message });
  }
  switch (err?.code) {
    case 'P2025':
      return res.status(404).json({ success: false, error: 'Registro não encontrado' });
    case 'P2014':
      return res.status(409).json({ success: false, error: 'Registro já vinculado a outro (relação 1:1)' });
    case 'P2002':
      return res.status(409).json({ success: false, error: 'Registro duplicado', fields: err.meta?.target });
    case 'P2003':
      return res.status(400).json({ success: false, error: 'Relacionamento inválido (id referenciado não existe ou registro em uso)' });
  }
  if (err?.name === 'PrismaClientValidationError') {
    return res.status(400).json({ success: false, error: 'Dados inválidos', details: err.message.split('\n').slice(-3).join(' ') });
  }
  console.error(err);
  return res.status(500).json({ success: false, error: 'Erro interno' });
}

export class CrudController {
  constructor(private service: BaseService) {}

  getAll = async (req: Request, res: Response) => {
    try {
      res.json(await this.service.findAll(parseFilters(req.query)));
    } catch (err) {
      handleError(res, err);
    }
  };

  getById = async (req: Request, res: Response) => {
    try {
      const item = await this.service.findById(Number(req.params.id));
      if (!item) return res.status(404).json({ success: false, error: 'Registro não encontrado' });
      res.json(item);
    } catch (err) {
      handleError(res, err);
    }
  };

  create = async (req: Request, res: Response) => {
    try {
      res.status(201).json(await this.service.create(req.body ?? {}));
    } catch (err) {
      handleError(res, err);
    }
  };

  update = async (req: Request, res: Response) => {
    try {
      res.json(await this.service.update(Number(req.params.id), req.body ?? {}));
    } catch (err) {
      handleError(res, err);
    }
  };

  delete = async (req: Request, res: Response) => {
    try {
      await this.service.delete(Number(req.params.id));
      res.status(204).send();
    } catch (err) {
      handleError(res, err);
    }
  };
}
