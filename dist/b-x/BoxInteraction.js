"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeBoxInteraction = void 0;
function computeBoxInteraction(sty) {
    return {
        pointerEvents: sty.isInteractable === undefined
            ? undefined
            : sty.isInteractable
                ? `auto`
                : `none`,
    };
}
exports.computeBoxInteraction = computeBoxInteraction;
