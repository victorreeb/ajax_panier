// error handler for ajax calls
var error_handler = function(jqXHR, textStatus, errorThrown) {
  var error_msg = this.url + ': ' + textStatus + ' ' + jqXHR.status + ' ' + errorThrown;
  var $error = $('<div>').addClass('errorMsg').text(error_msg);
  $('#error').append($error);
  setTimeout(function() {$('#error').remove();}, 5000);
}

// products and cart
var products = [];
var cart = [];


// product class
var Product = function(data) {
  this.name = data.name;
  this.description = data.description;
  this.price = data.price;
};
Product.prototype.to_string = function() {
  return 'name: ' + this.name + ' | description: ' + this.description + ' | price: ' + this.price;
}
Product.prototype.display = function() {
  var _this = this;
  if (this.product_display === undefined) {
    this.product_display = $('<ul>').addClass('product');
    this.product_display.append( $('<li>').addClass('name').text(this.name) );
    this.product_display.append( $('<li>').addClass('description').text(this.description) );
    this.product_display.append( $('<li>').addClass('price').text(this.price) );
    this.product_display.append( $('<li>').addClass('buy').append( $('<button>').text('acheter').click(function(e) { _this.buy(); }) ));
  }
  return this.product_display;
}
Product.prototype.display_cart = function() {
  var _this = this;
  if (this.cart_display === undefined) {
    this.cart_display = $('<ul>').addClass('product');
    this.cart_display.append( $('<li>').addClass('name').text(this.name) );
    this.cart_display.append( $('<li>').addClass('price').text(this.price) );
  }
  return this.cart_display;
}
Product.prototype.display_checkmark = function() {
  this.cart_display.addClass('check');
  cart.count += 1;
  if (cart.count === cart.length) {
    cart.button.addClass('done');
  }
}
Product.prototype.display_second_checkmark = function() {
  this.cart_display.addClass('doublecheck');
  cart.doublecount += 1;
  if (cart.doublecount === cart.length) {
    cart.button.addClass('doubledone');
  }
}
Product.prototype.buy = function() {
  $.post('http://localhost:9292/cart', JSON.stringify(this))
  .fail(error_handler)
  .done(get_cart);
}
Product.prototype.prepare = function() {
  var _this = this;
  $.get('http://localhost:9292/validation')
  .fail(error_handler)
  .done(function(data) { 
    _this.display_checkmark(); 
    _this.sending();
  });
}
Product.prototype.sending = function() {
  var _this = this;
  $.get('http://localhost:9292/validation')
  .fail(error_handler)
  .done(function(data) { _this.display_second_checkmark(); });
}



// ajax methods
var get_products = function() {
  $.get('http://localhost:9292/products')
  .fail(error_handler)
  .done(function(data) {
    products = [];
    data.products.forEach(function(product) { products.push(new Product(product)); });
    display_products();
  });
}

var get_cart = function() {
  $.get('http://localhost:9292/cart')
  .fail(error_handler)
  .done(function(data) {
    if (! $.isEmptyObject(data)) {
      cart = [];
      data.cart.forEach(function(product) { cart.push(new Product(product)); });
    }
    display_cart();
  });
}

// display functions
var display_products = function() {
  var $container = $('<ul>').addClass('products');
  products.forEach(function(product) { $container.append(product.display()); });
  $('#products').empty().append($container);
}

var display_cart = function() {
  $container = $('<div>').addClass('cart');
  if ($.isEmptyObject(cart)) {
    $container.addClass('empty').text('Votre panier est vide');
  } else {
    cart.forEach(function(product) { $container.append(product.display_cart()); });
    cart.button = $('<button>').addClass('order').text('commander');
    $container.append(cart.button);
    cart.button.click(function() {
      cart.count = 0;
      cart.doublecount = 0;
      cart.forEach(function(product) { product.prepare(); })
    });
  }
  $('#cart').empty().append($container);
}

// main
$(function() {
  $.ajaxSetup({ cache: false }); // stop caching get request (especially validations)
  
  get_products();
  get_cart();
});
