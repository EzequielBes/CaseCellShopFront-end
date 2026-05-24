import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Trash2 } from 'lucide-react';
import { productSchema, ProductFormValues } from '../../schemas/productSchemas';
import { productService } from '../../services/products';
import { useToast } from '../../contexts/ToastContext';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { SubmitHandler } from 'react-hook-form';

const AdminProducts: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { addToast } = useToast();

  const { register, control, handleSubmit, reset, formState: { errors } } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema) as any,
    defaultValues: {
      name: '',
      type: '',
      price: 0,
      discount: 0,
      description: '',
      images: [''],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'images' as never,
  });

  const onSubmit: SubmitHandler<ProductFormValues> = async (data) => {
    setIsLoading(true);
    try {
      await productService.createProduct(data);
      addToast('success', 'Produto criado com sucesso!');
      reset();
    } catch (error) {
      console.error('Falha ao criar produto', error);
      addToast('error', 'Falha ao criar produto. Verifique os dados e tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-4xl font-black text-creamy-800 tracking-tight">Gerenciar Produtos</h1>
          <p className="text-creamy-400 mt-2 font-medium">Adicione novos tesouros à sua loja</p>
        </div>
      </div>

      <div className="card p-8 lg:p-12">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Input
              label="Nome do Produto"
              placeholder="Vaso de Creme Minimalista"
              {...register('name')}
              error={errors.name?.message}
            />
            <Input
              label="Categoria / Tipo"
              placeholder="Decoração"
              {...register('type')}
              error={errors.type?.message}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Input
              label="Preço (R$)"
              type="number"
              step="0.01"
              placeholder="49.99"
              {...register('price')}
              error={errors.price?.message}
            />
            <Input
              label="Desconto (R$)"
              type="number"
              step="0.01"
              placeholder="0.00"
              {...register('discount')}
              error={errors.discount?.message}
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-creamy-700">Descrição</label>
            <textarea
              {...register('description')}
              rows={4}
              placeholder="Descreva a beleza e utilidade deste produto..."
              className={`input h-auto py-3 ${errors.description ? 'border-red-400 focus:ring-red-400' : ''}`}
            />
            {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description.message}</p>}
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-creamy-700">Imagens do Produto (URLs)</label>
              <button
                type="button"
                onClick={() => append('')}
                className="text-xs font-bold text-creamy-500 hover:text-creamy-700 flex items-center bg-creamy-50 px-3 py-1.5 rounded-lg transition-colors"
              >
                <Plus size={14} className="mr-1" /> Adicionar URL
              </button>
            </div>
            
            <div className="space-y-3">
              {fields.map((field, index) => (
                <div key={field.id} className="flex gap-2">
                  <div className="flex-1">
                    <input
                      {...register(`images.${index}` as const)}
                      placeholder="https://images.unsplash.com/..."
                      className={`input ${errors.images?.[index] ? 'border-red-400 focus:ring-red-400' : ''}`}
                    />
                    {errors.images?.[index] && (
                      <p className="text-xs text-red-500 mt-1">{errors.images[index]?.message}</p>
                    )}
                  </div>
                  {fields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="p-3 text-creamy-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={20} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="pt-6 border-t border-creamy-100 flex items-center justify-end">
            <Button type="submit" className="px-12 py-4 text-lg" isLoading={isLoading}>
              Criar Produto
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminProducts;