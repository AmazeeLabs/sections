import ElementCommand from './elementcommand';

export default class ElementUpCommand extends ElementCommand {

  refresh() {
    const currentElement = this.getSelectedElement();
    this.isEnabled = currentElement && currentElement.previousSibling;
  }

  execute() {
    const currentElement = this.getSelectedElement();
    const model = this.editor.model;
    model.change(writer => {
      writer.insert(currentElement, currentElement.previousSibling, 'before');
    });

    const view = this.editor.editing.view;
    const previousElement = view.domConverter.mapViewToDom(editor.editing.mapper.toViewElement(currentElement.previousSibling));

    if (previousElement) {
      console.log(previousElement.offsetHeight);
      window.scrollBy({
        top: previousElement.offsetHeight,
        behavior: "smooth"
      });
    }
    else {
      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    }

    const currentDOMElement = view.domConverter.mapViewToDom(editor.editing.mapper.toViewElement(currentElement));
    currentDOMElement.focus();
  }
}
