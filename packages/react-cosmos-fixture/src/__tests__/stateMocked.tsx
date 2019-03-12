import * as React from 'react';
import until from 'async-until';
import retry from '@skidding/async-retry';
import { StateMock } from '@react-mock/state';
import {
  getCompFixtureStates,
  updateCompFixtureState
} from 'react-cosmos-shared2/fixtureState';
import { uuid } from 'react-cosmos-shared2/util';
import { Counter, CoolCounter } from '../testHelpers/components';
import { createCompFxState, createFxValues } from '../testHelpers/fixtureState';
import { runTests, mount } from '../testHelpers';

const rendererId = uuid();
const fixtures = {
  first: (
    <StateMock state={{ count: 5 }}>
      <Counter />
    </StateMock>
  )
};
const decorators = {};

runTests(mockConnect => {
  it('captures mocked state', async () => {
    await mockConnect(async ({ getElement, selectFixture, untilMessage }) => {
      await mount(
        getElement({ rendererId, fixtures, decorators }),
        async renderer => {
          await selectFixture({
            rendererId,
            fixtureId: { path: 'first', name: null },
            fixtureState: null
          });

          await retry(() => expect(renderer.toJSON()).toBe('5 times'));

          await untilMessage({
            type: 'fixtureStateChange',
            payload: {
              rendererId,
              fixtureId: { path: 'first', name: null },
              fixtureState: {
                components: [
                  createCompFxState({
                    props: [],
                    state: createFxValues({ count: 5 })
                  })
                ]
              }
            }
          });
        }
      );
    });
  });

  it('overwrites mocked state', async () => {
    await mockConnect(
      async ({
        getElement,
        selectFixture,
        getLastFixtureState,
        setFixtureState
      }) => {
        await mount(
          getElement({ rendererId, fixtures, decorators }),
          async renderer => {
            await selectFixture({
              rendererId,
              fixtureId: { path: 'first', name: null },
              fixtureState: null
            });

            const fixtureState = await getLastFixtureState();
            const [{ decoratorId, elPath }] = getCompFixtureStates(
              fixtureState
            );
            await setFixtureState({
              rendererId,
              fixtureId: { path: 'first', name: null },
              fixtureState: {
                components: updateCompFixtureState({
                  fixtureState,
                  decoratorId,
                  elPath,
                  state: createFxValues({ count: 100 })
                })
              }
            });

            await retry(() => expect(renderer.toJSON()).toBe('100 times'));

            // A second update will provide code coverage for a different branch:
            // the transition between fixture state values
            await setFixtureState({
              rendererId,
              fixtureId: { path: 'first', name: null },
              fixtureState: {
                components: updateCompFixtureState({
                  fixtureState,
                  decoratorId,
                  elPath,
                  state: createFxValues({ count: 200 })
                })
              }
            });

            await retry(() => expect(renderer.toJSON()).toBe('200 times'));
          }
        );
      }
    );
  });

  it('removes mocked state property', async () => {
    await mockConnect(
      async ({
        getElement,
        selectFixture,
        getLastFixtureState,
        setFixtureState
      }) => {
        await mount(
          getElement({ rendererId, fixtures, decorators }),
          async renderer => {
            await selectFixture({
              rendererId,
              fixtureId: { path: 'first', name: null },
              fixtureState: null
            });

            const fixtureState = await getLastFixtureState();
            const [{ decoratorId, elPath }] = getCompFixtureStates(
              fixtureState
            );
            await setFixtureState({
              rendererId,
              fixtureId: { path: 'first', name: null },
              fixtureState: {
                components: updateCompFixtureState({
                  fixtureState,
                  decoratorId,
                  elPath,
                  state: []
                })
              }
            });

            await retry(() => expect(renderer.toJSON()).toBe('Missing count'));
          }
        );
      }
    );
  });

  it('reverts to mocked state', async () => {
    await mockConnect(
      async ({
        getElement,
        selectFixture,
        untilMessage,
        getLastFixtureState,
        setFixtureState
      }) => {
        await mount(
          getElement({ rendererId, fixtures, decorators }),
          async renderer => {
            await selectFixture({
              rendererId,
              fixtureId: { path: 'first', name: null },
              fixtureState: null
            });

            const fixtureState = await getLastFixtureState();
            const [{ decoratorId, elPath }] = getCompFixtureStates(
              fixtureState
            );
            await setFixtureState({
              rendererId,
              fixtureId: { path: 'first', name: null },
              fixtureState: {
                components: updateCompFixtureState({
                  fixtureState,
                  decoratorId,
                  elPath,
                  state: createFxValues({ count: 10 })
                })
              }
            });

            await retry(() => expect(renderer.toJSON()).toBe('10 times'));

            await setFixtureState({
              rendererId,
              fixtureId: { path: 'first', name: null },
              fixtureState: {
                components: updateCompFixtureState({
                  fixtureState,
                  decoratorId,
                  elPath,
                  state: null
                })
              }
            });

            await retry(() => expect(renderer.toJSON()).toBe('5 times'));

            // After the state is removed from the fixture state, the original
            // state is added back through a fixtureStateChange message
            await untilMessage({
              type: 'fixtureStateChange',
              payload: {
                rendererId,
                fixtureId: { path: 'first', name: null },
                fixtureState: {
                  components: [
                    createCompFxState({
                      props: [],
                      state: createFxValues({ count: 5 })
                    })
                  ]
                }
              }
            });
          }
        );
      }
    );
  });

  it('captures component state changes', async () => {
    const timeout = 1000;
    let counterRef: null | Counter;

    const fixturesNew = {
      first: (
        <StateMock state={{ count: 5 }}>
          <Counter
            ref={elRef => {
              if (elRef) {
                counterRef = elRef;
              }
            }}
          />
        </StateMock>
      )
    };

    await mockConnect(
      async ({ getElement, selectFixture, getLastFixtureState }) => {
        await mount(
          getElement({ rendererId, fixtures: fixturesNew, decorators }),
          async () => {
            await selectFixture({
              rendererId,
              fixtureId: { path: 'first', name: null },
              fixtureState: null
            });

            await until(() => counterRef, { timeout });
            if (!counterRef) {
              throw new Error('Counter ref missing');
            }

            counterRef.setState({ count: 7 });
            try {
              await until(async () => (await getCount()) === 7, { timeout });
            } finally {
              expect(await getCount()).toBe(7);
            }

            // Simulate a small pause between updates
            await new Promise(res => setTimeout(res, 500));

            counterRef.setState({ count: 13 });
            try {
              await until(async () => (await getCount()) === 13, { timeout });
            } finally {
              expect(await getCount()).toBe(13);
            }
          }
        );

        async function getCount() {
          const fixtureState = await getLastFixtureState();
          const [{ state }] = getCompFixtureStates(fixtureState);

          return state ? JSON.parse(state[0].stringified) : null;
        }
      }
    );
  });

  it('applies fixture state to replaced component type', async () => {
    await mockConnect(
      async ({
        getElement,
        selectFixture,
        getLastFixtureState,
        setFixtureState
      }) => {
        await mount(
          getElement({ rendererId, fixtures, decorators }),
          async renderer => {
            await selectFixture({
              rendererId,
              fixtureId: { path: 'first', name: null },
              fixtureState: null
            });

            const fixtureState = await getLastFixtureState();
            const [{ decoratorId, elPath }] = getCompFixtureStates(
              fixtureState
            );
            await setFixtureState({
              rendererId,
              fixtureId: { path: 'first', name: null },
              fixtureState: {
                components: updateCompFixtureState({
                  fixtureState,
                  decoratorId,
                  elPath,
                  state: createFxValues({ count: 50 })
                })
              }
            });

            await retry(() => expect(renderer.toJSON()).toBe('50 times'));

            renderer.update(
              getElement({
                rendererId,
                fixtures: {
                  first: (
                    <StateMock state={{ count: 5 }}>
                      <CoolCounter />
                    </StateMock>
                  )
                },
                decorators
              })
            );

            expect(renderer.toJSON()).toBe('50 timez');
          }
        );
      }
    );
  });

  it('overwrites fixture state on fixture change', async () => {
    await mockConnect(
      async ({
        getElement,
        selectFixture,
        untilMessage,
        getLastFixtureState,
        setFixtureState
      }) => {
        await mount(
          getElement({ rendererId, fixtures, decorators }),
          async renderer => {
            await selectFixture({
              rendererId,
              fixtureId: { path: 'first', name: null },
              fixtureState: null
            });

            const fixtureState = await getLastFixtureState();
            const [{ decoratorId, elPath }] = getCompFixtureStates(
              fixtureState
            );
            await setFixtureState({
              rendererId,
              fixtureId: { path: 'first', name: null },
              fixtureState: {
                components: updateCompFixtureState({
                  fixtureState,
                  decoratorId,
                  elPath,
                  state: createFxValues({ count: 6 })
                })
              }
            });

            await retry(() => expect(renderer.toJSON()).toBe('6 times'));

            // When the fixture changes, however, the fixture state follows along
            renderer.update(
              getElement({
                rendererId,
                fixtures: {
                  first: (
                    <StateMock state={{ count: 50 }}>
                      <Counter />
                    </StateMock>
                  )
                },
                decorators
              })
            );

            await untilMessage({
              type: 'fixtureStateChange',
              payload: {
                rendererId,
                fixtureId: { path: 'first', name: null },
                fixtureState: {
                  components: [
                    createCompFxState({
                      props: [],
                      state: createFxValues({ count: 50 })
                    })
                  ]
                }
              }
            });

            expect(renderer.toJSON()).toBe('50 times');
          }
        );
      }
    );
  });

  it('clears fixture state for removed fixture element', async () => {
    await mockConnect(async ({ getElement, untilMessage, selectFixture }) => {
      await mount(
        getElement({ rendererId, fixtures, decorators }),
        async renderer => {
          await selectFixture({
            rendererId,
            fixtureId: { path: 'first', name: null },
            fixtureState: null
          });

          await untilMessage({
            type: 'fixtureStateChange',
            payload: {
              rendererId,
              fixtureId: { path: 'first', name: null },
              fixtureState: {
                components: [
                  createCompFxState({
                    props: [],
                    state: createFxValues({ count: 5 })
                  })
                ]
              }
            }
          });

          renderer.update(
            getElement({
              rendererId,
              fixtures: {
                // Counter element from fixture is gone, and so should the
                // fixture state related to it.
                first: 'No counts for you.'
              },
              decorators
            })
          );

          expect(renderer.toJSON()).toBe('No counts for you.');

          await untilMessage({
            type: 'fixtureStateChange',
            payload: {
              rendererId,
              fixtureId: { path: 'first', name: null },
              fixtureState: {
                components: []
              }
            }
          });
        }
      );
    });
  });
});