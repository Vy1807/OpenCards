import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { signUp, getCurrentUser } from '../../entities/user/api/auth';
import { upsertProfile } from '../../entities/user/api/profiles';
import { apenasDigitos, validarCPF, validarTelefone } from '../../shared/lib/validators';
import { UserIcon } from '../../shared/ui/icons';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { MaskedInput } from '../../shared/ui';

const schema = z
  .object({
    nome: z.string().trim().min(2, 'Nome deve ter pelo menos 2 caracteres.'),
    email: z.string().trim().email('E-mail invalido.'),
    senha: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres.'),
    confirmarSenha: z.string(),
    cpf: z.string().refine(validarCPF, { message: 'CPF invalido.' }),
    telefone: z.string().refine(validarTelefone, { message: 'Telefone invalido.' }),
  })
  .refine((dados) => dados.senha === dados.confirmarSenha, {
    message: 'As senhas não coincidem.',
    path: ['confirmarSenha'],
  });

type CadastroData = z.infer<typeof schema>;

export default function Cadastro() {
  const navigate = useNavigate();
  const [erroForm, setErroForm] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [loadingCadastro, setLoadingCadastro] = useState(false);

  const {
    control,
    setError,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CadastroData>({
    resolver: zodResolver(schema),
    defaultValues: {
      nome: '',
      email: '',
      senha: '',
      confirmarSenha: '',
      cpf: '',
      telefone: '',
    },
  });

  const onSubmit = async (dados: CadastroData) => {
    setErroForm('');
    setSucesso('');
    try {
      await signUp(dados.email, dados.senha);

      const currentUser = await getCurrentUser();
      if (!currentUser) {
        throw new Error('Não foi possível restaurar a sessão após o cadastro.');
      }

      await upsertProfile({
        userId: currentUser.id,
        nome: dados.nome,
        cpf: apenasDigitos(dados.cpf) || null,
        telefone: apenasDigitos(dados.telefone) || null,
      });

      setSucesso('Conta criada com sucesso. Redirecionando...');
      setTimeout(() => navigate('/'), 800);
    } catch (err) {
      const mensagem = err instanceof Error ? err.message : 'Erro ao criar conta.';
      if (/already registered/i.test(mensagem)) {
        setError('email', {
          type: 'manual',
          message: 'Este e-mail já está em uso. Tente entrar.',
        });
      } else {
        setErroForm(mensagem);
      }
    } finally {
      setLoadingCadastro(false);
    }
  };

  const erroCampo = (nome: keyof CadastroData) => {
    const erro = errors[nome];
    if (!erro) return null;
    return (
      <p style={{ color: 'var(--err)', fontSize: 'var(--font-pequeno-size)', marginTop: '0.25rem' }}>
        {erro.message}
      </p>
    );
  };

  return (
    <div className="page" style={{ maxWidth: '720px', margin: '0 auto', padding: '1rem' }}>
      <div className="auth-card">
        <div className="auth-brand">
          <UserIcon size={32} style={{ verticalAlign: 'middle' }} />
          <span className="auth-brand-name">OpenCards</span>
        </div>

        <h1 className="auth-title">Criar sua conta</h1>
        <p className="auth-subtitle">
          Cadastre-se para começar a estudar com flashcards.
        </p>

        {erroForm && <p style={{ color: 'var(--err)', marginBottom: '1rem' }}>{erroForm}</p>}
        {sucesso && <p style={{ color: 'var(--ok)', marginBottom: '1rem' }}>{sucesso}</p>}

        <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
          <div className="auth-field">
            <label className="auth-label" htmlFor="cadastro-nome">
              Nome completo
            </label>
            <Controller
              name="nome"
              control={control}
              render={({ field }) => (
                <Input
                  id="cadastro-nome"
                  type="text"
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                  placeholder="Seu nome completo"
                  required
                  autoComplete="name"
                  fullWidth
                />
              )}
            />
            {erroCampo('nome')}
          </div>

          <div className="auth-field">
            <label className="auth-label" htmlFor="cadastro-email">
              E-mail
            </label>
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <Input
                  id="cadastro-email"
                  type="email"
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                  placeholder="seu@email.com"
                  required
                  autoComplete="new-email"
                  fullWidth
                />
              )}
            />
            {erroCampo('email')}
          </div>

          <div className="auth-field">
            <label className="auth-label" htmlFor="cadastro-senha">
              Senha
            </label>
            <Controller
              name="senha"
              control={control}
              render={({ field }) => (
                <Input
                  id="cadastro-senha"
                  type="password"
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="new-password"
                  fullWidth
                />
              )}
            />
            {erroCampo('senha')}
          </div>

          <div className="auth-field">
            <label className="auth-label" htmlFor="cadastro-confirmar-senha">
              Confirmar senha
            </label>
            <Controller
              name="confirmarSenha"
              control={control}
              render={({ field }) => (
                <Input
                  id="cadastro-confirmar-senha"
                  type="password"
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="new-password"
                  fullWidth
                />
              )}
            />
            {erroCampo('confirmarSenha')}
          </div>

          <div className="auth-field">
            <label className="auth-label" htmlFor="cadastro-cpf">
              CPF
            </label>
            <Controller
              name="cpf"
              control={control}
              render={({ field }) => (
                <MaskedInput
                  id="cadastro-cpf"
                  mask="cpf"
                  value={field.value}
                  onChange={field.onChange}
                  required
                />
              )}
            />
            {erroCampo('cpf')}
          </div>

          <div className="auth-field">
            <label className="auth-label" htmlFor="cadastro-telefone">
              Telefone
            </label>
            <Controller
              name="telefone"
              control={control}
              render={({ field }) => (
                <MaskedInput
                  id="cadastro-telefone"
                  mask="telefone"
                  value={field.value}
                  onChange={field.onChange}
                  required
                />
              )}
            />
            {erroCampo('telefone')}
          </div>

          <Button
            variant="solid"
            type="submit"
            disabled={loadingCadastro || isSubmitting}
            fullWidth
            style={{ minHeight: '48px' }}
          >
            {loadingCadastro || isSubmitting ? 'Cadastrando…' : 'Criar conta'}
          </Button>
        </form>

        <p style={{ marginTop: '1rem', fontSize: 'var(--font-pequeno-size)', textAlign: 'center' }}>
          Já tem uma conta?{' '}
          <button
            type="button"
            onClick={() => navigate('/login')}
            style={{ color: 'var(--color-primary)', fontWeight: '600', padding: 0 }}
          >
            Entre
          </button>
        </p>
      </div>
    </div>
  );
}
