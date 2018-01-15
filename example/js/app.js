(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var _component = require('./libs/component');

var _component2 = _interopRequireDefault(_component);

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
}

var onDOMContentLoadedTasks = [function () {
    window.DatePicker = _component2.default.init('.js-date-picker', {
        minDate: '25/12/2017',
        maxDate: '16/01/2018'
    });
}];

if ('addEventListener' in window) window.addEventListener('DOMContentLoaded', function () {
    onDOMContentLoadedTasks.forEach(function (fn) {
        return fn();
    });
});

},{"./libs/component":2}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _defaults = require('./lib/defaults');

var _defaults2 = _interopRequireDefault(_defaults);

var _componentPrototype = require('./lib/component-prototype');

var _componentPrototype2 = _interopRequireDefault(_componentPrototype);

function _interopRequireDefault(obj) {
	return obj && obj.__esModule ? obj : { default: obj };
}

var init = function init(sel, opts) {
	var els = [].slice.call(document.querySelectorAll(sel));
	//let els = Array.from(document.querySelectorAll(sel));

	if (!els.length) return console.warn('Date picker not initialised, no augmentable elements found');

	return {
		pickers: els.map(function (el) {
			return Object.assign(Object.create(_componentPrototype2.default), {
				node: el,
				input: el.querySelector('.js-input'),
				btn: el.querySelector('.js-btn'),
				btnClear: el.querySelector('.js-btn__clear'),
				settings: Object.assign({}, _defaults2.default, opts)
			}).init();
		}),
		find: function find(sel) {
			var candidate = document.querySelector(sel);
			if (!candidate) return console.warn('Date picker not found for this selector');
			return this.pickers.reduce(function (acc, curr) {
				if (curr.node === candidate) acc = curr;
				return acc;
			}, false);
		}
	};
};

exports.default = { init: init };

},{"./lib/component-prototype":3,"./lib/defaults":5}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _utils = require('./utils');

var _templates = require('./templates');

var _constants = require('./constants');

exports.default = {
	init: function init() {
		var _this = this;

		this.initClone();

		_constants.TRIGGER_EVENTS.forEach(function (ev) {
			_this.btn.addEventListener(ev, function (e) {
				if (!!e.keyCode && !~_constants.TRIGGER_KEYCODES.indexOf(e.keyCode)) return;
				(0, _utils.catchBubble)(e);
				_this.toggle();
			});
			_this.btnClear && _this.btnClear.addEventListener(ev, function (e) {
				if (!!e.keyCode && !~_constants.TRIGGER_KEYCODES.indexOf(e.keyCode)) return;
				_this.reset();
			});
		});

		this.setDateLimits();
		this.boundHandleFocusOut = this.handleFocusOut.bind(this);

		this.startDate = this.input.value ? (0, _utils.parseDate)(this.input.value, this.settings.valueFormat) : false;
		if (this.startDate) this.inputClone.value = (0, _utils.formatDate)(this.startDate, this.settings.displayFormat);

		this.rootDate = this.startDate || new Date();
		this.rootDate.setHours(0, 0, 0, 0);
		this.settings.startOpen && this.open();
		return this;
	},
	setDateLimits: function setDateLimits() {
		var _this2 = this;

		['min', 'max'].forEach(function (limit) {
			if (_this2.settings[limit + 'Date'] && !(0, _utils.parseDate)(_this2.settings[limit + 'Date'], _this2.settings.valueFormat)) return console.warn(limit + 'Date setting could not be parsed');
			_this2.settings[limit + 'Date'] = _this2.settings[limit + 'Date'] && (0, _utils.parseDate)(_this2.settings[limit + 'Date'], _this2.settings.valueFormat);
		});
	},
	initClone: function initClone() {
		var _this3 = this;

		this.inputClone = (0, _utils.elementFactory)('input', { type: 'text', tabindex: -1 }, this.input.className);
		this.input.setAttribute('type', 'hidden');
		this.node.appendChild(this.inputClone);

		this.inputClone.addEventListener('change', function (e) {
			var candidate = (0, _utils.parseDate)(_this3.inputClone.value, _this3.settings.displayFormat); //false if parse fails
			if (candidate) _this3.setDate(candidate);else _this3.input.value = _this3.inputClone.value = '';
		});
	},
	toggle: function toggle() {
		if (this.isOpen) this.close();else this.open();
	},
	open: function open() {
		if (this.isOpen) return;
		this.workingDate = this.rootDate;
		this.renderCalendar();
		this.isOpen = true;
		this.btn.setAttribute('aria-expanded', 'true');
		this.container.querySelector(_constants.SELECTORS.BTN_ACTIVE) ? this.container.querySelector(_constants.SELECTORS.BTN_ACTIVE).focus() : this.container.querySelector(_constants.SELECTORS.BTN_TODAY) ? this.container.querySelector(_constants.SELECTORS.BTN_TODAY).focus() : this.container.querySelectorAll(_constants.SELECTORS.BTN_DEFAULT)[0].focus();
		document.body.addEventListener('focusout', this.boundHandleFocusOut);
	},
	close: function close() {
		if (!this.isOpen) return;
		this.node.removeChild(this.container);
		this.isOpen = false;
		this.btn.setAttribute('aria-expanded', 'false');
		this.btn.focus();
		this.workingDate = false;
	},
	handleFocusOut: function handleFocusOut() {
		var _this4 = this;

		window.setTimeout(function () {
			if (_this4.container.contains(document.activeElement)) return;
			_this4.close();
			document.body.removeEventListener('focusout', _this4.boundHandleFocusOut);
		}, 16);
	},
	renderCalendar: function renderCalendar() {
		this.container = (0, _utils.elementFactory)('div', { 'role': 'dialog', 'aria-helptext': _constants.ARIA_HELP_TEXT }, _constants.CLASSNAMES.CONTAINER);
		this.container.innerHTML = (0, _templates.calendar)();
		this.node.appendChild(this.container);
		this.monthContainer = document.querySelector(_constants.SELECTORS.MONTH_CONTAINER);
		this.renderMonth();
		this.initListeners();
	},
	renderMonth: function renderMonth() {
		this.monthView = (0, _utils.monthViewFactory)(this.workingDate || this.rootDate, this.startDate, this.settings.minDate, this.settings.maxDate);
		this.monthContainer.innerHTML = (0, _templates.month)(this.monthView);
		if (!this.container.querySelector(_constants.SELECTORS.BTN_DEFAULT + '[tabindex="0"]')) [].slice.call(this.container.querySelectorAll(_constants.SELECTORS.BTN_DEFAULT + ':not([disabled])')).shift().setAttribute('tabindex', '0');
		this.enableButtons();
	},
	enableButtons: function enableButtons() {
		var _this5 = this;

		[].slice.call(this.container.querySelectorAll('.' + _constants.CLASSNAMES.NAV_BTN)).forEach(function (btn, i) {
			if ((0, _utils.dateIsOutOfBounds)(!Boolean(i), _this5.workingDate, _this5.settings.minDate, _this5.settings.maxDate)) btn.setAttribute('disabled', 'disabled');else if (btn.hasAttribute('disabled')) btn.removeAttribute('disabled');
		});
	},
	initListeners: function initListeners() {
		var _this6 = this;

		_constants.TRIGGER_EVENTS.forEach(function (ev) {
			_this6.container.addEventListener(ev, _this6.routeHandlers.bind(_this6));
		});
	},
	routeHandlers: function routeHandlers(e) {
		if (e.keyCode) this.handleKeyDown(e);else {
			if (e.target.classList.contains(_constants.CLASSNAMES.NAV_BTN) || e.target.parentNode.classList.contains(_constants.CLASSNAMES.NAV_BTN)) this.handleNav(e);
			if (e.target.classList.contains(_constants.CLASSNAMES.BTN_DEFAULT)) this.selectDate(e);
		}
	},
	handleNav: function handleNav(e) {
		var action = +(e.target.getAttribute(_constants.DATA_ATTRIBUTES.ACTION) || e.target.parentNode.getAttribute(_constants.DATA_ATTRIBUTES.ACTION));
		this.workingDate = new Date(this.workingDate.getFullYear(), this.workingDate.getMonth() + action);
		this.renderMonth();
		if (e.target.hasAttribute('disabled') || e.target.parentNode.hasAttribute('disabled')) [].slice.call(this.container.querySelectorAll(_constants.SELECTORS.BTN_DEFAULT + ':not([disabled])'))[Boolean(action + 1) ? 'shift' : 'pop']().focus();
	},
	handleKeyDown: function handleKeyDown(e) {
		var keyDownDictionary = {
			PAGE_UP: function PAGE_UP() {
				(0, _utils.catchBubble)(e);
				keyDownDictionary.PAGE.call(this, true);
			},
			PAGE_DOWN: function PAGE_DOWN() {
				(0, _utils.catchBubble)(e);
				keyDownDictionary.PAGE.call(this, false);
			},
			PAGE: function PAGE(up) {
				if ((0, _utils.dateIsOutOfBounds)(up, this.workingDate, this.settings.minDate, this.settings.maxDate)) return;

				var nextMonth = up === true ? this.workingDate.getMonth() - 1 : this.workingDate.getMonth() + 1,
				    targetDay = (0, _utils.getNextActiveDay)(nextMonth, e.target.getAttribute(_constants.DATA_ATTRIBUTES.DAY), this.workingDate, up, this.settings.minDate, this.settings.maxDate);

				this.workingDate = new Date(this.workingDate.getFullYear(), nextMonth, targetDay);
				this.renderMonth();
				var focusableDay = this.container.querySelector('[' + _constants.DATA_ATTRIBUTES.DAY + '="' + targetDay + '"]:not(:disabled)');
				focusableDay && focusableDay.focus();
			},
			TAB: function TAB() {
				/* 
    	- trap tab in focusable children??
    		 - return to button after last focusable child?
    	- ref. https://github.com/mjbp/storm-focus-manager/blob/master/src/storm-focus-manager.js
    */
			},
			ENTER: function ENTER(e) {
				(0, _utils.catchBubble)(e);
				if (e.target.classList.contains(_constants.CLASSNAMES.BTN_DEFAULT)) this.selectDate(e);
				if (e.target.classList.contains(_constants.CLASSNAMES.NAV_BTN)) this.handleNav(e);
			},
			ESCAPE: function ESCAPE() {
				this.close();
			},
			SPACE: function SPACE(e) {
				keyDownDictionary.ENTER(e);
			},
			LEFT: function LEFT(e) {
				(0, _utils.catchBubble)(e);
				if (!e.target.classList.contains(_constants.CLASSNAMES.BTN_DEFAULT)) return;

				if (this.monthView.model[+e.target.getAttribute(_constants.DATA_ATTRIBUTES.MODEL_INDEX)].number === 1) {
					this.workingDate = new Date(this.workingDate.getFullYear(), this.workingDate.getMonth() - 1);
					this.renderMonth();
					var focusableDays = [].slice.call(this.container.querySelectorAll(_constants.SELECTORS.BTN_ENABLED));
					focusableDays.length > 0 && focusableDays.pop().firstElementChild.focus();
				} else this.container.querySelector('[' + _constants.DATA_ATTRIBUTES.MODEL_INDEX + '="' + (+e.target.getAttribute(_constants.DATA_ATTRIBUTES.MODEL_INDEX) - 1) + '"]').focus();
			},
			UP: function UP() {
				(0, _utils.catchBubble)(e);
				if (!e.target.classList.contains(_constants.CLASSNAMES.BTN_DEFAULT)) return;

				var nextDayIndex = +e.target.getAttribute(_constants.DATA_ATTRIBUTES.MODEL_INDEX) - 7;

				if (+this.monthView.model[+e.target.getAttribute(_constants.DATA_ATTRIBUTES.MODEL_INDEX)].number - 7 < 1) {
					this.workingDate = new Date(this.workingDate.getFullYear(), this.workingDate.getMonth() - 1);
					this.renderMonth();
					//use this.workingDate instead of querying DOM?
					if (!this.container.querySelector('[' + _constants.DATA_ATTRIBUTES.MODEL_INDEX + '="' + (this.monthView.model.length + nextDayIndex) + '"]') || this.container.querySelector('[' + _constants.DATA_ATTRIBUTES.MODEL_INDEX + '="' + (this.monthView.model.length + nextDayIndex) + '"]') && this.container.querySelector('[' + _constants.DATA_ATTRIBUTES.MODEL_INDEX + '="' + (this.monthView.model.length + nextDayIndex) + '"]').hasAttribute('disabled')) this.container.querySelector('[' + _constants.DATA_ATTRIBUTES.MODEL_INDEX + '="' + (this.monthView.model.length + (nextDayIndex - 7)) + '"]').focus();else this.container.querySelector('[' + _constants.DATA_ATTRIBUTES.MODEL_INDEX + '="' + (this.monthView.model.length + nextDayIndex) + '"]').focus();
				} else this.container.querySelector('[' + _constants.DATA_ATTRIBUTES.MODEL_INDEX + '="' + nextDayIndex + '"]').focus();
			},
			RIGHT: function RIGHT(e) {
				(0, _utils.catchBubble)(e);
				if (!e.target.classList.contains(_constants.CLASSNAMES.BTN_DEFAULT)) return;

				if (this.monthView.model[+e.target.getAttribute(_constants.DATA_ATTRIBUTES.MODEL_INDEX)].number === (0, _utils.getMonthLength)(this.monthView.model[+e.target.getAttribute(_constants.DATA_ATTRIBUTES.MODEL_INDEX)].date.getFullYear(), this.monthView.model[+e.target.getAttribute(_constants.DATA_ATTRIBUTES.MODEL_INDEX)].date.getMonth())) {
					this.workingDate = new Date(this.workingDate.getFullYear(), this.workingDate.getMonth() + 1);
					this.renderMonth();
					[].slice.call(this.container.querySelectorAll(_constants.SELECTORS.BTN_ENABLED)).shift().firstElementChild.focus();
				} else this.container.querySelector('[' + _constants.DATA_ATTRIBUTES.MODEL_INDEX + '="' + (+e.target.getAttribute(_constants.DATA_ATTRIBUTES.MODEL_INDEX) + 1) + '"]').focus();
			},
			DOWN: function DOWN() {
				(0, _utils.catchBubble)(e);
				if (!e.target.classList.contains(_constants.CLASSNAMES.BTN_DEFAULT)) return;

				var nextDate = +this.monthView.model[+e.target.getAttribute(_constants.DATA_ATTRIBUTES.MODEL_INDEX)].number + 7,
				    nextDayIndex = +e.target.getAttribute(_constants.DATA_ATTRIBUTES.MODEL_INDEX) + 7;

				if (+this.monthView.model[+e.target.getAttribute(_constants.DATA_ATTRIBUTES.MODEL_INDEX)].number + 7 > (0, _utils.getMonthLength)(this.monthView.model[+e.target.getAttribute(_constants.DATA_ATTRIBUTES.MODEL_INDEX)].date.getFullYear(), this.monthView.model[+e.target.getAttribute(_constants.DATA_ATTRIBUTES.MODEL_INDEX)].date.getMonth())) {
					this.workingDate = new Date(this.workingDate.getFullYear(), this.workingDate.getMonth() + 1);
					this.renderMonth();
					//use this.workingDate instead of querying DOM?
					if (this.container.querySelector('[' + _constants.DATA_ATTRIBUTES.MODEL_INDEX + '="' + nextDayIndex % 7 + '"]').hasAttribute('disabled')) this.container.querySelector('[' + _constants.DATA_ATTRIBUTES.MODEL_INDEX + '="' + (nextDayIndex % 7 + 7) + '"]').focus();else this.container.querySelector('[' + _constants.DATA_ATTRIBUTES.MODEL_INDEX + '="' + nextDayIndex % 7 + '"]').focus();
				} else this.container.querySelector('[' + _constants.DATA_ATTRIBUTES.MODEL_INDEX + '="' + nextDayIndex + '"]').focus();
			}
		};
		if (_constants.KEYCODES[e.keyCode] && keyDownDictionary[_constants.KEYCODES[e.keyCode]]) keyDownDictionary[_constants.KEYCODES[e.keyCode]].call(this, e);
	},
	selectDate: function selectDate(e) {
		e.target.classList.add(_constants.SELECTORS.BTN_ACTIVE);
		this.setDate(this.monthView.model[+e.target.getAttribute(_constants.DATA_ATTRIBUTES.MODEL_INDEX)].date);
		this.close();
	},
	reset: function reset() {
		this.rootDate = new Date();
		this.rootDate.setHours(0, 0, 0, 0);
		this.startDate = false;
		this.inputClone.value = '';
		this.input.value = '';
		this.node.classList.remove(_constants.CLASSNAMES.HAS_VALUE);
		if (this.isOpen) this.close();
	},
	setDate: function setDate(nextDate) {
		this.startDate = nextDate;
		this.rootDate = this.startDate;
		this.inputClone.value = (0, _utils.formatDate)(this.startDate, this.settings.displayFormat);
		this.input.value = (0, _utils.formatDate)(this.startDate, this.settings.valueFormat);
		!this.node.classList.contains(_constants.CLASSNAMES.HAS_VALUE) && this.node.classList.add(_constants.CLASSNAMES.HAS_VALUE);
	},
	getValue: function getValue() {
		return this.startDate;
	},
	setValue: function setValue(nextValue) {
		var format = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.settings.valueFormat;

		this.setDate((0, _utils.parseDate)(nextValue, format));
		if (this.isOpen) this.workingDate = this.startDate, this.renderMonth();
	}
};

},{"./constants":4,"./templates":6,"./utils":7}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
var TRIGGER_EVENTS = exports.TRIGGER_EVENTS = ['click', 'keydown'];

