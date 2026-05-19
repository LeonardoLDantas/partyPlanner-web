import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, BadgeCheck, CakeSlice, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import type { AuthSession } from '@/domain/entities/auth';
import { container } from '@/infrastructure/container';
import { Button } from '@/presentation/components/ui/button';
import { Card } from '@/presentation/components/ui/card';
import { Field, Input } from '@/presentation/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/presentation/components/ui/tabs';

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
        error instanceof Error ? error.message : 'Não foi possível autenticar agora.'
      );
    }
  }

  return (
    <main className="grid min-h-screen place-items-center px-4 py-8">
      <motion.section
        animate={{ opacity: 1, y: 0 }}
        className="grid w-full max-w-5xl gap-5 lg:grid-cols-[1fr_430px]"
        initial={{ opacity: 0, y: 16 }}
        transition={{ duration: 0.24, ease: 'easeOut' }}
      >
        <div className="relative overflow-hidden rounded-lg border border-white/10 bg-[linear-gradient(135deg,rgba(14,116,144,0.82),rgba(30,41,59,0.94)_46%,rgba(147,51,234,0.76))] p-6 shadow-2xl md:p-8">
          <div className="relative z-10 grid h-full content-between gap-10">
            <div>
              <img alt="Celebra" className="h-20 w-20 rounded-full object-contain" src="/brand/celebra-mark-white.png" />
              <p className="mt-8 text-sm font-semibold uppercase tracking-[0.18em] text-sky-100">
                PWA premium
              </p>
              <h1 className="mt-3 max-w-xl text-4xl font-semibold leading-tight text-white md:text-6xl">
                Planeje festas com ritmo, brilho e controle.
              </h1>
              <p className="mt-5 max-w-xl text-base leading-7 text-slate-100/82">
                Um painel escuro e elegante para organizar eventos, convidados, tarefas e custos no mesmo lugar.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {[
                {
                  icon: CakeSlice,
                  title: 'Festas vivas',
                  copy: 'Cards grandes, status claro e filtros por evento.'
                },
                {
                  icon: BadgeCheck,
                  title: 'Pronto para mobile',
                  copy: 'Navegação inferior e gestos visuais suaves.'
                }
              ].map((item) => (
                <div
                  className="rounded-lg border border-white/10 bg-white/10 p-4 text-white backdrop-blur-md"
                  key={item.title}
                >
                  <item.icon size={20} />
                  <strong className="mt-3 block">{item.title}</strong>
                  <span className="mt-1 block text-sm leading-5 text-slate-100/75">{item.copy}</span>
                </div>
              ))}
            </div>
          </div>
          <Sparkles className="absolute right-8 top-8 text-white/30" size={72} />
        </div>

        <Card className="self-center p-5 md:p-6">
          <div className="mb-6">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-sky-300">
              Acesso rápido
            </p>
            <h2 className="mt-2 text-2xl font-semibold">
              {mode === 'login' ? 'Entrar na sua conta' : 'Criar conta no Celebra'}
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {mode === 'login'
                ? 'Use seu e-mail e senha para continuar no painel.'
                : 'Cadastre-se e já entre direto no app para criar sua primeira festa.'}
            </p>
          </div>

          <Tabs value={mode} onValueChange={(value) => setMode(value as AuthMode)}>
            <TabsList className="mb-5 grid w-full grid-cols-2">
              <TabsTrigger value="login">Entrar</TabsTrigger>
              <TabsTrigger value="register">Criar conta</TabsTrigger>
            </TabsList>
          </Tabs>

          <form className="grid gap-4" onSubmit={form.handleSubmit(handleSubmit)}>
            {mode === 'register' ? (
              <Field error={form.formState.errors.name?.message} label="Nome">
                <Input placeholder="Seu nome" {...form.register('name')} />
              </Field>
            ) : null}

            <Field error={form.formState.errors.email?.message} label="E-mail">
              <Input placeholder="voce@celebra.app" type="email" {...form.register('email')} />
            </Field>

            <Field error={form.formState.errors.password?.message} label="Senha">
              <Input placeholder="Sua senha" type="password" {...form.register('password')} />
            </Field>

            {errorMessage ? (
              <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                {errorMessage}
              </div>
            ) : null}

            <Button className="mt-2 w-full" disabled={form.formState.isSubmitting} size="lg" type="submit" variant="premium">
              {form.formState.isSubmitting
                ? 'Entrando...'
                : mode === 'login'
                  ? 'Entrar com senha'
                  : 'Criar conta e entrar'}
              <ArrowRight size={18} />
            </Button>
          </form>
        </Card>
      </motion.section>
    </main>
  );
}
