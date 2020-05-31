import { GameSystemWithFilter } from "../game_system_with_filter";
import { StorageComponent } from "../components/storage";
import { Entity } from "../entity";
import { DrawParameters } from "../../core/draw_parameters";
import { formatBigNumber, lerp } from "../../core/utils";
import { Loader } from "../../core/loader";
import { UndergroundBeltSystem } from "./underground_belt.js";

export class CounterSystem extends UndergroundBeltSystem {
    constructor(root) {
        super(root);

        this.storageOverlaySprite = Loader.getSprite("sprites/misc/storage_overlay.png");
        this.targetAlpha = 1;
        this.overlayOpacity = 1;
    }

    update() {
        super.update();

        for (let i = 0; i < this.allEntities.length; ++i) {
            const entity = this.allEntities[i];

            const undergroundComp = entity.components.UndergroundBelt;

            let targetAlpha = undergroundComp.pendingItems.length > 0 ? 1 : 0;
            this.overlayOpacity = 1; // lerp(this.overlayOpacity, targetAlpha, 0.05);
        }
    }

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

        const storageComp = entity.components.Storage;
        const undergroundComp = entity.components.UndergroundBelt;

        // if (storedItem !== null) {
        context.globalAlpha = 1; // this.overlayOpacity;
        const center = staticComp.getTileSpaceBounds().getCenter().toWorldSpace();
        // storedItem.draw(center.x, center.y, parameters, 30);

        this.storageOverlaySprite.drawCached(parameters, center.x - 15, center.y + 15, 30, 15);

        context.font = "bold 10px GameFont";
        context.textAlign = "center";
        context.fillStyle = "#64666e";
        context.fillText(formatBigNumber(undergroundComp.pendingItems.length), center.x, center.y + 25.5);

        context.textAlign = "left";
        context.globalAlpha = 1;
        // }
    }
}
