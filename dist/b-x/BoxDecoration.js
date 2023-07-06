"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeBoxDecoration = exports.mdColors = void 0;
const BoxUtils_1 = require("./BoxUtils");
const BoxLayout_1 = require("./BoxLayout");
const BoxSize_1 = require("./BoxSize");
exports.mdColors = {
    white: `#ffffffff`,
    almostWhite: `#f9fafdff`,
    pink: `#e91e63ff`,
    red: `#f44336ff`,
    orange: `#ff9800ff`,
    yellow: `#ffea00ff`,
    dataplateyellow: "#f2b212",
    green: `#4caf50ff`,
    teal: `#009688ff`,
    blue: `#2196f3ff`,
    purple: `#9c27b0ff`,
    brown: `#795548ff`,
    grey: `#9e9e9eff`,
    black: `#000000ff`,
    transparent: `#ffffff00`,
    sameAsText: `currentColor`,
};
// We might be able to infer everything we need from these compute functions, which could make updates even easier to make. If we did this, then we'd want to use another function to generate these compute functions.
function computeBoxDecoration(sty) {
    const shadowDirection = (() => {
        const givenDirection = sty.shadowDirection ?? BoxLayout_1.Align.bottomRight;
        return {
            x: givenDirection.alignX === BoxLayout_1._FlexAlign.start
                ? -1
                : givenDirection.alignX === BoxLayout_1._FlexAlign.center
                    ? 0
                    : 1,
            y: givenDirection.alignY === BoxLayout_1._FlexAlign.start
                ? 1
                : givenDirection.alignY === BoxLayout_1._FlexAlign.center
                    ? 0
                    : -1,
        };
    })();
    return {
        // Box Style
        // background: sty.background,
        borderRadius: (0, BoxUtils_1.exists)(sty.cornerRadius)
            ? Array.isArray(sty.cornerRadius)
                ? sty.cornerRadius.map(BoxSize_1.sizeToCss).join(` `)
                : (0, BoxSize_1.sizeToCss)(sty.cornerRadius)
            : undefined,
        //border: `none`,
        outline: (0, BoxUtils_1.exists)(sty.outlineSize)
            ? `${(0, BoxSize_1.sizeToCss)(sty.outlineSize)} solid ${sty.outlineColor}`
            : undefined,
        outlineOffset: (0, BoxUtils_1.exists)(sty.outlineSize)
            ? `-${(0, BoxSize_1.sizeToCss)(sty.outlineSize)}`
            : undefined,
        backgroundColor: sty.background?.startsWith(`data:image`) ||
            sty.background?.startsWith(`/`)
            ? undefined
            : sty.background,
        backgroundImage: sty.background?.startsWith(`data:image`) ||
            sty.background?.startsWith(`/`)
            ? `url('${sty.background}')`
            : undefined,
        backgroundSize: `cover`,
        backgroundPosition: `center`,
        // Add background images
        boxShadow: (0, BoxUtils_1.exists)(sty.shadowSize)
            ? `${(0, BoxSize_1.sizeToCss)(0.09 * sty.shadowSize * shadowDirection.x)} ${(0, BoxSize_1.sizeToCss)(-0.09 * sty.shadowSize * shadowDirection.y)} ${(0, BoxSize_1.sizeToCss)(0.4 * sty.shadowSize)} 0 #00000045`
            : undefined,
        zIndex: sty.zIndex,
    };
}
exports.computeBoxDecoration = computeBoxDecoration;
