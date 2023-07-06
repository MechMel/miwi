"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeBoxSize = exports.computeSizeInfo = exports.isFlexSize = exports.sizeToCss = exports.muToRem = void 0;
const BoxUtils_1 = require("./BoxUtils");
const BoxLayout_1 = require("./BoxLayout");
// scale: [positive-space, negative-space]
// const muToRem = 1.125; //1.0625;
exports.muToRem = 1.125; //1.0625;
function sizeToCss(num) {
    if ((0, BoxUtils_1.isNum)(num)) {
        const remValue = num * exports.muToRem;
        const fontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
        const pixelValue = remValue * fontSize;
        return `${Math.round(pixelValue)}px`;
    }
    else {
        return num;
    }
}
exports.sizeToCss = sizeToCss;
function isFlexSize(size) {
    return (0, BoxUtils_1.exists)(size?.flex);
}
exports.isFlexSize = isFlexSize;
function computeSizeInfo({ size, isMainAxis, overflow, }) {
    const isShrink = size === -1;
    const sizeIsFlex = isFlexSize(size);
    const exactSize = !isMainAxis && sizeIsFlex
        ? `100%`
        : (0, BoxUtils_1.isString)(size)
            ? size
            : !isShrink && !sizeIsFlex
                ? sizeToCss(size)
                : sizeIsFlex
                    ? undefined
                    : //: `fit-content`;
                        `fit-content`; // This use to be auto, but that was allowing text to be cut off, so I'm trying fit-content again. I'm guessing I swapped to auto because fit-content was causing the parent to grow to fit the child even when we didnt' want it to. It seems to be working now, so I'm going to try it this way for a  bit.
    const minSize = sizeIsFlex
        ? size.min === Infinity
            ? exactSize
            : sizeToCss(size.min)
        : exactSize;
    // TODO: If your parent's overflow is `hidden`, then max size should be `100%`
    const maxSize = sizeIsFlex
        ? size.max === Infinity
            ? undefined // ?? `100%` // I turned (maxSize: 100%) off because a 100% caps the element at the height of its parent which doesn't work if the parent scrolls its content
            : sizeToCss(size.max)
        : exactSize;
    return [exactSize, minSize, maxSize, sizeIsFlex];
}
exports.computeSizeInfo = computeSizeInfo;
function computeBoxSize(sty, childWidthGrows, childHeightGrows, parentAxis, parentPadTop, parentPadRight, parentPadBottom, parentPadLeft) {
    let width = (sty.width ?? -1) === -1 ? (childWidthGrows ? `1f` : -1) : sty.width ?? -1;
    if ((0, BoxUtils_1.isString)(width) && width.endsWith(`f`)) {
        width = {
            flex: parseFloat(width.split(`f`)[0]),
            min: -1,
            max: Infinity,
        }; // satisfies FlexSize;
    }
    const [exactWidth, wMin, wMax, widthGrows] = computeSizeInfo({
        size: width,
        isMainAxis: parentAxis === BoxLayout_1.Axis.row,
        overflow: sty.overflowX ?? BoxLayout_1.defaultOverflowX,
    });
    let height = (sty.height ?? -1) === -1
        ? childHeightGrows
            ? `1f`
            : -1
        : sty.height ?? -1;
    if ((0, BoxUtils_1.isString)(height) && height.endsWith(`f`)) {
        height = {
            flex: parseFloat(height.split(`f`)[0]),
            min: -1,
            max: Infinity,
        }; // satisfies FlexSize;
    }
    const [exactHeight, hMin, hMax, heightGrows] = computeSizeInfo({
        size: height,
        isMainAxis: parentAxis === BoxLayout_1.Axis.column,
        overflow: sty.overflowY ?? BoxLayout_1.defaultOverflowY,
    });
    return {
        // Sizing
        display: `flex`,
        boxSizing: `border-box`,
        // Using minWidth and maxWidth tells css to not override the size of this element
        width: (() => {
            let size = exactWidth;
            // axis === Axis.stack && width === -1
            //   ? maxChildWidth
            //   : exactWidth;
            if (parent?.sty?.axis === BoxLayout_1.Axis.stack) {
                size = `calc(${size} - ${parentPadLeft ?? `0px`} - ${parentPadRight ?? `0px`})`;
            }
            return size;
        })(),
        minWidth: (() => {
            let size = wMin;
            // axis === Axis.stack && width === -1
            //   ? maxChildWidth
            //   : wMin;
            if (parent?.sty?.axis === BoxLayout_1.Axis.stack) {
                size = `calc(${size} - ${parentPadLeft ?? `0px`} - ${parentPadRight ?? `0px`})`;
            }
            return size;
        })(),
        maxWidth: (() => {
            let size = wMax;
            // axis === Axis.stack && width === -1
            //   ? maxChildWidth
            //   : wMax;
            if (parent?.sty?.axis === BoxLayout_1.Axis.stack) {
                size = `calc(${size} - ${parentPadLeft ?? `0px`} - ${parentPadRight ?? `0px`})`;
            }
            return size;
        })(),
        height: (() => {
            let size = exactHeight;
            // axis === Axis.stack && height === -1
            //   ? maxChildHeight
            //   : exactHeight;
            if (parent?.sty?.axis === BoxLayout_1.Axis.stack) {
                size = `calc(${size} - ${parentPadTop ?? `0px`} - ${parentPadBottom ?? `0px`})`;
            }
            return size;
        })(),
        minHeight: (() => {
            let size = hMin;
            // axis === Axis.stack && height === -1
            //   ? maxChildHeight
            //   : hMin;
            if (parent?.sty?.axis === BoxLayout_1.Axis.stack) {
                size = `calc(${size} - ${parentPadTop ?? `0px`} - ${parentPadBottom ?? `0px`})`;
            }
            return size;
        })(),
        maxHeight: (() => {
            let size = hMax;
            // axis === Axis.stack && height === -1
            //   ? maxChildHeight
            //   : hMax;
            if (parent?.sty?.axis === BoxLayout_1.Axis.stack) {
                size = `calc(${size} - ${parentPadTop ?? `0px`} - ${parentPadBottom ?? `0px`})`;
            }
            return size;
        })(),
        flexBasis: parentAxis === BoxLayout_1.Axis.column
            ? isFlexSize(height)
                ? `${height.flex * 100}%`
                : heightGrows
                    ? `100%`
                    : undefined
            : parentAxis === BoxLayout_1.Axis.row
                ? isFlexSize(width)
                    ? `${width.flex * 100}%`
                    : widthGrows
                        ? `100%`
                        : undefined
                : undefined,
        // flexBasis:
        //   parentAxis === Axis.column
        //     ? isFlexSize(height)
        //       ? `calc(${height.flex * 100}% - (4 * ${cssPadding ?? `0px`}))`
        //       : heightGrows
        //         ? `calc(100% - (4 * ${cssPadding ?? `0px`}))`
        //         : undefined
        //     : parentAxis === Axis.row
        //       ? isFlexSize(width)
        //         ? `calc(${width.flex * 100}% - (4 * ${cssPadding ?? `0px`}))`
        //         : widthGrows
        //           ? `calc(100% - (4 * ${cssPadding ?? `0px`}))`
        //           : undefined
        //       : undefined,
    };
}
exports.computeBoxSize = computeBoxSize;
