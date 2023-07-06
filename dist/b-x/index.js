"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Miwi_Box = void 0;
const BoxDecoration_1 = require("./BoxDecoration");
const BoxLayout_1 = require("./BoxLayout");
const BoxUtils_1 = require("./BoxUtils");
const BoxSize_1 = require("./BoxSize");
const BoxText_1 = require("./BoxText");
const BoxInteraction_1 = require("./BoxInteraction");
// Cutom Element
class Miwi_Box extends HTMLElement {
    _parentObserver;
    _parentAxis = `column`; // TODO: Add `stack` option. Probably needs to be a class or something of the sort.
    _parentPadTop = `0px`;
    _parentPadRight = `0px`;
    _parentPadBottom = `0px`;
    _parentPadLeft = `0px`;
    _selfObserver;
    _childrenObserver;
    _childCount = 0;
    _anyChildIsABoxWithAGrowingWidth = false;
    _anyChildIsABoxWithAGrowingHeight = false;
    static get observedAttributes() {
        return ["sty"];
    }
    _sty = {};
    get sty() {
        return this._sty;
    }
    set sty(value) {
        this._sty = value;
    }
    get _axis() {
        return this.sty.axis ?? BoxLayout_1.Axis.column;
    }
    computeParentStyle() {
        if ((0, BoxUtils_1.exists)(this.parentElement)) {
            const computedParentStyle = getComputedStyle(this.parentElement);
            if (this._parentAxis !== computedParentStyle.flexDirection) {
                this._parentAxis = computedParentStyle.flexDirection;
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
            if (!(child instanceof Miwi_Box))
                return false;
            const computedChildStyle = getComputedStyle(child);
            return this._axis === BoxLayout_1.Axis.row
                ? computedChildStyle.flexBasis !== "auto"
                : this._axis === BoxLayout_1.Axis.column
                    ? child.style.width === `100%`
                    : false;
        });
        if (this._anyChildIsABoxWithAGrowingWidth !== childWidthGrows) {
            this._anyChildIsABoxWithAGrowingWidth = childWidthGrows;
            this.updateStyle();
        }
        const childHeightGrows = childNodes.some((child) => {
            if (!(child instanceof Miwi_Box))
                return false;
            const computedChildStyle = getComputedStyle(child);
            return this._axis === BoxLayout_1.Axis.row
                ? child.style.height === `100%`
                : this._axis === BoxLayout_1.Axis.column
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
        const align = this.sty.align ?? BoxLayout_1.Align.center;
        const newStyle = {
            ...(0, BoxSize_1.computeBoxSize)(this.sty, this._anyChildIsABoxWithAGrowingWidth, this._anyChildIsABoxWithAGrowingHeight, this._parentAxis, this._parentPadTop, this._parentPadRight, this._parentPadBottom, this._parentPadLeft),
            ...(0, BoxLayout_1.computeBoxLayout)(this.sty, align, this._parentAxis, this._axis, this._childCount),
            ...(0, BoxDecoration_1.computeBoxDecoration)(this.sty),
            ...(0, BoxText_1.computeTextStyle)(this.sty, (0, BoxUtils_1.isString)(align) ? align : align.alignX, this.sty.overflowX ?? BoxLayout_1.defaultOverflowX),
            ...(0, BoxInteraction_1.computeBoxInteraction)(this.sty),
        };
        for (const key of Object.keys(newStyle)) {
            if (newStyle[key] !== this.style[key]) {
                this.style[key] = newStyle[key];
            }
        }
    }
    constructor() {
        super();
        this._parentObserver = new MutationObserver((mutationsList, observer) => {
            for (let mutation of mutationsList) {
                if (mutation.type === "attributes" &&
                    mutation.attributeName === "style") {
                    this.computeParentStyle();
                }
            }
        });
        this._childrenObserver = new MutationObserver((mutationsList, observer) => {
            for (let mutation of mutationsList) {
                if (mutation.type === "attributes" &&
                    mutation.attributeName === "style" &&
                    mutation.target instanceof Element) {
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
        if ((0, BoxUtils_1.exists)(this.parentElement)) {
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
exports.Miwi_Box = Miwi_Box;
customElements.define("b-x", Miwi_Box);
