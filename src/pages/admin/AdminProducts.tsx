import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Trash2, AlertCircle } from 'lucide-react';
import { productSchema, ProductFormValues } from '../../schemas/productSchemas';
import { productService } from '../../services/products';
import { erpService } from '../../services/erp';
import { useToast } from '../../contexts/ToastContext';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const AdminProducts: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { addToast } = useToast();

  const { 
    register, 
    control, 
    handleSubmit, 
    reset, 
    formState: { errors } 
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema) as any,
    defaultValues: {
      name: '',
      type: '',
      price: 0,
      discount: 0,
      description: '',
      quantity: 0,
      images: [''],
    } as any,
  });

  const { fields, append, remove } = useFieldArray({
    control: control as any,
    name: 'images',
  });

  const onSubmit: SubmitHandler<ProductFormValues> = async (data) => {
    setIsLoading(true);
    try {
      // 1. Create the product - Omit quantity from this payload as the backend likely doesn't expect it
      const { quantity, ...productData } = data;
      const payload = {
        ...productData,
        price: Number(data.price),
        discount: Number(data.discount || 0),
        images: data.images.filter(img => img && img.trim() !== ''),
      };

      const response = await productService.createProduct(payload);
      const newProduct = response.data;
      const productId = newProduct.id;

      // 2. Adjust stock if quantity is > 0
      const initialQuantity = Number(quantity || 0);
      if (productId && initialQuantity > 0) {
        try {
          await erpService.addStock({
            product_id: productId,
            quantity: initialQuantity,
            reference_id: 'Initial Stock'
          });
        } catch (stockError) {
          console.error('Falha ao definir estoque inicial', stockError);
          addToast('info', 'Produto criado, mas houve um erro ao definir o estoque inicial.');
        }
      }

      addToast('success', 'Produto criado com sucesso!');
      reset();
    } catch (error: any) {
      console.error('Falha ao criar produto', error);
      const errorMessage = error.response?.data?.message || 'Verifique os dados e tente novamente.';
      addToast('error', `Falha ao criar produto: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-4xl font-black text-creamy-800 tracking-tight">Gerenciar Produtos</h1>
          <p className="text-creamy-400 mt-2 font-medium">Adicione novos produtos à sua loja</p>
        </div>
      </div>

      <div className="card p-8 lg:p-12">
        <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Input
              label="Nome do Produto"
              placeholder="Ex: Teclado Mecânico RGB"
              {...register('name')}
              error={errors.name?.message}
            />
            <Input
              label="Categoria / Tipo"
              placeholder="Ex: Eletrônicos"
              {...register('type')}
              error={errors.type?.message}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Input
              label="Preço (R$)"
              type="number"
              step="0.01"
              placeholder="0.00"
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
            <Input
              label="Estoque Inicial"
              type="number"
              placeholder="0"
              {...register('quantity')}
              error={errors.quantity?.message}
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-creamy-700">Descrição</label>
            <textarea
              {...register('description')}
              rows={4}
              placeholder="Descreva as características do produto..."
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
                <Plus size={14} className="mr-1" /> Adicionar mais uma URL
              </button>
            </div>
            
            <div className="space-y-3">
              {fields.map((field, index) => (
                <div key={field.id} className="space-y-1">
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <input
                        {...register(`images.${index}` as const)}
                        placeholder="https://exemplo.com/imagem.jpg"
                        className={`input ${errors.images?.[index] ? 'border-red-400 focus:ring-red-400' : ''}`}
                      />
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
                  {errors.images?.[index] && (
                    <p className="text-xs text-red-500">{errors.images[index]?.message}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {Object.keys(errors).length > 0 && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start text-red-600 animate-in zoom-in-95 duration-300">
              <AlertCircle size={20} className="mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-bold">Existem erros no formulário:</p>
                <ul className="text-xs mt-1 list-disc list-inside opacity-80">
                  {Object.entries(errors).map(([key, error]: [string, any]) => (
                    <li key={key}>{error.message || `Erro em ${key}`}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          <div className="pt-6 border-t border-creamy-100 flex items-center justify-end">
            <Button type="submit" className="px-12 py-4 text-lg w-full sm:w-auto" isLoading={isLoading}>
              Criar Produto
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminProducts;
