import createElement from "../assets/lib/create-element.js";

export default class ProductCard {
  constructor(product) {
    this.product = product;
    this.elem = null;
    this.#render();
  }

  #render() {
    this.elem = createElement(`
    <div class="card">
      ${this.#insertProductData()}
    </div>`);
    const button = this.elem.querySelector(".card__button");
    button.addEventListener('click', this.#onCardButtonClick)
  }

  #insertProductData() {
    return `
    <div class="card__top">
      <img src="./assets/images/products/${
        this.product.image
      }" class="card__image" alt="product">
      <span class="card__price">€${this.product.price.toFixed(2)}</span>
    </div>
    <div class="card__body">
      <div class="card__title">${this.product.name}</div>
      <button type="button" class="card__button">
      <img src="/assets/images/icons/plus-icon.svg" alt="icon">
      </button>
    </div>`;
  }

  #onCardButtonClick = () => {
    const productIdDispatch = new CustomEvent("product-add", {
      detail: this.product.id,
      bubbles: true,
    });
    event.target.closest("button").dispatchEvent(productIdDispatch);
  }
}
