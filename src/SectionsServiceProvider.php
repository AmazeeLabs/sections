<?php

namespace Drupal\sections;

use Drupal\Core\DependencyInjection\ContainerBuilder;
use Drupal\Core\DependencyInjection\ServiceProviderBase;

class SectionsServiceProvider extends ServiceProviderBase {

  /**
   * {@inheritdoc}
   */
  public function alter(ContainerBuilder $container) {
    $definition = $container->getDefinition('diff.html_diff');
    if (!empty($definition)) {
      $definition->setClass('Drupal\sections\SectionsHtmlDiff');
    }
  }
}
