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
  private _parentObserver: MutationObserver;
  private _parentAxis: `row` | `column` = `column`; // TODO: Add `stack` option. Probably needs to be a class or something of the sort.
  private _parentPadTop: string = `0px`;
  private _parentPadRight: string = `0px`;
  private _parentPadBottom: string = `0px`;
  private _parentPadLeft: string = `0px`;
  private _selfObserver: MutationObserver;
  private _childrenObserver: MutationObserver;
  private _childCount: number = 0;
  private _anyChildIsABoxWithAGrowingWidth: boolean = false;
  private _anyChildIsABoxWithAGrowingHeight: boolean = false;

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
      if (this._parentAxis !== computedParentStyle.flexDirection) {
        this._parentAxis = computedParentStyle.flexDirection as
          | `row`
          | `column`;
        this.updateStyle();
      }
      if (this._parentPadTop !== computedParentStyle.paddingTop) {
        this._parentPadTop = computedParentStyle.paddingTop;
        this.updateStyle();
      }
      if (this._parentPadRight !== computedParentStyle.paddingRight) {
        this._parentPadRight = computedParentStyle.paddingRight;
        this.updateStyle();
      }
      if (this._parentPadBottom !== computedParentStyle.paddingBottom) {
        this._parentPadBottom = computedParentStyle.paddingBottom;
        this.updateStyle();
      }
      if (this._parentPadLeft !== computedParentStyle.paddingLeft) {
        this._parentPadLeft = computedParentStyle.paddingLeft;
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
    if (this._anyChildIsABoxWithAGrowingWidth !== childWidthGrows) {
      this._anyChildIsABoxWithAGrowingWidth = childWidthGrows;
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
    if (this._anyChildIsABoxWithAGrowingHeight !== childHeightGrows) {
      console.log(`We got this far at least once.`);
      this._anyChildIsABoxWithAGrowingHeight = childHeightGrows;
      this.updateStyle();
    }
  }

  updateChildList() {
    this._childrenObserver.disconnect();
    const childNodes = Array.from(this.childNodes);
    if (this._childCount !== childNodes.length) {
      this._childCount = childNodes.length;
      this.updateStyle();
    }
    this.updateChildSizeGrows();
    for (let i = 0; i < childNodes.length; i++) {
      const childNode = childNodes[i];
      this._childrenObserver.observe(childNode, { attributes: true });
    }
  }

  updateStyle() {
    const align = this.sty.align ?? Align.center;

    const newStyle = {
      ...computeBoxSize(
        this.sty,
        this._anyChildIsABoxWithAGrowingWidth,
        this._anyChildIsABoxWithAGrowingHeight,
        this._parentAxis,
        this._parentPadTop,
        this._parentPadRight,
        this._parentPadBottom,
        this._parentPadLeft,
      ),
      ...computeBoxLayout(
        this.sty,
        align,
        this._parentAxis,
        this._axis,
        this._childCount,
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
    this._parentObserver = new MutationObserver((mutationsList, observer) => {
      for (let mutation of mutationsList) {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "style"
        ) {
          this.computeParentStyle();
        }
      }
    });

    this._childrenObserver = new MutationObserver((mutationsList, observer) => {
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

    this._selfObserver = new MutationObserver((mutationsList, observer) => {
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

    this._selfObserver.observe(this, { childList: true });

    if (exists(this.parentElement)) {
      this._parentObserver.observe(this.parentElement, { attributes: true });
    }
  }

  disconnectedCallback() {
    this._parentObserver.disconnect();
    this._selfObserver.disconnect();
    this._childrenObserver.disconnect();
    this._childCount = 0;
  }
}
customElements.define("b-x", Miwi_Box);
