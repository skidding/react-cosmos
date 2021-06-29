import { FixtureTreeNode } from 'react-cosmos-shared2/fixtureTree';
import { FixtureId } from 'react-cosmos-shared2/renderer';

export function recordContainsFixtureId(
  fixtureIds: Record<string, FixtureId>,
  fixtureId: FixtureId
) {
  return Object.keys(fixtureIds).some(
    fixtureName => fixtureIds[fixtureName].path === fixtureId.path
  );
}

export function nodeContainsFixtureId(
  { data, children }: FixtureTreeNode,
  fixtureId: FixtureId
): boolean {
  if (data.type === 'fixture') {
    return data.fixtureId.path === fixtureId.path;
  }

  if (data.type === 'multiFixture') {
    return recordContainsFixtureId(data.fixtureIds, fixtureId);
  }

  return (
    children !== undefined &&
    Object.keys(children).some(childName =>
      nodeContainsFixtureId(children[childName], fixtureId)
    )
  );
}
