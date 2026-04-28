import {
  Button,
  Paper,
  PasswordInput,
  SegmentedControl,
  Stack,
  Text,
  TextInput,
  ThemeIcon,
  Title
} from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, BadgeCheck, CakeSlice } from 'lucide-react';
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
  const isMobile = useMediaQuery('(max-width: 48em)');
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
    <main className="auth-layout auth-layout-single">
      <section className="auth-hero card-dark auth-mobile-hero auth-mobile-hero-clean auth-hero-with-form">
        <div className="auth-logo-wrap">
          <img alt="celebra" className="auth-brand-image auth-brand-image-light" src="/brand/celebra-mark-black.png" />
          <img alt="celebra" className="auth-brand-image auth-brand-image-dark" src="/brand/celebra-mark-white.png" />
        </div>

        <Paper className="auth-form card-light auth-mobile-panel auth-mobile-panel-embedded" p="xl" radius="xl" shadow="sm" withBorder>
          <Stack gap="lg">
            <div>
              <Text className="eyebrow">Acesso rapido</Text>
              <Title order={isMobile ? 3 : 2}>
                {mode === 'login' ? 'Entrar na sua conta' : 'Criar conta no celebra'}
              </Title>
              <Text c="dimmed" mt={6} size="sm">
                {mode === 'login'
                  ? 'Use seu e-mail e senha para continuar no painel mobile.'
                  : 'Cadastre-se e ja entre direto no app para criar sua primeira festa.'}
              </Text>
            </div>

            <SegmentedControl
              className="auth-segmented"
              data={[
                { label: 'Entrar', value: 'login' },
                { label: 'Criar conta', value: 'register' }
              ]}
              fullWidth
              radius="xl"
              value={mode}
              onChange={(value) => setMode(value as AuthMode)}
            />

            <form className="auth-form-stack" onSubmit={form.handleSubmit(handleSubmit)}>
              <Stack gap="md">
                {mode === 'register' ? (
                  <TextInput
                    label="Nome"
                    placeholder="Seu nome"
                    radius="xl"
                    size="md"
                    {...form.register('name')}
                    error={form.formState.errors.name?.message}
                  />
                ) : null}

                <TextInput
                  label="E-mail"
                  placeholder="voce@celebra.app"
                  radius="xl"
                  size="md"
                  type="email"
                  {...form.register('email')}
                  error={form.formState.errors.email?.message}
                />

                <PasswordInput
                  label="Senha"
                  placeholder="Sua senha"
                  radius="xl"
                  size="md"
                  {...form.register('password')}
                  error={form.formState.errors.password?.message}
                />

                {errorMessage ? <div className="feedback error">{errorMessage}</div> : null}

                <Button
                  className="auth-submit-button"
                  fullWidth
                  loading={form.formState.isSubmitting}
                  radius="xl"
                  rightSection={<ArrowRight size={18} />}
                  size="lg"
                  type="submit"
                >
                  {mode === 'login' ? 'Entrar com senha' : 'Criar conta e entrar'}
                </Button>
              </Stack>
            </form>
          </Stack>
        </Paper>

        <div className="feature-grid auth-feature-grid auth-feature-grid-clean">
          <Paper className="auth-feature-card" p="md" radius="xl" shadow="sm">
            <ThemeIcon color="blue" radius="xl" size="lg" variant="light">
              <CakeSlice size={18} />
            </ThemeIcon>
            <strong>Planejamento vivo</strong>
            <span>Festas, tarefas, convidados e custos na mesma trilha.</span>
          </Paper>
          <Paper className="auth-feature-card" p="md" radius="xl" shadow="sm">
            <ThemeIcon color="cyan" radius="xl" size="lg" variant="light">
              <BadgeCheck size={18} />
            </ThemeIcon>
            <strong>PWA instalavel</strong>
            <span>Experiencia pronta para celular com tema e navegacao mobile.</span>
          </Paper>
        </div>
      </section>
    </main>
  );
}
