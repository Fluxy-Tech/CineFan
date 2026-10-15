// Delegate genérico do Prisma (prisma.movie, prisma.user, ...)
type Delegate = {
  findMany(args?: any): Promise<any[]>;
  findUnique(args: any): Promise<any>;
  create(args: any): Promise<any>;
  update(args: any): Promise<any>;
  delete(args: any): Promise<any>;
};

type Options = {
  include?: Record<string, any>;
  // Converte o body da requisição no formato "data" do Prisma (ex.: categoryIds -> connect)
  mapCreate?: (data: any) => any;
  mapUpdate?: (data: any) => any;
};

export class BaseService {
  constructor(private delegate: Delegate, private options: Options = {}) {}

  findAll(where: Record<string, any> = {}) {
    return this.delegate.findMany({ where, include: this.options.include, orderBy: { id: 'asc' } });
  }

  findById(id: number) {
    return this.delegate.findUnique({ where: { id }, include: this.options.include });
  }

  // O "id" é sempre gerado pelo banco (autoincremento): ignoramos se vier no body
  create({ id: _id, ...data }: any) {
    const mapped = this.options.mapCreate ? this.options.mapCreate(data) : data;
    return this.delegate.create({ data: mapped, include: this.options.include });
  }

  update(id: number, { id: _id, ...data }: any) {
    const mapped = this.options.mapUpdate ? this.options.mapUpdate(data) : data;
    return this.delegate.update({ where: { id }, data: mapped, include: this.options.include });
  }

  delete(id: number) {
    return this.delegate.delete({ where: { id } });
  }
}

// Helpers para relações many-to-many enviadas como lista de ids
export const connectIds = (ids?: number[]) =>
  ids ? { connect: ids.map((id) => ({ id })) } : undefined;

export const setIds = (ids?: number[]) =>
  ids ? { set: ids.map((id) => ({ id })) } : undefined;

export const withDates = (data: any, fields: string[]) => {
  const out = { ...data };
  for (const f of fields) if (out[f]) out[f] = new Date(out[f]);
  return out;
};
