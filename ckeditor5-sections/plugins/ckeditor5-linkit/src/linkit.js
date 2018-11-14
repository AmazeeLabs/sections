import Link from '@ckeditor/ckeditor5-link/src/link';
import LinkitEditing from './linkitediting';
import LinkitUI from './linkitui';

export default class Linkit extends Link {
  /**
   * @inheritDoc
   */
  static get requires() {
    return [ LinkitEditing, LinkitUI ];
  }

  /**
   * @inheritDoc
   */
  static get pluginName() {
    return 'Linkit';
  }
}
