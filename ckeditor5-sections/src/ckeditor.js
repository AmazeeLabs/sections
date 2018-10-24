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
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';
import Heading from '@ckeditor/ckeditor5-heading/src/heading';
import Link from '@ckeditor/ckeditor5-link/src/link';
import List from '@ckeditor/ckeditor5-list/src/list';
import Paragraph from "@ckeditor/ckeditor5-paragraph/src/paragraph";
import FormattedElement from "../plugins/ckeditor5-templates/src/elements/formattedelement";
import Autoformat from "@ckeditor/ckeditor5-autoformat/src/autoformat";

export default class SectionsEditor extends BalloonEditorBase {}

// Plugins to include in the build.
SectionsEditor.builtinPlugins = [ Essentials, Templates, Bold, Italic, Heading, Link, List, Paragraph, Autoformat];

// Editor configuration.
SectionsEditor.defaultConfig = {
  templateElements: [MediaElement, FormattedElement, TextElement, ContainerElement, TemplateElement],
	toolbar: {items: ['heading', '|', 'bold', 'italic', 'link', 'bulletedList', 'numberedList', '|', 'undo', 'redo']},
	// This value must be kept in sync with the language defined in webpack.config.js.
	language: 'en'
};
