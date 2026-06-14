import { Bell } from 'lucide-react';

import { getInitials } from '@/presentation/hooks/useDashboardState';

type MobileHeaderActionsProps = {
  unreadNotifications: number;
  userName: string;
  onOpenNotifications: () => void;
};

export function MobileHeaderActions({ unreadNotifications, userName, onOpenNotifications }: MobileHeaderActionsProps) {
  return (
    <div className="flex items-center gap-4">
      <button
        className="relative grid h-11 w-11 place-items-center rounded-full text-white"
        onClick={onOpenNotifications}
        type="button"
      >
        <Bell size={25} />
        {unreadNotifications > 0 ? (
          <span className="absolute -right-1 -top-1 grid h-6 min-w-6 place-items-center rounded-full bg-[#0ea5e9] px-1 text-xs font-bold text-white">
            {unreadNotifications}
          </span>
        ) : null}
      </button>
      <div className="grid h-12 w-12 place-items-center rounded-full border-[3px] border-brand bg-panel text-xs font-bold text-slate-50">
        {getInitials(userName)}
      </div>
    </div>
  );
}
