import EditableElement
  from "@ckeditor/ckeditor5-engine/src/view/editableelement";

/**
 * Returns the view element associated with current selection.
 *
 * @returns {module:engine/view/element~Element}
 */
export const getSelectedElement = editor => {
  const modelElement = editor.model.document.selection.getSelectedElement()
    || editor.model.document.selection.anchor.parent;

  return editor.editing.mapper.toViewElement(modelElement);
};

/**
 * Returns a model of the currently selected editable element.
 * @returns {*}
 */
export const getSelectedEditableModel = editor => {
  let element = getSelectedElement(editor);

  while (element) {
    if (element && element instanceof EditableElement) {
      return editor.editing.mapper.toModelElement(element);
    }
    element = element.parent;
  }
  return false;
};

/**
 * Returns a model of the currently selected template element.
 * @returns {*}
 */
export const getSelectedTemplateModel = editor => {
  let element = getSelectedElement(editor);

  while (element) {
    if (element.getCustomProperty('template') || element.getCustomProperty('placeholder')) {
      return editor.editing.mapper.toModelElement(element);
    }
    element = element.parent;
  }
  return false;
};
