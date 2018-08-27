<?php

namespace Drupal\sections\Plugin\Field\FieldWidget;

use Drupal\Component\Utility\Html;
use Drupal\Core\Field\FieldItemListInterface;
use Drupal\Core\Field\Plugin\Field\FieldWidget\StringTextareaWidget;
use Drupal\Core\Form\FormStateInterface;

/**
 * Plugin implementation of the 'sections' widget.
 *
 * @FieldWidget(
 *   id = "sections",
 *   label = @Translation("Section editor"),
 *   field_types = {
 *     "text_long", "text_with_summary"
 *   }
 * )
 */
class SectionsWidget extends StringTextareaWidget {

  /**
   * {@inheritdoc}
   */
  public function formElement(FieldItemListInterface $items, $delta, array $element, array &$form, FormStateInterface $form_state) {
    $main_widget = parent::formElement($items, $delta, $element, $form, $form_state);
    $element = &$main_widget['value'];
    $element['#attributes']['class'][] = 'sections-editor';
    $main_widget['#attached']['library'][] = 'sections/editor';
    $main_widget['format'] = [
      '#type' => 'value',
      '#value' => 'full_html',
    ];

    return $main_widget;
  }

}
