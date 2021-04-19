import createElement from "../assets/lib/create-element.js";
import ProductCard from "./productcard.js";

export default class ProductGrid {
  constructor(products) {
    this.products = products;
    this.filters = {
      noNuts: false, // true/false
      vegeterianOnly: false, // true/false
      maxSpiciness: 4, // числа от 0 до 4
      category: "",
    };
    this.elem = createElement(this.#poductsWrapperTemplate()); 
    this.#renderProductList();
  }

  #poductsWrapperTemplate = () => {
    return `
    <div class="products-grid">
      <div class="products-grid__inner">
      </div>
    </div>
    `;
  };
  // render list of products ( name of function was pre-defined)
  #renderProductList = (productList = this.products) => {
    const productsWrapper = this.elem.querySelector(".products-grid__inner");
    productsWrapper.innerHTML = "";
    productList.forEach((item) => {
      const product = new ProductCard(item);
      productsWrapper.append(product.elem);
    });
  };

  updateFilter = (filters) => {
    Object.assign(this.filters, filters);
    // make a copy of this.products
    let productList = this.products.slice(0);
    // call function in a row to make a final list of products
    productList = this.#nutsCheck(productList);
    productList = this.#veganCheck(productList);
    productList = this.#spicyCheck(productList);
    productList = this.#categoryCheck(productList);
    this.#renderProductList(productList); // call function to render a final created list of products
  };

  #nutsCheck = (productList) => {
    let tempArray = productList.filter((item) => {
       return this.filters.noNuts == true ? !item.nuts : true
    });
    return tempArray;
  };

  #veganCheck = (productList) => {
    return productList.filter((item) => {
      return this.filters.vegeterianOnly ? item.vegeterian : true;
    });
    
  };

  #spicyCheck = (productList) => {
    return productList.filter((item) => {
      return this.filters.maxSpiciness ? item.spiciness <= this.filters.maxSpiciness : true
    });
  };

  #categoryCheck = (productList) => {
    return productList.filter((item) => {
      return this.filters.category ? item.category == this.filters.category : true
    });
  };
}
