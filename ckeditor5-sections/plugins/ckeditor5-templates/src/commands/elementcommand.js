import Command from '@ckeditor/ckeditor5-core/src/command';

export default class ElementCommand extends Command {

  constructor(editor) {
    super(editor);
    this.set('isVisible', true);
    this.set('label', '');
  }

  getSelectedTemplate() {
    let element = this.editor.editing.mapper.toViewElement(this.editor.model.document.selection.getSelectedElement() || this.editor.model.document.selection.anchor.parent);
    while (element) {
      if (element.getCustomProperty('template') || element.getCustomProperty('placeholder')) {
        return this.editor.editing.mapper.toModelElement(element);
      }
      element = element.parent;
    }
    return false;
  }

  getSelectedContainerItem() {
    const element = this.getSelectedTemplate();
    return (element && element.parent && element.parent.getAttribute('ck-container-layout') === 'paged')
        ? element
        : false;
  }

}