var TRIGGER_KEYCODES = exports.TRIGGER_KEYCODES = [13, 32];

var KEYCODES = exports.KEYCODES = {
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

var MONTHS = exports.MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

var DAYS = exports.DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

var ARIA_HELP_TEXT = exports.ARIA_HELP_TEXT = 'Press the arrow keys to navigate by day, PageUp and PageDown to navigate by month, Enter or Space to select a date, and Escape to cancel.';

/*
 to do:
 combine CLASSNAMES and SELECTORS (remove SELETORS and append dot manually)
*/
var CLASSNAMES = exports.CLASSNAMES = {
    CONTAINER: 'sdp-container',
    NAV_BTN: 'js-sdp-nav__btn',
    BTN_DEFAULT: 'sdp-day-btn',
    MONTH_CONTAINER: 'js-sdp__month',
    HAS_VALUE: 'has--value'
};

var SELECTORS = exports.SELECTORS = {
    BTN_DEFAULT: '.sdp-day-btn',
    BTN_ACTIVE: '.sdp-day-btn--is-active',
    BTN_TODAY: '.sdp-day-btn--is-today',
    BTN_ENABLED: '.sdp-day-body:not(.sdp-day-disabled)',
    MONTH_CONTAINER: '.js-sdp__month'
};

var DATA_ATTRIBUTES = exports.DATA_ATTRIBUTES = {
    ACTION: 'data-action',
    MODEL_INDEX: 'data-model-index',
    DAY: 'data-day'
};

},{}],5:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.default = {
	callback: null,
	startOpen: false,
	startDate: false,
	minDate: false,
	maxDate: false,
	// closeOnSelect: false,
	displayFormat: 'dddd MMMM D, YYYY', //Thursday January 12, 2017
	valueFormat: 'DD/MM/YYYY'
};

},{}],6:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.month = exports.calendar = undefined;

var _constants = require('./constants');

var calendar = exports.calendar = function calendar(props) {
    return '<div class="sdp-date">\n                                        <button class="' + _constants.CLASSNAMES.NAV_BTN + ' sdp-back" type="button" data-action="-1">\n                                            <svg focusable="false" class="sdp-btn__icon" width="19" height="19" viewBox="0 0 1000 1000"><path d="M336.2 274.5l-210.1 210h805.4c13 0 23 10 23 23s-10 23-23 23H126.1l210.1 210.1c11 11 11 21 0 32-5 5-10 7-16 7s-11-2-16-7l-249.1-249c-11-11-11-21 0-32l249.1-249.1c21-21.1 53 10.9 32 32z"></path></svg>\n                                        </button>\n                                        <button class="' + _constants.CLASSNAMES.NAV_BTN + ' sdp-next" type="button" data-action="1">\n                                            <svg focusable="false" class="sdp-btn__icon" width="19" height="19" viewBox="0 0 1000 1000"><path d="M694.4 242.4l249.1 249.1c11 11 11 21 0 32L694.4 772.7c-5 5-10 7-16 7s-11-2-16-7c-11-11-11-21 0-32l210.1-210.1H67.1c-13 0-23-10-23-23s10-23 23-23h805.4L662.4 274.5c-21-21.1 11-53.1 32-32.1z"></path></svg>\n                                        </button>\n                                        <div class="' + _constants.CLASSNAMES.MONTH_CONTAINER + '"></div>\n                                    </div>';
};

var month = exports.month = function month(props) {
    return '<div class="sdp-month-label">' + props.monthTitle + ' ' + props.yearTitle + '</div>\n                        <table class="sdp-days">\n                            <thead class="sdp-days-head">\n                                <tr class="sdp-days-row">\n                                    <th class="sdp-day-head">Mo</th>\n                                    <th class="sdp-day-head">Tu</th>\n                                    <th class="sdp-day-head">We</th>\n                                    <th class="sdp-day-head">Th</th>\n                                    <th class="sdp-day-head">Fr</th>\n                                    <th class="sdp-day-head">Sa</th>\n                                    <th class="sdp-day-head">Su</th>\n                                </tr>\n                            </thead>\n                            <tbody class="sdp-days-body">\n                                ' + props.model.map(weeks(props.active)).join('') + '\n                            </tbody>\n                        </table>';
};

var day = function day(activeDays, props, i) {
    return '<td class="sdp-day-body' + (props.isOutOfRange ? ' sdp-day-disabled' : props.nextMonth ? ' sdp-day-next-month sdp-day-disabled' : '') + (props.previousMonth ? ' sdp-day-prev-month sdp-day-disabled' : '') + (props.active ? ' sdp-day-selected' : '') + '"><button tabindex="' + (props.isStartDate ? 0 : props.isToday ? 0 : -1) + '" class="sdp-day-btn' + (props.isToday ? ' sdp-day-btn--is-today' : '') + (props.isStartDate ? ' sdp-day-btn--is-active' : '') + '" role="button" data-day="' + props.number + '" data-model-index="' + i + '" aria-label="' + (props.isToday ? 'Today, ' : '') + _constants.DAYS[props.date.getDay()] + ', ' + _constants.MONTHS[props.date.getMonth()] + ' ' + props.date.getDate() + ', ' + props.date.getFullYear() + '"' + (props.previousMonth || props.nextMonth || props.isOutOfRange ? " disabled" : "") + '>' + props.number + '</button></td>';
};

var weeks = function weeks(activeDays) {
    return function (props, i, arr) {
        if (i === 0) return '<tr class="sdp-days-row">' + day(activeDays, props, i);else if (i === arr.length - 1) return day(activeDays, props, i) + '</tr>';else if ((i + 1) % 7 === 0) return day(activeDays, props, i) + '</tr><tr class="sdp-days-row">';else return day(activeDays, props, i);
    };
};

},{"./constants":4}],7:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.getNextActiveDay = exports.dateIsOutOfBounds = exports.getFocusableChildren = exports.elementFactory = exports.monthViewFactory = exports.getMonthLength = exports.catchBubble = exports.formatDate = exports.parseDate = undefined;

var _fecha = require('fecha');

var _fecha2 = _interopRequireDefault(_fecha);

var _constants = require('./constants');

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
}

var parseDate = exports.parseDate = _fecha2.default.parse;

var formatDate = exports.formatDate = _fecha2.default.format;

var catchBubble = exports.catchBubble = function catchBubble(e) {
    e.stopImmediatePropagation();
    e.preventDefault();
};

var getMonthLength = exports.getMonthLength = function getMonthLength(y, m) {
    return new Date(y, m + 1, 0).getDate();
};

var isToday = function isToday(candidate) {
    var today = new Date();
    today.setHours(0, 0, 0, 0);
    return candidate.getTime() === today.getTime();
};

var isStartDate = function isStartDate(startDate, candidate) {
    return startDate.getTime() === candidate.getTime();
};

var monthModel = function monthModel(year, month, startDate, minDate, maxDate) {
    var theMonth = new Date(year, month + 1, 0),
        totalDays = theMonth.getDate(),
        endDay = theMonth.getDay(),
        startDay = void 0,
        prevMonthStartDay = false,
        prevMonth = new Date(year, month, 0),
        prevMonthEndDay = prevMonth.getDate(),
        output = [];

    theMonth.setDate(1);
    startDay = theMonth.getDay();

    if (startDay !== 1) {
        if (startDay === 0) prevMonthStartDay = prevMonth.getDate() - 5;else prevMonthStartDay = prevMonth.getDate() - (startDay - 2);
    }

    if (prevMonthStartDay) {
        while (prevMonthStartDay <= prevMonthEndDay) {
            var tmpDate = new Date(prevMonth.getFullYear(), prevMonth.getMonth(), prevMonthStartDay);
            output.push({
                number: prevMonthStartDay,
                previousMonth: true,
                isToday: isToday(tmpDate),
                isStartDate: startDate && isStartDate(startDate, tmpDate) || false,
                date: tmpDate
            });
            prevMonthStartDay++;
        }
    }
    for (var i = 1; i <= totalDays; i++) {
        var _tmpDate = new Date(year, month, i);
        output.push({
            number: i,
            date: _tmpDate,
            isOutOfRange: !(minDate && minDate.getTime() <= _tmpDate.getTime()) || !(maxDate && maxDate.getTime() > _tmpDate.getTime()),
            isStartDate: startDate && isStartDate(startDate, _tmpDate) || false,
            isToday: isToday(_tmpDate)
        });
    }
    if (endDay !== 0) for (var _i = 1; _i <= 7 - endDay; _i++) {
        var _tmpDate2 = new Date(year, month + 1, _i);
        output.push({
            number: _i,
            nextMonth: true,
            date: _tmpDate2,
            isStartDate: startDate && isStartDate(startDate, _tmpDate2) || false,
            isToday: isToday(_tmpDate2)
        });
    }
    return output;
};

var monthViewFactory = exports.monthViewFactory = function monthViewFactory(rootDate, startDate, minDate, maxDate) {
    return {
        model: monthModel(rootDate.getFullYear(), rootDate.getMonth(), startDate, minDate, maxDate),
        monthTitle: _constants.MONTHS[rootDate.getMonth()],
        yearTitle: rootDate.getFullYear()
    };
};

var elementFactory = exports.elementFactory = function elementFactory(type) {
    var attributes = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var className = arguments[2];

    var el = document.createElement(type);

    for (var prop in attributes) {
        el.setAttribute(prop, attributes[prop]);
    }if (className) el.className = className;

    return el;
};

var focusableElements = ['a[href]', 'area[href]', 'input:not([disabled])', 'select:not([disabled])', 'textarea:not([disabled])', 'button:not([disabled])', 'iframe', 'object', 'embed', '[contenteditable]', '[tabindex]:not([tabindex="-1"])'];

var getFocusableChildren = exports.getFocusableChildren = function getFocusableChildren(node) {
    return [].slice.call(node.querySelectorAll(focusableElements.join(','))).filter(function (child) {
        return !!(child.offsetWidth || child.offsetHeight || child.getClientRects().length);
    });
};

var dateIsOutOfBounds = exports.dateIsOutOfBounds = function dateIsOutOfBounds(isNavigatingBack, workingDate, min, max) {
    var tmpDate = new Date(workingDate.getFullYear(), workingDate.getMonth(), 1);

    if (isNavigatingBack && min && tmpDate.getTime() <= min.getTime()) return true;
    tmpDate.setDate(getMonthLength(tmpDate.getFullYear(), tmpDate.getMonth()));
    if (!isNavigatingBack && max && tmpDate.getTime() >= max.getTime()) return true;

    return false;
};

