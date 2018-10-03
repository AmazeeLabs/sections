Given(`there is an empty image gallery`, () => {
  cy.initEditor(`
    <div class="gallery">
    <h2>
</h2>
<div class="gallery__images"></div>
</div>
  `)
});
