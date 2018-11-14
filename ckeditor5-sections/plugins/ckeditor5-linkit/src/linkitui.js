/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module linkit/linkitui
 */

import LinkUI from '@ckeditor/ckeditor5-link/src/linkui';


import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ClickObserver from '@ckeditor/ckeditor5-engine/src/view/observer/clickobserver';
import Range from '@ckeditor/ckeditor5-engine/src/view/range';
import { isLinkElement } from '@ckeditor/ckeditor5-link/src/utils';
import ContextualBalloon from '@ckeditor/ckeditor5-ui/src/panel/balloon/contextualballoon';

import clickOutsideHandler from '@ckeditor/ckeditor5-ui/src/bindings/clickoutsidehandler';

import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import LinkFormView from '@ckeditor/ckeditor5-link/src/ui/linkformview';
import LinkActionsView from '@ckeditor/ckeditor5-link/src/ui/linkactionsview';

import linkIcon from '@ckeditor/ckeditor5-link//theme/icons/link.svg';

const linkKeystroke = 'Ctrl+K';

/**
 * The linkit UI plugin. It introduces the Link and Unlink buttons and the <kbd>Ctrl+K</kbd> keystroke.
 *
 * It uses the
 * {@link module:ui/panel/balloon/contextualballoon~ContextualBalloon contextual balloon plugin}.
 *
 * @extends module:core/plugin~Plugin
 */
export default class LinkitUI extends LinkUI {
    /**
   * @inheritDoc
   */
  static get requires() {
    return [ ContextualBalloon ];
  }

  /**
   * Makes the UI react to the {@link module:core/editor/editorui~EditorUI#event:update} event to
   * reposition itself when the editor ui should be refreshed.
   *
   * See: {@link #_hideUI} to learn when the UI stops reacting to the `update` event.
   *
   * @protected
   */
  _startUpdatingUI() {
    const editor = this.editor;
    const viewDocument = editor.editing.view.document;

    let prevSelectedLink = this._getSelectedLinkElement();
    let prevSelectionParent = getSelectionParent();

    this.listenTo( editor.ui, 'update', () => {
      const selectedLink = this._getSelectedLinkElement();
      const selectionParent = getSelectionParent();

      // Hide the panel if:
      //
      // * the selection went out of the EXISTING link element. E.g. user moved the caret out
      //   of the link,
      // * the selection went to a different parent when creating a NEW link. E.g. someone
      //   else modified the document.
      // * the selection has expanded (e.g. displaying link actions then pressing SHIFT+Right arrow).
      //
      // Note: #_getSelectedLinkElement will return a link for a non-collapsed selection only
      // when fully selected.
      if ( ( prevSelectedLink && !selectedLink ) ||
        ( !prevSelectedLink && selectionParent !== prevSelectionParent ) ) {
        this._hideUI();
      }
      // Update the position of the panel when:
      //  * the selection remains in the original link element,
      //  * there was no link element in the first place, i.e. creating a new link
      else {
        // If still in a link element, simply update the position of the balloon.
        // If there was no link (e.g. inserting one), the balloon must be moved
        // to the new position in the editing view (a new native DOM range).
        //this._balloon.updatePosition( this._getBalloonPositionData() );
      }

      prevSelectedLink = selectedLink;
      prevSelectionParent = selectionParent;
    } );

    function getSelectionParent() {
      return viewDocument.selection.focus.getAncestors()
        .reverse()
        .find( node => node.is( 'element' ) );
    }
  }

  /**
   * Shows the right kind of the UI for current state of the command. It's either
   * {@link #formView} or {@link #actionsView}.
   *
   * @private
   */
  _showUI() {
    const editor = this.editor;
    const linkCommand = editor.commands.get( 'link' );

    if ( !linkCommand.isEnabled ) {
      return;
    }

    // When there's no link under the selection, go straight to the editing UI.
    if ( !this._getSelectedLinkElement() ) {
      //this._addActionsView();
      this._addFormView();
    }
    // If theres a link under the selection...
    else {
      // Go to the editing UI if actions are already visible.
      if ( this._areActionsVisible ) {
        this._addFormView();
      }
      // Otherwise display just the actions UI.
      else {
        this._addActionsView();
      }
    }

    // Begin responding to ui#update once the UI is added.
    this._startUpdatingUI();
  }

