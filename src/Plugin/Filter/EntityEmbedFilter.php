<?php

namespace Drupal\sections\Plugin\Filter;

use Drupal\Component\Utility\Html;
use Drupal\Core\Cache\CacheableMetadata;
use Drupal\Core\Entity\EntityRepositoryInterface;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\filter\FilterProcessResult;
use Drupal\filter\Plugin\FilterBase;
use Drupal\image\Entity\ImageStyle;
use Symfony\Component\DependencyInjection\ContainerInterface;


/**
 * Provides a filter to limit allowed HTML tags.
 *
 * The attributes in the annotation show examples of allowing all attributes
 * by only having the attribute name, or allowing a fixed list of values, or
 * allowing a value with a wildcard prefix.
 *
 * @Filter(
 *   id = "section_embeds",
 *   title = @Translation("Resolve embedded entities in sections."),
 *   type = Drupal\filter\Plugin\FilterInterface::TYPE_TRANSFORM_IRREVERSIBLE,
 *   weight = -10
 * )
 */
class EntityEmbedFilter extends FilterBase implements ContainerFactoryPluginInterface {

  /**
   * @var \Drupal\Core\Entity\EntityRepositoryInterface
   */
  protected $entityRepository;

  public function __construct(
    array $configuration,
    $plugin_id,
    $plugin_definition,
    EntityRepositoryInterface $entityRepository
  ) {
    parent::__construct($configuration, $plugin_id, $plugin_definition);
    $this->entityRepository = $entityRepository;
  }

  public static function create(
    ContainerInterface $container,
    array $configuration,
    $plugin_id,
    $plugin_definition
  ) {
    return new static(
      $configuration,
      $plugin_id,
      $plugin_definition,
      $container->get('entity.repository')
    );
  }

  public function process($text, $langcode) {
    $result = new FilterProcessResult($text);
    $doc = Html::load($text);
    $xpath = new \DOMXPath($doc);


    // TODO: move this to a separate filter? only needed for diff view.
    $sectionsList = $doc->createElement('ul');
    $sectionsList->setAttribute('class', 'sections-list');
    $doc->documentElement->getElementsByTagName('body')[0]->appendChild($sectionsList);

    foreach ($xpath->query('//section') as $section) {
      $sectionsListElement = $doc->createElement('li');
      $sectionsList->appendChild($sectionsListElement);
      $sectionsListElement->appendChild($section);
    }

    /** @var \DOMNode $node */
    foreach ($xpath->query('//drupal-entity[@type and @uuid]') as $node) {
      /** @var \Drupal\Core\Entity\ContentEntityInterface $embed */
      $embed = $this->entityRepository->loadEntityByUuid($node->getAttribute('type'), $node->getAttribute('uuid'));
      // Skip if its not a valid embed.
      if (!$embed) {
        continue;
      }

      // TODO: decouple this
      $style = 'smart_stage';
      if (strpos($node->parentNode->getAttribute('class'), 'section--story')) {
        $style = 'smart_story';
      }
      if (strpos($node->parentNode->getAttribute('class'), 'section--carousel')) {
        $style = 'smart_carousel';
      }

      $imageStyle = ImageStyle::load($style);

      $styleUri = $imageStyle->buildUrl($embed->field_media_image->entity->getFileUri());

      $img = '<img src="' . $styleUri . '" class="entity ' . $node->getAttribute('class') . '" />"';
      $imgNode = Html::load($img)->getElementsByTagName('img')->item(0);

      $imported = $doc->importNode($imgNode, TRUE);

      $node->parentNode->replaceChild($imported, $node);

      $result->merge((new CacheableMetadata())
        ->setCacheContexts($embed->getCacheContexts())
        ->setCacheTags($embed->getCacheTags())
        ->setCacheMaxAge($embed->getCacheMaxAge())
      );
    }

    $result->setProcessedText(Html::serialize($doc));
    return $result;
  }
}
