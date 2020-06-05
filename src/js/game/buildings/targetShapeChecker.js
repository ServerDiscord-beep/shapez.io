import { globalConfig } from "../../core/config";
import { enumDirection, Vector } from "../../core/vector";
import { ItemAcceptorComponent, enumItemAcceptorItemFilter } from "../components/item_acceptor";
import { ItemEjectorComponent } from "../components/item_ejector";
import { enumItemProcessorTypes, ItemProcessorComponent } from "../components/item_processor";
import { TargetShapeCheckerComponent } from "../components/targetShapeChecker";
import { Entity } from "../entity";
import { MetaBuilding } from "../meta_building";
import { GameRoot } from "../root";
import { enumHubGoalRewards } from "../tutorial_goals";
import { T } from "../../translations";
import { formatItemsPerSecond } from "../../core/utils";

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
        return true;// root.hubGoals.isRewardUnlocked(enumHubGoalRewards.reward_sorter);
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
