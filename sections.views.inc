<?php


/**
 * Implements hook_views_data().
 */
function sections_views_data() {
  $data = [];
  $data['media']['sections_media_library_select_form'] = [
    'title' => t('Select sections media'),
    'help' => t('Provides a field for selecting media entities in our media library view'),
    'real field' => 'mid',
    'field' => [
      'id' => 'sections_media_library_select_form',
    ],
  ];
  return $data;
}