  /**
   * Creates the {@link module:link/ui/linkactionsview~LinkActionsView} instance.
   *
   * @private
   * @returns {module:link/ui/linkactionsview~LinkActionsView} The link actions view instance.
   */
  _createActionsView() {
    const editor = this.editor;
    const actionsView = new LinkActionsView( editor.locale );
    const linkCommand = editor.commands.get( 'link' );
    const unlinkCommand = editor.commands.get( 'unlink' );

    actionsView.bind( 'href' ).to( linkCommand, 'value' );
    actionsView.editButtonView.bind( 'isEnabled' ).to( linkCommand );
    actionsView.unlinkButtonView.bind( 'isEnabled' ).to( unlinkCommand );

    // Execute unlink command after clicking on the "Edit" button.
    this.listenTo( actionsView, 'edit', () => {
      this._addFormView();
    } );

    // Execute unlink command after clicking on the "Unlink" button.
    this.listenTo( actionsView, 'unlink', () => {
      editor.execute( 'unlink' );
      this._hideUI();
    } );

    // Close the panel on esc key press when the **actions have focus**.
    actionsView.keystrokes.set( 'Esc', ( data, cancel ) => {
      this._hideUI();
      cancel();
    } );

    // Open the form view on Ctrl+K when the **actions have focus**..
    actionsView.keystrokes.set( linkKeystroke, ( data, cancel ) => {
      this._addFormView();
      cancel();
    } );

    return actionsView;
  }

  /**
   * Creates the {@link module:link/ui/linkformview~LinkFormView} instance.
   *
   * @private
   * @returns {module:link/ui/linkformview~LinkFormView} The link form instance.
   */
  _createFormView() {
    const editor = this.editor;
    const formView = new LinkFormView( editor.locale );
    const linkCommand = editor.commands.get( 'link' );

    formView.urlInputView.bind( 'value' ).to( linkCommand, 'value' );

    // Form elements should be read-only when corresponding commands are disabled.
    formView.urlInputView.bind( 'isReadOnly' ).to( linkCommand, 'isEnabled', value => !value );
    formView.saveButtonView.bind( 'isEnabled' ).to( linkCommand );

    // Execute link command after clicking the "Save" button.
    this.listenTo( formView, 'submit', () => {
      editor.execute( 'link', formView.urlInputView.inputView.element.value );
      this._removeFormView();
    } );

    // Hide the panel after clicking the "Cancel" button.
    this.listenTo( formView, 'cancel', () => {
      this._removeFormView();
    } );

    // Close the panel on esc key press when the **form has focus**.
    formView.keystrokes.set( 'Esc', ( data, cancel ) => {
      this._removeFormView();
      cancel();
    } );

    return formView;
  }

    /**
   * Adds the {@link #formView} to the {@link #_balloon}.
   *
   * @protected
   */
  _addFormView() {
    if ( this._isFormInPanel ) {
      return;
    }

    const editor = this.editor;
    const linkCommand = editor.commands.get( 'link' );

    this._linkSelector = editor.config.get('linkSelector');
    if (this._linkSelector) {
      this._linkSelector({href: linkCommand.attributes.linkHref});
    } else {
      this._balloon.add( {
        view: this.formView,
        position: this._getBalloonPositionData()
      } );

      this.formView.urlInputView.select();

      // Make sure that each time the panel shows up, the URL field remains in sync with the value of
      // the command. If the user typed in the input, then canceled the balloon (`urlInputView#value` stays
      // unaltered) and re-opened it without changing the value of the link command (e.g. because they
      // clicked the same link), they would see the old value instead of the actual value of the command.
      // https://github.com/ckeditor/ckeditor5-link/issues/78
      // https://github.com/ckeditor/ckeditor5-link/issues/123
      this.formView.urlInputView.inputView.element.value = linkCommand.value || '';
    }
  }

}
