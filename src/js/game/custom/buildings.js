import { enumItemProcessorTypes } from "../components/item_processor";
import { ColorItem } from "../items/color_item";
import { T } from "../../translations";
import { addSprite } from "./modSpriteDrawer"

export const allCustomBuildingData = {};

import {
    MetaTargetShapeCheckerBuilding,
    TargetShapeCheckerComponent,
    TargetShapeCheckerSystem,
    targetShapeCheckerProcess,
    tscSprite,
    tscSpriteBp,
    tscBuildingData,
} from "./targetShapeChecker";

import { MetaCounterBuilding, ItemCounterComponent, CounterSystem, counterProcess, counterBuildingData } from "./counter";

import { unstackerBuildingData } from "./unstacker";


allCustomBuildingData.targetShapeChecker = tscBuildingData;

allCustomBuildingData.counter = counterBuildingData;

allCustomBuildingData.unstacker = unstackerBuildingData;

// debugger;
for (let b in allCustomBuildingData) {
    let data = allCustomBuildingData[b];
    if (!data.variant) {
        data.variant = "default";
    }
    if (data.process) {
        enumItemProcessorTypes[data.id] = data.id;
    }
    if (data.Tname) {
        if (!T.buildings[data.id]) {
            T.buildings[data.id] = {};
        }
        T.buildings[data.id][data.variant] = {
            name: data.Tname,
            description: data.Tdesc || "",
        };
    }
    if (data.sprite) {
        (data.sprite[0] || data.sprite).sprite = `sprites/buildings/${ data.id }.png`;
        addSprite(data.sprite);
        (data.spriteBp[0] || data.spriteBp).sprite = `sprites/blueprints/${ data.id }.png`;
        data.spriteBp.transparent = true;
        addSprite(data.spriteBp);
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



import * as gameData from "./gameData";

export const modBuildingSupport = {
    gameData,
};

globalThis.modSupport = Object.assign(globalThis.modSupport || {}, modBuildingSupport);

