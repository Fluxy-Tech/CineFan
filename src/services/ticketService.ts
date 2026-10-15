import { prisma } from '../config/prisma';
import { BaseService } from './baseService';

export const ticketService = new BaseService(prisma.ticketMoviesUser, {
  include: { movie: true, session: { select: { id: true, idMovie: true, timeSession: true } } },
});
