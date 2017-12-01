export const TRIGGER_EVENTS = ['click', 'keydown'];

export const TRIGGER_KEYCODES = [13, 32];

export const KEYCODES = {
    9: 'TAB',
    13: 'ENTER',
    27: 'ESCAPE',
    32: 'SPACE',
    37: 'LEFT',
    38: 'UP',
    39: 'RIGHT',
    40: 'DOWN'
};

export const ARIA_HELP_TEXT = `Press the arrow keys to navigate by day, PageUp and PageDown to navigate by month, Enter or Space to select a date, or Escape to cancel.`;

export const CLASSNAMES = {
    NAV_BTN: 'js-sdp-nav__btn'
};

export const SELECTORS = {
    BTN_DEFAULT: '.sdp-day-btn',
    BTN_ACTIVE: '.sdp-day-btn--is-active',
    BTN_TODAY: '.sdp-day-btn--is-today',
    MONTH_CONTAINER: '.js-sdp__month',
};