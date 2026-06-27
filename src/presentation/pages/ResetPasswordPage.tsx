import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, CheckCircle, KeyRound, XCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { z } from 'zod';

import { container } from '@/infrastructure/container';
import { Button } from '@/presentation/components/ui/button';
import { Card } from '@/presentation/components/ui/card';
import { Field, Input } from '@/presentation/components/ui/input';

const schema = z
  .object({
    password: z
      .string()
      .min(8, 'Mínimo de 8 caracteres.')
      .regex(/[A-Z]/, 'Deve conter pelo menos uma letra maiúscula.')
      .regex(/[a-z]/, 'Deve conter pelo menos uma letra minúscula.')
      .regex(/[0-9]/, 'Deve conter pelo menos um número.')
      .regex(/[^a-zA-Z0-9]/, 'Deve conter pelo menos um caractere especial (!@#$%...).'),
    confirm: z.string()
  })
  .refine((data) => data.password === data.confirm, {
    message: 'As senhas não conferem.',
    path: ['confirm']
  });

type FormValues = z.infer<typeof schema>;
type PageStatus = 'idle' | 'success' | 'error';

export function ResetPasswordPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [status, setStatus] = useState<PageStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { password: '', confirm: '' }
  });

  async function handleSubmit(values: FormValues) {
    if (!token) { setErrorMessage('Link inválido.'); setStatus('error'); return; }
    setErrorMessage('');
    try {
      await container.authRepository.resetPassword(token, values.password);
      setStatus('success');
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Link inválido ou expirado.';
      setErrorMessage(msg);
      setStatus('error');
    }
  }

  return (
    <main className="grid min-h-screen place-items-center px-4 py-8">
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 16 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
      >
        <Card className="p-6 sm:p-8">
          {status === 'success' ? (
            <div className="grid gap-5 text-center">
              <div className="grid h-16 w-16 place-items-center rounded-full bg-emerald-400/15 text-emerald-400 mx-auto">
                <CheckCircle size={32} />
              </div>
              <div>
                <h1 className="text-xl font-semibold">Senha redefinida!</h1>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Sua senha foi atualizada com sucesso. Volte para o login e entre com a nova senha.
                </p>
              </div>
              <Button onClick={() => navigate('/')} variant="premium" type="button">
                Ir para o login
                <ArrowRight size={16} />
              </Button>
            </div>
          ) : status === 'error' && !form.formState.isSubmitting ? (
            <div className="grid gap-5 text-center">
              <div className="grid h-16 w-16 place-items-center rounded-full bg-destructive/15 text-destructive mx-auto">
                <XCircle size={32} />
              </div>
              <div>
                <h1 className="text-xl font-semibold">Link inválido</h1>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {errorMessage || 'Este link de redefinição é inválido ou já expirou.'}
                </p>
              </div>
              <Button onClick={() => navigate('/')} variant="outline" type="button">
                Voltar ao login
              </Button>
            </div>
          ) : (
            <>
              <div className="mb-6 flex flex-col items-center text-center gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-full bg-sky-400/15 text-sky-300">
                  <KeyRound size={22} />
                </div>
                <div>
                  <h1 className="text-xl font-semibold">Nova senha</h1>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Crie uma senha forte para proteger sua conta.
                  </p>
                </div>
              </div>

              <form className="grid gap-4" onSubmit={form.handleSubmit(handleSubmit)}>
                <Field error={form.formState.errors.password?.message} label="Nova senha">
                  <Input placeholder="Mínimo 8 caracteres" type="password" {...form.register('password')} />
                </Field>
                <Field error={form.formState.errors.confirm?.message} label="Confirmar nova senha">
                  <Input placeholder="Repita a senha" type="password" {...form.register('confirm')} />
                </Field>
                {errorMessage ? (
                  <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                    {errorMessage}
                  </div>
                ) : null}
                <Button
                  className="mt-1 w-full"
                  disabled={form.formState.isSubmitting}
                  size="lg"
                  type="submit"
                  variant="premium"
                >
                  {form.formState.isSubmitting ? 'Salvando...' : 'Salvar nova senha'}
                  <ArrowRight size={18} />
                </Button>
              </form>
            </>
          )}
        </Card>
      </motion.div>
    </main>
  );
}
