// Theme configuration for Clutter extension
// Single source of truth for all theme-related data

// Helper function to check if year is a leap year
function isLeapYear(year) {
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}

// Helper function to convert month/day to day of year
function getDayOfYear(month, day, year) {
  const daysInMonth = [31, isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  let dayOfYear = day;
  for (let i = 0; i < month - 1; i++) {
    dayOfYear += daysInMonth[i];
  }
  return dayOfYear;
}

// Helper function to get the Nth weekday of a month
function getNthWeekdayOfMonth(year, month, weekday, n) {
  const firstDay = new Date(year, month - 1, 1);
  const firstWeekday = firstDay.getDay();

  // Calculate the first occurrence of the target weekday
  let firstOccurrence = 1 + ((weekday - firstWeekday + 7) % 7);

  // Calculate the Nth occurrence
  const targetDay = firstOccurrence + (n - 1) * 7;

  return targetDay;
}

// Helper function to calculate Easter Sunday using Anonymous Gregorian algorithm
function calculateEaster(year) {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;

  return { month, day };
}

// Function to calculate dynamic events for the current year
function calculateDynamicEvents(year) {
  const events = [];

  // Easter - Moves between March 22 and April 25
  const easter = calculateEaster(year);
  events.push({
    dayOfYear: getDayOfYear(easter.month, easter.day, year),
    name: "easter",
    displayName: "Easter",
    emoji: "🐰",
    imageCount: 4
  });

  // Thanksgiving - 4th Thursday of November (month=11, weekday=4 for Thursday, n=4)
  const thanksgivingDay = getNthWeekdayOfMonth(year, 11, 4, 4);
  events.push({
    dayOfYear: getDayOfYear(11, thanksgivingDay, year),
    name: "thanksgiving",
    displayName: "Thanksgiving",
    emoji: "🦃",
    imageCount: 8
  });

  // Leap Day Anniversary - Feb 29 (only on leap years)
  if (isLeapYear(year)) {
    events.push({
      dayOfYear: getDayOfYear(2, 29, year),
      name: "leapday",
      displayName: "Anniversary (Leap Day)",
      emoji: "🎉",
      imageCount: 6
    });
  }

  return events;
}

const THEMES = {
  // Seasonal definitions with date ranges (day of year)
  // Seasons provide the base theme throughout the year
  SEASONS: [
    { start: 79, end: 171, name: "spring", displayName: "Spring", emoji: "🌸", imageCount: 4 }, // Day 79 (Mar 20) - Day 171 (Jun 20)
    { start: 172, end: 264, name: "summer", displayName: "Summer", emoji: "☀️", imageCount: 4 }, // Day 172 (Jun 21) - Day 264 (Sep 21)
    { start: 265, end: 354, name: "fall", displayName: "Fall", emoji: "🍂", imageCount: 4 }, // Day 265 (Sep 22) - Day 354 (Dec 20)
    { start: 355, end: 365, name: "winter", displayName: "Winter", emoji: "❄️", imageCount: 9 }, // Day 355 (Dec 21) - Day 365 (Dec 31)
    { start: 1, end: 78, name: "winter", displayName: "Winter", emoji: "❄️", imageCount: 9 } // Day 1 (Jan 1) - Day 78 (Mar 19)
  ],

  // Fixed events (always same date every year)
  // Events override seasons on specific days
  // Using day of year: Jan 1 = 1, Dec 31 = 365
  FIXED_EVENTS: [
    { dayOfYear: 1, name: "newyears", displayName: "New Year's Day", emoji: "🎊", imageCount: 4 }, // Jan 1
    { dayOfYear: 45, name: "valentines", displayName: "Valentine's Day", emoji: "💝", imageCount: 4 }, // Feb 14
    { dayOfYear: 76, name: "stpatricks", displayName: "St. Patrick's Day", emoji: "🍀", imageCount: 7 }, // Mar 17
    { dayOfYear: 185, name: "july4th", displayName: "Fourth of July", emoji: "🎆", imageCount: 4 }, // Jul 4
    { dayOfYear: 304, name: "halloween", displayName: "Halloween", emoji: "🎃", imageCount: 14 }, // Oct 31
    { dayOfYear: 359, name: "christmas", displayName: "Christmas", emoji: "🎄", imageCount: 6 }, // Dec 25
    { dayOfYear: 365, name: "newyears", displayName: "New Year's Eve", emoji: "🎊", imageCount: 4 } // Dec 31
  ],

  // Available themes with their display properties (for dropdown and UI)
  AVAILABLE: {
    winter: { displayName: "Winter", emoji: "❄️", imageCount: 9 },
    spring: { displayName: "Spring", emoji: "🌸", imageCount: 4 },
    summer: { displayName: "Summer", emoji: "☀️", imageCount: 4 },
    fall: { displayName: "Fall", emoji: "🍂", imageCount: 4 },
    easter: { displayName: "Easter", emoji: "🐰", imageCount: 4 },
    thanksgiving: { displayName: "Thanksgiving", emoji: "🦃", imageCount: 8 },
    christmas: { displayName: "Christmas", emoji: "🎄", imageCount: 6 },
    newyears: { displayName: "New Year's", emoji: "🎊", imageCount: 4 },
    valentines: { displayName: "Valentine's Day", emoji: "💝", imageCount: 4 },
    stpatricks: { displayName: "St. Patrick's Day", emoji: "🍀", imageCount: 7 },
    july4th: { displayName: "Fourth of July", emoji: "🎆", imageCount: 4 },
    halloween: { displayName: "Halloween", emoji: "🎃", imageCount: 14 },
    leapday: { displayName: "Leap Day", emoji: "🎉", imageCount: 6 }
  }
};

// Function to detect current season/event based on date
// Events override seasons on specific days
function getCurrentTheme() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  const dayOfYear = getDayOfYear(month, day, year);

  console.log(`Current date: ${month}/${day}/${year} (Day ${dayOfYear} of year)`);

  // Check dynamic events first (Thanksgiving, Leap Day, etc.)
  const dynamicEvents = calculateDynamicEvents(year);
  for (const event of dynamicEvents) {
    if (dayOfYear === event.dayOfYear) {
      console.log(`Dynamic event detected: ${event.displayName}`);
      return event.name;
    }
  }

  // Check fixed events (holidays that override seasons)
  for (const event of THEMES.FIXED_EVENTS) {
    if (dayOfYear === event.dayOfYear) {
      console.log(`Event detected: ${event.displayName}`);
      return event.name;
    }
  }

  // Check for seasons (base theme)
  for (const season of THEMES.SEASONS) {
    const { start, end, name } = season;
    const isWithinSeason = dayOfYear >= start && dayOfYear <= end;

    if (isWithinSeason) {
      console.log(`Season detected: ${season.displayName} (Days ${start}-${end})`);
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
