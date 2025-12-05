console.log("Thanks for using Clutter")

const CLUTTER_COUNT = 20; // Default fallback
const CLUTTER_SPEED = { min: 1, max: 3 };
const BOUNCE_FORCE = 0.5;
const COLLISION_RADIUS = 50;
const MOUSE_RADIUS = 30; // Radius of the mouse "ball"
const CLUTTER_MASS = 1; // Mass of clutter elements
const MAX_VELOCITY = 10;
const RESTITUTION = 0.8; // Coefficient of restitution (bounciness)
const DAMPING = 0.98;

// Particle class for better performance and organization
class Particle {
  constructor(theme, isInitialLoad) {
    this.element = document.createElement("div");
    this.element.className = "clutter";
    this.velocityX = 0;
    this.velocityY = CLUTTER_SPEED.min + Math.random() * (CLUTTER_SPEED.max - CLUTTER_SPEED.min);
    this.theme = theme;
    this.width = 30;
    this.height = 30;

    this.reset(isInitialLoad);
    document.body.appendChild(this.element);
  }

  reset(isInitialLoad = false) {
    // Reset position
    const left = Math.random() * window.innerWidth;
    const top = isInitialLoad ? Math.random() * window.innerHeight : 0;

    this.element.style.left = `${left}px`;
    this.element.style.top = `${top}px`;

    // Reset velocity
    this.velocityX = 0;
    this.velocityY = CLUTTER_SPEED.min + Math.random() * (CLUTTER_SPEED.max - CLUTTER_SPEED.min);

    // Random image and rotation
    const randomIndex = Math.floor(Math.random() * availableImages.length);
    const imageUrl = `https://raw.githubusercontent.com/osyra42/clutter/main/images/${this.theme}/${availableImages[randomIndex]}`;
    this.element.style.backgroundImage = `url(${imageUrl})`;

    const rotation = Math.random() * 360;
    this.element.style.transform = `rotate(${rotation}deg)`;
  }

  updatePosition(x, y) {
    this.element.style.left = `${x}px`;
    this.element.style.top = `${y}px`;
  }

  getBounds() {
    const rect = this.element.getBoundingClientRect();
    return {
      left: rect.left,
      top: rect.top,
      width: rect.width,
      height: rect.height,
      centerX: rect.left + rect.width / 2,
      centerY: rect.top + rect.height / 2
    };
  }

  checkCollision(mouseX, mouseY, mouseSpeedX, mouseSpeedY) {
    const bounds = this.getBounds();
    const distanceX = mouseX - bounds.centerX;
    const distanceY = mouseY - bounds.centerY;
    const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
    const combinedRadius = MOUSE_RADIUS + bounds.width / 2;

    if (distance < combinedRadius) {
      const dirX = distanceX / distance;
      const dirY = distanceY / distance;

      const relativeVelocityX = mouseSpeedX - this.velocityX;
      const relativeVelocityY = mouseSpeedY - this.velocityY;
      const velocityAlongNormal = relativeVelocityX * dirX + relativeVelocityY * dirY;

      if (velocityAlongNormal < 0) {
        const impulse = -(1 + RESTITUTION) * velocityAlongNormal;

        this.velocityX -= (impulse * dirX) / CLUTTER_MASS;
        this.velocityY -= (impulse * dirY) / CLUTTER_MASS;

        this.velocityX += (Math.random() - 0.5) * BOUNCE_FORCE;
        this.velocityY += (Math.random() - 0.5) * BOUNCE_FORCE;

        this.velocityX *= DAMPING;
        this.velocityY *= DAMPING;
      }
    }
  }

  limitVelocity() {
    const velocityMagnitude = Math.sqrt(
      this.velocityX * this.velocityX + this.velocityY * this.velocityY
    );
    if (velocityMagnitude > MAX_VELOCITY) {
      const scale = MAX_VELOCITY / velocityMagnitude;
      this.velocityX *= scale;
      this.velocityY *= scale;
    }
  }

