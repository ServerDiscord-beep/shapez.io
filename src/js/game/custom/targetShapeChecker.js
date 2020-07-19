import { Component } from "../component";
import { types } from "../../savegame/serialization";
import { gItemRegistry } from "../../core/global_registries";
import { BaseItem } from "../base_item";
import { Vector, enumDirection } from "../../core/vector";
import { globalConfig } from "../../core/config";

import { ItemAcceptorComponent, enumItemAcceptorItemFilter } from "../components/item_acceptor";
import { ItemEjectorComponent } from "../components/item_ejector";
import { enumItemProcessorTypes, ItemProcessorComponent } from "../components/item_processor";
import { Entity } from "../entity";
import { MetaBuilding } from "../meta_building";
import { GameRoot } from "../root";
import { enumHubGoalRewards } from "../tutorial_goals";
import { T } from "../../translations";
import { formatItemsPerSecond } from "../../core/utils";

import { GameSystemWithFilter } from "../game_system_with_filter";
import { DrawParameters } from "../../core/draw_parameters";
import { formatBigNumber, lerp } from "../../core/utils";
import { Loader } from "../../core/loader";

import { ShapeItem } from "../items/shape_item";
import { ShapeDefinition } from "../shape_definition";

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
    constructor({
        filter = "unset",
        filterIndex = 0,
        filterType = "unset",
        isfil = false,
        storedItem = null,
    }) {
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

export class MetaTargetShapeCheckerBuilding extends MetaBuilding {
    constructor() {
        super("targetShapeChecker");
    }

    getDimensions() {
        return new Vector(1, 1);
    }

    getSilhouetteColor() {
        return "#ff6000";
    }

    /**
     * @param {GameRoot} root
     */
    getIsUnlocked(root) {
        return true; // root.hubGoals.isRewardUnlocked(enumHubGoalRewards.reward_sorter);
    }

    /**
     * @param {GameRoot} root
     * @param {string} variant
     * @returns {Array<[string, string]>}
     */
    getAdditionalStatistics(root, variant) {
        const speed = root.hubGoals.getProcessorBaseSpeed(enumItemProcessorTypes.targetShapeChecker);
        return [[T.ingame.buildingPlacement.infoTexts.speed, formatItemsPerSecond(speed)]];
    }

    /**
     * Creates the entity at the given location
     * @param {Entity} entity
     */
    setupEntityComponents(entity) {
        entity.addComponent(
            new ItemProcessorComponent({
                inputsPerCharge: 1,
                processorType: enumItemProcessorTypes.targetShapeChecker,
            })
        );
        entity.addComponent(new TargetShapeCheckerComponent({}));
        entity.addComponent(
            new ItemEjectorComponent({
                slots: [
                    {
                        pos: new Vector(0, 0),
                        direction: enumDirection.top,
                    },
                    {
                        pos: new Vector(0, 0),
                        direction: enumDirection.right,
                    },
                ],
            })
        );
        entity.addComponent(
            new ItemAcceptorComponent({
                slots: [
                    {
                        pos: new Vector(0, 0),
                        directions: [enumDirection.bottom],
                    },
                ],
            })
        );
    }
}

export class TargetShapeCheckerSystem extends GameSystemWithFilter {
    constructor(root) {
        super(root, [TargetShapeCheckerComponent]);

        this.storageOverlaySprite = Loader.getSprite("sprites/misc/storage_overlay.png");
    }

    update() {}

    draw(parameters) {
        this.forEachMatchingEntityOnScreen(parameters, this.drawEntity.bind(this));
    }

    /**
     * @param {DrawParameters} parameters
     * @param {Entity} entity
     */
    drawEntity(parameters, entity) {
        const context = parameters.context;
        const staticComp = entity.components.StaticMapEntity;

        if (!staticComp.shouldBeDrawn(parameters)) {
            return;
        }

        const tscComp = entity.components.TargetShapeChecker;
        const storedItem = tscComp.storedItem;
        const center = staticComp.getTileSpaceBounds().getCenter().toWorldSpace();
        if (storedItem !== null) {
            storedItem.draw(center.x, center.y, parameters, 30);
        }
        this.storageOverlaySprite.drawCached(parameters, center.x - 15, center.y + 15, 30, 15);

        context.font = "bold 10px GameFont";
        context.textAlign = "center";
        context.fillStyle = "#64666e";
        context.fillText(tscComp.filterType, center.x, center.y + 25.5);

        context.textAlign = "left";
    }
}

// returns trackProduction
export function targetShapeCheckerProcess({ items, trackProduction, entity, outItems, self }) {
    console.log("targetShapeChecker PROCESSES");

    const inputItem = /** @type {ShapeItem} */ (items[0].item);
    trackProduction = false;

    const tscComponent = entity.components.TargetShapeChecker;
    if (!tscComponent.isfil) {
        // setting filter type:
        let item = inputItem.definition.getHash();
        //shape:
        if (item.match(/([^-][^-]------|--[^-][^-]----|----[^-][^-]--|------[^-][^-])$/)) {
            let m = item.match(/([^-][^-])(--)*$/);
            tscComponent.filterType = "shape";
            tscComponent.filterIndex = m.index;
            tscComponent.filter = m[0].slice(0, 1);
            tscComponent.isfil = true;
            let layer = item.split(":").length;
            let index = (m.index % 9) / 2;
            let topKey = `${"--".repeat(index)}${tscComponent.filter}u${"--".repeat(3 - index)}`;
            let key = (topKey + ":").repeat(layer - 1) + topKey;
            tscComponent.storedItem = new ShapeItem(ShapeDefinition.fromShortKey(key));
        }
        // hole:
        else if (
            item.match(
                /(--[^-][^-][^-][^-][^-][^-]|[^-][^-]--[^-][^-][^-][^-]|[^-][^-][^-][^-]--[^-][^-]|[^-][^-][^-][^-][^-][^-]--)$/
            )
        ) {
            let m = item.match(/(--)([^-][^-])*$/);
            tscComponent.filterType = "hole";
            tscComponent.filterIndex = m.index;
            tscComponent.filter = m[0].slice(0, 1);
            tscComponent.isfil = true;
            let layer = item.split(":").length;
            let index = (m.index % 9) / 2;
            let topKey = `${"Cu".repeat(index)}--${"Cu".repeat(3 - index)}`;
            let key = (topKey + ":").repeat(layer - 1) + topKey;
            tscComponent.storedItem = new ShapeItem(ShapeDefinition.fromShortKey(key));
        }
        // color:
        else if (item.match(/(.[^u].u.u.u|.u.[^u].u.u|.u.u.[^u].u|.u.u.u.[^u])$/)) {
            let m = item.match(/([^u])(.u)*$/);
            tscComponent.filterType = "color";
            tscComponent.filterIndex = m.index;
            tscComponent.filter = m[0].slice(0, 1);
            tscComponent.isfil = true;
            let layer = item.split(":").length;
            let index = ((m.index % 9) - 1) / 2;
            let topKey = `${"--".repeat(index)}C${tscComponent.filter}${"--".repeat(3 - index)}`;
            let key = (topKey + ":").repeat(layer - 1) + topKey;
            tscComponent.storedItem = new ShapeItem(ShapeDefinition.fromShortKey(key));
        }
        // uncolored:
        else if (
            item.match(
                /(.u.[^u-].[^u-].[^u-]|.[^u-].u.[^u-].[^u-]|.[^u-].[^u-].u.[^u-]|.[^u-].[^u-].[^u-].u)$/
            )
        ) {
            let m = item.match(/(u)(.[^u])*$/);
            tscComponent.filterType = "uncolored";
            tscComponent.filterIndex = m.index;
            tscComponent.filter = m[0].slice(0, 1);
            tscComponent.isfil = true;
            let layer = item.split(":").length;
            let index = ((m.index % 9) - 1) / 2;
            let topKey = `${"--".repeat(index)}C${tscComponent.filter}${"--".repeat(3 - index)}`;
            let key = (topKey + ":").repeat(layer - 1) + topKey;
            tscComponent.storedItem = new ShapeItem(ShapeDefinition.fromShortKey(key));
        }
        outItems.push({
            item: inputItem,
            requiredSlot: 0,
        });
    }

    if (tscComponent.isfil) {
        let goal = self.root.hubGoals.currentGoal.definition.getHash();

        let matches = true;

        if (tscComponent.filterType == "color") {
            matches = goal[tscComponent.filterIndex] == tscComponent.filter;
        } else if (tscComponent.filterType == "uncolored") {
            matches =
                !goal[tscComponent.filterIndex] || goal[tscComponent.filterIndex] == tscComponent.filter;
        } else if (tscComponent.filterType == "shape") {
            matches = goal[tscComponent.filterIndex] == tscComponent.filter;
        } else if (tscComponent.filterType == "hole") {
            matches =
                !goal[tscComponent.filterIndex] || goal[tscComponent.filterIndex] == tscComponent.filter;
        }
        outItems.push({
            item: inputItem,
            requiredSlot: matches ? 0 : 1,
        });
    }

    return trackProduction;
}
