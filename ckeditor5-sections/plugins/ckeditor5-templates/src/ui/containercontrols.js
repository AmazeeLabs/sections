/* global window */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ToolbarView from '@ckeditor/ckeditor5-ui/src/toolbar/toolbarview';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import { getOptimalPosition } from '@ckeditor/ckeditor5-utils/src/dom/position';
import Rect from '@ckeditor/ckeditor5-utils/src/dom/rect';
import Collection from '@ckeditor/ckeditor5-utils/src/collection';
import InputTextView from '@ckeditor/ckeditor5-ui/src/inputtext/inputtextview';

import iconUp from '../../theme/icons/arrow-up.svg';
import iconDown from '../../theme/icons/arrow-down.svg';
import iconRemove from '../../theme/icons/trash.svg';
import iconAdd from '../../theme/icons/add.svg';
import iconConfigure from '../../theme/icons/configure.svg';
import iconLeft from '../../theme/icons/arrow-left.svg';
import iconRight from '../../theme/icons/arrow-right.svg';

import ElementRemoveCommand from "../commands/elementremovecommand";
import ElementUpCommand from "../commands/elementupcommand";
import ElementDownCommand from "../commands/elementdowncommand";
import InsertPlaceholderCommand from "../commands/insertplaceholdercommand";
import RemovePlaceholderCommand from "../commands/removeplaceholdercommand";

import toUnit from '@ckeditor/ckeditor5-utils/src/dom/tounit';
import InsertElementCommand from "../commands/insertelementcommand";
import Model from '@ckeditor/ckeditor5-ui/src/model';
import {addListToDropdown, createDropdown} from "@ckeditor/ckeditor5-ui/src/dropdown/utils";
import BalloonPanelView from "@ckeditor/ckeditor5-ui/src/panel/balloon/balloonpanelview";
import clickOutsideHandler from "@ckeditor/ckeditor5-ui/src/bindings/clickoutsidehandler";

import '../../theme/css/container.css';
import TemplateAttributeCommand from "../commands/templateattributecommand";
import Logger from '../util/logger';
import PreviousPageCommand from "../commands/previouspagecommand";
import NextPageCommand from "../commands/nextpagecommand";
import PagingCommand from "../commands/pagingcommand";
import EditableElement
  from "@ckeditor/ckeditor5-engine/src/view/editableelement";
import RemainingCharCountView from "./remainingcharcountview";

const toPx = toUnit( 'px' );

class ContainerButtonView extends ButtonView {
  constructor (locale) {
    super(locale);
    const bind = this.bindTemplate;
    this.set('top', 0);
    this.set('left', 0);
    this.set('isVisible', false);
    this.set('position', 'top left 1');
    this.set('label', null);

    this.set('panel', null);
    this.set('command', null);

    this.extendTemplate({
      attributes: {
        style: {
          position: 'absolute',
          top: bind.to('top', val => toPx(val)),
          left: bind.to('left', val => toPx(val)),
        }
      }
    });
  }

  isConfigureButton() {
    return false;
  }
}

class NewSectionButtonView extends ButtonView {
  constructor (locale) {
    super(locale);
    const bind = this.bindTemplate;
    this.set('top', 0);
    this.set('left', 0);
    this.set('width', 0);
    this.set('isVisible', false);
    this.set('class', '');
    this.set('isEnabled', true);
    this.set('panel', null);
    this.set('command', null);

    const containerButton = new ContainerButtonView(locale);
    containerButton.set('isVisible', true);
    containerButton.set('isEnabled', true);
    containerButton.bind('label').to(this, 'label');
    containerButton.bind('icon').to(this, 'icon');
    containerButton.bind('class').to(this, 'class');
    containerButton.bind('panel').to(this, 'panel');

    this.containerButton = containerButton;

    this.setTemplate({
      tag: 'div',
      children: [
        containerButton,
      ],
      attributes: {
        class: [
          'new-section',
          bind.if( 'isEnabled', 'ck-disabled', value => !value ),
          bind.if( 'isVisible', 'ck-hidden', value => !value ),
          bind.to( 'isOn', value => value ? 'ck-on' : 'ck-off' )
        ],
        style: {
          position: 'absolute',
          top: bind.to('top', val => toPx(val)),
          left: bind.to('left', val => toPx(val)),
          width: bind.to('width', val => toPx(val)),
        }
      },
      on: {
        mousedown: bind.to(evt => {
          evt.preventDefault();
        }),

        click: bind.to( evt => {
          // We can't make the button disabled using the disabled attribute, because it won't be focusable.
          // Though, shouldn't this condition be moved to the button controller?
          if ( this.isEnabled ) {
            this.fire( 'execute' );
          } else {
            // Prevent the default when button is disabled, to block e.g.
            // automatic form submitting. See ckeditor/ckeditor5-link#74.
            evt.preventDefault();
          }
        })
      }
    });
  }

