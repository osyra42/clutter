# Clutter Chrome Extension

A Chrome extension that adds festive seasonal decorations that fall on every webpage!

## Installation

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" in the top right corner
3. Click "Load unpacked"
4. Select the `clutter` folder
5. The extension is now installed and active!

## Features

- Automatically displays seasonal decorations based on the current date
- Decorations fall from the top of the page
- Interactive physics - decorations bounce away from your mouse cursor
- Toggle clutter on/off from the popup
- Choose your own theme or let Auto mode pick the right one
- Cozy coffee-themed popup interface

## Seasons

Base themes that cover the entire year:

| Season | Dates |
|--------|-------|
| ❄️ Winter | Dec 21 - Mar 19 |
| 🌸 Spring | Mar 20 - Jun 20 |
| ☀️ Summer | Jun 21 - Sep 21 |
| 🍂 Fall | Sep 22 - Dec 20 |

## Events

Special events that override seasons on specific days:

| Event | Date |
|-------|------|
| 🎊 New Year's | Jan 1 & Dec 31 |
| 💝 Valentine's Day | Feb 14 |
| 🍀 St. Patrick's Day | Mar 17 |
| 🐰 Easter | Varies (Mar-Apr) |
| 🎆 Fourth of July | Jul 4 |
| 🎃 Halloween | Oct 31 |
| 🦃 Thanksgiving | 4th Thursday of Nov |
| 🎄 Christmas | Dec 25 |
| 🎉 Leap Day | Feb 29 (leap years) |

## How it Works

The extension injects the clutter library into every webpage you visit, creating an overlay of seasonal decorations that interact with your mouse movements using realistic physics.

Events automatically override seasons on their specific days. For example, on Halloween (Oct 31), the Halloween theme will display instead of the Fall theme.

## Customization

You can customize the behavior by editing `clutter.js`:
- `CLUTTER_COUNT`: Number of decorations (default: 20)
- `CLUTTER_SPEED`: Min and max falling speed
- `BOUNCE_FORCE`: How strongly decorations bounce
- `COLLISION_RADIUS`: Distance for mouse interaction

## Disable the Extension

To temporarily disable the extension:
- Click the extension icon and toggle off "Enable Clutter"

Or from Chrome settings:
1. Go to `chrome://extensions/`
2. Toggle off the Clutter extension

To remove it completely, click "Remove" on the extension card.
