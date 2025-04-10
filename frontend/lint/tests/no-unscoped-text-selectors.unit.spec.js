import { RuleTester } from "eslint";

import rule from "../eslint-rules/no-unscoped-text-selectors";

const ruleTester = new RuleTester({ parserOptions: { ecmaVersion: 2015 } });

const scopeError = { message: /should be scoped/i };

const blockTypes = ["it", "before", "beforeEach", "it.only", "it.banana"];

const blockWrapper = (content, blockType = "it") => `
  ${blockType}('should test something', () => {
    ${content}
  });
`;

const validCases = [
  `cy.get('#my-div').within(() => findByText('foo'));`,
  `cy.get('#my-div').within(() => {
    findByText('foo')
  });`,
  `cy.get('#my-div').findByText('foo');`,
  `cy.findByLabelText('label-name').findByText('this is fine');`,
  `cy
    .findByLabelText('label-name')
    .findByText('this is fine')
    .click();
  ;`,
  `cy.get('#my-div').within(() => {
    cy.contains('my string of text').click();
  });`,
  `cy.get('#my-div').contains('my string of text').click();`,
  `cy.contains('#my-div', 'foo')`,
  `cy.get('#my-div').contains('foo')`,
  `cy.get('#my-div').find('.elem').contains('foo')`,
  `cy.get('#my-div').within(() => { cy.contains('foo') })`,
];

const invalidCases = [
  "cy.findByText('foo');",
  "cy.findByText('foo').click();",
  `cy.findByText('foo').within(() => {
    cy.findByText('bar').click();
  }).click().clack();`,
  "cy.contains('foobar');",
  "cy.contains('foobar').click();",
  `cy.contains('#my-div', {timeout: 10000})`,
];

ruleTester.run("no-unscoped-text-selectors", rule, {
  valid: blockTypes.flatMap((blockType) =>
    validCases.map((testCase) => ({
      code: blockWrapper(testCase, blockType),
    })),
  ),

  invalid: blockTypes.flatMap((blockType) =>
    invalidCases.map((testCase) => ({
      code: blockWrapper(testCase, blockType),
      errors: [scopeError],
    })),
  ),
});