  update() {
    this.limitVelocity();

    const newLeft = this.element.offsetLeft + this.velocityX;
    const newTop = this.element.offsetTop + this.velocityY;

    this.updatePosition(newLeft, newTop);

    return this.isOutOfBounds();
  }

  isOutOfBounds() {
    const bounds = this.getBounds();
    return (
      this.element.offsetLeft < -bounds.width ||
      this.element.offsetLeft > window.innerWidth ||
      this.element.offsetTop > window.innerHeight ||
      this.element.offsetTop < -bounds.height
    );
  }

  destroy() {
    this.element.remove();
  }

  changeTheme(newTheme) {
    this.theme = newTheme;
    const randomIndex = Math.floor(Math.random() * availableImages.length);
    const imageUrl = `https://raw.githubusercontent.com/osyra42/clutter/main/images/${newTheme}/${availableImages[randomIndex]}`;
    this.element.style.backgroundImage = `url(${imageUrl})`;
  }
}

// Global state
let particlePool = [];
let availableImages = [];
let mouseX = 0;
let mouseY = 0;
let mouseSpeedX = 0;
let mouseSpeedY = 0;
let lastMouseX = 0;
let lastMouseY = 0;
let lastMouseTime = Date.now();
let initialLoadComplete = false;
let currentClutterTheme = 'winter';
let animationFrameId = null;

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

function createParticlePool(count, theme, isInitialLoad) {
  if (availableImages.length === 0) {
    console.error('Cannot create particles: no available images!');
    return;
  }

  for (let i = 0; i < count; i++) {
    const particle = new Particle(theme, isInitialLoad);
    particlePool.push(particle);
  }

  console.log(`Created ${particlePool.length} particles`);
}

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
    particlePool.forEach((particle) => {
      particle.checkCollision(mouseX, mouseY, mouseSpeedX, mouseSpeedY);

      const isOutOfBounds = particle.update();

      if (isOutOfBounds) {
        particle.reset(false);
      }
    });

    animationFrameId = requestAnimationFrame(update);
  }

  animationFrameId = requestAnimationFrame(update);
}

function cleanupClutter() {
  console.log('Cleaning up existing clutter...');

  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }

  particlePool.forEach(particle => particle.destroy());
  particlePool = [];

  const styles = document.querySelectorAll('style');
  styles.forEach(style => {
    if (style.textContent.includes('.clutter')) {
      style.remove();
    }
  });

  initialLoadComplete = false;
  availableImages = [];
}

function initializeClutter(theme) {
  cleanupClutter();

  const season = theme === 'auto' || !theme
    ? (typeof getCurrentTheme !== 'undefined' ? getCurrentTheme() : 'winter')
    : theme;
  let clutterTheme = season.toLowerCase();

  currentClutterTheme = clutterTheme;
  console.log(`Using theme: ${clutterTheme}`);

  createStyle();
  initializeAvailableImages(clutterTheme);

  console.log(`Starting to preload images for theme: ${clutterTheme}`);
  console.log(`Available images to load:`, availableImages);

  preloadImages(clutterTheme, () => {
    console.log(`Preload complete! Available images:`, availableImages);
    console.log(`Creating ${CLUTTER_COUNT} particles`);

    createParticlePool(CLUTTER_COUNT, clutterTheme, !initialLoadComplete);

    initialLoadComplete = true;
    applyBouncePhysics();
    console.log('Bounce physics applied, particles should now be visible!');
  });
}

window.reinitializeClutter = function(theme) {
  console.log('Reinitializing clutter with theme:', theme);
  initializeClutter(theme);
};

window.addEventListener('message', (event) => {
  if (event.source !== window) return;

  if (event.data.type === 'CLUTTER_CHANGE_THEME') {
    console.log('Received theme change message:', event.data.theme);
    initializeClutter(event.data.theme);
  }
});

if (typeof chrome !== 'undefined' && chrome.storage) {
  chrome.storage.sync.get(['clutterTheme'], (result) => {
    const savedTheme = result.clutterTheme || 'auto';
    console.log(`Loaded theme from storage: ${savedTheme}`);
    initializeClutter(savedTheme);
  });
} else {
  initializeClutter('auto');
}
