export const classes = [
  {
    id: "barbarian",
    name: "Barbarian",
    source: "SRD 5.2",
    primary_ability: "STR",
    saving_throws: ["STR", "CON"],
    hit_die: "d12",
    features: [
      {
        level: 1,
        name: "Rage",
        description:
          "Enter a rage as a Bonus Action to gain advantage on Strength checks/saves, bonus damage to Strength attacks, and resistance to Bludgeoning, Piercing, and Slashing damage.",
      },
      {
        level: 1,
        name: "Unarmored Defense",
        description:
          "While not wearing armor, your AC equals 10 + Dexterity modifier + Constitution modifier.",
      },
      {
        level: 1,
        name: "Weapon Mastery",
        description:
          "Gain the mastery properties of two chosen kinds of weapons.",
      },
      {
        level: 2,
        name: "Danger Sense",
        description:
          "Advantage on Dexterity saving throws against effects you can see.",
      },
      {
        level: 2,
        name: "Reckless Attack",
        description:
          "Gain advantage on melee weapon attack rolls using Strength during your turn, but attack rolls against you have advantage until your next turn.",
      },
      {
        level: 3,
        name: "Barbarian Subclass",
        description:
          "Choose a path archetype that grants specific path features.",
      },
    ],
  },
  {
    id: "fighter",
    name: "Fighter",
    source: "SRD 5.2",
    primary_ability: ["STR", "DEX"],
    saving_throws: ["STR", "CON"],
    hit_die: "d10",
    features: [
      {
        level: 1,
        name: "Fighting Style",
        description: "Gain a specific Fighting Style feat of your choice.",
      },
      {
        level: 1,
        name: "Second Wind",
        description:
          "Regain 1d10 + Fighter level hit points as a Bonus Action. Starts with 2 charges.",
      },
      {
        level: 1,
        name: "Weapon Mastery",
        description:
          "Gain the mastery properties of three chosen kinds of weapons.",
      },
      {
        level: 2,
        name: "Action Surge",
        description:
          "Take one additional action on your turn. Limited to once per short or long rest.",
      },
      {
        level: 2,
        name: "Tactical Mind",
        description:
          "Expend a use of Second Wind to add 1d10 to a failed ability check. Not expended if the check still fails.",
      },
      {
        level: 3,
        name: "Fighter Subclass",
        description:
          "Choose a martial archetype that grants specific archetype features.",
      },
    ],
  },
  {
    id: "rogue",
    name: "Rogue",
    source: "SRD 5.2",
    primary_ability: "DEX",
    saving_throws: ["DEX", "INT"],
    hit_die: "d8",
    features: [
      {
        level: 1,
        name: "Expertise",
        description:
          "Double your proficiency bonus for two chosen skill proficiencies.",
      },
      {
        level: 1,
        name: "Sneak Attack",
        description:
          "Deal extra damage once per turn to a target hit with a Finesse or Ranged weapon if you have advantage or an ally is adjacent to the target.",
      },
      {
        level: 1,
        name: "Thieves' Cant",
        description: "Speak and understand the secret language of rogues.",
      },
      {
        level: 2,
        name: "Cunning Action",
        description:
          "Take a Bonus Action on each of your turns to Dash, Disengage, or Hide.",
      },
      {
        level: 3,
        name: "Rogue Subclass",
        description:
          "Choose a roguish archetype that grants specific subclass features.",
      },
      {
        level: 3,
        name: "Steady Aim",
        description:
          "Use a Bonus Action to gain advantage on your next attack roll this turn, reducing your speed to 0 until the end of the turn.",
      },
    ],
  },
  {
    id: "wizard",
    name: "Wizard",
    source: "SRD 5.2",
    primary_ability: "INT",
    saving_throws: ["INT", "WIS"],
    hit_die: "d6",
    features: [
      {
        level: 1,
        name: "Spellcasting",
        description:
          "Cast arcane magic using Intelligence. Tracks prepared spells and available spell slots.",
      },
      {
        level: 1,
        name: "Arcane Recovery",
        description:
          "Regain expended spell slots during a short rest once per day, up to a combined level equal to half your wizard level (rounded up).",
      },
      {
        level: 2,
        name: "Scholar",
        description:
          "Gain expertise in one chosen Intelligence-based skill proficiency.",
      },
      {
        level: 3,
        name: "Wizard Subclass",
        description:
          "Choose an arcane tradition that grants specific school features.",
      },
    ],
  },
  {
    id: "ranger",
    name: "Ranger",
    source: "SRD 5.2",
    hit_die: "d10",
    primary_ability: ["STR", "DEX"],
    multiclassing_prerequisites: {
      or_options: ["STR", "DEX"],
      required_value: 13,
      fixed: ["WIS"],
    },
    saving_throws: ["STR", "DEX"],
    proficiencies: {
      armor: ["light_armor", "medium_armor", "shields"],
      weapons: ["simple_weapons", "martial_weapons"],
      tools: [],
      skills: {
        choices_count: 3,
        pool: [
          "animal_handling",
          "athletics",
          "insight",
          "investigation",
          "nature",
          "perception",
          "stealth",
          "survival",
        ],
      },
    },
    progression: [
      {
        level: 1,
        features: [
          {
            id: "ranger_spellcasting",
            name: "Spellcasting",
            description:
              "You can cast primal spells. You prepare a specific list of spells from the Ranger spell list, using Wisdom as your spellcasting ability score.",
            mechanics: {
              spellcasting_ability: "WIS",
              slots_level_1: 2,
              spells_prepared_count: 2,
            },
          },
          {
            id: "favoured_enemy",
            name: "Favoured Enemy",
            description:
              "You always have the Hunter's Mark spell prepared, and it doesn't count against the number of spells you can prepare. You can cast it a number of times equal to your Wisdom modifier without expending a spell slot.",
          },
          {
            id: "ranger_weapon_mastery",
            name: "Weapon Mastery",
            description:
              "Your training allows you to utilize the mastery properties of two kinds of weapons that you are proficient with, such as Vex or Slow.",
          },
        ],
      },
      {
        level: 2,
        features: [
          {
            id: "deft_explorer",
            name: "Deft Explorer",
            description:
              "Choose one of your skill proficiencies to gain Expertise, doubling your proficiency bonus for checks made with it. You also learn two additional languages.",
          },
          {
            id: "fighting_style",
            name: "Fighting Style",
            description:
              "You gain a Fighting Style feat of your choice, such as Archery or Defense.",
          },
        ],
      },
      {
        level: 3,
        features: [
          {
            id: "ranger_subclass_choice",
            name: "Ranger Archetype",
            description:
              "You choose a specialization that grants you features at Level 3 and beyond. The standard SRD option is the Hunter archetype.",
            is_subclass_unlock: true,
          },
        ],
      },
    ],
  },
];
