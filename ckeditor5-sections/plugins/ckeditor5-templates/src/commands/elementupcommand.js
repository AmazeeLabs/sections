import ElementCommand from './elementcommand';

export default class ElementUpCommand extends ElementCommand {

  refresh() {
    const currentElement = this.getSelectedElement();
    this.isEnabled = currentElement && currentElement.previousSibling;
  }

  execute() {
    const currentElement = this.getSelectedElement();
    this.editor.model.change(writer => {
      writer.insert(currentElement, currentElement.previousSibling, 'before');
    });
  }
}
