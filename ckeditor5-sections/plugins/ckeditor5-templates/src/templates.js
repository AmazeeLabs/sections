/**
 * @module templates/templates
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import Widget from '@ckeditor/ckeditor5-widget/src/widget';
import Element from '@ckeditor/ckeditor5-engine/src/model/element'
import TemplateElement from './templateelement';
import PlaceholderElement from "./elements/placeholderelement";
import MediaSelectCommand from "./commands/mediaselectcommand";

import "../theme/css/media.css";
import ContainerControls from "./ui/containercontrols";
import HoveredWidget from "./ui/hoveredwidget";
import {isWidget} from "@ckeditor/ckeditor5-widget/src/utils";
import Paragraph from "@ckeditor/ckeditor5-paragraph/src/paragraph";
import ContainerElement from "./elements/containerelement";

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
    editor.config.define('rootTemplate', null);
    editor.config.define('templateElements', []);
    editor.config.define('templateAttributes', {});
    editor.config.define('entitySelector', () => '');
    editor.config.define('entityRenderer', () => '');
    this.elements = {};
  }

  /**
   * @inheritDoc
   */
  static get requires() {
    return [Widget, ContainerControls, Paragraph, HoveredWidget];
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
    this.elements = {};
    const templates = this.editor.config.get('templates');

    Object.keys(templates).forEach((name) => {
      const template = (new DOMParser()).parseFromString(templates[name].template, 'text/xml').documentElement;
      template.setAttribute('ck-name', name);
      this._registerElement(template);
    });

    Object.keys(this.elements).forEach((name) => {
      this.elements[name].schemaExtensions.forEach((ext) => {
        this.editor.model.schema.extend(ext.element, ext.info);
      });
    });

    const rootTemplate = this.editor.config.get('rootTemplate');
    if (rootTemplate) {
      const templateId = 'ck-templates__' + rootTemplate;
      this.editor.model.schema.addChildCheck((context, def) => {
        if (context.endsWith('$root') && def.name !== templateId) {
          return false;
        }
      });

      this.editor.model.schema.extend(templateId, { allowIn: '$root'});
      this.editor.model.document.registerPostFixer( writer => this._cleanRoot( writer, templateId) );
      this.editor.on( 'dataReady', () => {
        this.editor.model.enqueueChange( 'transparent', writer => this._cleanRoot( writer, templateId) );
      }, { priority: 'lowest' } );
    }

    this.editor.commands.add('mediaSelect', new MediaSelectCommand(this.editor));

    const balloonToolbar = this.editor.plugins.get( 'BalloonToolbar' );
    // If the `BalloonToolbar` plugin is loaded, it should be disabled for images
    // which have their own toolbar to avoid duplication.
    // https://github.com/ckeditor/ckeditor5-image/issues/110
    if ( balloonToolbar ) {
      this.listenTo( balloonToolbar, 'show', evt => {
        if ( isWidgetSelected( this.editor.editing.view.document.selection ) ) {
          evt.stop();
        }
      }, { priority: 'high' } );
    }
  }

  _cleanRoot(writer, rootTemplate) {

    const model = this.editor.model;

    for ( const rootName of model.document.getRootNames() ) {
      const root = model.document.getRoot( rootName );

      if (root.rootName === '$graveyard' ) {
        continue
      }

      if (root.isEmpty) {
        writer.appendElement(rootTemplate, root);
        return true;
      }
    }
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

    if (element instanceof ContainerElement) {
      const el = document.createElement('div');
      el.setAttribute('ck-editable-type', 'placeholder');
      el.setAttribute('ck-allowed-elements', template.getAttribute('ck-allowed-elements'));
      el.setAttribute('ck-name', 'placeholder');
      this._registerElement(el, element);
    }

    this.elements[element.name] = element;

    /** @type {TemplateElement[]} */
    const children = childNodes
        .map(child => this._registerElement(child, element, childNodes.indexOf(child)))
        .filter( child => !!child);

    element.setChildren(children);
    element.setTemplateManager(this);

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

    // TODO: turn into one postfixer that iterates through templates
    this.editor.model.document.registerPostFixer((writer) => {
      for (const entry of this.editor.model.document.differ.getChanges()) {
        if (entry.type === 'insert' && element.name === entry.name) {
          const item = entry.position.nodeAfter;
          if (this._recursiveElementPostFix(element, writer, item)) {
            return true;
          }
        }

        if (entry.type === 'remove') {
          const item = entry.position.getAncestors().pop();
          if (item.name === element.name && this._recursiveElementPostFix(element, writer, item)) {
            return true;
          }
        }
      }
    });

    return element;
  }

  _recursiveElementPostFix(element, writer, item) {
    let changed = false;
    if (item instanceof Element) {
      if (element.postfixChildren) {
        const children = item.getChildren();
        for (let child of children) {
          changed = this._recursiveElementPostFix(this.elements[child.name], writer, child) || changed;
        }
      }
      changed = element.postfix(writer, item) || changed;
    }
    return changed;
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


function isWidgetSelected( selection ) {
  const viewElement = selection.getSelectedElement();

  return !!( viewElement && isWidget( viewElement ) );
}
