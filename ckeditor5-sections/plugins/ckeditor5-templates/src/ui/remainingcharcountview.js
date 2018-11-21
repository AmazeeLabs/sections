import View from "@ckeditor/ckeditor5-ui/src/view";

export default class RemainingCharCountView extends View {

  /**
   * @param locale
   */
  constructor(locale) {
    super(locale);

    const bind = this.bindTemplate;

    this.set('remainingChars', null);

    this.setTemplate({
      tag: 'div',
      children: [
        {
          text: bind.to('remainingChars', this._formatMessage),
        },
      ],
      attributes: {
        class: [
          'char-limit-count',
          bind.to('remainingChars', this._getDynamicClass),
        ],
      },
    });
  }

  /**
   * Updates the value.
   * @param {Number} newValue - The new remaining count to set.
   * @public
   */
  setRemainingChars(newValue) {
    this.remainingChars = newValue;
  }

  /**
   * Empties the element.
   * @public
   */
  clear() {
    this.remainingChars = null;
  }

  /**
   * Formats the message.
   * @param remainingChars - The number to show.
   * @returns {string} - The result message.
   * @private
   */
  _formatMessage(remainingChars) {
    if (remainingChars !== null) {
      return `${remainingChars} characters remaining.`;
    }
  }

  /**
   * Returns the class that depends on the value.
   * @param remainingChars - The number to show.
   * @returns {string} - The class to add.
   * @private
   */
  _getDynamicClass(remainingChars) {
    // Add the 'limit-exceeded' class when the limit is exceeded.
    if (remainingChars < 0) {
      return 'limit-exceeded';
    }
  }

}
