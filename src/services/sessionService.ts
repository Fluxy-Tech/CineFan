import { prisma } from '../config/prisma';
import { BaseService, withDates } from './baseService';
import { defaultSeatLayout, normalizeSeats } from '../utils/seats';

export const sessionService = new BaseService(prisma.session, {
  include: { movie: true },
  // Sem availableSeats no body, a sessão nasce com o layout padrão da sala (A1..J12)
  mapCreate: ({ availableSeats, ...data }) => ({
    ...withDates(data, ['timeSession']),
    availableSeats: availableSeats === undefined ? defaultSeatLayout() : normalizeSeats(availableSeats),
  }),
  mapUpdate: ({ availableSeats, ...data }) => ({
    ...withDates(data, ['timeSession']),
    ...(availableSeats !== undefined && { availableSeats: normalizeSeats(availableSeats) }),
  }),
});
