<?php

namespace Drupal\sections;

use Caxy\HtmlDiff\Strategy\ListItemMatchStrategy;
use Sunra\PhpSimple\HtmlDomParser;

class SectionMatchStrategy extends ListItemMatchStrategy {

  public function isMatch($a, $b) {
    $docA = HtmlDomParser::str_get_html($a)->root->children[0];
    $docB = HtmlDomParser::str_get_html($b)->root->children[0];
    if ($docA->attr['class'] !== $docB->attr['class']) {
      return FALSE;
    }
    return parent::isMatch($a, $b);
  }
}
