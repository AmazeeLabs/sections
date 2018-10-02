import Command from '@ckeditor/ckeditor5-core/src/command';

export default class SectionCommand extends Command {

  getSelectedSection() {
    let element = this.editor.model.document.selection.getSelectedElement();
    if (element) {
      return element;
    }
    element = this.editor.editing.mapper.toViewElement(this.editor.model.document.selection.anchor.parent);
    while (element) {
      if (element.parent && element.parent.getCustomProperty('container')) {
        return this.editor.editing.mapper.toModelElement(element);
      }
      element = element.parent;
    }
    return false;
  }

}
