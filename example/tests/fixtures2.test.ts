import { getCosmosConfigAtPath, getFixtures2 } from 'react-cosmos';

const cosmosConfig = getCosmosConfigAtPath(require.resolve('../cosmos.config'));
const { rootDir } = cosmosConfig;

it('returns fixture info', async () => {
  const fixtures = getFixtures2(cosmosConfig);
  expect(fixtures).toEqual([
    {
      absoluteFilePath: `${rootDir}/src/__fixtures__/Controls.tsx`,
      fileName: 'Controls',
      getElement: expect.any(Function),
      name: null,
      parents: [],
      relativeFilePath: 'src/__fixtures__/Controls.tsx',
      rendererUrl:
        'http://localhost:5000/_renderer.html?_fixtureId=%7B%22path%22%3A%22src%2F__fixtures__%2FControls.tsx%22%7D',
      playgroundUrl:
        'http://localhost:5000/?fixtureId=%7B%22path%22%3A%22src%2F__fixtures__%2FControls.tsx%22%7D',
      treePath: ['Controls'],
    },
    {
      absoluteFilePath: `${rootDir}/src/Counter/Counter.fixture.tsx`,
      fileName: 'Counter',
      getElement: expect.any(Function),
      name: 'default',
      parents: [],
      playgroundUrl:
        'http://localhost:5000/?fixtureId=%7B%22path%22%3A%22src%2FCounter%2FCounter.fixture.tsx%22%2C%22name%22%3A%22default%22%7D',
      relativeFilePath: 'src/Counter/Counter.fixture.tsx',
      rendererUrl:
        'http://localhost:5000/_renderer.html?_fixtureId=%7B%22path%22%3A%22src%2FCounter%2FCounter.fixture.tsx%22%2C%22name%22%3A%22default%22%7D',
      treePath: ['Counter', 'default'],
    },
    {
      absoluteFilePath: `${rootDir}/src/Counter/Counter.fixture.tsx`,
      fileName: 'Counter',
      getElement: expect.any(Function),
      name: 'small number',
      parents: [],
      playgroundUrl:
        'http://localhost:5000/?fixtureId=%7B%22path%22%3A%22src%2FCounter%2FCounter.fixture.tsx%22%2C%22name%22%3A%22small%20number%22%7D',
      relativeFilePath: 'src/Counter/Counter.fixture.tsx',
      rendererUrl:
        'http://localhost:5000/_renderer.html?_fixtureId=%7B%22path%22%3A%22src%2FCounter%2FCounter.fixture.tsx%22%2C%22name%22%3A%22small%20number%22%7D',
      treePath: ['Counter', 'small number'],
    },
    {
      absoluteFilePath: `${rootDir}/src/Counter/Counter.fixture.tsx`,
      fileName: 'Counter',
      getElement: expect.any(Function),
      name: 'large number',
      parents: [],
      playgroundUrl:
        'http://localhost:5000/?fixtureId=%7B%22path%22%3A%22src%2FCounter%2FCounter.fixture.tsx%22%2C%22name%22%3A%22large%20number%22%7D',
      relativeFilePath: 'src/Counter/Counter.fixture.tsx',
      rendererUrl:
        'http://localhost:5000/_renderer.html?_fixtureId=%7B%22path%22%3A%22src%2FCounter%2FCounter.fixture.tsx%22%2C%22name%22%3A%22large%20number%22%7D',
      treePath: ['Counter', 'large number'],
    },
    {
      absoluteFilePath: `${rootDir}/src/CounterButton/CounterButton.fixture.tsx`,
      fileName: 'CounterButton',
      getElement: expect.any(Function),
      name: null,
      parents: [],
      playgroundUrl:
        'http://localhost:5000/?fixtureId=%7B%22path%22%3A%22src%2FCounterButton%2FCounterButton.fixture.tsx%22%7D',
      relativeFilePath: 'src/CounterButton/CounterButton.fixture.tsx',
      rendererUrl:
        'http://localhost:5000/_renderer.html?_fixtureId=%7B%22path%22%3A%22src%2FCounterButton%2FCounterButton.fixture.tsx%22%7D',
      treePath: ['CounterButton'],
    },
    {
      absoluteFilePath: `${rootDir}/src/__fixtures__/HelloWorld.ts`,
      fileName: 'HelloWorld',
      getElement: expect.any(Function),
      name: null,
      parents: [],
      playgroundUrl:
        'http://localhost:5000/?fixtureId=%7B%22path%22%3A%22src%2F__fixtures__%2FHelloWorld.ts%22%7D',
      relativeFilePath: 'src/__fixtures__/HelloWorld.ts',
      rendererUrl:
        'http://localhost:5000/_renderer.html?_fixtureId=%7B%22path%22%3A%22src%2F__fixtures__%2FHelloWorld.ts%22%7D',
      treePath: ['HelloWorld'],
    },
    {
      absoluteFilePath: `${rootDir}/src/NestedDecorators/NestedDecorators.fixture.tsx`,
      fileName: 'NestedDecorators',
      getElement: expect.any(Function),
      name: null,
      parents: [],
      playgroundUrl:
        'http://localhost:5000/?fixtureId=%7B%22path%22%3A%22src%2FNestedDecorators%2FNestedDecorators.fixture.tsx%22%7D',
      relativeFilePath: 'src/NestedDecorators/NestedDecorators.fixture.tsx',
      rendererUrl:
        'http://localhost:5000/_renderer.html?_fixtureId=%7B%22path%22%3A%22src%2FNestedDecorators%2FNestedDecorators.fixture.tsx%22%7D',
      treePath: ['NestedDecorators'],
    },
    {
      absoluteFilePath: `${rootDir}/src/__fixtures__/Props.tsx`,
      fileName: 'Props',
      getElement: expect.any(Function),
      name: null,
      parents: [],
      relativeFilePath: 'src/__fixtures__/Props.tsx',
      rendererUrl:
        'http://localhost:5000/_renderer.html?_fixtureId=%7B%22path%22%3A%22src%2F__fixtures__%2FProps.tsx%22%7D',
      playgroundUrl:
        'http://localhost:5000/?fixtureId=%7B%22path%22%3A%22src%2F__fixtures__%2FProps.tsx%22%7D',
      treePath: ['Props'],
    },
    {
      absoluteFilePath: `${rootDir}/src/WelcomeMessage/WelcomeMessage.fixture.tsx`,
      fileName: 'WelcomeMessage',
      getElement: expect.any(Function),
      name: null,
      parents: [],
      playgroundUrl:
        'http://localhost:5000/?fixtureId=%7B%22path%22%3A%22src%2FWelcomeMessage%2FWelcomeMessage.fixture.tsx%22%7D',
      relativeFilePath: 'src/WelcomeMessage/WelcomeMessage.fixture.tsx',
      rendererUrl:
        'http://localhost:5000/_renderer.html?_fixtureId=%7B%22path%22%3A%22src%2FWelcomeMessage%2FWelcomeMessage.fixture.tsx%22%7D',
      treePath: ['WelcomeMessage'],
    },
  ]);
});
