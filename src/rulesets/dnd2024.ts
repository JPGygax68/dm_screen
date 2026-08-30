// DnD classes for the 2024 ruleset. These are used to generate the class selection UI and to provide class-specific information.

export type ClassName = 'Fighter' | 'Wizard' | 'Barbarian' | 'Rogue' | 
    'Cleric' | 'Ranger' | 'Paladin' | 'Bard' | 
    'Druid' | 'Monk' | 'Sorcerer' | 'Warlock' | 
    'Artificer';

export type AbilityKey = 'STR' | 'DEX' | 'CON' | 'INT' | 'WIS' | 'CHA';

export type ClassDef = {
    maxHitPointsPerLevel: number,
    savingThrows?: AbilityKey[],
};

export const pcClasses: Record<ClassName, ClassDef> = {

    Fighter: {
        maxHitPointsPerLevel: 10,
        savingThrows: ['STR', 'CON'],
    },
    Wizard: {
        maxHitPointsPerLevel: 6,
        savingThrows: ['INT', 'WIS']
    },
    Barbarian: {
        maxHitPointsPerLevel: 12,
        savingThrows: ['STR', 'CON'],
    },
    Rogue: {
        maxHitPointsPerLevel: 8,
        savingThrows: ['DEX', 'INT'],
    },
    Cleric: {
        maxHitPointsPerLevel: 8,
        savingThrows: ['WIS', 'CHA']
    },
    Ranger: {
        maxHitPointsPerLevel: 10,
        savingThrows: ['STR', 'DEX'],
    },
    Paladin: {
        maxHitPointsPerLevel: 10,
        savingThrows: ['WIS', 'CHA'],
    },
    Bard: {
        maxHitPointsPerLevel: 8,
        savingThrows: ['DEX', 'CHA'],
    },
    Druid: {
        maxHitPointsPerLevel: 8,
        savingThrows: ['WIS', 'INT'],
    },
    Monk: {
        maxHitPointsPerLevel: 8,
        savingThrows: ['STR', 'DEX'],
    },
    Sorcerer: {
        maxHitPointsPerLevel: 6,
        savingThrows: ['CON', 'CHA'],
    },
    Warlock: {
        maxHitPointsPerLevel: 8,
        savingThrows: ['CHA', 'CON'],
    },
    Artificer: {
        maxHitPointsPerLevel: 8,
        savingThrows: ['INT', 'CON'],
    },
};

export function savingThrowProficienciesFromClass(className: ClassName): AbilityKey[] {
    //console.log('Calculating saving throw proficiencies for class:', className[0]);
    const proficiencies = new Set<AbilityKey>();
    const classDef = pcClasses[className];
    if (!classDef) {
        console.warn(`Class definition not found for class: ${className}`);
        return [];
    }
    if (classDef.savingThrows) {
        for (const ability of classDef.savingThrows) {
            proficiencies.add(ability);
        }
    }
    //console.log('Calculated saving throw proficiencies:', Array.from(proficiencies));
    return Array.from(proficiencies);
}