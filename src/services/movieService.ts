import { prisma } from '../config/prisma';
import { BaseService, connectIds, setIds, withDates } from './baseService';

const dates = ['dateCreate', 'dateRelease'];

export const movieService = new BaseService(prisma.movie, {
  include: { categories: true },
  mapCreate: ({ categoryIds, ...data }) => ({ ...withDates(data, dates), categories: connectIds(categoryIds) }),
  mapUpdate: ({ categoryIds, ...data }) => ({ ...withDates(data, dates), categories: setIds(categoryIds) }),
});