  isConfigureButton() {
    return false;
  }
}

class ConfigureButtonView extends ContainerButtonView {
  constructor( locale ) {
    super( locale );
  }

  isConfigureButton() {
    return true;
  }
}

export default class ContainerControls extends Plugin {

  static get pluginName() {
    return 'ContainerControls';
  }

  constructor( editor ) {
    super( editor );

    /**
     * Stores the toolbars keyed by the template id.
     *
     * @member {Object}
     */
    this.toolbars = {};

    /**
     * The type of the last opened toolbar.
     *
     * @member {String}
     */
    this.lastOpenedToolbar = null;

    this.templateAttributes = editor.config.get('templateAttributes');

    this.insertBeforeToolbarView = this._createToolbarView();
    this.insertBeforePanelView = this._createPanelView(this.insertBeforeToolbarView);

    this.insertAfterToolbarView = this._createToolbarView();
    this.insertAfterPanelView = this._createPanelView(this.insertAfterToolbarView);

    this.configurationToolbarView = this._createToolbarView();
    this.configurationPanelView = this._createPanelView(this.configurationToolbarView);

    editor.commands.add('elementUp', new ElementUpCommand(editor));
    editor.commands.add('elementDown', new ElementDownCommand(editor));
    editor.commands.add('elementRemove', new ElementRemoveCommand(editor));

    editor.commands.add('insertElement', new InsertElementCommand(editor));

    editor.commands.add('insertBefore', new InsertPlaceholderCommand(editor, 'before'));
    editor.commands.add('insertAfter', new InsertPlaceholderCommand(editor, 'after'));
    editor.commands.add('removePlaceholder', new RemovePlaceholderCommand(editor));

    editor.commands.add('previousPage', new PreviousPageCommand(editor));
    editor.commands.add('nextPage', new NextPageCommand(editor));
    editor.commands.add('currentPage', new PagingCommand(editor));

    this.buttons = {
      elementUp: {
        label: editor.t('Move element up'),
        icon: iconUp,
        class: 'element-up',
        position: 'bottom right 2',
        command: editor.commands.get('elementUp')
      },
      elementDown: {
        label: editor.t('Move element down'),
        icon: iconDown,
        class: 'element-down',
        position: 'bottom right 1',
        command: editor.commands.get('elementDown')
      },
      elementRemove: {
        label: editor.t('Remove element'),
        icon: iconRemove,
        class: 'element-remove',
        position: 'top right 1',
        command: editor.commands.get('elementRemove')
      },
      elementConfigure: {
        buttonClass: ConfigureButtonView,
        label: editor.t('Configure element'),
        icon: iconConfigure,
        class: 'element-configure',
        position: 'top right 2',
        panel: this.configurationPanelView
      },
      previousPage: {
        label: editor.t('Previous page'),
        icon: iconLeft,
        class: 'previous-page',
        position: 'top left 1',
        command: editor.commands.get('previousPage'),
      },
      nextPage: {
        label: editor.t('Next page'),
        icon: iconRight,
        class: 'next-page',
        position: 'top left 2',
        command: editor.commands.get('nextPage'),
      },
      currentPage: {
        class: 'current-page',
        label: '',
        position: 'top left 2',
        withText: true,
        command: editor.commands.get('currentPage'),
      },
      // insertBefore: {
      //   buttonClass: NewSectionButtonView,
      //   label: editor.t('Insert element above'),
      //   icon: iconAdd,
      //   class: 'element-insert-before',
      //   position: 'top new-section',
      //   command: editor.commands.get('insertBefore')
      // },
      // insertAfter: {
      //   buttonClass: NewSectionButtonView,
      //   label: editor.t('Insert element below'),
      //   icon: iconAdd,
      //   class: 'element-insert-after',
      //   position: 'bottom new-section',
      //   command: editor.commands.get('insertAfter')
      // },
    };

    // Create an element that will show the number of remaining chars for
    // the currently selected input.
    this.remainingCharCountView = new RemainingCharCountView(editor.locale);
    this.remainingCharCountView.set({
      position: 'bottom right',
    });
    this.remainingCharCountView.render();
    editor.ui.view.body.add(this.remainingCharCountView);

    this.buttonViews = Object.keys(this.buttons).map((key) => {
      const ButtonConstructor = this.buttons[key].buttonClass ? this.buttons[key].buttonClass : ContainerButtonView;
      const buttonView = new ButtonConstructor(editor.locale);
      buttonView.set(this.buttons[key]);
      buttonView.render();

      if (this.buttons[key].command) {
        const command = this.buttons[key].command;
        buttonView.bind('isEnabled').to(command, 'isEnabled');
        buttonView.bind('isVisible').to(command, 'isVisible');
        buttonView.bind('label').to(command, 'label');
        this.listenTo( buttonView, 'execute', () => {
          editor.execute(key)
        });
      }

      if (this.buttons[key].panel) {
        const panel = this.buttons[key].panel;
        panel.button = buttonView;
        buttonView.bind( 'isOn' ).to( panel, 'isVisible' );

        // Toggle the panelView upon buttonView#execute.
        this.listenTo( buttonView, 'execute', () => {
          if ( !panel.isVisible ) {
            this._showPanel(buttonView.containerButton || buttonView, panel);
          } else {
            this._hidePanel(panel);
          }
        });

        // Close the #panelView upon clicking outside of the plugin UI.
        clickOutsideHandler( {
          emitter: panel,
          contextElements: [ panel.element , buttonView.element],
          activator: () => panel.isVisible,
          callback: () => {
            this._hidePanel(panel)
          }
        });

        this.listenTo( buttonView, 'change:isVisible', ( evt, name, isVisible ) => {
          if (!isVisible) {
            this._hidePanel(panel);
          }
        });
      }

      editor.ui.view.body.add(buttonView);
      editor.ui.focusTracker.add(buttonView.element);
      return buttonView;
    });

    const elements = editor.config.get('templates');

    Object.keys(elements).forEach((name) => {
      editor.commands.add(`insertElement:${name}`, new InsertElementCommand(editor, name));
    });

    for (const attr of Object.keys(this.templateAttributes)) {
      const templateAttribute = this.templateAttributes[attr];
      const type = templateAttribute.type;
      const commandName = `setTemplateAttribute:${attr}`;
      const componentName = `templateAttribute:${attr}`;
      editor.commands.add(commandName, new TemplateAttributeCommand(editor, attr));

      // We could create the method names dynamically but this is more explicit.
      const factories = {
        dropdown: this._createDropdownView,
        textfield: this._createTextfieldView,
        multiselect: this._createMultiselectView,
      };

      if (!factories.hasOwnProperty(type)) {
        Logger.error(`Unrecognized template attribute type: ${type}`);
        continue;
      }

      const factoryMethod = factories[type];
      const args = [templateAttribute, commandName, editor];
      const callback = factoryMethod.apply(this, args);
      editor.ui.componentFactory.add(componentName, callback);
    }
  }

