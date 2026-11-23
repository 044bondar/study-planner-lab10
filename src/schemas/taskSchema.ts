import { z } from 'zod';

export const PRIORITIES = ['low', 'medium', 'high'] as const;

export const taskSchema = z.object({
    title: z
        .string()
        .trim()
        .min(3, { error: 'Назва має містити щонайменше 3 символи' })
        .max(100, { error: 'Назва не довша за 100 символів' }),
    description: z.string().trim().max(300, { error: 'Опис не довший за 300 символів' }),
    category: z
        .string()
        .trim()
        .min(2, { error: 'Вкажіть категорію (мінімум 2 символи)' })
        .max(40, { error: 'Категорія не довша за 40 символів' }),
    priority: z.enum(PRIORITIES, { error: 'Оберіть пріоритет' }),
});

export type TaskSchemaData = z.infer<typeof taskSchema>;
