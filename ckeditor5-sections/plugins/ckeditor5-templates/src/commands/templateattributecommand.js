import ElementCommand from './elementcommand';

export default class TemplateAttributeCommand extends ElementCommand {

  constructor(editor, attribute) {
    super(editor);
    this.attribute = attribute;
  }

  refresh() {
    const currentElement = this.getSelectedElement();
    this.isEnabled = currentElement && Array.from(currentElement.getAttributeKeys()).includes(this.attribute);
    if (this.isEnabled) {
      this.value = this.getSelectedElement().getAttribute(this.attribute);
    }
  }

  execute(values) {
    if (this.isEnabled) {
      const currentElement = this.getSelectedElement();
      this.editor.model.change(writer => {
        writer.setAttribute(this.attribute, values.value, currentElement);
      });
    }
  }
}
