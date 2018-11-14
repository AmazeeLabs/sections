/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module linkit/linkediting
 */

import LinkEditing from '@ckeditor/ckeditor5-link/src/linkediting';
import {
  downcastAttributeToElement
} from '@ckeditor/ckeditor5-engine/src/conversion/downcast-converters';
import { upcastElementToAttribute } from '@ckeditor/ckeditor5-engine/src/conversion/upcast-converters';
import LinkitCommand from './linkitcommand';
import UnlinkLinkitCommand from './unlinklinkitcommand';
import LinkCommand from '@ckeditor/ckeditor5-link/src/linkcommand';
import UnlinkCommand from '@ckeditor/ckeditor5-link/src/unlinkcommand';
import { ensureSafeUrl, createLinkElement } from '@ckeditor/ckeditor5-link/src/utils';
import { createLinkAttributeElement } from './utils';
import bindTwoStepCaretToAttribute from '@ckeditor/ckeditor5-engine/src/utils/bindtwostepcarettoattribute';
import '@ckeditor/ckeditor5-link/theme/link.css';

const HIGHLIGHT_CLASS = 'ck-link_selected';

/**
 * The link engine feature.
 *
 * It introduces the `linkHref="url"` attribute in the model which renders to the view as a `<a href="url">` element.
 *
 * @extends module:core/plugin~Plugin
 */
export default class LinkitEditing extends LinkEditing {

  /**
   * @inheritDoc
   */
  init() {
    const editor = this.editor;
    this._linkSelector = editor.config.get('linkSelector');

    // Allow link attribute on all inline nodes.
    editor.model.schema.extend( '$text', { allowAttributes: ['linkHref', 'linkitAttrs']});

    editor.conversion.for( 'dataDowncast' )
      .add( downcastAttributeToElement( { model: 'linkHref', view: (href, writer) => {
        return createLinkElement( href, writer);
      } } ) );

    editor.conversion.for( 'editingDowncast' )
      .add( downcastAttributeToElement( { model: 'linkHref', view: ( href, writer ) => {
        return createLinkElement( ensureSafeUrl(href), writer );
      } } ) );

    editor.conversion.for( 'dataDowncast' )
      .add( downcastAttributeToElement( { model: 'linkitAttrs', view: (attributes, writer) => {
        return createLinkAttributeElement(attributes, writer);
      } } ) );

    editor.conversion.for( 'editingDowncast' )
      .add( downcastAttributeToElement( { model: 'linkitAttrs', view: ( attributes, writer ) => {
        return createLinkAttributeElement(attributes, writer);
      } } ) );

    editor.conversion.for( 'upcast' )
      .add( upcastElementToAttribute( {
        view: {
          name: 'a',
          attributes: {
            href: true
          }
        },
        model: {
          key: 'linkHref',
          value: viewElement => {
            return viewElement.getAttributes();
          }
        }
      } ) );

    // Create linking commands.
    if (this._linkSelector) {
      editor.commands.add( 'link', new LinkitCommand( editor ) );
      editor.commands.add( 'unlink', new UnlinkLinkitCommand( editor ) );
    } else {
      editor.commands.add( 'link', new LinkCommand( editor ) );
      editor.commands.add( 'unlink', new UnlinkCommand( editor ) );
    }

    // Enable two-step caret movement for `linkHref` attribute.
    bindTwoStepCaretToAttribute( editor.editing.view, editor.model, this, 'linkHref' );

    // Setup highlight over selected link.
    this._setupLinkHighlight();
  }

}
