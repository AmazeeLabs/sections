<?php

namespace Drupal\sections\Plugin\Field\FieldWidget;

use Drupal\Core\Field\FieldItemListInterface;
use Drupal\Core\Field\WidgetBase;
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
class SectionsWidget extends WidgetBase {

  /**
   * {@inheritdoc}
   */
  public static function defaultSettings() {
    return [
        'defaultSection' => '',
        'enabledSections' => [],
      ] + parent::defaultSettings();
  }

  /**
   * {@inheritdoc}
   */
  public function settingsForm(array $form, FormStateInterface $form_state) {
    $sections = $this->collectSections();

    $element['defaultSection'] = [
      '#type' => 'select',
      '#title' => t('Default section'),
      '#options' => array_map(function ($section) {
        return $section['label'];
      }, $sections),
      '#default_value' => $this->getSetting('defaultSection') ?: array_keys($sections)[0],
      '#required' => TRUE,
    ];

    $element['enabledSections'] = [
      '#type' => 'checkboxes',
      '#title' => t('Enabled sections'),
      '#options' => array_map(function ($section) {
        return $section['label'];
      }, $sections),
      '#default_value' => $this->getSetting('enabledSections'),
      '#required' => TRUE,
      '#min' => 1,
    ];

    return $element;
  }

  /**
   * {@inheritdoc}
   */
  public function settingsSummary() {
    $summary = [];
    $defaultSection = $this->getSetting('defaultSection');
    $enabledSections = array_filter(array_values($this->getSetting('enabledSections')));

    $sections = $this->collectSections();

    $summary[] = t('Default section: @default', [
      '@default' => $sections[$defaultSection]['label']
    ]);


    $enabledLabels = implode(', ', array_map(function ($key) use ($sections) { return $sections[$key]['label']; }, $enabledSections));
    $summary[] = t('Enabled sections: @enabled', [
      '@enabled' => $enabledLabels,
    ]);

    return $summary;
  }

  /**
   * {@inheritdoc}
   */
  public function formElement(FieldItemListInterface $items, $delta, array $element, array &$form, FormStateInterface $form_state) {
    $main_widget['value'] = $element + [
      '#type' => 'textarea',
      '#default_value' => $items[$delta]->value,
    ];

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
    /** @var \Drupal\Core\Extension\ThemeHandler $themeHandler */
    $themeHandler = \Drupal::service('theme_handler');
    $info = $themeHandler->getTheme($themeManager->getActiveTheme()->getName())->info;
    $path = $themeManager->getActiveTheme()->getPath();

    if (isset($info['sections']) && $info['sections']) {
      return array_map(function($section) use ($path) {
        return [
          'label' => $this->t($section['label']),
          'template' => file_get_contents($path . '/' . $section['template']),
        ] + $section;
      }, $info['sections']);
    }
    else {
      return [
        'no_sections_defined' => [
          'label' => t('No sections defined'),
          'template' => '<section><h2>No sections defined.</h2><p>Please add some sections to your active theme.</p></section>',
        ]
      ];
    }
  }

}
