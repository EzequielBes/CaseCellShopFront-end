import { z } from 'zod';

export const productSchema = z.object({
  name: z.string().min(1, 'O nome é obrigatório'),
  price: z.union([z.string(), z.number()]).refine(val => {
    if (typeof val === 'number') return val > 0;
    const clean = val.replace('R$', '').trim().replace('.', '').replace(',', '.');
    return !isNaN(parseFloat(clean)) && parseFloat(clean) > 0;
  }, 'O preço deve ser maior que zero'),
  discount: z.union([z.string(), z.number()]).optional().refine(val => {
    if (val === undefined || val === '') return true;
    if (typeof val === 'number') return val >= 0;
    const clean = val.replace('R$', '').trim().replace('.', '').replace(',', '.');
    return !isNaN(parseFloat(clean)) && parseFloat(clean) >= 0;
  }, 'O desconto não pode ser negativo').default(0),
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