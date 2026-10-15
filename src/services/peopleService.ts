import { prisma } from '../config/prisma';
import { BaseService, withDates } from './baseService';
import { parseCpf } from '../utils/cpf';

export const peopleService = new BaseService(prisma.people, {
  include: { user: true },
  mapCreate: (data) => ({ ...withDates(data, ['dateBith']), document: parseCpf(data.document) }),
  mapUpdate: (data) => ({
    ...withDates(data, ['dateBith']),
    ...(data.document !== undefined && { document: parseCpf(data.document) }),
  }),
});
