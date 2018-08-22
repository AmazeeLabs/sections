/**
 * @module section/sectiontoolbar
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import ToolbarView from '@ckeditor/ckeditor5-ui/src/toolbar/toolbarview';
import Widget from '@ckeditor/ckeditor5-widget/src/widget';
import ContextualBalloon from '@ckeditor/ckeditor5-ui/src/panel/balloon/contextualballoon';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import Collection from '@ckeditor/ckeditor5-utils/src/collection';
import Model from '@ckeditor/ckeditor5-ui/src/model';
import { createDropdown, addListToDropdown } from '@ckeditor/ckeditor5-ui/src/dropdown/utils';

import SectionInsertCommand from './commands/sectioninsertcommand';
import SectionRemoveCommand from './commands/sectionremovecommand';
import SectionUpCommand from './commands/sectionupcommand';
import SectionDownCommand from './commands/sectiondowncommand';
import SectionPersonaCommand from './commands/sectionpersonacommand';

import BalloonPanelView from '@ckeditor/ckeditor5-ui/src/panel/balloon/balloonpanelview';

const balloonClassName = 'ck-toolbar-container-section';

import iconUp from '../theme/icons/arrow-up.svg';
import iconDown from '../theme/icons/arrow-down.svg';
import iconRemove from '../theme/icons/trash.svg';

export default class SectionToolbar extends Plugin {

  static get requires() {
    return [ Widget, ContextualBalloon ];
  }

  static get pluginName() {
    return 'SectionToolbar';
  }

  init() {
    const editor = this.editor;

    const balloonToolbar = editor.plugins.get( 'BalloonToolbar' );

    // If the `BalloonToolbar` plugin is loaded, it should be disabled for images
    // which have their own toolbar to avoid duplication.
    // https://github.com/ckeditor/ckeditor5-image/issues/110
    if ( balloonToolbar ) {
      this.listenTo( balloonToolbar, 'show', evt => {
        if ( getSelectedSection( editor.editing.view.document.selection ) ) {
          evt.stop();
        }
      }, { priority: 'high' } );
    }

    editor.commands.add('sectionInsert', new SectionInsertCommand(editor));
    editor.commands.add('sectionRemove', new SectionRemoveCommand(editor));
    editor.commands.add('sectionUp', new SectionUpCommand(editor));
    editor.commands.add('sectionDown', new SectionDownCommand(editor));
    editor.commands.add('sectionPersona', new SectionPersonaCommand(editor));

    const sections = editor.config.get('sections');
    Object.keys(sections).forEach((name) => {
      let {label, icon} = sections[name];
      editor.ui.componentFactory.add('sectionInsert:' + name, locale => {
        const command = editor.commands.get('sectionInsert');
        const view = new ButtonView(locale);
        view.set({
          label: "Insert " + label,
          icon: icon,
          tooltip: true,
        });
        view.bind('isEnabled').to(command, 'isEnabled');
        this.listenTo( view, 'execute', () => editor.execute('sectionInsert', {type: name}));
        return view;
      });
    });

    editor.ui.componentFactory.add('sectionRemove', locale => {
      const command = editor.commands.get('sectionRemove');
      const view = new ButtonView(locale);
      view.set({
        label: "Remove section",
        tooltip: true,
        icon: iconRemove,
      });
      view.bind('isEnabled').to(command, 'isEnabled');
      this.listenTo( view, 'execute', () => editor.execute('sectionRemove'));
      return view;
    });

    editor.ui.componentFactory.add('sectionUp', locale => {
      const command = editor.commands.get('sectionUp');
      const view = new ButtonView(locale);
      view.set({
        label: "Move section up",
        tooltip: true,
        icon: iconUp,
      });
      view.bind('isEnabled').to(command, 'isEnabled');
      this.listenTo( view, 'execute', () => editor.execute('sectionUp'));
      return view;
    });

    editor.ui.componentFactory.add('sectionDown', locale => {
      const command = editor.commands.get('sectionDown');
      const view = new ButtonView(locale);
      view.set({
        label: "Move section down",
        tooltip: true,
        icon: iconDown,
      });
      view.bind('isEnabled').to(command, 'isEnabled');
      this.listenTo( view, 'execute', () => editor.execute('sectionDown'));
      return view;
    });

    editor.ui.componentFactory.add('sections', locale => {
      const titles = {};
      const dropdownItems = new Collection();
      const sectionInsertCommand = editor.commands.get('sectionInsert');

      for (const key of Object.keys(sections)) {
        const section = sections[key];
        const itemModel = new Model({
          label: section.label,
          section: key,
          class: key,
          withText: true,
        });
        itemModel.set({
          commandName: 'sectionInsert',
          commandValue: key,
        });
        dropdownItems.add({ type: 'button', model: itemModel });
        titles[key] = section.label;
      }

      const dropdownView = createDropdown(locale);
      addListToDropdown(dropdownView, dropdownItems);
      dropdownView.buttonView.set({
        isOn: false,
        withText: true,
        tooltip: 'Insert new section below.',
      });

      dropdownView.bind( 'isEnabled' ).to( sectionInsertCommand, 'isEnabled');

      dropdownView.buttonView.bind( 'label' ).to(() => {
        return 'Insert ...'
      });

      // Execute command when an item from the dropdown is selected.
      this.listenTo( dropdownView, 'execute', evt => {
        editor.execute( 'sectionInsert', { type: evt.source.commandValue } );
        editor.editing.view.focus();
      } );

      return dropdownView;
    });

    editor.ui.componentFactory.add('persona', locale => {
      const titles = {};
      const dropdownItems = new Collection();
      const personaCommand = editor.commands.get('sectionPersona');
      const personas = {
        any: 'All personas',
        anonymous: 'Anonymous',
        personaA: 'Persona A',
        personaB: 'Persona B',
      };

      for (const key of Object.keys(personas)) {
        const label = personas[key];
        const itemModel = new Model({
          label: label,
          persona: key,
          withText: true
        });

        itemModel.bind('isActive').to(personaCommand, 'value', value => value === key);
        itemModel.set({
          commandName: 'sectionPersona',
          commandValue: key,
        });
        dropdownItems.add({ type: 'button', model: itemModel });
        titles[key] = label;
      }

      const dropdownView = createDropdown(locale);
      addListToDropdown(dropdownView, dropdownItems);
      dropdownView.buttonView.set({
        isOn: false,
        withText: true,
        tooltip: 'Limit to persona',
      });

      dropdownView.bind( 'isEnabled' ).to( personaCommand, 'isEnabled');

      dropdownView.buttonView.bind( 'label' ).to( personaCommand, 'value', ( value ) => {
        return titles[ value ];
      } );

      // Execute command when an item from the dropdown is selected.
      this.listenTo( dropdownView, 'execute', evt => {
        editor.execute( 'sectionPersona', { value: evt.source.commandValue } );
        editor.editing.view.focus();
      } );

      return dropdownView;
    });
  }

  /**
   * @inheritDoc
   */
  afterInit() {
    const editor = this.editor;
    const section = editor.config.get('sections');
    const toolbarConfig = ['sections', '|', 'sectionRemove', 'sectionUp', 'sectionDown', '|', 'persona'];

    /**
     * A contextual balloon plugin instance.
     *
     * @private
     * @member {module:ui/panel/balloon/contextualballoon~ContextualBalloon}
     */
    this._balloon = this.editor.plugins.get( 'ContextualBalloon' );

    /**
     * A `ToolbarView` instance used to display the buttons specific for image editing.
     *
     * @protected
     * @type {module:ui/toolbar/toolbarview~ToolbarView}
     */
    this._toolbar = new ToolbarView();

    // Add buttons to the toolbar.
    this._toolbar.fillFromConfig( toolbarConfig, editor.ui.componentFactory );

    this.listenTo( editor.editing.view, 'render', () => {
      this._checkIsVisible();
    } );

    // There is no render method after focus is back in editor, we need to check if balloon panel should be visible.
    this.listenTo( editor.ui.focusTracker, 'change:isFocused', () => {
      this._checkIsVisible();
    }, { priority: 'low' } );1
  }

  /**
   * Checks whether the toolbar should show up or hide depending on the current selection.
   *
   * @private
   */
  _checkIsVisible() {
    const editor = this.editor;
    if ( !editor.ui.focusTracker.isFocused ) {
      this._hideToolbar();
    }
    else {
      const section = getSelectedSection( editor.editing.view.document.selection )
      if ( section ) {
        this._showToolbar(section);
      } else {
        this._hideToolbar();
      }
    }
  }

  /**
   * Shows the {@link #_toolbar} in the {@link #_balloon}.
   *
   * @private
   */
  _showToolbar(section) {
    const editor = this.editor;

    if ( this._isVisible ) {
      repositionContextualBalloon( editor, section);
    } else {
      if ( !this._balloon.hasView( this._toolbar ) ) {
        this._balloon.add( {
          view: this._toolbar,
          position: getBalloonPositionData( editor, section),
          balloonClassName
        } );
      }
    }
  }

  /**
   * Removes the {@link #_toolbar} from the {@link #_balloon}.
   *
   * @private
   */
  _hideToolbar() {
    if ( !this._isVisible ) {
      return;
    }

    this._balloon.remove( this._toolbar );
  }

  /**
   * Returns `true` when the {@link #_toolbar} is the visible view in the {@link #_balloon}.
   *
   * @private
   * @type {Boolean}
   */
  get _isVisible() {
    return this._balloon.visibleView === this._toolbar;
  }
}

