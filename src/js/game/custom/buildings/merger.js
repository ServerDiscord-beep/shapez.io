;k;l
import { MetaBuilding,
	enumDirection,
	enumItemProcessorTypes,
	T,
	ItemProcessorComponent,
	ItemEjectorComponent,
	ItemAcceptorComponent,
	Vector,
	formatItemsPerSecond,
	ShapeItem,
	ShapeDefinition,
} from "../gameData";


const id = "merger";
const color = "blue";



export class MetaMergerBuilding extends MetaBuilding {
    constructor() {
        super(id);
    }

    getDimensions() {
        return new Vector(2, 2);
    }

    getSilhouetteColor() {
        return color;
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
        const speed = root.hubGoals.getProcessorBaseSpeed(id);
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
                processorType: id,
            })
        );
        entity.addComponent(
            new ItemEjectorComponent({
                slots: [
                    {
                        pos: new Vector(0, 0),
                        direction: enumDirection.top,
                    },
                ],
            })
        );
        entity.addComponent(
            new ItemAcceptorComponent({
                slots: [
                    {
                        pos: new Vector(0, 1),
                        directions: [enumDirection.bottom],
                        filter: enumItemType.shape,
                    },
                    {
                        pos: new Vector(1, 1),
                        directions: [enumDirection.bottom],
                        filter: enumItemType.shape,
                    },
                ],
            })
        );
    }
}




// returns trackProduction
export function UnstackerProcess({ items, trackProduction, entity, outItems, self }) {
    console.log("Unstacker PROCESSES");

    const inputItem = items[0].item;
    trackProduction = false;

//     debugger;
    let input = items.map(e => e.item.definition.getHash());



    let [it] = input;
    let out = [];
    let a = it.split(':');
    let top = a.shift();
    let right = a.join(':');
    out = [top, right]





    for (let i = 0; i < out.length; ++i) {
    	if (!out[i]) continue;
    	outItems.push({
    		item: new ShapeItem(ShapeDefinition.fromShortKey(out[i])),
    		requiredSlot: i,
    	})
    }

    return trackProduction;
}


export const Sprite = {
    sprite: "sprites/buildings/unstacker.png",
    url: "./res/unstacker.png",
    w: 192 * 2,
    h: 192,
};
export const SpriteBp = {
    sprite: "sprites/blueprints/unstacker.png",
    url: "./res/unstacker-bp.png",
    w: 192 * 2,
    h: 192,
};

export const unstackerBuildingData = {
    id: id,
    building: MetaMergerBuilding,
    toolbar: 1,
    speed: 100,
    sprite: Sprite,
    spriteBp: SpriteBp,
    process: UnstackerProcess,
    // TODO: keybinding in KEYMAPPINGS
    // TODO: T
    Tname: id,
    Tdesc: "Whatever...",
    speed: 1 / 5,
    speedClass: "processors",
    meta: MetaMergerBuilding,
    variantId: 530,
};

export default unstackerBuildingData;