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
    $sections = $this->collectSections();
    $sectionKeys = array_keys($sections);
    $main_widget['#attached']['drupalSettings']['sections'] = $sections;
    $main_widget['#attached']['drupalSettings']['defaultSection'] = reset($sectionKeys);
    $main_widget['format'] = [
      '#type' => 'value',
      '#value' => 'sections',
    ];

    return $main_widget;
  }

  protected function collectSections() {
    /** @var \Drupal\Core\Theme\ThemeManagerInterface $themeManager */
    $themeManager = \Drupal::service('theme.manager');
    $path = $themeManager->getActiveTheme()->getPath();
    $files = file_scan_directory($path . '/sections', '/.*\.html/');

    if (!$files) {
      return [
        'dummy' => '<section><h2>No sections defined.</h2><p>Please add some sections to your active theme.</p></section>'
      ];
    }

    $sections = [];
    foreach ($files as $name => $info) {
      $sections[$info->name] = file_get_contents($name);
    }
    return $sections;
  }

}
