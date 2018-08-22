<?php

namespace Drupal\sections;

use Caxy\HtmlDiff\HtmlDiffConfig;
use Caxy\HtmlDiff\LcsService;
use Caxy\HtmlDiff\ListDiffLines;
use Caxy\HtmlDiff\Operation;

class SectionsListDiffLines extends ListDiffLines {

  protected static $listContentTags = array(
    'h1','h2','h3','h4','h5','pre','div','br','hr','code',
    'input','form','img','span','a','i','b','strong','em',
    'font','big','del','tt','sub','sup','strike', 'section'
  );

  /**
   * {@inheritDoc}
   */
  public function build()
  {
    $this->prepare();

    if ($this->hasDiffCache() && $this->getDiffCache()->contains($this->oldText, $this->newText)) {
      $this->content = $this->getDiffCache()->fetch($this->oldText, $this->newText);

      return $this->content;
    }

    $matchStrategy = new SectionMatchStrategy($this->config->getMatchThreshold());
    $this->lcsService = new LcsService($matchStrategy);

    return $this->listByLines($this->oldText, $this->newText);
  }

  /**
   * @param string              $oldText
   * @param string              $newText
   * @param HtmlDiffConfig|null $config
   *
   * @return \Drupal\sections\SectionsListDiffLines
   */
  public static function create($oldText, $newText, HtmlDiffConfig $config = null)
  {
    $diff = new self($oldText, $newText);

    if (null !== $config) {
      $diff->setConfig($config);
    }

    return $diff;
  }

  public function initPurifier($defaultPurifierSerializerCache = NULL) {

    if (null !== $this->purifierConfig) {
      $HTMLPurifierConfig  = $this->purifierConfig;
    } else {
      $HTMLPurifierConfig = \HTMLPurifier_Config::createDefault();
    }

    // Cache.SerializerPath defaults to Null and sets
    // the location to inside the vendor HTMLPurifier library
    // under the DefinitionCache/Serializer folder.
    if (!is_null($defaultPurifierSerializerCache)) {
      $HTMLPurifierConfig->set('Cache.SerializerPath', $defaultPurifierSerializerCache);
    }

    // Cache.SerializerPermissions defaults to 0744.
    // This setting allows the cache files to be deleted by any user, as they are typically
    // created by the web/php user (www-user, php-fpm, etc.)
    $HTMLPurifierConfig->set('Cache.SerializerPermissions', 0777);

    $def = $HTMLPurifierConfig->getHTMLDefinition(TRUE);
    $def->addElement(
      'section',
      'Block',
      'Flow',
      []
    );
    $def->addAttribute('section', 'class', 'CDATA');

    $this->purifier = new \HTMLPurifier($HTMLPurifierConfig);
  }


  /**
   * @param \simple_html_dom_node $node
   *
   * @return string
   */
  protected function getRelevantNodeText($node)
  {
    if (!$node->hasChildNodes()) {
      return $node->innertext();
    }

    $output = '';
    foreach ($node->nodes as $child) {
      /* @var $child \simple_html_dom_node */
      if (!$child->hasChildNodes()) {
        $output .= $child->outertext();
      } elseif (in_array($child->nodeName(), static::$listContentTags, true)) {
        $output .= sprintf('<%1$s class="%2$s">%3$s</%1$s>', $child->nodeName(), $child->attr['class'], $this->getRelevantNodeText($child));
      }
    }

    return $output;
  }
  /**
   * @param Operation[]|array     $operations
   * @param \simple_html_dom_node $oldListNode
   * @param \simple_html_dom_node $newListNode
   *
   * @return string
   */
  protected function processOperations($operations, $oldListNode, $newListNode)
  {
    $output = '';

    $indexInOld = 0;
    $indexInNew = 0;
    $lastOperation = null;

    foreach ($operations as $operation) {
      $replaced = false;
      while ($operation->startInOld > ($operation->action === Operation::ADDED ? $indexInOld : $indexInOld + 1)) {
        $li = $oldListNode->children($indexInOld);
        $matchingLi = null;
        if ($operation->startInNew > ($operation->action === Operation::DELETED ? $indexInNew
            : $indexInNew + 1)
        ) {
          $matchingLi = $newListNode->children($indexInNew);
        }
        if (null !== $matchingLi) {
          $htmlDiff = SectionsHtmlDiff::create($li->innertext, $matchingLi->innertext, $this->config);
          $li->innertext = $htmlDiff->build();
          $indexInNew++;
        }
        $class = self::CLASS_LIST_ITEM_NONE;

        if ($lastOperation === Operation::DELETED && !$replaced) {
          $class = self::CLASS_LIST_ITEM_CHANGED;
          $replaced = true;
        }
        $li->setAttribute('class', trim($li->getAttribute('class').' '.$class));

        $output .= $li->outertext;
        $indexInOld++;
      }

      switch ($operation->action) {
        case Operation::ADDED:
          for ($i = $operation->startInNew; $i <= $operation->endInNew; $i++) {
            $output .= $this->addListItem($newListNode->children($i - 1));
          }
          $indexInNew = $operation->endInNew;
          break;

        case Operation::DELETED:
          for ($i = $operation->startInOld; $i <= $operation->endInOld; $i++) {
            $output .= $this->deleteListItem($oldListNode->children($i - 1));
          }
          $indexInOld = $operation->endInOld;
          break;

        case Operation::CHANGED:
          $changeDelta = 0;
          for ($i = $operation->startInOld; $i <= $operation->endInOld; $i++) {
            $output .= $this->deleteListItem($oldListNode->children($i - 1));
            $changeDelta--;
          }
          for ($i = $operation->startInNew; $i <= $operation->endInNew; $i++) {
            $output .= $this->addListItem($newListNode->children($i - 1), $changeDelta < 0);
            $changeDelta++;
          }
          $indexInOld = $operation->endInOld;
          $indexInNew = $operation->endInNew;
          break;
      }

      $lastOperation = $operation->action;
    }

    $oldCount = count($oldListNode->children());
    $newCount = count($newListNode->children());
    while ($indexInOld < $oldCount) {
      $li = $oldListNode->children($indexInOld);
      $matchingLi = null;
      if ($indexInNew < $newCount) {
        $matchingLi = $newListNode->children($indexInNew);
      }
      if (null !== $matchingLi) {
        $htmlDiff = SectionsHtmlDiff::create($li->innertext(), $matchingLi->innertext(), $this->config);
        $li->innertext = $htmlDiff->build();
        $indexInNew++;
      }
      $class = self::CLASS_LIST_ITEM_NONE;

      if ($lastOperation === Operation::DELETED) {
        $class = self::CLASS_LIST_ITEM_CHANGED;
      }
      $li->setAttribute('class', trim($li->getAttribute('class').' '.$class));

      $output .= $li->outertext;
      $indexInOld++;
    }

    $newListNode->innertext = $output;
    $newListNode->setAttribute('class', trim($newListNode->getAttribute('class').' diff-list'));

    return $newListNode->outertext;
  }

}
