import { getSelector } from '../support/utils/css-modules';

// Warning: The following tests are not atomic (which is why we're using before
// instead of beforeEach). Each test builds on the previous and in some cases
// tests rely on state generated by previous tests. This is not ideal, but until
// we expand the Cypress suite further it is good enough. Think of these tests
// as smoke tests.
describe('Local state example', () => {
  context('homepage', () => {
    before(() => {
      cy.visit('/');
    });

    it('should have correct title', () => {
      cy.title().should('include', 'React Cosmos');
    });

    it('should list components', () => {
      const componentSel = getSelector('index__componentName');
      cy.get(`${componentSel}:eq(0)`).should('contain', 'Counter');
      cy.get(`${componentSel}:eq(1)`).should('contain', 'CounterList');
    });

    it('should list fixtures', () => {
      const fixtureSel = getSelector('index__fixture');
      cy.get(`${fixtureSel}:eq(0)`).should('contain', 'default');
      cy.get(`${fixtureSel}:eq(1)`).should('contain', 'fiveClicks');
      cy.get(`${fixtureSel}:eq(2)`).should('contain', 'default');
      cy.get(`${fixtureSel}:eq(3)`).should('contain', 'oneTwoThree');
    });

    it('should show welcome message', () => {
      cy.get(getSelector('index__content')).should('contain', `You're all set`);
    });
  });

  context('filter', () => {
    before(() => {
      // https://github.com/cypress-io/cypress/issues/647
      cy.window().then(window => {
        window.__changePlaygroundSearch({
          target: { value: 'oneTwoThree' }
        });
      });
    });

    it('should match only one fixture', () => {
      const fixtureSel = getSelector('index__fixture');
      cy
        .get(fixtureSel)
        .should('have.length', 1)
        .eq(0)
        .should('contain', 'oneTwoThree');
    });
  });

  context('select fixture', () => {
    // There's only one fixture at this point
    const fixtureButtonSel = `${getSelector('index__fixture')}:eq(0)`;

    before(() => {
      cy.get(fixtureButtonSel).click();
    });

    it('should add active class to fixture button', () => {
      cy
        .get(fixtureButtonSel)
        .then($fixtureButton => {
          return $fixtureButton.attr('class');
        })
        .should('contain', 'index__fixtureSelected');
    });

    it('should render Loader iframe', () => {
      cy
        .get('iframe')
        .should('have.exist')
        .should('have.attr', 'src', './loader/index.html');
    });
  });

  context('fixture editor', () => {
    // The first menu button is the fixture editor toggle
    const editorButtonSel = `${getSelector('index__button')}:eq(1)`;

    before(() => {
      cy.get(editorButtonSel).click();
    });

    it('should add active class to editor button', () => {
      cy
        .get(editorButtonSel)
        .then($fixtureButton => {
          return $fixtureButton.attr('class');
        })
        .should('contain', 'index__selectedButton');
    });

    it('should display fixture inside editor', () => {
      cy.get('.CodeMirror-line:eq(0)').should('contain', '{');
      cy.get('.CodeMirror-line:eq(1)').should('contain', '"state": {');
      cy.get('.CodeMirror-line:eq(2)').should('contain', '"children": {');
      cy.get('.CodeMirror-line:eq(3)').should('contain', '"c1": {');
      cy.get('.CodeMirror-line:eq(4)').should('contain', '"value": 1');
      cy.get('.CodeMirror-line:eq(7)').should('contain', '"value": 2');
      cy.get('.CodeMirror-line:eq(10)').should('contain', '"value": 3');
    });
  });

  context('fixture update', () => {
    before(() => {
      // Click three times on the first button
      cy.get('iframe').then($iframe => {
        const $firstButton = $iframe.contents().find('button:first');
        $firstButton.trigger('click');
        $firstButton.trigger('click');
        $firstButton.trigger('click');
      });
    });

    it('should update fixture contents inside editor', () => {
      cy.get('.CodeMirror-line:eq(4)').should('contain', '"value": 4');
    });

    it('should preseve state after HMR update', () => {
      cy.get('iframe').then($iframe => {
        $iframe[0].contentWindow.__startCosmosLoader();
        cy
          .wait(100) // Wait for postMessage communication to occur
          .get('.CodeMirror-line:eq(4)')
          .should('have.text', '        "value": 4');
      });
    });
  });
});
