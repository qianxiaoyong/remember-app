import type { ReactElement } from 'react';
import type { LibraryOverview } from '../../use-cases/get-library-overview';
import { LibraryActivePackSummaryPlaceholder } from './library-active-pack-summary-placeholder';
import { LibraryTodayOverviewBoard } from './library-today-overview-board';
import { SurfaceCard } from '../ui/surface-card';

const HOME_CARD_BORDER_RADIUS = 8;
const HOME_CARD_PADDING = 20;

interface LibraryHomeEmptyWhiteCardProps {
  overview: LibraryOverview;
}

export function LibraryHomeEmptyWhiteCard(props: LibraryHomeEmptyWhiteCardProps): ReactElement {
  return (
    <SurfaceCard borderRadius={HOME_CARD_BORDER_RADIUS} contentPadding={HOME_CARD_PADDING}>
      <LibraryActivePackSummaryPlaceholder />
      <LibraryTodayOverviewBoard overview={props.overview} />
    </SurfaceCard>
  );
}
