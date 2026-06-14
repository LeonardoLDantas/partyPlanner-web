import { LogOut } from 'lucide-react';
import type * as React from 'react';

import type { AuthSession } from '@/domain/entities/auth';
import { Button } from '@/presentation/components/ui/button';
import { Switch } from '@/presentation/components/ui/switch';
import { MobilePage } from '@/presentation/layout/MobilePage';
import { getInitials } from '@/presentation/hooks/useDashboardState';

type MobileSettingsSectionProps = {
  session: AuthSession;
  notificationsEnabled: boolean;
  headerAction: React.ReactNode;
  onNotificationsChange: (enabled: boolean) => Promise<void>;
  onLogout: () => Promise<void>;
};

export function MobileSettingsSection({
  session,
  notificationsEnabled,
  headerAction,
  onNotificationsChange,
  onLogout
}: MobileSettingsSectionProps) {
  return (
    <MobilePage title="Perfil" action={null} headerAction={headerAction}>
      <section className="rounded-[26px] border border-white/10 bg-[#101a2d] p-5 shadow-[0_14px_36px_rgba(0,0,0,0.28)]">
        <div className="flex items-center gap-4">
          <div className="grid h-16 w-16 place-items-center rounded-full border-2 border-sky-400 bg-white/5 text-lg font-bold text-slate-50">
            {getInitials(session.user.name)}
          </div>
          <div className="min-w-0">
            <strong className="block truncate text-xl text-slate-50">{session.user.name}</strong>
            <span className="block truncate text-sm text-slate-400">{session.user.email}</span>
          </div>
        </div>
      </section>

      <section className="rounded-[26px] border border-white/10 bg-[#101a2d] p-5 shadow-[0_14px_36px_rgba(0,0,0,0.28)]">
        <div className="flex items-center justify-between gap-4">
          <div>
            <strong className="text-slate-50">Notificações</strong>
            <p className="text-sm text-slate-400">Alertas e toasts do app.</p>
          </div>
          <Switch checked={notificationsEnabled} onCheckedChange={(checked) => void onNotificationsChange(checked)} />
        </div>
      </section>

      <Button className="h-12 w-full rounded-[18px]" onClick={onLogout} variant="premium">
        <LogOut size={18} />
        Encerrar sessão
      </Button>
    </MobilePage>
  );
}
