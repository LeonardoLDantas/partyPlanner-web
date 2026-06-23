import { Button } from '@/presentation/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/presentation/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/presentation/components/ui/dialog';
import type { DashboardState } from '@/presentation/hooks/useDashboardState';

type Notification = { id: string; title: string; message: string; isRead: boolean };

type DesktopNotificationsPanelProps = {
  notifications: Notification[];
  unreadNotifications: number;
  markAllAsRead: DashboardState['markAllAsRead'];
  clearAllNotifications: DashboardState['clearAllNotifications'];
  onMarkAllRead: () => void;
  onClear: () => void;
};

export function DesktopNotificationsPanel({
  notifications,
  unreadNotifications,
  markAllAsRead,
  clearAllNotifications,
  onMarkAllRead,
  onClear
}: DesktopNotificationsPanelProps) {
  return (
    <Card className="absolute right-0 top-14 z-40 flex max-h-[min(70vh,520px)] w-[min(90vw,360px)] flex-col overflow-hidden">
      <CardHeader className="border-b border-border">
        <CardTitle>Notificações</CardTitle>
        <CardDescription>{unreadNotifications} não lidas</CardDescription>
      </CardHeader>
      <CardContent className="min-h-0 flex-1 overflow-y-auto p-3">
        {notifications.length > 0 ? (
          <div className="grid gap-2">
            {notifications.map((notification) => (
              <div className="rounded-md bg-muted/50 p-3" key={notification.id}>
                <strong className="text-sm">{notification.title}</strong>
                <p className="mt-1 text-sm leading-5 text-muted-foreground">{notification.message}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="rounded-md bg-muted/50 p-3 text-sm text-muted-foreground">Nenhuma notificação por enquanto.</p>
        )}
      </CardContent>
      <div className="sticky bottom-0 grid grid-cols-2 gap-2 border-t border-border bg-card/95 p-3 backdrop-blur">
        <Button disabled={markAllAsRead.isPending || notifications.length === 0} size="sm" variant="outline" onClick={onMarkAllRead}>
          Ler tudo
        </Button>
        <Button disabled={clearAllNotifications.isPending || notifications.length === 0} size="sm" variant="ghost" onClick={onClear}>
          Limpar
        </Button>
      </div>
    </Card>
  );
}

type MobileNotificationsSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  notifications: Notification[];
  unreadNotifications: number;
  markAllAsRead: DashboardState['markAllAsRead'];
  clearAllNotifications: DashboardState['clearAllNotifications'];
  onMarkAllRead: () => void;
  onClear: () => void;
};

export function MobileNotificationsSheet({
  open,
  onOpenChange,
  notifications,
  unreadNotifications,
  markAllAsRead,
  clearAllNotifications,
  onMarkAllRead,
  onClear
}: MobileNotificationsSheetProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bottom-0 top-auto flex max-h-[78vh] w-full max-w-none translate-y-0 grid-rows-none flex-col gap-0 overflow-hidden rounded-b-none rounded-t-[26px] border-white/10 bg-panel p-0 text-slate-50 sm:left-1/2 sm:top-1/2 sm:max-w-md sm:-translate-y-1/2 sm:rounded-[22px]">
        <DialogHeader className="shrink-0 p-5 pb-3">
          <DialogTitle className="text-2xl font-bold">Notificações</DialogTitle>
          <DialogDescription className="text-slate-400">{unreadNotifications} não lidas</DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-4">
          {notifications.length > 0 ? (
            <div className="grid gap-2">
              {notifications.map((notification) => (
                <div className="rounded-[16px] border border-white/10 bg-white/[0.05] p-3" key={notification.id}>
                  <strong className="block text-sm text-slate-50">{notification.title}</strong>
                  <p className="mt-1 text-sm leading-5 text-slate-400">{notification.message}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="rounded-[16px] border border-white/10 bg-white/[0.05] p-4 text-sm text-slate-400">
              Nenhuma notificação por enquanto.
            </p>
          )}
        </div>

        <div className="sticky bottom-0 grid shrink-0 grid-cols-2 gap-2 border-t border-white/10 bg-panel/95 p-4 backdrop-blur">
          <Button
            disabled={markAllAsRead.isPending || notifications.length === 0}
            onClick={onMarkAllRead}
            size="sm"
            type="button"
            variant="outline"
          >
            Ler tudo
          </Button>
          <Button
            disabled={clearAllNotifications.isPending || notifications.length === 0}
            onClick={onClear}
            size="sm"
            type="button"
            variant="ghost"
          >
            Limpar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
