/**
 * @module templates/element
 */

import { downcastElementToElement } from '@ckeditor/ckeditor5-engine/src/conversion/downcast-converters';
import { upcastElementToElement } from '@ckeditor/ckeditor5-engine/src/conversion/upcast-converters';

import { toWidget } from '@ckeditor/ckeditor5-widget/src/utils';

/**
 * The base class for template elements.
 *
 * @class TemplateElement
 */
export default class TemplateElement {

  /**
   * Sets the template manager.
   *
   * @param {Templates} manager - The template manager.
   */
  setTemplateManager(manager) {
    this.templateManager = manager;
  }

  /**
   * Returns the template manager.
   *
   * @return {Templates} manager - The template manager.
   */
  getTemplateElement(name) {
    return this.templateManager.getTemplate(name);
  }

  /**
   * Check if the current element applies for a given node.
   *
   * @param {Element} node
   */
  static applies(node) {
    return true;
  }

  /**
   * Determines if children should be automatically postfixed.
   *
   * @returns {boolean}
   */
  get postfixChildren() {
    return true;
  }

  /**
   * @param {module:core/editor/editor~Editor} editor
   * @param {Element} node
   * @param {TemplateElement} parent
   * @param {Number} index
   */
  constructor(editor, node, parent = null, index = 0) {

    /**
     * The current editor instance.
     *
     * @member {module:core/editor/editor~Editor}
     */
    this.editor = editor;

    /**
     * The html document of the widget template.
     *
     * @member {Element}
     */
    this.node = node;

    /**
     * The index within the current parent element.
     *
     * @member {Number}
     */
    this.index = index;

    /**
     * The parent template.
     *
     * @member {TemplateElement}
     */
    this.parent = parent;
  }

  setChildren(children) {
    /**
     * All child template elements.
     *
     * @member {TemplateElement[]}
     */
    this.children = children;

    /**
     * Local cache of child element names for quicker look-ups.
     *
     * @member {String[]}
     */
    this.childNames = children.map(child => child.name);
  }

  /**
   * Returns the name of the current node, prefixed by the parent's name.
   *
   * @private
   */
  get _name() {
    const name = (this.node.getAttribute('ck-name') || 'child' + this.index);
    return this.parent ? this.parent._name + '__' + name : name;
  }

  /**
   * Returns the calculated name for this element.
   *
   * @returns {String}
   */
  get name() {
    if (!this._nameCache) {
      this._nameCache = 'ck-templates__' + this._name;
    }
    return this._nameCache;
  }

  /**
   * The generated schema definition object.
   *
   * @returns {*}
   */
  get schema() {
    return {
      isObject: !this.parent,
      allowIn: !this.parent ? [] : this.parent.name,
    };
  }

  /**
   * Returns an array of extensions to the model's schema.
   *
   * @return {Object[]} - An array of objects with 'element' and 'info' properties.
   */
  get schemaExtensions() {
    return [];
  }

  /**
   * Attributes that are allowed by default, without being added to the template.
   *
   * @return *
   */
  get defaultAttributes() {
    return {
      'ck-current-page': true,
      'ck-paging-disabled': true,
    };
  }

  /**
   * Tells if the given view element matches the template's node.
   *
   * @param {module:engine/view/element~Element} viewElement
   *
   * @return {Object}
   */
  matchesViewElement(viewElement) {
    const templateClasses = Array.from(this.node.classList);
    return viewElement.name === this.node.tagName
      && templateClasses.filter(cls => viewElement.hasClass(cls)).length === templateClasses.length
      && (!this.parent || this.parent.matchesViewElement(viewElement.parent))
  }

  /**
   * Creates an element
   */
  toModelElement(viewElement, modelWriter) {
    const attributes = Object.assign(
        // By default set all attributes defined in the template.
        Array.from(this.node.attributes)
            .map(attr => ({[attr.name]: attr.value}))
            .reduce((acc, val) => Object.assign(acc, val), {}),
        // Override with actual values.
        Array.from(viewElement.getAttributeKeys())
            .map(key => ({[key]: viewElement.getAttribute(key)}))
            .reduce((acc, val) => Object.assign(acc, val), {})
    );
    return modelWriter.createElement(this.name, attributes);
  }

  /**
   * Return a upcast converter for this element.
   *
   * @returns {Function}
   */
  get upcast() {
    return upcastElementToElement({
      view: (viewElement) => {
        if (this.matchesViewElement(viewElement)) {
          return {template: true};
        }
        return null;
      },
      model: (viewElement, modelWriter) => {
        return this.toModelElement(viewElement, modelWriter);
      }
    });
  }

  get dataDowncast() {
    return downcastElementToElement({
      model: this.name,
      view: (modelElement, viewWriter) => {
        return viewWriter.createContainerElement(this.node.tagName, this.getModelAttributes(modelElement));
      }
    });
  }

  toEditorElement(modelElement, viewWriter) {
    const element = viewWriter.createContainerElement(this.node.tagName, this.getModelAttributes(modelElement));
    if (!this.parent) {
      viewWriter.setCustomProperty('template', true, element);
    }
    return this.parent ? element : toWidget(element, viewWriter);
  }

  get editingDowncast() {
    return downcastElementToElement({
      model: this.name,
      view: (modelElement, viewWriter) => {
        return this.toEditorElement(modelElement, viewWriter);
      }
    });
  }

  get fittingElements() {
    return [this.name];
  }

  postfix(writer, item) {

    // Template attributes that are not part of the model are copied into the model initially.
    for (let attr of this.node.attributes) {
      if (!Array.from(item.getAttributeKeys()).includes(attr.name)) {
        writer.setAttribute(attr.name, attr.value, item);
      }
    }

    const childMap = this.children.map((child) => ({[child.name]: child}))
		.reduce((acc, val) => Object.assign(acc, val), {});

    const childSeats = this.children.map((child) => ({[child.name]: false}))
        .reduce((acc, val) => Object.assign(acc, val), {});

    const childOptions = this.children.map((child) => ({[child.name]: child.fittingElements}))
        .reduce((acc, val) => Object.assign(acc, val), {});

    for (let child of item.getChildren()) {
      if (childSeats.hasOwnProperty(child.name) && !childSeats[child.name]) {
        childSeats[child.name] = child;
      }
      for (const name in childSeats) {
        if (childOptions[name].includes(child.name)) {
          childSeats[name] = child;
        }
      }
    }

    let changed = false;

    for (let name in childSeats) {
      if (childSeats[name]) {
        writer.insert(childSeats[name], item, 'end');
      }
      else {
      	if (childMap[name].placeholderOptions && childMap[name].placeholderOptions.length === 1) {
			writer.insertElement(childMap[name].placeholderOptions[0], item, 'end');
		}
		else {
			writer.insertElement(name, item, 'end');
		}
        changed = true;
      }
    }

    return changed;
  }

  getModelAttributes(modelElement) {
    return Array.from(modelElement.getAttributeKeys())
      .concat(Object.keys(this.defaultAttributes))
      .filter(attr => attr.substr(0, 3) !== 'ck-' && modelElement.getAttribute(attr))
      .map(attr => ({[attr]: modelElement.getAttribute(attr)}))
      .reduce((acc, val) => Object.assign(acc, val), {});
  }

}
