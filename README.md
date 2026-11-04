# Dooms Day

An atmospheric, nineteenth-century pixel-art cave exploration adventure.

## Play
Open `index.html` in a modern browser. Keyboard: A/D or arrows to move, Space to jump, Down to dive, E for bat pulse, F to feed the canary. Touch controls appear at the bottom.

## Current prototype
- Five connected handcrafted cave regions with distinct palettes, platforms, hazards and descent exits
- Side-scrolling camera, jumping, basic swimming, collisions
- Lantern with glowworm-driven light radius
- Red balloon and blue lifting-gas pickups; lead ballast modifies gravity
- Dog and bat companions, canary care, mushrooms, missing children
- Placeholder pixel graphics drawn directly in Canvas, with no external dependencies

## Narrative canon
The terminally ill grandfather once discovered a secret subterranean paradise through a child-sized opening behind a doomsday cult settlement. Unable to return as an adult, he leads his grandchildren toward it. A young relative, barely small enough to enter, follows and returns the missing children to the surface one by one. As the hero grows, the passage becomes too narrow. In the ending, the hero brings the children back to paradise but cannot follow, passing the lantern through the opening.

## World design
A layered, interconnected labyrinth. Each region hides its descent in a different part of the map. Cross-level shortcuts and optional chambers reward revisiting areas. No central descending shaft.

## Next engineering steps
1. Replace placeholder rectangles with authored pixel-art tiles and animated sprites.
2. Move map geometry and item placements to JSON; add a room editor and collision validation.
3. Build proper return-to-surface routes, persistent rescue progress and save slots.
4. Implement environmental gas hazards, companion abilities and health.
5. Build the opening narrative and the full interconnected world map.
6. Add audio and a mobile-friendly pause/inventory/map UI.

This is an initial playable prototype, not a complete game.