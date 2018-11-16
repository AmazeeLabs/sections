import ElementCommand from './elementcommand';

export default class ElementRemoveCommand extends ElementCommand {

  refresh() {
    const currentElement = this.getSelectedTemplate();
    this.isEnabled = currentElement && (currentElement.previousSibling || currentElement.nextSibling);
  }

  execute(values) {
    const currentElement = this.getSelectedTemplate();
    const next = currentElement.previousSibling || currentElement.nextSibling;
    this.editor.model.change(writer => {
      writer.remove(currentElement);
      writer.setAttribute('ck-current-page', true, next);
      writer.setSelection(next, 'on');
    });
  }
}
