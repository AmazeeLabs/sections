<?php

namespace Drupal\sections\Plugin\views\field;

use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Form\FormBuilderInterface;
use Drupal\Core\Url;
use Drupal\media_library\Plugin\views\field\MediaLibrarySelectForm;

/**
 * Defines a field that outputs a checkbox and form for selecting media.
 *
 * @ViewsField("sections_media_library_select_form")
 *
 * @internal
 */
class SectionsMediaLibrarySelectForm extends MediaLibrarySelectForm {

  /**
   * {@inheritdoc}
   */
  public function viewsForm(array &$form, FormStateInterface $form_state) {
    // Only add the bulk form options and buttons if there are results.
    if (empty($this->view->result)) {
      return;
    }

    // Render checkboxes for all rows.
    $form[$this->options['id']]['#tree'] = TRUE;
    $return_type = \Drupal::request()->query->get('return_type');

    foreach ($this->view->result as $row_index => $row) {
      $entity = $this->getEntity($row);
      $form[$this->options['id']][$row_index] = [
        '#type' => 'checkbox',
        '#title' => $this->t('Select @label', [
          '@label' => $entity->label(),
        ]),
        '#title_display' => 'invisible',
        '#return_value' => $return_type == 'uuid' ? $entity->uuid(): $entity->id(),
      ];
    }

    // @todo Remove in https://www.drupal.org/project/drupal/issues/2504115
    // Currently the default URL for all AJAX form elements is the current URL,
    // not the form action. This causes bugs when this form is rendered from an
    // AJAX path like /views/ajax, which cannot process AJAX form submits.
    $url = parse_url($form['#action'], PHP_URL_PATH);
    $query = \Drupal::request()->query->all();
    $query[FormBuilderInterface::AJAX_FORM_REQUEST] = TRUE;
    $form['actions']['submit']['#ajax'] = [
      'url' => Url::fromUserInput($url),
      'options' => [
        'query' => $query,
      ],
      'callback' => [static::class, 'updateWidget'],
    ];

    $form['actions']['submit']['#value'] = $this->t('Select media');
    $form['actions']['submit']['#field_id'] = $this->options['id'];
  }

}

