import Carousel from "./js/carousel.js";
import slides from "./js/slides.js";

import RibbonMenu from "./js/ribbonmenu.js";
import categories from "./js/categories.js";

import StepSlider from "./js/stepslider.js";
import ProductsGrid from "./js/productsgrid.js";

import CartIcon from "./js/carticon.js";
import Cart from "./js/cart.js";

export default class Main {
  products = null;
  productsGrid = null;
  constructor() {
    this.carousel = new Carousel(slides);
    this.ribbonMenu = new RibbonMenu(categories);
    this.stepSlider = new StepSlider({ steps: 5, value: 3 });
    this.cartIcon = new CartIcon();
    this.cart = new Cart(this.cartIcon);
  }

  async render() {
    // render Carousel
    document.querySelector("[data-carousel-holder]").append(this.carousel.elem);
    // render Ribbon Menu
    document.querySelector("[data-ribbon-holder]").append(this.ribbonMenu.elem);
    // render Slider
    document.querySelector("[data-slider-holder]").append(this.stepSlider.elem);
    // create cartIcon
    document
      .querySelector("[data-cart-icon-holder]")
      .append(this.cartIcon.elem);

    // get products array
    const productsPromise = await fetch("./products.json");
    this.products = await productsPromise.json();

    this.productsGrid = new ProductsGrid(this.products);

    // render products grid
    document
      .querySelector("[data-products-grid-holder]")
      .append(this.productsGrid.elem);

    this.#setBaseFilters();
    this.#addListeners();
  }

  #addListeners = () => {
    //add product
    document.body.addEventListener("product-add", (event) => {
      const product = this.products.find((item) => {
        return item.id == event.detail;
      });
      this.cart.addProduct(product);
    });

    // slider spicy change
    this.stepSlider.elem.addEventListener("slider-change", (event) => {
      this.productsGrid.updateFilter({
        maxSpiciness: event.detail,
      });
    });

    // product category filtering
    document.body.addEventListener("ribbon-select", (event) => {
      this.productsGrid.updateFilter({ category: event.detail });
    });

    // nuts filtering
    const nutCheckBox = document.querySelector("#nuts-checkbox");
    nutCheckBox.addEventListener("change", () => {
      this.productsGrid.updateFilter({ noNuts: nutCheckBox.checked });
    });

    // vegeterian filtering
    const vegCheckBox = document.querySelector("#vegeterian-checkbox");
    vegCheckBox.addEventListener("change", () => {
      this.productsGrid.updateFilter({ vegeterianOnly: vegCheckBox.checked });
    });
  };

  #setBaseFilters = () => {
    this.productsGrid.updateFilter({
      noNuts: document.getElementById("nuts-checkbox").checked,
      vegeterianOnly: document.getElementById("vegeterian-checkbox").checked,
      maxSpiciness: this.stepSlider.getPosition(),
      category: "",
    });
  };
}