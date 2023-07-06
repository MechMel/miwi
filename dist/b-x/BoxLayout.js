"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeBoxLayout = exports.Align = exports._SpaceAlign = exports._FlexAlign = exports.defaultOverflowY = exports.defaultOverflowX = exports.Overflow = exports.Axis = void 0;
const BoxUtils_1 = require("./BoxUtils");
const BoxSize_1 = require("./BoxSize");
exports.Axis = {
    row: `row`,
    column: `column`,
    stack: `stack`,
};
exports.Overflow = {
    /** TODO: A css overflow of `visible` doesn't behave like we want it to. We
     * want it to behave like a spreadsheet, showing the overflow but not affecting
     * layout. However, a css overflow of visible instead affect the layout of
     * siblings and parents. We need to find a way to fix this. It would probabl
     * involve spawing a sub div to wrap the children in. */
    // visible: `visible`, // Maybe just call this "overflow"
    forceStretchParent: `forceStretchParent`,
    crop: `crop`,
    wrap: `wrap`,
    scroll: `scroll`,
};
exports.defaultOverflowX = exports.Overflow.forceStretchParent; // Overflow.crop;
exports.defaultOverflowY = exports.Overflow.forceStretchParent; // Overflow.crop; // This is because otherwise text gets cut off.
exports._FlexAlign = {
    start: `flex-start`,
    center: `safe center`,
    end: `flex-end`,
};
exports._SpaceAlign = {
    spaceBetween: `space-between`,
    spaceAround: `space-around`,
    spaceEvenly: `space-evenly`,
};
exports.Align = {
    ...exports._FlexAlign,
    ...exports._SpaceAlign,
    topLeft: {
        alignX: exports._FlexAlign.start,
        alignY: exports._FlexAlign.start,
    },
    topCenter: {
        alignX: exports._FlexAlign.center,
        alignY: exports._FlexAlign.start,
    },
    topRight: {
        alignX: exports._FlexAlign.end,
        alignY: exports._FlexAlign.start,
    },
    centerLeft: {
        alignX: exports._FlexAlign.start,
        alignY: exports._FlexAlign.center,
    },
    center: {
        alignX: exports._FlexAlign.center,
        alignY: exports._FlexAlign.center,
    },
    centerRight: {
        alignX: exports._FlexAlign.end,
        alignY: exports._FlexAlign.center,
    },
    bottomLeft: {
        alignX: exports._FlexAlign.start,
        alignY: exports._FlexAlign.end,
    },
    bottomCenter: {
        alignX: exports._FlexAlign.center,
        alignY: exports._FlexAlign.end,
    },
    bottomRight: {
        alignX: exports._FlexAlign.end,
        alignY: exports._FlexAlign.end,
    },
};
// Compute
function computeBoxLayout(sty, align, parent, axis, childCount) {
    // Pad
    const padTop = (0, BoxSize_1.sizeToCss)(sty.padTop ?? sty.padAroundY ?? sty.padAround ?? sty.pad ?? 0);
    const padRight = (0, BoxSize_1.sizeToCss)(sty.padRight ?? sty.padAroundX ?? sty.padAround ?? sty.pad ?? 0);
    const padBottom = (0, BoxSize_1.sizeToCss)(sty.padBottom ?? sty.padAroundY ?? sty.padAround ?? sty.pad ?? 0);
    const padLeft = (0, BoxSize_1.sizeToCss)(sty.padLeft ?? sty.padAroundX ?? sty.padAround ?? sty.pad ?? 0);
    const padBetweenRows = (0, BoxSize_1.sizeToCss)(sty.padBetweenRows ?? sty.padBetween ?? sty.pad ?? 0);
    const padBetweenColumns = (0, BoxSize_1.sizeToCss)(sty.padBetweenColumns ?? sty.padBetween ?? sty.pad ?? 0);
    // Align
    const alignX = (() => {
        let result = sty.alignX ??
            ((0, BoxUtils_1.isString)(align) ? align : align.alignX) ??
            exports._FlexAlign.center;
        if (result === exports._SpaceAlign.spaceBetween && childCount === 1) {
            result = exports._FlexAlign.center;
        }
        return result;
    })();
    const alignY = (() => {
        let result = sty.alignY ??
            ((0, BoxUtils_1.isString)(align) ? align : align.alignY) ??
            exports._FlexAlign.center;
        if (result === exports._SpaceAlign.spaceBetween && childCount === 1) {
            result = exports._FlexAlign.center;
        }
        return result;
    })();
    // Overflow
    const overflowX = sty.overflowX ?? exports.defaultOverflowX;
    const overflowY = sty.overflowY ?? exports.defaultOverflowY;
    return {
        position: parent?.props?.sty?.axis === exports.Axis.stack ? `absolute` : `relative`,
        // Pad
        // NOTE: Default could maybe be based off of font size.
        // NOTE: We might consider making padding and spacing cascade. I'm not sure if we want to, but it might reduce developer code.
        padding: `${padTop} ${padRight} ${padBottom} ${padLeft}`,
        rowGap: padBetweenRows,
        columnGap: padBetweenColumns,
        margin: 0,
        // Align: https://css-tricks.com/snippets/css/a-guide-to-flexbox/
        // I've decided that space-between with one child should center it, instead of putting it at the start like CSS does.
        justifyContent: axis === exports.Axis.column ? alignY : alignX,
        alignItems: axis === exports.Axis.column ? alignX : alignY,
        // Axis
        flexDirection: axis === exports.Axis.stack ? undefined : axis,
        // Overflow
        flexWrap: axis === exports.Axis.row
            ? overflowX === exports.Overflow.wrap
                ? `wrap`
                : undefined
            : overflowY === exports.Overflow.wrap
                ? `wrap`
                : undefined,
        overflowX: overflowX === exports.Overflow.scroll
            ? `auto` // Scroll when nesscary, and float above contents so we can make it invisible
            : overflowX === exports.Overflow.crop
                ? `hidden`
                : `visible`,
        overflowY: overflowY === exports.Overflow.scroll
            ? `auto` // Scroll when nesscary, and float above contents so we can make it invisible
            : overflowY === exports.Overflow.crop
                ? `hidden`
                : `visible`,
        // Scroll bar should be invisible
        scrollbarWidth: [overflowX, overflowY].includes(exports.Overflow.scroll)
            ? `thin`
            : undefined,
        scrollbarColor: [overflowX, overflowY].includes(exports.Overflow.scroll)
            ? `#e3e3e3 transparent`
            : undefined,
    };
}
exports.computeBoxLayout = computeBoxLayout;
