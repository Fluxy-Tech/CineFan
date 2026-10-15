import { prisma } from '../config/prisma';
import { BaseService } from './baseService';

export const snacksUserService = new BaseService(prisma.snacksUser, {
  include: { snack: true },
});
