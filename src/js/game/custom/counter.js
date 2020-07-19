/** @typedef {object} TickCount
 * @property {number} gameTimeSeconds
 * @property {number} count
 */

import { types } from "../../savegame/serialization";
import { Component } from "../component";
import { BaseItem } from "../base_item";
import { gItemRegistry } from "../../core/global_registries";
import { GameTime } from "../time/game_time";

import { DrawParameters } from "../../core/draw_parameters";
import { Entity } from "../entity";
import { GameSystemWithFilter } from "../game_system_with_filter";
import { ShapeItem } from "../items/shape_item";
import { ColorItem } from "../items/color_item";

import { formatItemsPerSecond } from "../../core/utils";
import { enumDirection, Vector } from "../../core/vector";
import { T } from "../../translations";
import { ItemAcceptorComponent } from "../components/item_acceptor";
import { ItemEjectorComponent } from "../components/item_ejector";
import { MetaBuilding } from "../meta_building";
import { GameRoot } from "../root";
import { enumItemType } from "../base_item";




export class ItemCounterComponent extends Component {
    static getId() {
        return "Counter";
    }

    static getSchema() {
        return {
            inputSlots: types.array(
                types.structured({
                    item: types.obj(gItemRegistry),
                    sourceSlot: types.uint,
                })
            ),
        };
    }

    duplicateWithoutContents() {
        return new ItemCounterComponent();
    }

    constructor() {
        super();

        /**
         * Our current inputs
         * @type {Array<{ item: BaseItem, sourceSlot: number }>}
         */
        this.inputSlots = [];

        /** @type {number} a count of items that have passed through the component since the last tick */
        this.currentCount = 0;

        /**
         * Maintained every game tick, this aray contains the item counts for every tick in the past 1 second.
         * @type {TickCount[]}
         */
        this.tickHistory = [];

        /** @type {number} Calculated and set every second. This is a read only property. */
        this.averageItemsPerSecond = 0;

        /** @type {number} - Last time the averageItemsPerSecond property was reset. */
        this.lastResetTime = 0;
    }

    /**
     * Called every time an item leaves the counter building
     */
    countNewItem() {
        this.currentCount++;
    }

    /**
     * Called on every counter entity .update() call
     * @param {GameTime} gameTime
     */
    tick(gameTime) {
        const count = this.currentCount;
        // Reset the count
        this.currentCount = 0;

        this.tickHistory.push({
            gameTimeSeconds: gameTime.timeSeconds,
            count: count,
        });

        // Only keep history for the last second.
        // TODO: Possible optimisation to replace with a for loop. Unsure if the logic within the loop will
        // counteract any speed gained by not using .filter
        this.tickHistory = this.tickHistory.filter(tick => gameTime.timeSeconds - tick.gameTimeSeconds <= 1);

        const delta = gameTime.timeSeconds - this.lastResetTime;
        if (delta > 1) {
            const sum = this.tickHistory.reduce((a, b) => a + b.count, 0);
            this.averageItemsPerSecond = sum;
            this.lastResetTime = gameTime.timeSeconds;
        }
    }

    /**
     * Tries to take the item
     * @param {BaseItem} item
     * @param {number} sourceSlot
     */
    tryTakeItem(item, sourceSlot) {
        // Check that we only take one item per slot
        for (let i = 0; i < this.inputSlots.length; ++i) {
            const slot = this.inputSlots[i];
            if (slot.sourceSlot === sourceSlot) {
                return false;
            }
        }

        this.inputSlots.push({ item, sourceSlot });
        return true;
    }
}




export class CounterSystem extends GameSystemWithFilter {
    constructor(root) {
        super(root, [ItemCounterComponent]);
    }

    update() {
        for (let i = 0; i < this.allEntities.length; ++i) {
            const entity = this.allEntities[i];
            const counterComp = entity.components.Counter;
            const ejectorComp = entity.components.ItemEjector;

            const items = counterComp.inputSlots;

            let outItem = null;

            if (items.length > 0) {
                const inputItem = /** @type {ShapeItem|ColorItem} */ (items[0].item);

                outItem = inputItem;
                let slot = ejectorComp.getFirstFreeSlot(entity.layer);

                if (slot !== null) {
                    if (!ejectorComp.tryEject(slot, outItem)) {
                        assert(false, "Failed to eject");
                    } else {
                        counterComp.countNewItem();
                        counterComp.inputSlots = [];
                    }
                }
            }

            counterComp.tick(this.root.time);
        }
    }

    // Only render the items/s overlay if the entity is on screen
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

        const counterComp = entity.components.Counter;

        context.globalAlpha = 1;
        const center = staticComp.getTileSpaceBounds().getCenter().toWorldSpace();

        context.font = "bold 8.5px GameFont";
        context.textAlign = "center";
        context.fillStyle = "#64666e";
        context.fillText(counterComp.averageItemsPerSecond.toString(), center.x, center.y + 3);

        context.textAlign = "left";
        context.globalAlpha = 1;
    }
}



export class MetaCounterBuilding extends MetaBuilding {
    constructor() {
        super("counter");
    }

    /**
     * @returns {string} Colour used to represent this building when zoomed out.
     */
    getSilhouetteColor() {
        return "#444e81"; // Dark Blue
    }

    /**
     * @param {GameRoot} root
     * @param {string} variant
     * @returns {Array<[string, string]>}
     */
    getAdditionalStatistics(root, variant) {
        const speed = root.hubGoals.getBeltBaseSpeed("regular");
        return [[T.ingame.buildingPlacement.infoTexts.speed, formatItemsPerSecond(speed)]];
    }

    /**
     * The counter is unlocked once the belt speed reaches 20 (items/s). This is around the time when items on
     * a belt begin to blurr. It is also late enough in the game that a player would understand and appreciate
     * this building.
     * @param {GameRoot} root
     */
    getIsUnlocked(root) {
        const beltSpeed = root.hubGoals.getBeltBaseSpeed("regular");
        return beltSpeed >= 20;
    }

    /**
     * Creates the entity at the given location
     * @param {Entity} entity
     */
    setupEntityComponents(entity) {
        entity.addComponent(new ItemCounterComponent());

        entity.addComponent(
            new ItemEjectorComponent({
                slots: [{ pos: new Vector(0, 0), direction: enumDirection.top }],
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



