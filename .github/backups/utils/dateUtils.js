/**
 * Format a date using the Intl.DateTimeFormat API
 * @param {Date} date - The date to format
 * @param {Object} options - Formatting options for Intl.DateTimeFormat
 * @param {string} locale - The locale to use for formatting
 * @returns {string} The formatted date string
 */
export const formatDate = (date, options = {}, locale = 'en-US') => {
  // Handle invalid dates
  if (!date || !(date instanceof Date) || isNaN(date)) {
    return '';
  }
  
  // Default options if none provided
  const defaultOptions = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  };
  
  const formatOptions = Object.keys(options).length > 0 ? options : defaultOptions;
  
  try {
    return new Intl.DateTimeFormat(locale, formatOptions).format(date);
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
};

/**
 * Get a relative time string (e.g., "2 days ago")
 * @param {Date} date - The date to format relative to now
 * @param {string} locale - The locale to use for formatting
 * @returns {string} The relative time string
 */
export const getRelativeTime = (date, locale = 'en-US') => {
  // Handle invalid dates
  if (!date || !(date instanceof Date) || isNaN(date)) {
    return '';
  }
  
  const now = new Date();
  const diffInMilliseconds = now - date;
  
  // Convert to seconds
  const diffInSeconds = Math.floor(diffInMilliseconds / 1000);
  
  if (diffInSeconds < 60) {
    return 'just now';
  }
  
  // Different time units in seconds
  const minute = 60;
  const hour = minute * 60;
  const day = hour * 24;
  const week = day * 7;
  const month = day * 30;
  const year = day * 365;
  
  // Format relative time using Intl.RelativeTimeFormat if available
  try {
    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
    
    if (diffInSeconds < hour) {
      return rtf.format(-Math.floor(diffInSeconds / minute), 'minute');
    } else if (diffInSeconds < day) {
      return rtf.format(-Math.floor(diffInSeconds / hour), 'hour');
    } else if (diffInSeconds < week) {
      return rtf.format(-Math.floor(diffInSeconds / day), 'day');
    } else if (diffInSeconds < month) {
      return rtf.format(-Math.floor(diffInSeconds / week), 'week');
    } else if (diffInSeconds < year) {
      return rtf.format(-Math.floor(diffInSeconds / month), 'month');
    } else {
      return rtf.format(-Math.floor(diffInSeconds / year), 'year');
    }
  } catch (error) {
    // Fallback for browsers that don't support RelativeTimeFormat
    if (diffInSeconds < hour) {
      const mins = Math.floor(diffInSeconds / minute);
      return `${mins} ${mins === 1 ? 'minute' : 'minutes'} ago`;
    } else if (diffInSeconds < day) {
      const hrs = Math.floor(diffInSeconds / hour);
      return `${hrs} ${hrs === 1 ? 'hour' : 'hours'} ago`;
    } else if (diffInSeconds < week) {
      const days = Math.floor(diffInSeconds / day);
      return `${days} ${days === 1 ? 'day' : 'days'} ago`;
    } else if (diffInSeconds < month) {
      const weeks = Math.floor(diffInSeconds / week);
      return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
    } else if (diffInSeconds < year) {
      const months = Math.floor(diffInSeconds / month);
      return `${months} ${months === 1 ? 'month' : 'months'} ago`;
    } else {
      const years = Math.floor(diffInSeconds / year);
      return `${years} ${years === 1 ? 'year' : 'years'} ago`;
    }
  }
}; 