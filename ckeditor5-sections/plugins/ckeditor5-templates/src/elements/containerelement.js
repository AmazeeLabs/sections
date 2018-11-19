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
    this.defaultElement = 'ck-templates__' + node.getAttribute('ck-default-element');
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
     const layout = this.node.getAttribute('ck-container-layout') || 'vertical';
     viewWriter.setCustomProperty('container', true, element);
     viewWriter.setCustomProperty(`container-${layout}`, true, element);
     viewWriter.addClass('ck-container', element);
     viewWriter.addClass(`ck-container-layout-${layout}`, element);
     return element;
  }

  postfix(writer, item) {
    super.postfix(writer, item);

    let marked = this.node.getAttribute('ck-container-layout') !== 'paged';
    for (const child of item.getChildren()) {
      marked = marked || !!child.getAttribute('ck-current-page');
    }

    if (item.childCount === 0) {
       writer.appendElement(this.defaultElement, !marked ? {'ck-current-page': true } : {}, item);
       writer.appendElement(this.name + '__placeholder', item);
       return true;
    }

    if (item.getChild(item.childCount - 1).name !== this.name + '__placeholder') {
      writer.appendElement(this.name + '__placeholder', item);
      if (!marked) {
        writer.setAttribute('ck-current-page', true, item.getChild(0));
      }
      return true;
    }
  }

}
