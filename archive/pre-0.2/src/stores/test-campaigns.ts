const testCampaigns = [
    // Mock Campaign 1: A rich dataset to test layouts, text truncation, and deep looping
    {
        id: "mock-campaign-1",
        name: "Critical Role: Phandelver",
        description: `A gritty exploration into the Lost Mine. Testing long paragraphs here to see if the accordion text wraps nicely on tablet layouts without breaking line heights.\
This is a second paragraph to test the wrapping and line height behavior of the accordion text. It should be long enough to wrap onto multiple lines, and we want to ensure\
that it doesn't break the layout or cause any unexpected overflow issues. The goal is to simulate a real-world scenario where a campaign description might be quite verbose\
and require careful handling in the UI.`,
        party: [
            {
                id: "pc-1",
                name: "Growler Stormjaw",
                level: 4,
                maxHitPoints: 45,
                race: "Half-Orc",
                classes: ["Fighter", "Barbarian"]
            },
            {
                id: "pc-2",
                name: "Elrond Half-Elven",
                level: 3,
                race: "Half-Elf",
                maxHitPoints: 32,
                classes: ["Paladin", "Cleric"]
            },
            {
                id: "pc-3",
                name: "Sam Brightspark",
                race: "Halfling",
                maxHitPoints: 12,
                level: 2,
                classes: ["Rogue"]
            },
            {
                id: "pc-4",
                name: "Thalindra Moonshadow",
                race: "Elf",
                level: 5,
                maxHitPoints: 28,
                classes: ["Cleric"]
            },
            {
                id: "pc-5",
                name: "Borin Stonefist",
                race: "Dwarf",
                level: 4,
                maxHitPoints: 38,
                classes: ["Fighter"]
            }
        ],
        encounters: [
            {
                id: "enc-1",
                title: "Goblin Ambush",
                summary: "Unrest in the Forest",
                location: "Triboar Trail",
                status: "Running", // ready, active, completed
                difficulty: "Medium", // TODO: replace with XP or CR
                enemies: [{
                    id: 'creature-goblin-sergeant-1',
                    imageId: 'creature-goblin-sergeant',
                    name: 'Goblin Sergeant',
                    cr: '1/2',
                    armorClass: 15,
                }, {
                    id: 'creature-goblin-scout-1',
                    imageId: 'creature-goblin-scout',
                    name: 'Goblin Scout #1',
                    cr: '1/4',
                    armorClass: 13,
                }]
            },
            {
                id: "enc-2",
                title: "The Bugbear Chief's Den",
                summary: "The not-so-brave hiding in the cave",
                location: "Cragmaw Hideout",
                status: "Ready",
                difficulty: "Deadly"
            },
            {
                id: "enc-3",
                title: "Redbrand Tavern Brawl",
                location: "Phandalin",
                status: "Draft",
                difficulty: "Easy"
            }
        ]
    },
    // Mock Campaign 2: An empty dataset to explicitly test your "Empty State" UI screens
    {
        id: "mock-campaign-2",
        name: "Empty Sandbox Campaign",
        description: "No party members here. Used to verify that the 'No characters added yet' text displays cleanly.",
        party: []
    }
] as any[];

export default testCampaigns;