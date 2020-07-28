import { supportedBuildings as toolbar } from "../hud/parts/buildings_toolbar";

import { enumItemProcessorTypes } from "../components/item_processor";

import { T } from "../../translations";

import { addSprite } from "./modSpriteDrawer";

export const allCustomBuildingData = [];
export const customBuildingData = {};

const localMods = require.context("./buildings", false, /.*\.js/i);
for (let key of localMods.keys()) {
    let v = localMods(key);
    allCustomBuildingData.push(v.default);
}

for (let custom of allCustomBuildingData) {
    customBuildingData[custom.id] = custom;

    if (!custom.variant) {
        custom.variant = "default";
    }

    if (custom.process) {
        enumItemProcessorTypes[custom.id] = custom.id;
    }

    if (!custom.Tname) {
        custom.Tname = custom.id;
    }
    if (!custom.Tdesc) {
        custom.Tdesc = "";
    }
    if (!T.buildings[custom.id]) {
        T.buildings[custom.id] = {};
    }
    T.buildings[custom.id][custom.variant] = {
        name: custom.Tname,
        description: custom.Tdesc,
    };

    if (!custom.speed) {
        custom.speed = 1;
    }
    if (!custom.speedClass) {
        custom.speedClass = "belt";
    }

    if (custom.meta && custom.toolbar == 1) {
        toolbar.push(custom.meta);
    }

    let data = custom;
    if (data.sprite) {
        (data.sprite[0] || data.sprite).sprite = `sprites/buildings/${data.id}${
            data.variant == "default" ? "" : "-" + data.variant
        }.png`;
        addSprite(data.sprite);
        (data.spriteBp[0] || data.spriteBp).sprite = `sprites/blueprints/${data.id}${
            data.variant == "default" ? "" : "-" + data.variant
        }.png`;
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
