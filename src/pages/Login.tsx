import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { loginSchema, LoginFormValues } from '../schemas/authSchemas';
import { authService } from '../services/auth';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

const Login: React.FC = () => {
  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const from = location.state?.from?.pathname || '/';

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
      const response = await authService.signin(data);
      login(response.data.access_token);
      addToast('success', 'Login realizado com sucesso!');
      navigate(from, { replace: true });
    } catch (err: any) {
      if (err.response?.status === 401) {
        addToast('error', 'E-mail ou senha inválidos');
      } else if (err.response?.status === 400) {
        addToast('error', 'Dados inválidos');
      } else {
        addToast('error', 'Erro interno do servidor');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="card w-full max-w-md p-8 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-creamy-600">Bem-vindo de volta</h1>
          <p className="text-creamy-400">Insira seus dados para entrar</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Endereço de E-mail"
            type="email"
            placeholder="exemplo@banco.com"
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
          <Button type="submit" className="w-full py-3" isLoading={isLoading}>
            Entrar
          </Button>
        </form>

        <p className="text-center text-sm text-creamy-500">
          Não tem uma conta?{' '}
          <Link to="/signup" className="text-creamy-600 font-semibold hover:underline">
            Cadastre-se
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;