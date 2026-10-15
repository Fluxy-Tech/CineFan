import { prisma } from '../config/prisma';
import { BaseService } from './baseService';

export const categoryService = new BaseService(prisma.category);
