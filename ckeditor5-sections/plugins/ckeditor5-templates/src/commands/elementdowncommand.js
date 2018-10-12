import ElementCommand from './elementcommand';

export default class ElementDownCommand extends ElementCommand {

  refresh() {
    const currentElement = this.getSelectedElement();
    this.isEnabled = currentElement && currentElement.nextSibling;
  }

  execute() {
    const model = this.editor.model;
    const currentElement = this.getSelectedElement();
    model.change(writer => {
      writer.insert(currentElement, currentElement.nextSibling, 'after');
    });
  }
}
