console.log("Thanks for using Clutter")

const CLUTTER_COUNT = 20; // Default fallback
const CLUTTER_SPEED = { min: 1, max: 3 };
const BOUNCE_FORCE = 0.5;
const COLLISION_RADIUS = 50;

let clutterElements = [];
let availableImages = [];
let mouseX = 0;
let mouseY = 0;
let mouseSpeedX = 0;
let mouseSpeedY = 0;
let lastMouseX = 0;
let lastMouseY = 0;
let lastMouseTime = Date.now();
let initialLoadComplete = false;
let currentClutterTheme = 'winter'; // Global variable to track current theme
let animationFrameId = null; // Track animation frame for cleanup

function createStyle() {
  const style = document.createElement("style");
  style.textContent = `
    .clutter {
      position: fixed;
      width: 30px;
      height: 30px;
      background-size: contain;
      background-repeat: no-repeat;
      opacity: 0.8;
      z-index: 9999;
    }
  `;
  document.head.appendChild(style);
}

function initializeAvailableImages(clutterTheme) {
  availableImages = [];

  // Get image count from themes.js
  const imageCount = typeof getImageCount !== 'undefined'
    ? getImageCount(clutterTheme)
    : CLUTTER_COUNT;

  for (let i = 0; i < imageCount; i++) {
    availableImages.push(`${clutterTheme}${i}.png`);
  }
}

function preloadImages(clutterTheme, callback) {
  const promises = availableImages.map((image) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      // Always use GitHub URLs for extension context with theme subdirectory
      const imagePath = `https://raw.githubusercontent.com/osyra42/clutter/main/images/${clutterTheme}/${image}`;
      img.src = imagePath;
      img.onload = () => resolve(image);
      img.onerror = () => {
        console.warn(`Failed to load image: ${imagePath}`);
        resolve(null);
      };
    });
  });

  Promise.all(promises).then((results) => {
    availableImages = results.filter((image) => image !== null);
    callback();
  });
}

function createClutter(clutterTheme) {
  if (availableImages.length === 0) {
    console.error('Cannot create clutter: no available images!');
    return;
  }

  const clutter = document.createElement("div");
  clutter.className = "clutter";

  const left = Math.random() * window.innerWidth;
  clutter.style.left = `${left}px`;

  // Random Y position only during initial load
  let top;
  if (!initialLoadComplete) {
    top = Math.random() * window.innerHeight;
    clutter.style.top = `${top}px`;
  } else {
    top = 0;
    clutter.style.top = "0px";
  }

  const randomIndex = Math.floor(Math.random() * availableImages.length);
  // Always use GitHub URLs for extension context with theme subdirectory
  const imageUrl = `https://raw.githubusercontent.com/osyra42/clutter/main/images/${clutterTheme}/${availableImages[randomIndex]}`;

  clutter.style.backgroundImage = `url(${imageUrl})`;
  const rotation = Math.random() * 360;
  clutter.style.transform = `rotate(${rotation}deg)`;

  if (clutterElements.length < 3) {
    console.log(`Creating clutter #${clutterElements.length}: position (${left}, ${top}), rotation ${rotation}deg, image: ${imageUrl}`);
  }

  document.body.appendChild(clutter);

  clutter.velocityX = 0;
  clutter.velocityY = CLUTTER_SPEED.min + Math.random() * (CLUTTER_SPEED.max - CLUTTER_SPEED.min);

  clutterElements.push(clutter);
}

const MOUSE_RADIUS = 30; // Radius of the mouse "ball"
const CLUTTER_MASS = 1; // Mass of clutter elements (can be adjusted per element if needed)

