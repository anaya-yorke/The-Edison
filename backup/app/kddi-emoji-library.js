// KDDIEmojiLibrary.js
import twemojiColr from 'twemoji-colr';

// Base URL for KDDI-style emoji images
const KDDI_BASE_URL = 'https://cdn.jsdelivr.net/gh/twitter/twemoji-colr/assets/72x72/';

// Pastel color palette with black and white options
export const colorPalette = {
  pastelPink: '#FFD1DC',
  pastelBlue: '#BFDFFF',
  pastelGreen: '#BFFFBF',
  pastelYellow: '#FFFFBF',
  pastelLavender: '#E6E6FA',
  pastelPeach: '#FFDBAC',
  pastelMint: '#C7FFDA',
  pastelLilac: '#D8BFD8',
  pastelCoral: '#FFB7B2',
  pastelTeal: '#B2FFEE',
  white: '#FFFFFF',
  black: '#000000',
};

// Helper to determine text color based on background brightness
export const getTextColor = (bgColor) => {
  // Convert hex to RGB
  const r = parseInt(bgColor.slice(1, 3), 16);
  const g = parseInt(bgColor.slice(3, 5), 16);
  const b = parseInt(bgColor.slice(5, 7), 16);
  
  // Calculate brightness (standard formula)
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  
  // Return black for light backgrounds, white for dark backgrounds
  return brightness > 128 ? '#000000' : '#FFFFFF';
};

