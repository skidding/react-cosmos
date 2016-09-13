/* eslint-env browser, mocha */
/* eslint-disable
  global-require,
  no-unused-vars,
  no-unused-expressions,
  import/no-unresolved,
  import/no-extraneous-dependencies
*/
/* global expect, sinon */

const FIXTURE = 'selected-fixture';

describe(`ComponentPlayground (${FIXTURE}) Transitions Props`, () => {
  const _ = require('lodash');
  const ComponentTree = require('react-component-tree');
  const render = require('helpers/render-component');

  const fixture = require(`fixtures/component-playground/${FIXTURE}`);

  let component;
  let $component;
  let container;
  let stateSet;
  let stateInjected;

  beforeEach(() => {
    ({ container, component, $component } = render(fixture));

    sinon.stub(ComponentTree, 'injectState');
    sinon.spy(component, 'setState');

    const updatedFixture = _.clone(fixture);
    _.assign(updatedFixture, {
      component: 'SecondComponent',
      fixture: 'index',
    });
    delete updatedFixture.state;

    render(updatedFixture, container);

    stateSet = component.setState.lastCall.args[0];
    stateInjected = ComponentTree.injectState.lastCall.args;
  });

  afterEach(() => {
    ComponentTree.injectState.restore();
    component.setState.restore();
  });

  it('should replace fixture contents', () => {
    expect(stateSet.fixtureContents.myProp).to.equal(true);
  });

  it('should reset unserializable fixture props', () => {
    expect(stateSet.fixtureUnserializableProps).to.deep.equal({});
  });

  it('should replace fixture user input', () => {
    expect(JSON.parse(stateSet.fixtureUserInput).myProp).to.equal(true);
  });

  it('should reset valid user input flag', () => {
    expect(stateSet.isFixtureUserInputValid).to.be.true;
  });

  it('should inject new state to preview child', () => {
    expect(stateInjected[0]).to.equal(component.previewComponent);
    expect(stateInjected[1].somethingHappened).to.equal(true);
  });
});
