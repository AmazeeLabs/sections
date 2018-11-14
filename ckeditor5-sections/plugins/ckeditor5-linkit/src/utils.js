/**
 * @module linkit/utils
 */

/**
 * Creates link {@link module:engine/view/attributeelement~AttributeElement} with provided `href` attribute.
 *
 * @param {String} href
 * @returns {module:engine/view/attributeelement~AttributeElement}
 */
export function createLinkElement( attributes, writer ) {
  // Priority 5 - https://github.com/ckeditor/ckeditor5-link/issues/121.
  const linkElement = writer.createAttributeElement( 'a', attributes, { priority: 5 } );
  writer.setCustomProperty( linkElementSymbol, true, linkElement );

  return linkElement;
}
