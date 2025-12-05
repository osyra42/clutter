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

// Function to calculate dynamic holidays for the current year
function calculateDynamicHolidays(year) {
  const holidays = [];

  // Thanksgiving - 4th Thursday of November (month=11, weekday=4 for Thursday, n=4)
  const thanksgivingDay = getNthWeekdayOfMonth(year, 11, 4, 4);
  holidays.push({
    dayOfYear: getDayOfYear(11, thanksgivingDay, year),
    name: "thanksgiving",
    displayName: "Thanksgiving",
    emoji: "🦃",
    imageCount: 8
  });

  // Leap Day Anniversary - Feb 29 (only on leap years)
  if (isLeapYear(year)) {
    holidays.push({
      dayOfYear: getDayOfYear(2, 29, year),
      name: "leapday",
      displayName: "Anniversary (Leap Day)",
      emoji: "🎉",
      imageCount: 6
    });
  }

  return holidays;
}

const THEMES = {
  // Fixed holidays (always same date every year)
  // Using day of year: Jan 1 = 1, Dec 31 = 365
  FIXED_HOLIDAYS: [
    { dayOfYear: 1, name: "newyears", displayName: "New Year's Day", emoji: "🎊", imageCount: 4 }, // Jan 1
    { dayOfYear: 45, name: "valentines", displayName: "Valentine's Day", emoji: "💝", imageCount: 4 }, // Feb 14
    { dayOfYear: 76, name: "stpatricks", displayName: "St. Patrick's Day", emoji: "🍀", imageCount: 7 }, // Mar 17
    { dayOfYear: 185, name: "july4th", displayName: "Fourth of July", emoji: "🎆", imageCount: 4 }, // Jul 4
    { dayOfYear: 304, name: "halloween", displayName: "Halloween", emoji: "🎃", imageCount: 14 }, // Oct 31
    { dayOfYear: 359, name: "christmas", displayName: "Christmas", emoji: "🎄", imageCount: 6 }, // Dec 25
    { dayOfYear: 365, name: "newyears", displayName: "New Year's Eve", emoji: "🎊", imageCount: 4 } // Dec 31
  ],

  // Seasonal definitions with date ranges (day of year)
  SEASONS: [
    { start: 79, end: 171, name: "fall", displayName: "Spring", emoji: "🌸", imageCount: 4 }, // Day 79 (Mar 20) - Day 171 (Jun 20)
    { start: 172, end: 264, name: "fall", displayName: "Summer", emoji: "☀️", imageCount: 4 }, // Day 172 (Jun 21) - Day 264 (Sep 21)
    { start: 265, end: 354, name: "fall", displayName: "Fall", emoji: "🍂", imageCount: 4 }, // Day 265 (Sep 22) - Day 354 (Dec 20)
    { start: 355, end: 365, name: "winter", displayName: "Winter", emoji: "❄️", imageCount: 9 }, // Day 355 (Dec 21) - Day 365 (Dec 31)
    { start: 1, end: 78, name: "winter", displayName: "Winter", emoji: "❄️", imageCount: 9 } // Day 1 (Jan 1) - Day 78 (Mar 19)
  ],

  // Available themes with their display properties (for dropdown and UI)
  AVAILABLE: {
    winter: { displayName: "Winter", emoji: "❄️", imageCount: 9 },
    fall: { displayName: "Fall", emoji: "🍂", imageCount: 4 },
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

// Function to detect current season/holiday based on date
function getCurrentTheme() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  const dayOfYear = getDayOfYear(month, day, year);

  console.log(`Current date: ${month}/${day}/${year} (Day ${dayOfYear} of year)`);

  // Check dynamic holidays first (Thanksgiving, Leap Day, etc.)
  const dynamicHolidays = calculateDynamicHolidays(year);
  for (const holiday of dynamicHolidays) {
    if (dayOfYear === holiday.dayOfYear) {
      console.log(`Dynamic holiday detected: ${holiday.displayName}`);
      return holiday.name;
    }
  }

  // Check fixed holidays
  for (const holiday of THEMES.FIXED_HOLIDAYS) {
    if (dayOfYear === holiday.dayOfYear) {
      console.log(`Holiday detected: ${holiday.displayName}`);
      return holiday.name;
    }
  }

  // Check for seasons
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
