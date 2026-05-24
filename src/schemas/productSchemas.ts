import { z } from 'zod';

export const productSchema = z.object({
  name: z.string().min(1, 'O nome é obrigatório'),
  price: z.coerce.number().positive('O preço deve ser maior que zero'),
  discount: z.coerce.number().min(0, 'O desconto não pode ser negativo').optional(),
  description: z.string().min(1, 'A descrição é obrigatória'),
  quantity: z.coerce.number().min(0, 'A quantidade não pode ser negativa').default(0),
  images: z
    .array(z.string())
    .min(1, 'Pelo menos uma imagem é obrigatória')
    .refine((urls) => urls.some(url => url.trim() !== ''), {
      message: 'Pelo menos uma URL de imagem válida é obrigatória',
    }),
  type: z.string().min(1, 'O tipo é obrigatório'),
});

export type ProductFormValues = z.infer<typeof productSchema>;