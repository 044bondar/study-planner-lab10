import { z } from 'zod';

export const loginSchema = z.object({
    username: z.string().trim().min(1, { error: 'Вкажіть username' }),
    // Мінімум 6 символів — лише навчальна перевірка форми, а не правило безпеки
    password: z
        .string()
        .min(1, { error: 'Вкажіть пароль' })
        .min(6, { error: 'Пароль має містити щонайменше 6 символів' }),
});

export type LoginFormData = z.infer<typeof loginSchema>;
