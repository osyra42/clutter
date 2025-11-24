# Clutter Chrome Extension

A Chrome extension that adds festive seasonal decorations that fall on every webpage!

## Installation

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" in the top right corner
3. Click "Load unpacked"
4. Select the `Clutter Extention` folder
5. The extension is now installed and active!

## Features

- Automatically displays seasonal decorations based on the current date
- Decorations fall from the top of the page
- Interactive physics - decorations bounce away from your mouse cursor
- Supports multiple themes:
  - **Winter** (December 21 - March 19)
  - **Spring** (March 20 - June 20)
  - **Summer** (June 21 - September 21)
  - **Fall** (September 22 - December 20)
  - **Christmas** (December 25)
  - **Fourth of July** (July 4)
  - **Thanksgiving** (November 28)

## How it Works

The extension injects the clutter library into every webpage you visit, creating an overlay of seasonal decorations that interact with your mouse movements using realistic physics.

## Customization

You can customize the behavior by editing `clutter-main/clutter.js`:
- `CLUTTER_COUNT`: Number of decorations (default: 20)
- `CLUTTER_SPEED`: Min and max falling speed
- `BOUNCE_FORCE`: How strongly decorations bounce
- `COLLISION_RADIUS`: Distance for mouse interaction

## Disable the Extension

To temporarily disable the extension:
1. Go to `chrome://extensions/`
2. Toggle off the Clutter extension

To remove it completely, click "Remove" on the extension card.