  /**
   * Creates a dropdown component based on given template attribute.
   *
   * @param {Object} templateAttribute - The configuration object.
   * @param {String} commandName - The command associated with the attribute.
   * @param {Editor} editor - The editor object.
   *
   * @return {Function} - A callback for editor.ui.componentFactory.add.
   */
  _createDropdownView(templateAttribute, commandName, editor) {
    return locale => {
      const command = editor.commands.get(commandName);
      const dropdownItems = new Collection();
      const titles = {};

      for (const key of Object.keys(templateAttribute.options)) {
        const option = templateAttribute.options[key];
        const itemModel = new Model({
          label: option,
          withText: true,
        });

        itemModel.bind('isActive').to(command, 'value', value => value === key);
        itemModel.set({
          commandName: commandName,
          commandValue: key,
        });
        titles[key] = option;

        dropdownItems.add({ type: 'button', model: itemModel });
      }

      const dropdownView = createDropdown(locale);
      addListToDropdown(dropdownView, dropdownItems);

      dropdownView.buttonView.set({
        isOn: false,
        withText: true,
        label: templateAttribute.label,
        tooltip: `Configure the ${templateAttribute.label} option.`,
      });

      dropdownView.buttonView.bind( 'label' ).to( command, 'value', ( value ) => {
        return titles[ value ] || templateAttribute.label;
      } );

      dropdownView.bind('isEnabled').to(command, 'isEnabled', (value) => {
        return value;
      });

      // Execute command when an item from the dropdown is selected.
      this.listenTo( dropdownView, 'execute', evt => {
        editor.execute( evt.source.commandName, {value: evt.source.commandValue});
      });

      dropdownView.template.attributes.class.push('sections-dropdown');

      return dropdownView;
    };
  }

