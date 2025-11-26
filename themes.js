// Theme configuration for Clutter extension
// Single source of truth for all theme-related data

const THEMES = {
  // Holiday definitions (take precedence over seasons)
  HOLIDAYS: [
    { month: 12, day: 25, name: "christmas", displayName: "Christmas", emoji: "🎄", imageCount: 6 },
    { month: 7, day: 4, name: "fall", displayName: "Fourth of July", emoji: "🎆", imageCount: 4 }, // Maps to fall since no July 4th images
    { month: 11, day: 28, name: "thanksgiving", displayName: "Thanksgiving", emoji: "🦃", imageCount: 8 }
  ],

  // Seasonal definitions with date ranges
  SEASONS: [
    { start: { month: 3, day: 20 }, end: { month: 6, day: 20 }, name: "fall", displayName: "Spring", emoji: "🌸", imageCount: 4 }, // Maps to fall
    { start: { month: 6, day: 21 }, end: { month: 9, day: 21 }, name: "fall", displayName: "Summer", emoji: "☀️", imageCount: 4 }, // Maps to fall
    { start: { month: 9, day: 22 }, end: { month: 11, day: 27 }, name: "fall", displayName: "Fall", emoji: "🍂", imageCount: 4 },
    { start: { month: 11, day: 28 }, end: { month: 11, day: 28 }, name: "thanksgiving", displayName: "Thanksgiving", emoji: "🦃", imageCount: 8 },
    { start: { month: 11, day: 29 }, end: { month: 12, day: 20 }, name: "fall", displayName: "Fall", emoji: "🍂", imageCount: 4 },
    { start: { month: 12, day: 21 }, end: { month: 12, day: 31 }, name: "winter", displayName: "Winter", emoji: "❄️", imageCount: 9 },
    { start: { month: 1, day: 1 }, end: { month: 3, day: 19 }, name: "winter", displayName: "Winter", emoji: "❄️", imageCount: 9 }
  ],

  // Available themes with their display properties (for dropdown and UI)
  AVAILABLE: {
    winter: { displayName: "Winter", emoji: "❄️", imageCount: 9 },
    fall: { displayName: "Fall", emoji: "🍂", imageCount: 4 },
    thanksgiving: { displayName: "Thanksgiving", emoji: "🦃", imageCount: 8 },
    christmas: { displayName: "Christmas", emoji: "🎄", imageCount: 6 }
  }
};

// Function to detect current season/holiday based on date
function getCurrentTheme() {
  const now = new Date();
  const month = now.getMonth() + 1;
  const day = now.getDate();

  console.log(`Current date: ${month}/${day}`);

  // Check for holidays first (they take precedence)
  for (const holiday of THEMES.HOLIDAYS) {
    if (month === holiday.month && day === holiday.day) {
      console.log(`Holiday detected: ${holiday.displayName}`);
      return holiday.name;
    }
  }

  // Check for seasons
  for (const season of THEMES.SEASONS) {
    const { start, end, name } = season;
    const isWithinSeason =
      (month > start.month || (month === start.month && day >= start.day)) &&
      (month < end.month || (month === end.month && day <= end.day));

    if (isWithinSeason) {
      console.log(`Season detected: ${season.displayName}`);
      return name;
    }
  }

  // Default fallback
  console.log('No season detected, defaulting to Winter');
  return 'winter';
}

// Function to get theme display info (name, emoji, image count)
function getThemeInfo(themeName) {
  return THEMES.AVAILABLE[themeName] || { displayName: themeName, emoji: '✨', imageCount: 0 };
}

// Function to get image count for a theme
function getImageCount(themeName) {
  const themeInfo = THEMES.AVAILABLE[themeName];
  return themeInfo ? themeInfo.imageCount : 20; // Default to 20 if not found
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { THEMES, getCurrentTheme, getThemeInfo, getImageCount };
}
