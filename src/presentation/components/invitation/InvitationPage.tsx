import { CalendarDays, Check, Clock, MapPinned, PartyPopper, X } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Navigate, useParams } from 'react-router-dom';

import { container } from '@/infrastructure/container';
import { Button } from '@/presentation/components/ui/button';
import { Card, CardContent } from '@/presentation/components/ui/card';
import type { GuestStatus } from '@/domain/entities/party';

function formatInvitationDate(value: string) {
  const [year, month, day] = value.split('-');
  return year && month && day ? `${day}/${month}/${year}` : value;
}

export function InvitationPage() {
  const { token } = useParams();
  const [selectedStatus, setSelectedStatus] = useState<GuestStatus | null>(null);

  const invitationQuery = useQuery({
    queryKey: ['invitation', token],
    queryFn: () => container.partyRepository.getInvitation(token ?? ''),
    enabled: Boolean(token)
  });

  const respondInvitation = useMutation({
    mutationFn: (status: 'Confirmado' | 'Recusou') => container.partyRepository.respondInvitation(token ?? '', status),
    onMutate: (status) => setSelectedStatus(status),
    onSuccess: (invitation) => {
      invitationQuery.refetch();
      setSelectedStatus(invitation.guestStatus);
    }
  });

  if (!token) {
    return <Navigate to="/" replace />;
  }

  const invitation = invitationQuery.data;
  const coverImage = invitation?.partyCoverImageUrl || '/illustrations/birthday-hero.svg';

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_50%_-10%,rgba(124,60,255,0.28),transparent_34%),#020914] px-4 py-6 text-white">
      <div className="mx-auto grid min-h-[calc(100vh-48px)] max-w-md content-center gap-5">
        <header className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-[14px] bg-[linear-gradient(135deg,#5128ff,#f1329d)]">
            <PartyPopper size={28} />
          </div>
          <strong className="bg-[linear-gradient(135deg,#5b35ff_8%,#f1329d_92%)] bg-clip-text text-[2.25rem] font-extrabold leading-none text-transparent">
            Celebra
          </strong>
        </header>

        <Card className="overflow-hidden rounded-[26px] border-white/10 bg-[#071225]/92 shadow-[0_24px_60px_rgba(0,0,0,0.42)]">
          {invitationQuery.isLoading ? (
            <CardContent className="p-6 text-center text-slate-300">Carregando convite...</CardContent>
          ) : invitationQuery.isError || !invitation ? (
            <CardContent className="grid gap-3 p-6 text-center">
              <h1 className="text-2xl font-bold">Convite não encontrado</h1>
              <p className="text-sm leading-6 text-slate-400">Confira se o link recebido está completo.</p>
            </CardContent>
          ) : (
            <>
              <div className="relative h-56 overflow-hidden">
                <img alt={invitation.partyName} className="h-full w-full object-cover" src={coverImage} />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,9,20,0.1),rgba(2,9,20,0.95))]" />
                <div className="absolute bottom-4 left-4 right-4">
                  <span className="inline-flex rounded-full bg-white/16 px-3 py-1 text-xs font-bold backdrop-blur">
                    Convite especial
                  </span>
                  <h1 className="mt-3 text-3xl font-extrabold leading-tight">{invitation.partyName}</h1>
                </div>
              </div>

              <CardContent className="grid gap-5 p-5">
                <div>
                  <p className="text-sm text-slate-400">Olá,</p>
                  <h2 className="text-2xl font-bold">{invitation.guestName}</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    Confirme sua presença para que o anfitrião receba sua resposta automaticamente.
                  </p>
                </div>

                <div className="grid gap-3 rounded-[20px] border border-white/10 bg-white/[0.04] p-4 text-sm text-slate-200">
                  <span className="flex items-center gap-3">
                    <CalendarDays size={18} /> {formatInvitationDate(invitation.partyDate)}
                  </span>
                  <span className="flex items-center gap-3">
                    <Clock size={18} /> {invitation.partyTime}
                  </span>
                  <span className="flex items-center gap-3">
                    <MapPinned size={18} /> {invitation.partyLocation}
                  </span>
                </div>

                <motion.div className="grid grid-cols-2 gap-3" layout>
                  <Button
                    className="h-12 rounded-xl bg-emerald-500 text-white hover:bg-emerald-400"
                    disabled={respondInvitation.isPending}
                    onClick={() => respondInvitation.mutate('Confirmado')}
                    type="button"
                  >
                    <Check size={18} />
                    Aceitar
                  </Button>
                  <Button
                    className="h-12 rounded-xl border-rose-400/50 text-rose-100 hover:bg-rose-500/14"
                    disabled={respondInvitation.isPending}
                    onClick={() => respondInvitation.mutate('Recusou')}
                    type="button"
                    variant="outline"
                  >
                    <X size={18} />
                    Recusar
                  </Button>
                </motion.div>

                <div className="rounded-[18px] border border-white/10 bg-white/[0.04] px-4 py-3 text-center text-sm font-semibold text-slate-300">
                  Status atual:{' '}
                  <span className={invitation.guestStatus === 'Confirmado' || selectedStatus === 'Confirmado' ? 'text-emerald-300' : 'text-[#ef3f98]'}>
                    {selectedStatus ?? invitation.guestStatus}
                  </span>
                </div>
              </CardContent>
            </>
          )}
        </Card>
      </div>
    </main>
  );
}