  /**
   * Creates a dropdown component based on given template attribute.
   *
   * @param {Object} templateAttribute - The configuration object.
   * @param {String} commandName - The command associated with the attribute.
   * @param {Editor} editor - The editor object.
   *
   * @return {Function} - A callback for editor.ui.componentFactory.add.
   */
  _createTextfieldView(templateAttribute, commandName, editor) {
    return locale => {
      const command = editor.commands.get(commandName);
      const { label = '', placeholder = '' } = templateAttribute;
      const inputView = new InputTextView(locale);

      inputView.placeholder = placeholder;
      inputView.bind('value').to(command, 'value');

      this.listenTo(inputView, 'input', evt => {
        editor.execute( commandName, { value: evt.source.element.value });
      });

      inputView.template.attributes.class.push('sections-textfield');

      return inputView;
    };
  }

  /**
   * Creates a multi-select dropdown component based on given template attribute.
   *
   * @param {Object} templateAttribute - The configuration object.
   * @param {String} commandName - The command associated with the attribute.
   * @param {Editor} editor - The editor object.
   *
   * @return {Function} - A callback for editor.ui.componentFactory.add.
   */
  _createMultiselectView(templateAttribute, commandName, editor) {
    return locale => {
      const command = editor.commands.get(commandName);
      const dropdownItems = new Collection();
      const keys = Object.keys(templateAttribute.options);

      /**
       * Returns the label associated with given option key.
       * @param {String} key
       * @returns {String}
       */
      const getLabel = key => templateAttribute.options[key];

      /**
       * Turns given attribute value into an array of selections.
       * @param {String} encodedKeys - Selected keys separated by commas.
       * @returns {String[]}
       */
      const decodeKeys = encodedKeys => encodedKeys
        .split(',')
        .filter(value => value)
        .sort((a, b) => keys.indexOf(a) - keys.indexOf(b));

      /**
       * Returns a function that tells if a given value is currently selected.
       * @param {String} key - A key in the options array.
       * @returns {function(*): boolean}
       */
      const valueIsSelected = key =>
          encodedKeys => decodeKeys(encodedKeys).includes(key);

      /**
       * Returns a comma separated list of selected items' labels.
       * @param {String} encodedKeys - Selected keys separated by commas
       * @returns {string}
       */
      const getSelectionsSummary = encodedKeys => {
        const selections = decodeKeys(encodedKeys);
        if (selections.length > 0) {
          return selections.map(getLabel).join(', ');
        }
        return templateAttribute.placeholder || '';
      };

      // Fill dropdownItems with switchbutton.
      for (const optionKey of Object.keys(templateAttribute.options)) {
        const itemModel = new Model({
          label: getLabel(optionKey),
          withText: true,
          key: optionKey,
        });

        // Turn the switchbutton on when it's key is present in the values
        // and off otherwise.
        itemModel.bind('isOn').to(command, 'value', valueIsSelected(optionKey));
        dropdownItems.add({ type: 'switchbutton', model: itemModel });
      }

      const dropdownView = createDropdown(locale);
      addListToDropdown(dropdownView, dropdownItems);

      dropdownView.buttonView.set({
        withText: true,
        label: templateAttribute.placeholder,
        tooltip: `Configure the ${templateAttribute.label} option.`,
      });

      // Update the dropdown label whenever the selections set changes.
      dropdownView.buttonView
        .bind('label')
        .to( command, 'value', getSelectionsSummary);

      // Execute command when any item from the dropdown is toggled.
      this.listenTo( dropdownView, 'execute', evt => {
        const values = decodeKeys(command.value);
        const { key } = evt.source;
        const index = values.indexOf(key);

        if (index === -1) {
          // The item wasn't selected, add it to the values.
          values.push(key);
        } else {
          // The item was selected before. It's deselected now.
          values.splice(index, 1);
        }
        editor.execute( commandName, { value: values.join(',') });
      });

      dropdownView.template.attributes.class.push('sections-multiselect');

      return dropdownView;
    };
  }

  /**
   * Creates the {@link #toolbarView}.
   *
   * @private
   * @returns {module:ui/toolbar/toolbarview~ToolbarView}
   */
  _createToolbarView() {
    const toolbarView = new ToolbarView( this.editor.locale );

    toolbarView.extendTemplate( {
      attributes: {
        // https://github.com/ckeditor/ckeditor5-editor-inline/issues/11
        class: [ 'ck-toolbar_floating' ]
      }
    });

    return toolbarView;
  }

