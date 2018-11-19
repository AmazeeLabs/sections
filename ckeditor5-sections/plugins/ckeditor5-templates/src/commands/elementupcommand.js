import ElementCommand from './elementcommand';

export default class ElementUpCommand extends ElementCommand {

  refresh() {
    const currentElement = this.getSelectedTemplate();
    this.isEnabled = currentElement && currentElement.previousSibling;
    this.isVisible = currentElement && currentElement.getAttribute('ck-editable-type') !== 'placeholder' && currentElement.parent.getAttribute('ck-editable-type') === 'container';
  }

  execute() {
    const currentElement = this.getSelectedTemplate();
    const model = this.editor.model;
    const view = this.editor.editing.view;
    const editing = this.editor.editing;
    const previousElement = view.domConverter.mapViewToDom(editing.mapper.toViewElement(currentElement.previousSibling));
    const currentDOMElement = view.domConverter.mapViewToDom(editing.mapper.toViewElement(currentElement));
    const currentPosition = window.scrollY;
    const diff = previousElement.offsetTop - currentDOMElement.offsetTop;

    model.change(writer => {
      writer.insert(currentElement, currentElement.previousSibling, 'before');
    });

    window.setTimeout(() => {
      window.scrollTo(0, currentPosition + diff);
    }, 0);
  }
}
