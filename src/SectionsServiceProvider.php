<?php

namespace Drupal\sections;

use Drupal\Core\DependencyInjection\ContainerBuilder;
use Drupal\Core\DependencyInjection\ServiceProviderBase;

class SectionsServiceProvider extends ServiceProviderBase {

  /**
   * {@inheritdoc}
   */
  public function alter(ContainerBuilder $container) {
    if ($container->hasDefinition('diff.html_diff')) {
      $definition = $container->getDefinition();
      if (!empty($definition)) {
        $definition->setClass('Drupal\sections\SectionsHtmlDiff');
      }
    }
  }
}
