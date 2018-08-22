/**
 * @module section/section
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import SectionToolbar from './sectiontoolbar';

/**
 * The paragraph feature for the editor.
 * It introduces the `<section>` element in the model which renders as a
 * `<div class="section">` element in the DOM and data.
 */
export default class Section extends Plugin {

  /**
   * @inheritDoc
   */
  constructor( editor ) {
    super( editor );
    editor.config.define( 'defaultSection', 'simple_text');
    editor.config.define( 'sections', []);
  }

  static get requires() {
    return [ SectionToolbar ];
  }

  /**
   * @inheritDoc
   */
  static get pluginName() {
    return 'Section';
  }

  /**
   * @inheritDoc
   */
  init() {
    const editor = this.editor;
    const model = editor.model;
    this.sections = editor.config.get('sections');

    const sectionKeys = Object.keys(this.sections).map(key => 'ck-templates__' + key);

    this.editor.model.schema.addChildCheck((context, def) => {
      if (context.endsWith('$root') && sectionKeys.includes(def.name)) {
        return true;
      }
    });

    model.document.registerPostFixer( writer => this._cleanRoot( writer ) );
    editor.on( 'dataReady', () => {
      model.enqueueChange( 'transparent', writer => this._cleanRoot( writer ) );
    }, { priority: 'lowest' } );

  }

  _cleanRoot(writer) {

    const model = this.editor.model;

    for ( const rootName of model.document.getRootNames() ) {
      const root = model.document.getRoot( rootName );
      const sectionKeys = Object.keys(this.sections).map(key => 'ck-templates__' + key);

      if (root.rootName === '$graveyard' ) {
        continue
      }

      for (let child of root.getChildren()) {
        if (!sectionKeys.includes(child.name)) {
          writer.remove(child);
          return true;
        }
      }

      if (root.isEmpty) {
        writer.appendElement('ck-templates__' + this.editor.config.get('defaultSection'), root );
        return true;
      }
    }
  }


}
