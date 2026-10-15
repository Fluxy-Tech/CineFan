import { prisma } from '../config/prisma';
import { BaseService, withDates } from './baseService';
import { defaultSeatLayout, normalizeSeats } from '../utils/seats';
import { AppError } from '../utils/appError';

type FindByMovieOptions = {
  date?: string; // YYYY-MM-DD, dia no horário de Brasília
  includePast?: boolean;
};

class SessionService extends BaseService {
  // Sessões de um filme em ordem de horário. Por padrão só as que ainda não começaram.
  async findByMovie(idMovie: number, { date, includePast = false }: FindByMovieOptions = {}) {
    const movie = await prisma.movie.findUnique({ where: { id: idMovie }, select: { id: true, title: true } });
    if (!movie) throw new AppError('Filme não encontrado', 404);

    const timeSession: { gte?: Date; lt?: Date } = {};
    if (date !== undefined) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new AppError('date deve estar no formato YYYY-MM-DD');
      const start = new Date(`${date}T00:00:00-03:00`);
      if (isNaN(start.getTime())) throw new AppError('date inválida');
      timeSession.gte = start;
      timeSession.lt = new Date(start.getTime() + 24 * 60 * 60 * 1000);
    }
    if (!includePast) {
      const now = new Date();
      if (!timeSession.gte || timeSession.gte < now) timeSession.gte = now;
    }

    const sessions = await prisma.session.findMany({
      where: { idMovie, timeSession },
      orderBy: { timeSession: 'asc' },
    });

    return {
      movie,
      total: sessions.length,
      sessions: sessions.map((s) => ({ ...s, availableCount: s.availableSeats.length })),
    };
  }
}

export const sessionService = new SessionService(prisma.session, {
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
