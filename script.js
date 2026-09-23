// Loads the NaSkin product, gallery, filter, and cart enhancements.
// Keeping this loader separate makes future feature modules easy to add.
import('./enhancements.js').catch(error => console.error('NaSkin failed to load:', error));
