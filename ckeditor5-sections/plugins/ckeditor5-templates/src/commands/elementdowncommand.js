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

    const view = this.editor.editing.view;
    const nextElement = view.domConverter.mapViewToDom(editor.editing.mapper.toViewElement(currentElement.nextSibling));

    if (nextElement) {
      console.log(nextElement.offsetHeight);
      window.window.scrollBy({
        top: nextElement.offsetHeight,
        behavior: "smooth"
      });
    }
    else {
      window.scrollTo({
        bottom: 0,
        behavior: "smooth"
      });
    }

    const currentDOMElement = view.domConverter.mapViewToDom(editor.editing.mapper.toViewElement(currentElement));
    currentDOMElement.focus();
  }
}
