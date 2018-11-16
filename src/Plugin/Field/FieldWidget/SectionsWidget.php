<?php

namespace Drupal\sections\Plugin\Field\FieldWidget;

use Drupal\Core\Field\FieldDefinitionInterface;
use Drupal\Core\Field\FieldItemListInterface;
use Drupal\Core\Field\WidgetBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Drupal\Core\Extension\ModuleHandlerInterface;

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
class SectionsWidget extends WidgetBase implements ContainerFactoryPluginInterface {

  /**
   * Module handler object.
   *
   * @var \Drupal\Core\Extension\ModuleHandlerInterface
   */
  protected $moduleHandler;

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition) {
    return new static(
      $plugin_id,
      $plugin_definition,
      $configuration['field_definition'],
      $configuration['settings'],
      $configuration['third_party_settings'],
      $container->get('module_handler')
    );
  }

  public function __construct(
    string $plugin_id,
    $plugin_definition,
    FieldDefinitionInterface $field_definition,
    array $settings,
    array $third_party_settings,
    ModuleHandlerInterface $module_handler
  ) {
    parent::__construct(
      $plugin_id,
      $plugin_definition,
      $field_definition,
      $settings,
      $third_party_settings
    );
    $this->moduleHandler = $module_handler;
  }

  /**
   * {@inheritdoc}
   */
  public static function defaultSettings() {
    return [
        'rootElement' => '',
        'defaultSection' => '',
        'enabledSections' => [],
      ] + parent::defaultSettings();
  }

  /**
   * {@inheritdoc}
   */
  public function settingsForm(array $form, FormStateInterface $form_state) {
    $sections = $this->collectSections();

    $element['rootElement'] = [
      '#type' => 'select',
      '#title' => t('Root Element'),
      '#options' => ['default' => t('Default Root Element')] + array_map(function ($section) {
        return $section['label'];
      }, $sections),
      '#default_value' => $this->getSetting('rootElement'),
    ];

    $element['defaultSection'] = [
      '#type' => 'select',
      '#title' => t('Default section'),
      '#options' => array_map(function ($section) {
        return $section['label'];
      }, $sections),
      '#default_value' => $this->getSetting('defaultSection') ?: array_keys($sections)[0],
      '#states' => [
        'required' => [
          'select[name*="rootElement"]' => ['value' => 'default'],
        ],
        'visible' => [
          'select[name*="rootElement"]' => ['value' => 'default'],
        ],
      ],
    ];

    $element['enabledSections'] = [
      '#type' => 'checkboxes',
      '#title' => t('Enabled sections'),
      '#options' => array_map(function ($section) {
        return $section['label'];
      }, $sections),
      '#default_value' => $this->getSetting('enabledSections'),
      '#min' => 1,
      '#states' => [
        'required' => [
          'select[name*="rootElement"]' => ['value' => 'default'],
        ],
        'visible' => [
          'select[name*="rootElement"]' => ['value' => 'default'],
        ],
      ],
    ];

    return $element;
  }

  /**
   * {@inheritdoc}
   */
  public function settingsSummary() {
    $summary = [];
    $rootElement = $this->getSetting('rootElement');
    $defaultSection = $this->getSetting('defaultSection');
    $enabledSections = array_filter(array_values($this->getSetting('enabledSections')));

    $sections = $this->collectSections();

    $summary[] = t('Root Element: @default', [
      '@default' => $sections[$rootElement]['label']
    ]);

    if ($rootElement == 'default') {
      $summary[] = t('Default section: @default', [
        '@default' => $sections[$defaultSection]['label']
      ]);


      $enabledLabels = implode(', ', array_map(function ($key) use ($sections) { return $sections[$key]['label']; }, $enabledSections));
      $summary[] = t('Enabled sections: @enabled', [
        '@enabled' => $enabledLabels,
      ]);
    }
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

    $sections = $this->collectSections();

    $defaultSection = $this->getSetting('defaultSection');
    $enabledSections = array_filter(array_values($this->getSetting('enabledSections')));
    $rootElement = $this->getSetting('rootElement');

    if ($rootElement == 'default') {
      $sections['_root'] = [
        'label' => $this->t('Document root'),
        'template' => '<div class="root"><div class="root-container" ck-editable-type="container" ck-allowed-elements="' . implode(' ', $enabledSections) . '" ck-default-element="' . $defaultSection . '"></div></div>',
      ];
    }
    else {
      $sections['_root'] = $sections[$rootElement];
    }

    $templateAttributes = [
      'data-gallery-type' => [
        'label' => $this->t('Gallery type'),
        'options' => [
          'simple' => $this->t('Simple'),
          'slider' => $this->t('Slider'),
        ],
      ]
    ];

    /** @var \Drupal\Core\Extension\ModuleHandlerInterface $moduleHandler */
    $moduleHandler = \Drupal::service('module_handler');
    $moduleHandler->alter('sections_attributes', $templateAttributes);

    $main_widget['#attached']['drupalSettings']['sections']['templates'] = $sections;
    $main_widget['#attached']['drupalSettings']['sections']['templateAttributes'] = $templateAttributes;
    $main_widget['format'] = [
      '#type' => 'value',
      '#value' => 'sections',
    ];

    $libraries = [
      'sections/default-sections',
    ];

    $this->moduleHandler->alter('sections_libraries', $libraries);

    $main_widget['#attached']['library'][] = 'sections/editor';
    foreach ($libraries as $library) {
      $main_widget['#attached']['library'][] = $library;
    }

    return $main_widget;
  }

  protected function collectSections() {
    $path = drupal_get_path('module', 'sections') . '/sections';

    $sections = [
      'text' => [
        'label' => $this->t('Text'),
        'template' => file_get_contents($path . '/text.html'),
      ],
      'media' => [
        'label' => $this->t('Media'),
        'template' => file_get_contents($path . '/media.html'),
      ],
      'gallery' => [
        'label' => $this->t('Gallery'),
        'template' => file_get_contents($path . '/gallery.html'),
      ],
    ];

    $this->moduleHandler->alter('sections', $sections);

    return $sections;
  }

}
