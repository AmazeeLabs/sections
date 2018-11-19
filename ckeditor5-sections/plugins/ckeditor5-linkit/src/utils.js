/**
 * @module linkit/utils
 */

const linkitElementSymbol = Symbol( 'linkitElement' );

export function createLinkAttributeElement( attributes, writer) {
  if (attributes) {
    const attrs = {};
    for (const key of Object.keys(attributes)) {
      if (key == 'href') {
        continue;
      }
      attrs[key] = attributes[key];
    }
    const linkElement = writer.createAttributeElement( 'a', attrs, { priority: 5 } );
    writer.setCustomProperty( linkitElementSymbol, true, linkElement );
    return linkElement;
  }
}
