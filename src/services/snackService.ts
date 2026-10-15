import { prisma } from '../config/prisma';
import { BaseService } from './baseService';

export const snackService = new BaseService(prisma.snack);
