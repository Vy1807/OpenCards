import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { getCurrentUser, signUp } from '../../entities/user/api/auth';
import { upsertProfile } from '../../entities/user/api/profiles';
import { apenasDigitos, validarCPF, validarTelefone } from '../../shared/lib/validators';
import { MaskedInput } from '../../shared/ui';
import { UserIcon } from '../../shared/ui/icons';

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
    message: 'As senhas nao coincidem.',
    path: ['confirmarSenha'],
  });

type CadastroData = z.infer<typeof schema>;

export default function Cadastro() {
  const navigate = useNavigate();
  const [erroForm, setErroForm] = useState('');
  const [sucesso, setSucesso] = useState('');

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
    try {
      // Validacao assincrona contra o Supabase: cadastro de auth só
      // prossegue se o e-mail ainda nao estiver em uso.
      await signUp(dados.email, dados.senha);

      const currentUser = await getCurrentUser();
      if (!currentUser) {
        throw new Error('Nao foi possivel restaurar a sessao apos o cadastro.');
      }

      // Dados complementares persistidos no Supabase (tabela profiles, RLS por usuario).
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
          message: 'Este e-mail ja esta em uso. Tente entrar.',
        });
      } else {
        setErroForm(mensagem);
      }
    }
  };

  const erroCampo = (nome: keyof CadastroData) => {
    const erro = errors[nome];
    if (!erro) return null;
    return (
      <p style={{ color: 'var(--err)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
        {erro.message}
      </p>
    );
  };

  return (
    <div className="page" style={{ maxWidth: '400px' }}>
      <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <UserIcon size={28} style={{ flexShrink: 0 }} /> Criar conta
      </h1>
      {erroForm && <p style={{ color: 'var(--err)', marginBottom: '1rem' }}>{erroForm}</p>}
      {sucesso && <p style={{ color: 'var(--ok)', marginBottom: '1rem' }}>{sucesso}</p>}
      <form onSubmit={handleSubmit(onSubmit)} className="card section">
        <div style={{ marginBottom: '1rem' }}>
          <label className="label" htmlFor="nome">Nome completo</label>
          <Controller
            name="nome"
            control={control}
            render={({ field }) => (
              <input
                id="nome"
                className="input"
                type="text"
                value={field.value}
                onChange={(e) => field.onChange(e.target.value)}
                required
              />
            )}
          />
          {erroCampo('nome')}
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label className="label" htmlFor="email">E-mail</label>
          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <input
                id="email"
                className="input"
                type="email"
                value={field.value}
                onChange={(e) => field.onChange(e.target.value)}
                required
              />
            )}
          />
          {erroCampo('email')}
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label className="label" htmlFor="senha">Senha</label>
          <Controller
            name="senha"
            control={control}
            render={({ field }) => (
              <input
                id="senha"
                className="input"
                type="password"
                value={field.value}
                onChange={(e) => field.onChange(e.target.value)}
                required
              />
            )}
          />
          {erroCampo('senha')}
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label className="label" htmlFor="confirmarSenha">Confirmar senha</label>
          <Controller
            name="confirmarSenha"
            control={control}
            render={({ field }) => (
              <input
                id="confirmarSenha"
                className="input"
                type="password"
                value={field.value}
                onChange={(e) => field.onChange(e.target.value)}
                required
              />
            )}
          />
          {erroCampo('confirmarSenha')}
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label className="label" htmlFor="cpf">CPF</label>
          <Controller
            name="cpf"
            control={control}
            render={({ field }) => (
              <MaskedInput
                id="cpf"
                mask="cpf"
                value={field.value}
                onChange={field.onChange}
                required
              />
            )}
          />
          {erroCampo('cpf')}
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label className="label" htmlFor="telefone">Telefone</label>
          <Controller
            name="telefone"
            control={control}
            render={({ field }) => (
              <MaskedInput
                id="telefone"
                mask="telefone"
                value={field.value}
                onChange={field.onChange}
                required
              />
            )}
          />
          {erroCampo('telefone')}
        </div>
        <button
          className="btn btn-primary"
          type="submit"
          disabled={isSubmitting}
          style={{ minHeight: '44px', width: '100%' }}
        >
          {isSubmitting ? 'Cadastrando…' : 'Criar conta'}
        </button>
      </form>
      <p style={{ marginTop: '1rem', fontSize: '0.875rem', textAlign: 'center' }}>
        Ja tem uma conta?{' '}
        <button
          type="button"
          onClick={() => navigate('/login')}
          className="btn"
          style={{ color: 'var(--rose-600)', fontWeight: '600', padding: 0 }}
        >
          Entre
        </button>
      </p>
    </div>
  );
}
