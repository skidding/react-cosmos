import { FixtureList } from 'react-cosmos-shared2/renderer';

export const fixtures: FixtureList = {
  'src/__fixtures__/styleguide/button.tsx': { type: 'single' },
  'src/__fixtures__/styleguide/colorPalette.tsx': { type: 'single' },
  'src/plugins/ClassStatePanel/ClassStatePanel/index.fixture.tsx': {
    type: 'single',
  },
  'src/plugins/ContentOverlay/index.fixture.tsx': {
    type: 'multi',
    fixtureNames: [
      'waiting',
      'not found',
      'welcome',
      'renderer not responding',
    ],
  },
  'src/plugins/FixtureSearch/FixtureSearchOverlay.fixture.tsx': {
    type: 'single',
  },
  'src/plugins/FixtureTree/BlankState.fixture.tsx': { type: 'single' },
  'src/plugins/Notifications/index.fixture.tsx': {
    type: 'multi',
    fixtureNames: ['single', 'multiple'],
  },
  'src/plugins/PropsPanel/BlankState.fixture.tsx': { type: 'single' },
  'src/plugins/PropsPanel/PropsPanel/index.fixture.tsx': { type: 'single' },
  'src/plugins/slots.fixture.tsx': {
    type: 'multi',
    fixtureNames: ['root', 'nav', 'rendererHeader'],
  },
  'src/shared/ui/buttons/index.fixture.tsx': { type: 'single' },
  'src/shared/ui/valueInputTree/index.fixture.tsx': { type: 'single' },
};
