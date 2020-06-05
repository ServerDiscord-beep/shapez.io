import { GameSystemWithFilter } from "../game_system_with_filter";
import { TargetShapeCheckerComponent } from "../components/targetShapeChecker";
import { Entity } from "../entity";
import { DrawParameters } from "../../core/draw_parameters";
import { formatBigNumber, lerp } from "../../core/utils";
import { Loader } from "../../core/loader";

export class TargetShapeCheckerSystem extends GameSystemWithFilter {
    constructor(root) {
        super(root, [TargetShapeCheckerComponent]);

        this.storageOverlaySprite = Loader.getSprite("sprites/misc/storage_overlay.png");
    }

    update() {
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
