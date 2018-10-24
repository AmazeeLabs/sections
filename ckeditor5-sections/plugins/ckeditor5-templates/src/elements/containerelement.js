/**
 * @module templates/elements/textelement
 */
import TemplateElement from "../templateelement";

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
     return element;
  }

  postfix(writer, item) {
    super.postfix(writer, item);
    if (item.childCount === 0) {
       writer.appendElement(this.defaultElement, item);
       return true;
    }
  }

}