/**
 * Checks if a section widget is the only selected element.
 *
 * @param {module:engine/view/selection~Selection|module:engine/view/documentselection~DocumentSelection} selection
 * @returns {Boolean}
 */
export function getSelectedSection( selection ) {
  const selected = selection.getSelectedElement();

  if (selected && selected.name === 'section') {
    return selected;
  }

  let element = selection.getFirstPosition().parent;
  while (element) {
    if (element.name === 'section') {
      return element;
    }
    element = element.parent;
  }
  return false;
}

/**
 * A helper utility that positions the
 * {@link module:ui/panel/balloon/contextualballoon~ContextualBalloon contextual balloon} instance
 * with respect to the image in the editor content, if one is selected.
 *
 * @param {module:core/editor/editor~Editor} editor The editor instance.
 */
export function repositionContextualBalloon( editor, section) {
  const balloon = editor.plugins.get( 'ContextualBalloon' );
  const position = getBalloonPositionData( editor, section);
  balloon.updatePosition( position );
}

/**
 * Returns the positioning options that control the geometry of the
 * {@link module:ui/panel/balloon/contextualballoon~ContextualBalloon contextual balloon} with respect
 * to the selected element in the editor content.
 *
 * @param {module:core/editor/editor~Editor} editor The editor instance.
 * @returns {module:utils/dom/position~Options}
 */
export function getBalloonPositionData( editor, section) {
  const editingView = editor.editing.view;
  const defaultPositions = BalloonPanelView.defaultPositions;

  return {
    target: editingView.domConverter.viewToDom( section ),
    positions: [
      defaultPositions.southArrowNorth,
    ]
  };
}
