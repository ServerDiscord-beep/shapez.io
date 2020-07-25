import { types } from "../../savegame/serialization";
import { Component } from "../component";
import { BaseItem } from "../base_item";
import { gItemRegistry } from "../../core/global_registries";
import { GameTime } from "../time/game_time";

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
            tickHistory: types.array(types.float),
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

        /** @type {number[]} Array of times when item was taken. */
        this.tickHistory = Array(25).fill(0);

        /** @type {number} Calculated and set every second. This is a read only property. */
        this.averageItemsPerSecond = 0;

        /** @type {number} - Next time the averageItemsPerSecond property should be reset. */
        this.nextResetTime = 0;

        this.itemQueued = false;
    }

    calculateAverage(now) {

        const analyzedTime = 5;

        // fast quirk for fast speed
        if (now < this.tickHistory[24] + analyzedTime) {
            this.nextResetTime = this.tickHistory[24] + analyzedTime;
            return 24 / (this.tickHistory[0] - this.tickHistory[24]);
        }

        // 0 when sleep for a long time
        if (now > this.tickHistory[0] + analyzedTime) {
            this.nextResetTime = now + 60;
            return 0;
        }

        // find last item in analyzed interval
        let i = 24;
        for (i = 24; i > 0; --i) {
            if (now < this.tickHistory[i] + analyzedTime) {
                break;
            }
        }

        this.nextResetTime = this.tickHistory[i] + analyzedTime;

        if (i == 0) {
            return (now - this.tickHistory[0]);
        }

        return i / (this.tickHistory[0] - this.tickHistory[i]);
    }

    /**
     * Called on every counter entity .update() call
     * @param {GameTime} gameTime
     */
    tick(gameTime) {
        const now = gameTime.timeSeconds;

        if (!this.itemQueued && now < this.nextResetTime) {
            return;
        }

        if (this.itemQueued) {
            this.itemQueued = false;
            this.tickHistory.shift();
            this.tickHistory.push(now);
        }

        this.averageItemsPerSecond = this.calculateAverage(now);

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

        this.itemQueued = true;

        return true;
    }
}
