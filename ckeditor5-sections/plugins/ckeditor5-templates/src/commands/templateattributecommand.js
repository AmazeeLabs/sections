import ElementCommand from './elementcommand';

export default class TemplateAttributeCommand extends ElementCommand {

  constructor(editor, attribute) {
    super(editor);
    this.attribute = attribute;
  }

  refresh() {
    const currentElement = this.getSelectedTemplate();
    this.isEnabled = currentElement && Array.from(currentElement.getAttributeKeys()).includes(this.attribute);
    if (this.isEnabled) {
      this.value = this.getSelectedTemplate().getAttribute(this.attribute);
    }
  }

  execute(values) {
    if (this.isEnabled) {
      const currentElement = this.getSelectedTemplate();
      this.editor.model.change(writer => {
        writer.setAttribute(this.attribute, values.value, currentElement);
      });
    }
  }

}
