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
    $element['#type'] = 'hidden';
    $element['#attributes']['class'][] = 'sections-editor';
    $main_widget['#attached']['library'][] = 'sections/editor';
    $main_widget['format'] = [
      '#type' => 'value',
      '#value' => 'full_html',
    ];

//    $hidden_id = Html::getUniqueId('edit-' . $this->fieldDefinition->getName() . '-entity-selector');
//
//    $main_widget['entity_browser'] = [
//      '#type' => 'entity_browser',
//      '#entity_browser' => 'media_entity_browser',
//      '#cardinality' => -1,
//      '#selection_mode' => 'selection_prepend',
//      '#default_value' => [],
//      '#entity_browser_validators' => [
//        'entity_type' => ['type' => 'media'],
//      ],
//      '#widget_context' => [],
//      '#custom_hidden_id' => $hidden_id,
//      '#process' => [
//        ['\Drupal\entity_browser\Element\EntityBrowserElement', 'processEntityBrowser'],
//        [get_called_class(), 'processEntityBrowser'],
//      ],
//    ];
//
//    $main_widget['entity_selector'] = [
//      '#type' => 'hidden',
//      '#id' => $hidden_id,
//      '#attributes' => [
//        'id' => $hidden_id,
//        'class' => ['sections-entity-selector'],
//      ],
//    ];

    return $main_widget;
  }

  /**
   * Render API callback: Processes the entity browser element.
   */
  public static function processEntityBrowser(&$element, FormStateInterface $form_state, &$complete_form) {
    $uuid = key($element['#attached']['drupalSettings']['entity_browser']);
    $element['#attached']['drupalSettings']['entity_browser'][$uuid]['selector'] = '#' . $element['#custom_hidden_id'];
    return $element;
  }

}