function applyBouncePhysics() {
  document.addEventListener("mousemove", (event) => {
    const now = Date.now();
    const timeDelta = now - lastMouseTime;

    if (timeDelta > 0) {
      mouseSpeedX = (event.clientX - lastMouseX) / timeDelta;
      mouseSpeedY = (event.clientY - lastMouseY) / timeDelta;
    }

    mouseX = event.clientX;
    mouseY = event.clientY;
    lastMouseX = mouseX;
    lastMouseY = mouseY;
    lastMouseTime = now;
  });

  function update() {
    clutterElements.forEach((clutter, index) => {
      const clutterRect = clutter.getBoundingClientRect();
      const clutterCenterX = clutterRect.left + clutterRect.width / 2;
      const clutterCenterY = clutterRect.top + clutterRect.height / 2;

      // Distance between mouse and clutter center
      const distanceX = mouseX - clutterCenterX;
      const distanceY = mouseY - clutterCenterY;
      const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

      // Combined radius of mouse and clutter
      const combinedRadius = MOUSE_RADIUS + clutterRect.width / 2;

      // Check for collision
      if (distance < combinedRadius) {
        const dirX = distanceX / distance;
        const dirY = distanceY / distance;

        // Relative velocity between mouse and clutter
        const relativeVelocityX = mouseSpeedX - clutter.velocityX;
        const relativeVelocityY = mouseSpeedY - clutter.velocityY;

        // Velocity along the normal (collision direction)
        const velocityAlongNormal = relativeVelocityX * dirX + relativeVelocityY * dirY;

        // Only resolve collision if objects are moving towards each other
        if (velocityAlongNormal < 0) {
          const restitution = 0.8; // Coefficient of restitution (bounciness)
          const impulse = -(1 + restitution) * velocityAlongNormal;

          // Apply impulse to clutter
          clutter.velocityX -= (impulse * dirX) / CLUTTER_MASS;
          clutter.velocityY -= (impulse * dirY) / CLUTTER_MASS;

          // Add some randomness for realism
          clutter.velocityX += (Math.random() - 0.5) * BOUNCE_FORCE;
          clutter.velocityY += (Math.random() - 0.5) * BOUNCE_FORCE;

          // Apply damping to simulate energy loss
          const damping = 0.98;
          clutter.velocityX *= damping;
          clutter.velocityY *= damping;
        }
      }

      // Limit maximum velocity to prevent unrealistic behavior
      const maxVelocity = 10;
      const velocityMagnitude = Math.sqrt(
        clutter.velocityX * clutter.velocityX + clutter.velocityY * clutter.velocityY
      );
      if (velocityMagnitude > maxVelocity) {
        const scale = maxVelocity / velocityMagnitude;
        clutter.velocityX *= scale;
        clutter.velocityY *= scale;
      }

      // Update clutter position
      clutter.style.left = `${clutter.offsetLeft + clutter.velocityX}px`;
      clutter.style.top = `${clutter.offsetTop + clutter.velocityY}px`;

      // Check if clutter is out of bounds
      if (
        clutter.offsetLeft < -clutterRect.width ||
        clutter.offsetLeft > window.innerWidth ||
        clutter.offsetTop > window.innerHeight ||
        clutter.offsetTop < -clutterRect.height
      ) {
        clutter.remove();
        clutterElements.splice(index, 1);
        createClutter(currentClutterTheme);
      }
    });

    animationFrameId = requestAnimationFrame(update);
  }

  animationFrameId = requestAnimationFrame(update);
}

// Function to clean up existing clutter
function cleanupClutter() {
  console.log('Cleaning up existing clutter...');

  // Stop animation
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }

  // Remove all clutter elements
  clutterElements.forEach(clutter => clutter.remove());
  clutterElements = [];

  // Remove styles
  const styles = document.querySelectorAll('style');
  styles.forEach(style => {
    if (style.textContent.includes('.clutter')) {
      style.remove();
    }
  });

  // Reset state
  initialLoadComplete = false;
  availableImages = [];
}

// Function to initialize clutter with a specific theme
function initializeClutter(theme) {
  // Clean up any existing clutter first
  cleanupClutter();

  // Use getCurrentTheme from themes.js if available, otherwise fallback to 'winter'
  const season = theme === 'auto' || !theme
    ? (typeof getCurrentTheme !== 'undefined' ? getCurrentTheme() : 'winter')
    : theme;
  let clutterTheme = season.toLowerCase();

  // No need for theme mapping - themes.js handles all theme logic
  currentClutterTheme = clutterTheme; // Update global theme variable
  console.log(`Using theme: ${clutterTheme}`);

  createStyle();
  initializeAvailableImages(clutterTheme);

  console.log(`Starting to preload images for theme: ${clutterTheme}`);
  console.log(`Available images to load:`, availableImages);
  console.log(`Image URLs available:`, window.CLUTTER_IMAGE_URLS);

  preloadImages(clutterTheme, () => {
    console.log(`Preload complete! Available images:`, availableImages);
    console.log(`Creating ${CLUTTER_COUNT} clutter elements`);

    for (let i = 0; i < CLUTTER_COUNT; i++) {
      createClutter(clutterTheme);
    }

    console.log(`Created ${clutterElements.length} clutter elements`);
    initialLoadComplete = true;
    applyBouncePhysics();
    console.log('Bounce physics applied, clutter should now be visible!');
  });
}

// Expose reinitialize function globally for theme changes
window.reinitializeClutter = function(theme) {
  console.log('Reinitializing clutter with theme:', theme);
  initializeClutter(theme);
};

// Listen for theme change messages from content script
window.addEventListener('message', (event) => {
  // Only accept messages from the same origin
  if (event.source !== window) return;

  if (event.data.type === 'CLUTTER_CHANGE_THEME') {
    console.log('Received theme change message:', event.data.theme);
    initializeClutter(event.data.theme);
  }
});

// Main Execution - Check storage for saved theme
if (typeof chrome !== 'undefined' && chrome.storage) {
  chrome.storage.sync.get(['clutterTheme'], (result) => {
    const savedTheme = result.clutterTheme || 'auto';
    console.log(`Loaded theme from storage: ${savedTheme}`);
    initializeClutter(savedTheme);
  });
} else {
  // Fallback if storage is not available
  initializeClutter('auto');
}
