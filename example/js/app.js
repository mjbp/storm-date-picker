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
		this.renderCalendar();
		this.isOpen = true;
		this.btn.setAttribute('aria-expanded', 'true');
		this.workingDate = this.rootDate;
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
	},
	initListeners: function initListeners() {
		var _this5 = this;

		_constants.TRIGGER_EVENTS.forEach(function (ev) {
			_this5.container.addEventListener(ev, _this5.routeHandlers.bind(_this5));
		});
	},
	routeHandlers: function routeHandlers(e) {
		if (e.keyCode) this.handleKeyDown(e);else {
			if (e.target.classList.contains(_constants.CLASSNAMES.NAV_BTN) || e.target.parentNode.classList.contains(_constants.CLASSNAMES.NAV_BTN)) this.handleNav(+(e.target.getAttribute(_constants.DATA_ATTRIBUTES.ACTION) || e.target.parentNode.getAttribute(_constants.DATA_ATTRIBUTES.ACTION)));
			if (e.target.classList.contains(_constants.CLASSNAMES.BTN_DEFAULT)) this.selectDate(e);
		}
	},
	handleNav: function handleNav(action) {
		this.workingDate = new Date(this.workingDate.getFullYear(), this.workingDate.getMonth() + action);
		this.renderMonth();
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
				var nextMonth = up === true ? this.workingDate.getMonth() - 1 : this.workingDate.getMonth() + 1,
				    targetDay = (0, _utils.getMonthLength)(this.workingDate.getFullYear(), nextMonth) < e.target.getAttribute(_constants.DATA_ATTRIBUTES.DAY) ? (0, _utils.getMonthLength)(this.workingDate.getFullYear(), nextMonth) : e.target.getAttribute(_constants.DATA_ATTRIBUTES.DAY);
				this.workingDate = new Date(this.workingDate.getFullYear(), nextMonth, targetDay);
				this.renderMonth();
				this.container.querySelector('[' + _constants.DATA_ATTRIBUTES.DAY + '="' + targetDay + '"]:not(:disabled)').focus();
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
				if (e.target.classList.contains(_constants.CLASSNAMES.NAV_BTN)) this.handleNav(+e.target.getAttribute(_constants.DATA_ATTRIBUTES.ACTION));
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
					[].slice.call(this.container.querySelectorAll(_constants.SELECTORS.BTN_ENABLED)).pop().firstElementChild.focus();
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
    return '<div class="sdp-date">\n                                        <button class="' + _constants.CLASSNAMES.NAV_BTN + ' sdp-back" type="button" data-action="-1">\n                                            <svg class="sdp-btn__icon" width="19" height="19" viewBox="0 0 1000 1000"><path d="M336.2 274.5l-210.1 210h805.4c13 0 23 10 23 23s-10 23-23 23H126.1l210.1 210.1c11 11 11 21 0 32-5 5-10 7-16 7s-11-2-16-7l-249.1-249c-11-11-11-21 0-32l249.1-249.1c21-21.1 53 10.9 32 32z"></path></svg>\n                                        </button>\n                                        <button class="' + _constants.CLASSNAMES.NAV_BTN + ' sdp-next" type="button" data-action="1">\n                                            <svg class="sdp-btn__icon" width="19" height="19" viewBox="0 0 1000 1000"><path d="M694.4 242.4l249.1 249.1c11 11 11 21 0 32L694.4 772.7c-5 5-10 7-16 7s-11-2-16-7c-11-11-11-21 0-32l210.1-210.1H67.1c-13 0-23-10-23-23s10-23 23-23h805.4L662.4 274.5c-21-21.1 11-53.1 32-32.1z"></path></svg>\n                                        </button>\n                                        <div class="' + _constants.CLASSNAMES.MONTH_CONTAINER + '"></div>\n                                    </div>';
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
exports.getFocusableChildren = exports.elementFactory = exports.monthViewFactory = exports.getMonthLength = exports.catchBubble = exports.formatDate = exports.parseDate = undefined;

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
        console.log(!(minDate && minDate.getTime() < _tmpDate.getTime()) || !(maxDate && maxDate.getTime() > _tmpDate.getTime()));
        output.push({
            number: i,
            date: _tmpDate,
            isOutOfRange: !(minDate && minDate.getTime() < _tmpDate.getTime()) || !(maxDate && maxDate.getTime() > _tmpDate.getTime()),
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJleGFtcGxlL3NyYy9hcHAuanMiLCJleGFtcGxlL3NyYy9saWJzL2NvbXBvbmVudC9pbmRleC5qcyIsImV4YW1wbGUvc3JjL2xpYnMvY29tcG9uZW50L2xpYi9jb21wb25lbnQtcHJvdG90eXBlLmpzIiwiZXhhbXBsZS9zcmMvbGlicy9jb21wb25lbnQvbGliL2NvbnN0YW50cy5qcyIsImV4YW1wbGUvc3JjL2xpYnMvY29tcG9uZW50L2xpYi9kZWZhdWx0cy5qcyIsImV4YW1wbGUvc3JjL2xpYnMvY29tcG9uZW50L2xpYi90ZW1wbGF0ZXMuanMiLCJleGFtcGxlL3NyYy9saWJzL2NvbXBvbmVudC9saWIvdXRpbHMuanMiLCJub2RlX21vZHVsZXMvZmVjaGEvZmVjaGEuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztBQ0FBOzs7Ozs7OztBQUVBLElBQU0sMkJBQTJCLFlBQU0sQUFDbkM7V0FBQSxBQUFPLGlDQUFhLEFBQVcsS0FBWCxBQUFnQjtpQkFBbUIsQUFDMUMsQUFDVDtpQkFGSixBQUFvQixBQUFtQyxBQUUxQyxBQUVoQjtBQUowRCxBQUNuRCxLQURnQjtBQUR4QixBQUFnQyxDQUFBOztBQU9oQyxJQUFHLHNCQUFILEFBQXlCLGVBQVEsQUFBTyxpQkFBUCxBQUF3QixvQkFBb0IsWUFBTSxBQUFFOzRCQUFBLEFBQXdCLFFBQVEsVUFBQSxBQUFDLElBQUQ7ZUFBQSxBQUFRO0FBQXhDLEFBQWdEO0FBQXBHLENBQUE7Ozs7Ozs7OztBQ1RqQzs7OztBQUNBOzs7Ozs7OztBQUVBLElBQU0sT0FBTyxTQUFQLEFBQU8sS0FBQSxBQUFDLEtBQUQsQUFBTSxNQUFTLEFBQzNCO0tBQUksTUFBTSxHQUFBLEFBQUcsTUFBSCxBQUFTLEtBQUssU0FBQSxBQUFTLGlCQUFqQyxBQUFVLEFBQWMsQUFBMEIsQUFDL0M7QUFFSDs7S0FBRyxDQUFDLElBQUosQUFBUSxRQUFRLE9BQU8sUUFB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QUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJpbXBvcnQgRGF0ZVBpY2tlciBmcm9tICcuL2xpYnMvY29tcG9uZW50JztcblxuY29uc3Qgb25ET01Db250ZW50TG9hZGVkVGFza3MgPSBbKCkgPT4ge1xuICAgIHdpbmRvdy5EYXRlUGlja2VyID0gRGF0ZVBpY2tlci5pbml0KCcuanMtZGF0ZS1waWNrZXInLCB7XG4gICAgICAgIG1pbkRhdGU6ICcyNS8xMi8yMDE3JyxcbiAgICAgICAgbWF4RGF0ZTogJzE2LzAxLzIwMTgnXG4gICAgfSk7XG59XTtcbiAgICBcbmlmKCdhZGRFdmVudExpc3RlbmVyJyBpbiB3aW5kb3cpIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgKCkgPT4geyBvbkRPTUNvbnRlbnRMb2FkZWRUYXNrcy5mb3JFYWNoKChmbikgPT4gZm4oKSk7IH0pOyIsImltcG9ydCBkZWZhdWx0cyBmcm9tICcuL2xpYi9kZWZhdWx0cyc7XG5pbXBvcnQgY29tcG9uZW50UHJvdG90eXBlIGZyb20gJy4vbGliL2NvbXBvbmVudC1wcm90b3R5cGUnO1xuXG5jb25zdCBpbml0ID0gKHNlbCwgb3B0cykgPT4ge1xuXHRsZXQgZWxzID0gW10uc2xpY2UuY2FsbChkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKHNlbCkpO1xuICAgIC8vbGV0IGVscyA9IEFycmF5LmZyb20oZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChzZWwpKTtcblxuXHRpZighZWxzLmxlbmd0aCkgcmV0dXJuIGNvbnNvbGUud2FybignRGF0ZSBwaWNrZXIgbm90IGluaXRpYWxpc2VkLCBubyBhdWdtZW50YWJsZSBlbGVtZW50cyBmb3VuZCcpO1xuICAgIFxuXHRyZXR1cm4ge1xuXHRcdHBpY2tlcnM6IGVscy5tYXAoKGVsKSA9PiB7XG5cdFx0XHRyZXR1cm4gT2JqZWN0LmFzc2lnbihPYmplY3QuY3JlYXRlKGNvbXBvbmVudFByb3RvdHlwZSksIHtcblx0XHRcdFx0bm9kZTogZWwsIFxuXHRcdFx0XHRpbnB1dDogZWwucXVlcnlTZWxlY3RvcignLmpzLWlucHV0JyksXG5cdFx0XHRcdGJ0bjogZWwucXVlcnlTZWxlY3RvcignLmpzLWJ0bicpLFxuXHRcdFx0XHRidG5DbGVhcjogZWwucXVlcnlTZWxlY3RvcignLmpzLWJ0bl9fY2xlYXInKSxcblx0XHRcdFx0c2V0dGluZ3M6IE9iamVjdC5hc3NpZ24oe30sIGRlZmF1bHRzLCBvcHRzKVxuXHRcdFx0fSkuaW5pdCgpO1xuXHRcdH0pLFxuXHRcdGZpbmQoc2VsKXtcblx0XHRcdGxldCBjYW5kaWRhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHNlbCk7XG5cdFx0XHRpZighY2FuZGlkYXRlKSByZXR1cm4gY29uc29sZS53YXJuKCdEYXRlIHBpY2tlciBub3QgZm91bmQgZm9yIHRoaXMgc2VsZWN0b3InKTtcblx0XHRcdHJldHVybiB0aGlzLnBpY2tlcnMucmVkdWNlKChhY2MsIGN1cnIpID0+IHtcblx0XHRcdFx0aWYoY3Vyci5ub2RlID09PSBjYW5kaWRhdGUpIGFjYyA9IGN1cnI7XG5cdFx0XHRcdHJldHVybiBhY2M7XG5cdFx0XHR9LCBmYWxzZSk7XG5cdFx0fVxuXHR9O1xufTtcblxuZXhwb3J0IGRlZmF1bHQgeyBpbml0IH07IiwiaW1wb3J0IHsgXG5cdGVsZW1lbnRGYWN0b3J5LFxuXHRtb250aFZpZXdGYWN0b3J5LFxuXHRjYXRjaEJ1YmJsZSxcblx0Z2V0TW9udGhMZW5ndGgsXG5cdHBhcnNlRGF0ZSxcblx0Zm9ybWF0RGF0ZVxufSBmcm9tICcuL3V0aWxzJztcbmltcG9ydCB7IGNhbGVuZGFyLCBtb250aCB9IGZyb20gJy4vdGVtcGxhdGVzJztcbmltcG9ydCB7IFxuXHRUUklHR0VSX0VWRU5UUyxcblx0VFJJR0dFUl9LRVlDT0RFUyxcblx0S0VZQ09ERVMsXG5cdEFSSUFfSEVMUF9URVhULFxuXHRDTEFTU05BTUVTLFxuXHRTRUxFQ1RPUlMsXG5cdERBVEFfQVRUUklCVVRFU1xufSBmcm9tICcuL2NvbnN0YW50cyc7XG5cbmV4cG9ydCBkZWZhdWx0IHtcblx0aW5pdCgpIHtcblx0XHR0aGlzLmluaXRDbG9uZSgpO1xuXG5cdFx0VFJJR0dFUl9FVkVOVFMuZm9yRWFjaChldiA9PiB7XG5cdFx0XHR0aGlzLmJ0bi5hZGRFdmVudExpc3RlbmVyKGV2LCBlID0+IHtcblx0XHRcdFx0aWYoISFlLmtleUNvZGUgJiYgIX5UUklHR0VSX0tFWUNPREVTLmluZGV4T2YoZS5rZXlDb2RlKSkgcmV0dXJuO1xuXHRcdFx0XHRjYXRjaEJ1YmJsZShlKTtcblx0XHRcdFx0dGhpcy50b2dnbGUoKTtcblx0XHRcdH0pO1xuXHRcdFx0dGhpcy5idG5DbGVhciAmJiB0aGlzLmJ0bkNsZWFyLmFkZEV2ZW50TGlzdGVuZXIoZXYsIGUgPT4ge1xuXHRcdFx0XHRpZighIWUua2V5Q29kZSAmJiAhflRSSUdHRVJfS0VZQ09ERVMuaW5kZXhPZihlLmtleUNvZGUpKSByZXR1cm47XG5cdFx0XHRcdHRoaXMucmVzZXQoKTtcblx0XHRcdH0pO1xuXHRcdH0pO1xuXG5cdFx0dGhpcy5zZXREYXRlTGltaXRzKCk7XG5cdFx0dGhpcy5ib3VuZEhhbmRsZUZvY3VzT3V0ID0gdGhpcy5oYW5kbGVGb2N1c091dC5iaW5kKHRoaXMpO1xuXG5cdFx0dGhpcy5zdGFydERhdGUgPSB0aGlzLmlucHV0LnZhbHVlID8gcGFyc2VEYXRlKHRoaXMuaW5wdXQudmFsdWUsIHRoaXMuc2V0dGluZ3MudmFsdWVGb3JtYXQpIDogZmFsc2U7XG5cdFx0aWYodGhpcy5zdGFydERhdGUpIHRoaXMuaW5wdXRDbG9uZS52YWx1ZSA9IGZvcm1hdERhdGUodGhpcy5zdGFydERhdGUsIHRoaXMuc2V0dGluZ3MuZGlzcGxheUZvcm1hdCk7XG5cblx0XHR0aGlzLnJvb3REYXRlID0gdGhpcy5zdGFydERhdGUgfHwgbmV3IERhdGUoKTtcblx0XHR0aGlzLnJvb3REYXRlLnNldEhvdXJzKDAsMCwwLDApO1xuXHRcdHRoaXMuc2V0dGluZ3Muc3RhcnRPcGVuICYmIHRoaXMub3BlbigpO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9LFxuXHRzZXREYXRlTGltaXRzKCl7XG5cdFx0WydtaW4nLCAnbWF4J10uZm9yRWFjaChsaW1pdCA9PiB7XG5cdFx0XHRpZih0aGlzLnNldHRpbmdzW2Ake2xpbWl0fURhdGVgXSAmJiAhcGFyc2VEYXRlKHRoaXMuc2V0dGluZ3NbYCR7bGltaXR9RGF0ZWBdLCB0aGlzLnNldHRpbmdzLnZhbHVlRm9ybWF0KSkgcmV0dXJuIGNvbnNvbGUud2FybihgJHtsaW1pdH1EYXRlIHNldHRpbmcgY291bGQgbm90IGJlIHBhcnNlZGApO1xuXHRcdFx0dGhpcy5zZXR0aW5nc1tgJHtsaW1pdH1EYXRlYF0gPSB0aGlzLnNldHRpbmdzW2Ake2xpbWl0fURhdGVgXSAmJiBwYXJzZURhdGUodGhpcy5zZXR0aW5nc1tgJHtsaW1pdH1EYXRlYF0sIHRoaXMuc2V0dGluZ3MudmFsdWVGb3JtYXQpO1xuXHRcdH0pO1xuXHR9LFxuXHRpbml0Q2xvbmUoKXtcblx0XHR0aGlzLmlucHV0Q2xvbmUgPSBlbGVtZW50RmFjdG9yeSgnaW5wdXQnLCB7IHR5cGU6ICd0ZXh0JywgdGFiaW5kZXg6IC0xfSwgdGhpcy5pbnB1dC5jbGFzc05hbWUpO1xuXHRcdHRoaXMuaW5wdXQuc2V0QXR0cmlidXRlKCd0eXBlJywgJ2hpZGRlbicpO1xuXHRcdHRoaXMubm9kZS5hcHBlbmRDaGlsZCh0aGlzLmlucHV0Q2xvbmUpO1xuXG5cdFx0dGhpcy5pbnB1dENsb25lLmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIGUgPT4ge1xuXHRcdFx0bGV0IGNhbmRpZGF0ZSA9IHBhcnNlRGF0ZSh0aGlzLmlucHV0Q2xvbmUudmFsdWUsIHRoaXMuc2V0dGluZ3MuZGlzcGxheUZvcm1hdCkvL2ZhbHNlIGlmIHBhcnNlIGZhaWxzXG5cdFx0XHRpZihjYW5kaWRhdGUpIHRoaXMuc2V0RGF0ZShjYW5kaWRhdGUpO1xuXHRcdFx0ZWxzZSB0aGlzLmlucHV0LnZhbHVlID0gdGhpcy5pbnB1dENsb25lLnZhbHVlID0gJyc7XG5cdFx0fSk7XG5cdH0sXG5cdHRvZ2dsZSgpe1xuXHRcdGlmKHRoaXMuaXNPcGVuKSB0aGlzLmNsb3NlKCk7XG5cdFx0ZWxzZSB0aGlzLm9wZW4oKTtcblx0fSxcblx0b3Blbigpe1xuXHRcdGlmKHRoaXMuaXNPcGVuKSByZXR1cm47XG5cdFx0dGhpcy5yZW5kZXJDYWxlbmRhcigpO1xuXHRcdHRoaXMuaXNPcGVuID0gdHJ1ZTtcblx0XHR0aGlzLmJ0bi5zZXRBdHRyaWJ1dGUoJ2FyaWEtZXhwYW5kZWQnLCAndHJ1ZScpO1xuXHRcdHRoaXMud29ya2luZ0RhdGUgPSB0aGlzLnJvb3REYXRlO1xuXHRcdHRoaXMuY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoU0VMRUNUT1JTLkJUTl9BQ1RJVkUpID8gdGhpcy5jb250YWluZXIucXVlcnlTZWxlY3RvcihTRUxFQ1RPUlMuQlROX0FDVElWRSkuZm9jdXMoKSA6IHRoaXMuY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoU0VMRUNUT1JTLkJUTl9UT0RBWSkgPyB0aGlzLmNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKFNFTEVDVE9SUy5CVE5fVE9EQVkpLmZvY3VzKCkgOiB0aGlzLmNvbnRhaW5lci5xdWVyeVNlbGVjdG9yQWxsKFNFTEVDVE9SUy5CVE5fREVGQVVMVClbMF0uZm9jdXMoKTtcblx0XHRkb2N1bWVudC5ib2R5LmFkZEV2ZW50TGlzdGVuZXIoJ2ZvY3Vzb3V0JywgdGhpcy5ib3VuZEhhbmRsZUZvY3VzT3V0KTtcblx0fSxcblx0Y2xvc2UoKXtcblx0XHRpZighdGhpcy5pc09wZW4pIHJldHVybjtcblx0XHR0aGlzLm5vZGUucmVtb3ZlQ2hpbGQodGhpcy5jb250YWluZXIpO1xuXHRcdHRoaXMuaXNPcGVuID0gZmFsc2U7XG5cdFx0dGhpcy5idG4uc2V0QXR0cmlidXRlKCdhcmlhLWV4cGFuZGVkJywgJ2ZhbHNlJyk7XG5cdFx0dGhpcy5idG4uZm9jdXMoKTtcblx0XHR0aGlzLndvcmtpbmdEYXRlID0gZmFsc2U7XG5cdH0sXG5cdGhhbmRsZUZvY3VzT3V0KCl7XG5cdFx0d2luZG93LnNldFRpbWVvdXQoKCkgPT4ge1xuXHRcdFx0aWYodGhpcy5jb250YWluZXIuY29udGFpbnMoZG9jdW1lbnQuYWN0aXZlRWxlbWVudCkpIHJldHVybjtcblx0XHRcdHRoaXMuY2xvc2UoKTtcblx0XHRcdGRvY3VtZW50LmJvZHkucmVtb3ZlRXZlbnRMaXN0ZW5lcignZm9jdXNvdXQnLCB0aGlzLmJvdW5kSGFuZGxlRm9jdXNPdXQpO1xuXHRcdH0sIDE2KTtcblx0fSxcblx0cmVuZGVyQ2FsZW5kYXIoKXtcblx0XHR0aGlzLmNvbnRhaW5lciA9IGVsZW1lbnRGYWN0b3J5KCdkaXYnLCB7ICdyb2xlJzogJ2RpYWxvZycsICdhcmlhLWhlbHB0ZXh0JzogQVJJQV9IRUxQX1RFWFQgfSwgQ0xBU1NOQU1FUy5DT05UQUlORVIpO1xuXHRcdHRoaXMuY29udGFpbmVyLmlubmVySFRNTCA9IGNhbGVuZGFyKCk7XG5cdFx0dGhpcy5ub2RlLmFwcGVuZENoaWxkKHRoaXMuY29udGFpbmVyKTtcblx0XHR0aGlzLm1vbnRoQ29udGFpbmVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihTRUxFQ1RPUlMuTU9OVEhfQ09OVEFJTkVSKTtcblx0XHR0aGlzLnJlbmRlck1vbnRoKCk7XG5cdFx0dGhpcy5pbml0TGlzdGVuZXJzKCk7XG5cdH0sXG5cdHJlbmRlck1vbnRoKCl7XG5cdFx0dGhpcy5tb250aFZpZXcgPSBtb250aFZpZXdGYWN0b3J5KHRoaXMud29ya2luZ0RhdGUgfHwgdGhpcy5yb290RGF0ZSwgdGhpcy5zdGFydERhdGUsIHRoaXMuc2V0dGluZ3MubWluRGF0ZSwgdGhpcy5zZXR0aW5ncy5tYXhEYXRlKTtcblx0XHR0aGlzLm1vbnRoQ29udGFpbmVyLmlubmVySFRNTCA9IG1vbnRoKHRoaXMubW9udGhWaWV3KTtcblx0XHRpZighdGhpcy5jb250YWluZXIucXVlcnlTZWxlY3RvcihgJHtTRUxFQ1RPUlMuQlROX0RFRkFVTFR9W3RhYmluZGV4PVwiMFwiXWApKSBbXS5zbGljZS5jYWxsKHRoaXMuY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3JBbGwoYCR7U0VMRUNUT1JTLkJUTl9ERUZBVUxUfTpub3QoW2Rpc2FibGVkXSlgKSkuc2hpZnQoKS5zZXRBdHRyaWJ1dGUoJ3RhYmluZGV4JywgJzAnKTtcblx0fSxcblx0aW5pdExpc3RlbmVycygpe1xuXHRcdFRSSUdHRVJfRVZFTlRTLmZvckVhY2goZXYgPT4ge1xuXHRcdFx0dGhpcy5jb250YWluZXIuYWRkRXZlbnRMaXN0ZW5lcihldiwgdGhpcy5yb3V0ZUhhbmRsZXJzLmJpbmQodGhpcykpO1xuXHRcdH0pO1xuXHR9LFxuXHRyb3V0ZUhhbmRsZXJzKGUpe1xuXHRcdGlmKGUua2V5Q29kZSkgdGhpcy5oYW5kbGVLZXlEb3duKGUpO1xuXHRcdGVsc2Uge1xuXHRcdFx0aWYoZS50YXJnZXQuY2xhc3NMaXN0LmNvbnRhaW5zKENMQVNTTkFNRVMuTkFWX0JUTikgfHwgZS50YXJnZXQucGFyZW50Tm9kZS5jbGFzc0xpc3QuY29udGFpbnMoQ0xBU1NOQU1FUy5OQVZfQlROKSkgdGhpcy5oYW5kbGVOYXYoKyhlLnRhcmdldC5nZXRBdHRyaWJ1dGUoREFUQV9BVFRSSUJVVEVTLkFDVElPTikgfHwgZS50YXJnZXQucGFyZW50Tm9kZS5nZXRBdHRyaWJ1dGUoREFUQV9BVFRSSUJVVEVTLkFDVElPTikpKTtcblx0XHRcdGlmKGUudGFyZ2V0LmNsYXNzTGlzdC5jb250YWlucyhDTEFTU05BTUVTLkJUTl9ERUZBVUxUKSkgdGhpcy5zZWxlY3REYXRlKGUpO1xuXHRcdH1cblx0fSxcblx0aGFuZGxlTmF2KGFjdGlvbil7XG5cdFx0dGhpcy53b3JraW5nRGF0ZSA9IG5ldyBEYXRlKHRoaXMud29ya2luZ0RhdGUuZ2V0RnVsbFllYXIoKSwgdGhpcy53b3JraW5nRGF0ZS5nZXRNb250aCgpICsgYWN0aW9uKTtcblx0XHR0aGlzLnJlbmRlck1vbnRoKCk7XG5cdH0sXG5cdGhhbmRsZUtleURvd24oZSl7XG5cdFx0Y29uc3Qga2V5RG93bkRpY3Rpb25hcnkgPSB7XG5cdFx0XHRQQUdFX1VQKCl7XG5cdFx0XHRcdGNhdGNoQnViYmxlKGUpO1xuXHRcdFx0XHRrZXlEb3duRGljdGlvbmFyeS5QQUdFLmNhbGwodGhpcywgdHJ1ZSk7XG5cdFx0XHR9LFxuXHRcdFx0UEFHRV9ET1dOKCl7XG5cdFx0XHRcdGNhdGNoQnViYmxlKGUpO1xuXHRcdFx0XHRrZXlEb3duRGljdGlvbmFyeS5QQUdFLmNhbGwodGhpcywgZmFsc2UpO1xuXHRcdFx0fSxcblx0XHRcdFBBR0UodXApe1xuXHRcdFx0XHRsZXQgbmV4dE1vbnRoID0gdXAgPT09IHRydWUgPyB0aGlzLndvcmtpbmdEYXRlLmdldE1vbnRoKCkgLSAxIDogdGhpcy53b3JraW5nRGF0ZS5nZXRNb250aCgpICsgMSxcblx0XHRcdFx0XHR0YXJnZXREYXkgPSBnZXRNb250aExlbmd0aCh0aGlzLndvcmtpbmdEYXRlLmdldEZ1bGxZZWFyKCksIG5leHRNb250aCkgPCBlLnRhcmdldC5nZXRBdHRyaWJ1dGUoREFUQV9BVFRSSUJVVEVTLkRBWSkgPyBnZXRNb250aExlbmd0aCh0aGlzLndvcmtpbmdEYXRlLmdldEZ1bGxZZWFyKCksIG5leHRNb250aCkgOiBlLnRhcmdldC5nZXRBdHRyaWJ1dGUoREFUQV9BVFRSSUJVVEVTLkRBWSk7XG5cdFx0XHRcdHRoaXMud29ya2luZ0RhdGUgPSBuZXcgRGF0ZSh0aGlzLndvcmtpbmdEYXRlLmdldEZ1bGxZZWFyKCksIG5leHRNb250aCwgdGFyZ2V0RGF5KTtcblx0XHRcdFx0dGhpcy5yZW5kZXJNb250aCgpO1xuXHRcdFx0XHR0aGlzLmNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKGBbJHtEQVRBX0FUVFJJQlVURVMuREFZfT1cIiR7dGFyZ2V0RGF5fVwiXTpub3QoOmRpc2FibGVkKWApLmZvY3VzKCk7XG5cdFx0XHR9LFxuXHRcdFx0VEFCKCl7XG5cdFx0XHRcdC8qIFxuXHRcdFx0XHRcdC0gdHJhcCB0YWIgaW4gZm9jdXNhYmxlIGNoaWxkcmVuPz9cblx0XHRcdFx0XHRcdCAtIHJldHVybiB0byBidXR0b24gYWZ0ZXIgbGFzdCBmb2N1c2FibGUgY2hpbGQ/XG5cdFx0XHRcdFx0LSByZWYuIGh0dHBzOi8vZ2l0aHViLmNvbS9tamJwL3N0b3JtLWZvY3VzLW1hbmFnZXIvYmxvYi9tYXN0ZXIvc3JjL3N0b3JtLWZvY3VzLW1hbmFnZXIuanNcblx0XHRcdFx0Ki9cblx0XHRcdH0sXG5cdFx0XHRFTlRFUihlKXtcblx0XHRcdFx0Y2F0Y2hCdWJibGUoZSk7XG5cdFx0XHRcdGlmKGUudGFyZ2V0LmNsYXNzTGlzdC5jb250YWlucyhDTEFTU05BTUVTLkJUTl9ERUZBVUxUKSkgdGhpcy5zZWxlY3REYXRlKGUpO1xuXHRcdFx0XHRpZihlLnRhcmdldC5jbGFzc0xpc3QuY29udGFpbnMoQ0xBU1NOQU1FUy5OQVZfQlROKSkgdGhpcy5oYW5kbGVOYXYoK2UudGFyZ2V0LmdldEF0dHJpYnV0ZShEQVRBX0FUVFJJQlVURVMuQUNUSU9OKSk7XG5cdFx0XHR9LFxuXHRcdFx0RVNDQVBFKCl7IHRoaXMuY2xvc2UoKTsgfSxcblx0XHRcdFNQQUNFKGUpIHsga2V5RG93bkRpY3Rpb25hcnkuRU5URVIoZSk7IH0sXG5cdFx0XHRMRUZUKGUpe1xuXHRcdFx0XHRjYXRjaEJ1YmJsZShlKTtcblx0XHRcdFx0aWYoIWUudGFyZ2V0LmNsYXNzTGlzdC5jb250YWlucyhDTEFTU05BTUVTLkJUTl9ERUZBVUxUKSkgcmV0dXJuO1xuXG5cdFx0XHRcdGlmKHRoaXMubW9udGhWaWV3Lm1vZGVsWytlLnRhcmdldC5nZXRBdHRyaWJ1dGUoREFUQV9BVFRSSUJVVEVTLk1PREVMX0lOREVYKV0ubnVtYmVyID09PSAxKSB7XG5cdFx0XHRcdFx0dGhpcy53b3JraW5nRGF0ZSA9IG5ldyBEYXRlKHRoaXMud29ya2luZ0RhdGUuZ2V0RnVsbFllYXIoKSwgdGhpcy53b3JraW5nRGF0ZS5nZXRNb250aCgpIC0gMSk7XG5cdFx0XHRcdFx0dGhpcy5yZW5kZXJNb250aCgpO1xuXHRcdFx0XHRcdFtdLnNsaWNlLmNhbGwodGhpcy5jb250YWluZXIucXVlcnlTZWxlY3RvckFsbChTRUxFQ1RPUlMuQlROX0VOQUJMRUQpKS5wb3AoKS5maXJzdEVsZW1lbnRDaGlsZC5mb2N1cygpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGVsc2UgdGhpcy5jb250YWluZXIucXVlcnlTZWxlY3RvcihgWyR7REFUQV9BVFRSSUJVVEVTLk1PREVMX0lOREVYfT1cIiR7K2UudGFyZ2V0LmdldEF0dHJpYnV0ZShEQVRBX0FUVFJJQlVURVMuTU9ERUxfSU5ERVgpIC0gMX1cIl1gKS5mb2N1cygpO1xuXHRcdFx0fSxcblx0XHRcdFVQKCl7XG5cdFx0XHRcdGNhdGNoQnViYmxlKGUpO1xuXHRcdFx0XHRpZighZS50YXJnZXQuY2xhc3NMaXN0LmNvbnRhaW5zKENMQVNTTkFNRVMuQlROX0RFRkFVTFQpKSByZXR1cm47XG5cdFx0XHRcdFxuXHRcdFx0XHRsZXQgbmV4dERheUluZGV4ID0gK2UudGFyZ2V0LmdldEF0dHJpYnV0ZShEQVRBX0FUVFJJQlVURVMuTU9ERUxfSU5ERVgpIC0gNztcblxuXHRcdFx0XHRpZigrdGhpcy5tb250aFZpZXcubW9kZWxbK2UudGFyZ2V0LmdldEF0dHJpYnV0ZShEQVRBX0FUVFJJQlVURVMuTU9ERUxfSU5ERVgpXS5udW1iZXIgLSA3IDwgMSkge1xuXHRcdFx0XHRcdHRoaXMud29ya2luZ0RhdGUgPSBuZXcgRGF0ZSh0aGlzLndvcmtpbmdEYXRlLmdldEZ1bGxZZWFyKCksIHRoaXMud29ya2luZ0RhdGUuZ2V0TW9udGgoKSAtIDEpO1xuXHRcdFx0XHRcdHRoaXMucmVuZGVyTW9udGgoKTtcblx0XHRcdFx0XHQvL3VzZSB0aGlzLndvcmtpbmdEYXRlIGluc3RlYWQgb2YgcXVlcnlpbmcgRE9NP1xuXHRcdFx0XHRcdGlmKCF0aGlzLmNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKGBbJHtEQVRBX0FUVFJJQlVURVMuTU9ERUxfSU5ERVh9PVwiJHt0aGlzLm1vbnRoVmlldy5tb2RlbC5sZW5ndGggKyBuZXh0RGF5SW5kZXh9XCJdYCl8fCB0aGlzLmNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKGBbJHtEQVRBX0FUVFJJQlVURVMuTU9ERUxfSU5ERVh9PVwiJHt0aGlzLm1vbnRoVmlldy5tb2RlbC5sZW5ndGggKyBuZXh0RGF5SW5kZXh9XCJdYCkgJiYgdGhpcy5jb250YWluZXIucXVlcnlTZWxlY3RvcihgWyR7REFUQV9BVFRSSUJVVEVTLk1PREVMX0lOREVYfT1cIiR7dGhpcy5tb250aFZpZXcubW9kZWwubGVuZ3RoICsgbmV4dERheUluZGV4fVwiXWApLmhhc0F0dHJpYnV0ZSgnZGlzYWJsZWQnKSkgXG5cdFx0XHRcdFx0XHR0aGlzLmNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKGBbJHtEQVRBX0FUVFJJQlVURVMuTU9ERUxfSU5ERVh9PVwiJHt0aGlzLm1vbnRoVmlldy5tb2RlbC5sZW5ndGggKyAobmV4dERheUluZGV4IC0gNyl9XCJdYCkuZm9jdXMoKTtcblx0XHRcdFx0XHRlbHNlIHRoaXMuY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoYFske0RBVEFfQVRUUklCVVRFUy5NT0RFTF9JTkRFWH09XCIke3RoaXMubW9udGhWaWV3Lm1vZGVsLmxlbmd0aCArIG5leHREYXlJbmRleH1cIl1gKS5mb2N1cygpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGVsc2UgdGhpcy5jb250YWluZXIucXVlcnlTZWxlY3RvcihgWyR7REFUQV9BVFRSSUJVVEVTLk1PREVMX0lOREVYfT1cIiR7bmV4dERheUluZGV4fVwiXWApLmZvY3VzKCk7XG5cdFx0XHR9LFxuXHRcdFx0UklHSFQoZSl7XG5cdFx0XHRcdGNhdGNoQnViYmxlKGUpO1xuXHRcdFx0XHRpZighZS50YXJnZXQuY2xhc3NMaXN0LmNvbnRhaW5zKENMQVNTTkFNRVMuQlROX0RFRkFVTFQpKSByZXR1cm47XG5cdFx0XHRcdFxuXHRcdFx0XHRpZih0aGlzLm1vbnRoVmlldy5tb2RlbFsrZS50YXJnZXQuZ2V0QXR0cmlidXRlKERBVEFfQVRUUklCVVRFUy5NT0RFTF9JTkRFWCldLm51bWJlciA9PT0gZ2V0TW9udGhMZW5ndGgodGhpcy5tb250aFZpZXcubW9kZWxbK2UudGFyZ2V0LmdldEF0dHJpYnV0ZShEQVRBX0FUVFJJQlVURVMuTU9ERUxfSU5ERVgpXS5kYXRlLmdldEZ1bGxZZWFyKCksIHRoaXMubW9udGhWaWV3Lm1vZGVsWytlLnRhcmdldC5nZXRBdHRyaWJ1dGUoREFUQV9BVFRSSUJVVEVTLk1PREVMX0lOREVYKV0uZGF0ZS5nZXRNb250aCgpKSkge1xuXHRcdFx0XHRcdHRoaXMud29ya2luZ0RhdGUgPSBuZXcgRGF0ZSh0aGlzLndvcmtpbmdEYXRlLmdldEZ1bGxZZWFyKCksIHRoaXMud29ya2luZ0RhdGUuZ2V0TW9udGgoKSArIDEpO1xuXHRcdFx0XHRcdHRoaXMucmVuZGVyTW9udGgoKTtcblx0XHRcdFx0XHRbXS5zbGljZS5jYWxsKHRoaXMuY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3JBbGwoU0VMRUNUT1JTLkJUTl9FTkFCTEVEKSkuc2hpZnQoKS5maXJzdEVsZW1lbnRDaGlsZC5mb2N1cygpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGVsc2UgdGhpcy5jb250YWluZXIucXVlcnlTZWxlY3RvcihgWyR7REFUQV9BVFRSSUJVVEVTLk1PREVMX0lOREVYfT1cIiR7K2UudGFyZ2V0LmdldEF0dHJpYnV0ZShEQVRBX0FUVFJJQlVURVMuTU9ERUxfSU5ERVgpICsgMX1cIl1gKS5mb2N1cygpO1xuXHRcdFx0XHRcblx0XHRcdH0sXG5cdFx0XHRET1dOKCl7XG5cdFx0XHRcdGNhdGNoQnViYmxlKGUpO1xuXHRcdFx0XHRpZighZS50YXJnZXQuY2xhc3NMaXN0LmNvbnRhaW5zKENMQVNTTkFNRVMuQlROX0RFRkFVTFQpKSByZXR1cm47XG5cblx0XHRcdFx0bGV0IG5leHREYXRlID0gK3RoaXMubW9udGhWaWV3Lm1vZGVsWytlLnRhcmdldC5nZXRBdHRyaWJ1dGUoREFUQV9BVFRSSUJVVEVTLk1PREVMX0lOREVYKV0ubnVtYmVyICsgNyxcblx0XHRcdFx0XHRuZXh0RGF5SW5kZXggPSArZS50YXJnZXQuZ2V0QXR0cmlidXRlKERBVEFfQVRUUklCVVRFUy5NT0RFTF9JTkRFWCkgKyA3O1xuXG5cdFx0XHRcdGlmKCt0aGlzLm1vbnRoVmlldy5tb2RlbFsrZS50YXJnZXQuZ2V0QXR0cmlidXRlKERBVEFfQVRUUklCVVRFUy5NT0RFTF9JTkRFWCldLm51bWJlciArIDcgPiBnZXRNb250aExlbmd0aCh0aGlzLm1vbnRoVmlldy5tb2RlbFsrZS50YXJnZXQuZ2V0QXR0cmlidXRlKERBVEFfQVRUUklCVVRFUy5NT0RFTF9JTkRFWCldLmRhdGUuZ2V0RnVsbFllYXIoKSwgdGhpcy5tb250aFZpZXcubW9kZWxbK2UudGFyZ2V0LmdldEF0dHJpYnV0ZShEQVRBX0FUVFJJQlVURVMuTU9ERUxfSU5ERVgpXS5kYXRlLmdldE1vbnRoKCkpKSB7XG5cdFx0XHRcdFx0dGhpcy53b3JraW5nRGF0ZSA9IG5ldyBEYXRlKHRoaXMud29ya2luZ0RhdGUuZ2V0RnVsbFllYXIoKSwgdGhpcy53b3JraW5nRGF0ZS5nZXRNb250aCgpICsgMSk7XG5cdFx0XHRcdFx0dGhpcy5yZW5kZXJNb250aCgpO1xuXHRcdFx0XHRcdC8vdXNlIHRoaXMud29ya2luZ0RhdGUgaW5zdGVhZCBvZiBxdWVyeWluZyBET00/XG5cdFx0XHRcdFx0aWYodGhpcy5jb250YWluZXIucXVlcnlTZWxlY3RvcihgWyR7REFUQV9BVFRSSUJVVEVTLk1PREVMX0lOREVYfT1cIiR7bmV4dERheUluZGV4ICUgN31cIl1gKS5oYXNBdHRyaWJ1dGUoJ2Rpc2FibGVkJykpIHRoaXMuY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoYFske0RBVEFfQVRUUklCVVRFUy5NT0RFTF9JTkRFWH09XCIkeyhuZXh0RGF5SW5kZXggJSA3KSArIDd9XCJdYCkuZm9jdXMoKTtcblx0XHRcdFx0XHRlbHNlIHRoaXMuY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoYFske0RBVEFfQVRUUklCVVRFUy5NT0RFTF9JTkRFWH09XCIke25leHREYXlJbmRleCAlIDd9XCJdYCkuZm9jdXMoKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNlIHRoaXMuY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoYFske0RBVEFfQVRUUklCVVRFUy5NT0RFTF9JTkRFWH09XCIke25leHREYXlJbmRleH1cIl1gKS5mb2N1cygpO1xuXHRcdFx0fVxuXHRcdH07XG5cdFx0aWYoS0VZQ09ERVNbZS5rZXlDb2RlXSAmJiBrZXlEb3duRGljdGlvbmFyeVtLRVlDT0RFU1tlLmtleUNvZGVdXSkga2V5RG93bkRpY3Rpb25hcnlbS0VZQ09ERVNbZS5rZXlDb2RlXV0uY2FsbCh0aGlzLCBlKTtcblx0fSxcblx0c2VsZWN0RGF0ZShlKXtcblx0XHRlLnRhcmdldC5jbGFzc0xpc3QuYWRkKFNFTEVDVE9SUy5CVE5fQUNUSVZFKTtcblx0XHR0aGlzLnNldERhdGUodGhpcy5tb250aFZpZXcubW9kZWxbK2UudGFyZ2V0LmdldEF0dHJpYnV0ZShEQVRBX0FUVFJJQlVURVMuTU9ERUxfSU5ERVgpXS5kYXRlKTtcdFxuXHRcdHRoaXMuY2xvc2UoKTtcblx0fSxcblx0cmVzZXQoKXtcblx0XHR0aGlzLnJvb3REYXRlID0gbmV3IERhdGUoKTtcblx0XHR0aGlzLnJvb3REYXRlLnNldEhvdXJzKDAsMCwwLDApO1xuXHRcdHRoaXMuc3RhcnREYXRlID0gZmFsc2U7XG5cdFx0dGhpcy5pbnB1dENsb25lLnZhbHVlID0gJyc7XG5cdFx0dGhpcy5pbnB1dC52YWx1ZSA9ICcnO1xuXHRcdHRoaXMubm9kZS5jbGFzc0xpc3QucmVtb3ZlKENMQVNTTkFNRVMuSEFTX1ZBTFVFKTtcdFxuXHRcdGlmKHRoaXMuaXNPcGVuKSB0aGlzLmNsb3NlKCk7XG5cdH0sXG5cdHNldERhdGUobmV4dERhdGUpe1xuXHRcdHRoaXMuc3RhcnREYXRlID0gbmV4dERhdGU7XG5cdFx0dGhpcy5yb290RGF0ZSA9IHRoaXMuc3RhcnREYXRlO1xuXHRcdHRoaXMuaW5wdXRDbG9uZS52YWx1ZSA9IGZvcm1hdERhdGUodGhpcy5zdGFydERhdGUsIHRoaXMuc2V0dGluZ3MuZGlzcGxheUZvcm1hdCk7XG5cdFx0dGhpcy5pbnB1dC52YWx1ZSA9IGZvcm1hdERhdGUodGhpcy5zdGFydERhdGUsIHRoaXMuc2V0dGluZ3MudmFsdWVGb3JtYXQpO1xuXHRcdCF0aGlzLm5vZGUuY2xhc3NMaXN0LmNvbnRhaW5zKENMQVNTTkFNRVMuSEFTX1ZBTFVFKSAmJiB0aGlzLm5vZGUuY2xhc3NMaXN0LmFkZChDTEFTU05BTUVTLkhBU19WQUxVRSk7XG5cdH0sXG5cdGdldFZhbHVlKCl7IHJldHVybiB0aGlzLnN0YXJ0RGF0ZTsgfSxcblx0c2V0VmFsdWUobmV4dFZhbHVlLCBmb3JtYXQgPSB0aGlzLnNldHRpbmdzLnZhbHVlRm9ybWF0KXtcblx0XHR0aGlzLnNldERhdGUocGFyc2VEYXRlKG5leHRWYWx1ZSwgZm9ybWF0KSk7XG5cdFx0aWYodGhpcy5pc09wZW4pIHRoaXMud29ya2luZ0RhdGUgPSB0aGlzLnN0YXJ0RGF0ZSwgdGhpcy5yZW5kZXJNb250aCgpO1xuXHR9XG59OyIsImV4cG9ydCBjb25zdCBUUklHR0VSX0VWRU5UUyA9IFsnY2xpY2snLCAna2V5ZG93biddO1xuXG5leHBvcnQgY29uc3QgVFJJR0dFUl9LRVlDT0RFUyA9IFsxMywgMzJdO1xuXG5leHBvcnQgY29uc3QgS0VZQ09ERVMgPSB7XG4gICAgOTogJ1RBQicsXG4gICAgMTM6ICdFTlRFUicsXG4gICAgMjc6ICdFU0NBUEUnLFxuICAgIDMyOiAnU1BBQ0UnLFxuICAgIDMzOiAnUEFHRV9VUCcsXG4gICAgMzQ6ICdQQUdFX0RPV04nLFxuICAgIDM3OiAnTEVGVCcsXG4gICAgMzg6ICdVUCcsXG4gICAgMzk6ICdSSUdIVCcsXG4gICAgNDA6ICdET1dOJ1xufTtcblxuZXhwb3J0IGNvbnN0IE1PTlRIUyA9IFsnSmFudWFyeScsICdGZWJydWFyeScsICdNYXJjaCcsICdBcHJpbCcsICdNYXknLCAnSnVuZScsICdKdWx5JywgJ0F1Z3VzdCcsICdTZXB0ZW1iZXInLCAnT2N0b2JlcicsICdOb3ZlbWJlcicsICdEZWNlbWJlciddO1xuXG5leHBvcnQgY29uc3QgREFZUyA9IFsnU3VuZGF5JywnTW9uZGF5JywnVHVlc2RheScsJ1dlZG5lc2RheScsJ1RodXJzZGF5JywnRnJpZGF5JywnU2F0dXJkYXknXTtcblxuZXhwb3J0IGNvbnN0IEFSSUFfSEVMUF9URVhUID0gYFByZXNzIHRoZSBhcnJvdyBrZXlzIHRvIG5hdmlnYXRlIGJ5IGRheSwgUGFnZVVwIGFuZCBQYWdlRG93biB0byBuYXZpZ2F0ZSBieSBtb250aCwgRW50ZXIgb3IgU3BhY2UgdG8gc2VsZWN0IGEgZGF0ZSwgYW5kIEVzY2FwZSB0byBjYW5jZWwuYDtcblxuLypcbiB0byBkbzpcbiBjb21iaW5lIENMQVNTTkFNRVMgYW5kIFNFTEVDVE9SUyAocmVtb3ZlIFNFTEVUT1JTIGFuZCBhcHBlbmQgZG90IG1hbnVhbGx5KVxuKi9cbmV4cG9ydCBjb25zdCBDTEFTU05BTUVTID0ge1xuICAgIENPTlRBSU5FUjogJ3NkcC1jb250YWluZXInLFxuICAgIE5BVl9CVE46ICdqcy1zZHAtbmF2X19idG4nLFxuICAgIEJUTl9ERUZBVUxUOiAnc2RwLWRheS1idG4nLFxuICAgIE1PTlRIX0NPTlRBSU5FUjogJ2pzLXNkcF9fbW9udGgnLFxuICAgIEhBU19WQUxVRTogJ2hhcy0tdmFsdWUnXG59O1xuXG5leHBvcnQgY29uc3QgU0VMRUNUT1JTID0ge1xuICAgIEJUTl9ERUZBVUxUOiAnLnNkcC1kYXktYnRuJyxcbiAgICBCVE5fQUNUSVZFOiAnLnNkcC1kYXktYnRuLS1pcy1hY3RpdmUnLFxuICAgIEJUTl9UT0RBWTogJy5zZHAtZGF5LWJ0bi0taXMtdG9kYXknLFxuICAgIEJUTl9FTkFCTEVEOiAnLnNkcC1kYXktYm9keTpub3QoLnNkcC1kYXktZGlzYWJsZWQpJyxcbiAgICBNT05USF9DT05UQUlORVI6ICcuanMtc2RwX19tb250aCcsXG59O1xuXG5leHBvcnQgY29uc3QgREFUQV9BVFRSSUJVVEVTID0ge1xuICAgIEFDVElPTjogJ2RhdGEtYWN0aW9uJyxcbiAgICBNT0RFTF9JTkRFWDogJ2RhdGEtbW9kZWwtaW5kZXgnLFxuICAgIERBWTogJ2RhdGEtZGF5J1xufTsiLCJleHBvcnQgZGVmYXVsdCB7XG5cdGNhbGxiYWNrOiBudWxsLFxuXHRzdGFydE9wZW46IGZhbHNlLFxuXHRzdGFydERhdGU6IGZhbHNlLFxuXHRtaW5EYXRlOiBmYWxzZSxcblx0bWF4RGF0ZTogZmFsc2UsXG5cdC8vIGNsb3NlT25TZWxlY3Q6IGZhbHNlLFxuXHRkaXNwbGF5Rm9ybWF0OiAnZGRkZCBNTU1NIEQsIFlZWVknLCAvL1RodXJzZGF5IEphbnVhcnkgMTIsIDIwMTdcblx0dmFsdWVGb3JtYXQ6ICdERC9NTS9ZWVlZJ1xufTsiLCJpbXBvcnQgeyBDTEFTU05BTUVTLCBNT05USFMsIERBWVMgfSBmcm9tICcuL2NvbnN0YW50cyc7XG5cbmV4cG9ydCBjb25zdCBjYWxlbmRhciA9IHByb3BzID0+IGA8ZGl2IGNsYXNzPVwic2RwLWRhdGVcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIGNsYXNzPVwiJHtDTEFTU05BTUVTLk5BVl9CVE59IHNkcC1iYWNrXCIgdHlwZT1cImJ1dHRvblwiIGRhdGEtYWN0aW9uPVwiLTFcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHN2ZyBjbGFzcz1cInNkcC1idG5fX2ljb25cIiB3aWR0aD1cIjE5XCIgaGVpZ2h0PVwiMTlcIiB2aWV3Qm94PVwiMCAwIDEwMDAgMTAwMFwiPjxwYXRoIGQ9XCJNMzM2LjIgMjc0LjVsLTIxMC4xIDIxMGg4MDUuNGMxMyAwIDIzIDEwIDIzIDIzcy0xMCAyMy0yMyAyM0gxMjYuMWwyMTAuMSAyMTAuMWMxMSAxMSAxMSAyMSAwIDMyLTUgNS0xMCA3LTE2IDdzLTExLTItMTYtN2wtMjQ5LjEtMjQ5Yy0xMS0xMS0xMS0yMSAwLTMybDI0OS4xLTI0OS4xYzIxLTIxLjEgNTMgMTAuOSAzMiAzMnpcIj48L3BhdGg+PC9zdmc+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz1cIiR7Q0xBU1NOQU1FUy5OQVZfQlROfSBzZHAtbmV4dFwiIHR5cGU9XCJidXR0b25cIiBkYXRhLWFjdGlvbj1cIjFcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHN2ZyBjbGFzcz1cInNkcC1idG5fX2ljb25cIiB3aWR0aD1cIjE5XCIgaGVpZ2h0PVwiMTlcIiB2aWV3Qm94PVwiMCAwIDEwMDAgMTAwMFwiPjxwYXRoIGQ9XCJNNjk0LjQgMjQyLjRsMjQ5LjEgMjQ5LjFjMTEgMTEgMTEgMjEgMCAzMkw2OTQuNCA3NzIuN2MtNSA1LTEwIDctMTYgN3MtMTEtMi0xNi03Yy0xMS0xMS0xMS0yMSAwLTMybDIxMC4xLTIxMC4xSDY3LjFjLTEzIDAtMjMtMTAtMjMtMjNzMTAtMjMgMjMtMjNoODA1LjRMNjYyLjQgMjc0LjVjLTIxLTIxLjEgMTEtNTMuMSAzMi0zMi4xelwiPjwvcGF0aD48L3N2Zz5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiJHtDTEFTU05BTUVTLk1PTlRIX0NPTlRBSU5FUn1cIj48L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PmA7XG5cbmV4cG9ydCBjb25zdCBtb250aCA9IHByb3BzID0+IGA8ZGl2IGNsYXNzPVwic2RwLW1vbnRoLWxhYmVsXCI+JHtwcm9wcy5tb250aFRpdGxlfSAke3Byb3BzLnllYXJUaXRsZX08L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDx0YWJsZSBjbGFzcz1cInNkcC1kYXlzXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRoZWFkIGNsYXNzPVwic2RwLWRheXMtaGVhZFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dHIgY2xhc3M9XCJzZHAtZGF5cy1yb3dcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0aCBjbGFzcz1cInNkcC1kYXktaGVhZFwiPk1vPC90aD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0aCBjbGFzcz1cInNkcC1kYXktaGVhZFwiPlR1PC90aD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0aCBjbGFzcz1cInNkcC1kYXktaGVhZFwiPldlPC90aD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0aCBjbGFzcz1cInNkcC1kYXktaGVhZFwiPlRoPC90aD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0aCBjbGFzcz1cInNkcC1kYXktaGVhZFwiPkZyPC90aD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0aCBjbGFzcz1cInNkcC1kYXktaGVhZFwiPlNhPC90aD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0aCBjbGFzcz1cInNkcC1kYXktaGVhZFwiPlN1PC90aD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC90cj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3RoZWFkPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0Ym9keSBjbGFzcz1cInNkcC1kYXlzLWJvZHlcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHtwcm9wcy5tb2RlbC5tYXAod2Vla3MocHJvcHMuYWN0aXZlKSkuam9pbignJyl9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC90Ym9keT5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvdGFibGU+YDtcblxuY29uc3QgZGF5ID0gKGFjdGl2ZURheXMsIHByb3BzLCBpKSA9PiBgPHRkIGNsYXNzPVwic2RwLWRheS1ib2R5JHtwcm9wcy5pc091dE9mUmFuZ2UgPyAnIHNkcC1kYXktZGlzYWJsZWQnIDogcHJvcHMubmV4dE1vbnRoID8gJyBzZHAtZGF5LW5leHQtbW9udGggc2RwLWRheS1kaXNhYmxlZCcgOiAnJ30ke3Byb3BzLnByZXZpb3VzTW9udGggPyAnIHNkcC1kYXktcHJldi1tb250aCBzZHAtZGF5LWRpc2FibGVkJyA6ICcnfSR7cHJvcHMuYWN0aXZlID8gJyBzZHAtZGF5LXNlbGVjdGVkJyA6ICcnfVwiPjxidXR0b24gdGFiaW5kZXg9XCIke3Byb3BzLmlzU3RhcnREYXRlID8gMCA6IHByb3BzLmlzVG9kYXkgPyAwIDogLTF9XCIgY2xhc3M9XCJzZHAtZGF5LWJ0biR7cHJvcHMuaXNUb2RheSA/ICcgc2RwLWRheS1idG4tLWlzLXRvZGF5JyA6ICcnfSR7cHJvcHMuaXNTdGFydERhdGUgPyAnIHNkcC1kYXktYnRuLS1pcy1hY3RpdmUnIDogJyd9XCIgcm9sZT1cImJ1dHRvblwiIGRhdGEtZGF5PVwiJHtwcm9wcy5udW1iZXJ9XCIgZGF0YS1tb2RlbC1pbmRleD1cIiR7aX1cIiBhcmlhLWxhYmVsPVwiJHtwcm9wcy5pc1RvZGF5ID8gJ1RvZGF5LCAnIDogJyd9JHtEQVlTW3Byb3BzLmRhdGUuZ2V0RGF5KCldfSwgJHtNT05USFNbcHJvcHMuZGF0ZS5nZXRNb250aCgpXX0gJHtwcm9wcy5kYXRlLmdldERhdGUoKX0sICR7cHJvcHMuZGF0ZS5nZXRGdWxsWWVhcigpfVwiJHtwcm9wcy5wcmV2aW91c01vbnRoIHx8IHByb3BzLm5leHRNb250aCB8fCBwcm9wcy5pc091dE9mUmFuZ2UgPyBcIiBkaXNhYmxlZFwiIDogXCJcIn0+JHtwcm9wcy5udW1iZXJ9PC9idXR0b24+PC90ZD5gO1xuXG5jb25zdCB3ZWVrcyA9IGFjdGl2ZURheXMgPT4gKHByb3BzLCBpLCBhcnIpID0+IHtcbiAgICBpZihpID09PSAwKSByZXR1cm4gYDx0ciBjbGFzcz1cInNkcC1kYXlzLXJvd1wiPiR7ZGF5KGFjdGl2ZURheXMsIHByb3BzLCBpKX1gO1xuICAgIGVsc2UgaWYgKGkgPT09IGFyci5sZW5ndGggLSAxKSByZXR1cm4gYCR7ZGF5KGFjdGl2ZURheXMsIHByb3BzLCBpKX08L3RyPmA7XG4gICAgZWxzZSBpZigoaSsxKSAlIDcgPT09IDApIHJldHVybiBgJHtkYXkoYWN0aXZlRGF5cywgcHJvcHMsIGkpfTwvdHI+PHRyIGNsYXNzPVwic2RwLWRheXMtcm93XCI+YDtcbiAgICBlbHNlIHJldHVybiBkYXkoYWN0aXZlRGF5cywgcHJvcHMsIGkpO1xufTsiLCJpbXBvcnQgZmVjaGEgZnJvbSAnZmVjaGEnO1xuaW1wb3J0IHsgTU9OVEhTIH0gZnJvbSAnLi9jb25zdGFudHMnO1xuXG5leHBvcnQgY29uc3QgcGFyc2VEYXRlID0gZmVjaGEucGFyc2U7XG5cbmV4cG9ydCBjb25zdCBmb3JtYXREYXRlID0gZmVjaGEuZm9ybWF0O1xuXG5leHBvcnQgY29uc3QgY2F0Y2hCdWJibGUgPSBlID0+IHtcbiAgICBlLnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpO1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcbn07XG5cbmV4cG9ydCBjb25zdCBnZXRNb250aExlbmd0aCA9ICh5LCBtKSA9PiBuZXcgRGF0ZSh5LCAobSArIDEpLCAwKS5nZXREYXRlKCk7XG5cbmNvbnN0IGlzVG9kYXkgPSBjYW5kaWRhdGUgPT4ge1xuICAgIGxldCB0b2RheSA9IG5ldyBEYXRlKCk7XG4gICAgdG9kYXkuc2V0SG91cnMoMCwwLDAsMCk7XG4gICAgcmV0dXJuIGNhbmRpZGF0ZS5nZXRUaW1lKCkgPT09IHRvZGF5LmdldFRpbWUoKTtcbn07XG5cbmNvbnN0IGlzU3RhcnREYXRlID0gKHN0YXJ0RGF0ZSwgY2FuZGlkYXRlKSA9PiBzdGFydERhdGUuZ2V0VGltZSgpID09PSBjYW5kaWRhdGUuZ2V0VGltZSgpO1xuXG5jb25zdCBtb250aE1vZGVsID0gKHllYXIsIG1vbnRoLCBzdGFydERhdGUsIG1pbkRhdGUsIG1heERhdGUpID0+IHtcbiAgICBsZXQgdGhlTW9udGggPSBuZXcgRGF0ZSh5ZWFyLCBtb250aCArIDEsIDApLFxuICAgICAgICB0b3RhbERheXMgPSB0aGVNb250aC5nZXREYXRlKCksXG4gICAgICAgIGVuZERheSA9IHRoZU1vbnRoLmdldERheSgpLFxuICAgICAgICBzdGFydERheSxcbiAgICAgICAgcHJldk1vbnRoU3RhcnREYXkgPSBmYWxzZSxcbiAgICAgICAgcHJldk1vbnRoID0gbmV3IERhdGUoeWVhciwgbW9udGgsIDApLFxuICAgICAgICBwcmV2TW9udGhFbmREYXkgPSBwcmV2TW9udGguZ2V0RGF0ZSgpLFxuICAgICAgICBvdXRwdXQgPSBbXTtcblxuICAgIHRoZU1vbnRoLnNldERhdGUoMSk7XG4gICAgc3RhcnREYXkgPSB0aGVNb250aC5nZXREYXkoKTtcbiAgICBcbiAgICBpZihzdGFydERheSAhPT0gMSkge1xuICAgICAgICBpZihzdGFydERheSA9PT0gMCkgcHJldk1vbnRoU3RhcnREYXkgPSBwcmV2TW9udGguZ2V0RGF0ZSgpIC0gNTtcbiAgICAgICAgZWxzZSBwcmV2TW9udGhTdGFydERheSA9IHByZXZNb250aC5nZXREYXRlKCkgLSAoc3RhcnREYXkgLSAyKTtcbiAgICB9XG5cbiAgICBpZihwcmV2TW9udGhTdGFydERheSl7XG4gICAgICAgIHdoaWxlKHByZXZNb250aFN0YXJ0RGF5IDw9IHByZXZNb250aEVuZERheSl7XG4gICAgICAgICAgICBsZXQgdG1wRGF0ZSA9IG5ldyBEYXRlKHByZXZNb250aC5nZXRGdWxsWWVhcigpLCBwcmV2TW9udGguZ2V0TW9udGgoKSwgcHJldk1vbnRoU3RhcnREYXkpO1xuICAgICAgICAgICAgb3V0cHV0LnB1c2goe1xuICAgICAgICAgICAgICAgIG51bWJlcjogcHJldk1vbnRoU3RhcnREYXksXG4gICAgICAgICAgICAgICAgcHJldmlvdXNNb250aDogdHJ1ZSxcbiAgICAgICAgICAgICAgICBpc1RvZGF5OiBpc1RvZGF5KHRtcERhdGUpLFxuICAgICAgICAgICAgICAgIGlzU3RhcnREYXRlOiBzdGFydERhdGUgJiYgaXNTdGFydERhdGUoc3RhcnREYXRlLCB0bXBEYXRlKSB8fCBmYWxzZSxcblx0XHRcdFx0ZGF0ZTogdG1wRGF0ZVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBwcmV2TW9udGhTdGFydERheSsrO1xuICAgICAgICB9XG4gICAgfVxuICAgIGZvcihsZXQgaSA9IDE7IGkgPD0gdG90YWxEYXlzOyBpKyspIHtcbiAgICAgICAgbGV0IHRtcERhdGUgPSBuZXcgRGF0ZSh5ZWFyLCBtb250aCwgaSk7XG4gICAgICAgIGNvbnNvbGUubG9nKCEobWluRGF0ZSAmJiBtaW5EYXRlLmdldFRpbWUoKSA8IHRtcERhdGUuZ2V0VGltZSgpKSB8fCAhKG1heERhdGUgJiYgbWF4RGF0ZS5nZXRUaW1lKCkgPiB0bXBEYXRlLmdldFRpbWUoKSkpO1xuICAgICAgICBvdXRwdXQucHVzaCh7IFxuICAgICAgICAgICAgbnVtYmVyOiBpLFxuICAgICAgICAgICAgZGF0ZTogdG1wRGF0ZSxcbiAgICAgICAgICAgIGlzT3V0T2ZSYW5nZTogIShtaW5EYXRlICYmIG1pbkRhdGUuZ2V0VGltZSgpIDwgdG1wRGF0ZS5nZXRUaW1lKCkpIHx8ICEobWF4RGF0ZSAmJiBtYXhEYXRlLmdldFRpbWUoKSA+IHRtcERhdGUuZ2V0VGltZSgpKSxcbiAgICAgICAgICAgIGlzU3RhcnREYXRlOiBzdGFydERhdGUgJiYgaXNTdGFydERhdGUoc3RhcnREYXRlLCB0bXBEYXRlKSB8fCBmYWxzZSxcbiAgICAgICAgICAgIGlzVG9kYXk6IGlzVG9kYXkodG1wRGF0ZSlcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGlmKGVuZERheSAhPT0gMCkgZm9yKGxldCBpID0gMTsgaSA8PSAoNyAtIGVuZERheSk7IGkrKykge1xuICAgICAgICBsZXQgdG1wRGF0ZSA9IG5ldyBEYXRlKHllYXIsIG1vbnRoICsgMSwgaSk7XG4gICAgICAgIG91dHB1dC5wdXNoKHsgXG4gICAgICAgICAgICBudW1iZXI6IGksXG4gICAgICAgICAgICBuZXh0TW9udGg6IHRydWUsXG4gICAgICAgICAgICBkYXRlOiB0bXBEYXRlLFxuICAgICAgICAgICAgaXNTdGFydERhdGU6IHN0YXJ0RGF0ZSAmJiBpc1N0YXJ0RGF0ZShzdGFydERhdGUsIHRtcERhdGUpIHx8IGZhbHNlLFxuICAgICAgICAgICAgaXNUb2RheTogaXNUb2RheSh0bXBEYXRlKVxuICAgICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIG91dHB1dDtcbn07XG5cbmV4cG9ydCBjb25zdCBtb250aFZpZXdGYWN0b3J5ID0gKHJvb3REYXRlLCBzdGFydERhdGUsIG1pbkRhdGUsIG1heERhdGUpID0+ICh7XG5cdG1vZGVsOiBtb250aE1vZGVsKHJvb3REYXRlLmdldEZ1bGxZZWFyKCksIHJvb3REYXRlLmdldE1vbnRoKCksIHN0YXJ0RGF0ZSwgbWluRGF0ZSwgbWF4RGF0ZSksXG5cdG1vbnRoVGl0bGU6IE1PTlRIU1tyb290RGF0ZS5nZXRNb250aCgpXSxcblx0eWVhclRpdGxlOiByb290RGF0ZS5nZXRGdWxsWWVhcigpXG59KTtcblxuZXhwb3J0IGNvbnN0IGVsZW1lbnRGYWN0b3J5ID0gKHR5cGUsIGF0dHJpYnV0ZXMgPSB7fSwgY2xhc3NOYW1lKSA9PiB7XG4gICAgbGV0IGVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCh0eXBlKTtcblxuICAgIGZvcihsZXQgcHJvcCBpbiBhdHRyaWJ1dGVzKSBlbC5zZXRBdHRyaWJ1dGUocHJvcCwgYXR0cmlidXRlc1twcm9wXSk7XG4gICAgaWYoY2xhc3NOYW1lKSBlbC5jbGFzc05hbWUgPSBjbGFzc05hbWU7XG5cbiAgICByZXR1cm4gZWw7XG59O1xuXG5jb25zdCBmb2N1c2FibGVFbGVtZW50cyA9IFsnYVtocmVmXScsICdhcmVhW2hyZWZdJywgJ2lucHV0Om5vdChbZGlzYWJsZWRdKScsICdzZWxlY3Q6bm90KFtkaXNhYmxlZF0pJywgJ3RleHRhcmVhOm5vdChbZGlzYWJsZWRdKScsICdidXR0b246bm90KFtkaXNhYmxlZF0pJywgJ2lmcmFtZScsICdvYmplY3QnLCAnZW1iZWQnLCAnW2NvbnRlbnRlZGl0YWJsZV0nLCAnW3RhYmluZGV4XTpub3QoW3RhYmluZGV4PVwiLTFcIl0pJ107XG5cbmV4cG9ydCBjb25zdCBnZXRGb2N1c2FibGVDaGlsZHJlbiA9IG5vZGUgPT4gW10uc2xpY2UuY2FsbChub2RlLnF1ZXJ5U2VsZWN0b3JBbGwoZm9jdXNhYmxlRWxlbWVudHMuam9pbignLCcpKSkuZmlsdGVyKGNoaWxkID0+ICEhKGNoaWxkLm9mZnNldFdpZHRoIHx8IGNoaWxkLm9mZnNldEhlaWdodCB8fCBjaGlsZC5nZXRDbGllbnRSZWN0cygpLmxlbmd0aCkpOyIsIihmdW5jdGlvbiAobWFpbikge1xuICAndXNlIHN0cmljdCc7XG5cbiAgLyoqXG4gICAqIFBhcnNlIG9yIGZvcm1hdCBkYXRlc1xuICAgKiBAY2xhc3MgZmVjaGFcbiAgICovXG4gIHZhciBmZWNoYSA9IHt9O1xuICB2YXIgdG9rZW4gPSAvZHsxLDR9fE17MSw0fXxZWSg/OllZKT98U3sxLDN9fERvfFpafChbSGhNc0RtXSlcXDE/fFthQV18XCJbXlwiXSpcInwnW14nXSonL2c7XG4gIHZhciB0d29EaWdpdHMgPSAvXFxkXFxkPy87XG4gIHZhciB0aHJlZURpZ2l0cyA9IC9cXGR7M30vO1xuICB2YXIgZm91ckRpZ2l0cyA9IC9cXGR7NH0vO1xuICB2YXIgd29yZCA9IC9bMC05XSpbJ2EtelxcdTAwQTAtXFx1MDVGRlxcdTA3MDAtXFx1RDdGRlxcdUY5MDAtXFx1RkRDRlxcdUZERjAtXFx1RkZFRl0rfFtcXHUwNjAwLVxcdTA2RkZcXC9dKyhcXHMqP1tcXHUwNjAwLVxcdTA2RkZdKyl7MSwyfS9pO1xuICB2YXIgbGl0ZXJhbCA9IC9cXFsoW15dKj8pXFxdL2dtO1xuICB2YXIgbm9vcCA9IGZ1bmN0aW9uICgpIHtcbiAgfTtcblxuICBmdW5jdGlvbiBzaG9ydGVuKGFyciwgc0xlbikge1xuICAgIHZhciBuZXdBcnIgPSBbXTtcbiAgICBmb3IgKHZhciBpID0gMCwgbGVuID0gYXJyLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICBuZXdBcnIucHVzaChhcnJbaV0uc3Vic3RyKDAsIHNMZW4pKTtcbiAgICB9XG4gICAgcmV0dXJuIG5ld0FycjtcbiAgfVxuXG4gIGZ1bmN0aW9uIG1vbnRoVXBkYXRlKGFyck5hbWUpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKGQsIHYsIGkxOG4pIHtcbiAgICAgIHZhciBpbmRleCA9IGkxOG5bYXJyTmFtZV0uaW5kZXhPZih2LmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgdi5zdWJzdHIoMSkudG9Mb3dlckNhc2UoKSk7XG4gICAgICBpZiAofmluZGV4KSB7XG4gICAgICAgIGQubW9udGggPSBpbmRleDtcbiAgICAgIH1cbiAgICB9O1xuICB9XG5cbiAgZnVuY3Rpb24gcGFkKHZhbCwgbGVuKSB7XG4gICAgdmFsID0gU3RyaW5nKHZhbCk7XG4gICAgbGVuID0gbGVuIHx8IDI7XG4gICAgd2hpbGUgKHZhbC5sZW5ndGggPCBsZW4pIHtcbiAgICAgIHZhbCA9ICcwJyArIHZhbDtcbiAgICB9XG4gICAgcmV0dXJuIHZhbDtcbiAgfVxuXG4gIHZhciBkYXlOYW1lcyA9IFsnU3VuZGF5JywgJ01vbmRheScsICdUdWVzZGF5JywgJ1dlZG5lc2RheScsICdUaHVyc2RheScsICdGcmlkYXknLCAnU2F0dXJkYXknXTtcbiAgdmFyIG1vbnRoTmFtZXMgPSBbJ0phbnVhcnknLCAnRmVicnVhcnknLCAnTWFyY2gnLCAnQXByaWwnLCAnTWF5JywgJ0p1bmUnLCAnSnVseScsICdBdWd1c3QnLCAnU2VwdGVtYmVyJywgJ09jdG9iZXInLCAnTm92ZW1iZXInLCAnRGVjZW1iZXInXTtcbiAgdmFyIG1vbnRoTmFtZXNTaG9ydCA9IHNob3J0ZW4obW9udGhOYW1lcywgMyk7XG4gIHZhciBkYXlOYW1lc1Nob3J0ID0gc2hvcnRlbihkYXlOYW1lcywgMyk7XG4gIGZlY2hhLmkxOG4gPSB7XG4gICAgZGF5TmFtZXNTaG9ydDogZGF5TmFtZXNTaG9ydCxcbiAgICBkYXlOYW1lczogZGF5TmFtZXMsXG4gICAgbW9udGhOYW1lc1Nob3J0OiBtb250aE5hbWVzU2hvcnQsXG4gICAgbW9udGhOYW1lczogbW9udGhOYW1lcyxcbiAgICBhbVBtOiBbJ2FtJywgJ3BtJ10sXG4gICAgRG9GbjogZnVuY3Rpb24gRG9GbihEKSB7XG4gICAgICByZXR1cm4gRCArIFsndGgnLCAnc3QnLCAnbmQnLCAncmQnXVtEICUgMTAgPiAzID8gMCA6IChEIC0gRCAlIDEwICE9PSAxMCkgKiBEICUgMTBdO1xuICAgIH1cbiAgfTtcblxuICB2YXIgZm9ybWF0RmxhZ3MgPSB7XG4gICAgRDogZnVuY3Rpb24oZGF0ZU9iaikge1xuICAgICAgcmV0dXJuIGRhdGVPYmouZ2V0RGF0ZSgpO1xuICAgIH0sXG4gICAgREQ6IGZ1bmN0aW9uKGRhdGVPYmopIHtcbiAgICAgIHJldHVybiBwYWQoZGF0ZU9iai5nZXREYXRlKCkpO1xuICAgIH0sXG4gICAgRG86IGZ1bmN0aW9uKGRhdGVPYmosIGkxOG4pIHtcbiAgICAgIHJldHVybiBpMThuLkRvRm4oZGF0ZU9iai5nZXREYXRlKCkpO1xuICAgIH0sXG4gICAgZDogZnVuY3Rpb24oZGF0ZU9iaikge1xuICAgICAgcmV0dXJuIGRhdGVPYmouZ2V0RGF5KCk7XG4gICAgfSxcbiAgICBkZDogZnVuY3Rpb24oZGF0ZU9iaikge1xuICAgICAgcmV0dXJuIHBhZChkYXRlT2JqLmdldERheSgpKTtcbiAgICB9LFxuICAgIGRkZDogZnVuY3Rpb24oZGF0ZU9iaiwgaTE4bikge1xuICAgICAgcmV0dXJuIGkxOG4uZGF5TmFtZXNTaG9ydFtkYXRlT2JqLmdldERheSgpXTtcbiAgICB9LFxuICAgIGRkZGQ6IGZ1bmN0aW9uKGRhdGVPYmosIGkxOG4pIHtcbiAgICAgIHJldHVybiBpMThuLmRheU5hbWVzW2RhdGVPYmouZ2V0RGF5KCldO1xuICAgIH0sXG4gICAgTTogZnVuY3Rpb24oZGF0ZU9iaikge1xuICAgICAgcmV0dXJuIGRhdGVPYmouZ2V0TW9udGgoKSArIDE7XG4gICAgfSxcbiAgICBNTTogZnVuY3Rpb24oZGF0ZU9iaikge1xuICAgICAgcmV0dXJuIHBhZChkYXRlT2JqLmdldE1vbnRoKCkgKyAxKTtcbiAgICB9LFxuICAgIE1NTTogZnVuY3Rpb24oZGF0ZU9iaiwgaTE4bikge1xuICAgICAgcmV0dXJuIGkxOG4ubW9udGhOYW1lc1Nob3J0W2RhdGVPYmouZ2V0TW9udGgoKV07XG4gICAgfSxcbiAgICBNTU1NOiBmdW5jdGlvbihkYXRlT2JqLCBpMThuKSB7XG4gICAgICByZXR1cm4gaTE4bi5tb250aE5hbWVzW2RhdGVPYmouZ2V0TW9udGgoKV07XG4gICAgfSxcbiAgICBZWTogZnVuY3Rpb24oZGF0ZU9iaikge1xuICAgICAgcmV0dXJuIFN0cmluZyhkYXRlT2JqLmdldEZ1bGxZZWFyKCkpLnN1YnN0cigyKTtcbiAgICB9LFxuICAgIFlZWVk6IGZ1bmN0aW9uKGRhdGVPYmopIHtcbiAgICAgIHJldHVybiBkYXRlT2JqLmdldEZ1bGxZZWFyKCk7XG4gICAgfSxcbiAgICBoOiBmdW5jdGlvbihkYXRlT2JqKSB7XG4gICAgICByZXR1cm4gZGF0ZU9iai5nZXRIb3VycygpICUgMTIgfHwgMTI7XG4gICAgfSxcbiAgICBoaDogZnVuY3Rpb24oZGF0ZU9iaikge1xuICAgICAgcmV0dXJuIHBhZChkYXRlT2JqLmdldEhvdXJzKCkgJSAxMiB8fCAxMik7XG4gICAgfSxcbiAgICBIOiBmdW5jdGlvbihkYXRlT2JqKSB7XG4gICAgICByZXR1cm4gZGF0ZU9iai5nZXRIb3VycygpO1xuICAgIH0sXG4gICAgSEg6IGZ1bmN0aW9uKGRhdGVPYmopIHtcbiAgICAgIHJldHVybiBwYWQoZGF0ZU9iai5nZXRIb3VycygpKTtcbiAgICB9LFxuICAgIG06IGZ1bmN0aW9uKGRhdGVPYmopIHtcbiAgICAgIHJldHVybiBkYXRlT2JqLmdldE1pbnV0ZXMoKTtcbiAgICB9LFxuICAgIG1tOiBmdW5jdGlvbihkYXRlT2JqKSB7XG4gICAgICByZXR1cm4gcGFkKGRhdGVPYmouZ2V0TWludXRlcygpKTtcbiAgICB9LFxuICAgIHM6IGZ1bmN0aW9uKGRhdGVPYmopIHtcbiAgICAgIHJldHVybiBkYXRlT2JqLmdldFNlY29uZHMoKTtcbiAgICB9LFxuICAgIHNzOiBmdW5jdGlvbihkYXRlT2JqKSB7XG4gICAgICByZXR1cm4gcGFkKGRhdGVPYmouZ2V0U2Vjb25kcygpKTtcbiAgICB9LFxuICAgIFM6IGZ1bmN0aW9uKGRhdGVPYmopIHtcbiAgICAgIHJldHVybiBNYXRoLnJvdW5kKGRhdGVPYmouZ2V0TWlsbGlzZWNvbmRzKCkgLyAxMDApO1xuICAgIH0sXG4gICAgU1M6IGZ1bmN0aW9uKGRhdGVPYmopIHtcbiAgICAgIHJldHVybiBwYWQoTWF0aC5yb3VuZChkYXRlT2JqLmdldE1pbGxpc2Vjb25kcygpIC8gMTApLCAyKTtcbiAgICB9LFxuICAgIFNTUzogZnVuY3Rpb24oZGF0ZU9iaikge1xuICAgICAgcmV0dXJuIHBhZChkYXRlT2JqLmdldE1pbGxpc2Vjb25kcygpLCAzKTtcbiAgICB9LFxuICAgIGE6IGZ1bmN0aW9uKGRhdGVPYmosIGkxOG4pIHtcbiAgICAgIHJldHVybiBkYXRlT2JqLmdldEhvdXJzKCkgPCAxMiA/IGkxOG4uYW1QbVswXSA6IGkxOG4uYW1QbVsxXTtcbiAgICB9LFxuICAgIEE6IGZ1bmN0aW9uKGRhdGVPYmosIGkxOG4pIHtcbiAgICAgIHJldHVybiBkYXRlT2JqLmdldEhvdXJzKCkgPCAxMiA/IGkxOG4uYW1QbVswXS50b1VwcGVyQ2FzZSgpIDogaTE4bi5hbVBtWzFdLnRvVXBwZXJDYXNlKCk7XG4gICAgfSxcbiAgICBaWjogZnVuY3Rpb24oZGF0ZU9iaikge1xuICAgICAgdmFyIG8gPSBkYXRlT2JqLmdldFRpbWV6b25lT2Zmc2V0KCk7XG4gICAgICByZXR1cm4gKG8gPiAwID8gJy0nIDogJysnKSArIHBhZChNYXRoLmZsb29yKE1hdGguYWJzKG8pIC8gNjApICogMTAwICsgTWF0aC5hYnMobykgJSA2MCwgNCk7XG4gICAgfVxuICB9O1xuXG4gIHZhciBwYXJzZUZsYWdzID0ge1xuICAgIEQ6IFt0d29EaWdpdHMsIGZ1bmN0aW9uIChkLCB2KSB7XG4gICAgICBkLmRheSA9IHY7XG4gICAgfV0sXG4gICAgRG86IFtuZXcgUmVnRXhwKHR3b0RpZ2l0cy5zb3VyY2UgKyB3b3JkLnNvdXJjZSksIGZ1bmN0aW9uIChkLCB2KSB7XG4gICAgICBkLmRheSA9IHBhcnNlSW50KHYsIDEwKTtcbiAgICB9XSxcbiAgICBNOiBbdHdvRGlnaXRzLCBmdW5jdGlvbiAoZCwgdikge1xuICAgICAgZC5tb250aCA9IHYgLSAxO1xuICAgIH1dLFxuICAgIFlZOiBbdHdvRGlnaXRzLCBmdW5jdGlvbiAoZCwgdikge1xuICAgICAgdmFyIGRhID0gbmV3IERhdGUoKSwgY2VudCA9ICsoJycgKyBkYS5nZXRGdWxsWWVhcigpKS5zdWJzdHIoMCwgMik7XG4gICAgICBkLnllYXIgPSAnJyArICh2ID4gNjggPyBjZW50IC0gMSA6IGNlbnQpICsgdjtcbiAgICB9XSxcbiAgICBoOiBbdHdvRGlnaXRzLCBmdW5jdGlvbiAoZCwgdikge1xuICAgICAgZC5ob3VyID0gdjtcbiAgICB9XSxcbiAgICBtOiBbdHdvRGlnaXRzLCBmdW5jdGlvbiAoZCwgdikge1xuICAgICAgZC5taW51dGUgPSB2O1xuICAgIH1dLFxuICAgIHM6IFt0d29EaWdpdHMsIGZ1bmN0aW9uIChkLCB2KSB7XG4gICAgICBkLnNlY29uZCA9IHY7XG4gICAgfV0sXG4gICAgWVlZWTogW2ZvdXJEaWdpdHMsIGZ1bmN0aW9uIChkLCB2KSB7XG4gICAgICBkLnllYXIgPSB2O1xuICAgIH1dLFxuICAgIFM6IFsvXFxkLywgZnVuY3Rpb24gKGQsIHYpIHtcbiAgICAgIGQubWlsbGlzZWNvbmQgPSB2ICogMTAwO1xuICAgIH1dLFxuICAgIFNTOiBbL1xcZHsyfS8sIGZ1bmN0aW9uIChkLCB2KSB7XG4gICAgICBkLm1pbGxpc2Vjb25kID0gdiAqIDEwO1xuICAgIH1dLFxuICAgIFNTUzogW3RocmVlRGlnaXRzLCBmdW5jdGlvbiAoZCwgdikge1xuICAgICAgZC5taWxsaXNlY29uZCA9IHY7XG4gICAgfV0sXG4gICAgZDogW3R3b0RpZ2l0cywgbm9vcF0sXG4gICAgZGRkOiBbd29yZCwgbm9vcF0sXG4gICAgTU1NOiBbd29yZCwgbW9udGhVcGRhdGUoJ21vbnRoTmFtZXNTaG9ydCcpXSxcbiAgICBNTU1NOiBbd29yZCwgbW9udGhVcGRhdGUoJ21vbnRoTmFtZXMnKV0sXG4gICAgYTogW3dvcmQsIGZ1bmN0aW9uIChkLCB2LCBpMThuKSB7XG4gICAgICB2YXIgdmFsID0gdi50b0xvd2VyQ2FzZSgpO1xuICAgICAgaWYgKHZhbCA9PT0gaTE4bi5hbVBtWzBdKSB7XG4gICAgICAgIGQuaXNQbSA9IGZhbHNlO1xuICAgICAgfSBlbHNlIGlmICh2YWwgPT09IGkxOG4uYW1QbVsxXSkge1xuICAgICAgICBkLmlzUG0gPSB0cnVlO1xuICAgICAgfVxuICAgIH1dLFxuICAgIFpaOiBbLyhbXFwrXFwtXVxcZFxcZDo/XFxkXFxkfFopLywgZnVuY3Rpb24gKGQsIHYpIHtcbiAgICAgIGlmICh2ID09PSAnWicpIHYgPSAnKzAwOjAwJztcbiAgICAgIHZhciBwYXJ0cyA9ICh2ICsgJycpLm1hdGNoKC8oW1xcK1xcLV18XFxkXFxkKS9naSksIG1pbnV0ZXM7XG5cbiAgICAgIGlmIChwYXJ0cykge1xuICAgICAgICBtaW51dGVzID0gKyhwYXJ0c1sxXSAqIDYwKSArIHBhcnNlSW50KHBhcnRzWzJdLCAxMCk7XG4gICAgICAgIGQudGltZXpvbmVPZmZzZXQgPSBwYXJ0c1swXSA9PT0gJysnID8gbWludXRlcyA6IC1taW51dGVzO1xuICAgICAgfVxuICAgIH1dXG4gIH07XG4gIHBhcnNlRmxhZ3MuZGQgPSBwYXJzZUZsYWdzLmQ7XG4gIHBhcnNlRmxhZ3MuZGRkZCA9IHBhcnNlRmxhZ3MuZGRkO1xuICBwYXJzZUZsYWdzLkREID0gcGFyc2VGbGFncy5EO1xuICBwYXJzZUZsYWdzLm1tID0gcGFyc2VGbGFncy5tO1xuICBwYXJzZUZsYWdzLmhoID0gcGFyc2VGbGFncy5IID0gcGFyc2VGbGFncy5ISCA9IHBhcnNlRmxhZ3MuaDtcbiAgcGFyc2VGbGFncy5NTSA9IHBhcnNlRmxhZ3MuTTtcbiAgcGFyc2VGbGFncy5zcyA9IHBhcnNlRmxhZ3MucztcbiAgcGFyc2VGbGFncy5BID0gcGFyc2VGbGFncy5hO1xuXG5cbiAgLy8gU29tZSBjb21tb24gZm9ybWF0IHN0cmluZ3NcbiAgZmVjaGEubWFza3MgPSB7XG4gICAgZGVmYXVsdDogJ2RkZCBNTU0gREQgWVlZWSBISDptbTpzcycsXG4gICAgc2hvcnREYXRlOiAnTS9EL1lZJyxcbiAgICBtZWRpdW1EYXRlOiAnTU1NIEQsIFlZWVknLFxuICAgIGxvbmdEYXRlOiAnTU1NTSBELCBZWVlZJyxcbiAgICBmdWxsRGF0ZTogJ2RkZGQsIE1NTU0gRCwgWVlZWScsXG4gICAgc2hvcnRUaW1lOiAnSEg6bW0nLFxuICAgIG1lZGl1bVRpbWU6ICdISDptbTpzcycsXG4gICAgbG9uZ1RpbWU6ICdISDptbTpzcy5TU1MnXG4gIH07XG5cbiAgLyoqKlxuICAgKiBGb3JtYXQgYSBkYXRlXG4gICAqIEBtZXRob2QgZm9ybWF0XG4gICAqIEBwYXJhbSB7RGF0ZXxudW1iZXJ9IGRhdGVPYmpcbiAgICogQHBhcmFtIHtzdHJpbmd9IG1hc2sgRm9ybWF0IG9mIHRoZSBkYXRlLCBpLmUuICdtbS1kZC15eScgb3IgJ3Nob3J0RGF0ZSdcbiAgICovXG4gIGZlY2hhLmZvcm1hdCA9IGZ1bmN0aW9uIChkYXRlT2JqLCBtYXNrLCBpMThuU2V0dGluZ3MpIHtcbiAgICB2YXIgaTE4biA9IGkxOG5TZXR0aW5ncyB8fCBmZWNoYS5pMThuO1xuXG4gICAgaWYgKHR5cGVvZiBkYXRlT2JqID09PSAnbnVtYmVyJykge1xuICAgICAgZGF0ZU9iaiA9IG5ldyBEYXRlKGRhdGVPYmopO1xuICAgIH1cblxuICAgIGlmIChPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoZGF0ZU9iaikgIT09ICdbb2JqZWN0IERhdGVdJyB8fCBpc05hTihkYXRlT2JqLmdldFRpbWUoKSkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBEYXRlIGluIGZlY2hhLmZvcm1hdCcpO1xuICAgIH1cblxuICAgIG1hc2sgPSBmZWNoYS5tYXNrc1ttYXNrXSB8fCBtYXNrIHx8IGZlY2hhLm1hc2tzWydkZWZhdWx0J107XG5cbiAgICB2YXIgbGl0ZXJhbHMgPSBbXTtcblxuICAgIC8vIE1ha2UgbGl0ZXJhbHMgaW5hY3RpdmUgYnkgcmVwbGFjaW5nIHRoZW0gd2l0aCA/P1xuICAgIG1hc2sgPSBtYXNrLnJlcGxhY2UobGl0ZXJhbCwgZnVuY3Rpb24oJDAsICQxKSB7XG4gICAgICBsaXRlcmFscy5wdXNoKCQxKTtcbiAgICAgIHJldHVybiAnPz8nO1xuICAgIH0pO1xuICAgIC8vIEFwcGx5IGZvcm1hdHRpbmcgcnVsZXNcbiAgICBtYXNrID0gbWFzay5yZXBsYWNlKHRva2VuLCBmdW5jdGlvbiAoJDApIHtcbiAgICAgIHJldHVybiAkMCBpbiBmb3JtYXRGbGFncyA/IGZvcm1hdEZsYWdzWyQwXShkYXRlT2JqLCBpMThuKSA6ICQwLnNsaWNlKDEsICQwLmxlbmd0aCAtIDEpO1xuICAgIH0pO1xuICAgIC8vIElubGluZSBsaXRlcmFsIHZhbHVlcyBiYWNrIGludG8gdGhlIGZvcm1hdHRlZCB2YWx1ZVxuICAgIHJldHVybiBtYXNrLnJlcGxhY2UoL1xcP1xcPy9nLCBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBsaXRlcmFscy5zaGlmdCgpO1xuICAgIH0pO1xuICB9O1xuXG4gIC8qKlxuICAgKiBQYXJzZSBhIGRhdGUgc3RyaW5nIGludG8gYW4gb2JqZWN0LCBjaGFuZ2VzIC0gaW50byAvXG4gICAqIEBtZXRob2QgcGFyc2VcbiAgICogQHBhcmFtIHtzdHJpbmd9IGRhdGVTdHIgRGF0ZSBzdHJpbmdcbiAgICogQHBhcmFtIHtzdHJpbmd9IGZvcm1hdCBEYXRlIHBhcnNlIGZvcm1hdFxuICAgKiBAcmV0dXJucyB7RGF0ZXxib29sZWFufVxuICAgKi9cbiAgZmVjaGEucGFyc2UgPSBmdW5jdGlvbiAoZGF0ZVN0ciwgZm9ybWF0LCBpMThuU2V0dGluZ3MpIHtcbiAgICB2YXIgaTE4biA9IGkxOG5TZXR0aW5ncyB8fCBmZWNoYS5pMThuO1xuXG4gICAgaWYgKHR5cGVvZiBmb3JtYXQgIT09ICdzdHJpbmcnKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgZm9ybWF0IGluIGZlY2hhLnBhcnNlJyk7XG4gICAgfVxuXG4gICAgZm9ybWF0ID0gZmVjaGEubWFza3NbZm9ybWF0XSB8fCBmb3JtYXQ7XG5cbiAgICAvLyBBdm9pZCByZWd1bGFyIGV4cHJlc3Npb24gZGVuaWFsIG9mIHNlcnZpY2UsIGZhaWwgZWFybHkgZm9yIHJlYWxseSBsb25nIHN0cmluZ3NcbiAgICAvLyBodHRwczovL3d3dy5vd2FzcC5vcmcvaW5kZXgucGhwL1JlZ3VsYXJfZXhwcmVzc2lvbl9EZW5pYWxfb2ZfU2VydmljZV8tX1JlRG9TXG4gICAgaWYgKGRhdGVTdHIubGVuZ3RoID4gMTAwMCkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHZhciBpc1ZhbGlkID0gdHJ1ZTtcbiAgICB2YXIgZGF0ZUluZm8gPSB7fTtcbiAgICBmb3JtYXQucmVwbGFjZSh0b2tlbiwgZnVuY3Rpb24gKCQwKSB7XG4gICAgICBpZiAocGFyc2VGbGFnc1skMF0pIHtcbiAgICAgICAgdmFyIGluZm8gPSBwYXJzZUZsYWdzWyQwXTtcbiAgICAgICAgdmFyIGluZGV4ID0gZGF0ZVN0ci5zZWFyY2goaW5mb1swXSk7XG4gICAgICAgIGlmICghfmluZGV4KSB7XG4gICAgICAgICAgaXNWYWxpZCA9IGZhbHNlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGRhdGVTdHIucmVwbGFjZShpbmZvWzBdLCBmdW5jdGlvbiAocmVzdWx0KSB7XG4gICAgICAgICAgICBpbmZvWzFdKGRhdGVJbmZvLCByZXN1bHQsIGkxOG4pO1xuICAgICAgICAgICAgZGF0ZVN0ciA9IGRhdGVTdHIuc3Vic3RyKGluZGV4ICsgcmVzdWx0Lmxlbmd0aCk7XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBwYXJzZUZsYWdzWyQwXSA/ICcnIDogJDAuc2xpY2UoMSwgJDAubGVuZ3RoIC0gMSk7XG4gICAgfSk7XG5cbiAgICBpZiAoIWlzVmFsaWQpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICB2YXIgdG9kYXkgPSBuZXcgRGF0ZSgpO1xuICAgIGlmIChkYXRlSW5mby5pc1BtID09PSB0cnVlICYmIGRhdGVJbmZvLmhvdXIgIT0gbnVsbCAmJiArZGF0ZUluZm8uaG91ciAhPT0gMTIpIHtcbiAgICAgIGRhdGVJbmZvLmhvdXIgPSArZGF0ZUluZm8uaG91ciArIDEyO1xuICAgIH0gZWxzZSBpZiAoZGF0ZUluZm8uaXNQbSA9PT0gZmFsc2UgJiYgK2RhdGVJbmZvLmhvdXIgPT09IDEyKSB7XG4gICAgICBkYXRlSW5mby5ob3VyID0gMDtcbiAgICB9XG5cbiAgICB2YXIgZGF0ZTtcbiAgICBpZiAoZGF0ZUluZm8udGltZXpvbmVPZmZzZXQgIT0gbnVsbCkge1xuICAgICAgZGF0ZUluZm8ubWludXRlID0gKyhkYXRlSW5mby5taW51dGUgfHwgMCkgLSArZGF0ZUluZm8udGltZXpvbmVPZmZzZXQ7XG4gICAgICBkYXRlID0gbmV3IERhdGUoRGF0ZS5VVEMoZGF0ZUluZm8ueWVhciB8fCB0b2RheS5nZXRGdWxsWWVhcigpLCBkYXRlSW5mby5tb250aCB8fCAwLCBkYXRlSW5mby5kYXkgfHwgMSxcbiAgICAgICAgZGF0ZUluZm8uaG91ciB8fCAwLCBkYXRlSW5mby5taW51dGUgfHwgMCwgZGF0ZUluZm8uc2Vjb25kIHx8IDAsIGRhdGVJbmZvLm1pbGxpc2Vjb25kIHx8IDApKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZGF0ZSA9IG5ldyBEYXRlKGRhdGVJbmZvLnllYXIgfHwgdG9kYXkuZ2V0RnVsbFllYXIoKSwgZGF0ZUluZm8ubW9udGggfHwgMCwgZGF0ZUluZm8uZGF5IHx8IDEsXG4gICAgICAgIGRhdGVJbmZvLmhvdXIgfHwgMCwgZGF0ZUluZm8ubWludXRlIHx8IDAsIGRhdGVJbmZvLnNlY29uZCB8fCAwLCBkYXRlSW5mby5taWxsaXNlY29uZCB8fCAwKTtcbiAgICB9XG4gICAgcmV0dXJuIGRhdGU7XG4gIH07XG5cbiAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnICYmIG1vZHVsZS5leHBvcnRzKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBmZWNoYTtcbiAgfSBlbHNlIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICBkZWZpbmUoZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIGZlY2hhO1xuICAgIH0pO1xuICB9IGVsc2Uge1xuICAgIG1haW4uZmVjaGEgPSBmZWNoYTtcbiAgfVxufSkodGhpcyk7XG4iXX0=
