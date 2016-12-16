<?php

class Products {

  protected $list;

  public function getList(){
    // return json_encode($this->list);
    $content_json = file_get_contents('http://localhost/ajax_panier/json/products.json');
    $content = json_decode($content_json);
    return $content;
  }


}


?>
