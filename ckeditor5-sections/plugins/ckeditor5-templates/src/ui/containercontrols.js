/* global window */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ToolbarView from '@ckeditor/ckeditor5-ui/src/toolbar/toolbarview';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import { getOptimalPosition } from '@ckeditor/ckeditor5-utils/src/dom/position';
import Rect from '@ckeditor/ckeditor5-utils/src/dom/rect';
import Collection from '@ckeditor/ckeditor5-utils/src/collection';


import iconUp from '../../theme/icons/arrow-up.svg';
import iconDown from '../../theme/icons/arrow-down.svg';
import iconRemove from '../../theme/icons/trash.svg';
import iconAdd from '../../theme/icons/add.svg';
import iconConfigure from '../../theme/icons/configure.svg';

import ElementRemoveCommand from "../commands/elementremovecommand";
import ElementUpCommand from "../commands/elementupcommand";
import ElementDownCommand from "../commands/elementdowncommand";

import toUnit from '@ckeditor/ckeditor5-utils/src/dom/tounit';
import InsertElementCommand from "../commands/insertelementcommand";
import Model from '@ckeditor/ckeditor5-ui/src/model';
import {addListToDropdown, createDropdown} from "@ckeditor/ckeditor5-ui/src/dropdown/utils";
import BalloonPanelView from "@ckeditor/ckeditor5-ui/src/panel/balloon/balloonpanelview";
import clickOutsideHandler from "@ckeditor/ckeditor5-ui/src/bindings/clickoutsidehandler";

import '../../theme/css/container.css';
import TemplateAttributeCommand from "../commands/templateattributecommand";

const toPx = toUnit( 'px' );

export class ContainerButtonView extends ButtonView {
  constructor ( locale ) {
    super( locale );
    const bind = this.bindTemplate;
    this.set( 'top', 0 );
    this.set( 'left', 0);
    this.set('isVisible', false);
    this.set('position', 'top left 1');

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

    this.buttons = {
      elementUp: {
        label: editor.t('Move element up'),
        icon: iconUp,
        class: 'element-up',
        position: 'left top 1',
        command: editor.commands.get('elementUp')
      },
      elementDown: {
        label: editor.t('Move element down'),
        class: 'element-down',
        icon: iconDown,
        position: 'left top 2',
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
      insertBefore: {
        label: editor.t('Insert element above'),
        icon: iconAdd,
        class: 'element-insert-before',
        position: 'top center',
        panel: this.insertBeforePanelView,
      },
      insertAfter: {
        label: editor.t('Insert element below'),
        icon: iconAdd,
        class: 'element-insert-after',
        position: 'bottom center',
        panel: this.insertAfterPanelView,
      },
    };

    this.buttonViews = Object.keys(this.buttons).map((key) => {
      const ButtonConstructor = this.buttons[key].buttonClass || ContainerButtonView;
      const buttonView = new ButtonConstructor(editor.locale);
      buttonView.set(this.buttons[key]);

      if (this.buttons[key].command) {
        const command = this.buttons[key].command;
        buttonView.bind('isEnabled').to(command, 'isEnabled');
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
            this._showPanel(buttonView, panel);
          } else {
            this._hidePanel(panel);
          }
        });
        buttonView.render();

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

    for (const position of ['before', 'after']) {
      editor.ui.componentFactory.add(`elements:${position}`, locale => {
        const dropdownItems = new Collection();

        for (const key of Object.keys(elements)) {
          const commandName = `insertElement:${key}`;

          const element = elements[key];
          const command = editor.commands.get(commandName);

          const itemModel = new Model({
            label: element.label,
            withText: true,
          });

          itemModel.set({
            commandName: commandName,
          });

          itemModel.bind('isVisible').to(command, 'isEnabled');
          dropdownItems.add({ type: 'button', model: itemModel });
        }

        const dropdownView = createDropdown(locale);
        addListToDropdown(dropdownView, dropdownItems);

        dropdownView.buttonView.set({
          isOn: false,
          withText: true,
          tooltip: 'Insert new element.',
        });

        dropdownView.buttonView.bind( 'label' ).to(() => {
          return 'Insert ...'
        });

        // Execute command when an item from the dropdown is selected.
        this.listenTo( dropdownView, 'execute', evt => {
          this._hidePanels();
          editor.execute( evt.source.commandName, {position: position});
          editor.editing.view.focus();
        });

        return dropdownView;
      });
    }

    for (const attr of Object.keys(this.templateAttributes)) {
      editor.commands.add(`setTemplateAttribute:${attr}`, new TemplateAttributeCommand(editor, attr));
      editor.ui.componentFactory.add(`templateAttribute:${attr}`, locale => {
        const dropdownItems = new Collection();

        const templateAttribute = this.templateAttributes[attr];
        const commandName = `setTemplateAttribute:${attr}`;
        const command = editor.commands.get(commandName);
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

        return dropdownView;
      });
    }
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
    } );

    // When toolbar lost focus then panel should hide.
    toolbarView.focusTracker.on( 'change:isFocused', ( evt, name, is ) => {
      if ( !is ) {
        this._hidePanels();
      }
    } );

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
    this.listenTo( editor.ui.focusTracker, 'change:isFocused', () => this._updateButtons() );
    this.listenTo( editor.ui.focusTracker, 'change:isFocused', () => this._hidePanels() );

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

    // Add buttons to the toolbar.
    this.insertBeforeToolbarView.fillFromConfig( ['elements:before'], editor.ui.componentFactory );
    this.insertAfterToolbarView.fillFromConfig( ['elements:after'], editor.ui.componentFactory );
  }

  _updateButtons() {
    const editor = this.editor;
    const view = editor.editing.view;

    const modelTarget = this.getSelectedElement();
    if (!modelTarget || !editor.ui.focusTracker.isFocused || editor.isReadOnly ) {
      for (const buttonView of this.buttonViews) {
        buttonView.isVisible = false;
      }
      return;
    }

    this.configurationToolbarView.items.clear();
    this.configurationToolbarView.fillFromConfig( Object.keys(this.templateAttributes)
        .filter(attr => modelTarget.hasAttribute(attr))
        .map(attr => `templateAttribute:${attr}`)
    , editor.ui.componentFactory );
    const domTarget = view.domConverter.mapViewToDom( editor.editing.mapper.toViewElement( modelTarget ) );

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
      else {
        buttonView.isVisible = true;
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

          if (primary === 'left' && secondary === 'top') {
            return {
              top: contentRect.top + contentPaddingTop + ( ( contentLineHeight - buttonRect.height ) / 2 ) + (buttonRect.height) * parseInt(offset - 1),
              left: editableRect.left - buttonRect.width,
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
              top: contentRect.top - buttonRect.height,
              left: contentRect.left + contentRect.width - buttonRect.width - (buttonRect.height) * parseInt(offset - 1),
            };
          }
          if (primary === 'top' && secondary === 'center') {
            return {
              top: contentRect.top - buttonRect.height,
              left: contentRect.left + (contentRect.width - buttonRect.width)/2,
            };
          }
          if (primary === 'bottom' && secondary === 'center') {
            return {
              top: contentRect.top + contentRect.height,
              left: contentRect.left + (contentRect.width - buttonRect.width)/2,
            };
          }
        }
      ]
    } );

    buttonView.top = buttonPosition.top;
    buttonView.left = buttonPosition.left;
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

  getSelectedElement() {
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
