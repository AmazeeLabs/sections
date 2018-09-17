<?php

namespace Drupal\sections\Controller;

use Drupal\Core\Controller\ControllerBase;
use Drupal\Core\Entity\EntityRepositoryInterface;
use Drupal\Core\Render\RendererInterface;
use Drupal\media\MediaInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpFoundation\Response;

class MediaPreviewController extends ControllerBase {

  /**
   * @var \Drupal\Core\Render\RendererInterface
   */
  protected $renderer;

  /**
   * @var \Drupal\Core\Entity\EntityRepositoryInterface
   */
  protected $entityRepository;

  public static function create(ContainerInterface $container) {
    return new static ($container->get('renderer'), $container->get('entity.repository'));
  }

  public function __construct(RendererInterface $renderer, EntityRepositoryInterface $entityRepository) {
    $this->entityRepository = $entityRepository;
    $this->renderer = $renderer;
  }


  function preview($uuid, $display) {
    $media = $this->entityRepository->loadEntityByUuid('media', $uuid);
    $build = $this->entityTypeManager()->getViewBuilder('media')->view($media, $display);
    $response = new Response();
    $response->setContent($this->renderer->render($build));
    return $response;
  }
}
