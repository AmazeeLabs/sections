/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

// The editor creator to use.
import BalloonEditorBase from '@ckeditor/ckeditor5-editor-balloon/src/ballooneditor';
import Essentials from "@ckeditor/ckeditor5-essentials/src/essentials";
import Templates from "../plugins/ckeditor5-templates/src/templates";
import TemplateElement from "../plugins/ckeditor5-templates/src/templateelement";
import TextElement from "../plugins/ckeditor5-templates/src/elements/textelement";
import MediaElement from "../plugins/ckeditor5-templates/src/elements/mediaelement";
import ContainerElement from "../plugins/ckeditor5-templates/src/elements/containerelement";

export default class SectionsEditor extends BalloonEditorBase {}

// Plugins to include in the build.
SectionsEditor.builtinPlugins = [ Essentials, Templates];

// Editor configuration.
SectionsEditor.defaultConfig = {
  templateElements: [MediaElement, TextElement, ContainerElement, TemplateElement],
	toolbar: {items: []},
	// This value must be kept in sync with the language defined in webpack.config.js.
	language: 'en'
};
