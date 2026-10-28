import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Cadastro from './Cadastro';
import { signUp, getCurrentUser } from '../../entities/user/api/auth';
import { upsertProfile } from '../../entities/user/api/profiles';

vi.mock('../../entities/user/api/auth', () => ({
  signUp: vi.fn(),
  getCurrentUser: vi.fn(),
}));
vi.mock('../../entities/user/api/profiles', () => ({
  upsertProfile: vi.fn(),
}));

const mockSignUp = vi.mocked(signUp);
const mockGetCurrentUser = vi.mocked(getCurrentUser);
const mockUpsertProfile = vi.mocked(upsertProfile);

beforeEach(() => {
  render(<Cadastro />);
  vi.clearAllMocks();
  mockSignUp.mockResolvedValue(undefined);
  mockGetCurrentUser.mockResolvedValue({ user: { id: 'u1' } } as never);
  mockUpsertProfile.mockResolvedValue({} as never);
});

const preencherFormulario = () => {
  fireEvent.change(screen.getByLabelText('Nome completo'), {
    target: { value: 'Ana Silva' },
  });
  fireEvent.change(screen.getByLabelText('E-mail'), {
    target: { value: 'ana@exemplo.com' },
  });
  fireEvent.change(screen.getByLabelText('Senha'), { target: { value: 'senha1234' } });
  fireEvent.change(screen.getByLabelText('Confirmar senha'), {
    target: { value: 'senha1234' },
  });
  fireEvent.input(screen.getByLabelText('CPF'), {
    target: { value: '123.456.789-09' },
  });
  fireEvent.input(screen.getByLabelText('Telefone'), {
    target: { value: '(11) 99999-9999' },
  });
};

describe('Cadastro', () => {
  it('cadastra o usuario, persiste o perfil no Supabase e avisa ao usuario', async () => {
    preencherFormulario();
    fireEvent.submit(screen.getByRole('form'));

    await waitFor(() =>
      expect(screen.getByText('Conta criada com sucesso. Redirecionando...')).toBeInTheDocument()
    );

    expect(mockSignUp).toHaveBeenCalledWith('ana@exemplo.com', 'senha1234');
    expect(mockGetCurrentUser).toHaveBeenCalled();
    expect(mockUpsertProfile).toHaveBeenCalledWith({
      userId: 'u1',
      nome: 'Ana Silva',
      cpf: '12345678909',
      telefone: '11999999999',
    });
  });

  it('exibe erros de validacao sincrona inline sem chamar o Supabase', async () => {
    fireEvent.change(screen.getByLabelText('CPF'), {
      target: { value: '111.111.111-11' },
    });
    fireEvent.change(screen.getByLabelText('Senha'), { target: { value: '123' } });
    fireEvent.change(screen.getByLabelText('Confirmar senha'), {
      target: { value: 'senha1234' },
    });
    fireEvent.submit(screen.getByRole('form'));

    await waitFor(() => expect(screen.getByText('CPF invalido.')).toBeInTheDocument());
    expect(screen.getByText('Senha deve ter pelo menos 8 caracteres.')).toBeInTheDocument();
    expect(screen.getByText('As senhas nao coincidem.')).toBeInTheDocument();
    expect(mockSignUp).not.toHaveBeenCalled();
  });

  it('mapeia erro de e-mail ja cadastrado do Supabase para o campo inline', async () => {
    mockSignUp.mockRejectedValueOnce(new Error('User already registered'));
    preencherFormulario();
    fireEvent.submit(screen.getByRole('form'));

    await waitFor(() => expect(screen.getByText(/Este e-mail ja esta em uso/)).toBeInTheDocument());
    expect(mockGetCurrentUser).not.toHaveBeenCalled();
    expect(mockUpsertProfile).not.toHaveBeenCalled();
  });

  it('desabilita o botao enquanto o envio esta em andamento', async () => {
    let resolver: () => void;
    mockSignUp.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolver = resolve;
        })
    );
    preencherFormulario();

    const botao = screen.getByRole('button', { name: 'Criar conta' });
    fireEvent.submit(screen.getByRole('form'));
    expect(botao).toBeDisabled();

    resolver!();
    await waitFor(() => expect(botao).toBeEnabled());
  });
});
