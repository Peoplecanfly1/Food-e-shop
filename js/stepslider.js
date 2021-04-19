import createElement from "../assets/lib/create-element.js";

export default class StepSlider {
  #steps = null;
  #selectorPosition = null;
  constructor({ steps, value = 0 }) {
    this.#steps = steps;
    this.#selectorPosition = value;
    this.elem = createElement(this.#getTemplate());
    this.#changeSliderStatus();
    this.#onElemClick();
    this.#onPointerDown();
  }

  #getTemplate() {
    return `<div class="slider">

    <!--Ползунок слайдера с активным значением-->
    <div class="slider__thumb" style="left: 50%;">
      <span class="slider__value">${this.#selectorPosition}</span>
    </div>

    <!--Заполненная часть слайдера-->
    <div class="slider__progress" style="width: 50%;"></div>

    <!--Шаги слайдера-->
    <div class="slider__steps">
      ${this.#stepQty(this.#steps)}
    </div>
  </div>`;
  }

  getPosition() {
    return this.#selectorPosition;
  }

  #stepQty(steps) {
    const span = "<span></span>";
    return span.repeat(steps);
  }

  #setSpansStyle = () => {
    const spanList = this.elem.querySelector(".slider__steps").children;
    [...spanList].forEach((item, id) => {
      if (id === this.#selectorPosition) {
        item.classList.add("slider__step-active");
      } else {
        item.classList.remove("slider__step-active");
      }
    });
  };

  #changeSliderStatus() {
    // Меняем стили на спанах
    this.#setSpansStyle();
    const segments = this.#steps - 1;
    // Уровень % куда надо двигать стили
    const progressStyle = (this.#selectorPosition * 100) / segments;
    // присваивание стилей бару
    const sliderBar = this.elem.querySelector(".slider__progress");
    sliderBar.style.width = progressStyle + "%";
    //  присваивание стилей thumb
    const sliderThumb = this.elem.querySelector(".slider__thumb");
    sliderThumb.style.left = progressStyle + "%";
    //  Вставляем число под переключатель
    const sliderValue = this.elem.querySelector(".slider__value");
    sliderValue.innerText = this.#selectorPosition;
    this.elem.classList.remove("slider_dragging");
  }

  #onElemClick = () => {
    this.elem.addEventListener("click", this.#defineNewPosition);
  };

  #onPointerDown = () => {
    let thumb = this.elem.querySelector(".slider__thumb");
    thumb.ondragstart = () => false;

    thumb.addEventListener("pointerdown", () => {
      document.addEventListener("pointermove", this.#onPointerMove);

      document.addEventListener("pointerup", this.#onPointerUp, { once: true });
    });
  };

  #onPointerMove = (event) => {
    this.elem.classList.add("slider_dragging");
    let left = event.clientX - this.elem.getBoundingClientRect().left;
    let leftRelative = left / this.elem.offsetWidth;

    if (leftRelative < 0) {
      leftRelative = 0;
    } else if (leftRelative > 1) {
      leftRelative = 1;
    }
    let progressStyle = leftRelative * 100;
    let segments = this.#steps - 1;

    //  присваивание стилей slider
    const sliderBar = this.elem.querySelector(".slider__progress");
    sliderBar.style.width = progressStyle + "%";
    //  присваивание стилей thumb
    const sliderThumb = this.elem.querySelector(".slider__thumb");
    sliderThumb.style.left = progressStyle + "%";

    const sliderValue = this.elem.querySelector(".slider__value");
    sliderValue.innerText = Math.round(leftRelative * segments);
    this.#selectorPosition = Math.round(leftRelative * segments);
  };

  #onPointerUp = () => {
    this.#defineNewPosition(event);
    this.#dispatchEventData();
    document.removeEventListener("pointermove", this.#onPointerMove, {
      once: true,
    });
  };

  #defineNewPosition = (event) => {
    const leftPos = event.clientX - this.elem.getBoundingClientRect().left;
    let relativePos = leftPos / this.elem.offsetWidth;

    if (relativePos < 0) {
      relativePos = 0;
    } else if (relativePos > 1) {
      relativePos = 1;
    }

    const segments = this.#steps - 1;
    const segmentPos = relativePos * segments;
    this.#selectorPosition = Math.round(segmentPos);
    this.#changeSliderStatus();
    this.#dispatchEventData();
  };

  #dispatchEventData = () => {
    this.elem.dispatchEvent(
      new CustomEvent("slider-change", {
        detail: this.#selectorPosition,
        bubbles: true,
      })
    );
  };
}
