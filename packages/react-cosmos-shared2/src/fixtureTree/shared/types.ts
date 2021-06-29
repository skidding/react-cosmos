import { FixtureId } from '../../renderer';
import { TreeNode } from '../../util';

export type FixtureTreeNode = TreeNode<
  | { type: 'unknown'; fixturePath: string } // Lazy fixture not imported yet
  | { type: 'fileDir' }
  | { type: 'fixture'; fixtureId: FixtureId }
  | { type: 'multiFixture'; fixtureIds: Record<string, FixtureId> }
>;