var getNextActiveDay = exports.getNextActiveDay = function getNextActiveDay(nextMonth, activeDay, workingDate, isNavigatingBack, min, max) {
    var candidateDay = getMonthLength(workingDate.getFullYear(), nextMonth) < activeDay ? getMonthLength(workingDate.getFullYear(), nextMonth) : activeDay,
        tmpDate = new Date(workingDate.getFullYear(), nextMonth, candidateDay);

    if (isNavigatingBack && min && tmpDate.getMonth() === min.getMonth() && tmpDate.getDate() < min.getDate()) return min.getDate();
    if (!isNavigatingBack && max && tmpDate.getMonth() === max.getMonth() && tmpDate.getDate() > max.getDate()) return max.getDate() - 1;

    return candidateDay;
};

},{"./constants":4,"fecha":8}],8:[function(require,module,exports){
(function (main) {
  'use strict';

  /**
   * Parse or format dates
   * @class fecha
   */
  var fecha = {};
  var token = /d{1,4}|M{1,4}|YY(?:YY)?|S{1,3}|Do|ZZ|([HhMsDm])\1?|[aA]|"[^"]*"|'[^']*'/g;
  var twoDigits = /\d\d?/;
  var threeDigits = /\d{3}/;
  var fourDigits = /\d{4}/;
  var word = /[0-9]*['a-z\u00A0-\u05FF\u0700-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+|[\u0600-\u06FF\/]+(\s*?[\u0600-\u06FF]+){1,2}/i;
  var literal = /\[([^]*?)\]/gm;
  var noop = function () {
  };

  function shorten(arr, sLen) {
    var newArr = [];
    for (var i = 0, len = arr.length; i < len; i++) {
      newArr.push(arr[i].substr(0, sLen));
    }
    return newArr;
  }

  function monthUpdate(arrName) {
    return function (d, v, i18n) {
      var index = i18n[arrName].indexOf(v.charAt(0).toUpperCase() + v.substr(1).toLowerCase());
      if (~index) {
        d.month = index;
      }
    };
  }

  function pad(val, len) {
    val = String(val);
    len = len || 2;
    while (val.length < len) {
      val = '0' + val;
    }
    return val;
  }

  var dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  var monthNamesShort = shorten(monthNames, 3);
  var dayNamesShort = shorten(dayNames, 3);
  fecha.i18n = {
    dayNamesShort: dayNamesShort,
    dayNames: dayNames,
    monthNamesShort: monthNamesShort,
    monthNames: monthNames,
    amPm: ['am', 'pm'],
    DoFn: function DoFn(D) {
      return D + ['th', 'st', 'nd', 'rd'][D % 10 > 3 ? 0 : (D - D % 10 !== 10) * D % 10];
    }
  };

  var formatFlags = {
    D: function(dateObj) {
      return dateObj.getDate();
    },
    DD: function(dateObj) {
      return pad(dateObj.getDate());
    },
    Do: function(dateObj, i18n) {
      return i18n.DoFn(dateObj.getDate());
    },
    d: function(dateObj) {
      return dateObj.getDay();
    },
    dd: function(dateObj) {
      return pad(dateObj.getDay());
    },
    ddd: function(dateObj, i18n) {
      return i18n.dayNamesShort[dateObj.getDay()];
    },
    dddd: function(dateObj, i18n) {
      return i18n.dayNames[dateObj.getDay()];
    },
    M: function(dateObj) {
      return dateObj.getMonth() + 1;
    },
    MM: function(dateObj) {
      return pad(dateObj.getMonth() + 1);
    },
    MMM: function(dateObj, i18n) {
      return i18n.monthNamesShort[dateObj.getMonth()];
    },
    MMMM: function(dateObj, i18n) {
      return i18n.monthNames[dateObj.getMonth()];
    },
    YY: function(dateObj) {
      return String(dateObj.getFullYear()).substr(2);
    },
    YYYY: function(dateObj) {
      return dateObj.getFullYear();
    },
    h: function(dateObj) {
      return dateObj.getHours() % 12 || 12;
    },
    hh: function(dateObj) {
      return pad(dateObj.getHours() % 12 || 12);
    },
    H: function(dateObj) {
      return dateObj.getHours();
    },
    HH: function(dateObj) {
      return pad(dateObj.getHours());
    },
    m: function(dateObj) {
      return dateObj.getMinutes();
    },
    mm: function(dateObj) {
      return pad(dateObj.getMinutes());
    },
    s: function(dateObj) {
      return dateObj.getSeconds();
    },
    ss: function(dateObj) {
      return pad(dateObj.getSeconds());
    },
    S: function(dateObj) {
      return Math.round(dateObj.getMilliseconds() / 100);
    },
    SS: function(dateObj) {
      return pad(Math.round(dateObj.getMilliseconds() / 10), 2);
    },
    SSS: function(dateObj) {
      return pad(dateObj.getMilliseconds(), 3);
    },
    a: function(dateObj, i18n) {
      return dateObj.getHours() < 12 ? i18n.amPm[0] : i18n.amPm[1];
    },
    A: function(dateObj, i18n) {
      return dateObj.getHours() < 12 ? i18n.amPm[0].toUpperCase() : i18n.amPm[1].toUpperCase();
    },
    ZZ: function(dateObj) {
      var o = dateObj.getTimezoneOffset();
      return (o > 0 ? '-' : '+') + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4);
    }
  };

  var parseFlags = {
    D: [twoDigits, function (d, v) {
      d.day = v;
    }],
    Do: [new RegExp(twoDigits.source + word.source), function (d, v) {
      d.day = parseInt(v, 10);
    }],
    M: [twoDigits, function (d, v) {
      d.month = v - 1;
    }],
    YY: [twoDigits, function (d, v) {
      var da = new Date(), cent = +('' + da.getFullYear()).substr(0, 2);
      d.year = '' + (v > 68 ? cent - 1 : cent) + v;
    }],
    h: [twoDigits, function (d, v) {
      d.hour = v;
    }],
    m: [twoDigits, function (d, v) {
      d.minute = v;
    }],
    s: [twoDigits, function (d, v) {
      d.second = v;
    }],
    YYYY: [fourDigits, function (d, v) {
      d.year = v;
    }],
    S: [/\d/, function (d, v) {
      d.millisecond = v * 100;
    }],
    SS: [/\d{2}/, function (d, v) {
      d.millisecond = v * 10;
    }],
    SSS: [threeDigits, function (d, v) {
      d.millisecond = v;
    }],
    d: [twoDigits, noop],
    ddd: [word, noop],
    MMM: [word, monthUpdate('monthNamesShort')],
    MMMM: [word, monthUpdate('monthNames')],
    a: [word, function (d, v, i18n) {
      var val = v.toLowerCase();
      if (val === i18n.amPm[0]) {
        d.isPm = false;
      } else if (val === i18n.amPm[1]) {
        d.isPm = true;
      }
    }],
    ZZ: [/([\+\-]\d\d:?\d\d|Z)/, function (d, v) {
      if (v === 'Z') v = '+00:00';
      var parts = (v + '').match(/([\+\-]|\d\d)/gi), minutes;

      if (parts) {
        minutes = +(parts[1] * 60) + parseInt(parts[2], 10);
        d.timezoneOffset = parts[0] === '+' ? minutes : -minutes;
      }
    }]
  };
  parseFlags.dd = parseFlags.d;
  parseFlags.dddd = parseFlags.ddd;
  parseFlags.DD = parseFlags.D;
  parseFlags.mm = parseFlags.m;
  parseFlags.hh = parseFlags.H = parseFlags.HH = parseFlags.h;
  parseFlags.MM = parseFlags.M;
  parseFlags.ss = parseFlags.s;
  parseFlags.A = parseFlags.a;


  // Some common format strings
  fecha.masks = {
    default: 'ddd MMM DD YYYY HH:mm:ss',
    shortDate: 'M/D/YY',
    mediumDate: 'MMM D, YYYY',
    longDate: 'MMMM D, YYYY',
    fullDate: 'dddd, MMMM D, YYYY',
    shortTime: 'HH:mm',
    mediumTime: 'HH:mm:ss',
    longTime: 'HH:mm:ss.SSS'
  };

  /***
   * Format a date
   * @method format
   * @param {Date|number} dateObj
   * @param {string} mask Format of the date, i.e. 'mm-dd-yy' or 'shortDate'
   */
  fecha.format = function (dateObj, mask, i18nSettings) {
    var i18n = i18nSettings || fecha.i18n;

    if (typeof dateObj === 'number') {
      dateObj = new Date(dateObj);
    }

    if (Object.prototype.toString.call(dateObj) !== '[object Date]' || isNaN(dateObj.getTime())) {
      throw new Error('Invalid Date in fecha.format');
    }

    mask = fecha.masks[mask] || mask || fecha.masks['default'];

    var literals = [];

    // Make literals inactive by replacing them with ??
    mask = mask.replace(literal, function($0, $1) {
      literals.push($1);
      return '??';
    });
    // Apply formatting rules
    mask = mask.replace(token, function ($0) {
      return $0 in formatFlags ? formatFlags[$0](dateObj, i18n) : $0.slice(1, $0.length - 1);
    });
    // Inline literal values back into the formatted value
    return mask.replace(/\?\?/g, function() {
      return literals.shift();
    });
  };

  /**
   * Parse a date string into an object, changes - into /
   * @method parse
   * @param {string} dateStr Date string
   * @param {string} format Date parse format
   * @returns {Date|boolean}
   */
  fecha.parse = function (dateStr, format, i18nSettings) {
    var i18n = i18nSettings || fecha.i18n;

    if (typeof format !== 'string') {
      throw new Error('Invalid format in fecha.parse');
    }

    format = fecha.masks[format] || format;

    // Avoid regular expression denial of service, fail early for really long strings
    // https://www.owasp.org/index.php/Regular_expression_Denial_of_Service_-_ReDoS
    if (dateStr.length > 1000) {
      return false;
    }

    var isValid = true;
    var dateInfo = {};
    format.replace(token, function ($0) {
      if (parseFlags[$0]) {
        var info = parseFlags[$0];
        var index = dateStr.search(info[0]);
        if (!~index) {
          isValid = false;
        } else {
          dateStr.replace(info[0], function (result) {
            info[1](dateInfo, result, i18n);
            dateStr = dateStr.substr(index + result.length);
            return result;
          });
        }
      }

      return parseFlags[$0] ? '' : $0.slice(1, $0.length - 1);
    });

    if (!isValid) {
      return false;
    }

    var today = new Date();
    if (dateInfo.isPm === true && dateInfo.hour != null && +dateInfo.hour !== 12) {
      dateInfo.hour = +dateInfo.hour + 12;
    } else if (dateInfo.isPm === false && +dateInfo.hour === 12) {
      dateInfo.hour = 0;
    }

    var date;
    if (dateInfo.timezoneOffset != null) {
      dateInfo.minute = +(dateInfo.minute || 0) - +dateInfo.timezoneOffset;
      date = new Date(Date.UTC(dateInfo.year || today.getFullYear(), dateInfo.month || 0, dateInfo.day || 1,
        dateInfo.hour || 0, dateInfo.minute || 0, dateInfo.second || 0, dateInfo.millisecond || 0));
    } else {
      date = new Date(dateInfo.year || today.getFullYear(), dateInfo.month || 0, dateInfo.day || 1,
        dateInfo.hour || 0, dateInfo.minute || 0, dateInfo.second || 0, dateInfo.millisecond || 0);
    }
    return date;
  };

  /* istanbul ignore next */
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = fecha;
  } else if (typeof define === 'function' && define.amd) {
    define(function () {
      return fecha;
    });
  } else {
    main.fecha = fecha;
  }
})(this);

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJleGFtcGxlL3NyYy9hcHAuanMiLCJleGFtcGxlL3NyYy9saWJzL2NvbXBvbmVudC9pbmRleC5qcyIsImV4YW1wbGUvc3JjL2xpYnMvY29tcG9uZW50L2xpYi9jb21wb25lbnQtcHJvdG90eXBlLmpzIiwiZXhhbXBsZS9zcmMvbGlicy9jb21wb25lbnQvbGliL2NvbnN0YW50cy5qcyIsImV4YW1wbGUvc3JjL2xpYnMvY29tcG9uZW50L2xpYi9kZWZhdWx0cy5qcyIsImV4YW1wbGUvc3JjL2xpYnMvY29tcG9uZW50L2xpYi90ZW1wbGF0ZXMuanMiLCJleGFtcGxlL3NyYy9saWJzL2NvbXBvbmVudC9saWIvdXRpbHMuanMiLCJub2RlX21vZHVsZXMvZmVjaGEvZmVjaGEuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztBQ0FBOzs7Ozs7OztBQUVBLElBQU0sMkJBQTJCLFlBQU0sQUFDbkM7V0FBQSxBQUFPLGlDQUFhLEFBQVcsS0FBWCxBQUFnQjtpQkFBbUIsQUFDMUMsQUFDVDtpQkFGSixBQUFvQixBQUFtQyxBQUUxQyxBQUVoQjtBQUowRCxBQUNuRCxLQURnQjtBQUR4QixBQUFnQyxDQUFBOztBQU9oQyxJQUFHLHNCQUFILEFBQXlCLGVBQVEsQUFBTyxpQkFBUCxBQUF3QixvQkFBb0IsWUFBTSxBQUFFOzRCQUFBLEFBQXdCLFFBQVEsVUFBQSxBQUFDLElBQUQ7ZUFBQSxBQUFRO0FBQXhDLEFBQWdEO0FBQXBHLENBQUE7Ozs7Ozs7OztBQ1RqQzs7OztBQUNBOzs7Ozs7OztBQUVBLElBQU0sT0FBTyxTQUFQLEFBQU8sS0FBQSxBQUFDLEtBQUQsQUFBTSxNQUFTLEFBQzNCO0tBQUksTUFBTSxHQUFBLEFBQUcsTUFBSCxBQUFTLEtBQUssU0FBQSxBQUFTLGlCQUFqQyxBQUFVLEFBQWMsQUFBMEIsQUFDL0M7QUFFSDs7S0FBRyxDQUFDLElBQUosQUFBUSxRQUFRLE9BQU8sUUFB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O0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJpbXBvcnQgRGF0ZVBpY2tlciBmcm9tICcuL2xpYnMvY29tcG9uZW50JztcblxuY29uc3Qgb25ET01Db250ZW50TG9hZGVkVGFza3MgPSBbKCkgPT4ge1xuICAgIHdpbmRvdy5EYXRlUGlja2VyID0gRGF0ZVBpY2tlci5pbml0KCcuanMtZGF0ZS1waWNrZXInLCB7XG4gICAgICAgIG1pbkRhdGU6ICcyNS8xMi8yMDE3JyxcbiAgICAgICAgbWF4RGF0ZTogJzE2LzAxLzIwMTgnXG4gICAgfSk7XG59XTtcbiAgICBcbmlmKCdhZGRFdmVudExpc3RlbmVyJyBpbiB3aW5kb3cpIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgKCkgPT4geyBvbkRPTUNvbnRlbnRMb2FkZWRUYXNrcy5mb3JFYWNoKChmbikgPT4gZm4oKSk7IH0pOyIsImltcG9ydCBkZWZhdWx0cyBmcm9tICcuL2xpYi9kZWZhdWx0cyc7XG5pbXBvcnQgY29tcG9uZW50UHJvdG90eXBlIGZyb20gJy4vbGliL2NvbXBvbmVudC1wcm90b3R5cGUnO1xuXG5jb25zdCBpbml0ID0gKHNlbCwgb3B0cykgPT4ge1xuXHRsZXQgZWxzID0gW10uc2xpY2UuY2FsbChkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKHNlbCkpO1xuICAgIC8vbGV0IGVscyA9IEFycmF5LmZyb20oZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChzZWwpKTtcblxuXHRpZighZWxzLmxlbmd0aCkgcmV0dXJuIGNvbnNvbGUud2FybignRGF0ZSBwaWNrZXIgbm90IGluaXRpYWxpc2VkLCBubyBhdWdtZW50YWJsZSBlbGVtZW50cyBmb3VuZCcpO1xuICAgIFxuXHRyZXR1cm4ge1xuXHRcdHBpY2tlcnM6IGVscy5tYXAoKGVsKSA9PiB7XG5cdFx0XHRyZXR1cm4gT2JqZWN0LmFzc2lnbihPYmplY3QuY3JlYXRlKGNvbXBvbmVudFByb3RvdHlwZSksIHtcblx0XHRcdFx0bm9kZTogZWwsIFxuXHRcdFx0XHRpbnB1dDogZWwucXVlcnlTZWxlY3RvcignLmpzLWlucHV0JyksXG5cdFx0XHRcdGJ0bjogZWwucXVlcnlTZWxlY3RvcignLmpzLWJ0bicpLFxuXHRcdFx0XHRidG5DbGVhcjogZWwucXVlcnlTZWxlY3RvcignLmpzLWJ0bl9fY2xlYXInKSxcblx0XHRcdFx0c2V0dGluZ3M6IE9iamVjdC5hc3NpZ24oe30sIGRlZmF1bHRzLCBvcHRzKVxuXHRcdFx0fSkuaW5pdCgpO1xuXHRcdH0pLFxuXHRcdGZpbmQoc2VsKXtcblx0XHRcdGxldCBjYW5kaWRhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHNlbCk7XG5cdFx0XHRpZighY2FuZGlkYXRlKSByZXR1cm4gY29uc29sZS53YXJuKCdEYXRlIHBpY2tlciBub3QgZm91bmQgZm9yIHRoaXMgc2VsZWN0b3InKTtcblx0XHRcdHJldHVybiB0aGlzLnBpY2tlcnMucmVkdWNlKChhY2MsIGN1cnIpID0+IHtcblx0XHRcdFx0aWYoY3Vyci5ub2RlID09PSBjYW5kaWRhdGUpIGFjYyA9IGN1cnI7XG5cdFx0XHRcdHJldHVybiBhY2M7XG5cdFx0XHR9LCBmYWxzZSk7XG5cdFx0fVxuXHR9O1xufTtcblxuZXhwb3J0IGRlZmF1bHQgeyBpbml0IH07IiwiaW1wb3J0IHsgXG5cdGVsZW1lbnRGYWN0b3J5LFxuXHRtb250aFZpZXdGYWN0b3J5LFxuXHRjYXRjaEJ1YmJsZSxcblx0Z2V0TW9udGhMZW5ndGgsXG5cdHBhcnNlRGF0ZSxcblx0Zm9ybWF0RGF0ZSxcblx0ZGF0ZUlzT3V0T2ZCb3VuZHMsXG5cdGdldE5leHRBY3RpdmVEYXlcbn0gZnJvbSAnLi91dGlscyc7XG5pbXBvcnQgeyBjYWxlbmRhciwgbW9udGggfSBmcm9tICcuL3RlbXBsYXRlcyc7XG5pbXBvcnQgeyBcblx0VFJJR0dFUl9FVkVOVFMsXG5cdFRSSUdHRVJfS0VZQ09ERVMsXG5cdEtFWUNPREVTLFxuXHRBUklBX0hFTFBfVEVYVCxcblx0Q0xBU1NOQU1FUyxcblx0U0VMRUNUT1JTLFxuXHREQVRBX0FUVFJJQlVURVNcbn0gZnJvbSAnLi9jb25zdGFudHMnO1xuXG5leHBvcnQgZGVmYXVsdCB7XG5cdGluaXQoKSB7XG5cdFx0dGhpcy5pbml0Q2xvbmUoKTtcblxuXHRcdFRSSUdHRVJfRVZFTlRTLmZvckVhY2goZXYgPT4ge1xuXHRcdFx0dGhpcy5idG4uYWRkRXZlbnRMaXN0ZW5lcihldiwgZSA9PiB7XG5cdFx0XHRcdGlmKCEhZS5rZXlDb2RlICYmICF+VFJJR0dFUl9LRVlDT0RFUy5pbmRleE9mKGUua2V5Q29kZSkpIHJldHVybjtcblx0XHRcdFx0Y2F0Y2hCdWJibGUoZSk7XG5cdFx0XHRcdHRoaXMudG9nZ2xlKCk7XG5cdFx0XHR9KTtcblx0XHRcdHRoaXMuYnRuQ2xlYXIgJiYgdGhpcy5idG5DbGVhci5hZGRFdmVudExpc3RlbmVyKGV2LCBlID0+IHtcblx0XHRcdFx0aWYoISFlLmtleUNvZGUgJiYgIX5UUklHR0VSX0tFWUNPREVTLmluZGV4T2YoZS5rZXlDb2RlKSkgcmV0dXJuO1xuXHRcdFx0XHR0aGlzLnJlc2V0KCk7XG5cdFx0XHR9KTtcblx0XHR9KTtcblxuXHRcdHRoaXMuc2V0RGF0ZUxpbWl0cygpO1xuXHRcdHRoaXMuYm91bmRIYW5kbGVGb2N1c091dCA9IHRoaXMuaGFuZGxlRm9jdXNPdXQuYmluZCh0aGlzKTtcblxuXHRcdHRoaXMuc3RhcnREYXRlID0gdGhpcy5pbnB1dC52YWx1ZSA/IHBhcnNlRGF0ZSh0aGlzLmlucHV0LnZhbHVlLCB0aGlzLnNldHRpbmdzLnZhbHVlRm9ybWF0KSA6IGZhbHNlO1xuXHRcdGlmKHRoaXMuc3RhcnREYXRlKSB0aGlzLmlucHV0Q2xvbmUudmFsdWUgPSBmb3JtYXREYXRlKHRoaXMuc3RhcnREYXRlLCB0aGlzLnNldHRpbmdzLmRpc3BsYXlGb3JtYXQpO1xuXG5cdFx0dGhpcy5yb290RGF0ZSA9IHRoaXMuc3RhcnREYXRlIHx8IG5ldyBEYXRlKCk7XG5cdFx0dGhpcy5yb290RGF0ZS5zZXRIb3VycygwLDAsMCwwKTtcblx0XHR0aGlzLnNldHRpbmdzLnN0YXJ0T3BlbiAmJiB0aGlzLm9wZW4oKTtcblx0XHRyZXR1cm4gdGhpcztcblx0fSxcblx0c2V0RGF0ZUxpbWl0cygpe1xuXHRcdFsnbWluJywgJ21heCddLmZvckVhY2gobGltaXQgPT4ge1xuXHRcdFx0aWYodGhpcy5zZXR0aW5nc1tgJHtsaW1pdH1EYXRlYF0gJiYgIXBhcnNlRGF0ZSh0aGlzLnNldHRpbmdzW2Ake2xpbWl0fURhdGVgXSwgdGhpcy5zZXR0aW5ncy52YWx1ZUZvcm1hdCkpIHJldHVybiBjb25zb2xlLndhcm4oYCR7bGltaXR9RGF0ZSBzZXR0aW5nIGNvdWxkIG5vdCBiZSBwYXJzZWRgKTtcblx0XHRcdHRoaXMuc2V0dGluZ3NbYCR7bGltaXR9RGF0ZWBdID0gdGhpcy5zZXR0aW5nc1tgJHtsaW1pdH1EYXRlYF0gJiYgcGFyc2VEYXRlKHRoaXMuc2V0dGluZ3NbYCR7bGltaXR9RGF0ZWBdLCB0aGlzLnNldHRpbmdzLnZhbHVlRm9ybWF0KTtcblx0XHR9KTtcblx0fSxcblx0aW5pdENsb25lKCl7XG5cdFx0dGhpcy5pbnB1dENsb25lID0gZWxlbWVudEZhY3RvcnkoJ2lucHV0JywgeyB0eXBlOiAndGV4dCcsIHRhYmluZGV4OiAtMX0sIHRoaXMuaW5wdXQuY2xhc3NOYW1lKTtcblx0XHR0aGlzLmlucHV0LnNldEF0dHJpYnV0ZSgndHlwZScsICdoaWRkZW4nKTtcblx0XHR0aGlzLm5vZGUuYXBwZW5kQ2hpbGQodGhpcy5pbnB1dENsb25lKTtcblxuXHRcdHRoaXMuaW5wdXRDbG9uZS5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCBlID0+IHtcblx0XHRcdGxldCBjYW5kaWRhdGUgPSBwYXJzZURhdGUodGhpcy5pbnB1dENsb25lLnZhbHVlLCB0aGlzLnNldHRpbmdzLmRpc3BsYXlGb3JtYXQpLy9mYWxzZSBpZiBwYXJzZSBmYWlsc1xuXHRcdFx0aWYoY2FuZGlkYXRlKSB0aGlzLnNldERhdGUoY2FuZGlkYXRlKTtcblx0XHRcdGVsc2UgdGhpcy5pbnB1dC52YWx1ZSA9IHRoaXMuaW5wdXRDbG9uZS52YWx1ZSA9ICcnO1xuXHRcdH0pO1xuXHR9LFxuXHR0b2dnbGUoKXtcblx0XHRpZih0aGlzLmlzT3BlbikgdGhpcy5jbG9zZSgpO1xuXHRcdGVsc2UgdGhpcy5vcGVuKCk7XG5cdH0sXG5cdG9wZW4oKXtcblx0XHRpZih0aGlzLmlzT3BlbikgcmV0dXJuO1xuXHRcdHRoaXMud29ya2luZ0RhdGUgPSB0aGlzLnJvb3REYXRlO1xuXHRcdHRoaXMucmVuZGVyQ2FsZW5kYXIoKTtcblx0XHR0aGlzLmlzT3BlbiA9IHRydWU7XG5cdFx0dGhpcy5idG4uc2V0QXR0cmlidXRlKCdhcmlhLWV4cGFuZGVkJywgJ3RydWUnKTtcblx0XHR0aGlzLmNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKFNFTEVDVE9SUy5CVE5fQUNUSVZFKSA/IHRoaXMuY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoU0VMRUNUT1JTLkJUTl9BQ1RJVkUpLmZvY3VzKCkgOiB0aGlzLmNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKFNFTEVDVE9SUy5CVE5fVE9EQVkpID8gdGhpcy5jb250YWluZXIucXVlcnlTZWxlY3RvcihTRUxFQ1RPUlMuQlROX1RPREFZKS5mb2N1cygpIDogdGhpcy5jb250YWluZXIucXVlcnlTZWxlY3RvckFsbChTRUxFQ1RPUlMuQlROX0RFRkFVTFQpWzBdLmZvY3VzKCk7XG5cdFx0ZG9jdW1lbnQuYm9keS5hZGRFdmVudExpc3RlbmVyKCdmb2N1c291dCcsIHRoaXMuYm91bmRIYW5kbGVGb2N1c091dCk7XG5cdH0sXG5cdGNsb3NlKCl7XG5cdFx0aWYoIXRoaXMuaXNPcGVuKSByZXR1cm47XG5cdFx0dGhpcy5ub2RlLnJlbW92ZUNoaWxkKHRoaXMuY29udGFpbmVyKTtcblx0XHR0aGlzLmlzT3BlbiA9IGZhbHNlO1xuXHRcdHRoaXMuYnRuLnNldEF0dHJpYnV0ZSgnYXJpYS1leHBhbmRlZCcsICdmYWxzZScpO1xuXHRcdHRoaXMuYnRuLmZvY3VzKCk7XG5cdFx0dGhpcy53b3JraW5nRGF0ZSA9IGZhbHNlO1xuXHR9LFxuXHRoYW5kbGVGb2N1c091dCgpe1xuXHRcdHdpbmRvdy5zZXRUaW1lb3V0KCgpID0+IHtcblx0XHRcdGlmKHRoaXMuY29udGFpbmVyLmNvbnRhaW5zKGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQpKSByZXR1cm47XG5cdFx0XHR0aGlzLmNsb3NlKCk7XG5cdFx0XHRkb2N1bWVudC5ib2R5LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2ZvY3Vzb3V0JywgdGhpcy5ib3VuZEhhbmRsZUZvY3VzT3V0KTtcblx0XHR9LCAxNik7XG5cdH0sXG5cdHJlbmRlckNhbGVuZGFyKCl7XG5cdFx0dGhpcy5jb250YWluZXIgPSBlbGVtZW50RmFjdG9yeSgnZGl2JywgeyAncm9sZSc6ICdkaWFsb2cnLCAnYXJpYS1oZWxwdGV4dCc6IEFSSUFfSEVMUF9URVhUIH0sIENMQVNTTkFNRVMuQ09OVEFJTkVSKTtcblx0XHR0aGlzLmNvbnRhaW5lci5pbm5lckhUTUwgPSBjYWxlbmRhcigpO1xuXHRcdHRoaXMubm9kZS5hcHBlbmRDaGlsZCh0aGlzLmNvbnRhaW5lcik7XG5cdFx0dGhpcy5tb250aENvbnRhaW5lciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoU0VMRUNUT1JTLk1PTlRIX0NPTlRBSU5FUik7XG5cdFx0dGhpcy5yZW5kZXJNb250aCgpO1xuXHRcdHRoaXMuaW5pdExpc3RlbmVycygpO1xuXHR9LFxuXHRyZW5kZXJNb250aCgpe1xuXHRcdHRoaXMubW9udGhWaWV3ID0gbW9udGhWaWV3RmFjdG9yeSh0aGlzLndvcmtpbmdEYXRlIHx8IHRoaXMucm9vdERhdGUsIHRoaXMuc3RhcnREYXRlLCB0aGlzLnNldHRpbmdzLm1pbkRhdGUsIHRoaXMuc2V0dGluZ3MubWF4RGF0ZSk7XG5cdFx0dGhpcy5tb250aENvbnRhaW5lci5pbm5lckhUTUwgPSBtb250aCh0aGlzLm1vbnRoVmlldyk7XG5cdFx0aWYoIXRoaXMuY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoYCR7U0VMRUNUT1JTLkJUTl9ERUZBVUxUfVt0YWJpbmRleD1cIjBcIl1gKSkgW10uc2xpY2UuY2FsbCh0aGlzLmNvbnRhaW5lci5xdWVyeVNlbGVjdG9yQWxsKGAke1NFTEVDVE9SUy5CVE5fREVGQVVMVH06bm90KFtkaXNhYmxlZF0pYCkpLnNoaWZ0KCkuc2V0QXR0cmlidXRlKCd0YWJpbmRleCcsICcwJyk7XG5cdFx0dGhpcy5lbmFibGVCdXR0b25zKCk7XG5cdH0sXG5cdGVuYWJsZUJ1dHRvbnMoKXtcblx0XHRbXS5zbGljZS5jYWxsKHRoaXMuY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3JBbGwoYC4ke0NMQVNTTkFNRVMuTkFWX0JUTn1gKSlcblx0XHRcdC5mb3JFYWNoKChidG4sIGkpID0+IHtcblx0XHRcdFx0aWYoZGF0ZUlzT3V0T2ZCb3VuZHMoIUJvb2xlYW4oaSksIHRoaXMud29ya2luZ0RhdGUsIHRoaXMuc2V0dGluZ3MubWluRGF0ZSwgdGhpcy5zZXR0aW5ncy5tYXhEYXRlKSkgYnRuLnNldEF0dHJpYnV0ZSgnZGlzYWJsZWQnLCdkaXNhYmxlZCcpO1xuXHRcdFx0XHRlbHNlIGlmIChidG4uaGFzQXR0cmlidXRlKCdkaXNhYmxlZCcpKSBidG4ucmVtb3ZlQXR0cmlidXRlKCdkaXNhYmxlZCcpO1xuXHRcdFx0fSk7XG5cdH0sXG5cdGluaXRMaXN0ZW5lcnMoKXtcblx0XHRUUklHR0VSX0VWRU5UUy5mb3JFYWNoKGV2ID0+IHtcblx0XHRcdHRoaXMuY29udGFpbmVyLmFkZEV2ZW50TGlzdGVuZXIoZXYsIHRoaXMucm91dGVIYW5kbGVycy5iaW5kKHRoaXMpKTtcblx0XHR9KTtcblx0fSxcblx0cm91dGVIYW5kbGVycyhlKXtcblx0XHRpZihlLmtleUNvZGUpIHRoaXMuaGFuZGxlS2V5RG93bihlKTtcblx0XHRlbHNlIHtcblx0XHRcdGlmKGUudGFyZ2V0LmNsYXNzTGlzdC5jb250YWlucyhDTEFTU05BTUVTLk5BVl9CVE4pIHx8IGUudGFyZ2V0LnBhcmVudE5vZGUuY2xhc3NMaXN0LmNvbnRhaW5zKENMQVNTTkFNRVMuTkFWX0JUTikpIHRoaXMuaGFuZGxlTmF2KGUpO1xuXHRcdFx0aWYoZS50YXJnZXQuY2xhc3NMaXN0LmNvbnRhaW5zKENMQVNTTkFNRVMuQlROX0RFRkFVTFQpKSB0aGlzLnNlbGVjdERhdGUoZSk7XG5cdFx0fVxuXHR9LFxuXHRoYW5kbGVOYXYoZSl7XG5cdFx0bGV0IGFjdGlvbiA9ICsoZS50YXJnZXQuZ2V0QXR0cmlidXRlKERBVEFfQVRUUklCVVRFUy5BQ1RJT04pIHx8IGUudGFyZ2V0LnBhcmVudE5vZGUuZ2V0QXR0cmlidXRlKERBVEFfQVRUUklCVVRFUy5BQ1RJT04pKTtcblx0XHR0aGlzLndvcmtpbmdEYXRlID0gbmV3IERhdGUodGhpcy53b3JraW5nRGF0ZS5nZXRGdWxsWWVhcigpLCB0aGlzLndvcmtpbmdEYXRlLmdldE1vbnRoKCkgKyBhY3Rpb24pO1xuXHRcdHRoaXMucmVuZGVyTW9udGgoKTtcblx0XHRpZihlLnRhcmdldC5oYXNBdHRyaWJ1dGUoJ2Rpc2FibGVkJykgfHwgZS50YXJnZXQucGFyZW50Tm9kZS5oYXNBdHRyaWJ1dGUoJ2Rpc2FibGVkJykpIFtdLnNsaWNlLmNhbGwodGhpcy5jb250YWluZXIucXVlcnlTZWxlY3RvckFsbChgJHtTRUxFQ1RPUlMuQlROX0RFRkFVTFR9Om5vdChbZGlzYWJsZWRdKWApKVtCb29sZWFuKGFjdGlvbiArIDEpID8gJ3NoaWZ0JyA6ICdwb3AnXSgpLmZvY3VzKCk7XG5cdH0sXG5cdGhhbmRsZUtleURvd24oZSl7XG5cdFx0Y29uc3Qga2V5RG93bkRpY3Rpb25hcnkgPSB7XG5cdFx0XHRQQUdFX1VQKCl7XG5cdFx0XHRcdGNhdGNoQnViYmxlKGUpO1xuXHRcdFx0XHRrZXlEb3duRGljdGlvbmFyeS5QQUdFLmNhbGwodGhpcywgdHJ1ZSk7XG5cdFx0XHR9LFxuXHRcdFx0UEFHRV9ET1dOKCl7XG5cdFx0XHRcdGNhdGNoQnViYmxlKGUpO1xuXHRcdFx0XHRrZXlEb3duRGljdGlvbmFyeS5QQUdFLmNhbGwodGhpcywgZmFsc2UpO1xuXHRcdFx0fSxcblx0XHRcdFBBR0UodXApe1xuXHRcdFx0XHRpZihkYXRlSXNPdXRPZkJvdW5kcyh1cCwgdGhpcy53b3JraW5nRGF0ZSwgdGhpcy5zZXR0aW5ncy5taW5EYXRlLCB0aGlzLnNldHRpbmdzLm1heERhdGUpKSByZXR1cm47XG5cblx0XHRcdFx0bGV0IG5leHRNb250aCA9IHVwID09PSB0cnVlID8gdGhpcy53b3JraW5nRGF0ZS5nZXRNb250aCgpIC0gMSA6IHRoaXMud29ya2luZ0RhdGUuZ2V0TW9udGgoKSArIDEsXG5cdFx0XHRcdFx0dGFyZ2V0RGF5ID0gZ2V0TmV4dEFjdGl2ZURheShuZXh0TW9udGgsIGUudGFyZ2V0LmdldEF0dHJpYnV0ZShEQVRBX0FUVFJJQlVURVMuREFZKSwgdGhpcy53b3JraW5nRGF0ZSwgdXAsIHRoaXMuc2V0dGluZ3MubWluRGF0ZSwgdGhpcy5zZXR0aW5ncy5tYXhEYXRlKTtcblx0XHRcdFx0XHRcblx0XHRcdFx0dGhpcy53b3JraW5nRGF0ZSA9IG5ldyBEYXRlKHRoaXMud29ya2luZ0RhdGUuZ2V0RnVsbFllYXIoKSwgbmV4dE1vbnRoLCB0YXJnZXREYXkpO1xuXHRcdFx0XHR0aGlzLnJlbmRlck1vbnRoKCk7XG5cdFx0XHRcdGxldCBmb2N1c2FibGVEYXkgPSB0aGlzLmNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKGBbJHtEQVRBX0FUVFJJQlVURVMuREFZfT1cIiR7dGFyZ2V0RGF5fVwiXTpub3QoOmRpc2FibGVkKWApO1xuXHRcdFx0XHRmb2N1c2FibGVEYXkgJiYgZm9jdXNhYmxlRGF5LmZvY3VzKCk7XG5cdFx0XHR9LFxuXHRcdFx0VEFCKCl7XG5cdFx0XHRcdC8qIFxuXHRcdFx0XHRcdC0gdHJhcCB0YWIgaW4gZm9jdXNhYmxlIGNoaWxkcmVuPz9cblx0XHRcdFx0XHRcdCAtIHJldHVybiB0byBidXR0b24gYWZ0ZXIgbGFzdCBmb2N1c2FibGUgY2hpbGQ/XG5cdFx0XHRcdFx0LSByZWYuIGh0dHBzOi8vZ2l0aHViLmNvbS9tamJwL3N0b3JtLWZvY3VzLW1hbmFnZXIvYmxvYi9tYXN0ZXIvc3JjL3N0b3JtLWZvY3VzLW1hbmFnZXIuanNcblx0XHRcdFx0Ki9cblx0XHRcdH0sXG5cdFx0XHRFTlRFUihlKXtcblx0XHRcdFx0Y2F0Y2hCdWJibGUoZSk7XG5cdFx0XHRcdGlmKGUudGFyZ2V0LmNsYXNzTGlzdC5jb250YWlucyhDTEFTU05BTUVTLkJUTl9ERUZBVUxUKSkgdGhpcy5zZWxlY3REYXRlKGUpO1xuXHRcdFx0XHRpZihlLnRhcmdldC5jbGFzc0xpc3QuY29udGFpbnMoQ0xBU1NOQU1FUy5OQVZfQlROKSkgdGhpcy5oYW5kbGVOYXYoZSk7XG5cdFx0XHR9LFxuXHRcdFx0RVNDQVBFKCl7IHRoaXMuY2xvc2UoKTsgfSxcblx0XHRcdFNQQUNFKGUpIHsga2V5RG93bkRpY3Rpb25hcnkuRU5URVIoZSk7IH0sXG5cdFx0XHRMRUZUKGUpe1xuXHRcdFx0XHRjYXRjaEJ1YmJsZShlKTtcblx0XHRcdFx0aWYoIWUudGFyZ2V0LmNsYXNzTGlzdC5jb250YWlucyhDTEFTU05BTUVTLkJUTl9ERUZBVUxUKSkgcmV0dXJuO1xuXG5cdFx0XHRcdGlmKHRoaXMubW9udGhWaWV3Lm1vZGVsWytlLnRhcmdldC5nZXRBdHRyaWJ1dGUoREFUQV9BVFRSSUJVVEVTLk1PREVMX0lOREVYKV0ubnVtYmVyID09PSAxKSB7XG5cdFx0XHRcdFx0dGhpcy53b3JraW5nRGF0ZSA9IG5ldyBEYXRlKHRoaXMud29ya2luZ0RhdGUuZ2V0RnVsbFllYXIoKSwgdGhpcy53b3JraW5nRGF0ZS5nZXRNb250aCgpIC0gMSk7XG5cdFx0XHRcdFx0dGhpcy5yZW5kZXJNb250aCgpO1xuXHRcdFx0XHRcdGxldCBmb2N1c2FibGVEYXlzID0gW10uc2xpY2UuY2FsbCh0aGlzLmNvbnRhaW5lci5xdWVyeVNlbGVjdG9yQWxsKFNFTEVDVE9SUy5CVE5fRU5BQkxFRCkpO1xuXHRcdFx0XHRcdGZvY3VzYWJsZURheXMubGVuZ3RoID4gMCAmJiBmb2N1c2FibGVEYXlzLnBvcCgpLmZpcnN0RWxlbWVudENoaWxkLmZvY3VzKCk7XG5cdFx0XHRcdH1cblx0XHRcdFx0ZWxzZSB0aGlzLmNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKGBbJHtEQVRBX0FUVFJJQlVURVMuTU9ERUxfSU5ERVh9PVwiJHsrZS50YXJnZXQuZ2V0QXR0cmlidXRlKERBVEFfQVRUUklCVVRFUy5NT0RFTF9JTkRFWCkgLSAxfVwiXWApLmZvY3VzKCk7XG5cdFx0XHR9LFxuXHRcdFx0VVAoKXtcblx0XHRcdFx0Y2F0Y2hCdWJibGUoZSk7XG5cdFx0XHRcdGlmKCFlLnRhcmdldC5jbGFzc0xpc3QuY29udGFpbnMoQ0xBU1NOQU1FUy5CVE5fREVGQVVMVCkpIHJldHVybjtcblx0XHRcdFx0XG5cdFx0XHRcdGxldCBuZXh0RGF5SW5kZXggPSArZS50YXJnZXQuZ2V0QXR0cmlidXRlKERBVEFfQVRUUklCVVRFUy5NT0RFTF9JTkRFWCkgLSA3O1xuXG5cdFx0XHRcdGlmKCt0aGlzLm1vbnRoVmlldy5tb2RlbFsrZS50YXJnZXQuZ2V0QXR0cmlidXRlKERBVEFfQVRUUklCVVRFUy5NT0RFTF9JTkRFWCldLm51bWJlciAtIDcgPCAxKSB7XG5cdFx0XHRcdFx0dGhpcy53b3JraW5nRGF0ZSA9IG5ldyBEYXRlKHRoaXMud29ya2luZ0RhdGUuZ2V0RnVsbFllYXIoKSwgdGhpcy53b3JraW5nRGF0ZS5nZXRNb250aCgpIC0gMSk7XG5cdFx0XHRcdFx0dGhpcy5yZW5kZXJNb250aCgpO1xuXHRcdFx0XHRcdC8vdXNlIHRoaXMud29ya2luZ0RhdGUgaW5zdGVhZCBvZiBxdWVyeWluZyBET00/XG5cdFx0XHRcdFx0aWYoIXRoaXMuY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoYFske0RBVEFfQVRUUklCVVRFUy5NT0RFTF9JTkRFWH09XCIke3RoaXMubW9udGhWaWV3Lm1vZGVsLmxlbmd0aCArIG5leHREYXlJbmRleH1cIl1gKXx8IHRoaXMuY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoYFske0RBVEFfQVRUUklCVVRFUy5NT0RFTF9JTkRFWH09XCIke3RoaXMubW9udGhWaWV3Lm1vZGVsLmxlbmd0aCArIG5leHREYXlJbmRleH1cIl1gKSAmJiB0aGlzLmNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKGBbJHtEQVRBX0FUVFJJQlVURVMuTU9ERUxfSU5ERVh9PVwiJHt0aGlzLm1vbnRoVmlldy5tb2RlbC5sZW5ndGggKyBuZXh0RGF5SW5kZXh9XCJdYCkuaGFzQXR0cmlidXRlKCdkaXNhYmxlZCcpKSBcblx0XHRcdFx0XHRcdHRoaXMuY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoYFske0RBVEFfQVRUUklCVVRFUy5NT0RFTF9JTkRFWH09XCIke3RoaXMubW9udGhWaWV3Lm1vZGVsLmxlbmd0aCArIChuZXh0RGF5SW5kZXggLSA3KX1cIl1gKS5mb2N1cygpO1xuXHRcdFx0XHRcdGVsc2UgdGhpcy5jb250YWluZXIucXVlcnlTZWxlY3RvcihgWyR7REFUQV9BVFRSSUJVVEVTLk1PREVMX0lOREVYfT1cIiR7dGhpcy5tb250aFZpZXcubW9kZWwubGVuZ3RoICsgbmV4dERheUluZGV4fVwiXWApLmZvY3VzKCk7XG5cdFx0XHRcdH1cblx0XHRcdFx0ZWxzZSB0aGlzLmNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKGBbJHtEQVRBX0FUVFJJQlVURVMuTU9ERUxfSU5ERVh9PVwiJHtuZXh0RGF5SW5kZXh9XCJdYCkuZm9jdXMoKTtcblx0XHRcdH0sXG5cdFx0XHRSSUdIVChlKXtcblx0XHRcdFx0Y2F0Y2hCdWJibGUoZSk7XG5cdFx0XHRcdGlmKCFlLnRhcmdldC5jbGFzc0xpc3QuY29udGFpbnMoQ0xBU1NOQU1FUy5CVE5fREVGQVVMVCkpIHJldHVybjtcblx0XHRcdFx0XG5cdFx0XHRcdGlmKHRoaXMubW9udGhWaWV3Lm1vZGVsWytlLnRhcmdldC5nZXRBdHRyaWJ1dGUoREFUQV9BVFRSSUJVVEVTLk1PREVMX0lOREVYKV0ubnVtYmVyID09PSBnZXRNb250aExlbmd0aCh0aGlzLm1vbnRoVmlldy5tb2RlbFsrZS50YXJnZXQuZ2V0QXR0cmlidXRlKERBVEFfQVRUUklCVVRFUy5NT0RFTF9JTkRFWCldLmRhdGUuZ2V0RnVsbFllYXIoKSwgdGhpcy5tb250aFZpZXcubW9kZWxbK2UudGFyZ2V0LmdldEF0dHJpYnV0ZShEQVRBX0FUVFJJQlVURVMuTU9ERUxfSU5ERVgpXS5kYXRlLmdldE1vbnRoKCkpKSB7XG5cdFx0XHRcdFx0dGhpcy53b3JraW5nRGF0ZSA9IG5ldyBEYXRlKHRoaXMud29ya2luZ0RhdGUuZ2V0RnVsbFllYXIoKSwgdGhpcy53b3JraW5nRGF0ZS5nZXRNb250aCgpICsgMSk7XG5cdFx0XHRcdFx0dGhpcy5yZW5kZXJNb250aCgpO1xuXHRcdFx0XHRcdFtdLnNsaWNlLmNhbGwodGhpcy5jb250YWluZXIucXVlcnlTZWxlY3RvckFsbChTRUxFQ1RPUlMuQlROX0VOQUJMRUQpKS5zaGlmdCgpLmZpcnN0RWxlbWVudENoaWxkLmZvY3VzKCk7XG5cdFx0XHRcdH1cblx0XHRcdFx0ZWxzZSB0aGlzLmNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKGBbJHtEQVRBX0FUVFJJQlVURVMuTU9ERUxfSU5ERVh9PVwiJHsrZS50YXJnZXQuZ2V0QXR0cmlidXRlKERBVEFfQVRUUklCVVRFUy5NT0RFTF9JTkRFWCkgKyAxfVwiXWApLmZvY3VzKCk7XG5cdFx0XHRcdFxuXHRcdFx0fSxcblx0XHRcdERPV04oKXtcblx0XHRcdFx0Y2F0Y2hCdWJibGUoZSk7XG5cdFx0XHRcdGlmKCFlLnRhcmdldC5jbGFzc0xpc3QuY29udGFpbnMoQ0xBU1NOQU1FUy5CVE5fREVGQVVMVCkpIHJldHVybjtcblxuXHRcdFx0XHRsZXQgbmV4dERhdGUgPSArdGhpcy5tb250aFZpZXcubW9kZWxbK2UudGFyZ2V0LmdldEF0dHJpYnV0ZShEQVRBX0FUVFJJQlVURVMuTU9ERUxfSU5ERVgpXS5udW1iZXIgKyA3LFxuXHRcdFx0XHRcdG5leHREYXlJbmRleCA9ICtlLnRhcmdldC5nZXRBdHRyaWJ1dGUoREFUQV9BVFRSSUJVVEVTLk1PREVMX0lOREVYKSArIDc7XG5cblx0XHRcdFx0aWYoK3RoaXMubW9udGhWaWV3Lm1vZGVsWytlLnRhcmdldC5nZXRBdHRyaWJ1dGUoREFUQV9BVFRSSUJVVEVTLk1PREVMX0lOREVYKV0ubnVtYmVyICsgNyA+IGdldE1vbnRoTGVuZ3RoKHRoaXMubW9udGhWaWV3Lm1vZGVsWytlLnRhcmdldC5nZXRBdHRyaWJ1dGUoREFUQV9BVFRSSUJVVEVTLk1PREVMX0lOREVYKV0uZGF0ZS5nZXRGdWxsWWVhcigpLCB0aGlzLm1vbnRoVmlldy5tb2RlbFsrZS50YXJnZXQuZ2V0QXR0cmlidXRlKERBVEFfQVRUUklCVVRFUy5NT0RFTF9JTkRFWCldLmRhdGUuZ2V0TW9udGgoKSkpIHtcblx0XHRcdFx0XHR0aGlzLndvcmtpbmdEYXRlID0gbmV3IERhdGUodGhpcy53b3JraW5nRGF0ZS5nZXRGdWxsWWVhcigpLCB0aGlzLndvcmtpbmdEYXRlLmdldE1vbnRoKCkgKyAxKTtcblx0XHRcdFx0XHR0aGlzLnJlbmRlck1vbnRoKCk7XG5cdFx0XHRcdFx0Ly91c2UgdGhpcy53b3JraW5nRGF0ZSBpbnN0ZWFkIG9mIHF1ZXJ5aW5nIERPTT9cblx0XHRcdFx0XHRpZih0aGlzLmNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKGBbJHtEQVRBX0FUVFJJQlVURVMuTU9ERUxfSU5ERVh9PVwiJHtuZXh0RGF5SW5kZXggJSA3fVwiXWApLmhhc0F0dHJpYnV0ZSgnZGlzYWJsZWQnKSkgdGhpcy5jb250YWluZXIucXVlcnlTZWxlY3RvcihgWyR7REFUQV9BVFRSSUJVVEVTLk1PREVMX0lOREVYfT1cIiR7KG5leHREYXlJbmRleCAlIDcpICsgN31cIl1gKS5mb2N1cygpO1xuXHRcdFx0XHRcdGVsc2UgdGhpcy5jb250YWluZXIucXVlcnlTZWxlY3RvcihgWyR7REFUQV9BVFRSSUJVVEVTLk1PREVMX0lOREVYfT1cIiR7bmV4dERheUluZGV4ICUgN31cIl1gKS5mb2N1cygpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGVsc2UgdGhpcy5jb250YWluZXIucXVlcnlTZWxlY3RvcihgWyR7REFUQV9BVFRSSUJVVEVTLk1PREVMX0lOREVYfT1cIiR7bmV4dERheUluZGV4fVwiXWApLmZvY3VzKCk7XG5cdFx0XHR9XG5cdFx0fTtcblx0XHRpZihLRVlDT0RFU1tlLmtleUNvZGVdICYmIGtleURvd25EaWN0aW9uYXJ5W0tFWUNPREVTW2Uua2V5Q29kZV1dKSBrZXlEb3duRGljdGlvbmFyeVtLRVlDT0RFU1tlLmtleUNvZGVdXS5jYWxsKHRoaXMsIGUpO1xuXHR9LFxuXHRzZWxlY3REYXRlKGUpe1xuXHRcdGUudGFyZ2V0LmNsYXNzTGlzdC5hZGQoU0VMRUNUT1JTLkJUTl9BQ1RJVkUpO1xuXHRcdHRoaXMuc2V0RGF0ZSh0aGlzLm1vbnRoVmlldy5tb2RlbFsrZS50YXJnZXQuZ2V0QXR0cmlidXRlKERBVEFfQVRUUklCVVRFUy5NT0RFTF9JTkRFWCldLmRhdGUpO1x0XG5cdFx0dGhpcy5jbG9zZSgpO1xuXHR9LFxuXHRyZXNldCgpe1xuXHRcdHRoaXMucm9vdERhdGUgPSBuZXcgRGF0ZSgpO1xuXHRcdHRoaXMucm9vdERhdGUuc2V0SG91cnMoMCwwLDAsMCk7XG5cdFx0dGhpcy5zdGFydERhdGUgPSBmYWxzZTtcblx0XHR0aGlzLmlucHV0Q2xvbmUudmFsdWUgPSAnJztcblx0XHR0aGlzLmlucHV0LnZhbHVlID0gJyc7XG5cdFx0dGhpcy5ub2RlLmNsYXNzTGlzdC5yZW1vdmUoQ0xBU1NOQU1FUy5IQVNfVkFMVUUpO1x0XG5cdFx0aWYodGhpcy5pc09wZW4pIHRoaXMuY2xvc2UoKTtcblx0fSxcblx0c2V0RGF0ZShuZXh0RGF0ZSl7XG5cdFx0dGhpcy5zdGFydERhdGUgPSBuZXh0RGF0ZTtcblx0XHR0aGlzLnJvb3REYXRlID0gdGhpcy5zdGFydERhdGU7XG5cdFx0dGhpcy5pbnB1dENsb25lLnZhbHVlID0gZm9ybWF0RGF0ZSh0aGlzLnN0YXJ0RGF0ZSwgdGhpcy5zZXR0aW5ncy5kaXNwbGF5Rm9ybWF0KTtcblx0XHR0aGlzLmlucHV0LnZhbHVlID0gZm9ybWF0RGF0ZSh0aGlzLnN0YXJ0RGF0ZSwgdGhpcy5zZXR0aW5ncy52YWx1ZUZvcm1hdCk7XG5cdFx0IXRoaXMubm9kZS5jbGFzc0xpc3QuY29udGFpbnMoQ0xBU1NOQU1FUy5IQVNfVkFMVUUpICYmIHRoaXMubm9kZS5jbGFzc0xpc3QuYWRkKENMQVNTTkFNRVMuSEFTX1ZBTFVFKTtcblx0fSxcblx0Z2V0VmFsdWUoKXsgcmV0dXJuIHRoaXMuc3RhcnREYXRlOyB9LFxuXHRzZXRWYWx1ZShuZXh0VmFsdWUsIGZvcm1hdCA9IHRoaXMuc2V0dGluZ3MudmFsdWVGb3JtYXQpe1xuXHRcdHRoaXMuc2V0RGF0ZShwYXJzZURhdGUobmV4dFZhbHVlLCBmb3JtYXQpKTtcblx0XHRpZih0aGlzLmlzT3BlbikgdGhpcy53b3JraW5nRGF0ZSA9IHRoaXMuc3RhcnREYXRlLCB0aGlzLnJlbmRlck1vbnRoKCk7XG5cdH1cbn07IiwiZXhwb3J0IGNvbnN0IFRSSUdHRVJfRVZFTlRTID0gWydjbGljaycsICdrZXlkb3duJ107XG5cbmV4cG9ydCBjb25zdCBUUklHR0VSX0tFWUNPREVTID0gWzEzLCAzMl07XG5cbmV4cG9ydCBjb25zdCBLRVlDT0RFUyA9IHtcbiAgICA5OiAnVEFCJyxcbiAgICAxMzogJ0VOVEVSJyxcbiAgICAyNzogJ0VTQ0FQRScsXG4gICAgMzI6ICdTUEFDRScsXG4gICAgMzM6ICdQQUdFX1VQJyxcbiAgICAzNDogJ1BBR0VfRE9XTicsXG4gICAgMzc6ICdMRUZUJyxcbiAgICAzODogJ1VQJyxcbiAgICAzOTogJ1JJR0hUJyxcbiAgICA0MDogJ0RPV04nXG59O1xuXG5leHBvcnQgY29uc3QgTU9OVEhTID0gWydKYW51YXJ5JywgJ0ZlYnJ1YXJ5JywgJ01hcmNoJywgJ0FwcmlsJywgJ01heScsICdKdW5lJywgJ0p1bHknLCAnQXVndXN0JywgJ1NlcHRlbWJlcicsICdPY3RvYmVyJywgJ05vdmVtYmVyJywgJ0RlY2VtYmVyJ107XG5cbmV4cG9ydCBjb25zdCBEQVlTID0gWydTdW5kYXknLCdNb25kYXknLCdUdWVzZGF5JywnV2VkbmVzZGF5JywnVGh1cnNkYXknLCdGcmlkYXknLCdTYXR1cmRheSddO1xuXG5leHBvcnQgY29uc3QgQVJJQV9IRUxQX1RFWFQgPSBgUHJlc3MgdGhlIGFycm93IGtleXMgdG8gbmF2aWdhdGUgYnkgZGF5LCBQYWdlVXAgYW5kIFBhZ2VEb3duIHRvIG5hdmlnYXRlIGJ5IG1vbnRoLCBFbnRlciBvciBTcGFjZSB0byBzZWxlY3QgYSBkYXRlLCBhbmQgRXNjYXBlIHRvIGNhbmNlbC5gO1xuXG4vKlxuIHRvIGRvOlxuIGNvbWJpbmUgQ0xBU1NOQU1FUyBhbmQgU0VMRUNUT1JTIChyZW1vdmUgU0VMRVRPUlMgYW5kIGFwcGVuZCBkb3QgbWFudWFsbHkpXG4qL1xuZXhwb3J0IGNvbnN0IENMQVNTTkFNRVMgPSB7XG4gICAgQ09OVEFJTkVSOiAnc2RwLWNvbnRhaW5lcicsXG4gICAgTkFWX0JUTjogJ2pzLXNkcC1uYXZfX2J0bicsXG4gICAgQlROX0RFRkFVTFQ6ICdzZHAtZGF5LWJ0bicsXG4gICAgTU9OVEhfQ09OVEFJTkVSOiAnanMtc2RwX19tb250aCcsXG4gICAgSEFTX1ZBTFVFOiAnaGFzLS12YWx1ZSdcbn07XG5cbmV4cG9ydCBjb25zdCBTRUxFQ1RPUlMgPSB7XG4gICAgQlROX0RFRkFVTFQ6ICcuc2RwLWRheS1idG4nLFxuICAgIEJUTl9BQ1RJVkU6ICcuc2RwLWRheS1idG4tLWlzLWFjdGl2ZScsXG4gICAgQlROX1RPREFZOiAnLnNkcC1kYXktYnRuLS1pcy10b2RheScsXG4gICAgQlROX0VOQUJMRUQ6ICcuc2RwLWRheS1ib2R5Om5vdCguc2RwLWRheS1kaXNhYmxlZCknLFxuICAgIE1PTlRIX0NPTlRBSU5FUjogJy5qcy1zZHBfX21vbnRoJyxcbn07XG5cbmV4cG9ydCBjb25zdCBEQVRBX0FUVFJJQlVURVMgPSB7XG4gICAgQUNUSU9OOiAnZGF0YS1hY3Rpb24nLFxuICAgIE1PREVMX0lOREVYOiAnZGF0YS1tb2RlbC1pbmRleCcsXG4gICAgREFZOiAnZGF0YS1kYXknXG59OyIsImV4cG9ydCBkZWZhdWx0IHtcblx0Y2FsbGJhY2s6IG51bGwsXG5cdHN0YXJ0T3BlbjogZmFsc2UsXG5cdHN0YXJ0RGF0ZTogZmFsc2UsXG5cdG1pbkRhdGU6IGZhbHNlLFxuXHRtYXhEYXRlOiBmYWxzZSxcblx0Ly8gY2xvc2VPblNlbGVjdDogZmFsc2UsXG5cdGRpc3BsYXlGb3JtYXQ6ICdkZGRkIE1NTU0gRCwgWVlZWScsIC8vVGh1cnNkYXkgSmFudWFyeSAxMiwgMjAxN1xuXHR2YWx1ZUZvcm1hdDogJ0REL01NL1lZWVknXG59OyIsImltcG9ydCB7IENMQVNTTkFNRVMsIE1PTlRIUywgREFZUyB9IGZyb20gJy4vY29uc3RhbnRzJztcblxuZXhwb3J0IGNvbnN0IGNhbGVuZGFyID0gcHJvcHMgPT4gYDxkaXYgY2xhc3M9XCJzZHAtZGF0ZVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxidXR0b24gY2xhc3M9XCIke0NMQVNTTkFNRVMuTkFWX0JUTn0gc2RwLWJhY2tcIiB0eXBlPVwiYnV0dG9uXCIgZGF0YS1hY3Rpb249XCItMVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3ZnIGZvY3VzYWJsZT1cImZhbHNlXCIgY2xhc3M9XCJzZHAtYnRuX19pY29uXCIgd2lkdGg9XCIxOVwiIGhlaWdodD1cIjE5XCIgdmlld0JveD1cIjAgMCAxMDAwIDEwMDBcIj48cGF0aCBkPVwiTTMzNi4yIDI3NC41bC0yMTAuMSAyMTBoODA1LjRjMTMgMCAyMyAxMCAyMyAyM3MtMTAgMjMtMjMgMjNIMTI2LjFsMjEwLjEgMjEwLjFjMTEgMTEgMTEgMjEgMCAzMi01IDUtMTAgNy0xNiA3cy0xMS0yLTE2LTdsLTI0OS4xLTI0OWMtMTEtMTEtMTEtMjEgMC0zMmwyNDkuMS0yNDkuMWMyMS0yMS4xIDUzIDEwLjkgMzIgMzJ6XCI+PC9wYXRoPjwvc3ZnPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxidXR0b24gY2xhc3M9XCIke0NMQVNTTkFNRVMuTkFWX0JUTn0gc2RwLW5leHRcIiB0eXBlPVwiYnV0dG9uXCIgZGF0YS1hY3Rpb249XCIxXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzdmcgZm9jdXNhYmxlPVwiZmFsc2VcIiBjbGFzcz1cInNkcC1idG5fX2ljb25cIiB3aWR0aD1cIjE5XCIgaGVpZ2h0PVwiMTlcIiB2aWV3Qm94PVwiMCAwIDEwMDAgMTAwMFwiPjxwYXRoIGQ9XCJNNjk0LjQgMjQyLjRsMjQ5LjEgMjQ5LjFjMTEgMTEgMTEgMjEgMCAzMkw2OTQuNCA3NzIuN2MtNSA1LTEwIDctMTYgN3MtMTEtMi0xNi03Yy0xMS0xMS0xMS0yMSAwLTMybDIxMC4xLTIxMC4xSDY3LjFjLTEzIDAtMjMtMTAtMjMtMjNzMTAtMjMgMjMtMjNoODA1LjRMNjYyLjQgMjc0LjVjLTIxLTIxLjEgMTEtNTMuMSAzMi0zMi4xelwiPjwvcGF0aD48L3N2Zz5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiJHtDTEFTU05BTUVTLk1PTlRIX0NPTlRBSU5FUn1cIj48L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PmA7XG5cbmV4cG9ydCBjb25zdCBtb250aCA9IHByb3BzID0+IGA8ZGl2IGNsYXNzPVwic2RwLW1vbnRoLWxhYmVsXCI+JHtwcm9wcy5tb250aFRpdGxlfSAke3Byb3BzLnllYXJUaXRsZX08L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDx0YWJsZSBjbGFzcz1cInNkcC1kYXlzXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRoZWFkIGNsYXNzPVwic2RwLWRheXMtaGVhZFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dHIgY2xhc3M9XCJzZHAtZGF5cy1yb3dcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0aCBjbGFzcz1cInNkcC1kYXktaGVhZFwiPk1vPC90aD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0aCBjbGFzcz1cInNkcC1kYXktaGVhZFwiPlR1PC90aD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0aCBjbGFzcz1cInNkcC1kYXktaGVhZFwiPldlPC90aD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0aCBjbGFzcz1cInNkcC1kYXktaGVhZFwiPlRoPC90aD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0aCBjbGFzcz1cInNkcC1kYXktaGVhZFwiPkZyPC90aD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0aCBjbGFzcz1cInNkcC1kYXktaGVhZFwiPlNhPC90aD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0aCBjbGFzcz1cInNkcC1kYXktaGVhZFwiPlN1PC90aD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC90cj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3RoZWFkPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0Ym9keSBjbGFzcz1cInNkcC1kYXlzLWJvZHlcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHtwcm9wcy5tb2RlbC5tYXAod2Vla3MocHJvcHMuYWN0aXZlKSkuam9pbignJyl9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC90Ym9keT5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvdGFibGU+YDtcblxuY29uc3QgZGF5ID0gKGFjdGl2ZURheXMsIHByb3BzLCBpKSA9PiBgPHRkIGNsYXNzPVwic2RwLWRheS1ib2R5JHtwcm9wcy5pc091dE9mUmFuZ2UgPyAnIHNkcC1kYXktZGlzYWJsZWQnIDogcHJvcHMubmV4dE1vbnRoID8gJyBzZHAtZGF5LW5leHQtbW9udGggc2RwLWRheS1kaXNhYmxlZCcgOiAnJ30ke3Byb3BzLnByZXZpb3VzTW9udGggPyAnIHNkcC1kYXktcHJldi1tb250aCBzZHAtZGF5LWRpc2FibGVkJyA6ICcnfSR7cHJvcHMuYWN0aXZlID8gJyBzZHAtZGF5LXNlbGVjdGVkJyA6ICcnfVwiPjxidXR0b24gdGFiaW5kZXg9XCIke3Byb3BzLmlzU3RhcnREYXRlID8gMCA6IHByb3BzLmlzVG9kYXkgPyAwIDogLTF9XCIgY2xhc3M9XCJzZHAtZGF5LWJ0biR7cHJvcHMuaXNUb2RheSA/ICcgc2RwLWRheS1idG4tLWlzLXRvZGF5JyA6ICcnfSR7cHJvcHMuaXNTdGFydERhdGUgPyAnIHNkcC1kYXktYnRuLS1pcy1hY3RpdmUnIDogJyd9XCIgcm9sZT1cImJ1dHRvblwiIGRhdGEtZGF5PVwiJHtwcm9wcy5udW1iZXJ9XCIgZGF0YS1tb2RlbC1pbmRleD1cIiR7aX1cIiBhcmlhLWxhYmVsPVwiJHtwcm9wcy5pc1RvZGF5ID8gJ1RvZGF5LCAnIDogJyd9JHtEQVlTW3Byb3BzLmRhdGUuZ2V0RGF5KCldfSwgJHtNT05USFNbcHJvcHMuZGF0ZS5nZXRNb250aCgpXX0gJHtwcm9wcy5kYXRlLmdldERhdGUoKX0sICR7cHJvcHMuZGF0ZS5nZXRGdWxsWWVhcigpfVwiJHtwcm9wcy5wcmV2aW91c01vbnRoIHx8IHByb3BzLm5leHRNb250aCB8fCBwcm9wcy5pc091dE9mUmFuZ2UgPyBcIiBkaXNhYmxlZFwiIDogXCJcIn0+JHtwcm9wcy5udW1iZXJ9PC9idXR0b24+PC90ZD5gO1xuXG5jb25zdCB3ZWVrcyA9IGFjdGl2ZURheXMgPT4gKHByb3BzLCBpLCBhcnIpID0+IHtcbiAgICBpZihpID09PSAwKSByZXR1cm4gYDx0ciBjbGFzcz1cInNkcC1kYXlzLXJvd1wiPiR7ZGF5KGFjdGl2ZURheXMsIHByb3BzLCBpKX1gO1xuICAgIGVsc2UgaWYgKGkgPT09IGFyci5sZW5ndGggLSAxKSByZXR1cm4gYCR7ZGF5KGFjdGl2ZURheXMsIHByb3BzLCBpKX08L3RyPmA7XG4gICAgZWxzZSBpZigoaSsxKSAlIDcgPT09IDApIHJldHVybiBgJHtkYXkoYWN0aXZlRGF5cywgcHJvcHMsIGkpfTwvdHI+PHRyIGNsYXNzPVwic2RwLWRheXMtcm93XCI+YDtcbiAgICBlbHNlIHJldHVybiBkYXkoYWN0aXZlRGF5cywgcHJvcHMsIGkpO1xufTsiLCJpbXBvcnQgZmVjaGEgZnJvbSAnZmVjaGEnO1xuaW1wb3J0IHsgTU9OVEhTIH0gZnJvbSAnLi9jb25zdGFudHMnO1xuXG5leHBvcnQgY29uc3QgcGFyc2VEYXRlID0gZmVjaGEucGFyc2U7XG5cbmV4cG9ydCBjb25zdCBmb3JtYXREYXRlID0gZmVjaGEuZm9ybWF0O1xuXG5leHBvcnQgY29uc3QgY2F0Y2hCdWJibGUgPSBlID0+IHtcbiAgICBlLnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpO1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcbn07XG5cbmV4cG9ydCBjb25zdCBnZXRNb250aExlbmd0aCA9ICh5LCBtKSA9PiBuZXcgRGF0ZSh5LCAobSArIDEpLCAwKS5nZXREYXRlKCk7XG5cbmNvbnN0IGlzVG9kYXkgPSBjYW5kaWRhdGUgPT4ge1xuICAgIGxldCB0b2RheSA9IG5ldyBEYXRlKCk7XG4gICAgdG9kYXkuc2V0SG91cnMoMCwwLDAsMCk7XG4gICAgcmV0dXJuIGNhbmRpZGF0ZS5nZXRUaW1lKCkgPT09IHRvZGF5LmdldFRpbWUoKTtcbn07XG5cbmNvbnN0IGlzU3RhcnREYXRlID0gKHN0YXJ0RGF0ZSwgY2FuZGlkYXRlKSA9PiBzdGFydERhdGUuZ2V0VGltZSgpID09PSBjYW5kaWRhdGUuZ2V0VGltZSgpO1xuXG5jb25zdCBtb250aE1vZGVsID0gKHllYXIsIG1vbnRoLCBzdGFydERhdGUsIG1pbkRhdGUsIG1heERhdGUpID0+IHtcbiAgICBsZXQgdGhlTW9udGggPSBuZXcgRGF0ZSh5ZWFyLCBtb250aCArIDEsIDApLFxuICAgICAgICB0b3RhbERheXMgPSB0aGVNb250aC5nZXREYXRlKCksXG4gICAgICAgIGVuZERheSA9IHRoZU1vbnRoLmdldERheSgpLFxuICAgICAgICBzdGFydERheSxcbiAgICAgICAgcHJldk1vbnRoU3RhcnREYXkgPSBmYWxzZSxcbiAgICAgICAgcHJldk1vbnRoID0gbmV3IERhdGUoeWVhciwgbW9udGgsIDApLFxuICAgICAgICBwcmV2TW9udGhFbmREYXkgPSBwcmV2TW9udGguZ2V0RGF0ZSgpLFxuICAgICAgICBvdXRwdXQgPSBbXTtcblxuICAgIHRoZU1vbnRoLnNldERhdGUoMSk7XG4gICAgc3RhcnREYXkgPSB0aGVNb250aC5nZXREYXkoKTtcbiAgICBcbiAgICBpZihzdGFydERheSAhPT0gMSkge1xuICAgICAgICBpZihzdGFydERheSA9PT0gMCkgcHJldk1vbnRoU3RhcnREYXkgPSBwcmV2TW9udGguZ2V0RGF0ZSgpIC0gNTtcbiAgICAgICAgZWxzZSBwcmV2TW9udGhTdGFydERheSA9IHByZXZNb250aC5nZXREYXRlKCkgLSAoc3RhcnREYXkgLSAyKTtcbiAgICB9XG5cbiAgICBpZihwcmV2TW9udGhTdGFydERheSl7XG4gICAgICAgIHdoaWxlKHByZXZNb250aFN0YXJ0RGF5IDw9IHByZXZNb250aEVuZERheSl7XG4gICAgICAgICAgICBsZXQgdG1wRGF0ZSA9IG5ldyBEYXRlKHByZXZNb250aC5nZXRGdWxsWWVhcigpLCBwcmV2TW9udGguZ2V0TW9udGgoKSwgcHJldk1vbnRoU3RhcnREYXkpO1xuICAgICAgICAgICAgb3V0cHV0LnB1c2goe1xuICAgICAgICAgICAgICAgIG51bWJlcjogcHJldk1vbnRoU3RhcnREYXksXG4gICAgICAgICAgICAgICAgcHJldmlvdXNNb250aDogdHJ1ZSxcbiAgICAgICAgICAgICAgICBpc1RvZGF5OiBpc1RvZGF5KHRtcERhdGUpLFxuICAgICAgICAgICAgICAgIGlzU3RhcnREYXRlOiBzdGFydERhdGUgJiYgaXNTdGFydERhdGUoc3RhcnREYXRlLCB0bXBEYXRlKSB8fCBmYWxzZSxcblx0XHRcdFx0ZGF0ZTogdG1wRGF0ZVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBwcmV2TW9udGhTdGFydERheSsrO1xuICAgICAgICB9XG4gICAgfVxuICAgIGZvcihsZXQgaSA9IDE7IGkgPD0gdG90YWxEYXlzOyBpKyspIHtcbiAgICAgICAgbGV0IHRtcERhdGUgPSBuZXcgRGF0ZSh5ZWFyLCBtb250aCwgaSk7XG4gICAgICAgIG91dHB1dC5wdXNoKHsgXG4gICAgICAgICAgICBudW1iZXI6IGksXG4gICAgICAgICAgICBkYXRlOiB0bXBEYXRlLFxuICAgICAgICAgICAgaXNPdXRPZlJhbmdlOiAhKG1pbkRhdGUgJiYgbWluRGF0ZS5nZXRUaW1lKCkgPD0gdG1wRGF0ZS5nZXRUaW1lKCkpIHx8ICEobWF4RGF0ZSAmJiBtYXhEYXRlLmdldFRpbWUoKSA+IHRtcERhdGUuZ2V0VGltZSgpKSxcbiAgICAgICAgICAgIGlzU3RhcnREYXRlOiBzdGFydERhdGUgJiYgaXNTdGFydERhdGUoc3RhcnREYXRlLCB0bXBEYXRlKSB8fCBmYWxzZSxcbiAgICAgICAgICAgIGlzVG9kYXk6IGlzVG9kYXkodG1wRGF0ZSlcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGlmKGVuZERheSAhPT0gMCkgZm9yKGxldCBpID0gMTsgaSA8PSAoNyAtIGVuZERheSk7IGkrKykge1xuICAgICAgICBsZXQgdG1wRGF0ZSA9IG5ldyBEYXRlKHllYXIsIG1vbnRoICsgMSwgaSk7XG4gICAgICAgIG91dHB1dC5wdXNoKHsgXG4gICAgICAgICAgICBudW1iZXI6IGksXG4gICAgICAgICAgICBuZXh0TW9udGg6IHRydWUsXG4gICAgICAgICAgICBkYXRlOiB0bXBEYXRlLFxuICAgICAgICAgICAgaXNTdGFydERhdGU6IHN0YXJ0RGF0ZSAmJiBpc1N0YXJ0RGF0ZShzdGFydERhdGUsIHRtcERhdGUpIHx8IGZhbHNlLFxuICAgICAgICAgICAgaXNUb2RheTogaXNUb2RheSh0bXBEYXRlKVxuICAgICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIG91dHB1dDtcbn07XG5cbmV4cG9ydCBjb25zdCBtb250aFZpZXdGYWN0b3J5ID0gKHJvb3REYXRlLCBzdGFydERhdGUsIG1pbkRhdGUsIG1heERhdGUpID0+ICh7XG5cdG1vZGVsOiBtb250aE1vZGVsKHJvb3REYXRlLmdldEZ1bGxZZWFyKCksIHJvb3REYXRlLmdldE1vbnRoKCksIHN0YXJ0RGF0ZSwgbWluRGF0ZSwgbWF4RGF0ZSksXG5cdG1vbnRoVGl0bGU6IE1PTlRIU1tyb290RGF0ZS5nZXRNb250aCgpXSxcblx0eWVhclRpdGxlOiByb290RGF0ZS5nZXRGdWxsWWVhcigpXG59KTtcblxuZXhwb3J0IGNvbnN0IGVsZW1lbnRGYWN0b3J5ID0gKHR5cGUsIGF0dHJpYnV0ZXMgPSB7fSwgY2xhc3NOYW1lKSA9PiB7XG4gICAgbGV0IGVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCh0eXBlKTtcblxuICAgIGZvcihsZXQgcHJvcCBpbiBhdHRyaWJ1dGVzKSBlbC5zZXRBdHRyaWJ1dGUocHJvcCwgYXR0cmlidXRlc1twcm9wXSk7XG4gICAgaWYoY2xhc3NOYW1lKSBlbC5jbGFzc05hbWUgPSBjbGFzc05hbWU7XG5cbiAgICByZXR1cm4gZWw7XG59O1xuXG5jb25zdCBmb2N1c2FibGVFbGVtZW50cyA9IFsnYVtocmVmXScsICdhcmVhW2hyZWZdJywgJ2lucHV0Om5vdChbZGlzYWJsZWRdKScsICdzZWxlY3Q6bm90KFtkaXNhYmxlZF0pJywgJ3RleHRhcmVhOm5vdChbZGlzYWJsZWRdKScsICdidXR0b246bm90KFtkaXNhYmxlZF0pJywgJ2lmcmFtZScsICdvYmplY3QnLCAnZW1iZWQnLCAnW2NvbnRlbnRlZGl0YWJsZV0nLCAnW3RhYmluZGV4XTpub3QoW3RhYmluZGV4PVwiLTFcIl0pJ107XG5cbmV4cG9ydCBjb25zdCBnZXRGb2N1c2FibGVDaGlsZHJlbiA9IG5vZGUgPT4gW10uc2xpY2UuY2FsbChub2RlLnF1ZXJ5U2VsZWN0b3JBbGwoZm9jdXNhYmxlRWxlbWVudHMuam9pbignLCcpKSkuZmlsdGVyKGNoaWxkID0+ICEhKGNoaWxkLm9mZnNldFdpZHRoIHx8IGNoaWxkLm9mZnNldEhlaWdodCB8fCBjaGlsZC5nZXRDbGllbnRSZWN0cygpLmxlbmd0aCkpO1xuXG5leHBvcnQgY29uc3QgZGF0ZUlzT3V0T2ZCb3VuZHMgPSAoaXNOYXZpZ2F0aW5nQmFjaywgd29ya2luZ0RhdGUsIG1pbiwgbWF4KSA9PiB7XG4gICAgbGV0IHRtcERhdGUgPSBuZXcgRGF0ZSh3b3JraW5nRGF0ZS5nZXRGdWxsWWVhcigpLCB3b3JraW5nRGF0ZS5nZXRNb250aCgpLCAxKTtcbiAgICBcbiAgICBpZihpc05hdmlnYXRpbmdCYWNrICYmIG1pbiAmJiB0bXBEYXRlLmdldFRpbWUoKSA8PSBtaW4uZ2V0VGltZSgpKSByZXR1cm4gdHJ1ZTtcbiAgICB0bXBEYXRlLnNldERhdGUoZ2V0TW9udGhMZW5ndGgodG1wRGF0ZS5nZXRGdWxsWWVhcigpLCB0bXBEYXRlLmdldE1vbnRoKCkpKTtcbiAgICBpZighaXNOYXZpZ2F0aW5nQmFjayAmJiBtYXggJiYgdG1wRGF0ZS5nZXRUaW1lKCkgPj0gbWF4LmdldFRpbWUoKSkgcmV0dXJuIHRydWU7XG4gICAgXG4gICAgcmV0dXJuIGZhbHNlO1xufTtcblxuZXhwb3J0IGNvbnN0IGdldE5leHRBY3RpdmVEYXkgPSAobmV4dE1vbnRoLCBhY3RpdmVEYXksIHdvcmtpbmdEYXRlLCBpc05hdmlnYXRpbmdCYWNrLCBtaW4sIG1heCkgPT4ge1xuICAgIGxldCBjYW5kaWRhdGVEYXkgPSBnZXRNb250aExlbmd0aCh3b3JraW5nRGF0ZS5nZXRGdWxsWWVhcigpLCBuZXh0TW9udGgpIDwgYWN0aXZlRGF5ID8gZ2V0TW9udGhMZW5ndGgod29ya2luZ0RhdGUuZ2V0RnVsbFllYXIoKSwgbmV4dE1vbnRoKSA6IGFjdGl2ZURheSxcbiAgICAgICAgdG1wRGF0ZSA9IG5ldyBEYXRlKHdvcmtpbmdEYXRlLmdldEZ1bGxZZWFyKCksIG5leHRNb250aCwgY2FuZGlkYXRlRGF5KTtcbiAgICBcbiAgICBpZihpc05hdmlnYXRpbmdCYWNrICYmIG1pbiAmJiB0bXBEYXRlLmdldE1vbnRoKCkgPT09IG1pbi5nZXRNb250aCgpICYmIHRtcERhdGUuZ2V0RGF0ZSgpIDwgbWluLmdldERhdGUoKSkgcmV0dXJuIG1pbi5nZXREYXRlKCk7XG4gICAgaWYoIWlzTmF2aWdhdGluZ0JhY2sgJiYgbWF4ICYmIHRtcERhdGUuZ2V0TW9udGgoKSA9PT0gbWF4LmdldE1vbnRoKCkgJiYgdG1wRGF0ZS5nZXREYXRlKCkgPiBtYXguZ2V0RGF0ZSgpKSByZXR1cm4gbWF4LmdldERhdGUoKSAtIDE7XG5cbiAgICByZXR1cm4gY2FuZGlkYXRlRGF5O1xuXHRcdFx0XHRcbn07IiwiKGZ1bmN0aW9uIChtYWluKSB7XG4gICd1c2Ugc3RyaWN0JztcblxuICAvKipcbiAgICogUGFyc2Ugb3IgZm9ybWF0IGRhdGVzXG4gICAqIEBjbGFzcyBmZWNoYVxuICAgKi9cbiAgdmFyIGZlY2hhID0ge307XG4gIHZhciB0b2tlbiA9IC9kezEsNH18TXsxLDR9fFlZKD86WVkpP3xTezEsM318RG98Wlp8KFtIaE1zRG1dKVxcMT98W2FBXXxcIlteXCJdKlwifCdbXiddKicvZztcbiAgdmFyIHR3b0RpZ2l0cyA9IC9cXGRcXGQ/LztcbiAgdmFyIHRocmVlRGlnaXRzID0gL1xcZHszfS87XG4gIHZhciBmb3VyRGlnaXRzID0gL1xcZHs0fS87XG4gIHZhciB3b3JkID0gL1swLTldKlsnYS16XFx1MDBBMC1cXHUwNUZGXFx1MDcwMC1cXHVEN0ZGXFx1RjkwMC1cXHVGRENGXFx1RkRGMC1cXHVGRkVGXSt8W1xcdTA2MDAtXFx1MDZGRlxcL10rKFxccyo/W1xcdTA2MDAtXFx1MDZGRl0rKXsxLDJ9L2k7XG4gIHZhciBsaXRlcmFsID0gL1xcWyhbXl0qPylcXF0vZ207XG4gIHZhciBub29wID0gZnVuY3Rpb24gKCkge1xuICB9O1xuXG4gIGZ1bmN0aW9uIHNob3J0ZW4oYXJyLCBzTGVuKSB7XG4gICAgdmFyIG5ld0FyciA9IFtdO1xuICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSBhcnIubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgIG5ld0Fyci5wdXNoKGFycltpXS5zdWJzdHIoMCwgc0xlbikpO1xuICAgIH1cbiAgICByZXR1cm4gbmV3QXJyO1xuICB9XG5cbiAgZnVuY3Rpb24gbW9udGhVcGRhdGUoYXJyTmFtZSkge1xuICAgIHJldHVybiBmdW5jdGlvbiAoZCwgdiwgaTE4bikge1xuICAgICAgdmFyIGluZGV4ID0gaTE4blthcnJOYW1lXS5pbmRleE9mKHYuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyB2LnN1YnN0cigxKS50b0xvd2VyQ2FzZSgpKTtcbiAgICAgIGlmICh+aW5kZXgpIHtcbiAgICAgICAgZC5tb250aCA9IGluZGV4O1xuICAgICAgfVxuICAgIH07XG4gIH1cblxuICBmdW5jdGlvbiBwYWQodmFsLCBsZW4pIHtcbiAgICB2YWwgPSBTdHJpbmcodmFsKTtcbiAgICBsZW4gPSBsZW4gfHwgMjtcbiAgICB3aGlsZSAodmFsLmxlbmd0aCA8IGxlbikge1xuICAgICAgdmFsID0gJzAnICsgdmFsO1xuICAgIH1cbiAgICByZXR1cm4gdmFsO1xuICB9XG5cbiAgdmFyIGRheU5hbWVzID0gWydTdW5kYXknLCAnTW9uZGF5JywgJ1R1ZXNkYXknLCAnV2VkbmVzZGF5JywgJ1RodXJzZGF5JywgJ0ZyaWRheScsICdTYXR1cmRheSddO1xuICB2YXIgbW9udGhOYW1lcyA9IFsnSmFudWFyeScsICdGZWJydWFyeScsICdNYXJjaCcsICdBcHJpbCcsICdNYXknLCAnSnVuZScsICdKdWx5JywgJ0F1Z3VzdCcsICdTZXB0ZW1iZXInLCAnT2N0b2JlcicsICdOb3ZlbWJlcicsICdEZWNlbWJlciddO1xuICB2YXIgbW9udGhOYW1lc1Nob3J0ID0gc2hvcnRlbihtb250aE5hbWVzLCAzKTtcbiAgdmFyIGRheU5hbWVzU2hvcnQgPSBzaG9ydGVuKGRheU5hbWVzLCAzKTtcbiAgZmVjaGEuaTE4biA9IHtcbiAgICBkYXlOYW1lc1Nob3J0OiBkYXlOYW1lc1Nob3J0LFxuICAgIGRheU5hbWVzOiBkYXlOYW1lcyxcbiAgICBtb250aE5hbWVzU2hvcnQ6IG1vbnRoTmFtZXNTaG9ydCxcbiAgICBtb250aE5hbWVzOiBtb250aE5hbWVzLFxuICAgIGFtUG06IFsnYW0nLCAncG0nXSxcbiAgICBEb0ZuOiBmdW5jdGlvbiBEb0ZuKEQpIHtcbiAgICAgIHJldHVybiBEICsgWyd0aCcsICdzdCcsICduZCcsICdyZCddW0QgJSAxMCA+IDMgPyAwIDogKEQgLSBEICUgMTAgIT09IDEwKSAqIEQgJSAxMF07XG4gICAgfVxuICB9O1xuXG4gIHZhciBmb3JtYXRGbGFncyA9IHtcbiAgICBEOiBmdW5jdGlvbihkYXRlT2JqKSB7XG4gICAgICByZXR1cm4gZGF0ZU9iai5nZXREYXRlKCk7XG4gICAgfSxcbiAgICBERDogZnVuY3Rpb24oZGF0ZU9iaikge1xuICAgICAgcmV0dXJuIHBhZChkYXRlT2JqLmdldERhdGUoKSk7XG4gICAgfSxcbiAgICBEbzogZnVuY3Rpb24oZGF0ZU9iaiwgaTE4bikge1xuICAgICAgcmV0dXJuIGkxOG4uRG9GbihkYXRlT2JqLmdldERhdGUoKSk7XG4gICAgfSxcbiAgICBkOiBmdW5jdGlvbihkYXRlT2JqKSB7XG4gICAgICByZXR1cm4gZGF0ZU9iai5nZXREYXkoKTtcbiAgICB9LFxuICAgIGRkOiBmdW5jdGlvbihkYXRlT2JqKSB7XG4gICAgICByZXR1cm4gcGFkKGRhdGVPYmouZ2V0RGF5KCkpO1xuICAgIH0sXG4gICAgZGRkOiBmdW5jdGlvbihkYXRlT2JqLCBpMThuKSB7XG4gICAgICByZXR1cm4gaTE4bi5kYXlOYW1lc1Nob3J0W2RhdGVPYmouZ2V0RGF5KCldO1xuICAgIH0sXG4gICAgZGRkZDogZnVuY3Rpb24oZGF0ZU9iaiwgaTE4bikge1xuICAgICAgcmV0dXJuIGkxOG4uZGF5TmFtZXNbZGF0ZU9iai5nZXREYXkoKV07XG4gICAgfSxcbiAgICBNOiBmdW5jdGlvbihkYXRlT2JqKSB7XG4gICAgICByZXR1cm4gZGF0ZU9iai5nZXRNb250aCgpICsgMTtcbiAgICB9LFxuICAgIE1NOiBmdW5jdGlvbihkYXRlT2JqKSB7XG4gICAgICByZXR1cm4gcGFkKGRhdGVPYmouZ2V0TW9udGgoKSArIDEpO1xuICAgIH0sXG4gICAgTU1NOiBmdW5jdGlvbihkYXRlT2JqLCBpMThuKSB7XG4gICAgICByZXR1cm4gaTE4bi5tb250aE5hbWVzU2hvcnRbZGF0ZU9iai5nZXRNb250aCgpXTtcbiAgICB9LFxuICAgIE1NTU06IGZ1bmN0aW9uKGRhdGVPYmosIGkxOG4pIHtcbiAgICAgIHJldHVybiBpMThuLm1vbnRoTmFtZXNbZGF0ZU9iai5nZXRNb250aCgpXTtcbiAgICB9LFxuICAgIFlZOiBmdW5jdGlvbihkYXRlT2JqKSB7XG4gICAgICByZXR1cm4gU3RyaW5nKGRhdGVPYmouZ2V0RnVsbFllYXIoKSkuc3Vic3RyKDIpO1xuICAgIH0sXG4gICAgWVlZWTogZnVuY3Rpb24oZGF0ZU9iaikge1xuICAgICAgcmV0dXJuIGRhdGVPYmouZ2V0RnVsbFllYXIoKTtcbiAgICB9LFxuICAgIGg6IGZ1bmN0aW9uKGRhdGVPYmopIHtcbiAgICAgIHJldHVybiBkYXRlT2JqLmdldEhvdXJzKCkgJSAxMiB8fCAxMjtcbiAgICB9LFxuICAgIGhoOiBmdW5jdGlvbihkYXRlT2JqKSB7XG4gICAgICByZXR1cm4gcGFkKGRhdGVPYmouZ2V0SG91cnMoKSAlIDEyIHx8IDEyKTtcbiAgICB9LFxuICAgIEg6IGZ1bmN0aW9uKGRhdGVPYmopIHtcbiAgICAgIHJldHVybiBkYXRlT2JqLmdldEhvdXJzKCk7XG4gICAgfSxcbiAgICBISDogZnVuY3Rpb24oZGF0ZU9iaikge1xuICAgICAgcmV0dXJuIHBhZChkYXRlT2JqLmdldEhvdXJzKCkpO1xuICAgIH0sXG4gICAgbTogZnVuY3Rpb24oZGF0ZU9iaikge1xuICAgICAgcmV0dXJuIGRhdGVPYmouZ2V0TWludXRlcygpO1xuICAgIH0sXG4gICAgbW06IGZ1bmN0aW9uKGRhdGVPYmopIHtcbiAgICAgIHJldHVybiBwYWQoZGF0ZU9iai5nZXRNaW51dGVzKCkpO1xuICAgIH0sXG4gICAgczogZnVuY3Rpb24oZGF0ZU9iaikge1xuICAgICAgcmV0dXJuIGRhdGVPYmouZ2V0U2Vjb25kcygpO1xuICAgIH0sXG4gICAgc3M6IGZ1bmN0aW9uKGRhdGVPYmopIHtcbiAgICAgIHJldHVybiBwYWQoZGF0ZU9iai5nZXRTZWNvbmRzKCkpO1xuICAgIH0sXG4gICAgUzogZnVuY3Rpb24oZGF0ZU9iaikge1xuICAgICAgcmV0dXJuIE1hdGgucm91bmQoZGF0ZU9iai5nZXRNaWxsaXNlY29uZHMoKSAvIDEwMCk7XG4gICAgfSxcbiAgICBTUzogZnVuY3Rpb24oZGF0ZU9iaikge1xuICAgICAgcmV0dXJuIHBhZChNYXRoLnJvdW5kKGRhdGVPYmouZ2V0TWlsbGlzZWNvbmRzKCkgLyAxMCksIDIpO1xuICAgIH0sXG4gICAgU1NTOiBmdW5jdGlvbihkYXRlT2JqKSB7XG4gICAgICByZXR1cm4gcGFkKGRhdGVPYmouZ2V0TWlsbGlzZWNvbmRzKCksIDMpO1xuICAgIH0sXG4gICAgYTogZnVuY3Rpb24oZGF0ZU9iaiwgaTE4bikge1xuICAgICAgcmV0dXJuIGRhdGVPYmouZ2V0SG91cnMoKSA8IDEyID8gaTE4bi5hbVBtWzBdIDogaTE4bi5hbVBtWzFdO1xuICAgIH0sXG4gICAgQTogZnVuY3Rpb24oZGF0ZU9iaiwgaTE4bikge1xuICAgICAgcmV0dXJuIGRhdGVPYmouZ2V0SG91cnMoKSA8IDEyID8gaTE4bi5hbVBtWzBdLnRvVXBwZXJDYXNlKCkgOiBpMThuLmFtUG1bMV0udG9VcHBlckNhc2UoKTtcbiAgICB9LFxuICAgIFpaOiBmdW5jdGlvbihkYXRlT2JqKSB7XG4gICAgICB2YXIgbyA9IGRhdGVPYmouZ2V0VGltZXpvbmVPZmZzZXQoKTtcbiAgICAgIHJldHVybiAobyA+IDAgPyAnLScgOiAnKycpICsgcGFkKE1hdGguZmxvb3IoTWF0aC5hYnMobykgLyA2MCkgKiAxMDAgKyBNYXRoLmFicyhvKSAlIDYwLCA0KTtcbiAgICB9XG4gIH07XG5cbiAgdmFyIHBhcnNlRmxhZ3MgPSB7XG4gICAgRDogW3R3b0RpZ2l0cywgZnVuY3Rpb24gKGQsIHYpIHtcbiAgICAgIGQuZGF5ID0gdjtcbiAgICB9XSxcbiAgICBEbzogW25ldyBSZWdFeHAodHdvRGlnaXRzLnNvdXJjZSArIHdvcmQuc291cmNlKSwgZnVuY3Rpb24gKGQsIHYpIHtcbiAgICAgIGQuZGF5ID0gcGFyc2VJbnQodiwgMTApO1xuICAgIH1dLFxuICAgIE06IFt0d29EaWdpdHMsIGZ1bmN0aW9uIChkLCB2KSB7XG4gICAgICBkLm1vbnRoID0gdiAtIDE7XG4gICAgfV0sXG4gICAgWVk6IFt0d29EaWdpdHMsIGZ1bmN0aW9uIChkLCB2KSB7XG4gICAgICB2YXIgZGEgPSBuZXcgRGF0ZSgpLCBjZW50ID0gKygnJyArIGRhLmdldEZ1bGxZZWFyKCkpLnN1YnN0cigwLCAyKTtcbiAgICAgIGQueWVhciA9ICcnICsgKHYgPiA2OCA/IGNlbnQgLSAxIDogY2VudCkgKyB2O1xuICAgIH1dLFxuICAgIGg6IFt0d29EaWdpdHMsIGZ1bmN0aW9uIChkLCB2KSB7XG4gICAgICBkLmhvdXIgPSB2O1xuICAgIH1dLFxuICAgIG06IFt0d29EaWdpdHMsIGZ1bmN0aW9uIChkLCB2KSB7XG4gICAgICBkLm1pbnV0ZSA9IHY7XG4gICAgfV0sXG4gICAgczogW3R3b0RpZ2l0cywgZnVuY3Rpb24gKGQsIHYpIHtcbiAgICAgIGQuc2Vjb25kID0gdjtcbiAgICB9XSxcbiAgICBZWVlZOiBbZm91ckRpZ2l0cywgZnVuY3Rpb24gKGQsIHYpIHtcbiAgICAgIGQueWVhciA9IHY7XG4gICAgfV0sXG4gICAgUzogWy9cXGQvLCBmdW5jdGlvbiAoZCwgdikge1xuICAgICAgZC5taWxsaXNlY29uZCA9IHYgKiAxMDA7XG4gICAgfV0sXG4gICAgU1M6IFsvXFxkezJ9LywgZnVuY3Rpb24gKGQsIHYpIHtcbiAgICAgIGQubWlsbGlzZWNvbmQgPSB2ICogMTA7XG4gICAgfV0sXG4gICAgU1NTOiBbdGhyZWVEaWdpdHMsIGZ1bmN0aW9uIChkLCB2KSB7XG4gICAgICBkLm1pbGxpc2Vjb25kID0gdjtcbiAgICB9XSxcbiAgICBkOiBbdHdvRGlnaXRzLCBub29wXSxcbiAgICBkZGQ6IFt3b3JkLCBub29wXSxcbiAgICBNTU06IFt3b3JkLCBtb250aFVwZGF0ZSgnbW9udGhOYW1lc1Nob3J0JyldLFxuICAgIE1NTU06IFt3b3JkLCBtb250aFVwZGF0ZSgnbW9udGhOYW1lcycpXSxcbiAgICBhOiBbd29yZCwgZnVuY3Rpb24gKGQsIHYsIGkxOG4pIHtcbiAgICAgIHZhciB2YWwgPSB2LnRvTG93ZXJDYXNlKCk7XG4gICAgICBpZiAodmFsID09PSBpMThuLmFtUG1bMF0pIHtcbiAgICAgICAgZC5pc1BtID0gZmFsc2U7XG4gICAgICB9IGVsc2UgaWYgKHZhbCA9PT0gaTE4bi5hbVBtWzFdKSB7XG4gICAgICAgIGQuaXNQbSA9IHRydWU7XG4gICAgICB9XG4gICAgfV0sXG4gICAgWlo6IFsvKFtcXCtcXC1dXFxkXFxkOj9cXGRcXGR8WikvLCBmdW5jdGlvbiAoZCwgdikge1xuICAgICAgaWYgKHYgPT09ICdaJykgdiA9ICcrMDA6MDAnO1xuICAgICAgdmFyIHBhcnRzID0gKHYgKyAnJykubWF0Y2goLyhbXFwrXFwtXXxcXGRcXGQpL2dpKSwgbWludXRlcztcblxuICAgICAgaWYgKHBhcnRzKSB7XG4gICAgICAgIG1pbnV0ZXMgPSArKHBhcnRzWzFdICogNjApICsgcGFyc2VJbnQocGFydHNbMl0sIDEwKTtcbiAgICAgICAgZC50aW1lem9uZU9mZnNldCA9IHBhcnRzWzBdID09PSAnKycgPyBtaW51dGVzIDogLW1pbnV0ZXM7XG4gICAgICB9XG4gICAgfV1cbiAgfTtcbiAgcGFyc2VGbGFncy5kZCA9IHBhcnNlRmxhZ3MuZDtcbiAgcGFyc2VGbGFncy5kZGRkID0gcGFyc2VGbGFncy5kZGQ7XG4gIHBhcnNlRmxhZ3MuREQgPSBwYXJzZUZsYWdzLkQ7XG4gIHBhcnNlRmxhZ3MubW0gPSBwYXJzZUZsYWdzLm07XG4gIHBhcnNlRmxhZ3MuaGggPSBwYXJzZUZsYWdzLkggPSBwYXJzZUZsYWdzLkhIID0gcGFyc2VGbGFncy5oO1xuICBwYXJzZUZsYWdzLk1NID0gcGFyc2VGbGFncy5NO1xuICBwYXJzZUZsYWdzLnNzID0gcGFyc2VGbGFncy5zO1xuICBwYXJzZUZsYWdzLkEgPSBwYXJzZUZsYWdzLmE7XG5cblxuICAvLyBTb21lIGNvbW1vbiBmb3JtYXQgc3RyaW5nc1xuICBmZWNoYS5tYXNrcyA9IHtcbiAgICBkZWZhdWx0OiAnZGRkIE1NTSBERCBZWVlZIEhIOm1tOnNzJyxcbiAgICBzaG9ydERhdGU6ICdNL0QvWVknLFxuICAgIG1lZGl1bURhdGU6ICdNTU0gRCwgWVlZWScsXG4gICAgbG9uZ0RhdGU6ICdNTU1NIEQsIFlZWVknLFxuICAgIGZ1bGxEYXRlOiAnZGRkZCwgTU1NTSBELCBZWVlZJyxcbiAgICBzaG9ydFRpbWU6ICdISDptbScsXG4gICAgbWVkaXVtVGltZTogJ0hIOm1tOnNzJyxcbiAgICBsb25nVGltZTogJ0hIOm1tOnNzLlNTUydcbiAgfTtcblxuICAvKioqXG4gICAqIEZvcm1hdCBhIGRhdGVcbiAgICogQG1ldGhvZCBmb3JtYXRcbiAgICogQHBhcmFtIHtEYXRlfG51bWJlcn0gZGF0ZU9ialxuICAgKiBAcGFyYW0ge3N0cmluZ30gbWFzayBGb3JtYXQgb2YgdGhlIGRhdGUsIGkuZS4gJ21tLWRkLXl5JyBvciAnc2hvcnREYXRlJ1xuICAgKi9cbiAgZmVjaGEuZm9ybWF0ID0gZnVuY3Rpb24gKGRhdGVPYmosIG1hc2ssIGkxOG5TZXR0aW5ncykge1xuICAgIHZhciBpMThuID0gaTE4blNldHRpbmdzIHx8IGZlY2hhLmkxOG47XG5cbiAgICBpZiAodHlwZW9mIGRhdGVPYmogPT09ICdudW1iZXInKSB7XG4gICAgICBkYXRlT2JqID0gbmV3IERhdGUoZGF0ZU9iaik7XG4gICAgfVxuXG4gICAgaWYgKE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChkYXRlT2JqKSAhPT0gJ1tvYmplY3QgRGF0ZV0nIHx8IGlzTmFOKGRhdGVPYmouZ2V0VGltZSgpKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIERhdGUgaW4gZmVjaGEuZm9ybWF0Jyk7XG4gICAgfVxuXG4gICAgbWFzayA9IGZlY2hhLm1hc2tzW21hc2tdIHx8IG1hc2sgfHwgZmVjaGEubWFza3NbJ2RlZmF1bHQnXTtcblxuICAgIHZhciBsaXRlcmFscyA9IFtdO1xuXG4gICAgLy8gTWFrZSBsaXRlcmFscyBpbmFjdGl2ZSBieSByZXBsYWNpbmcgdGhlbSB3aXRoID8/XG4gICAgbWFzayA9IG1hc2sucmVwbGFjZShsaXRlcmFsLCBmdW5jdGlvbigkMCwgJDEpIHtcbiAgICAgIGxpdGVyYWxzLnB1c2goJDEpO1xuICAgICAgcmV0dXJuICc/Pyc7XG4gICAgfSk7XG4gICAgLy8gQXBwbHkgZm9ybWF0dGluZyBydWxlc1xuICAgIG1hc2sgPSBtYXNrLnJlcGxhY2UodG9rZW4sIGZ1bmN0aW9uICgkMCkge1xuICAgICAgcmV0dXJuICQwIGluIGZvcm1hdEZsYWdzID8gZm9ybWF0RmxhZ3NbJDBdKGRhdGVPYmosIGkxOG4pIDogJDAuc2xpY2UoMSwgJDAubGVuZ3RoIC0gMSk7XG4gICAgfSk7XG4gICAgLy8gSW5saW5lIGxpdGVyYWwgdmFsdWVzIGJhY2sgaW50byB0aGUgZm9ybWF0dGVkIHZhbHVlXG4gICAgcmV0dXJuIG1hc2sucmVwbGFjZSgvXFw/XFw/L2csIGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIGxpdGVyYWxzLnNoaWZ0KCk7XG4gICAgfSk7XG4gIH07XG5cbiAgLyoqXG4gICAqIFBhcnNlIGEgZGF0ZSBzdHJpbmcgaW50byBhbiBvYmplY3QsIGNoYW5nZXMgLSBpbnRvIC9cbiAgICogQG1ldGhvZCBwYXJzZVxuICAgKiBAcGFyYW0ge3N0cmluZ30gZGF0ZVN0ciBEYXRlIHN0cmluZ1xuICAgKiBAcGFyYW0ge3N0cmluZ30gZm9ybWF0IERhdGUgcGFyc2UgZm9ybWF0XG4gICAqIEByZXR1cm5zIHtEYXRlfGJvb2xlYW59XG4gICAqL1xuICBmZWNoYS5wYXJzZSA9IGZ1bmN0aW9uIChkYXRlU3RyLCBmb3JtYXQsIGkxOG5TZXR0aW5ncykge1xuICAgIHZhciBpMThuID0gaTE4blNldHRpbmdzIHx8IGZlY2hhLmkxOG47XG5cbiAgICBpZiAodHlwZW9mIGZvcm1hdCAhPT0gJ3N0cmluZycpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBmb3JtYXQgaW4gZmVjaGEucGFyc2UnKTtcbiAgICB9XG5cbiAgICBmb3JtYXQgPSBmZWNoYS5tYXNrc1tmb3JtYXRdIHx8IGZvcm1hdDtcblxuICAgIC8vIEF2b2lkIHJlZ3VsYXIgZXhwcmVzc2lvbiBkZW5pYWwgb2Ygc2VydmljZSwgZmFpbCBlYXJseSBmb3IgcmVhbGx5IGxvbmcgc3RyaW5nc1xuICAgIC8vIGh0dHBzOi8vd3d3Lm93YXNwLm9yZy9pbmRleC5waHAvUmVndWxhcl9leHByZXNzaW9uX0RlbmlhbF9vZl9TZXJ2aWNlXy1fUmVEb1NcbiAgICBpZiAoZGF0ZVN0ci5sZW5ndGggPiAxMDAwKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgdmFyIGlzVmFsaWQgPSB0cnVlO1xuICAgIHZhciBkYXRlSW5mbyA9IHt9O1xuICAgIGZvcm1hdC5yZXBsYWNlKHRva2VuLCBmdW5jdGlvbiAoJDApIHtcbiAgICAgIGlmIChwYXJzZUZsYWdzWyQwXSkge1xuICAgICAgICB2YXIgaW5mbyA9IHBhcnNlRmxhZ3NbJDBdO1xuICAgICAgICB2YXIgaW5kZXggPSBkYXRlU3RyLnNlYXJjaChpbmZvWzBdKTtcbiAgICAgICAgaWYgKCF+aW5kZXgpIHtcbiAgICAgICAgICBpc1ZhbGlkID0gZmFsc2U7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZGF0ZVN0ci5yZXBsYWNlKGluZm9bMF0sIGZ1bmN0aW9uIChyZXN1bHQpIHtcbiAgICAgICAgICAgIGluZm9bMV0oZGF0ZUluZm8sIHJlc3VsdCwgaTE4bik7XG4gICAgICAgICAgICBkYXRlU3RyID0gZGF0ZVN0ci5zdWJzdHIoaW5kZXggKyByZXN1bHQubGVuZ3RoKTtcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHBhcnNlRmxhZ3NbJDBdID8gJycgOiAkMC5zbGljZSgxLCAkMC5sZW5ndGggLSAxKTtcbiAgICB9KTtcblxuICAgIGlmICghaXNWYWxpZCkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHZhciB0b2RheSA9IG5ldyBEYXRlKCk7XG4gICAgaWYgKGRhdGVJbmZvLmlzUG0gPT09IHRydWUgJiYgZGF0ZUluZm8uaG91ciAhPSBudWxsICYmICtkYXRlSW5mby5ob3VyICE9PSAxMikge1xuICAgICAgZGF0ZUluZm8uaG91ciA9ICtkYXRlSW5mby5ob3VyICsgMTI7XG4gICAgfSBlbHNlIGlmIChkYXRlSW5mby5pc1BtID09PSBmYWxzZSAmJiArZGF0ZUluZm8uaG91ciA9PT0gMTIpIHtcbiAgICAgIGRhdGVJbmZvLmhvdXIgPSAwO1xuICAgIH1cblxuICAgIHZhciBkYXRlO1xuICAgIGlmIChkYXRlSW5mby50aW1lem9uZU9mZnNldCAhPSBudWxsKSB7XG4gICAgICBkYXRlSW5mby5taW51dGUgPSArKGRhdGVJbmZvLm1pbnV0ZSB8fCAwKSAtICtkYXRlSW5mby50aW1lem9uZU9mZnNldDtcbiAgICAgIGRhdGUgPSBuZXcgRGF0ZShEYXRlLlVUQyhkYXRlSW5mby55ZWFyIHx8IHRvZGF5LmdldEZ1bGxZZWFyKCksIGRhdGVJbmZvLm1vbnRoIHx8IDAsIGRhdGVJbmZvLmRheSB8fCAxLFxuICAgICAgICBkYXRlSW5mby5ob3VyIHx8IDAsIGRhdGVJbmZvLm1pbnV0ZSB8fCAwLCBkYXRlSW5mby5zZWNvbmQgfHwgMCwgZGF0ZUluZm8ubWlsbGlzZWNvbmQgfHwgMCkpO1xuICAgIH0gZWxzZSB7XG4gICAgICBkYXRlID0gbmV3IERhdGUoZGF0ZUluZm8ueWVhciB8fCB0b2RheS5nZXRGdWxsWWVhcigpLCBkYXRlSW5mby5tb250aCB8fCAwLCBkYXRlSW5mby5kYXkgfHwgMSxcbiAgICAgICAgZGF0ZUluZm8uaG91ciB8fCAwLCBkYXRlSW5mby5taW51dGUgfHwgMCwgZGF0ZUluZm8uc2Vjb25kIHx8IDAsIGRhdGVJbmZvLm1pbGxpc2Vjb25kIHx8IDApO1xuICAgIH1cbiAgICByZXR1cm4gZGF0ZTtcbiAgfTtcblxuICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICBpZiAodHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcgJiYgbW9kdWxlLmV4cG9ydHMpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IGZlY2hhO1xuICB9IGVsc2UgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgIGRlZmluZShmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gZmVjaGE7XG4gICAgfSk7XG4gIH0gZWxzZSB7XG4gICAgbWFpbi5mZWNoYSA9IGZlY2hhO1xuICB9XG59KSh0aGlzKTtcbiJdfQ==
