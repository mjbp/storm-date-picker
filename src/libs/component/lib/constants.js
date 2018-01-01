export const TRIGGER_EVENTS = ['click', 'keydown'];

export const TRIGGER_KEYCODES = [13, 32];

export const KEYCODES = {
    9: 'TAB',
    13: 'ENTER',
    27: 'ESCAPE',
    32: 'SPACE',
    33: 'PAGE_UP',
    34: 'PAGE_DOWN',
    37: 'LEFT',
    38: 'UP',
    39: 'RIGHT',
    40: 'DOWN'
};

export const ARIA_HELP_TEXT = `Press the arrow keys to navigate by day, PageUp and PageDown to navigate by month, Enter or Space to select a date, and Escape to cancel.`;

/*
 to do:
 combine CLASSNAMES and SELECTORS (remove SELETORS and append dot manually)
*/
export const CLASSNAMES = {
    CONTAINER: 'sdp-container',
    NAV_BTN: 'js-sdp-nav__btn',
    BTN_DEFAULT: 'sdp-day-btn',
    MONTH_CONTAINER: 'js-sdp__month',
    HAS_VALUE: 'has--value'
};

export const SELECTORS = {
    BTN_DEFAULT: '.sdp-day-btn',
    BTN_ACTIVE: '.sdp-day-btn--is-active',
    BTN_TODAY: '.sdp-day-btn--is-today',
    BTN_ENABLED: '.sdp-day-body:not(.sdp-day-disabled)',
    MONTH_CONTAINER: '.js-sdp__month',
};

export const DATA_ATTRIBUTES = {
    ACTION: 'data-action',
    MODEL_INDEX: 'data-model-index',
    DAY: 'data-day'
};