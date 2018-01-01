(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var _component = require('./libs/component');

var _component2 = _interopRequireDefault(_component);

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
}

var onDOMContentLoadedTasks = [function () {
    window.DatePicker = _component2.default.init('.js-date-picker');
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
				input: el.querySelector('input'),
				btn: el.querySelector('.btn'),
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
		});

		this.boundHandleFocusOut = this.handleFocusOut.bind(this);

		this.startDate = this.input.value ? (0, _utils.parseDate)(this.input.value, this.settings.valueFormat) : false;
		if (this.startDate) this.inputClone.value = (0, _utils.formatDate)(this.startDate, this.settings.displayFormat);

		this.rootDate = this.startDate || new Date();
		this.rootDate.setHours(0, 0, 0, 0);
		this.settings.startOpen && this.open();
		return this;
	},
	initClone: function initClone() {
		var _this2 = this;

		this.inputClone = (0, _utils.elementFactory)('input', { type: 'text', tabindex: -1 }, this.input.className);
		this.input.setAttribute('type', 'hidden');
		this.node.appendChild(this.inputClone);

		this.inputClone.addEventListener('change', function (e) {
			var candidate = (0, _utils.parseDate)(_this2.inputClone.value, _this2.settings.displayFormat); //false if parse fails
			if (candidate) _this2.setDate(candidate);else _this2.input.value = _this2.inputClone.value = '';
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
		var _this3 = this;

		window.setTimeout(function () {
			if (_this3.container.contains(document.activeElement)) return;
			_this3.close();
			document.body.removeEventListener('focusout', _this3.boundHandleFocusOut);
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
		this.monthView = (0, _utils.monthViewFactory)(this.workingDate || this.rootDate, this.startDate);
		this.monthContainer.innerHTML = (0, _templates.month)(this.monthView);
		if (!this.container.querySelector(_constants.SELECTORS.BTN_DEFAULT + '[tabindex="0"]')) [].slice.call(this.container.querySelectorAll(_constants.SELECTORS.BTN_DEFAULT + ':not([disabled])')).shift().setAttribute('tabindex', '0');
	},
	initListeners: function initListeners() {
		var _this4 = this;

		_constants.TRIGGER_EVENTS.forEach(function (ev) {
			_this4.container.addEventListener(ev, _this4.routeHandlers.bind(_this4));
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
				var targetDay = (0, _utils.getMonthLength)(this.workingDate.getFullYear(), this.workingDate.getMonth() - 1) < e.target.getAttribute(_constants.DATA_ATTRIBUTES.DAY) ? (0, _utils.getMonthLength)(this.workingDate.getFullYear(), this.workingDate.getMonth() - 1) : e.target.getAttribute(_constants.DATA_ATTRIBUTES.DAY);
				this.workingDate = new Date(this.workingDate.getFullYear(), this.workingDate.getMonth() - 1, targetDay);
				this.renderMonth();
				this.container.querySelector('[' + _constants.DATA_ATTRIBUTES.DAY + '="' + targetDay + '"]:not(:disabled)').focus();
			},
			//?
			PAGE_DOWN: function PAGE_DOWN() {
				(0, _utils.catchBubble)(e);
				var targetDay = (0, _utils.getMonthLength)(this.workingDate.getFullYear(), this.workingDate.getMonth() + 1) < e.target.getAttribute(_constants.DATA_ATTRIBUTES.DAY) ? (0, _utils.getMonthLength)(this.workingDate.getFullYear(), this.workingDate.getMonth() - 1) : e.target.getAttribute(_constants.DATA_ATTRIBUTES.DAY);
				this.workingDate = new Date(this.workingDate.getFullYear(), this.workingDate.getMonth() + 1, targetDay);
				this.renderMonth();
				//focus on last DoM if greater than length of month
				this.container.querySelector('[' + _constants.DATA_ATTRIBUTES.DAY + '="' + targetDay + '"]:not(:disabled)').focus();
			},
			//?
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
		if (this.isOpen) this.close();
	},
	setDate: function setDate(nextDate) {
		this.startDate = nextDate;
		this.rootDate = this.startDate;
		this.inputClone.value = (0, _utils.formatDate)(this.startDate, this.settings.displayFormat);
		this.input.value = (0, _utils.formatDate)(this.startDate, this.settings.valueFormat);
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

var ARIA_HELP_TEXT = exports.ARIA_HELP_TEXT = 'Press the arrow keys to navigate by day, PageUp and PageDown to navigate by month, Enter or Space to select a date, and Escape to cancel.';

/*
 to do:
 combine CLASSNAMES and SELECTORS (remove SELETORS and append dot manually)
*/
var CLASSNAMES = exports.CLASSNAMES = {
    CONTAINER: 'sdp-container',
    NAV_BTN: 'js-sdp-nav__btn',
    BTN_DEFAULT: 'sdp-day-btn',
    MONTH_CONTAINER: 'js-sdp__month'
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

var _utils = require('./utils');

var calendar = exports.calendar = function calendar(props) {
    return '<div class="sdp-date">\n                                        <button class="' + _constants.CLASSNAMES.NAV_BTN + ' sdp-back" type="button" data-action="-1">\n                                            <svg class="sdp-btn__icon" width="19" height="19" viewBox="0 0 1000 1000"><path d="M336.2 274.5l-210.1 210h805.4c13 0 23 10 23 23s-10 23-23 23H126.1l210.1 210.1c11 11 11 21 0 32-5 5-10 7-16 7s-11-2-16-7l-249.1-249c-11-11-11-21 0-32l249.1-249.1c21-21.1 53 10.9 32 32z"></path></svg>\n                                        </button>\n                                        <button class="' + _constants.CLASSNAMES.NAV_BTN + ' sdp-next" type="button" data-action="1">\n                                            <svg class="sdp-btn__icon" width="19" height="19" viewBox="0 0 1000 1000"><path d="M694.4 242.4l249.1 249.1c11 11 11 21 0 32L694.4 772.7c-5 5-10 7-16 7s-11-2-16-7c-11-11-11-21 0-32l210.1-210.1H67.1c-13 0-23-10-23-23s10-23 23-23h805.4L662.4 274.5c-21-21.1 11-53.1 32-32.1z"></path></svg>\n                                        </button>\n                                        <div class="' + _constants.CLASSNAMES.MONTH_CONTAINER + '"></div>\n                                    </div>';
};

var month = exports.month = function month(props) {
    return '<div class="sdp-month-label">' + props.monthTitle + ' ' + props.yearTitle + '</div>\n                        <table class="sdp-days">\n                            <thead class="sdp-days-head">\n                                <tr class="sdp-days-row">\n                                    <th class="sdp-day-head">Mo</th>\n                                    <th class="sdp-day-head">Tu</th>\n                                    <th class="sdp-day-head">We</th>\n                                    <th class="sdp-day-head">Th</th>\n                                    <th class="sdp-day-head">Fr</th>\n                                    <th class="sdp-day-head">Sa</th>\n                                    <th class="sdp-day-head">Su</th>\n                                </tr>\n                            </thead>\n                            <tbody class="sdp-days-body">\n                                ' + props.model.map(weeks(props.active)).join('') + '\n                            </tbody>\n                        </table>';
};

var day = function day(activeDays, props, i) {
    return '<td class="sdp-day-body' + (props.nextMonth ? ' sdp-day-next-month sdp-day-disabled' : '') + (props.previousMonth ? ' sdp-day-prev-month sdp-day-disabled' : '') + (props.active ? ' sdp-day-selected' : '') + '"><button tabindex="' + (props.isStartDate ? 0 : props.isToday ? 0 : -1) + '" class="sdp-day-btn' + (props.isToday ? ' sdp-day-btn--is-today' : '') + (props.isStartDate ? ' sdp-day-btn--is-active' : '') + '" role="button" data-day="' + props.number + '" data-model-index="' + i + '" aria-label="' + (props.isToday ? 'Today, ' : '') + _utils.dayNames[props.date.getDay()] + ', ' + _utils.monthNames[props.date.getMonth()] + ' ' + props.date.getDate() + ', ' + props.date.getFullYear() + '"' + (props.previousMonth || props.nextMonth ? " disabled" : "") + '>' + props.number + '</button></td>';
};

var weeks = function weeks(activeDays) {
    return function (props, i, arr) {
        if (i === 0) return '<tr class="sdp-days-row">' + day(activeDays, props, i);else if (i === arr.length - 1) return day(activeDays, props, i) + '</tr>';else if ((i + 1) % 7 === 0) return day(activeDays, props, i) + '</tr><tr class="sdp-days-row">';else return day(activeDays, props, i);
    };
};

},{"./constants":4,"./utils":7}],7:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.getFocusableChildren = exports.elementFactory = exports.monthViewFactory = exports.getMonthLength = exports.catchBubble = exports.dayNames = exports.monthNames = exports.formatDate = exports.parseDate = undefined;

var _fecha = require('fecha');

var _fecha2 = _interopRequireDefault(_fecha);

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
}

var parseDate = exports.parseDate = _fecha2.default.parse;

var formatDate = exports.formatDate = _fecha2.default.format;

var monthNames = exports.monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

var dayNames = exports.dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
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

var monthModel = function monthModel(year, month, startDate) {
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

var monthViewFactory = exports.monthViewFactory = function monthViewFactory(rootDate, startDate) {
    return {
        model: monthModel(rootDate.getFullYear(), rootDate.getMonth(), startDate),
        monthTitle: monthNames[rootDate.getMonth()],
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

},{"fecha":8}],8:[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJleGFtcGxlL3NyYy9hcHAuanMiLCJleGFtcGxlL3NyYy9saWJzL2NvbXBvbmVudC9pbmRleC5qcyIsImV4YW1wbGUvc3JjL2xpYnMvY29tcG9uZW50L2xpYi9jb21wb25lbnQtcHJvdG90eXBlLmpzIiwiZXhhbXBsZS9zcmMvbGlicy9jb21wb25lbnQvbGliL2NvbnN0YW50cy5qcyIsImV4YW1wbGUvc3JjL2xpYnMvY29tcG9uZW50L2xpYi9kZWZhdWx0cy5qcyIsImV4YW1wbGUvc3JjL2xpYnMvY29tcG9uZW50L2xpYi90ZW1wbGF0ZXMuanMiLCJleGFtcGxlL3NyYy9saWJzL2NvbXBvbmVudC9saWIvdXRpbHMuanMiLCJub2RlX21vZHVsZXMvZmVjaGEvZmVjaGEuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztBQ0FBOzs7Ozs7OztBQUVBLElBQU0sMkJBQTJCLFlBQU0sQUFDbkM7V0FBQSxBQUFPLGFBQWEsb0JBQUEsQUFBVyxLQUEvQixBQUFvQixBQUFnQixBQUN2QztBQUZELEFBQWdDLENBQUE7O0FBSWhDLElBQUcsc0JBQUgsQUFBeUIsZUFBUSxBQUFPLGlCQUFQLEFBQXdCLG9CQUFvQixZQUFNLEFBQUU7NEJBQUEsQUFBd0IsUUFBUSxVQUFBLEFBQUMsSUFBRDtlQUFBLEFBQVE7QUFBeEMsQUFBZ0Q7QUFBcEcsQ0FBQTs7Ozs7Ozs7O0FDTmpDOzs7O0FBQ0E7Ozs7Ozs7O0FBRUEsSUFBTSxPQUFPLFNBQVAsQUFBTyxLQUFBLEFBQUMsS0FBRCxBQUFNLE1BQVMsQUFDM0I7S0FBSSxNQUFNLEdBQUEsQUFBRyxNQUFILEFBQVMsS0FBSyxTQUFBLEFBQVMsaUJBQWpDLEFBQVUsQUFBYyxBQUEwQixBQUMvQztBQUVIOztLQUFHLENBQUMsSUFBSixBQUFRLFFBQVEsT0FBTyxRQUFBLEFBQVEsS0FBZixBQUFPLEFBQWEsQUFFcEM7OztlQUNVLEFBQUksSUFBSSxVQUFB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Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiaW1wb3J0IERhdGVQaWNrZXIgZnJvbSAnLi9saWJzL2NvbXBvbmVudCc7XG5cbmNvbnN0IG9uRE9NQ29udGVudExvYWRlZFRhc2tzID0gWygpID0+IHtcbiAgICB3aW5kb3cuRGF0ZVBpY2tlciA9IERhdGVQaWNrZXIuaW5pdCgnLmpzLWRhdGUtcGlja2VyJyk7XG59XTtcbiAgICBcbmlmKCdhZGRFdmVudExpc3RlbmVyJyBpbiB3aW5kb3cpIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgKCkgPT4geyBvbkRPTUNvbnRlbnRMb2FkZWRUYXNrcy5mb3JFYWNoKChmbikgPT4gZm4oKSk7IH0pOyIsImltcG9ydCBkZWZhdWx0cyBmcm9tICcuL2xpYi9kZWZhdWx0cyc7XG5pbXBvcnQgY29tcG9uZW50UHJvdG90eXBlIGZyb20gJy4vbGliL2NvbXBvbmVudC1wcm90b3R5cGUnO1xuXG5jb25zdCBpbml0ID0gKHNlbCwgb3B0cykgPT4ge1xuXHRsZXQgZWxzID0gW10uc2xpY2UuY2FsbChkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKHNlbCkpO1xuICAgIC8vbGV0IGVscyA9IEFycmF5LmZyb20oZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChzZWwpKTtcblxuXHRpZighZWxzLmxlbmd0aCkgcmV0dXJuIGNvbnNvbGUud2FybignRGF0ZSBwaWNrZXIgbm90IGluaXRpYWxpc2VkLCBubyBhdWdtZW50YWJsZSBlbGVtZW50cyBmb3VuZCcpO1xuICAgIFxuXHRyZXR1cm4ge1xuXHRcdHBpY2tlcnM6IGVscy5tYXAoKGVsKSA9PiB7XG5cdFx0XHRyZXR1cm4gT2JqZWN0LmFzc2lnbihPYmplY3QuY3JlYXRlKGNvbXBvbmVudFByb3RvdHlwZSksIHtcblx0XHRcdFx0bm9kZTogZWwsIFxuXHRcdFx0XHRpbnB1dDogZWwucXVlcnlTZWxlY3RvcignaW5wdXQnKSxcblx0XHRcdFx0YnRuOiBlbC5xdWVyeVNlbGVjdG9yKCcuYnRuJyksXG5cdFx0XHRcdHNldHRpbmdzOiBPYmplY3QuYXNzaWduKHt9LCBkZWZhdWx0cywgb3B0cylcblx0XHRcdH0pLmluaXQoKTtcblx0XHR9KSxcblx0XHRmaW5kKHNlbCl7XG5cdFx0XHRsZXQgY2FuZGlkYXRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihzZWwpO1xuXHRcdFx0aWYoIWNhbmRpZGF0ZSkgcmV0dXJuIGNvbnNvbGUud2FybignRGF0ZSBwaWNrZXIgbm90IGZvdW5kIGZvciB0aGlzIHNlbGVjdG9yJyk7XG5cdFx0XHRyZXR1cm4gdGhpcy5waWNrZXJzLnJlZHVjZSgoYWNjLCBjdXJyKSA9PiB7XG5cdFx0XHRcdGlmKGN1cnIubm9kZSA9PT0gY2FuZGlkYXRlKSBhY2MgPSBjdXJyO1xuXHRcdFx0XHRyZXR1cm4gYWNjO1xuXHRcdFx0fSwgZmFsc2UpO1xuXHRcdH1cblx0fTtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IHsgaW5pdCB9OyIsImltcG9ydCB7IFxuXHRlbGVtZW50RmFjdG9yeSxcblx0bW9udGhWaWV3RmFjdG9yeSxcblx0Y2F0Y2hCdWJibGUsXG5cdG1vbnRoTmFtZXMsXG5cdGRheU5hbWVzLFxuXHRnZXRNb250aExlbmd0aCxcblx0cGFyc2VEYXRlLFxuXHRmb3JtYXREYXRlXG59IGZyb20gJy4vdXRpbHMnO1xuaW1wb3J0IHsgY2FsZW5kYXIsIG1vbnRoIH0gZnJvbSAnLi90ZW1wbGF0ZXMnO1xuaW1wb3J0IHsgXG5cdFRSSUdHRVJfRVZFTlRTLFxuXHRUUklHR0VSX0tFWUNPREVTLFxuXHRLRVlDT0RFUyxcblx0QVJJQV9IRUxQX1RFWFQsXG5cdENMQVNTTkFNRVMsXG5cdFNFTEVDVE9SUyxcblx0REFUQV9BVFRSSUJVVEVTXG59IGZyb20gJy4vY29uc3RhbnRzJztcblxuZXhwb3J0IGRlZmF1bHQge1xuXHRpbml0KCkge1xuXHRcdHRoaXMuaW5pdENsb25lKCk7XG5cblx0XHRUUklHR0VSX0VWRU5UUy5mb3JFYWNoKGV2ID0+IHtcblx0XHRcdHRoaXMuYnRuLmFkZEV2ZW50TGlzdGVuZXIoZXYsIGUgPT4ge1xuXHRcdFx0XHRpZighIWUua2V5Q29kZSAmJiAhflRSSUdHRVJfS0VZQ09ERVMuaW5kZXhPZihlLmtleUNvZGUpKSByZXR1cm47XG5cdFx0XHRcdGNhdGNoQnViYmxlKGUpO1xuXHRcdFx0XHR0aGlzLnRvZ2dsZSgpO1xuXHRcdFx0fSk7XG5cdFx0fSk7XG5cblx0XHR0aGlzLmJvdW5kSGFuZGxlRm9jdXNPdXQgPSB0aGlzLmhhbmRsZUZvY3VzT3V0LmJpbmQodGhpcyk7XG5cblx0XHR0aGlzLnN0YXJ0RGF0ZSA9IHRoaXMuaW5wdXQudmFsdWUgPyBwYXJzZURhdGUodGhpcy5pbnB1dC52YWx1ZSwgdGhpcy5zZXR0aW5ncy52YWx1ZUZvcm1hdCkgOiBmYWxzZTtcblx0XHRpZih0aGlzLnN0YXJ0RGF0ZSkgdGhpcy5pbnB1dENsb25lLnZhbHVlID0gZm9ybWF0RGF0ZSh0aGlzLnN0YXJ0RGF0ZSwgdGhpcy5zZXR0aW5ncy5kaXNwbGF5Rm9ybWF0KTtcblxuXHRcdHRoaXMucm9vdERhdGUgPSB0aGlzLnN0YXJ0RGF0ZSB8fCBuZXcgRGF0ZSgpO1xuXHRcdHRoaXMucm9vdERhdGUuc2V0SG91cnMoMCwwLDAsMCk7XG5cdFx0dGhpcy5zZXR0aW5ncy5zdGFydE9wZW4gJiYgdGhpcy5vcGVuKCk7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH0sXG5cdGluaXRDbG9uZSgpe1xuXHRcdHRoaXMuaW5wdXRDbG9uZSA9IGVsZW1lbnRGYWN0b3J5KCdpbnB1dCcsIHsgdHlwZTogJ3RleHQnLCB0YWJpbmRleDogLTF9LCB0aGlzLmlucHV0LmNsYXNzTmFtZSk7XG5cdFx0dGhpcy5pbnB1dC5zZXRBdHRyaWJ1dGUoJ3R5cGUnLCAnaGlkZGVuJyk7XG5cdFx0dGhpcy5ub2RlLmFwcGVuZENoaWxkKHRoaXMuaW5wdXRDbG9uZSk7XG5cblx0XHR0aGlzLmlucHV0Q2xvbmUuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgZSA9PiB7XG5cdFx0XHRsZXQgY2FuZGlkYXRlID0gcGFyc2VEYXRlKHRoaXMuaW5wdXRDbG9uZS52YWx1ZSwgdGhpcy5zZXR0aW5ncy5kaXNwbGF5Rm9ybWF0KS8vZmFsc2UgaWYgcGFyc2UgZmFpbHNcblx0XHRcdGlmKGNhbmRpZGF0ZSkgdGhpcy5zZXREYXRlKGNhbmRpZGF0ZSk7XG5cdFx0XHRlbHNlIHRoaXMuaW5wdXQudmFsdWUgPSB0aGlzLmlucHV0Q2xvbmUudmFsdWUgPSAnJztcblx0XHR9KTtcblx0fSxcblx0dG9nZ2xlKCl7XG5cdFx0aWYodGhpcy5pc09wZW4pIHRoaXMuY2xvc2UoKTtcblx0XHRlbHNlIHRoaXMub3BlbigpO1xuXHR9LFxuXHRvcGVuKCl7XG5cdFx0aWYodGhpcy5pc09wZW4pIHJldHVybjtcblx0XHR0aGlzLnJlbmRlckNhbGVuZGFyKCk7XG5cdFx0dGhpcy5pc09wZW4gPSB0cnVlO1xuXHRcdHRoaXMuYnRuLnNldEF0dHJpYnV0ZSgnYXJpYS1leHBhbmRlZCcsICd0cnVlJyk7XG5cdFx0dGhpcy53b3JraW5nRGF0ZSA9IHRoaXMucm9vdERhdGU7XG5cdFx0dGhpcy5jb250YWluZXIucXVlcnlTZWxlY3RvcihTRUxFQ1RPUlMuQlROX0FDVElWRSkgPyB0aGlzLmNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKFNFTEVDVE9SUy5CVE5fQUNUSVZFKS5mb2N1cygpIDogdGhpcy5jb250YWluZXIucXVlcnlTZWxlY3RvcihTRUxFQ1RPUlMuQlROX1RPREFZKSA/IHRoaXMuY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoU0VMRUNUT1JTLkJUTl9UT0RBWSkuZm9jdXMoKSA6IHRoaXMuY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3JBbGwoU0VMRUNUT1JTLkJUTl9ERUZBVUxUKVswXS5mb2N1cygpO1xuXHRcdGRvY3VtZW50LmJvZHkuYWRkRXZlbnRMaXN0ZW5lcignZm9jdXNvdXQnLCB0aGlzLmJvdW5kSGFuZGxlRm9jdXNPdXQpO1xuXHR9LFxuXHRjbG9zZSgpe1xuXHRcdGlmKCF0aGlzLmlzT3BlbikgcmV0dXJuO1xuXHRcdHRoaXMubm9kZS5yZW1vdmVDaGlsZCh0aGlzLmNvbnRhaW5lcik7XG5cdFx0dGhpcy5pc09wZW4gPSBmYWxzZTtcblx0XHR0aGlzLmJ0bi5zZXRBdHRyaWJ1dGUoJ2FyaWEtZXhwYW5kZWQnLCAnZmFsc2UnKTtcblx0XHR0aGlzLmJ0bi5mb2N1cygpO1xuXHRcdHRoaXMud29ya2luZ0RhdGUgPSBmYWxzZTtcblx0fSxcblx0aGFuZGxlRm9jdXNPdXQoKXtcblx0XHR3aW5kb3cuc2V0VGltZW91dCgoKSA9PiB7XG5cdFx0XHRpZih0aGlzLmNvbnRhaW5lci5jb250YWlucyhkb2N1bWVudC5hY3RpdmVFbGVtZW50KSkgcmV0dXJuO1xuXHRcdFx0dGhpcy5jbG9zZSgpO1xuXHRcdFx0ZG9jdW1lbnQuYm9keS5yZW1vdmVFdmVudExpc3RlbmVyKCdmb2N1c291dCcsIHRoaXMuYm91bmRIYW5kbGVGb2N1c091dCk7XG5cdFx0fSwgMTYpO1xuXHR9LFxuXHRyZW5kZXJDYWxlbmRhcigpe1xuXHRcdHRoaXMuY29udGFpbmVyID0gZWxlbWVudEZhY3RvcnkoJ2RpdicsIHsgJ3JvbGUnOiAnZGlhbG9nJywgJ2FyaWEtaGVscHRleHQnOiBBUklBX0hFTFBfVEVYVCB9LCBDTEFTU05BTUVTLkNPTlRBSU5FUik7XG5cdFx0dGhpcy5jb250YWluZXIuaW5uZXJIVE1MID0gY2FsZW5kYXIoKTtcblx0XHR0aGlzLm5vZGUuYXBwZW5kQ2hpbGQodGhpcy5jb250YWluZXIpO1xuXHRcdHRoaXMubW9udGhDb250YWluZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFNFTEVDVE9SUy5NT05USF9DT05UQUlORVIpO1xuXHRcdHRoaXMucmVuZGVyTW9udGgoKTtcblx0XHR0aGlzLmluaXRMaXN0ZW5lcnMoKTtcblx0fSxcblx0cmVuZGVyTW9udGgoKXtcblx0XHR0aGlzLm1vbnRoVmlldyA9IG1vbnRoVmlld0ZhY3RvcnkodGhpcy53b3JraW5nRGF0ZSB8fCB0aGlzLnJvb3REYXRlLCB0aGlzLnN0YXJ0RGF0ZSk7XG5cdFx0dGhpcy5tb250aENvbnRhaW5lci5pbm5lckhUTUwgPSBtb250aCh0aGlzLm1vbnRoVmlldyk7XG5cdFx0aWYoIXRoaXMuY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoYCR7U0VMRUNUT1JTLkJUTl9ERUZBVUxUfVt0YWJpbmRleD1cIjBcIl1gKSkgW10uc2xpY2UuY2FsbCh0aGlzLmNvbnRhaW5lci5xdWVyeVNlbGVjdG9yQWxsKGAke1NFTEVDVE9SUy5CVE5fREVGQVVMVH06bm90KFtkaXNhYmxlZF0pYCkpLnNoaWZ0KCkuc2V0QXR0cmlidXRlKCd0YWJpbmRleCcsICcwJyk7XG5cdH0sXG5cdGluaXRMaXN0ZW5lcnMoKXtcblx0XHRUUklHR0VSX0VWRU5UUy5mb3JFYWNoKGV2ID0+IHtcblx0XHRcdHRoaXMuY29udGFpbmVyLmFkZEV2ZW50TGlzdGVuZXIoZXYsIHRoaXMucm91dGVIYW5kbGVycy5iaW5kKHRoaXMpKTtcblx0XHR9KTtcblx0fSxcblx0cm91dGVIYW5kbGVycyhlKXtcblx0XHRpZihlLmtleUNvZGUpIHRoaXMuaGFuZGxlS2V5RG93bihlKTtcblx0XHRlbHNlIHtcblx0XHRcdGlmKGUudGFyZ2V0LmNsYXNzTGlzdC5jb250YWlucyhDTEFTU05BTUVTLk5BVl9CVE4pIHx8IGUudGFyZ2V0LnBhcmVudE5vZGUuY2xhc3NMaXN0LmNvbnRhaW5zKENMQVNTTkFNRVMuTkFWX0JUTikpIHRoaXMuaGFuZGxlTmF2KCsoZS50YXJnZXQuZ2V0QXR0cmlidXRlKERBVEFfQVRUUklCVVRFUy5BQ1RJT04pIHx8IGUudGFyZ2V0LnBhcmVudE5vZGUuZ2V0QXR0cmlidXRlKERBVEFfQVRUUklCVVRFUy5BQ1RJT04pKSk7XG5cdFx0XHRpZihlLnRhcmdldC5jbGFzc0xpc3QuY29udGFpbnMoQ0xBU1NOQU1FUy5CVE5fREVGQVVMVCkpIHRoaXMuc2VsZWN0RGF0ZShlKTtcblx0XHR9XG5cdH0sXG5cdGhhbmRsZU5hdihhY3Rpb24pe1xuXHRcdHRoaXMud29ya2luZ0RhdGUgPSBuZXcgRGF0ZSh0aGlzLndvcmtpbmdEYXRlLmdldEZ1bGxZZWFyKCksIHRoaXMud29ya2luZ0RhdGUuZ2V0TW9udGgoKSArIGFjdGlvbik7XG5cdFx0dGhpcy5yZW5kZXJNb250aCgpO1xuXHR9LFxuXHRoYW5kbGVLZXlEb3duKGUpe1xuXHRcdGNvbnN0IGtleURvd25EaWN0aW9uYXJ5ID0ge1xuXHRcdFx0UEFHRV9VUCgpe1xuXHRcdFx0XHRjYXRjaEJ1YmJsZShlKTtcblx0XHRcdFx0bGV0IHRhcmdldERheSA9IGdldE1vbnRoTGVuZ3RoKHRoaXMud29ya2luZ0RhdGUuZ2V0RnVsbFllYXIoKSwgdGhpcy53b3JraW5nRGF0ZS5nZXRNb250aCgpIC0gMSkgPCBlLnRhcmdldC5nZXRBdHRyaWJ1dGUoREFUQV9BVFRSSUJVVEVTLkRBWSkgPyBnZXRNb250aExlbmd0aCh0aGlzLndvcmtpbmdEYXRlLmdldEZ1bGxZZWFyKCksIHRoaXMud29ya2luZ0RhdGUuZ2V0TW9udGgoKSAtIDEpIDogZS50YXJnZXQuZ2V0QXR0cmlidXRlKERBVEFfQVRUUklCVVRFUy5EQVkpO1xuXHRcdFx0XHR0aGlzLndvcmtpbmdEYXRlID0gbmV3IERhdGUodGhpcy53b3JraW5nRGF0ZS5nZXRGdWxsWWVhcigpLCB0aGlzLndvcmtpbmdEYXRlLmdldE1vbnRoKCkgLSAxLCB0YXJnZXREYXkpO1xuXHRcdFx0XHR0aGlzLnJlbmRlck1vbnRoKCk7XG5cdFx0XHRcdHRoaXMuY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoYFske0RBVEFfQVRUUklCVVRFUy5EQVl9PVwiJHt0YXJnZXREYXl9XCJdOm5vdCg6ZGlzYWJsZWQpYCkuZm9jdXMoKTtcblx0XHRcdH0sLy8/XG5cdFx0XHRQQUdFX0RPV04oKXtcblx0XHRcdFx0Y2F0Y2hCdWJibGUoZSk7XG5cdFx0XHRcdGxldCB0YXJnZXREYXkgPSBnZXRNb250aExlbmd0aCh0aGlzLndvcmtpbmdEYXRlLmdldEZ1bGxZZWFyKCksIHRoaXMud29ya2luZ0RhdGUuZ2V0TW9udGgoKSArIDEpIDwgZS50YXJnZXQuZ2V0QXR0cmlidXRlKERBVEFfQVRUUklCVVRFUy5EQVkpID8gZ2V0TW9udGhMZW5ndGgodGhpcy53b3JraW5nRGF0ZS5nZXRGdWxsWWVhcigpLCB0aGlzLndvcmtpbmdEYXRlLmdldE1vbnRoKCkgLSAxKSA6IGUudGFyZ2V0LmdldEF0dHJpYnV0ZShEQVRBX0FUVFJJQlVURVMuREFZKTtcblx0XHRcdFx0dGhpcy53b3JraW5nRGF0ZSA9IG5ldyBEYXRlKHRoaXMud29ya2luZ0RhdGUuZ2V0RnVsbFllYXIoKSwgdGhpcy53b3JraW5nRGF0ZS5nZXRNb250aCgpICsgMSwgdGFyZ2V0RGF5KTtcblx0XHRcdFx0dGhpcy5yZW5kZXJNb250aCgpO1xuXHRcdFx0XHQvL2ZvY3VzIG9uIGxhc3QgRG9NIGlmIGdyZWF0ZXIgdGhhbiBsZW5ndGggb2YgbW9udGhcblx0XHRcdFx0dGhpcy5jb250YWluZXIucXVlcnlTZWxlY3RvcihgWyR7REFUQV9BVFRSSUJVVEVTLkRBWX09XCIke3RhcmdldERheX1cIl06bm90KDpkaXNhYmxlZClgKS5mb2N1cygpO1xuXHRcdFx0fSwvLz9cblx0XHRcdFRBQigpe1xuXHRcdFx0XHQvKiBcblx0XHRcdFx0XHQtIHRyYXAgdGFiIGluIGZvY3VzYWJsZSBjaGlsZHJlbj8/XG5cdFx0XHRcdFx0XHQgLSByZXR1cm4gdG8gYnV0dG9uIGFmdGVyIGxhc3QgZm9jdXNhYmxlIGNoaWxkP1xuXHRcdFx0XHRcdC0gcmVmLiBodHRwczovL2dpdGh1Yi5jb20vbWpicC9zdG9ybS1mb2N1cy1tYW5hZ2VyL2Jsb2IvbWFzdGVyL3NyYy9zdG9ybS1mb2N1cy1tYW5hZ2VyLmpzXG5cdFx0XHRcdCovXG5cdFx0XHR9LFxuXHRcdFx0RU5URVIoZSl7XG5cdFx0XHRcdGNhdGNoQnViYmxlKGUpO1xuXHRcdFx0XHRpZihlLnRhcmdldC5jbGFzc0xpc3QuY29udGFpbnMoQ0xBU1NOQU1FUy5CVE5fREVGQVVMVCkpIHRoaXMuc2VsZWN0RGF0ZShlKTtcblx0XHRcdFx0aWYoZS50YXJnZXQuY2xhc3NMaXN0LmNvbnRhaW5zKENMQVNTTkFNRVMuTkFWX0JUTikpIHRoaXMuaGFuZGxlTmF2KCtlLnRhcmdldC5nZXRBdHRyaWJ1dGUoREFUQV9BVFRSSUJVVEVTLkFDVElPTikpO1xuXHRcdFx0fSxcblx0XHRcdEVTQ0FQRSgpeyB0aGlzLmNsb3NlKCk7IH0sXG5cdFx0XHRTUEFDRShlKSB7IGtleURvd25EaWN0aW9uYXJ5LkVOVEVSKGUpOyB9LFxuXHRcdFx0TEVGVChlKXtcblx0XHRcdFx0Y2F0Y2hCdWJibGUoZSk7XG5cdFx0XHRcdGlmKCFlLnRhcmdldC5jbGFzc0xpc3QuY29udGFpbnMoQ0xBU1NOQU1FUy5CVE5fREVGQVVMVCkpIHJldHVybjtcblxuXHRcdFx0XHRpZih0aGlzLm1vbnRoVmlldy5tb2RlbFsrZS50YXJnZXQuZ2V0QXR0cmlidXRlKERBVEFfQVRUUklCVVRFUy5NT0RFTF9JTkRFWCldLm51bWJlciA9PT0gMSkge1xuXHRcdFx0XHRcdHRoaXMud29ya2luZ0RhdGUgPSBuZXcgRGF0ZSh0aGlzLndvcmtpbmdEYXRlLmdldEZ1bGxZZWFyKCksIHRoaXMud29ya2luZ0RhdGUuZ2V0TW9udGgoKSAtIDEpO1xuXHRcdFx0XHRcdHRoaXMucmVuZGVyTW9udGgoKTtcblx0XHRcdFx0XHRbXS5zbGljZS5jYWxsKHRoaXMuY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3JBbGwoU0VMRUNUT1JTLkJUTl9FTkFCTEVEKSkucG9wKCkuZmlyc3RFbGVtZW50Q2hpbGQuZm9jdXMoKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNlIHRoaXMuY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoYFske0RBVEFfQVRUUklCVVRFUy5NT0RFTF9JTkRFWH09XCIkeytlLnRhcmdldC5nZXRBdHRyaWJ1dGUoREFUQV9BVFRSSUJVVEVTLk1PREVMX0lOREVYKSAtIDF9XCJdYCkuZm9jdXMoKTtcblx0XHRcdH0sXG5cdFx0XHRVUCgpe1xuXHRcdFx0XHRjYXRjaEJ1YmJsZShlKTtcblx0XHRcdFx0aWYoIWUudGFyZ2V0LmNsYXNzTGlzdC5jb250YWlucyhDTEFTU05BTUVTLkJUTl9ERUZBVUxUKSkgcmV0dXJuO1xuXHRcdFx0XHRcblx0XHRcdFx0bGV0IG5leHREYXlJbmRleCA9ICtlLnRhcmdldC5nZXRBdHRyaWJ1dGUoREFUQV9BVFRSSUJVVEVTLk1PREVMX0lOREVYKSAtIDc7XG5cblx0XHRcdFx0aWYoK3RoaXMubW9udGhWaWV3Lm1vZGVsWytlLnRhcmdldC5nZXRBdHRyaWJ1dGUoREFUQV9BVFRSSUJVVEVTLk1PREVMX0lOREVYKV0ubnVtYmVyIC0gNyA8IDEpIHtcblx0XHRcdFx0XHR0aGlzLndvcmtpbmdEYXRlID0gbmV3IERhdGUodGhpcy53b3JraW5nRGF0ZS5nZXRGdWxsWWVhcigpLCB0aGlzLndvcmtpbmdEYXRlLmdldE1vbnRoKCkgLSAxKTtcblx0XHRcdFx0XHR0aGlzLnJlbmRlck1vbnRoKCk7XG5cdFx0XHRcdFx0Ly91c2UgdGhpcy53b3JraW5nRGF0ZSBpbnN0ZWFkIG9mIHF1ZXJ5aW5nIERPTT9cblx0XHRcdFx0XHRpZighdGhpcy5jb250YWluZXIucXVlcnlTZWxlY3RvcihgWyR7REFUQV9BVFRSSUJVVEVTLk1PREVMX0lOREVYfT1cIiR7dGhpcy5tb250aFZpZXcubW9kZWwubGVuZ3RoICsgbmV4dERheUluZGV4fVwiXWApfHwgdGhpcy5jb250YWluZXIucXVlcnlTZWxlY3RvcihgWyR7REFUQV9BVFRSSUJVVEVTLk1PREVMX0lOREVYfT1cIiR7dGhpcy5tb250aFZpZXcubW9kZWwubGVuZ3RoICsgbmV4dERheUluZGV4fVwiXWApICYmIHRoaXMuY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoYFske0RBVEFfQVRUUklCVVRFUy5NT0RFTF9JTkRFWH09XCIke3RoaXMubW9udGhWaWV3Lm1vZGVsLmxlbmd0aCArIG5leHREYXlJbmRleH1cIl1gKS5oYXNBdHRyaWJ1dGUoJ2Rpc2FibGVkJykpIFxuXHRcdFx0XHRcdFx0dGhpcy5jb250YWluZXIucXVlcnlTZWxlY3RvcihgWyR7REFUQV9BVFRSSUJVVEVTLk1PREVMX0lOREVYfT1cIiR7dGhpcy5tb250aFZpZXcubW9kZWwubGVuZ3RoICsgKG5leHREYXlJbmRleCAtIDcpfVwiXWApLmZvY3VzKCk7XG5cdFx0XHRcdFx0ZWxzZSB0aGlzLmNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKGBbJHtEQVRBX0FUVFJJQlVURVMuTU9ERUxfSU5ERVh9PVwiJHt0aGlzLm1vbnRoVmlldy5tb2RlbC5sZW5ndGggKyBuZXh0RGF5SW5kZXh9XCJdYCkuZm9jdXMoKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNlIHRoaXMuY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoYFske0RBVEFfQVRUUklCVVRFUy5NT0RFTF9JTkRFWH09XCIke25leHREYXlJbmRleH1cIl1gKS5mb2N1cygpO1xuXHRcdFx0fSxcblx0XHRcdFJJR0hUKGUpe1xuXHRcdFx0XHRjYXRjaEJ1YmJsZShlKTtcblx0XHRcdFx0aWYoIWUudGFyZ2V0LmNsYXNzTGlzdC5jb250YWlucyhDTEFTU05BTUVTLkJUTl9ERUZBVUxUKSkgcmV0dXJuO1xuXHRcdFx0XHRcblx0XHRcdFx0aWYodGhpcy5tb250aFZpZXcubW9kZWxbK2UudGFyZ2V0LmdldEF0dHJpYnV0ZShEQVRBX0FUVFJJQlVURVMuTU9ERUxfSU5ERVgpXS5udW1iZXIgPT09IGdldE1vbnRoTGVuZ3RoKHRoaXMubW9udGhWaWV3Lm1vZGVsWytlLnRhcmdldC5nZXRBdHRyaWJ1dGUoREFUQV9BVFRSSUJVVEVTLk1PREVMX0lOREVYKV0uZGF0ZS5nZXRGdWxsWWVhcigpLCB0aGlzLm1vbnRoVmlldy5tb2RlbFsrZS50YXJnZXQuZ2V0QXR0cmlidXRlKERBVEFfQVRUUklCVVRFUy5NT0RFTF9JTkRFWCldLmRhdGUuZ2V0TW9udGgoKSkpIHtcblx0XHRcdFx0XHR0aGlzLndvcmtpbmdEYXRlID0gbmV3IERhdGUodGhpcy53b3JraW5nRGF0ZS5nZXRGdWxsWWVhcigpLCB0aGlzLndvcmtpbmdEYXRlLmdldE1vbnRoKCkgKyAxKTtcblx0XHRcdFx0XHR0aGlzLnJlbmRlck1vbnRoKCk7XG5cdFx0XHRcdFx0W10uc2xpY2UuY2FsbCh0aGlzLmNvbnRhaW5lci5xdWVyeVNlbGVjdG9yQWxsKFNFTEVDVE9SUy5CVE5fRU5BQkxFRCkpLnNoaWZ0KCkuZmlyc3RFbGVtZW50Q2hpbGQuZm9jdXMoKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNlIHRoaXMuY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoYFske0RBVEFfQVRUUklCVVRFUy5NT0RFTF9JTkRFWH09XCIkeytlLnRhcmdldC5nZXRBdHRyaWJ1dGUoREFUQV9BVFRSSUJVVEVTLk1PREVMX0lOREVYKSArIDF9XCJdYCkuZm9jdXMoKTtcblx0XHRcdFx0XG5cdFx0XHR9LFxuXHRcdFx0RE9XTigpe1xuXHRcdFx0XHRjYXRjaEJ1YmJsZShlKTtcblx0XHRcdFx0aWYoIWUudGFyZ2V0LmNsYXNzTGlzdC5jb250YWlucyhDTEFTU05BTUVTLkJUTl9ERUZBVUxUKSkgcmV0dXJuO1xuXG5cdFx0XHRcdGxldCBuZXh0RGF0ZSA9ICt0aGlzLm1vbnRoVmlldy5tb2RlbFsrZS50YXJnZXQuZ2V0QXR0cmlidXRlKERBVEFfQVRUUklCVVRFUy5NT0RFTF9JTkRFWCldLm51bWJlciArIDcsXG5cdFx0XHRcdFx0bmV4dERheUluZGV4ID0gK2UudGFyZ2V0LmdldEF0dHJpYnV0ZShEQVRBX0FUVFJJQlVURVMuTU9ERUxfSU5ERVgpICsgNztcblxuXHRcdFx0XHRpZigrdGhpcy5tb250aFZpZXcubW9kZWxbK2UudGFyZ2V0LmdldEF0dHJpYnV0ZShEQVRBX0FUVFJJQlVURVMuTU9ERUxfSU5ERVgpXS5udW1iZXIgKyA3ID4gZ2V0TW9udGhMZW5ndGgodGhpcy5tb250aFZpZXcubW9kZWxbK2UudGFyZ2V0LmdldEF0dHJpYnV0ZShEQVRBX0FUVFJJQlVURVMuTU9ERUxfSU5ERVgpXS5kYXRlLmdldEZ1bGxZZWFyKCksIHRoaXMubW9udGhWaWV3Lm1vZGVsWytlLnRhcmdldC5nZXRBdHRyaWJ1dGUoREFUQV9BVFRSSUJVVEVTLk1PREVMX0lOREVYKV0uZGF0ZS5nZXRNb250aCgpKSkge1xuXHRcdFx0XHRcdHRoaXMud29ya2luZ0RhdGUgPSBuZXcgRGF0ZSh0aGlzLndvcmtpbmdEYXRlLmdldEZ1bGxZZWFyKCksIHRoaXMud29ya2luZ0RhdGUuZ2V0TW9udGgoKSArIDEpO1xuXHRcdFx0XHRcdHRoaXMucmVuZGVyTW9udGgoKTtcblx0XHRcdFx0XHQvL3VzZSB0aGlzLndvcmtpbmdEYXRlIGluc3RlYWQgb2YgcXVlcnlpbmcgRE9NP1xuXHRcdFx0XHRcdGlmKHRoaXMuY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoYFske0RBVEFfQVRUUklCVVRFUy5NT0RFTF9JTkRFWH09XCIke25leHREYXlJbmRleCAlIDd9XCJdYCkuaGFzQXR0cmlidXRlKCdkaXNhYmxlZCcpKSB0aGlzLmNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKGBbJHtEQVRBX0FUVFJJQlVURVMuTU9ERUxfSU5ERVh9PVwiJHsobmV4dERheUluZGV4ICUgNykgKyA3fVwiXWApLmZvY3VzKCk7XG5cdFx0XHRcdFx0ZWxzZSB0aGlzLmNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKGBbJHtEQVRBX0FUVFJJQlVURVMuTU9ERUxfSU5ERVh9PVwiJHtuZXh0RGF5SW5kZXggJSA3fVwiXWApLmZvY3VzKCk7XG5cdFx0XHRcdH1cblx0XHRcdFx0ZWxzZSB0aGlzLmNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKGBbJHtEQVRBX0FUVFJJQlVURVMuTU9ERUxfSU5ERVh9PVwiJHtuZXh0RGF5SW5kZXh9XCJdYCkuZm9jdXMoKTtcblx0XHRcdH1cblx0XHR9O1xuXHRcdGlmKEtFWUNPREVTW2Uua2V5Q29kZV0gJiYga2V5RG93bkRpY3Rpb25hcnlbS0VZQ09ERVNbZS5rZXlDb2RlXV0pIGtleURvd25EaWN0aW9uYXJ5W0tFWUNPREVTW2Uua2V5Q29kZV1dLmNhbGwodGhpcywgZSk7XG5cdH0sXG5cdHNlbGVjdERhdGUoZSl7XG5cdFx0ZS50YXJnZXQuY2xhc3NMaXN0LmFkZChTRUxFQ1RPUlMuQlROX0FDVElWRSk7XG5cdFx0dGhpcy5zZXREYXRlKHRoaXMubW9udGhWaWV3Lm1vZGVsWytlLnRhcmdldC5nZXRBdHRyaWJ1dGUoREFUQV9BVFRSSUJVVEVTLk1PREVMX0lOREVYKV0uZGF0ZSk7XHRcdFxuXHRcdHRoaXMuY2xvc2UoKTtcblx0fSxcblx0cmVzZXQoKXtcblx0XHR0aGlzLnJvb3REYXRlID0gbmV3IERhdGUoKTtcblx0XHR0aGlzLnJvb3REYXRlLnNldEhvdXJzKDAsMCwwLDApO1xuXHRcdHRoaXMuc3RhcnREYXRlID0gZmFsc2U7XG5cdFx0dGhpcy5pbnB1dENsb25lLnZhbHVlID0gJyc7XG5cdFx0dGhpcy5pbnB1dC52YWx1ZSA9ICcnO1xuXHRcdGlmKHRoaXMuaXNPcGVuKSB0aGlzLmNsb3NlKCk7XG5cdH0sXG5cdHNldERhdGUobmV4dERhdGUpe1xuXHRcdHRoaXMuc3RhcnREYXRlID0gbmV4dERhdGU7XG5cdFx0dGhpcy5yb290RGF0ZSA9IHRoaXMuc3RhcnREYXRlO1xuXHRcdHRoaXMuaW5wdXRDbG9uZS52YWx1ZSA9IGZvcm1hdERhdGUodGhpcy5zdGFydERhdGUsIHRoaXMuc2V0dGluZ3MuZGlzcGxheUZvcm1hdCk7XG5cdFx0dGhpcy5pbnB1dC52YWx1ZSA9IGZvcm1hdERhdGUodGhpcy5zdGFydERhdGUsIHRoaXMuc2V0dGluZ3MudmFsdWVGb3JtYXQpO1xuXHR9LFxuXHRnZXRWYWx1ZSgpeyByZXR1cm4gdGhpcy5zdGFydERhdGU7IH0sXG5cdHNldFZhbHVlKG5leHRWYWx1ZSwgZm9ybWF0ID0gdGhpcy5zZXR0aW5ncy52YWx1ZUZvcm1hdCl7XG5cdFx0dGhpcy5zZXREYXRlKHBhcnNlRGF0ZShuZXh0VmFsdWUsIGZvcm1hdCkpO1xuXHRcdGlmKHRoaXMuaXNPcGVuKSB0aGlzLndvcmtpbmdEYXRlID0gdGhpcy5zdGFydERhdGUsIHRoaXMucmVuZGVyTW9udGgoKTtcblx0fVxufTsiLCJleHBvcnQgY29uc3QgVFJJR0dFUl9FVkVOVFMgPSBbJ2NsaWNrJywgJ2tleWRvd24nXTtcblxuZXhwb3J0IGNvbnN0IFRSSUdHRVJfS0VZQ09ERVMgPSBbMTMsIDMyXTtcblxuZXhwb3J0IGNvbnN0IEtFWUNPREVTID0ge1xuICAgIDk6ICdUQUInLFxuICAgIDEzOiAnRU5URVInLFxuICAgIDI3OiAnRVNDQVBFJyxcbiAgICAzMjogJ1NQQUNFJyxcbiAgICAzMzogJ1BBR0VfVVAnLFxuICAgIDM0OiAnUEFHRV9ET1dOJyxcbiAgICAzNzogJ0xFRlQnLFxuICAgIDM4OiAnVVAnLFxuICAgIDM5OiAnUklHSFQnLFxuICAgIDQwOiAnRE9XTidcbn07XG5cbmV4cG9ydCBjb25zdCBBUklBX0hFTFBfVEVYVCA9IGBQcmVzcyB0aGUgYXJyb3cga2V5cyB0byBuYXZpZ2F0ZSBieSBkYXksIFBhZ2VVcCBhbmQgUGFnZURvd24gdG8gbmF2aWdhdGUgYnkgbW9udGgsIEVudGVyIG9yIFNwYWNlIHRvIHNlbGVjdCBhIGRhdGUsIGFuZCBFc2NhcGUgdG8gY2FuY2VsLmA7XG5cbi8qXG4gdG8gZG86XG4gY29tYmluZSBDTEFTU05BTUVTIGFuZCBTRUxFQ1RPUlMgKHJlbW92ZSBTRUxFVE9SUyBhbmQgYXBwZW5kIGRvdCBtYW51YWxseSlcbiovXG5leHBvcnQgY29uc3QgQ0xBU1NOQU1FUyA9IHtcbiAgICBDT05UQUlORVI6ICdzZHAtY29udGFpbmVyJyxcbiAgICBOQVZfQlROOiAnanMtc2RwLW5hdl9fYnRuJyxcbiAgICBCVE5fREVGQVVMVDogJ3NkcC1kYXktYnRuJyxcbiAgICBNT05USF9DT05UQUlORVI6ICdqcy1zZHBfX21vbnRoJ1xufTtcblxuZXhwb3J0IGNvbnN0IFNFTEVDVE9SUyA9IHtcbiAgICBCVE5fREVGQVVMVDogJy5zZHAtZGF5LWJ0bicsXG4gICAgQlROX0FDVElWRTogJy5zZHAtZGF5LWJ0bi0taXMtYWN0aXZlJyxcbiAgICBCVE5fVE9EQVk6ICcuc2RwLWRheS1idG4tLWlzLXRvZGF5JyxcbiAgICBCVE5fRU5BQkxFRDogJy5zZHAtZGF5LWJvZHk6bm90KC5zZHAtZGF5LWRpc2FibGVkKScsXG4gICAgTU9OVEhfQ09OVEFJTkVSOiAnLmpzLXNkcF9fbW9udGgnLFxufTtcblxuZXhwb3J0IGNvbnN0IERBVEFfQVRUUklCVVRFUyA9IHtcbiAgICBBQ1RJT046ICdkYXRhLWFjdGlvbicsXG4gICAgTU9ERUxfSU5ERVg6ICdkYXRhLW1vZGVsLWluZGV4JyxcbiAgICBEQVk6ICdkYXRhLWRheSdcbn07IiwiZXhwb3J0IGRlZmF1bHQge1xuXHRjYWxsYmFjazogbnVsbCxcblx0c3RhcnRPcGVuOiBmYWxzZSxcblx0c3RhcnREYXRlOiBmYWxzZSxcblx0Ly8gY2xvc2VPblNlbGVjdDogZmFsc2UsXG5cdGRpc3BsYXlGb3JtYXQ6ICdkZGRkIE1NTU0gRCwgWVlZWScsIC8vVGh1cnNkYXkgSmFudWFyeSAxMiwgMjAxN1xuXHR2YWx1ZUZvcm1hdDogJ0REL01NL1lZWVknXG59OyIsImltcG9ydCB7IENMQVNTTkFNRVMgfSBmcm9tICcuL2NvbnN0YW50cyc7XG5pbXBvcnQgeyBkYXlOYW1lcywgbW9udGhOYW1lcyB9IGZyb20gJy4vdXRpbHMnO1xuXG5leHBvcnQgY29uc3QgY2FsZW5kYXIgPSBwcm9wcyA9PiBgPGRpdiBjbGFzcz1cInNkcC1kYXRlXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz1cIiR7Q0xBU1NOQU1FUy5OQVZfQlROfSBzZHAtYmFja1wiIHR5cGU9XCJidXR0b25cIiBkYXRhLWFjdGlvbj1cIi0xXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzdmcgY2xhc3M9XCJzZHAtYnRuX19pY29uXCIgd2lkdGg9XCIxOVwiIGhlaWdodD1cIjE5XCIgdmlld0JveD1cIjAgMCAxMDAwIDEwMDBcIj48cGF0aCBkPVwiTTMzNi4yIDI3NC41bC0yMTAuMSAyMTBoODA1LjRjMTMgMCAyMyAxMCAyMyAyM3MtMTAgMjMtMjMgMjNIMTI2LjFsMjEwLjEgMjEwLjFjMTEgMTEgMTEgMjEgMCAzMi01IDUtMTAgNy0xNiA3cy0xMS0yLTE2LTdsLTI0OS4xLTI0OWMtMTEtMTEtMTEtMjEgMC0zMmwyNDkuMS0yNDkuMWMyMS0yMS4xIDUzIDEwLjkgMzIgMzJ6XCI+PC9wYXRoPjwvc3ZnPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxidXR0b24gY2xhc3M9XCIke0NMQVNTTkFNRVMuTkFWX0JUTn0gc2RwLW5leHRcIiB0eXBlPVwiYnV0dG9uXCIgZGF0YS1hY3Rpb249XCIxXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzdmcgY2xhc3M9XCJzZHAtYnRuX19pY29uXCIgd2lkdGg9XCIxOVwiIGhlaWdodD1cIjE5XCIgdmlld0JveD1cIjAgMCAxMDAwIDEwMDBcIj48cGF0aCBkPVwiTTY5NC40IDI0Mi40bDI0OS4xIDI0OS4xYzExIDExIDExIDIxIDAgMzJMNjk0LjQgNzcyLjdjLTUgNS0xMCA3LTE2IDdzLTExLTItMTYtN2MtMTEtMTEtMTEtMjEgMC0zMmwyMTAuMS0yMTAuMUg2Ny4xYy0xMyAwLTIzLTEwLTIzLTIzczEwLTIzIDIzLTIzaDgwNS40TDY2Mi40IDI3NC41Yy0yMS0yMS4xIDExLTUzLjEgMzItMzIuMXpcIj48L3BhdGg+PC9zdmc+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cIiR7Q0xBU1NOQU1FUy5NT05USF9DT05UQUlORVJ9XCI+PC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5gO1xuXG5leHBvcnQgY29uc3QgbW9udGggPSBwcm9wcyA9PiBgPGRpdiBjbGFzcz1cInNkcC1tb250aC1sYWJlbFwiPiR7cHJvcHMubW9udGhUaXRsZX0gJHtwcm9wcy55ZWFyVGl0bGV9PC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICA8dGFibGUgY2xhc3M9XCJzZHAtZGF5c1wiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0aGVhZCBjbGFzcz1cInNkcC1kYXlzLWhlYWRcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRyIGNsYXNzPVwic2RwLWRheXMtcm93XCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGggY2xhc3M9XCJzZHAtZGF5LWhlYWRcIj5NbzwvdGg+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGggY2xhc3M9XCJzZHAtZGF5LWhlYWRcIj5UdTwvdGg+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGggY2xhc3M9XCJzZHAtZGF5LWhlYWRcIj5XZTwvdGg+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGggY2xhc3M9XCJzZHAtZGF5LWhlYWRcIj5UaDwvdGg+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGggY2xhc3M9XCJzZHAtZGF5LWhlYWRcIj5GcjwvdGg+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGggY2xhc3M9XCJzZHAtZGF5LWhlYWRcIj5TYTwvdGg+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGggY2xhc3M9XCJzZHAtZGF5LWhlYWRcIj5TdTwvdGg+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvdHI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC90aGVhZD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGJvZHkgY2xhc3M9XCJzZHAtZGF5cy1ib2R5XCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICR7cHJvcHMubW9kZWwubWFwKHdlZWtzKHByb3BzLmFjdGl2ZSkpLmpvaW4oJycpfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvdGJvZHk+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L3RhYmxlPmA7XG5cbmNvbnN0IGRheSA9IChhY3RpdmVEYXlzLCBwcm9wcywgaSkgPT4gYDx0ZCBjbGFzcz1cInNkcC1kYXktYm9keSR7cHJvcHMubmV4dE1vbnRoID8gJyBzZHAtZGF5LW5leHQtbW9udGggc2RwLWRheS1kaXNhYmxlZCcgOiAnJ30ke3Byb3BzLnByZXZpb3VzTW9udGggPyAnIHNkcC1kYXktcHJldi1tb250aCBzZHAtZGF5LWRpc2FibGVkJyA6ICcnfSR7cHJvcHMuYWN0aXZlID8gJyBzZHAtZGF5LXNlbGVjdGVkJyA6ICcnfVwiPjxidXR0b24gdGFiaW5kZXg9XCIke3Byb3BzLmlzU3RhcnREYXRlID8gMCA6IHByb3BzLmlzVG9kYXkgPyAwIDogLTF9XCIgY2xhc3M9XCJzZHAtZGF5LWJ0biR7cHJvcHMuaXNUb2RheSA/ICcgc2RwLWRheS1idG4tLWlzLXRvZGF5JyA6ICcnfSR7cHJvcHMuaXNTdGFydERhdGUgPyAnIHNkcC1kYXktYnRuLS1pcy1hY3RpdmUnIDogJyd9XCIgcm9sZT1cImJ1dHRvblwiIGRhdGEtZGF5PVwiJHtwcm9wcy5udW1iZXJ9XCIgZGF0YS1tb2RlbC1pbmRleD1cIiR7aX1cIiBhcmlhLWxhYmVsPVwiJHtwcm9wcy5pc1RvZGF5ID8gJ1RvZGF5LCAnIDogJyd9JHtkYXlOYW1lc1twcm9wcy5kYXRlLmdldERheSgpXX0sICR7bW9udGhOYW1lc1twcm9wcy5kYXRlLmdldE1vbnRoKCldfSAke3Byb3BzLmRhdGUuZ2V0RGF0ZSgpfSwgJHtwcm9wcy5kYXRlLmdldEZ1bGxZZWFyKCl9XCIke3Byb3BzLnByZXZpb3VzTW9udGggfHwgcHJvcHMubmV4dE1vbnRoID8gXCIgZGlzYWJsZWRcIiA6IFwiXCJ9PiR7cHJvcHMubnVtYmVyfTwvYnV0dG9uPjwvdGQ+YDtcblxuY29uc3Qgd2Vla3MgPSBhY3RpdmVEYXlzID0+IChwcm9wcywgaSwgYXJyKSA9PiB7XG4gICAgaWYoaSA9PT0gMCkgcmV0dXJuIGA8dHIgY2xhc3M9XCJzZHAtZGF5cy1yb3dcIj4ke2RheShhY3RpdmVEYXlzLCBwcm9wcywgaSl9YDtcbiAgICBlbHNlIGlmIChpID09PSBhcnIubGVuZ3RoIC0gMSkgcmV0dXJuIGAke2RheShhY3RpdmVEYXlzLCBwcm9wcywgaSl9PC90cj5gO1xuICAgIGVsc2UgaWYoKGkrMSkgJSA3ID09PSAwKSByZXR1cm4gYCR7ZGF5KGFjdGl2ZURheXMsIHByb3BzLCBpKX08L3RyPjx0ciBjbGFzcz1cInNkcC1kYXlzLXJvd1wiPmA7XG4gICAgZWxzZSByZXR1cm4gZGF5KGFjdGl2ZURheXMsIHByb3BzLCBpKTtcbn07IiwiaW1wb3J0IGZlY2hhIGZyb20gJ2ZlY2hhJztcblxuZXhwb3J0IGNvbnN0IHBhcnNlRGF0ZSA9IGZlY2hhLnBhcnNlO1xuXG5leHBvcnQgY29uc3QgZm9ybWF0RGF0ZSA9IGZlY2hhLmZvcm1hdDtcblxuZXhwb3J0IGNvbnN0IG1vbnRoTmFtZXMgPSBbJ0phbnVhcnknLCAnRmVicnVhcnknLCAnTWFyY2gnLCAnQXByaWwnLCAnTWF5JywgJ0p1bmUnLCAnSnVseScsICdBdWd1c3QnLCAnU2VwdGVtYmVyJywgJ09jdG9iZXInLCAnTm92ZW1iZXInLCAnRGVjZW1iZXInXTtcblxuZXhwb3J0IGNvbnN0IGRheU5hbWVzID0gWydTdW5kYXknLCdNb25kYXknLCdUdWVzZGF5JywnV2VkbmVzZGF5JywnVGh1cnNkYXknLCdGcmlkYXknLCdTYXR1cmRheSddO1xuZXhwb3J0IGNvbnN0IGNhdGNoQnViYmxlID0gZSA9PiB7XG4gICAgZS5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24oKTtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG59O1xuXG5leHBvcnQgY29uc3QgZ2V0TW9udGhMZW5ndGggPSAoeSwgbSkgPT4gbmV3IERhdGUoeSwgKG0gKyAxKSwgMCkuZ2V0RGF0ZSgpO1xuXG5jb25zdCBpc1RvZGF5ID0gY2FuZGlkYXRlID0+IHtcbiAgICBsZXQgdG9kYXkgPSBuZXcgRGF0ZSgpO1xuICAgIHRvZGF5LnNldEhvdXJzKDAsMCwwLDApO1xuICAgIHJldHVybiBjYW5kaWRhdGUuZ2V0VGltZSgpID09PSB0b2RheS5nZXRUaW1lKCk7XG59O1xuXG5jb25zdCBpc1N0YXJ0RGF0ZSA9IChzdGFydERhdGUsIGNhbmRpZGF0ZSkgPT4gc3RhcnREYXRlLmdldFRpbWUoKSA9PT0gY2FuZGlkYXRlLmdldFRpbWUoKTtcblxuY29uc3QgbW9udGhNb2RlbCA9ICh5ZWFyLCBtb250aCwgc3RhcnREYXRlKSA9PiB7XG4gICAgbGV0IHRoZU1vbnRoID0gbmV3IERhdGUoeWVhciwgbW9udGggKyAxLCAwKSxcbiAgICAgICAgdG90YWxEYXlzID0gdGhlTW9udGguZ2V0RGF0ZSgpLFxuICAgICAgICBlbmREYXkgPSB0aGVNb250aC5nZXREYXkoKSxcbiAgICAgICAgc3RhcnREYXksXG4gICAgICAgIHByZXZNb250aFN0YXJ0RGF5ID0gZmFsc2UsXG4gICAgICAgIHByZXZNb250aCA9IG5ldyBEYXRlKHllYXIsIG1vbnRoLCAwKSxcbiAgICAgICAgcHJldk1vbnRoRW5kRGF5ID0gcHJldk1vbnRoLmdldERhdGUoKSxcbiAgICAgICAgb3V0cHV0ID0gW107XG5cbiAgICB0aGVNb250aC5zZXREYXRlKDEpO1xuICAgIHN0YXJ0RGF5ID0gdGhlTW9udGguZ2V0RGF5KCk7XG4gICAgXG4gICAgaWYoc3RhcnREYXkgIT09IDEpIHtcbiAgICAgICAgaWYoc3RhcnREYXkgPT09IDApIHByZXZNb250aFN0YXJ0RGF5ID0gcHJldk1vbnRoLmdldERhdGUoKSAtIDU7XG4gICAgICAgIGVsc2UgcHJldk1vbnRoU3RhcnREYXkgPSBwcmV2TW9udGguZ2V0RGF0ZSgpIC0gKHN0YXJ0RGF5IC0gMik7XG4gICAgfVxuXG4gICAgaWYocHJldk1vbnRoU3RhcnREYXkpe1xuICAgICAgICB3aGlsZShwcmV2TW9udGhTdGFydERheSA8PSBwcmV2TW9udGhFbmREYXkpe1xuICAgICAgICAgICAgbGV0IHRtcERhdGUgPSBuZXcgRGF0ZShwcmV2TW9udGguZ2V0RnVsbFllYXIoKSwgcHJldk1vbnRoLmdldE1vbnRoKCksIHByZXZNb250aFN0YXJ0RGF5KTtcbiAgICAgICAgICAgIG91dHB1dC5wdXNoKHtcbiAgICAgICAgICAgICAgICBudW1iZXI6IHByZXZNb250aFN0YXJ0RGF5LFxuICAgICAgICAgICAgICAgIHByZXZpb3VzTW9udGg6IHRydWUsXG4gICAgICAgICAgICAgICAgaXNUb2RheTogaXNUb2RheSh0bXBEYXRlKSxcbiAgICAgICAgICAgICAgICBpc1N0YXJ0RGF0ZTogc3RhcnREYXRlICYmIGlzU3RhcnREYXRlKHN0YXJ0RGF0ZSwgdG1wRGF0ZSkgfHwgZmFsc2UsXG5cdFx0XHRcdGRhdGU6IHRtcERhdGVcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcHJldk1vbnRoU3RhcnREYXkrKztcbiAgICAgICAgfVxuICAgIH1cbiAgICBmb3IobGV0IGkgPSAxOyBpIDw9IHRvdGFsRGF5czsgaSsrKSB7XG4gICAgICAgIGxldCB0bXBEYXRlID0gbmV3IERhdGUoeWVhciwgbW9udGgsIGkpO1xuICAgICAgICBvdXRwdXQucHVzaCh7IFxuICAgICAgICAgICAgbnVtYmVyOiBpLFxuICAgICAgICAgICAgZGF0ZTogdG1wRGF0ZSxcbiAgICAgICAgICAgIGlzU3RhcnREYXRlOiBzdGFydERhdGUgJiYgaXNTdGFydERhdGUoc3RhcnREYXRlLCB0bXBEYXRlKSB8fCBmYWxzZSxcbiAgICAgICAgICAgIGlzVG9kYXk6IGlzVG9kYXkodG1wRGF0ZSlcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGlmKGVuZERheSAhPT0gMCkgZm9yKGxldCBpID0gMTsgaSA8PSAoNyAtIGVuZERheSk7IGkrKykge1xuICAgICAgICBsZXQgdG1wRGF0ZSA9IG5ldyBEYXRlKHllYXIsIG1vbnRoICsgMSwgaSk7XG4gICAgICAgIG91dHB1dC5wdXNoKHsgXG4gICAgICAgICAgICBudW1iZXI6IGksXG4gICAgICAgICAgICBuZXh0TW9udGg6IHRydWUsXG4gICAgICAgICAgICBkYXRlOiB0bXBEYXRlLFxuICAgICAgICAgICAgaXNTdGFydERhdGU6IHN0YXJ0RGF0ZSAmJiBpc1N0YXJ0RGF0ZShzdGFydERhdGUsIHRtcERhdGUpIHx8IGZhbHNlLFxuICAgICAgICAgICAgaXNUb2RheTogaXNUb2RheSh0bXBEYXRlKVxuICAgICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIG91dHB1dDtcbn07XG5cbmV4cG9ydCBjb25zdCBtb250aFZpZXdGYWN0b3J5ID0gKHJvb3REYXRlLCBzdGFydERhdGUpID0+ICh7XG5cdG1vZGVsOiBtb250aE1vZGVsKHJvb3REYXRlLmdldEZ1bGxZZWFyKCksIHJvb3REYXRlLmdldE1vbnRoKCksIHN0YXJ0RGF0ZSksXG5cdG1vbnRoVGl0bGU6IG1vbnRoTmFtZXNbcm9vdERhdGUuZ2V0TW9udGgoKV0sXG5cdHllYXJUaXRsZTogcm9vdERhdGUuZ2V0RnVsbFllYXIoKVxufSk7XG5cbmV4cG9ydCBjb25zdCBlbGVtZW50RmFjdG9yeSA9ICh0eXBlLCBhdHRyaWJ1dGVzID0ge30sIGNsYXNzTmFtZSkgPT4ge1xuICAgIGxldCBlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQodHlwZSk7XG5cbiAgICBmb3IobGV0IHByb3AgaW4gYXR0cmlidXRlcykgZWwuc2V0QXR0cmlidXRlKHByb3AsIGF0dHJpYnV0ZXNbcHJvcF0pO1xuICAgIGlmKGNsYXNzTmFtZSkgZWwuY2xhc3NOYW1lID0gY2xhc3NOYW1lO1xuXG4gICAgcmV0dXJuIGVsO1xufTtcblxuY29uc3QgZm9jdXNhYmxlRWxlbWVudHMgPSBbJ2FbaHJlZl0nLCAnYXJlYVtocmVmXScsICdpbnB1dDpub3QoW2Rpc2FibGVkXSknLCAnc2VsZWN0Om5vdChbZGlzYWJsZWRdKScsICd0ZXh0YXJlYTpub3QoW2Rpc2FibGVkXSknLCAnYnV0dG9uOm5vdChbZGlzYWJsZWRdKScsICdpZnJhbWUnLCAnb2JqZWN0JywgJ2VtYmVkJywgJ1tjb250ZW50ZWRpdGFibGVdJywgJ1t0YWJpbmRleF06bm90KFt0YWJpbmRleD1cIi0xXCJdKSddO1xuXG5leHBvcnQgY29uc3QgZ2V0Rm9jdXNhYmxlQ2hpbGRyZW4gPSBub2RlID0+IFtdLnNsaWNlLmNhbGwobm9kZS5xdWVyeVNlbGVjdG9yQWxsKGZvY3VzYWJsZUVsZW1lbnRzLmpvaW4oJywnKSkpLmZpbHRlcihjaGlsZCA9PiAhIShjaGlsZC5vZmZzZXRXaWR0aCB8fCBjaGlsZC5vZmZzZXRIZWlnaHQgfHwgY2hpbGQuZ2V0Q2xpZW50UmVjdHMoKS5sZW5ndGgpKTsiLCIoZnVuY3Rpb24gKG1haW4pIHtcbiAgJ3VzZSBzdHJpY3QnO1xuXG4gIC8qKlxuICAgKiBQYXJzZSBvciBmb3JtYXQgZGF0ZXNcbiAgICogQGNsYXNzIGZlY2hhXG4gICAqL1xuICB2YXIgZmVjaGEgPSB7fTtcbiAgdmFyIHRva2VuID0gL2R7MSw0fXxNezEsNH18WVkoPzpZWSk/fFN7MSwzfXxEb3xaWnwoW0hoTXNEbV0pXFwxP3xbYUFdfFwiW15cIl0qXCJ8J1teJ10qJy9nO1xuICB2YXIgdHdvRGlnaXRzID0gL1xcZFxcZD8vO1xuICB2YXIgdGhyZWVEaWdpdHMgPSAvXFxkezN9LztcbiAgdmFyIGZvdXJEaWdpdHMgPSAvXFxkezR9LztcbiAgdmFyIHdvcmQgPSAvWzAtOV0qWydhLXpcXHUwMEEwLVxcdTA1RkZcXHUwNzAwLVxcdUQ3RkZcXHVGOTAwLVxcdUZEQ0ZcXHVGREYwLVxcdUZGRUZdK3xbXFx1MDYwMC1cXHUwNkZGXFwvXSsoXFxzKj9bXFx1MDYwMC1cXHUwNkZGXSspezEsMn0vaTtcbiAgdmFyIGxpdGVyYWwgPSAvXFxbKFteXSo/KVxcXS9nbTtcbiAgdmFyIG5vb3AgPSBmdW5jdGlvbiAoKSB7XG4gIH07XG5cbiAgZnVuY3Rpb24gc2hvcnRlbihhcnIsIHNMZW4pIHtcbiAgICB2YXIgbmV3QXJyID0gW107XG4gICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IGFyci5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgbmV3QXJyLnB1c2goYXJyW2ldLnN1YnN0cigwLCBzTGVuKSk7XG4gICAgfVxuICAgIHJldHVybiBuZXdBcnI7XG4gIH1cblxuICBmdW5jdGlvbiBtb250aFVwZGF0ZShhcnJOYW1lKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChkLCB2LCBpMThuKSB7XG4gICAgICB2YXIgaW5kZXggPSBpMThuW2Fyck5hbWVdLmluZGV4T2Yodi5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIHYuc3Vic3RyKDEpLnRvTG93ZXJDYXNlKCkpO1xuICAgICAgaWYgKH5pbmRleCkge1xuICAgICAgICBkLm1vbnRoID0gaW5kZXg7XG4gICAgICB9XG4gICAgfTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHBhZCh2YWwsIGxlbikge1xuICAgIHZhbCA9IFN0cmluZyh2YWwpO1xuICAgIGxlbiA9IGxlbiB8fCAyO1xuICAgIHdoaWxlICh2YWwubGVuZ3RoIDwgbGVuKSB7XG4gICAgICB2YWwgPSAnMCcgKyB2YWw7XG4gICAgfVxuICAgIHJldHVybiB2YWw7XG4gIH1cblxuICB2YXIgZGF5TmFtZXMgPSBbJ1N1bmRheScsICdNb25kYXknLCAnVHVlc2RheScsICdXZWRuZXNkYXknLCAnVGh1cnNkYXknLCAnRnJpZGF5JywgJ1NhdHVyZGF5J107XG4gIHZhciBtb250aE5hbWVzID0gWydKYW51YXJ5JywgJ0ZlYnJ1YXJ5JywgJ01hcmNoJywgJ0FwcmlsJywgJ01heScsICdKdW5lJywgJ0p1bHknLCAnQXVndXN0JywgJ1NlcHRlbWJlcicsICdPY3RvYmVyJywgJ05vdmVtYmVyJywgJ0RlY2VtYmVyJ107XG4gIHZhciBtb250aE5hbWVzU2hvcnQgPSBzaG9ydGVuKG1vbnRoTmFtZXMsIDMpO1xuICB2YXIgZGF5TmFtZXNTaG9ydCA9IHNob3J0ZW4oZGF5TmFtZXMsIDMpO1xuICBmZWNoYS5pMThuID0ge1xuICAgIGRheU5hbWVzU2hvcnQ6IGRheU5hbWVzU2hvcnQsXG4gICAgZGF5TmFtZXM6IGRheU5hbWVzLFxuICAgIG1vbnRoTmFtZXNTaG9ydDogbW9udGhOYW1lc1Nob3J0LFxuICAgIG1vbnRoTmFtZXM6IG1vbnRoTmFtZXMsXG4gICAgYW1QbTogWydhbScsICdwbSddLFxuICAgIERvRm46IGZ1bmN0aW9uIERvRm4oRCkge1xuICAgICAgcmV0dXJuIEQgKyBbJ3RoJywgJ3N0JywgJ25kJywgJ3JkJ11bRCAlIDEwID4gMyA/IDAgOiAoRCAtIEQgJSAxMCAhPT0gMTApICogRCAlIDEwXTtcbiAgICB9XG4gIH07XG5cbiAgdmFyIGZvcm1hdEZsYWdzID0ge1xuICAgIEQ6IGZ1bmN0aW9uKGRhdGVPYmopIHtcbiAgICAgIHJldHVybiBkYXRlT2JqLmdldERhdGUoKTtcbiAgICB9LFxuICAgIEREOiBmdW5jdGlvbihkYXRlT2JqKSB7XG4gICAgICByZXR1cm4gcGFkKGRhdGVPYmouZ2V0RGF0ZSgpKTtcbiAgICB9LFxuICAgIERvOiBmdW5jdGlvbihkYXRlT2JqLCBpMThuKSB7XG4gICAgICByZXR1cm4gaTE4bi5Eb0ZuKGRhdGVPYmouZ2V0RGF0ZSgpKTtcbiAgICB9LFxuICAgIGQ6IGZ1bmN0aW9uKGRhdGVPYmopIHtcbiAgICAgIHJldHVybiBkYXRlT2JqLmdldERheSgpO1xuICAgIH0sXG4gICAgZGQ6IGZ1bmN0aW9uKGRhdGVPYmopIHtcbiAgICAgIHJldHVybiBwYWQoZGF0ZU9iai5nZXREYXkoKSk7XG4gICAgfSxcbiAgICBkZGQ6IGZ1bmN0aW9uKGRhdGVPYmosIGkxOG4pIHtcbiAgICAgIHJldHVybiBpMThuLmRheU5hbWVzU2hvcnRbZGF0ZU9iai5nZXREYXkoKV07XG4gICAgfSxcbiAgICBkZGRkOiBmdW5jdGlvbihkYXRlT2JqLCBpMThuKSB7XG4gICAgICByZXR1cm4gaTE4bi5kYXlOYW1lc1tkYXRlT2JqLmdldERheSgpXTtcbiAgICB9LFxuICAgIE06IGZ1bmN0aW9uKGRhdGVPYmopIHtcbiAgICAgIHJldHVybiBkYXRlT2JqLmdldE1vbnRoKCkgKyAxO1xuICAgIH0sXG4gICAgTU06IGZ1bmN0aW9uKGRhdGVPYmopIHtcbiAgICAgIHJldHVybiBwYWQoZGF0ZU9iai5nZXRNb250aCgpICsgMSk7XG4gICAgfSxcbiAgICBNTU06IGZ1bmN0aW9uKGRhdGVPYmosIGkxOG4pIHtcbiAgICAgIHJldHVybiBpMThuLm1vbnRoTmFtZXNTaG9ydFtkYXRlT2JqLmdldE1vbnRoKCldO1xuICAgIH0sXG4gICAgTU1NTTogZnVuY3Rpb24oZGF0ZU9iaiwgaTE4bikge1xuICAgICAgcmV0dXJuIGkxOG4ubW9udGhOYW1lc1tkYXRlT2JqLmdldE1vbnRoKCldO1xuICAgIH0sXG4gICAgWVk6IGZ1bmN0aW9uKGRhdGVPYmopIHtcbiAgICAgIHJldHVybiBTdHJpbmcoZGF0ZU9iai5nZXRGdWxsWWVhcigpKS5zdWJzdHIoMik7XG4gICAgfSxcbiAgICBZWVlZOiBmdW5jdGlvbihkYXRlT2JqKSB7XG4gICAgICByZXR1cm4gZGF0ZU9iai5nZXRGdWxsWWVhcigpO1xuICAgIH0sXG4gICAgaDogZnVuY3Rpb24oZGF0ZU9iaikge1xuICAgICAgcmV0dXJuIGRhdGVPYmouZ2V0SG91cnMoKSAlIDEyIHx8IDEyO1xuICAgIH0sXG4gICAgaGg6IGZ1bmN0aW9uKGRhdGVPYmopIHtcbiAgICAgIHJldHVybiBwYWQoZGF0ZU9iai5nZXRIb3VycygpICUgMTIgfHwgMTIpO1xuICAgIH0sXG4gICAgSDogZnVuY3Rpb24oZGF0ZU9iaikge1xuICAgICAgcmV0dXJuIGRhdGVPYmouZ2V0SG91cnMoKTtcbiAgICB9LFxuICAgIEhIOiBmdW5jdGlvbihkYXRlT2JqKSB7XG4gICAgICByZXR1cm4gcGFkKGRhdGVPYmouZ2V0SG91cnMoKSk7XG4gICAgfSxcbiAgICBtOiBmdW5jdGlvbihkYXRlT2JqKSB7XG4gICAgICByZXR1cm4gZGF0ZU9iai5nZXRNaW51dGVzKCk7XG4gICAgfSxcbiAgICBtbTogZnVuY3Rpb24oZGF0ZU9iaikge1xuICAgICAgcmV0dXJuIHBhZChkYXRlT2JqLmdldE1pbnV0ZXMoKSk7XG4gICAgfSxcbiAgICBzOiBmdW5jdGlvbihkYXRlT2JqKSB7XG4gICAgICByZXR1cm4gZGF0ZU9iai5nZXRTZWNvbmRzKCk7XG4gICAgfSxcbiAgICBzczogZnVuY3Rpb24oZGF0ZU9iaikge1xuICAgICAgcmV0dXJuIHBhZChkYXRlT2JqLmdldFNlY29uZHMoKSk7XG4gICAgfSxcbiAgICBTOiBmdW5jdGlvbihkYXRlT2JqKSB7XG4gICAgICByZXR1cm4gTWF0aC5yb3VuZChkYXRlT2JqLmdldE1pbGxpc2Vjb25kcygpIC8gMTAwKTtcbiAgICB9LFxuICAgIFNTOiBmdW5jdGlvbihkYXRlT2JqKSB7XG4gICAgICByZXR1cm4gcGFkKE1hdGgucm91bmQoZGF0ZU9iai5nZXRNaWxsaXNlY29uZHMoKSAvIDEwKSwgMik7XG4gICAgfSxcbiAgICBTU1M6IGZ1bmN0aW9uKGRhdGVPYmopIHtcbiAgICAgIHJldHVybiBwYWQoZGF0ZU9iai5nZXRNaWxsaXNlY29uZHMoKSwgMyk7XG4gICAgfSxcbiAgICBhOiBmdW5jdGlvbihkYXRlT2JqLCBpMThuKSB7XG4gICAgICByZXR1cm4gZGF0ZU9iai5nZXRIb3VycygpIDwgMTIgPyBpMThuLmFtUG1bMF0gOiBpMThuLmFtUG1bMV07XG4gICAgfSxcbiAgICBBOiBmdW5jdGlvbihkYXRlT2JqLCBpMThuKSB7XG4gICAgICByZXR1cm4gZGF0ZU9iai5nZXRIb3VycygpIDwgMTIgPyBpMThuLmFtUG1bMF0udG9VcHBlckNhc2UoKSA6IGkxOG4uYW1QbVsxXS50b1VwcGVyQ2FzZSgpO1xuICAgIH0sXG4gICAgWlo6IGZ1bmN0aW9uKGRhdGVPYmopIHtcbiAgICAgIHZhciBvID0gZGF0ZU9iai5nZXRUaW1lem9uZU9mZnNldCgpO1xuICAgICAgcmV0dXJuIChvID4gMCA/ICctJyA6ICcrJykgKyBwYWQoTWF0aC5mbG9vcihNYXRoLmFicyhvKSAvIDYwKSAqIDEwMCArIE1hdGguYWJzKG8pICUgNjAsIDQpO1xuICAgIH1cbiAgfTtcblxuICB2YXIgcGFyc2VGbGFncyA9IHtcbiAgICBEOiBbdHdvRGlnaXRzLCBmdW5jdGlvbiAoZCwgdikge1xuICAgICAgZC5kYXkgPSB2O1xuICAgIH1dLFxuICAgIERvOiBbbmV3IFJlZ0V4cCh0d29EaWdpdHMuc291cmNlICsgd29yZC5zb3VyY2UpLCBmdW5jdGlvbiAoZCwgdikge1xuICAgICAgZC5kYXkgPSBwYXJzZUludCh2LCAxMCk7XG4gICAgfV0sXG4gICAgTTogW3R3b0RpZ2l0cywgZnVuY3Rpb24gKGQsIHYpIHtcbiAgICAgIGQubW9udGggPSB2IC0gMTtcbiAgICB9XSxcbiAgICBZWTogW3R3b0RpZ2l0cywgZnVuY3Rpb24gKGQsIHYpIHtcbiAgICAgIHZhciBkYSA9IG5ldyBEYXRlKCksIGNlbnQgPSArKCcnICsgZGEuZ2V0RnVsbFllYXIoKSkuc3Vic3RyKDAsIDIpO1xuICAgICAgZC55ZWFyID0gJycgKyAodiA+IDY4ID8gY2VudCAtIDEgOiBjZW50KSArIHY7XG4gICAgfV0sXG4gICAgaDogW3R3b0RpZ2l0cywgZnVuY3Rpb24gKGQsIHYpIHtcbiAgICAgIGQuaG91ciA9IHY7XG4gICAgfV0sXG4gICAgbTogW3R3b0RpZ2l0cywgZnVuY3Rpb24gKGQsIHYpIHtcbiAgICAgIGQubWludXRlID0gdjtcbiAgICB9XSxcbiAgICBzOiBbdHdvRGlnaXRzLCBmdW5jdGlvbiAoZCwgdikge1xuICAgICAgZC5zZWNvbmQgPSB2O1xuICAgIH1dLFxuICAgIFlZWVk6IFtmb3VyRGlnaXRzLCBmdW5jdGlvbiAoZCwgdikge1xuICAgICAgZC55ZWFyID0gdjtcbiAgICB9XSxcbiAgICBTOiBbL1xcZC8sIGZ1bmN0aW9uIChkLCB2KSB7XG4gICAgICBkLm1pbGxpc2Vjb25kID0gdiAqIDEwMDtcbiAgICB9XSxcbiAgICBTUzogWy9cXGR7Mn0vLCBmdW5jdGlvbiAoZCwgdikge1xuICAgICAgZC5taWxsaXNlY29uZCA9IHYgKiAxMDtcbiAgICB9XSxcbiAgICBTU1M6IFt0aHJlZURpZ2l0cywgZnVuY3Rpb24gKGQsIHYpIHtcbiAgICAgIGQubWlsbGlzZWNvbmQgPSB2O1xuICAgIH1dLFxuICAgIGQ6IFt0d29EaWdpdHMsIG5vb3BdLFxuICAgIGRkZDogW3dvcmQsIG5vb3BdLFxuICAgIE1NTTogW3dvcmQsIG1vbnRoVXBkYXRlKCdtb250aE5hbWVzU2hvcnQnKV0sXG4gICAgTU1NTTogW3dvcmQsIG1vbnRoVXBkYXRlKCdtb250aE5hbWVzJyldLFxuICAgIGE6IFt3b3JkLCBmdW5jdGlvbiAoZCwgdiwgaTE4bikge1xuICAgICAgdmFyIHZhbCA9IHYudG9Mb3dlckNhc2UoKTtcbiAgICAgIGlmICh2YWwgPT09IGkxOG4uYW1QbVswXSkge1xuICAgICAgICBkLmlzUG0gPSBmYWxzZTtcbiAgICAgIH0gZWxzZSBpZiAodmFsID09PSBpMThuLmFtUG1bMV0pIHtcbiAgICAgICAgZC5pc1BtID0gdHJ1ZTtcbiAgICAgIH1cbiAgICB9XSxcbiAgICBaWjogWy8oW1xcK1xcLV1cXGRcXGQ6P1xcZFxcZHxaKS8sIGZ1bmN0aW9uIChkLCB2KSB7XG4gICAgICBpZiAodiA9PT0gJ1onKSB2ID0gJyswMDowMCc7XG4gICAgICB2YXIgcGFydHMgPSAodiArICcnKS5tYXRjaCgvKFtcXCtcXC1dfFxcZFxcZCkvZ2kpLCBtaW51dGVzO1xuXG4gICAgICBpZiAocGFydHMpIHtcbiAgICAgICAgbWludXRlcyA9ICsocGFydHNbMV0gKiA2MCkgKyBwYXJzZUludChwYXJ0c1syXSwgMTApO1xuICAgICAgICBkLnRpbWV6b25lT2Zmc2V0ID0gcGFydHNbMF0gPT09ICcrJyA/IG1pbnV0ZXMgOiAtbWludXRlcztcbiAgICAgIH1cbiAgICB9XVxuICB9O1xuICBwYXJzZUZsYWdzLmRkID0gcGFyc2VGbGFncy5kO1xuICBwYXJzZUZsYWdzLmRkZGQgPSBwYXJzZUZsYWdzLmRkZDtcbiAgcGFyc2VGbGFncy5ERCA9IHBhcnNlRmxhZ3MuRDtcbiAgcGFyc2VGbGFncy5tbSA9IHBhcnNlRmxhZ3MubTtcbiAgcGFyc2VGbGFncy5oaCA9IHBhcnNlRmxhZ3MuSCA9IHBhcnNlRmxhZ3MuSEggPSBwYXJzZUZsYWdzLmg7XG4gIHBhcnNlRmxhZ3MuTU0gPSBwYXJzZUZsYWdzLk07XG4gIHBhcnNlRmxhZ3Muc3MgPSBwYXJzZUZsYWdzLnM7XG4gIHBhcnNlRmxhZ3MuQSA9IHBhcnNlRmxhZ3MuYTtcblxuXG4gIC8vIFNvbWUgY29tbW9uIGZvcm1hdCBzdHJpbmdzXG4gIGZlY2hhLm1hc2tzID0ge1xuICAgIGRlZmF1bHQ6ICdkZGQgTU1NIEREIFlZWVkgSEg6bW06c3MnLFxuICAgIHNob3J0RGF0ZTogJ00vRC9ZWScsXG4gICAgbWVkaXVtRGF0ZTogJ01NTSBELCBZWVlZJyxcbiAgICBsb25nRGF0ZTogJ01NTU0gRCwgWVlZWScsXG4gICAgZnVsbERhdGU6ICdkZGRkLCBNTU1NIEQsIFlZWVknLFxuICAgIHNob3J0VGltZTogJ0hIOm1tJyxcbiAgICBtZWRpdW1UaW1lOiAnSEg6bW06c3MnLFxuICAgIGxvbmdUaW1lOiAnSEg6bW06c3MuU1NTJ1xuICB9O1xuXG4gIC8qKipcbiAgICogRm9ybWF0IGEgZGF0ZVxuICAgKiBAbWV0aG9kIGZvcm1hdFxuICAgKiBAcGFyYW0ge0RhdGV8bnVtYmVyfSBkYXRlT2JqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBtYXNrIEZvcm1hdCBvZiB0aGUgZGF0ZSwgaS5lLiAnbW0tZGQteXknIG9yICdzaG9ydERhdGUnXG4gICAqL1xuICBmZWNoYS5mb3JtYXQgPSBmdW5jdGlvbiAoZGF0ZU9iaiwgbWFzaywgaTE4blNldHRpbmdzKSB7XG4gICAgdmFyIGkxOG4gPSBpMThuU2V0dGluZ3MgfHwgZmVjaGEuaTE4bjtcblxuICAgIGlmICh0eXBlb2YgZGF0ZU9iaiA9PT0gJ251bWJlcicpIHtcbiAgICAgIGRhdGVPYmogPSBuZXcgRGF0ZShkYXRlT2JqKTtcbiAgICB9XG5cbiAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKGRhdGVPYmopICE9PSAnW29iamVjdCBEYXRlXScgfHwgaXNOYU4oZGF0ZU9iai5nZXRUaW1lKCkpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgRGF0ZSBpbiBmZWNoYS5mb3JtYXQnKTtcbiAgICB9XG5cbiAgICBtYXNrID0gZmVjaGEubWFza3NbbWFza10gfHwgbWFzayB8fCBmZWNoYS5tYXNrc1snZGVmYXVsdCddO1xuXG4gICAgdmFyIGxpdGVyYWxzID0gW107XG5cbiAgICAvLyBNYWtlIGxpdGVyYWxzIGluYWN0aXZlIGJ5IHJlcGxhY2luZyB0aGVtIHdpdGggPz9cbiAgICBtYXNrID0gbWFzay5yZXBsYWNlKGxpdGVyYWwsIGZ1bmN0aW9uKCQwLCAkMSkge1xuICAgICAgbGl0ZXJhbHMucHVzaCgkMSk7XG4gICAgICByZXR1cm4gJz8/JztcbiAgICB9KTtcbiAgICAvLyBBcHBseSBmb3JtYXR0aW5nIHJ1bGVzXG4gICAgbWFzayA9IG1hc2sucmVwbGFjZSh0b2tlbiwgZnVuY3Rpb24gKCQwKSB7XG4gICAgICByZXR1cm4gJDAgaW4gZm9ybWF0RmxhZ3MgPyBmb3JtYXRGbGFnc1skMF0oZGF0ZU9iaiwgaTE4bikgOiAkMC5zbGljZSgxLCAkMC5sZW5ndGggLSAxKTtcbiAgICB9KTtcbiAgICAvLyBJbmxpbmUgbGl0ZXJhbCB2YWx1ZXMgYmFjayBpbnRvIHRoZSBmb3JtYXR0ZWQgdmFsdWVcbiAgICByZXR1cm4gbWFzay5yZXBsYWNlKC9cXD9cXD8vZywgZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gbGl0ZXJhbHMuc2hpZnQoKTtcbiAgICB9KTtcbiAgfTtcblxuICAvKipcbiAgICogUGFyc2UgYSBkYXRlIHN0cmluZyBpbnRvIGFuIG9iamVjdCwgY2hhbmdlcyAtIGludG8gL1xuICAgKiBAbWV0aG9kIHBhcnNlXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBkYXRlU3RyIERhdGUgc3RyaW5nXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBmb3JtYXQgRGF0ZSBwYXJzZSBmb3JtYXRcbiAgICogQHJldHVybnMge0RhdGV8Ym9vbGVhbn1cbiAgICovXG4gIGZlY2hhLnBhcnNlID0gZnVuY3Rpb24gKGRhdGVTdHIsIGZvcm1hdCwgaTE4blNldHRpbmdzKSB7XG4gICAgdmFyIGkxOG4gPSBpMThuU2V0dGluZ3MgfHwgZmVjaGEuaTE4bjtcblxuICAgIGlmICh0eXBlb2YgZm9ybWF0ICE9PSAnc3RyaW5nJykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIGZvcm1hdCBpbiBmZWNoYS5wYXJzZScpO1xuICAgIH1cblxuICAgIGZvcm1hdCA9IGZlY2hhLm1hc2tzW2Zvcm1hdF0gfHwgZm9ybWF0O1xuXG4gICAgLy8gQXZvaWQgcmVndWxhciBleHByZXNzaW9uIGRlbmlhbCBvZiBzZXJ2aWNlLCBmYWlsIGVhcmx5IGZvciByZWFsbHkgbG9uZyBzdHJpbmdzXG4gICAgLy8gaHR0cHM6Ly93d3cub3dhc3Aub3JnL2luZGV4LnBocC9SZWd1bGFyX2V4cHJlc3Npb25fRGVuaWFsX29mX1NlcnZpY2VfLV9SZURvU1xuICAgIGlmIChkYXRlU3RyLmxlbmd0aCA+IDEwMDApIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICB2YXIgaXNWYWxpZCA9IHRydWU7XG4gICAgdmFyIGRhdGVJbmZvID0ge307XG4gICAgZm9ybWF0LnJlcGxhY2UodG9rZW4sIGZ1bmN0aW9uICgkMCkge1xuICAgICAgaWYgKHBhcnNlRmxhZ3NbJDBdKSB7XG4gICAgICAgIHZhciBpbmZvID0gcGFyc2VGbGFnc1skMF07XG4gICAgICAgIHZhciBpbmRleCA9IGRhdGVTdHIuc2VhcmNoKGluZm9bMF0pO1xuICAgICAgICBpZiAoIX5pbmRleCkge1xuICAgICAgICAgIGlzVmFsaWQgPSBmYWxzZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBkYXRlU3RyLnJlcGxhY2UoaW5mb1swXSwgZnVuY3Rpb24gKHJlc3VsdCkge1xuICAgICAgICAgICAgaW5mb1sxXShkYXRlSW5mbywgcmVzdWx0LCBpMThuKTtcbiAgICAgICAgICAgIGRhdGVTdHIgPSBkYXRlU3RyLnN1YnN0cihpbmRleCArIHJlc3VsdC5sZW5ndGgpO1xuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gcGFyc2VGbGFnc1skMF0gPyAnJyA6ICQwLnNsaWNlKDEsICQwLmxlbmd0aCAtIDEpO1xuICAgIH0pO1xuXG4gICAgaWYgKCFpc1ZhbGlkKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgdmFyIHRvZGF5ID0gbmV3IERhdGUoKTtcbiAgICBpZiAoZGF0ZUluZm8uaXNQbSA9PT0gdHJ1ZSAmJiBkYXRlSW5mby5ob3VyICE9IG51bGwgJiYgK2RhdGVJbmZvLmhvdXIgIT09IDEyKSB7XG4gICAgICBkYXRlSW5mby5ob3VyID0gK2RhdGVJbmZvLmhvdXIgKyAxMjtcbiAgICB9IGVsc2UgaWYgKGRhdGVJbmZvLmlzUG0gPT09IGZhbHNlICYmICtkYXRlSW5mby5ob3VyID09PSAxMikge1xuICAgICAgZGF0ZUluZm8uaG91ciA9IDA7XG4gICAgfVxuXG4gICAgdmFyIGRhdGU7XG4gICAgaWYgKGRhdGVJbmZvLnRpbWV6b25lT2Zmc2V0ICE9IG51bGwpIHtcbiAgICAgIGRhdGVJbmZvLm1pbnV0ZSA9ICsoZGF0ZUluZm8ubWludXRlIHx8IDApIC0gK2RhdGVJbmZvLnRpbWV6b25lT2Zmc2V0O1xuICAgICAgZGF0ZSA9IG5ldyBEYXRlKERhdGUuVVRDKGRhdGVJbmZvLnllYXIgfHwgdG9kYXkuZ2V0RnVsbFllYXIoKSwgZGF0ZUluZm8ubW9udGggfHwgMCwgZGF0ZUluZm8uZGF5IHx8IDEsXG4gICAgICAgIGRhdGVJbmZvLmhvdXIgfHwgMCwgZGF0ZUluZm8ubWludXRlIHx8IDAsIGRhdGVJbmZvLnNlY29uZCB8fCAwLCBkYXRlSW5mby5taWxsaXNlY29uZCB8fCAwKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGRhdGUgPSBuZXcgRGF0ZShkYXRlSW5mby55ZWFyIHx8IHRvZGF5LmdldEZ1bGxZZWFyKCksIGRhdGVJbmZvLm1vbnRoIHx8IDAsIGRhdGVJbmZvLmRheSB8fCAxLFxuICAgICAgICBkYXRlSW5mby5ob3VyIHx8IDAsIGRhdGVJbmZvLm1pbnV0ZSB8fCAwLCBkYXRlSW5mby5zZWNvbmQgfHwgMCwgZGF0ZUluZm8ubWlsbGlzZWNvbmQgfHwgMCk7XG4gICAgfVxuICAgIHJldHVybiBkYXRlO1xuICB9O1xuXG4gIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gIGlmICh0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJyAmJiBtb2R1bGUuZXhwb3J0cykge1xuICAgIG1vZHVsZS5leHBvcnRzID0gZmVjaGE7XG4gIH0gZWxzZSBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgZGVmaW5lKGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiBmZWNoYTtcbiAgICB9KTtcbiAgfSBlbHNlIHtcbiAgICBtYWluLmZlY2hhID0gZmVjaGE7XG4gIH1cbn0pKHRoaXMpO1xuIl19
