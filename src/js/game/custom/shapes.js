/** @enum {string} */
export const customShapes = [];

/**
 * @callback DrawShape
 * @param {Object} args
 */

/**
 * @typedef {Object} ShapeData
 * @property {string} id
 * @property {string} code
 * @property {boolean} [spawnable]
 * @property {string} [spawnColor]
 * @property {number} [maxQuarters]
 * @property {number} [minDistance]
 * @property {number} [minChance]
 * @property {number} [distChance]
 * @property {number} [maxChance]
 * @property {DrawShape|string} draw
 * @property {number} tier
 */

/**
 * @param {ShapeData} shapeData
 */
export function registerCustomShape(shapeData) {
    customShapes.push(shapeData);
}

let customDefaults = {
    spawnable: false,
    spawnColor: "uncolored",
    maxQuarters: 4,
    minDistance: 6,
    minChance: 4,
    distChance: 1 / 3,
    maxChance: 12,
    tier: 3,
};

registerCustomShape({
    id: "clover",
    code: "L",
    ...customDefaults,
    spawnColor: "green",
    draw({ dims, innerDims, layer, quad, context, color, begin }) {
        begin({ size: 1.3, path: true, zero: true });
        const inner = 0.5;
        const inner_center = 0.45;
        context.lineTo(0, inner);
        context.bezierCurveTo(0, 1, inner, 1, inner_center, inner_center);
        context.bezierCurveTo(1, inner, 1, 0, inner, 0);
    },
    tier: 3,
});

registerCustomShape({
    id: "star8",
    code: "T",
    ...customDefaults,
    draw({ dims, innerDims, layer, quad, context, color, begin }) {
        begin({ size: 1.22, path: true, zero: true });
        const inner = 0.5;
        context.lineTo(0, inner);
        context.lineTo(Math.sin(Math.PI / 8), Math.cos(Math.PI / 8));
        context.lineTo(inner * Math.sin(Math.PI / 4), inner * Math.cos(Math.PI / 4));
        context.lineTo(Math.sin((Math.PI * 3) / 8), Math.cos((Math.PI * 3) / 8));
        context.lineTo(inner, 0);
    },
    tier: 3,
});

registerCustomShape({
    id: "rhombus",
    code: "B",
    ...customDefaults,
    draw({ dims, innerDims, layer, quad, context, color, begin }) {
        begin({ size: 1.2, path: true, zero: true });
        const rad = 0.001;
        // with rounded borders
        context.arcTo(0, 1, 1, 0, rad);
        context.arcTo(1, 0, 0, 0, rad);
    },
    tier: 4,
});

registerCustomShape({
    id: "plus",
    code: "P",
    ...customDefaults,
    draw: "M 0 0 L 1.1 0 1.1 0.5 0.5 0.5 0.5 1.1 0 1.1 z",
    tier: 3,
});

registerCustomShape({
    id: "razor",
    code: "Z",
    ...customDefaults,
    draw({ dims, innerDims, layer, quad, context, color, begin }) {
        begin({ size: 1.1, path: true, zero: true });
        const inner = 0.5;
        context.lineTo(inner, 0);
        context.bezierCurveTo(inner, 0.3, 1, 0.3, 1, 0);
        context.bezierCurveTo(
            1,
            inner,
            inner * Math.SQRT2 * 0.9,
            inner * Math.SQRT2 * 0.9,
            inner * Math.SQRT1_2,
            inner * Math.SQRT1_2
        );
        context.rotate(Math.PI / 4);
        context.bezierCurveTo(inner, 0.3, 1, 0.3, 1, 0);
        context.bezierCurveTo(
            1,
            inner,
            inner * Math.SQRT2 * 0.9,
            inner * Math.SQRT2 * 0.9,
            inner * Math.SQRT1_2,
            inner * Math.SQRT1_2
        );
    },
    tier: 3,
});

registerCustomShape({
    id: "sun",
    code: "U",
    ...customDefaults,
    spawnColor: "yellow",
    draw({ dims, innerDims, layer, quad, context, color, begin }) {
        begin({ size: 1.3, path: true, zero: true });
        const PI = Math.PI;
        const PI3 = ((PI * 3) / 8) * 0.75;
        const c = 1 / Math.cos(Math.PI / 8);
        const b = c * Math.sin(Math.PI / 8);

        context.moveTo(0, 0);
        context.rotate(Math.PI / 2);
        context.arc(c, 0, b, -PI, -PI + PI3);
        context.rotate(-Math.PI / 4);
        context.arc(c, 0, b, -PI - PI3, -PI + PI3);
        context.rotate(-Math.PI / 4);
        context.arc(c, 0, b, PI - PI3, PI);
    },
    tier: 4,
});
