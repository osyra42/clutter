// Constants
const HOLIDAYS = [
  { month: 12, day: 25, name: "Christmas" },
  { month: 7, day: 4, name: "FourthOfJuly" },
  { month: 11, day: 28, name: "Thanksgiving" },
];

const SEASONS = [
  { start: { month: 3, day: 20 }, end: { month: 6, day: 20 }, name: "Spring" },
  { start: { month: 6, day: 21 }, end: { month: 9, day: 21 }, name: "Summer" },
  { start: { month: 9, day: 22 }, end: { month: 12, day: 20 }, name: "Fall" },
  { start: { month: 12, day: 21 }, end: { month: 3, day: 19 }, name: "Winter" },
];

const CLUTTER_COUNT = 20;
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

function getSeason() {
  const now = new Date();
  const month = now.getMonth() + 1;
  const day = now.getDate();

  for (const holiday of HOLIDAYS) {
    if (month === holiday.month && day === holiday.day) {
      return holiday.name;
    }
  }

  for (const season of SEASONS) {
    const { start, end, name } = season;
    const isWithinSeason =
      (month > start.month || (month === start.month && day >= start.day)) &&
      (month < end.month || (month === end.month && day <= end.day));

    if (isWithinSeason) {
      return name;
    }
  }

  return "Winter";
}

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
  for (let i = 0; i < CLUTTER_COUNT; i++) {
    availableImages.push(`${clutterTheme}${i}.png`);
  }
}

function preloadImages(clutterTheme, callback) {
  const promises = availableImages.map((image) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = `assets/clutter/${image}`;
      img.onload = () => resolve(image);
      img.onerror = () => {
        console.warn(`Failed to load image: assets/clutter/${image}`);
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
  if (availableImages.length === 0) return;

  const clutter = document.createElement("div");
  clutter.className = "clutter";

  clutter.style.left = `${Math.random() * window.innerWidth}px`;

  // Random Y position only during initial load
  if (!initialLoadComplete) {
    clutter.style.top = `${Math.random() * window.innerHeight}px`;
  } else {
    clutter.style.top = "0px";
  }

  const randomIndex = Math.floor(Math.random() * availableImages.length);
  const imageUrl = `assets/clutter/${availableImages[randomIndex]}`;

  clutter.style.backgroundImage = `url(${imageUrl})`;
  clutter.style.transform = `rotate(${Math.random() * 360}deg)`;
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
        createClutter(clutterTheme);
      }
    });

    requestAnimationFrame(update);
  }

  requestAnimationFrame(update);
}

// Main Execution
const season = getSeason();
const clutterTheme = season.toLowerCase();
createStyle();
initializeAvailableImages(clutterTheme);

preloadImages(clutterTheme, () => {
  for (let i = 0; i < CLUTTER_COUNT; i++) {
    createClutter(clutterTheme);
  }
  initialLoadComplete = true;
  applyBouncePhysics();
});
