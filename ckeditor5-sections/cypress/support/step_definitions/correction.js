/* global Given, When, Then */

Given(`there is a text element with an unexpected h3 element`, () => {
  cy.initEditor(`
    <div class="text">
      <h2>That's ok</h2>
      <h3>That's not ok</h3>
      <div class="content-wrapper">
        <p>Thats just the text</p>
      </div>
    </div>
  `);
});

Then(`the h3 element is removed`, () => {
  cy.get('#editor h3').should('not.exist');
});

Given(`there is a text element missing the p element`, () => {
  cy.initEditor(`
    <div class="text">
      <h2>That's ok</h2>
    </div>
  `);
});

Then(`an empty p element is added`, () => {
  cy.get('#editor p').should('exist');
});

Given(`there is a text element with element p before h2`, () => {
  cy.initEditor(`
    <div class="text">
      <div class="content-wrapper">
        <p>Thats in the wrong order</p>
      </div>
      <h2>This one too</h2>
    </div>
  `);
});

Given(`there is a text element with element h3 before p`, () => {
  cy.initEditor(`
    <div class="text">
      <h3>This one too</h3>
      <div class="content-wrapper">
        <p>Thats in the wrong order</p>
      </div>
    </div>
  `);
});

Then(`it is corrected to h2 before p`, () => {
  cy.get('#editor .text').children().first().filter('h2');
  cy.get('#editor .text').children().last().filter('.content-wrapper');
});
