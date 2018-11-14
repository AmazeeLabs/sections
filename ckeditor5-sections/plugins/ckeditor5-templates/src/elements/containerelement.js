/**
 * @module templates/elements/textelement
 */
import TemplateElement from "../templateelement";
import ViewPosition from "@ckeditor/ckeditor5-engine/src/view/position";
import { insertElement } from '@ckeditor/ckeditor5-engine/src/conversion/downcast-converters';

/**
 * Element class for text input elements.
 */
export default class ContainerElement extends TemplateElement {

  constructor(editor, node, parent = parent, index = 0) {
    super(editor, node, parent, index);
    this.allowedElements = node.getAttribute('ck-allowed-elements').split(' ').map(key => 'ck-templates__' + key);
    this.defaultElement = 'ck-templates__' + node.getAttribute('ck-default-element')
  }

  /**
   * @inheritDoc
   */
  static applies(node) {
    return node.getAttribute('ck-editable-type') === 'container';
  }


  get schemaExtensions() {
    return this.allowedElements.map((el) => {
      return { element: el, info: { allowIn: this.name }};
    });
  }

  toModelElement(viewElement, modelWriter) {
    const model = super.toModelElement(viewElement, modelWriter);
    modelWriter.setAttribute('ck-container', true, model);
    return model;
  }

  toEditorElement(modelElement, viewWriter) {
     const element = super.toEditorElement(modelElement, viewWriter);
     viewWriter.setCustomProperty('container', true, element);
     viewWriter.addClass('ck-container', element);
     const container = viewWriter.createContainerElement('div', {
       class: `ck-container-wrapper ck-container-layout-${this.node.getAttribute('ck-container-layout') || 'vertical'}`
     });
     viewWriter.insert( ViewPosition.createAt( element , 0), container );
     return element;
  }

  get editingDowncast() {
    return (dispatcher) => {
      const insertContainer = insertElement((modelElement, viewWriter) => this.toEditorElement(modelElement, viewWriter));
      dispatcher.on(`insert:${this.name}`, (evt, data, conversionApi) => {
        insertContainer(evt, data, conversionApi);
        const wrapper = conversionApi.mapper.toViewElement(data.item);
        const slot = wrapper.getChild(0);
        conversionApi.mapper.bindElements(data.item, slot);
      });
    };
  }

  postfix(writer, item) {
    super.postfix(writer, item);

    if (item.childCount === 0) {
       writer.appendElement(this.defaultElement, item);
       writer.appendElement(this.name + '__placeholder', item);
       return true;
    }

    if (item.getChild(item.childCount - 1).name !== this.name + '__placeholder') {
      writer.appendElement(this.name + '__placeholder', item);
      return true;
    }
  }

}
