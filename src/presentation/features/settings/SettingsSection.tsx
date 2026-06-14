import { LogOut, Moon, Sun } from 'lucide-react';

import type { AuthSession } from '@/domain/entities/auth';
import type { ThemeMode } from '@/domain/entities/notification';
import { Button } from '@/presentation/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/presentation/components/ui/card';
import { Switch } from '@/presentation/components/ui/switch';
import { getInitials } from '@/presentation/hooks/useDashboardState';

type SettingsSectionProps = {
  session: AuthSession;
  notificationsEnabled: boolean;
  theme: ThemeMode;
  onNotificationsChange: (enabled: boolean) => Promise<void>;
  onThemeChange: (theme: ThemeMode) => Promise<void>;
  onLogout: () => Promise<void>;
};

export function SettingsSection({
  session,
  notificationsEnabled,
  theme,
  onNotificationsChange,
  onThemeChange,
  onLogout
}: SettingsSectionProps) {
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Preferências</CardTitle>
          <CardDescription>Ajustes rápidos da experiência PWA.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5">
          <div className="flex items-center justify-between gap-4 rounded-lg border border-border bg-muted/40 p-4">
            <div>
              <strong>Notificações elegantes</strong>
              <p className="mt-1 text-sm leading-5 text-muted-foreground">Toasts para login, criação e atualizações importantes.</p>
            </div>
            <Switch checked={notificationsEnabled} onCheckedChange={(checked) => void onNotificationsChange(checked)} />
          </div>
          <div className="flex items-center justify-between gap-4 rounded-lg border border-border bg-muted/40 p-4">
            <div>
              <strong>Tema premium</strong>
              <p className="mt-1 text-sm leading-5 text-muted-foreground">Dark como padrão, com opção clara preservada.</p>
            </div>
            <Button
              size="icon"
              type="button"
              variant="outline"
              onClick={() => void onThemeChange(theme === 'dark' ? 'light' : 'dark')}
            >
              {theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Conta</CardTitle>
          <CardDescription>{session.user.email}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-5 flex items-center gap-3">
            <div className="celebra-brand-mark grid h-12 w-12 place-items-center rounded-full font-semibold">
              {getInitials(session.user.name)}
            </div>
            <div>
              <strong>{session.user.name}</strong>
              <p className="text-sm text-muted-foreground">Organizador Celebra</p>
            </div>
          </div>
          <Button className="w-full" onClick={onLogout} variant="outline">
            <LogOut size={17} />
            Encerrar sessão
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