// KDDI emoji data organized by category
export const kddiEmojis = {
  "Smileys & Emotion": [
    { unified: "1f600", shortName: "grinning", description: "Grinning Face" },
    { unified: "1f603", shortName: "smiley", description: "Smiling Face with Open Mouth" },
    { unified: "1f604", shortName: "smile", description: "Smiling Face with Open Mouth and Smiling Eyes" },
    { unified: "1f601", shortName: "grin", description: "Grinning Face with Smiling Eyes" },
    { unified: "1f606", shortName: "laughing", description: "Laughing" },
    { unified: "1f605", shortName: "sweat_smile", description: "Smiling Face with Open Mouth and Cold Sweat" },
    { unified: "1f602", shortName: "joy", description: "Face with Tears of Joy" },
    { unified: "1f642", shortName: "slight_smile", description: "Slightly Smiling Face" },
    { unified: "1f643", shortName: "upside_down", description: "Upside-Down Face" },
    { unified: "1f609", shortName: "wink", description: "Winking Face" },
    { unified: "1f60a", shortName: "blush", description: "Smiling Face with Smiling Eyes" },
    { unified: "1f60d", shortName: "heart_eyes", description: "Smiling Face with Heart-Eyes" },
    { unified: "1f618", shortName: "kissing_heart", description: "Face Blowing a Kiss" },
    { unified: "1f970", shortName: "smiling_face_with_hearts", description: "Smiling Face with Hearts" },
    { unified: "1f617", shortName: "kissing", description: "Kissing Face" },
    { unified: "1f619", shortName: "kissing_smiling_eyes", description: "Kissing Face with Smiling Eyes" },
    { unified: "1f61a", shortName: "kissing_closed_eyes", description: "Kissing Face with Closed Eyes" },
    { unified: "1f60b", shortName: "yum", description: "Face Savoring Food" },
    { unified: "1f61b", shortName: "stuck_out_tongue", description: "Face with Stuck-Out Tongue" },
    { unified: "1f61d", shortName: "stuck_out_tongue_closed_eyes", description: "Face with Stuck-Out Tongue & Closed Eyes" },
    { unified: "1f61c", shortName: "stuck_out_tongue_winking_eye", description: "Face with Stuck-Out Tongue & Winking Eye" },
    { unified: "1f92a", shortName: "zany_face", description: "Zany Face" },
    { unified: "1f607", shortName: "innocent", description: "Smiling Face with Halo" },
    { unified: "1f920", shortName: "cowboy", description: "Cowboy Hat Face" },
    { unified: "1f60f", shortName: "smirk", description: "Smirking Face" },
    { unified: "1f621", shortName: "angry", description: "Angry Face" },
    { unified: "1f620", shortName: "rage", description: "Pouting Face" },
    { unified: "1f92c", shortName: "face_with_symbols_on_mouth", description: "Face with Symbols on Mouth" },
    { unified: "1f608", shortName: "smiling_imp", description: "Smiling Face with Horns" },
    { unified: "1f47f", shortName: "imp", description: "Imp" }
  ],
  "People & Body": [
    { unified: "1f44b", shortName: "wave", description: "Waving Hand" },
    { unified: "1f91a", shortName: "raised_back_of_hand", description: "Raised Back of Hand" },
    { unified: "1f590", shortName: "raised_hand_with_fingers_splayed", description: "Hand with Fingers Splayed" },
    { unified: "270b", shortName: "raised_hand", description: "Raised Hand" },
    { unified: "1f596", shortName: "vulcan", description: "Vulcan Salute" },
    { unified: "1f44c", shortName: "ok_hand", description: "OK Hand" },
    { unified: "1f90f", shortName: "pinching_hand", description: "Pinching Hand" },
    { unified: "270c", shortName: "v", description: "Victory Hand" },
    { unified: "1f91e", shortName: "crossed_fingers", description: "Crossed Fingers" },
    { unified: "1f91f", shortName: "love_you_gesture", description: "Love-You Gesture" },
    { unified: "1f918", shortName: "metal", description: "Sign of the Horns" },
    { unified: "1f919", shortName: "call_me", description: "Call Me Hand" },
    { unified: "1f448", shortName: "point_left", description: "Backhand Index Pointing Left" },
    { unified: "1f449", shortName: "point_right", description: "Backhand Index Pointing Right" },
    { unified: "1f446", shortName: "point_up_2", description: "Backhand Index Pointing Up" },
    { unified: "1f447", shortName: "point_down", description: "Backhand Index Pointing Down" },
    { unified: "261d", shortName: "point_up", description: "Index Pointing Up" },
    { unified: "1f44d", shortName: "thumbsup", description: "Thumbs Up" },
    { unified: "1f44e", shortName: "thumbsdown", description: "Thumbs Down" },
    { unified: "270a", shortName: "fist", description: "Raised Fist" },
    { unified: "1f44a", shortName: "punch", description: "Oncoming Fist" },
    { unified: "1f64f", shortName: "pray", description: "Folded Hands" },
    { unified: "1f466", shortName: "boy", description: "Boy" },
    { unified: "1f467", shortName: "girl", description: "Girl" },
    { unified: "1f468", shortName: "man", description: "Man" },
    { unified: "1f469", shortName: "woman", description: "Woman" }
  ],
  "Animals & Nature": [
    { unified: "1f435", shortName: "monkey_face", description: "Monkey Face" },
    { unified: "1f412", shortName: "monkey", description: "Monkey" },
    { unified: "1f98d", shortName: "gorilla", description: "Gorilla" },
    { unified: "1f436", shortName: "dog", description: "Dog Face" },
    { unified: "1f415", shortName: "dog2", description: "Dog" },
    { unified: "1f429", shortName: "poodle", description: "Poodle" },
    { unified: "1f43a", shortName: "wolf", description: "Wolf" },
    { unified: "1f98a", shortName: "fox", description: "Fox" },
    { unified: "1f431", shortName: "cat", description: "Cat Face" },
    { unified: "1f408", shortName: "cat2", description: "Cat" },
    { unified: "1f638", shortName: "smile_cat", description: "Grinning Cat with Smiling Eyes" },
    { unified: "1f639", shortName: "joy_cat", description: "Cat with Tears of Joy" },
    { unified: "1f63a", shortName: "smiley_cat", description: "Smiling Cat with Open Mouth" },
    { unified: "1f63b", shortName: "heart_eyes_cat", description: "Smiling Cat with Heart-Eyes" },
    { unified: "1f63c", shortName: "smirk_cat", description: "Cat with Wry Smile" },
    { unified: "1f63d", shortName: "kissing_cat", description: "Kissing Cat" },
    { unified: "1f640", shortName: "scream_cat", description: "Weary Cat" },
    { unified: "1f63f", shortName: "crying_cat", description: "Crying Cat" },
    { unified: "1f63e", shortName: "pouting_cat", description: "Pouting Cat" },
    { unified: "1f648", shortName: "see_no_evil", description: "See-No-Evil Monkey" },
    { unified: "1f649", shortName: "hear_no_evil", description: "Hear-No-Evil Monkey" },
    { unified: "1f64a", shortName: "speak_no_evil", description: "Speak-No-Evil Monkey" }
  ],
  "Food & Drink": [
    { unified: "1f34a", shortName: "tangerine", description: "Tangerine" },
    { unified: "1f34b", shortName: "lemon", description: "Lemon" },
    { unified: "1f34c", shortName: "banana", description: "Banana" },
    { unified: "1f34d", shortName: "pineapple", description: "Pineapple" },
    { unified: "1f34e", shortName: "apple", description: "Red Apple" },
    { unified: "1f34f", shortName: "green_apple", description: "Green Apple" },
    { unified: "1f350", shortName: "pear", description: "Pear" },
    { unified: "1f351", shortName: "peach", description: "Peach" },
    { unified: "1f353", shortName: "strawberry", description: "Strawberry" },
    { unified: "1f354", shortName: "hamburger", description: "Hamburger" },
    { unified: "1f355", shortName: "pizza", description: "Pizza" },
    { unified: "1f356", shortName: "meat_on_bone", description: "Meat on Bone" },
    { unified: "1f357", shortName: "poultry_leg", description: "Poultry Leg" },
    { unified: "1f366", shortName: "ice_cream", description: "Soft Ice Cream" },
    { unified: "1f367", shortName: "shaved_ice", description: "Shaved Ice" },
    { unified: "1f368", shortName: "ice_cream", description: "Ice Cream" },
    { unified: "1f369", shortName: "doughnut", description: "Doughnut" },
    { unified: "1f36a", shortName: "cookie", description: "Cookie" }
  ],
  "Objects": [
    { unified: "1f3a4", shortName: "microphone", description: "Microphone" },
    { unified: "1f3a5", shortName: "movie_camera", description: "Movie Camera" },
    { unified: "1f3a7", shortName: "headphones", description: "Headphone" },
    { unified: "1f3a8", shortName: "art", description: "Artist Palette" },
    { unified: "1f3a9", shortName: "tophat", description: "Top Hat" },
    { unified: "1f3ae", shortName: "video_game", description: "Video Game" },
    { unified: "1f3af", shortName: "dart", description: "Direct Hit" },
    { unified: "1f3b0", shortName: "slot_machine", description: "Slot Machine" },
    { unified: "1f3b9", shortName: "musical_keyboard", description: "Musical Keyboard" },
    { unified: "1f3bc", shortName: "musical_score", description: "Musical Score" },
    { unified: "1f3e0", shortName: "house", description: "House" },
    { unified: "1f3e1", shortName: "house_with_garden", description: "House with Garden" },
    { unified: "1f3e2", shortName: "office", description: "Office Building" },
    { unified: "1f48c", shortName: "love_letter", description: "Love Letter" },
    { unified: "1f48d", shortName: "ring", description: "Ring" },
    { unified: "1f48e", shortName: "gem", description: "Gem Stone" },
    { unified: "1f4a1", shortName: "bulb", description: "Light Bulb" },
    { unified: "1f4a3", shortName: "bomb", description: "Bomb" },
    { unified: "1f4b0", shortName: "moneybag", description: "Money Bag" },
    { unified: "1f4bb", shortName: "computer", description: "Laptop" },
    { unified: "1f4c5", shortName: "date", description: "Calendar" },
    { unified: "1f4da", shortName: "books", description: "Books" }
  ],
  "Symbols": [
    { unified: "2764", shortName: "heart", description: "Red Heart" },
    { unified: "1f499", shortName: "blue_heart", description: "Blue Heart" },
    { unified: "1f49a", shortName: "green_heart", description: "Green Heart" },
    { unified: "1f49b", shortName: "yellow_heart", description: "Yellow Heart" },
    { unified: "1f49c", shortName: "purple_heart", description: "Purple Heart" },
    { unified: "1f9e1", shortName: "orange_heart", description: "Orange Heart" },
    { unified: "1f5a4", shortName: "black_heart", description: "Black Heart" },
    { unified: "1f4af", shortName: "100", description: "Hundred Points" },
    { unified: "2b50", shortName: "star", description: "Star" },
    { unified: "1f31f", shortName: "star2", description: "Glowing Star" },
    { unified: "2728", shortName: "sparkles", description: "Sparkles" },
    { unified: "2747", shortName: "sparkle", description: "Sparkle" },
    { unified: "2755", shortName: "grey_exclamation", description: "White Exclamation Mark" },
    { unified: "2757", shortName: "exclamation", description: "Red Exclamation Mark" },
    { unified: "2753", shortName: "question", description: "Red Question Mark" },
    { unified: "2754", shortName: "grey_question", description: "White Question Mark" }
  ]
};

// Get emoji image URL
export const getEmojiImageUrl = (unified) => {
  return `${KDDI_BASE_URL}${unified}.png`;
};

// Convert the emoji data to a flat array
export const allEmojis = Object.values(kddiEmojis).flat();

// Export a function to initialize the library
export const initKDDIEmojiLibrary = () => {
  // Initialize twemoji-colr or any additional setup needed
  twemojiColr.parse(document.body, {
    assets: 'svg',
    ext: '.svg'
  });
  return true;
};
