/**
 * @module templates/templates
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import Widget from '@ckeditor/ckeditor5-widget/src/widget';
import TemplateElement from './templateelement';
import MediaSelectCommand from "./commands/mediaselectcommand";

import "../theme/css/media.css";
import AttributeOperation from "@ckeditor/ckeditor5-engine/src/model/operation/attributeoperation";

/**
 * @extends module:core/plugin~Plugin
 */
export default class Templates extends Plugin {

  /**
   * @inheritDoc
   */
  constructor(editor) {
    super(editor);
    editor.config.define('templates', []);
    editor.config.define('templateElements', []);
    editor.config.define('entitySelector', () => '');
    editor.config.define('entityRenderer', () => '');
  }

  /**
   * @inheritDoc
   */
  static get requires() {
    return [Widget];
  }

  /**
   * @inheritDoc
   */
  static get pluginName() {
    return 'Templates';
  }

  /**
   * @inheritDoc
   */
  init() {

    const templates = this.editor.config.get('templates');
    Object.keys(templates).forEach((name) => {
      const template = (new DOMParser()).parseFromString(templates[name], 'text/xml').documentElement;
      template.setAttribute('ck-name', name);
      this._registerElement(template);
    });

    this.editor.commands.add('mediaSelect', new MediaSelectCommand(this.editor));
  }

  /**
   * Parse a single template html element.
   *
   * @param {Node} template - The DOM `Element` node.
   * @param {TemplateElement} parent - The parent element's name.
   * @param {Number} index - The index within the parent element.
   *
   * @return {TemplateElement} - The newly registered element.
   *
   * @private
   */
  _registerElement(template, parent = null, index = 0)  {
    const applicableElements = this.editor.config.get('templateElements')
        .filter((element) => {
          return element.applies(template);
        });

    if (!applicableElements) {
      return null;
    }

    const ElementConstructor = applicableElements[0];

    const childNodes = Array.from(template.childNodes).filter(node => node.nodeType === 1);

    /** @type {TemplateElement} */
    const element = new ElementConstructor(this.editor, template, parent, index);

    /** @type {TemplateElement[]} */
    const children = childNodes
        .map(child => this._registerElement(child, element, childNodes.indexOf(child)))
        .filter( child => !!child);

    element.setChildren(children);

    const attributes = Array.from(new Set(Array.from(template.attributes)
        .map(attr => attr.name)
        .concat(Object.keys(element.defaultAttributes))));

    this.editor.model.schema.register(element.name, Object.assign({
      allowAttributes: attributes,
    }, element.schema));
    this.editor.conversion.for('upcast').add(element.upcast);
    this.editor.conversion.for('dataDowncast').add(element.dataDowncast);
    this.editor.conversion.for('editingDowncast').add(element.editingDowncast);

    for (const attr of attributes) {
      if (attr !== 'class' && attr.substr(0, 3) !== 'ck-') {
        this.editor.conversion.for('downcast').add(modelToViewAttributeConverter(attr, element.name))
      }
    }

    this.editor.model.document.registerPostFixer((writer) => {
      for (const entry of this.editor.model.document.differ.getChanges()) {
        if (entry.type === 'insert' && element.name === entry.name) {
          return element.postfix(writer, entry.position.nodeAfter);
        }
      }
    });

    this.editor.model.schema.addChildCheck((context, def) => {
      if (context.endsWith(element.name)) {
        return element.childCheck(def);
      }
    });

    return element;
  }

}

export function modelToViewAttributeConverter( attributeKey, element ) {
  return dispatcher => {
    dispatcher.on( `attribute:${ attributeKey }:${ element }`, converter );
  };

  function converter( evt, data, conversionApi ) {
    if ( !conversionApi.consumable.consume( data.item, evt.name )) {
      return;
    }

    const viewWriter = conversionApi.writer;
    const entity = conversionApi.mapper.toViewElement( data.item );

    if ( data.attributeNewValue !== null ) {
      viewWriter.setAttribute( data.attributeKey, data.attributeNewValue, entity );
    } else {
      viewWriter.removeAttribute( data.attributeKey, entity );
    }
  }
}
