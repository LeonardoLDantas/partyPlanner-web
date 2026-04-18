import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { BadgeCheck, CakeSlice, ShieldCheck } from 'lucide-react';
import { z } from 'zod';

import type { AuthSession } from '@/domain/entities/auth';
import { container } from '@/infrastructure/container';

const authSchema = z.object({
  email: z.string().email('Informe um e-mail valido.'),
  password: z.string().min(1, 'Informe sua senha.'),
  name: z.string().optional()
});

type AuthMode = 'login' | 'register';

type AuthPageProps = {
  onAuthenticated: (session: AuthSession) => Promise<void>;
};

export function AuthPage({ onAuthenticated }: AuthPageProps) {
  const [mode, setMode] = useState<AuthMode>('login');
  const [errorMessage, setErrorMessage] = useState('');
  const schema = useMemo(() => authSchema, []);

  const form = useForm<z.infer<typeof authSchema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      email: '',
      password: ''
    }
  });

  async function handleSubmit(values: z.infer<typeof authSchema>) {
    try {
      if (mode === 'register' && !values.name?.trim()) {
        form.setError('name', { message: 'Informe seu nome.' });
        return;
      }

      setErrorMessage('');
      const session =
        mode === 'login'
          ? await container.authRepository.login({
              email: values.email,
              password: values.password
            })
          : await container.authRepository.register({
              name: values.name!.trim(),
              email: values.email,
              password: values.password
            });

      await onAuthenticated(session);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Nao foi possivel autenticar agora.'
      );
    }
  }

  return (
    <main className="auth-layout">
      <section className="auth-hero card-dark">
        <span className="eyebrow">Party Planner PWA</span>
        <h1>Central web para orquestrar cada etapa da festa.</h1>
        <p>
          O novo app em React conversa com o mesmo backend e organiza autenticacao,
          planejamento, operacao e preferencias em uma experiencia pronta para instalar.
        </p>

        <div className="feature-grid">
          <article>
            <CakeSlice size={20} />
            <strong>Planejamento vivo</strong>
            <span>Festas, tarefas, convidados e custos na mesma trilha.</span>
          </article>
          <article>
            <ShieldCheck size={20} />
            <strong>JWT reaproveitado</strong>
            <span>Mesmo fluxo de login usado hoje pelo backend .NET.</span>
          </article>
          <article>
            <BadgeCheck size={20} />
            <strong>PWA instalavel</strong>
            <span>Abra no navegador e instale como app no desktop ou Android.</span>
          </article>
        </div>
      </section>

      <section className="auth-panel">
        <div className="auth-tabs">
          <button
            className={mode === 'login' ? 'is-active' : ''}
            onClick={() => setMode('login')}
            type="button"
          >
            Entrar
          </button>
          <button
            className={mode === 'register' ? 'is-active' : ''}
            onClick={() => setMode('register')}
            type="button"
          >
            Criar conta
          </button>
        </div>

        <form className="auth-form card-light" onSubmit={form.handleSubmit(handleSubmit)}>
          {mode === 'register' ? (
            <label className="field">
              <span>Nome</span>
              <input type="text" placeholder="Seu nome" {...form.register('name')} />
              <small>{form.formState.errors.name?.message}</small>
            </label>
          ) : null}

          <label className="field">
            <span>E-mail</span>
            <input type="email" placeholder="voce@partyplanner.app" {...form.register('email')} />
            <small>{form.formState.errors.email?.message}</small>
          </label>

          <label className="field">
            <span>Senha</span>
            <input type="password" placeholder="Sua senha" {...form.register('password')} />
            <small>{form.formState.errors.password?.message}</small>
          </label>

          {errorMessage ? <div className="feedback error">{errorMessage}</div> : null}

          <button className="primary-button" type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting
              ? 'Autenticando...'
              : mode === 'login'
                ? 'Entrar com senha'
                : 'Criar conta e entrar'}
          </button>

          <div className="feedback neutral">
            Login Google pode ser adicionado depois no mesmo backend. Neste primeiro passo, mantive
            o fluxo de usuario e senha consistente entre mobile e web.
          </div>

          <p className="helper-copy">
            Conta de teste atual: <strong>demo@partyplanner.app</strong> com senha
            <strong> Party123!</strong>
          </p>
        </form>
      </section>
    </main>
  );
}
