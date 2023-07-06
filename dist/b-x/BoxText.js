"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeTextStyle = exports.numToFontSize = void 0;
const BoxUtils_1 = require("./BoxUtils");
const BoxLayout_1 = require("./BoxLayout");
const BoxSize_1 = require("./BoxSize");
// const fontSizeToHtmlUnit = 0.9;
function numToFontSize(num) {
    // return sizeToCss(fontSizeToHtmlUnit * num);
    return (0, BoxSize_1.sizeToCss)(num); // * 1.3);
}
exports.numToFontSize = numToFontSize;
function computeTextStyle(sty, alignX, overflowX) {
    return {
        // Text Style
        fontFamily: `Roboto`,
        fontSize: (0, BoxUtils_1.isNum)(sty.scale) ? numToFontSize(sty.scale) : sty.scale,
        fontWeight: (0, BoxUtils_1.exists)(sty.textIsBold)
            ? sty.textIsBold
                ? `bold`
                : `normal`
            : undefined,
        fontStyle: (0, BoxUtils_1.exists)(sty.textIsItalic)
            ? sty.textIsItalic
                ? `italic`
                : `normal`
            : undefined,
        textDecoration: (0, BoxUtils_1.exists)(sty.textIsUnderlined)
            ? sty.textIsUnderlined
                ? `underline`
                : `none`
            : undefined,
        textAlign: alignX === BoxLayout_1._FlexAlign.start
            ? `left`
            : alignX === BoxLayout_1._FlexAlign.end
                ? `right`
                : // We assume for now that all other aligns cam be treated as center
                    `center`,
        lineHeight: sty.scale === undefined ? undefined : (0, BoxSize_1.sizeToCss)(sty.scale),
        whiteSpace: // whiteSapce casacdes, so we need to explicity set it.
        overflowX === BoxLayout_1.Overflow.crop || overflowX === BoxLayout_1.Overflow.forceStretchParent
            ? `nowrap`
            : `normal`,
        // textOverflow: sty.useEllipsisForOverflow ?? false ? `ellipsis` : undefined,
        color: sty.textColor,
    };
}
exports.computeTextStyle = computeTextStyle;
