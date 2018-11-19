import ElementCommand from './elementcommand';

export default class ElementRemoveCommand extends ElementCommand {

  refresh() {
    const currentElement = this.getSelectedTemplate();
    this.isEnabled = true;
    this.isVisible = currentElement && currentElement.getAttribute('ck-editable-type') !== 'placeholder' && currentElement.parent.getAttribute('ck-editable-type') === 'container';
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
