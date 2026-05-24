import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Endereço de e-mail inválido'),
  password: z.string().min(1, 'A senha é obrigatória'),
});

export const signupSchema = z.object({
  email: z.string().email('Endereço de e-mail inválido'),
  username: z.string().min(1, 'O nome de usuário é obrigatório'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
  role: z.enum(['user', 'admin']),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type SignupFormValues = z.infer<typeof signupSchema>;