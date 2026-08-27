// DnD classes for the 2024 ruleset. These are used to generate the class selection UI and to provide class-specific information.
export type PCClass = {
    maxHitPointsPerLevel: number
};

export const pcClasses: Record<string, PCClass> = {

    fighter: {
        maxHitPointsPerLevel: 10,
    },
    wizard: {
        maxHitPointsPerLevel: 6,
    },
    barbarian: {
        maxHitPointsPerLevel: 12,
    },
    rogue: {
        maxHitPointsPerLevel: 8,
    },
    cleric: {
        maxHitPointsPerLevel: 8,
    },
    ranger: {
        maxHitPointsPerLevel: 10,
    },
    paladin: {
        maxHitPointsPerLevel: 10,
    },
    bard: {
        maxHitPointsPerLevel: 8,
    },
    druid: {
        maxHitPointsPerLevel: 8,
    },
    monk: {
        maxHitPointsPerLevel: 8,
    },
    sorcerer: {
        maxHitPointsPerLevel: 6,
    },
    warlock: {
        maxHitPointsPerLevel: 8,
    },
    artificer: {
        maxHitPointsPerLevel: 8,
    },
};