  /**
   * Creates the {@link #panelView}.
   *
   * @private
   * @returns {module:ui/panel/balloon/balloonpanelview~BalloonPanelView}
   */
  _createPanelView(toolbar) {
    const editor = this.editor;
    const panelView = new BalloonPanelView( editor.locale );

    panelView.content.add( toolbar );
    panelView.className = 'ck-toolbar-container';
    editor.ui.view.body.add( panelView );
    editor.ui.focusTracker.add( panelView.element );

    // Close #panelView on `Esc` press.
    toolbar.keystrokes.set( 'Esc', ( evt, cancel ) => {
      this._hidePanel( panelView );
      cancel();
    } );

    return panelView;
  }

  init() {
    const editor = this.editor;

    // Hides panel on a direct selection change.
    this.listenTo( editor.model.document.selection, 'change:range', ( evt, data ) => {
      if ( data.directChange ) {
        this._hidePanel(this.insertBeforePanelView);
        this._hidePanel(this.insertAfterToolbarView);
        this._hidePanel(this.configurationPanelView);
      }
    } );

    this.listenTo( editor.ui, 'update', () => this._updateButtons() );
    this.listenTo( editor, 'change:isReadOnly', () => this._updateButtons(), { priority: 'low' } );

    // Reposition button on resize.
    this.listenTo( this.buttonViews[0], 'change:isVisible', ( evt, name, isVisible ) => {
      if ( isVisible ) {
        // Keep correct position of button and panel on window#resize.
        this.listenTo( window, 'resize', () => this._updateButtons() );
      } else {
        // Stop repositioning button when is hidden.
        this.stopListening( window, 'resize' );
      }
    } );
  }

  /**
   * @inheritDoc
   */
  afterInit() {
    const editor = this.editor;
  }

  _updateButtons() {
    const editor = this.editor;
    const view = editor.editing.view;

    // Find the editable element which got selected.
    const editableModel = this.getSelectedEditableModel();
    if (editableModel) {
      // Get the dom element for the editable input and check if it has the
      // 'limit' attribute.
      const editableDomTarget = view.domConverter.mapViewToDom(editor.editing.mapper.toViewElement(editableModel));
      const limit = editableDomTarget.getAttribute('limit');

      if (!!limit) {
        // Limit found. Update the remainingCharCountView with the length of
        // the element's content.
        this.remainingCharCountView.setRemainingChars(limit - editableDomTarget.innerText.trim().length);
        this._attachButtonToElement(editableDomTarget, this.remainingCharCountView);

        // Hide the counter when the input looses focus.
        editableDomTarget.removeEventListener('blur', this.remainingCharCountView.clear);
        editableDomTarget.addEventListener('blur', this.remainingCharCountView.clear);
      }
    }

    const modelTarget = this.getSelectedTemplateModel();

    if (!modelTarget || editor.isReadOnly ) {
      return;
    }

    // Each template needs to have it's own toolbar.
    if (this.toolbars[modelTarget.name] === undefined) {
      // This is the first time an instance of this template gets selected.

      // Get the ids of all the configuration attributes attached to the
      // selected element's template.
      const configurableAttributes = Object.keys(this.templateAttributes)
        .filter(attr => modelTarget.hasAttribute(attr))
        .map(attr => `templateAttribute:${attr}`);

      if (configurableAttributes.length > 0) {
        // At least one template attribute found. Create a toolbar view and fill
        // it with editable components based on the attribute's definition.
        this.toolbars[modelTarget.name] = this._createToolbarView();
        this.toolbars[modelTarget.name].fillFromConfig(
          configurableAttributes,
          editor.ui.componentFactory
        );
      } else {
        // The template doesn't have any configurable attributes. Store this
        // information, so we don't need to check it again.
        this.toolbars[modelTarget.name] = null;
      }
    }

    if (this.toolbars[modelTarget.name]) {
      // The selected element does have a non-empty toolbar associated with it.
      if (modelTarget.name !== this.lastOpenedToolbar) {
        // This toolbar is different than the one that was last opened (or it's
        // the first one). Clear the configuration panel and add the proper
        // form.
        this.configurationPanelView.content.clear();
        this.configurationPanelView.content.add(this.toolbars[modelTarget.name]);
        this.lastOpenedToolbar = modelTarget.name;
      }
    }

    const domTarget = view.domConverter.mapViewToDom(editor.editing.mapper.toViewElement(modelTarget));
    for (const buttonView of this.buttonViews) {
      this._attachButtonToElement(domTarget, buttonView);

      if (buttonView.panel && buttonView.panel.isVisible) {
        this._showPanel(buttonView, buttonView.panel);
      }

      if (buttonView.isConfigureButton()) {
        const intersection = Array.from(modelTarget.getAttributeKeys())
            .filter(key => Object.keys(this.templateAttributes).includes(key));
        buttonView.isVisible = !!intersection.length;
      }
    }
  }

