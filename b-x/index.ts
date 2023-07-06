import { DecorationSty, computeBoxDecoration } from "./BoxDecoration";
import {
  Axis,
  defaultOverflowX,
  Align,
  computeBoxLayout,
  LayoutSty,
} from "./BoxLayout";
import { exists, isString } from "./BoxUtils";
import { SizeSty, computeBoxSize, sizeToCss } from "./BoxSize";
import { TextSty, computeTextStyle } from "./BoxText";
import { InteractionSty, computeBoxInteraction } from "./BoxInteraction";

export type _Sty = SizeSty &
  DecorationSty &
  LayoutSty &
  TextSty &
  InteractionSty;
export type Sty = Partial<_Sty>;

// Cutom Element
export class Miwi_Box extends HTMLElement {
  parentObserver: MutationObserver;
  parentAxis: `row` | `column` = `column`; // TODO: Add `stack` option. Probably needs to be a class or something of the sort.
  parentPadTop: string = `0px`;
  parentPadRight: string = `0px`;
  parentPadBottom: string = `0px`;
  parentPadLeft: string = `0px`;
  selfObserver: MutationObserver;
  childrenObserver: MutationObserver;
  childCount: number = 0;
  anyChildIsABoxWithAGrowingWidth: boolean = false;
  anyChildIsABoxWithAGrowingHeight: boolean = false;

  static get observedAttributes() {
    return ["sty"];
  }
  private _sty: Sty = {};
  get sty() {
    return this._sty;
  }
  set sty(value) {
    this._sty = value;
  }

  private get _axis() {
    return this.sty.axis ?? Axis.column;
  }

  computeParentStyle() {
    if (exists(this.parentElement)) {
      const computedParentStyle = getComputedStyle(this.parentElement);
      if (this.parentAxis !== computedParentStyle.flexDirection) {
        this.parentAxis = computedParentStyle.flexDirection as `row` | `column`;
        this.updateStyle();
      }
      if (this.parentPadTop !== computedParentStyle.paddingTop) {
        this.parentPadTop = computedParentStyle.paddingTop;
        this.updateStyle();
      }
      if (this.parentPadRight !== computedParentStyle.paddingRight) {
        this.parentPadRight = computedParentStyle.paddingRight;
        this.updateStyle();
      }
      if (this.parentPadBottom !== computedParentStyle.paddingBottom) {
        this.parentPadBottom = computedParentStyle.paddingBottom;
        this.updateStyle();
      }
      if (this.parentPadLeft !== computedParentStyle.paddingLeft) {
        this.parentPadLeft = computedParentStyle.paddingLeft;
        this.updateStyle();
      }
    }
  }

  updateChildSizeGrows() {
    const childNodes = Array.from(this.childNodes);
    const childWidthGrows = childNodes.some((child) => {
      if (!(child instanceof Miwi_Box)) return false;
      const computedChildStyle = getComputedStyle(child);
      return this._axis === Axis.row
        ? computedChildStyle.flexBasis !== "auto"
        : this._axis === Axis.column
        ? child.style.width === `100%`
        : false;
    });
    if (this.anyChildIsABoxWithAGrowingWidth !== childWidthGrows) {
      this.anyChildIsABoxWithAGrowingWidth = childWidthGrows;
      this.updateStyle();
    }
    const childHeightGrows = childNodes.some((child) => {
      if (!(child instanceof Miwi_Box)) return false;
      const computedChildStyle = getComputedStyle(child);
      return this._axis === Axis.row
        ? child.style.height === `100%`
        : this._axis === Axis.column
        ? computedChildStyle.flexBasis !== "auto"
        : false;
    });
    if (this.anyChildIsABoxWithAGrowingHeight !== childHeightGrows) {
      console.log(`We got this far at least once.`);
      this.anyChildIsABoxWithAGrowingHeight = childHeightGrows;
      this.updateStyle();
    }
  }

  updateChildList() {
    this.childrenObserver.disconnect();
    // this.childIndexMap.clear();
    const childNodes = Array.from(this.childNodes);
    if (this.childCount !== childNodes.length) {
      this.childCount = childNodes.length;
      this.updateStyle();
    }
    this.updateChildSizeGrows();
    for (let i = 0; i < childNodes.length; i++) {
      const childNode = childNodes[i];
      this.childrenObserver.observe(childNode, { attributes: true });
    }
  }

  updateStyle() {
    const align = this.sty.align ?? Align.center;

    const newStyle = {
      ...computeBoxSize(
        this.sty,
        this.anyChildIsABoxWithAGrowingWidth,
        this.anyChildIsABoxWithAGrowingHeight,
        this.parentAxis,
        this.parentPadTop,
        this.parentPadRight,
        this.parentPadBottom,
        this.parentPadLeft,
      ),
      ...computeBoxLayout(
        this.sty,
        align,
        this.parentAxis,
        this._axis,
        this.childCount,
      ),
      ...computeBoxDecoration(this.sty),
      ...computeTextStyle(
        this.sty,
        isString(align) ? align : align.alignX,
        this.sty.overflowX ?? defaultOverflowX,
      ),
      ...computeBoxInteraction(this.sty),
    };

    for (const key of Object.keys(newStyle)) {
      if (newStyle[key] !== this.style[key as keyof CSSStyleDeclaration]) {
        (this.style as any)[key] = newStyle[key];
      }
    }
  }

  constructor() {
    super();
    this.parentObserver = new MutationObserver((mutationsList, observer) => {
      for (let mutation of mutationsList) {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "style"
        ) {
          this.computeParentStyle();
        }
      }
    });

    this.childrenObserver = new MutationObserver((mutationsList, observer) => {
      for (let mutation of mutationsList) {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "style" &&
          mutation.target instanceof Element
        ) {
          this.updateChildSizeGrows();
        }
      }
    });

    this.selfObserver = new MutationObserver((mutationsList, observer) => {
      for (let mutation of mutationsList) {
        if (mutation.type === "childList") {
          this.updateChildList();
        }
      }
    });
  }

  connectedCallback() {
    this.computeParentStyle();
    this.updateChildList();
    this.updateStyle();

    this.selfObserver.observe(this, { childList: true });

    if (exists(this.parentElement)) {
      this.parentObserver.observe(this.parentElement, { attributes: true });
    }
  }

  disconnectedCallback() {
    this.parentObserver.disconnect();
    this.selfObserver.disconnect();
    this.childrenObserver.disconnect();
    this.childCount = 0;
  }
}
customElements.define("b-x", Miwi_Box);
