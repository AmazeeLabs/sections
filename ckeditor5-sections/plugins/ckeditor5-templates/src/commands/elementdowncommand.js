import ElementCommand from './elementcommand';

export default class ElementDownCommand extends ElementCommand {

  refresh() {
    const currentElement = this.getSelectedTemplate();
    this.isEnabled = currentElement && currentElement.nextSibling && !(currentElement.nextSibling.getAttribute('ck-editable-type') === 'placeholder');
    this.isVisible = currentElement && currentElement.getAttribute('ck-editable-type') !== 'placeholder' && currentElement.parent.getAttribute('ck-editable-type') === 'container';
  }

  execute() {
    const model = this.editor.model;
    const currentElement = this.getSelectedTemplate();
    const view = this.editor.editing.view;
    const editing = this.editor.editing;
    const nextElement = view.domConverter.mapViewToDom(editing.mapper.toViewElement(currentElement.nextSibling));
    const currentPosition = window.scrollY;

    // If the next element is the last element, scroll down to the bottom of the page.
    let diff = nextElement.offsetHeight;

    // Else calculate the scroll distance  by using the next and the next-next offset top value.
    if (currentElement.nextSibling.nextSibling) {
      const nextNextElement = view.domConverter.mapViewToDom(editing.mapper.toViewElement(currentElement.nextSibling.nextSibling));
      diff = nextNextElement.offsetTop - nextElement.offsetTop;
    }

    model.change(writer => {
      writer.insert(currentElement, currentElement.nextSibling, 'after');
    });

    window.setTimeout(() => {
      window.scrollTo(0, currentPosition + diff);
    }, 0);
  }
}
