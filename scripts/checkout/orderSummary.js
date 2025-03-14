import {cart,removeFromCart,calculateCartQuantity,updateQuantity,updateDeliveryOption} from '../../data/cart.js';
import {products, getProduct} from '../../data/products.js'
import { deliveryOptions, getDeliveryOption, calculateDeliveryDate } from '../../data/deliveryOptions.js'
import { renderPaymentSummary } from './paymentSummary.js';

export function renderOrderSummary(){

  let cartSummaryHTML = '';

  cart.forEach((cartItem)=>{

      const productId = cartItem.productId;

      let matchingProduct = getProduct(productId);

      const deliveryOptionId = cartItem.deliveryOptionId;

      let deliveryOption = getDeliveryOption(deliveryOptionId);

      const dateString = calculateCartQuantity(deliveryOption);

      cartSummaryHTML += `
              <div class="cart-item-container js-cart-item-container-${matchingProduct.id}">
              <div class="delivery-date">
                Delivery date: ${dateString}
              </div>

              <div class="cart-item-details-grid">
                <img class="product-image"
                  src="${matchingProduct.image}">

                <div class="cart-item-details">
                  <div class="product-name">
                    ${matchingProduct.name}
                  </div>
                  <div class="product-price">
                    $${matchingProduct.getPrice()}
                  </div>
                  <div class="product-quantity">
                    <span>
                      Quantity: <span class="quantity-label js-quantity-label-${matchingProduct.id}"">${cartItem.quantity}</span>
                    </span>
                    <span class="update-quantity-link link-primary js-update-link" data-product-id="${matchingProduct.id}">
                      Update
                    </span>
                    <input class="quantity-input js-quantity-input-${matchingProduct.id}">
                    <span class="save-quantity-link link-primary js-save-link" data-product-id="${matchingProduct.id}">save</span>
                    <span class="delete-quantity-link link-primary js-delete-link" data-product-id="${matchingProduct.id}">
                      Delete
                    </span>
                  </div>
                </div>

                <div class="delivery-options">
                  <div class="delivery-options-title">
                    Choose a delivery option:
                  </div>
                  ${deliveryOptionsHTML(matchingProduct,cartItem)}
                </div>
              </div>
            </div>
      `;
  })

  function deliveryOptionsHTML(matchingProduct,cartItem) {
    let html = '';

    deliveryOptions.forEach((deliveryOption) => {
      const dateString = calculateDeliveryDate(deliveryOption);
      const priceString =
        deliveryOption.priceCents === 0
          ? 'FREE'
          : `$${(deliveryOption.priceCents / 100).toFixed(2)} -`;

      const isChecked = deliveryOption.id === cartItem.deliveryOptionId

      html += `<div class="delivery-option js-delivery-option" data-product-id="${matchingProduct.id}" data-delivery-option-id="${deliveryOption.id}">
          <input type="radio" ${isChecked ? 'checked' : ''}
            class="delivery-option-input"
            name="delivery-option-${matchingProduct.id}">
          <div>
            <div class="delivery-option-date">
              ${dateString}
            </div>
            <div class="delivery-option-price">
              ${priceString} Shipping
            </div>
          </div>
        </div>`;
    });
    return html;
  }


  document.querySelector('.js-order-summary').innerHTML = cartSummaryHTML

  function updateCartQuantity(){
      const cartQuantity = calculateCartQuantity()
      document.querySelector('.js-return-to-home-link').innerHTML = `${cartQuantity} items`
  }

  updateCartQuantity();

  document.querySelectorAll('.js-delete-link').forEach((link)=>{
      link.addEventListener('click',()=>{
          const productId = link.dataset.productId
          removeFromCart(productId);
          renderOrderSummary()
          updateCartQuantity()
          renderPaymentSummary();
      })
  })

  document.querySelectorAll('.js-update-link').forEach((link)=>{
    link.addEventListener('click',()=>{
      const productId = link.dataset.productId
      const container = document.querySelector(`.js-cart-item-container-${productId}`);
      container.classList.add('is-editing-quantity')
      })
  })


  document.querySelectorAll('.js-save-link')
    .forEach((link) => {
      const productId = link.dataset.productId;
      const quantityInput = document.querySelector(
        `.js-quantity-input-${productId}`
      );
      const container = document.querySelector(
        `.js-cart-item-container-${productId}`
      );
      link.addEventListener('click', () => {
        handleUpdateQuantity(container,quantityInput,productId)
      });
      quantityInput.addEventListener('keydown',(event)=>{
        if(event.key==='Enter'){
          handleUpdateQuantity(container,quantityInput,productId)
        }
      })
  });

  function handleUpdateQuantity(container,quantityInput,productId){
    container.classList.remove('is-editing-quantity');
    const newQuantity = Number(quantityInput.value);
    if (newQuantity<0 || newQuantity>=1000){
      alert('Quantity must be at least 0 and less than 1000');
      return;
    }
    updateQuantity(productId, newQuantity);

    document.querySelector(`.js-quantity-label-${productId}`).innerHTML = newQuantity;
    updateCartQuantity();

    document.querySelector('.js-checkout-header').innerHTML = `Checkout(${calculateCartQuantity()} items)`
    renderPaymentSummary()
  }

  document.querySelectorAll('.js-delivery-option').forEach((option)=>{
    option.addEventListener('click',()=>{
      const {productId,deliveryOptionId} = option.dataset
      updateDeliveryOption(productId,deliveryOptionId)
      renderOrderSummary()
      renderPaymentSummary()
    })
  })
}