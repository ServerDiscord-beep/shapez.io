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
    // TODO: keybinding in KEYMAPPINGS
    // TODO: T
    // TODO: atlas
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
    ctx.arcTo(
      prev[0],
      prev[1],
      (prev[0] + p[0]) / 2,
      (prev[1] + p[1]) / 2,
      prev[2] || 0.01
    );
    prev = p;
  }
  ctx.closePath();
}

function drawWithShadow(ctx, points, bg, fg, sh, lw) {
  ctx.save();
  ctx.save();
  // ctx.translate(9, 11);
  ctx.translate(6, 7);
  makeLine(ctx, points);
  ctx.fillStyle = sh;
  ctx.fill();
  ctx.restore();
  makeLine(ctx, points);
  ctx.fillStyle = fg;
  ctx.strokeStyle = bg;
  ctx.lineWidth = lw;
  ctx.stroke();
  ctx.fill();
  ctx.restore();
}



function drawTSCSprite({ canvas, context, w, h, smooth, mipmap, resolution }){
	  var h1 = 20, h2 = 128 - 20, w1 = 10, w2 = 128 - 10;

  var points1 = [
    [h1, w1, 0],
    [h2, w1, 0],
    [h2, w2, 0],
    [h1, w2, 0],
  ];

  points1 = [[34,59,0],[76,59,0],[76,40,0],[68,40,0],[81,14,0],[94,40,0],[84,40,0],[84,58,0],[112,58,0],[119,65,0],[112,69,0],[112,84,0],[120,92,0],[112,98,0],[112,108,0],[73,108,0],[34,108,0],[25,108,0],[25,39,0],[14,39,0],[30,12,0],[45,39,0],[34,39,0]];


  drawWithShadow(context, points1, "black", "gray", "#aaaa0080", 4);
}


Loader.drawSprite("sprites/buildings/targetShapeChecker.png", drawTSCSprite, {});