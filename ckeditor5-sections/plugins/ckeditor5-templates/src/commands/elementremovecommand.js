import ElementCommand from './elementcommand';

export default class ElementRemoveCommand extends ElementCommand {

  refresh() {
    const currentElement = this.getSelectedElement();
    this.isEnabled = currentElement && (currentElement.previousSibling || currentElement.nextSibling);
  }

  execute(values) {
    debugger;
    const currentElement = this.getSelectedElement();
    this.editor.model.change(writer => {
      writer.remove(currentElement);
    });
  }
}
