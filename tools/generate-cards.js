// tools/generate-cards.js
const fs = require('fs');
const path = require('path');
const YAML = require('yaml');

// Configure your input database and output print engine paths
const DATABASE_FILE = path.join(__dirname, '../database/bestiary.yaml');
const OUTPUT_DIR = path.join(__dirname, '../printable-cards-input');

// Ensure output folder directory target exists cleanly
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

try {
  const fileContent = fs.readFileSync(DATABASE_FILE, 'utf8');
  const bestiary = YAML.parse(fileContent);

  console.log(`Parsing bestiary data... Loaded ${bestiary.length} creatures.`);

  bestiary.forEach((monster) => {
    // 1. Build out the formatted stats row line block text
    const statsRow = `| STR | DEX | CON | INT | WIS | CHA |\n| :---: | :---: | :---: | :---: | :---: | :---: |\n| ${monster.stats.str} | ${monster.stats.dex} | ${monster.stats.con} | ${monster.stats.int} | ${monster.stats.wis} | ${monster.stats.cha} |`;

    // 2. Format custom actions arrays loop down into Markdown blocks
    const actionsMarkdown = monster.actions
      .map(act => `**${act.name}.** ${act.desc}`)
      .join('\n\n');

    // 3. Assemble the visual layout template card structure string
    const cardMarkdownContent = `---
title: "${monster.name}"
subtitle: "${monster.family} (${monster.tier}) - CR ${monster.cr}"
image: "./images/${monster.id}.png"
---

### Core Mechanics
* **Armor Class:** ${monster.armorClass}
* **Hit Points:** ${monster.hitPoints}
* **Speed:** ${monster.speed}

${statsRow}

### Actions
${actionsMarkdown}
`;

    // 4. Write the file out using a standardized name matching your image IDs
    const outputFilePath = path.join(OUTPUT_DIR, `${monster.id}.md`);
    fs.writeFileSync(outputFilePath, cardMarkdownContent, 'utf8');
  });

  console.log('🎉 Generation complete! Individual monster card Markdown sheets are ready for your print engine.');
} catch (error) {
  console.error('Failed to compile printable cards file array:', error);
}
