import createElement from "../assets/lib/create-element.js";
import escapeHtml from "../assets/lib/escape-html.js";

import Modal from "./modal.js";

export default class Cart {
  cartItems = []; // [product: {...}, count: N]
  #basket = null;
  #modal = null;
  constructor(cartIcon) {
    this.cartIcon = cartIcon;
    this.#modal = new Modal();
    this.addEventListeners();
  }

  addProduct(product) {
    //create a temporary object to push in cartItems
    const productObject = { product, count: 1 };

    // find element in array with the same product.name
    const cartItem = this.cartItems.find(
      (item) => item.product.id == productObject.product.id
    );

    // if there is a same element increase q-ty + 1

    if (cartItem) {
      cartItem.count++;
      this.onProductUpdate(cartItem); //call function to add item
    } else {
      this.cartItems.push(productObject);
      this.onProductUpdate(productObject);
    }
  }

  updateProductCount(productId, amount) {
    // find element in array with the same productId
    const cartItem = this.cartItems.find(
      (item) => item.product.id == productId
    );

    if (cartItem.count >= 1) {
      cartItem.count += amount;
    }
    //  if q-ty of object is 0 - delete obj from array
    if (cartItem.count <= 0) {
      const idOfElementToDelete = this.cartItems.indexOf(cartItem);
      this.cartItems.splice(idOfElementToDelete, 1);
    }

    this.onProductUpdate(cartItem);
  }

  isEmpty() {
    return this.cartItems.length == 0 ? true : false;
  }

  getTotalCount() {
    return this.cartItems.reduce((previousValue, currentItem) => {
      return previousValue + currentItem.count;
    }, 0);
  }

  getTotalPrice() {
    return this.cartItems.reduce((previousValue, currentItem) => {
      return previousValue + currentItem.product.price * currentItem.count;
    }, 0);
  }

  renderProduct(product, count) {
    console.log(count);
    return createElement(`
    <div class="cart-product" data-product-id="${product.id}">
      <div class="cart-product__img">
        <img src="/assets/images/products/${product.image}" alt="product">
      </div>
      <div class="cart-product__info">
        <div class="cart-product__title">${escapeHtml(product.name)}</div>
        <div class="cart-product__price-wrap">
          <div class="cart-counter">
            <button type="button" class="cart-counter__button cart-counter__button_minus">
              <img src="/assets/images/icons/square-minus-icon.svg" alt="minus">
            </button>
            <span class="cart-counter__count">${count}</span>
            <button type="button" class="cart-counter__button cart-counter__button_plus">
              <img src="/assets/images/icons/square-plus-icon.svg" alt="plus">
            </button>
          </div>
          <div class="cart-product__price">€${(count * product.price).toFixed(
            2
          )}</div>
        </div>
      </div>
    </div>`);
  }

  renderOrderForm() {
    return createElement(`<form class="cart-form">
      <h5 class="cart-form__title">Delivery</h5>
      <div class="cart-form__group cart-form__group_row">
        <input name="name" type="text" class="cart-form__input" placeholder="Name" required value="Santa Claus">
        <input name="email" type="email" class="cart-form__input" placeholder="Email" required value="john@gmail.com">
        <input name="tel" type="tel" class="cart-form__input" placeholder="Phone" required value="+1234567">
      </div>
      <div class="cart-form__group">
        <input name="address" type="text" class="cart-form__input" placeholder="Address" required value="North, Lapland, Snow Home">
      </div>
      <div class="cart-buttons">
        <div class="cart-buttons__buttons btn-group">
          <div class="cart-buttons__info">
            <span class="cart-buttons__info-text">total</span>
            <span class="cart-buttons__info-price">€${this.getTotalPrice().toFixed(
              2
            )}</span>
          </div>
          <button type="submit" class="cart-buttons__button btn-group__button button">order</button>
        </div>
      </div>
    </form>`);
  }

  renderModal() {
    this.#modal.setTitle("Your order");
    this.#modal.setBody(this.#createBasketElement());
    this.#modal.open();
  }

  #createBasketElement = () => {
    this.#basket = createElement("<div></div>");

    this.cartItems.forEach((item) => {
      this.#basket.appendChild(this.renderProduct(item.product, item.count));
    });
    this.#basket.appendChild(this.renderOrderForm());
    this.#addButtonlisteners();
    return this.#basket;
  };

  #addButtonlisteners = () => {
    this.#basket.addEventListener("click", this.#qtyChange); // qty change in a basket
    this.#basket
      .querySelector(".cart-form")
      .addEventListener("submit", this.onSubmit); // binding this due to async function declaration
  };

  #qtyChange = (event) => {
    if (!event.target.closest(".cart-counter__button")) {
      return;
    }

    const button = event.target.closest(".cart-counter__button");
    const productId = event.target.closest(".cart-product").dataset.productId;

    if (button.classList.contains("cart-counter__button_plus")) {
      this.updateProductCount(productId, 1); // increase q-ty of produc on 1 if button has PLUS class name
    } else {
      this.updateProductCount(productId, -1);
    }
  };

  onProductUpdate(cartItem) {
    this.cartIcon.update(this);

    // basket modal is not open - do not update
    if (!document.body.classList.contains("is-modal-open")) {
      return;
    }

    // last product was deleted - close a basket modal!
    if (this.isEmpty()) {
      this.#modal.close();
      return;
    }

    const productId = cartItem.product.id;

    // remove product HTML from basket
    if (cartItem.count == 0) {
      this.#basket.querySelector(`[data-product-id="${productId}"]`).remove();
      return;
    }

    this.#reRenderBasketProductQty(cartItem, productId);
  }

  #reRenderBasketProductQty = (cartItem, productId) => {
    const productCount = this.#basket.querySelector(
      `[data-product-id="${productId}"] .cart-counter__count`
    );
    const productPrice = this.#basket.querySelector(
      `[data-product-id="${productId}"] .cart-product__price`
    );
    const infoPrice = this.#basket.querySelector(`.cart-buttons__info-price`);

    productCount.innerText = cartItem.count;
    productPrice.innerText = `€${(
      cartItem.count * cartItem.product.price
    ).toFixed(2)}`;
    infoPrice.innerText = `€${this.getTotalPrice().toFixed(2)}`;
  };

  onSubmit = async (event) => {
    event.preventDefault();
    this.#basket
      .querySelector('button[type="submit"]')
      .classList.add("is-loading");

    let formData = new FormData(this.#basket.querySelector(".cart-form"));

    try {
      const responce = await fetch("https://httpbin.org/post", {
        method: "POST",
        body: formData,
      });

      if (responce.ok) {
        this.cartItems = [];
        this.#basketChangeOnSucsessSubmit();
      }
    } catch (e) {
      console.log("server error:", e);
    }
  };

  #basketChangeOnSucsessSubmit = () => {
    this.#modal.setTitle("Success!");
    this.#modal.setBody(
      createElement(`
      <div class="modal__body-inner">
        <p>Order successful! Your order is being cooked :) 
        <br>We’ll notify you about delivery time shortly.<br>
        <img src="/assets/images/delivery.gif">
        </p>
      </div>`)
    );
    this.cartIcon.update(this);
  };

  addEventListeners() {
    this.cartIcon.elem.onclick = () => this.renderModal();
  }
}