  /**
   * @protected
   * @param {HTMLElement} targetElement Target element.
   * @param {ContainerButtonView} buttonView The button to attach.
   */
  _attachButtonToElement( targetElement, buttonView) {
    const contentStyles = window.getComputedStyle( targetElement );

    const editableRect = new Rect( this.editor.ui.view.editableElement );
    const contentPaddingTop = parseInt( contentStyles.paddingTop, 10 );
    // When line height is not an integer then thread it as "normal".
    // MDN says that 'normal' == ~1.2 on desktop browsers.
    const contentLineHeight = parseInt( contentStyles.lineHeight, 10 ) || parseInt( contentStyles.fontSize, 10 ) * 1.2;

    const buttonPosition = getOptimalPosition( {
      element: buttonView.element,
      target: targetElement,
      positions: [
        ( contentRect, buttonRect ) => {
          const [primary, secondary, offset] = buttonView.position.split(' ');

          if (primary === 'bottom' && secondary === 'right') {
            return {
              top: contentRect.top + contentRect.height + (buttonRect.height / 3) - (buttonRect.height) * parseInt(offset),
              left: contentRect.left + contentRect.width,
            };
          }

          if (primary === 'top' && secondary === 'left') {
            return {
              top: contentRect.top - buttonRect.height,
              left: contentRect.left + (buttonRect.width) * parseInt(offset - 1),
            };
          }

          if (primary === 'left' && secondary === 'bottom') {
            return {
              top: contentRect.top + contentRect.height - buttonRect.height - (buttonRect.height) * parseInt(offset - 1),
              left: editableRect.left - buttonRect.width,
            };
          }

          if (primary === 'top' && secondary === 'right') {
            return {
              top: contentRect.top - buttonRect.height + (buttonRect.height) * parseInt(offset),
              left: contentRect.left + contentRect.width,
            };
          }

          if (primary === 'top' && secondary === 'new-section') {
            return {
              top: contentRect.top - buttonRect.height - 20,
              left: contentRect.left + (contentRect.width - buttonRect.width)/2,
            };
          }

          if (primary === 'bottom' && secondary === 'new-section') {
            return {
              top: contentRect.top + contentRect.height + 20,
              left: contentRect.left + (contentRect.width - buttonRect.width)/2,
            };
          }
        }
      ]
    });

    buttonView.top = buttonPosition.top;
    buttonView.left = buttonPosition.left;
    buttonView.width = editableRect.width;
  }

  _showPanel(button, panel) {
    const wasVisible = panel.isVisible;

    panel.pin( {
      target: button.element,
      limiter: this.editor.ui.view.editableElement
    } );
  }

  _hidePanel( panel ) {
    panel.isVisible = false;
  }

  _hidePanels() {
    this.insertBeforePanelView.isVisible = false;
    this.insertAfterPanelView.isVisible = false;
    this.configurationPanelView.isVisible = false;
  }

  /**
   * Return the view element associated with current selection.
   *
   * @returns {module:engine/view/element~Element}
   */
  getSelectedElement() {
    const modelElement = this.editor.model.document.selection.getSelectedElement()
      || this.editor.model.document.selection.anchor.parent;

    return this.editor.editing.mapper.toViewElement(modelElement);
  }

  /**
   * Returns a model of the currently selected editable element.
   * @returns {*}
   */
  getSelectedEditableModel() {
    let element = this.getSelectedElement();

    while (element) {
      if (element && element instanceof EditableElement) {
        return this.editor.editing.mapper.toModelElement(element);
      }
      element = element.parent;
    }
    return false;
  }

  /**
   * Returns a model of the currently selected template element.
   * @returns {*}
   */
  getSelectedTemplateModel() {
    let element = this.getSelectedElement();

    while (element) {
      if (element.getCustomProperty('template') || element.getCustomProperty('placeholder')) {
        return this.editor.editing.mapper.toModelElement(element);
      }
      element = element.parent;
    }
    return false;
  }

}
