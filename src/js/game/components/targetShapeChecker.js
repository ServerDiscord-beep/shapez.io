import { Component } from "../component";
import { types } from "../../savegame/serialization";
import { gItemRegistry } from "../../core/global_registries";
import { BaseItem } from "../base_item";
import { Vector, enumDirection } from "../../core/vector";
import { Math_PI, Math_sin, Math_cos } from "../../core/builtins";
import { globalConfig } from "../../core/config";

export class TargetShapeCheckerComponent extends Component {
    static getId() {
        return "TargetShapeChecker";
    }

    static getSchema() {
        return {
            filter: types.string,
            filterIndex: types.int,
            filterType: types.string,
            isfil: types.bool,
            storedItem: types.nullable(types.obj(gItemRegistry)),
        };
    }
    constructor({ filter = "unset", filterIndex = 0, filterType = "unset", isfil = false, storedItem = null }) {
        super();

        this.filter = filter;
        this.filterIndex = filterIndex;
        this.filterType = filterType;
        this.isfil = isfil;
        /**
         * Currently stored item
         * @type {BaseItem}
         */
        this.storedItem = storedItem;
    }

    duplicateWithoutContents() {
        return new TargetShapeCheckerComponent(this);
    }
}
