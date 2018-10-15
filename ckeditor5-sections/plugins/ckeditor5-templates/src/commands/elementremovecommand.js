import ElementCommand from './elementcommand';

export default class ElementRemoveCommand extends ElementCommand {

  refresh() {
    const currentElement = this.getSelectedElement();
    this.isEnabled = currentElement && (currentElement.previousSibling || currentElement.nextSibling);
  }

  execute(values) {
    const currentElement = this.getSelectedElement();
    this.editor.model.change(writer => {
      writer.remove(currentElement);
    });
  }
}
