import { Loader } from "../../core/loader";
import { enumItemProcessorTypes } from "../components/item_processor";
import { ColorItem } from "../items/color_item";

export const allCustomBuildingData = {};

import {
    MetaTargetShapeCheckerBuilding,
    TargetShapeCheckerComponent,
    TargetShapeCheckerSystem,
    targetShapeCheckerProcess,
} from "./targetShapeChecker";

allCustomBuildingData.targetShapeChecker = {
    id: "targetShapeChecker",
    component: TargetShapeCheckerComponent,
    building: MetaTargetShapeCheckerBuilding,
    toolbar: true,
    system: TargetShapeCheckerSystem,
    sysOrder: 4.5,
    process: targetShapeCheckerProcess,
    speed: 1 / 1,
    draw: true,
    sprite: drawTSCSprite,
    // TODO: keybinding in KEYMAPPINGS
    // TODO: T
};

for (let b in allCustomBuildingData) {
    let data = allCustomBuildingData[b];
    if (data.process) {
        enumItemProcessorTypes[data.id] = data.id;
    }
}

export function getCustomBuildingSystemsNulled() {
    let r = {};
    for (let k in allCustomBuildingData) {
        let data = allCustomBuildingData[k];
        if (!data.system) {
            continue;
        }
        r[data.id] = null;
    }
    return r;
}

/**
 * @param {number} order
 */
export function internalInitSystemsAddAt(order, add) {
    let systems = Object.values(allCustomBuildingData).filter(data => {
        if (!data.system) return false;
        if (order <= 0) return data.sysOrder && data.sysOrder < order;
        if (order) return data.sysOrder && order <= data.sysOrder && data.sysOrder < order + 1;
        // NaN/undefined goes here
        return !data.sysOrder;
    });
    systems.sort((a, b) => a.sysOrder - b.sysOrder);
    for (let data of systems) {
        add(data.id, data.system);
    }
}

function makeLine(ctx, points) {
    let prev = points.shift();
    points.push(prev);
    ctx.beginPath();
    ctx.moveTo((prev[0] + points[0][0]) / 2, (prev[1] + points[0][1]) / 2);
    prev = points.shift();
    points.push(prev);
    for (let p of points) {
        // ctx.lineTo(p[0], p[1]);
        ctx.arcTo(prev[0], prev[1], (prev[0] + p[0]) / 2, (prev[1] + p[1]) / 2, prev[2] || 0.01);
        prev = p;
    }
    ctx.closePath();
}

/**
 * draws building base on 192m*192n cells context
 * @param {CanvasRenderingContext2D} ctx
 * @param {string} path
 */
function drawBaseLayer(ctx, path) {
    let p = new Path2D(path);
    ctx.save();
    // shadow:
    ctx.save();
    ctx.fillStyle = "#91949e";
    ctx.globalAlpha = 0.2;
    ctx.translate(6, 8);
    ctx.fill(p);
    ctx.restore();
    // base:
    ctx.fillStyle = "#dee1ea";
    ctx.strokeStyle = "#64666e";
    ctx.lineWidth = 6;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.miterLimit = 4;
    ctx.fill(p);
    ctx.stroke(p);
    ctx.restore();
}
/**
 * draws a color-filled path on 192m*192n cells context
 * @param {CanvasRenderingContext2D} ctx
 * @param {string} path
 */
function drawfillShape(ctx, path, color) {
    let p = new Path2D(path);
    ctx.save();
    // shadow:
    ctx.save();
    ctx.fillStyle = "#91949e";
    ctx.globalAlpha = 0.2;
    ctx.translate(6, 8);
    ctx.fill(p);
    ctx.restore();
    // base:
    ctx.fillStyle = color;
    ctx.strokeStyle = "#64666e";
    ctx.lineWidth = 10;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.miterLimit = 4;
    ctx.stroke(p);
    ctx.fill(p);
    ctx.restore();
}
function drawShape(ctx, path, color1, color2) {
    let p = new Path2D(path);
    ctx.save();
    // base:
    ctx.fillStyle = color1;
    ctx.strokeStyle = color2;
    ctx.lineWidth = 10;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.miterLimit = 4;
    ctx.stroke(p);
    ctx.fill(p);
    ctx.restore();
}

function drawTSCSprite({ canvas, context, w, h, smooth, mipmap, resolution }) {
    let d_base = "M 11,31 v 130 l 20,20 h 130 l 20,-20 v -130 l -20,-20 h -130 z";
    drawBaseLayer(context, d_base);
    let s = 12;
    let d2 = `M 175,40 l ${s},${s} -${s},${s} ${s},${s} -${s},${s} -${s},-${s} -${s},${s} -${s},-${s} ${s},-${s} -${s},-${s} ${s},-${s} ${s},${s} z`;
    drawfillShape(context, d2, "red");

    let g = 30;
    let d3 = `M 40,35 l ${g},-${g} ${g},${g} z`;
    drawfillShape(context, d3, "lightgreen");
}

function drawTSCSpriteBp({ canvas, context, canvas2, context2, w, h, smooth, mipmap, resolution }) {
    let d_base = "M 11,31 v 130 l 20,20 h 130 l 20,-20 v -130 l -20,-20 h -130 z";
    drawShape(context2, d_base, "#6CD1FF", "#56A7D8");
    let s = 12;
    let d2 = `M 172,40 l ${s},${s} -${s},${s} ${s},${s} -${s},${s} -${s},-${s} -${s},${s} -${s},-${s} ${s},-${s} -${s},-${s} ${s},-${s} ${s},${s} z`;
    drawShape(context2, d2, "#5EB7ED", "#56A7D8");

    let g = 30;
    let d3 = `M 40,35 l ${g},-${g} ${g},${g} z`;
    drawShape(context2, d3, "#5EB7ED", "#56A7D8");

    context.save();
    context.globalAlpha = 0x99 / 0xff;
    context.drawImage(canvas2, 0, 0);
    context.restore();
}

Loader.drawSprite("sprites/buildings/targetShapeChecker.png", drawTSCSprite, { w: 192, h: 192 });

Loader.drawSprite("sprites/blueprints/targetShapeChecker.png", drawTSCSpriteBp, { w: 192, h: 192 });
