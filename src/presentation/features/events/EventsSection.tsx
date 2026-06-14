import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/presentation/components/ui/tabs';
import { partyCategories } from '@/domain/constants/party.constants';
import { getPartyCategoryLabel } from '@/domain/utils/party.utils';
import { PartyCard } from '@/presentation/features/events/PartyCard';
import type { DashboardState, PartyCategoryFilter } from '@/presentation/hooks/useDashboardState';
import type { Party } from '@/domain/entities/party';

type EventsSectionProps = {
  filteredParties: DashboardState['filteredParties'];
  selectedParty: DashboardState['selectedParty'];
  categoryFilter: DashboardState['categoryFilter'];
  onCategoryChange: (category: PartyCategoryFilter) => void;
  onSelectParty: (partyId: string) => void;
  onEditParty: (party: Party) => void;
  onToggleFinalized: (party: Party) => void;
};

export function EventsSection({
  filteredParties,
  selectedParty,
  categoryFilter,
  onCategoryChange,
  onSelectParty,
  onEditParty,
  onToggleFinalized
}: EventsSectionProps) {
  return (
    <div className="grid gap-5">
      <Tabs value={categoryFilter} onValueChange={(value) => onCategoryChange(value as PartyCategoryFilter)}>
        <TabsList className="flex max-w-full overflow-x-auto">
          {partyCategories.map((category) => (
            <TabsTrigger key={category} value={category}>
              {getPartyCategoryLabel(category)}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value={categoryFilter}>
          <div className="grid gap-4 lg:grid-cols-2">
            {filteredParties.map((party, index) => (
              <PartyCard
                index={index}
                isActive={selectedParty?.id === party.id}
                key={party.id}
                party={party}
                onEdit={onEditParty}
                onSelect={onSelectParty}
                onToggleFinalized={onToggleFinalized}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
