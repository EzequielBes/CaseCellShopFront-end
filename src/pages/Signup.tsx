import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { signupSchema, SignupFormValues } from '../schemas/authSchemas';
import { authService } from '../services/auth';
import { useToast } from '../contexts/ToastContext';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

const Signup: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      role: 'user',
    },
  });

  const onSubmit = async (data: SignupFormValues) => {
    setIsLoading(true);
    try {
      await authService.signup(data);
      addToast('success', 'Conta criada com sucesso! Faça login para continuar.');
      navigate('/login');
    } catch (err: any) {
      if (err.response?.status === 409) {
        addToast('error', 'Já existe uma conta com este e-mail');
      } else if (err.response?.status === 400) {
        addToast('error', 'Dados inválidos');
      } else {
        addToast('error', 'Ocorreu um erro ao criar sua conta');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="card w-full max-w-md p-8 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-creamy-600">Criar Conta</h1>
          <p className="text-creamy-400">Junte-se à nossa comunidade hoje</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Nome de Usuário"
            type="text"
            placeholder="joaosilva"
            {...register('username')}
            error={errors.username?.message}
          />
          <Input
            label="Endereço de E-mail"
            type="email"
            placeholder="joao@exemplo.com"
            {...register('email')}
            error={errors.email?.message}
          />
          <Input
            label="Senha"
            type="password"
            placeholder="••••••••"
            {...register('password')}
            error={errors.password?.message}
          />
          
          <div className="space-y-1">
            <label className="block text-sm font-medium text-creamy-700">Função</label>
            <select
              {...register('role')}
              className="input bg-white"
            >
              <option value="user">Usuário</option>
              <option value="admin">Administrador</option>
            </select>
            {errors.role && <p className="text-xs text-red-500 mt-1">{errors.role.message}</p>}
          </div>

          <Button type="submit" className="w-full py-3" isLoading={isLoading}>
            Cadastrar
          </Button>
        </form>

        <p className="text-center text-sm text-creamy-500">
          Já tem uma conta?{' '}
          <Link to="/login" className="text-creamy-600 font-semibold hover:underline">
            Faça Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;