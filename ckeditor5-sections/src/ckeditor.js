/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

// The editor creator to use.
import BalloonEditorBase from '@ckeditor/ckeditor5-editor-balloon/src/ballooneditor';
import Autoformat from '@ckeditor/ckeditor5-autoformat/src/autoformat';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Essentials from "@ckeditor/ckeditor5-essentials/src/essentials";
import Templates from "../plugins/ckeditor5-templates/src/templates";
import TemplateElement from "../plugins/ckeditor5-templates/src/templateelement";
import Section from "../plugins/ckeditor5-section/src/section";
import TextElement from "../plugins/ckeditor5-templates/src/elements/textelement";

export default class BalloonEditor extends BalloonEditorBase {}

// Plugins to include in the build.
BalloonEditor.builtinPlugins = [ Essentials, Templates, /*Paragraph, Autoformat,*/ Section];

// Editor configuration.
BalloonEditor.defaultConfig = {
  templateElements: [TextElement, TemplateElement],
  blockToolbar: [],
	toolbar: {items: []},
	// This value must be kept in sync with the language defined in webpack.config.js.
	language: 'en'
};
