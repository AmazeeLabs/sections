<?php

namespace Drupal\sections\Controller;

use Drupal\Core\Controller\ControllerBase;
use Drupal\Core\Render\RendererInterface;
use Drupal\media\MediaInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpFoundation\Response;

class MediaPreviewController extends ControllerBase {

  /**
   * @var \Drupal\Core\Render\RendererInterface
   */
  protected $renderer;
  public static function create(ContainerInterface $container) {
    return new static ($container->get('renderer'));
  }

  public function __construct(RendererInterface $renderer) {
    $this->renderer = $renderer;
  }


  function preview(MediaInterface $media, $display) {
    $build = $this->entityTypeManager()->getViewBuilder('media')->view($media, $display);
    $response = new Response();
    $response->setContent($this->renderer->render($build));
    return $response;
  }
}
