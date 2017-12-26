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
			_this2.startDate = (0, _utils.parseDate)(_this2.inputClone.value, _this2.settings.displayFormat); //throws if parse error
			_this2.input.value = _this2.startDate || '';
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
				this.workingDate = new Date(this.workingDate.getFullYear(), this.workingDate.getMonth() - 1, this.workingDate.getDate());
				this.renderMonth();
				//focus on last DoM if greater than length of month
				this.container.querySelector('[' + _constants.DATA_ATTRIBUTES.DAY + '="' + e.target.getAttribute(_constants.DATA_ATTRIBUTES.DAY) + '"]:not(:disabled)').focus();
			},
			//?
			PAGE_DOWN: function PAGE_DOWN() {
				(0, _utils.catchBubble)(e);
				this.workingDate = new Date(this.workingDate.getFullYear(), this.workingDate.getMonth() + 1, this.workingDate.getDate());
				this.renderMonth();
				//focus on last DoM if greater than length of month
				this.container.querySelector('[' + _constants.DATA_ATTRIBUTES.DAY + '="' + e.target.getAttribute(_constants.DATA_ATTRIBUTES.DAY) + '"]:not(:disabled)').focus();
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

var getMonthLength = exports.getMonthLength = function getMonthLength(year, month) {
    return new Date(year, month + 1, 0).getDate();
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJleGFtcGxlL3NyYy9hcHAuanMiLCJleGFtcGxlL3NyYy9saWJzL2NvbXBvbmVudC9pbmRleC5qcyIsImV4YW1wbGUvc3JjL2xpYnMvY29tcG9uZW50L2xpYi9jb21wb25lbnQtcHJvdG90eXBlLmpzIiwiZXhhbXBsZS9zcmMvbGlicy9jb21wb25lbnQvbGliL2NvbnN0YW50cy5qcyIsImV4YW1wbGUvc3JjL2xpYnMvY29tcG9uZW50L2xpYi9kZWZhdWx0cy5qcyIsImV4YW1wbGUvc3JjL2xpYnMvY29tcG9uZW50L2xpYi90ZW1wbGF0ZXMuanMiLCJleGFtcGxlL3NyYy9saWJzL2NvbXBvbmVudC9saWIvdXRpbHMuanMiLCJub2RlX21vZHVsZXMvZmVjaGEvZmVjaGEuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztBQ0FBOzs7Ozs7OztBQUVBLElBQU0sMkJBQTJCLFlBQU0sQUFDbkM7V0FBQSxBQUFPLGFBQWEsb0JBQUEsQUFBVyxLQUEvQixBQUFvQixBQUFnQixBQUN2QztBQUZELEFBQWdDLENBQUE7O0FBSWhDLElBQUcsc0JBQUgsQUFBeUIsZUFBUSxBQUFPLGlCQUFQLEFBQXdCLG9CQUFvQixZQUFNLEFBQUU7NEJBQUEsQUFBd0IsUUFBUSxVQUFBLEFBQUMsSUFBRDtlQUFBLEFBQVE7QUFBeEMsQUFBZ0Q7QUFBcEcsQ0FBQTs7Ozs7Ozs7O0FDTmpDOzs7O0FBQ0E7Ozs7Ozs7O0FBRUEsSUFBTSxPQUFPLFNBQVAsQUFBTyxLQUFBLEFBQUMsS0FBRCxBQUFNLE1BQVMsQUFDM0I7S0FBSSxNQUFNLEdBQUEsQUFBRyxNQUFILEFBQVMsS0FBSyxTQUFBLEFBQVMsaUJBQWpDLEFBQVUsQUFBYyxBQUEwQixBQUMvQztBQUVIOztLQUFHLENBQUMsSUFBSixBQUFRLFFBQVEsT0FBTyxRQUFBLEFBQVEsS0FBZixBQUFPLEFBQWEsQUFFcEM7OztlQUNVLEFBQUksSUFBSSxVQUFB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QXVCLE9BQTNELEFBQWtFLE9BQU8saUJBQUE7ZUFBUyxDQUFDLEVBQUUsTUFBQSxBQUFNLGVBQWUsTUFBckIsQUFBMkIsZ0JBQWdCLE1BQUEsQUFBTSxpQkFBN0QsQUFBVSxBQUFvRTtBQUEvSixBQUFRLEtBQUE7QUFBckM7OztBQy9GUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImltcG9ydCBEYXRlUGlja2VyIGZyb20gJy4vbGlicy9jb21wb25lbnQnO1xuXG5jb25zdCBvbkRPTUNvbnRlbnRMb2FkZWRUYXNrcyA9IFsoKSA9PiB7XG4gICAgd2luZG93LkRhdGVQaWNrZXIgPSBEYXRlUGlja2VyLmluaXQoJy5qcy1kYXRlLXBpY2tlcicpO1xufV07XG4gICAgXG5pZignYWRkRXZlbnRMaXN0ZW5lcicgaW4gd2luZG93KSB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsICgpID0+IHsgb25ET01Db250ZW50TG9hZGVkVGFza3MuZm9yRWFjaCgoZm4pID0+IGZuKCkpOyB9KTsiLCJpbXBvcnQgZGVmYXVsdHMgZnJvbSAnLi9saWIvZGVmYXVsdHMnO1xuaW1wb3J0IGNvbXBvbmVudFByb3RvdHlwZSBmcm9tICcuL2xpYi9jb21wb25lbnQtcHJvdG90eXBlJztcblxuY29uc3QgaW5pdCA9IChzZWwsIG9wdHMpID0+IHtcblx0bGV0IGVscyA9IFtdLnNsaWNlLmNhbGwoZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChzZWwpKTtcbiAgICAvL2xldCBlbHMgPSBBcnJheS5mcm9tKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoc2VsKSk7XG5cblx0aWYoIWVscy5sZW5ndGgpIHJldHVybiBjb25zb2xlLndhcm4oJ0RhdGUgcGlja2VyIG5vdCBpbml0aWFsaXNlZCwgbm8gYXVnbWVudGFibGUgZWxlbWVudHMgZm91bmQnKTtcbiAgICBcblx0cmV0dXJuIHtcblx0XHRwaWNrZXJzOiBlbHMubWFwKChlbCkgPT4ge1xuXHRcdFx0cmV0dXJuIE9iamVjdC5hc3NpZ24oT2JqZWN0LmNyZWF0ZShjb21wb25lbnRQcm90b3R5cGUpLCB7XG5cdFx0XHRcdG5vZGU6IGVsLCBcblx0XHRcdFx0aW5wdXQ6IGVsLnF1ZXJ5U2VsZWN0b3IoJ2lucHV0JyksXG5cdFx0XHRcdGJ0bjogZWwucXVlcnlTZWxlY3RvcignLmJ0bicpLFxuXHRcdFx0XHRzZXR0aW5nczogT2JqZWN0LmFzc2lnbih7fSwgZGVmYXVsdHMsIG9wdHMpXG5cdFx0XHR9KS5pbml0KCk7XG5cdFx0fSksXG5cdFx0ZmluZChzZWwpe1xuXHRcdFx0bGV0IGNhbmRpZGF0ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3Ioc2VsKTtcblx0XHRcdGlmKCFjYW5kaWRhdGUpIHJldHVybiBjb25zb2xlLndhcm4oJ0RhdGUgcGlja2VyIG5vdCBmb3VuZCBmb3IgdGhpcyBzZWxlY3RvcicpO1xuXHRcdFx0cmV0dXJuIHRoaXMucGlja2Vycy5yZWR1Y2UoKGFjYywgY3VycikgPT4ge1xuXHRcdFx0XHRpZihjdXJyLm5vZGUgPT09IGNhbmRpZGF0ZSkgYWNjID0gY3Vycjtcblx0XHRcdFx0cmV0dXJuIGFjYztcblx0XHRcdH0sIGZhbHNlKTtcblx0XHR9XG5cdH07XG59O1xuXG5leHBvcnQgZGVmYXVsdCB7IGluaXQgfTsiLCJpbXBvcnQgeyBcblx0ZWxlbWVudEZhY3RvcnksXG5cdG1vbnRoVmlld0ZhY3RvcnksXG5cdGNhdGNoQnViYmxlLFxuXHRtb250aE5hbWVzLFxuXHRkYXlOYW1lcyxcblx0Z2V0TW9udGhMZW5ndGgsXG5cdHBhcnNlRGF0ZSxcblx0Zm9ybWF0RGF0ZVxufSBmcm9tICcuL3V0aWxzJztcbmltcG9ydCB7IGNhbGVuZGFyLCBtb250aCB9IGZyb20gJy4vdGVtcGxhdGVzJztcbmltcG9ydCB7IFxuXHRUUklHR0VSX0VWRU5UUyxcblx0VFJJR0dFUl9LRVlDT0RFUyxcblx0S0VZQ09ERVMsXG5cdEFSSUFfSEVMUF9URVhULFxuXHRDTEFTU05BTUVTLFxuXHRTRUxFQ1RPUlMsXG5cdERBVEFfQVRUUklCVVRFU1xufSBmcm9tICcuL2NvbnN0YW50cyc7XG5cbmV4cG9ydCBkZWZhdWx0IHtcblx0aW5pdCgpIHtcblx0XHR0aGlzLmluaXRDbG9uZSgpO1xuXG5cdFx0VFJJR0dFUl9FVkVOVFMuZm9yRWFjaChldiA9PiB7XG5cdFx0XHR0aGlzLmJ0bi5hZGRFdmVudExpc3RlbmVyKGV2LCBlID0+IHtcblx0XHRcdFx0aWYoISFlLmtleUNvZGUgJiYgIX5UUklHR0VSX0tFWUNPREVTLmluZGV4T2YoZS5rZXlDb2RlKSkgcmV0dXJuO1xuXHRcdFx0XHRjYXRjaEJ1YmJsZShlKTtcblx0XHRcdFx0dGhpcy50b2dnbGUoKTtcblx0XHRcdH0pO1xuXHRcdH0pO1xuXG5cdFx0dGhpcy5ib3VuZEhhbmRsZUZvY3VzT3V0ID0gdGhpcy5oYW5kbGVGb2N1c091dC5iaW5kKHRoaXMpO1xuXG5cdFx0dGhpcy5zdGFydERhdGUgPSB0aGlzLmlucHV0LnZhbHVlID8gcGFyc2VEYXRlKHRoaXMuaW5wdXQudmFsdWUsIHRoaXMuc2V0dGluZ3MudmFsdWVGb3JtYXQpIDogZmFsc2U7XG5cdFx0aWYodGhpcy5zdGFydERhdGUpIHRoaXMuaW5wdXRDbG9uZS52YWx1ZSA9IGZvcm1hdERhdGUodGhpcy5zdGFydERhdGUsIHRoaXMuc2V0dGluZ3MuZGlzcGxheUZvcm1hdCk7XG5cblx0XHR0aGlzLnJvb3REYXRlID0gdGhpcy5zdGFydERhdGUgfHwgbmV3IERhdGUoKTtcblx0XHR0aGlzLnJvb3REYXRlLnNldEhvdXJzKDAsMCwwLDApO1xuXG5cdFx0dGhpcy5zZXR0aW5ncy5zdGFydE9wZW4gJiYgdGhpcy5vcGVuKCk7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH0sXG5cdGluaXRDbG9uZSgpe1xuXHRcdHRoaXMuaW5wdXRDbG9uZSA9IGVsZW1lbnRGYWN0b3J5KCdpbnB1dCcsIHsgdHlwZTogJ3RleHQnLCB0YWJpbmRleDogLTF9LCB0aGlzLmlucHV0LmNsYXNzTmFtZSk7XG5cdFx0dGhpcy5pbnB1dC5zZXRBdHRyaWJ1dGUoJ3R5cGUnLCAnaGlkZGVuJyk7XG5cdFx0dGhpcy5ub2RlLmFwcGVuZENoaWxkKHRoaXMuaW5wdXRDbG9uZSk7XG5cblx0XHR0aGlzLmlucHV0Q2xvbmUuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgZSA9PiB7XG5cdFx0XHR0aGlzLnN0YXJ0RGF0ZSA9IHBhcnNlRGF0ZSh0aGlzLmlucHV0Q2xvbmUudmFsdWUsIHRoaXMuc2V0dGluZ3MuZGlzcGxheUZvcm1hdCkvL3Rocm93cyBpZiBwYXJzZSBlcnJvclxuXHRcdFx0dGhpcy5pbnB1dC52YWx1ZSA9IHRoaXMuc3RhcnREYXRlIHx8ICcnO1xuXHRcdH0pO1xuXHR9LFxuXHR0b2dnbGUoKXtcblx0XHRpZih0aGlzLmlzT3BlbikgdGhpcy5jbG9zZSgpO1xuXHRcdGVsc2UgdGhpcy5vcGVuKCk7XG5cdH0sXG5cdG9wZW4oKXtcblx0XHRpZih0aGlzLmlzT3BlbikgcmV0dXJuO1xuXHRcdHRoaXMucmVuZGVyQ2FsZW5kYXIoKTtcblx0XHR0aGlzLmlzT3BlbiA9IHRydWU7XG5cdFx0dGhpcy5idG4uc2V0QXR0cmlidXRlKCdhcmlhLWV4cGFuZGVkJywgJ3RydWUnKTtcblx0XHR0aGlzLndvcmtpbmdEYXRlID0gdGhpcy5yb290RGF0ZTtcblx0XHR0aGlzLmNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKFNFTEVDVE9SUy5CVE5fQUNUSVZFKSA/IHRoaXMuY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoU0VMRUNUT1JTLkJUTl9BQ1RJVkUpLmZvY3VzKCkgOiB0aGlzLmNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKFNFTEVDVE9SUy5CVE5fVE9EQVkpID8gdGhpcy5jb250YWluZXIucXVlcnlTZWxlY3RvcihTRUxFQ1RPUlMuQlROX1RPREFZKS5mb2N1cygpIDogdGhpcy5jb250YWluZXIucXVlcnlTZWxlY3RvckFsbChTRUxFQ1RPUlMuQlROX0RFRkFVTFQpWzBdLmZvY3VzKCk7XG5cdFx0ZG9jdW1lbnQuYm9keS5hZGRFdmVudExpc3RlbmVyKCdmb2N1c291dCcsIHRoaXMuYm91bmRIYW5kbGVGb2N1c091dCk7XG5cdH0sXG5cdGNsb3NlKCl7XG5cdFx0aWYoIXRoaXMuaXNPcGVuKSByZXR1cm47XG5cdFx0dGhpcy5ub2RlLnJlbW92ZUNoaWxkKHRoaXMuY29udGFpbmVyKTtcblx0XHR0aGlzLmlzT3BlbiA9IGZhbHNlO1xuXHRcdHRoaXMuYnRuLnNldEF0dHJpYnV0ZSgnYXJpYS1leHBhbmRlZCcsICdmYWxzZScpO1xuXHRcdHRoaXMuYnRuLmZvY3VzKCk7XG5cdFx0dGhpcy53b3JraW5nRGF0ZSA9IGZhbHNlO1xuXHR9LFxuXHRoYW5kbGVGb2N1c091dCgpe1xuXHRcdHdpbmRvdy5zZXRUaW1lb3V0KCgpID0+IHtcblx0XHRcdGlmKHRoaXMuY29udGFpbmVyLmNvbnRhaW5zKGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQpKSByZXR1cm47XG5cdFx0XHR0aGlzLmNsb3NlKCk7XG5cdFx0XHRkb2N1bWVudC5ib2R5LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2ZvY3Vzb3V0JywgdGhpcy5ib3VuZEhhbmRsZUZvY3VzT3V0KTtcblx0XHR9LCAxNik7XG5cdH0sXG5cdHJlbmRlckNhbGVuZGFyKCl7XG5cdFx0dGhpcy5jb250YWluZXIgPSBlbGVtZW50RmFjdG9yeSgnZGl2JywgeyAncm9sZSc6ICdkaWFsb2cnLCAnYXJpYS1oZWxwdGV4dCc6IEFSSUFfSEVMUF9URVhUIH0sIENMQVNTTkFNRVMuQ09OVEFJTkVSKTtcblx0XHR0aGlzLmNvbnRhaW5lci5pbm5lckhUTUwgPSBjYWxlbmRhcigpO1xuXHRcdHRoaXMubm9kZS5hcHBlbmRDaGlsZCh0aGlzLmNvbnRhaW5lcik7XG5cdFx0dGhpcy5tb250aENvbnRhaW5lciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoU0VMRUNUT1JTLk1PTlRIX0NPTlRBSU5FUik7XG5cdFx0dGhpcy5yZW5kZXJNb250aCgpO1xuXHRcdHRoaXMuaW5pdExpc3RlbmVycygpO1xuXHR9LFxuXHRyZW5kZXJNb250aCgpe1xuXHRcdHRoaXMubW9udGhWaWV3ID0gbW9udGhWaWV3RmFjdG9yeSh0aGlzLndvcmtpbmdEYXRlIHx8IHRoaXMucm9vdERhdGUsIHRoaXMuc3RhcnREYXRlKTtcblx0XHR0aGlzLm1vbnRoQ29udGFpbmVyLmlubmVySFRNTCA9IG1vbnRoKHRoaXMubW9udGhWaWV3KTtcblx0XHRpZighdGhpcy5jb250YWluZXIucXVlcnlTZWxlY3RvcihgJHtTRUxFQ1RPUlMuQlROX0RFRkFVTFR9W3RhYmluZGV4PVwiMFwiXWApKSBbXS5zbGljZS5jYWxsKHRoaXMuY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3JBbGwoYCR7U0VMRUNUT1JTLkJUTl9ERUZBVUxUfTpub3QoW2Rpc2FibGVkXSlgKSkuc2hpZnQoKS5zZXRBdHRyaWJ1dGUoJ3RhYmluZGV4JywgJzAnKTtcblx0fSxcblx0aW5pdExpc3RlbmVycygpe1xuXHRcdFRSSUdHRVJfRVZFTlRTLmZvckVhY2goZXYgPT4ge1xuXHRcdFx0dGhpcy5jb250YWluZXIuYWRkRXZlbnRMaXN0ZW5lcihldiwgdGhpcy5yb3V0ZUhhbmRsZXJzLmJpbmQodGhpcykpO1xuXHRcdH0pO1xuXHR9LFxuXHRyb3V0ZUhhbmRsZXJzKGUpe1xuXHRcdGlmKGUua2V5Q29kZSkgdGhpcy5oYW5kbGVLZXlEb3duKGUpO1xuXHRcdGVsc2Uge1xuXHRcdFx0aWYoZS50YXJnZXQuY2xhc3NMaXN0LmNvbnRhaW5zKENMQVNTTkFNRVMuTkFWX0JUTikgfHwgZS50YXJnZXQucGFyZW50Tm9kZS5jbGFzc0xpc3QuY29udGFpbnMoQ0xBU1NOQU1FUy5OQVZfQlROKSkgdGhpcy5oYW5kbGVOYXYoKyhlLnRhcmdldC5nZXRBdHRyaWJ1dGUoREFUQV9BVFRSSUJVVEVTLkFDVElPTikgfHwgZS50YXJnZXQucGFyZW50Tm9kZS5nZXRBdHRyaWJ1dGUoREFUQV9BVFRSSUJVVEVTLkFDVElPTikpKTtcblx0XHRcdGlmKGUudGFyZ2V0LmNsYXNzTGlzdC5jb250YWlucyhDTEFTU05BTUVTLkJUTl9ERUZBVUxUKSkgdGhpcy5zZWxlY3REYXRlKGUpO1xuXHRcdH1cblx0fSxcblx0aGFuZGxlTmF2KGFjdGlvbil7XG5cdFx0dGhpcy53b3JraW5nRGF0ZSA9IG5ldyBEYXRlKHRoaXMud29ya2luZ0RhdGUuZ2V0RnVsbFllYXIoKSwgdGhpcy53b3JraW5nRGF0ZS5nZXRNb250aCgpICsgYWN0aW9uKTtcblx0XHR0aGlzLnJlbmRlck1vbnRoKCk7XG5cdH0sXG5cdGhhbmRsZUtleURvd24oZSl7XG5cdFx0Y29uc3Qga2V5RG93bkRpY3Rpb25hcnkgPSB7XG5cdFx0XHRQQUdFX1VQKCl7XG5cdFx0XHRcdGNhdGNoQnViYmxlKGUpO1xuXHRcdFx0XHR0aGlzLndvcmtpbmdEYXRlID0gbmV3IERhdGUodGhpcy53b3JraW5nRGF0ZS5nZXRGdWxsWWVhcigpLCB0aGlzLndvcmtpbmdEYXRlLmdldE1vbnRoKCkgLSAxLCB0aGlzLndvcmtpbmdEYXRlLmdldERhdGUoKSk7XG5cdFx0XHRcdHRoaXMucmVuZGVyTW9udGgoKTtcblx0XHRcdFx0Ly9mb2N1cyBvbiBsYXN0IERvTSBpZiBncmVhdGVyIHRoYW4gbGVuZ3RoIG9mIG1vbnRoXG5cdFx0XHRcdHRoaXMuY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoYFske0RBVEFfQVRUUklCVVRFUy5EQVl9PVwiJHtlLnRhcmdldC5nZXRBdHRyaWJ1dGUoREFUQV9BVFRSSUJVVEVTLkRBWSl9XCJdOm5vdCg6ZGlzYWJsZWQpYCkuZm9jdXMoKTtcblx0XHRcdH0sLy8/XG5cdFx0XHRQQUdFX0RPV04oKXtcblx0XHRcdFx0Y2F0Y2hCdWJibGUoZSk7XG5cdFx0XHRcdHRoaXMud29ya2luZ0RhdGUgPSBuZXcgRGF0ZSh0aGlzLndvcmtpbmdEYXRlLmdldEZ1bGxZZWFyKCksIHRoaXMud29ya2luZ0RhdGUuZ2V0TW9udGgoKSArIDEsIHRoaXMud29ya2luZ0RhdGUuZ2V0RGF0ZSgpKTtcblx0XHRcdFx0dGhpcy5yZW5kZXJNb250aCgpO1xuXHRcdFx0XHQvL2ZvY3VzIG9uIGxhc3QgRG9NIGlmIGdyZWF0ZXIgdGhhbiBsZW5ndGggb2YgbW9udGhcblx0XHRcdFx0dGhpcy5jb250YWluZXIucXVlcnlTZWxlY3RvcihgWyR7REFUQV9BVFRSSUJVVEVTLkRBWX09XCIke2UudGFyZ2V0LmdldEF0dHJpYnV0ZShEQVRBX0FUVFJJQlVURVMuREFZKX1cIl06bm90KDpkaXNhYmxlZClgKS5mb2N1cygpO1xuXHRcdFx0fSwvLz9cblx0XHRcdFRBQigpe1xuXHRcdFx0XHQvKiBcblx0XHRcdFx0XHQtIHRyYXAgdGFiIGluIGZvY3VzYWJsZSBjaGlsZHJlbj8/XG5cdFx0XHRcdFx0XHQgLSByZXR1cm4gdG8gYnV0dG9uIGFmdGVyIGxhc3QgZm9jdXNhYmxlIGNoaWxkP1xuXHRcdFx0XHRcdC0gcmVmLiBodHRwczovL2dpdGh1Yi5jb20vbWpicC9zdG9ybS1mb2N1cy1tYW5hZ2VyL2Jsb2IvbWFzdGVyL3NyYy9zdG9ybS1mb2N1cy1tYW5hZ2VyLmpzXG5cdFx0XHRcdCovXG5cdFx0XHR9LFxuXHRcdFx0RU5URVIoZSl7XG5cdFx0XHRcdGNhdGNoQnViYmxlKGUpO1xuXHRcdFx0XHRpZihlLnRhcmdldC5jbGFzc0xpc3QuY29udGFpbnMoQ0xBU1NOQU1FUy5CVE5fREVGQVVMVCkpIHRoaXMuc2VsZWN0RGF0ZShlKTtcblx0XHRcdFx0aWYoZS50YXJnZXQuY2xhc3NMaXN0LmNvbnRhaW5zKENMQVNTTkFNRVMuTkFWX0JUTikpIHRoaXMuaGFuZGxlTmF2KCtlLnRhcmdldC5nZXRBdHRyaWJ1dGUoREFUQV9BVFRSSUJVVEVTLkFDVElPTikpO1xuXHRcdFx0fSxcblx0XHRcdEVTQ0FQRSgpeyB0aGlzLmNsb3NlKCk7IH0sXG5cdFx0XHRTUEFDRShlKSB7IGtleURvd25EaWN0aW9uYXJ5LkVOVEVSKGUpOyB9LFxuXHRcdFx0TEVGVChlKXtcblx0XHRcdFx0Y2F0Y2hCdWJibGUoZSk7XG5cdFx0XHRcdGlmKCFlLnRhcmdldC5jbGFzc0xpc3QuY29udGFpbnMoQ0xBU1NOQU1FUy5CVE5fREVGQVVMVCkpIHJldHVybjtcblxuXHRcdFx0XHRpZih0aGlzLm1vbnRoVmlldy5tb2RlbFsrZS50YXJnZXQuZ2V0QXR0cmlidXRlKERBVEFfQVRUUklCVVRFUy5NT0RFTF9JTkRFWCldLm51bWJlciA9PT0gMSkge1xuXHRcdFx0XHRcdHRoaXMud29ya2luZ0RhdGUgPSBuZXcgRGF0ZSh0aGlzLndvcmtpbmdEYXRlLmdldEZ1bGxZZWFyKCksIHRoaXMud29ya2luZ0RhdGUuZ2V0TW9udGgoKSAtIDEpO1xuXHRcdFx0XHRcdHRoaXMucmVuZGVyTW9udGgoKTtcblx0XHRcdFx0XHRbXS5zbGljZS5jYWxsKHRoaXMuY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3JBbGwoU0VMRUNUT1JTLkJUTl9FTkFCTEVEKSkucG9wKCkuZmlyc3RFbGVtZW50Q2hpbGQuZm9jdXMoKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNlIHRoaXMuY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoYFske0RBVEFfQVRUUklCVVRFUy5NT0RFTF9JTkRFWH09XCIkeytlLnRhcmdldC5nZXRBdHRyaWJ1dGUoREFUQV9BVFRSSUJVVEVTLk1PREVMX0lOREVYKSAtIDF9XCJdYCkuZm9jdXMoKTtcblx0XHRcdH0sXG5cdFx0XHRVUCgpe1xuXHRcdFx0XHRjYXRjaEJ1YmJsZShlKTtcblx0XHRcdFx0aWYoIWUudGFyZ2V0LmNsYXNzTGlzdC5jb250YWlucyhDTEFTU05BTUVTLkJUTl9ERUZBVUxUKSkgcmV0dXJuO1xuXHRcdFx0XHRcblx0XHRcdFx0bGV0IG5leHREYXlJbmRleCA9ICtlLnRhcmdldC5nZXRBdHRyaWJ1dGUoREFUQV9BVFRSSUJVVEVTLk1PREVMX0lOREVYKSAtIDc7XG5cblx0XHRcdFx0aWYoK3RoaXMubW9udGhWaWV3Lm1vZGVsWytlLnRhcmdldC5nZXRBdHRyaWJ1dGUoREFUQV9BVFRSSUJVVEVTLk1PREVMX0lOREVYKV0ubnVtYmVyIC0gNyA8IDEpIHtcblx0XHRcdFx0XHR0aGlzLndvcmtpbmdEYXRlID0gbmV3IERhdGUodGhpcy53b3JraW5nRGF0ZS5nZXRGdWxsWWVhcigpLCB0aGlzLndvcmtpbmdEYXRlLmdldE1vbnRoKCkgLSAxKTtcblx0XHRcdFx0XHR0aGlzLnJlbmRlck1vbnRoKCk7XG5cdFx0XHRcdFx0Ly91c2UgdGhpcy53b3JraW5nRGF0ZSBpbnN0ZWFkIG9mIHF1ZXJ5aW5nIERPTT9cblx0XHRcdFx0XHRpZighdGhpcy5jb250YWluZXIucXVlcnlTZWxlY3RvcihgWyR7REFUQV9BVFRSSUJVVEVTLk1PREVMX0lOREVYfT1cIiR7dGhpcy5tb250aFZpZXcubW9kZWwubGVuZ3RoICsgbmV4dERheUluZGV4fVwiXWApfHwgdGhpcy5jb250YWluZXIucXVlcnlTZWxlY3RvcihgWyR7REFUQV9BVFRSSUJVVEVTLk1PREVMX0lOREVYfT1cIiR7dGhpcy5tb250aFZpZXcubW9kZWwubGVuZ3RoICsgbmV4dERheUluZGV4fVwiXWApICYmIHRoaXMuY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoYFske0RBVEFfQVRUUklCVVRFUy5NT0RFTF9JTkRFWH09XCIke3RoaXMubW9udGhWaWV3Lm1vZGVsLmxlbmd0aCArIG5leHREYXlJbmRleH1cIl1gKS5oYXNBdHRyaWJ1dGUoJ2Rpc2FibGVkJykpIFxuXHRcdFx0XHRcdFx0dGhpcy5jb250YWluZXIucXVlcnlTZWxlY3RvcihgWyR7REFUQV9BVFRSSUJVVEVTLk1PREVMX0lOREVYfT1cIiR7dGhpcy5tb250aFZpZXcubW9kZWwubGVuZ3RoICsgKG5leHREYXlJbmRleCAtIDcpfVwiXWApLmZvY3VzKCk7XG5cdFx0XHRcdFx0ZWxzZSB0aGlzLmNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKGBbJHtEQVRBX0FUVFJJQlVURVMuTU9ERUxfSU5ERVh9PVwiJHt0aGlzLm1vbnRoVmlldy5tb2RlbC5sZW5ndGggKyBuZXh0RGF5SW5kZXh9XCJdYCkuZm9jdXMoKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNlIHRoaXMuY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoYFske0RBVEFfQVRUUklCVVRFUy5NT0RFTF9JTkRFWH09XCIke25leHREYXlJbmRleH1cIl1gKS5mb2N1cygpO1xuXHRcdFx0fSxcblx0XHRcdFJJR0hUKGUpe1xuXHRcdFx0XHRjYXRjaEJ1YmJsZShlKTtcblx0XHRcdFx0aWYoIWUudGFyZ2V0LmNsYXNzTGlzdC5jb250YWlucyhDTEFTU05BTUVTLkJUTl9ERUZBVUxUKSkgcmV0dXJuO1xuXHRcdFx0XHRcblx0XHRcdFx0aWYodGhpcy5tb250aFZpZXcubW9kZWxbK2UudGFyZ2V0LmdldEF0dHJpYnV0ZShEQVRBX0FUVFJJQlVURVMuTU9ERUxfSU5ERVgpXS5udW1iZXIgPT09IGdldE1vbnRoTGVuZ3RoKHRoaXMubW9udGhWaWV3Lm1vZGVsWytlLnRhcmdldC5nZXRBdHRyaWJ1dGUoREFUQV9BVFRSSUJVVEVTLk1PREVMX0lOREVYKV0uZGF0ZS5nZXRGdWxsWWVhcigpLCB0aGlzLm1vbnRoVmlldy5tb2RlbFsrZS50YXJnZXQuZ2V0QXR0cmlidXRlKERBVEFfQVRUUklCVVRFUy5NT0RFTF9JTkRFWCldLmRhdGUuZ2V0TW9udGgoKSkpIHtcblx0XHRcdFx0XHR0aGlzLndvcmtpbmdEYXRlID0gbmV3IERhdGUodGhpcy53b3JraW5nRGF0ZS5nZXRGdWxsWWVhcigpLCB0aGlzLndvcmtpbmdEYXRlLmdldE1vbnRoKCkgKyAxKTtcblx0XHRcdFx0XHR0aGlzLnJlbmRlck1vbnRoKCk7XG5cdFx0XHRcdFx0W10uc2xpY2UuY2FsbCh0aGlzLmNvbnRhaW5lci5xdWVyeVNlbGVjdG9yQWxsKFNFTEVDVE9SUy5CVE5fRU5BQkxFRCkpLnNoaWZ0KCkuZmlyc3RFbGVtZW50Q2hpbGQuZm9jdXMoKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNlIHRoaXMuY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoYFske0RBVEFfQVRUUklCVVRFUy5NT0RFTF9JTkRFWH09XCIkeytlLnRhcmdldC5nZXRBdHRyaWJ1dGUoREFUQV9BVFRSSUJVVEVTLk1PREVMX0lOREVYKSArIDF9XCJdYCkuZm9jdXMoKTtcblx0XHRcdFx0XG5cdFx0XHR9LFxuXHRcdFx0RE9XTigpe1xuXHRcdFx0XHRjYXRjaEJ1YmJsZShlKTtcblx0XHRcdFx0aWYoIWUudGFyZ2V0LmNsYXNzTGlzdC5jb250YWlucyhDTEFTU05BTUVTLkJUTl9ERUZBVUxUKSkgcmV0dXJuO1xuXG5cdFx0XHRcdGxldCBuZXh0RGF0ZSA9ICt0aGlzLm1vbnRoVmlldy5tb2RlbFsrZS50YXJnZXQuZ2V0QXR0cmlidXRlKERBVEFfQVRUUklCVVRFUy5NT0RFTF9JTkRFWCldLm51bWJlciArIDcsXG5cdFx0XHRcdFx0bmV4dERheUluZGV4ID0gK2UudGFyZ2V0LmdldEF0dHJpYnV0ZShEQVRBX0FUVFJJQlVURVMuTU9ERUxfSU5ERVgpICsgNztcblxuXHRcdFx0XHRpZigrdGhpcy5tb250aFZpZXcubW9kZWxbK2UudGFyZ2V0LmdldEF0dHJpYnV0ZShEQVRBX0FUVFJJQlVURVMuTU9ERUxfSU5ERVgpXS5udW1iZXIgKyA3ID4gZ2V0TW9udGhMZW5ndGgodGhpcy5tb250aFZpZXcubW9kZWxbK2UudGFyZ2V0LmdldEF0dHJpYnV0ZShEQVRBX0FUVFJJQlVURVMuTU9ERUxfSU5ERVgpXS5kYXRlLmdldEZ1bGxZZWFyKCksIHRoaXMubW9udGhWaWV3Lm1vZGVsWytlLnRhcmdldC5nZXRBdHRyaWJ1dGUoREFUQV9BVFRSSUJVVEVTLk1PREVMX0lOREVYKV0uZGF0ZS5nZXRNb250aCgpKSkge1xuXHRcdFx0XHRcdHRoaXMud29ya2luZ0RhdGUgPSBuZXcgRGF0ZSh0aGlzLndvcmtpbmdEYXRlLmdldEZ1bGxZZWFyKCksIHRoaXMud29ya2luZ0RhdGUuZ2V0TW9udGgoKSArIDEpO1xuXHRcdFx0XHRcdHRoaXMucmVuZGVyTW9udGgoKTtcblx0XHRcdFx0XHQvL3VzZSB0aGlzLndvcmtpbmdEYXRlIGluc3RlYWQgb2YgcXVlcnlpbmcgRE9NP1xuXHRcdFx0XHRcdGlmKHRoaXMuY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoYFske0RBVEFfQVRUUklCVVRFUy5NT0RFTF9JTkRFWH09XCIke25leHREYXlJbmRleCAlIDd9XCJdYCkuaGFzQXR0cmlidXRlKCdkaXNhYmxlZCcpKSB0aGlzLmNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKGBbJHtEQVRBX0FUVFJJQlVURVMuTU9ERUxfSU5ERVh9PVwiJHsobmV4dERheUluZGV4ICUgNykgKyA3fVwiXWApLmZvY3VzKCk7XG5cdFx0XHRcdFx0ZWxzZSB0aGlzLmNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKGBbJHtEQVRBX0FUVFJJQlVURVMuTU9ERUxfSU5ERVh9PVwiJHtuZXh0RGF5SW5kZXggJSA3fVwiXWApLmZvY3VzKCk7XG5cdFx0XHRcdH1cblx0XHRcdFx0ZWxzZSB0aGlzLmNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKGBbJHtEQVRBX0FUVFJJQlVURVMuTU9ERUxfSU5ERVh9PVwiJHtuZXh0RGF5SW5kZXh9XCJdYCkuZm9jdXMoKTtcblx0XHRcdH1cblx0XHR9O1xuXHRcdGlmKEtFWUNPREVTW2Uua2V5Q29kZV0gJiYga2V5RG93bkRpY3Rpb25hcnlbS0VZQ09ERVNbZS5rZXlDb2RlXV0pIGtleURvd25EaWN0aW9uYXJ5W0tFWUNPREVTW2Uua2V5Q29kZV1dLmNhbGwodGhpcywgZSk7XG5cdH0sXG5cdHNlbGVjdERhdGUoZSl7XG5cdFx0ZS50YXJnZXQuY2xhc3NMaXN0LmFkZChTRUxFQ1RPUlMuQlROX0FDVElWRSk7XG5cdFx0dGhpcy5zZXREYXRlKHRoaXMubW9udGhWaWV3Lm1vZGVsWytlLnRhcmdldC5nZXRBdHRyaWJ1dGUoREFUQV9BVFRSSUJVVEVTLk1PREVMX0lOREVYKV0uZGF0ZSk7XHRcdFxuXHRcdHRoaXMuY2xvc2UoKTtcblx0fSxcblx0cmVzZXQoKXtcblx0XHR0aGlzLnJvb3REYXRlID0gbmV3IERhdGUoKTtcblx0XHR0aGlzLnJvb3REYXRlLnNldEhvdXJzKDAsMCwwLDApO1xuXHRcdHRoaXMuc3RhcnREYXRlID0gZmFsc2U7XG5cdFx0dGhpcy5pbnB1dENsb25lLnZhbHVlID0gJyc7XG5cdFx0dGhpcy5pbnB1dC52YWx1ZSA9ICcnO1xuXHRcdGlmKHRoaXMuaXNPcGVuKSB0aGlzLmNsb3NlKCk7XG5cdH0sXG5cdHNldERhdGUobmV4dERhdGUpe1xuXHRcdHRoaXMuc3RhcnREYXRlID0gbmV4dERhdGU7XG5cdFx0dGhpcy5yb290RGF0ZSA9IHRoaXMuc3RhcnREYXRlO1xuXHRcdHRoaXMuaW5wdXRDbG9uZS52YWx1ZSA9IGZvcm1hdERhdGUodGhpcy5zdGFydERhdGUsIHRoaXMuc2V0dGluZ3MuZGlzcGxheUZvcm1hdCk7XG5cdFx0dGhpcy5pbnB1dC52YWx1ZSA9IGZvcm1hdERhdGUodGhpcy5zdGFydERhdGUsIHRoaXMuc2V0dGluZ3MudmFsdWVGb3JtYXQpO1xuXHR9LFxuXHRnZXRWYWx1ZSgpeyByZXR1cm4gdGhpcy5zdGFydERhdGU7IH0sXG5cdHNldFZhbHVlKG5leHRWYWx1ZSwgZm9ybWF0ID0gdGhpcy5zZXR0aW5ncy52YWx1ZUZvcm1hdCl7XG5cdFx0dGhpcy5zZXREYXRlKHBhcnNlRGF0ZShuZXh0VmFsdWUsIGZvcm1hdCkpO1xuXHRcdGlmKHRoaXMuaXNPcGVuKSB0aGlzLndvcmtpbmdEYXRlID0gdGhpcy5zdGFydERhdGUsIHRoaXMucmVuZGVyTW9udGgoKTtcblx0fVxufTsiLCJleHBvcnQgY29uc3QgVFJJR0dFUl9FVkVOVFMgPSBbJ2NsaWNrJywgJ2tleWRvd24nXTtcblxuZXhwb3J0IGNvbnN0IFRSSUdHRVJfS0VZQ09ERVMgPSBbMTMsIDMyXTtcblxuZXhwb3J0IGNvbnN0IEtFWUNPREVTID0ge1xuICAgIDk6ICdUQUInLFxuICAgIDEzOiAnRU5URVInLFxuICAgIDI3OiAnRVNDQVBFJyxcbiAgICAzMjogJ1NQQUNFJyxcbiAgICAzMzogJ1BBR0VfVVAnLFxuICAgIDM0OiAnUEFHRV9ET1dOJyxcbiAgICAzNzogJ0xFRlQnLFxuICAgIDM4OiAnVVAnLFxuICAgIDM5OiAnUklHSFQnLFxuICAgIDQwOiAnRE9XTidcbn07XG5cbmV4cG9ydCBjb25zdCBBUklBX0hFTFBfVEVYVCA9IGBQcmVzcyB0aGUgYXJyb3cga2V5cyB0byBuYXZpZ2F0ZSBieSBkYXksIFBhZ2VVcCBhbmQgUGFnZURvd24gdG8gbmF2aWdhdGUgYnkgbW9udGgsIEVudGVyIG9yIFNwYWNlIHRvIHNlbGVjdCBhIGRhdGUsIGFuZCBFc2NhcGUgdG8gY2FuY2VsLmA7XG5cbi8qXG4gdG8gZG86XG4gY29tYmluZSBDTEFTU05BTUVTIGFuZCBTRUxFQ1RPUlMgKHJlbW92ZSBTRUxFVE9SUyBhbmQgYXBwZW5kIGRvdCBtYW51YWxseSlcbiovXG5leHBvcnQgY29uc3QgQ0xBU1NOQU1FUyA9IHtcbiAgICBDT05UQUlORVI6ICdzZHAtY29udGFpbmVyJyxcbiAgICBOQVZfQlROOiAnanMtc2RwLW5hdl9fYnRuJyxcbiAgICBCVE5fREVGQVVMVDogJ3NkcC1kYXktYnRuJyxcbiAgICBNT05USF9DT05UQUlORVI6ICdqcy1zZHBfX21vbnRoJ1xufTtcblxuZXhwb3J0IGNvbnN0IFNFTEVDVE9SUyA9IHtcbiAgICBCVE5fREVGQVVMVDogJy5zZHAtZGF5LWJ0bicsXG4gICAgQlROX0FDVElWRTogJy5zZHAtZGF5LWJ0bi0taXMtYWN0aXZlJyxcbiAgICBCVE5fVE9EQVk6ICcuc2RwLWRheS1idG4tLWlzLXRvZGF5JyxcbiAgICBCVE5fRU5BQkxFRDogJy5zZHAtZGF5LWJvZHk6bm90KC5zZHAtZGF5LWRpc2FibGVkKScsXG4gICAgTU9OVEhfQ09OVEFJTkVSOiAnLmpzLXNkcF9fbW9udGgnLFxufTtcblxuZXhwb3J0IGNvbnN0IERBVEFfQVRUUklCVVRFUyA9IHtcbiAgICBBQ1RJT046ICdkYXRhLWFjdGlvbicsXG4gICAgTU9ERUxfSU5ERVg6ICdkYXRhLW1vZGVsLWluZGV4JyxcbiAgICBEQVk6ICdkYXRhLWRheSdcbn07IiwiZXhwb3J0IGRlZmF1bHQge1xuXHRjYWxsYmFjazogbnVsbCxcblx0c3RhcnRPcGVuOiBmYWxzZSxcblx0c3RhcnREYXRlOiBmYWxzZSxcblx0Ly8gY2xvc2VPblNlbGVjdDogZmFsc2UsXG5cdGRpc3BsYXlGb3JtYXQ6ICdkZGRkIE1NTU0gRCwgWVlZWScsIC8vVGh1cnNkYXkgSmFudWFyeSAxMiwgMjAxN1xuXHR2YWx1ZUZvcm1hdDogJ0REL01NL1lZWVknXG59OyIsImltcG9ydCB7IENMQVNTTkFNRVMgfSBmcm9tICcuL2NvbnN0YW50cyc7XG5pbXBvcnQgeyBkYXlOYW1lcywgbW9udGhOYW1lcyB9IGZyb20gJy4vdXRpbHMnO1xuXG5leHBvcnQgY29uc3QgY2FsZW5kYXIgPSBwcm9wcyA9PiBgPGRpdiBjbGFzcz1cInNkcC1kYXRlXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz1cIiR7Q0xBU1NOQU1FUy5OQVZfQlROfSBzZHAtYmFja1wiIHR5cGU9XCJidXR0b25cIiBkYXRhLWFjdGlvbj1cIi0xXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzdmcgY2xhc3M9XCJzZHAtYnRuX19pY29uXCIgd2lkdGg9XCIxOVwiIGhlaWdodD1cIjE5XCIgdmlld0JveD1cIjAgMCAxMDAwIDEwMDBcIj48cGF0aCBkPVwiTTMzNi4yIDI3NC41bC0yMTAuMSAyMTBoODA1LjRjMTMgMCAyMyAxMCAyMyAyM3MtMTAgMjMtMjMgMjNIMTI2LjFsMjEwLjEgMjEwLjFjMTEgMTEgMTEgMjEgMCAzMi01IDUtMTAgNy0xNiA3cy0xMS0yLTE2LTdsLTI0OS4xLTI0OWMtMTEtMTEtMTEtMjEgMC0zMmwyNDkuMS0yNDkuMWMyMS0yMS4xIDUzIDEwLjkgMzIgMzJ6XCI+PC9wYXRoPjwvc3ZnPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxidXR0b24gY2xhc3M9XCIke0NMQVNTTkFNRVMuTkFWX0JUTn0gc2RwLW5leHRcIiB0eXBlPVwiYnV0dG9uXCIgZGF0YS1hY3Rpb249XCIxXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzdmcgY2xhc3M9XCJzZHAtYnRuX19pY29uXCIgd2lkdGg9XCIxOVwiIGhlaWdodD1cIjE5XCIgdmlld0JveD1cIjAgMCAxMDAwIDEwMDBcIj48cGF0aCBkPVwiTTY5NC40IDI0Mi40bDI0OS4xIDI0OS4xYzExIDExIDExIDIxIDAgMzJMNjk0LjQgNzcyLjdjLTUgNS0xMCA3LTE2IDdzLTExLTItMTYtN2MtMTEtMTEtMTEtMjEgMC0zMmwyMTAuMS0yMTAuMUg2Ny4xYy0xMyAwLTIzLTEwLTIzLTIzczEwLTIzIDIzLTIzaDgwNS40TDY2Mi40IDI3NC41Yy0yMS0yMS4xIDExLTUzLjEgMzItMzIuMXpcIj48L3BhdGg+PC9zdmc+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cIiR7Q0xBU1NOQU1FUy5NT05USF9DT05UQUlORVJ9XCI+PC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5gO1xuXG5leHBvcnQgY29uc3QgbW9udGggPSBwcm9wcyA9PiBgPGRpdiBjbGFzcz1cInNkcC1tb250aC1sYWJlbFwiPiR7cHJvcHMubW9udGhUaXRsZX0gJHtwcm9wcy55ZWFyVGl0bGV9PC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICA8dGFibGUgY2xhc3M9XCJzZHAtZGF5c1wiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0aGVhZCBjbGFzcz1cInNkcC1kYXlzLWhlYWRcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRyIGNsYXNzPVwic2RwLWRheXMtcm93XCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGggY2xhc3M9XCJzZHAtZGF5LWhlYWRcIj5NbzwvdGg+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGggY2xhc3M9XCJzZHAtZGF5LWhlYWRcIj5UdTwvdGg+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGggY2xhc3M9XCJzZHAtZGF5LWhlYWRcIj5XZTwvdGg+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGggY2xhc3M9XCJzZHAtZGF5LWhlYWRcIj5UaDwvdGg+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGggY2xhc3M9XCJzZHAtZGF5LWhlYWRcIj5GcjwvdGg+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGggY2xhc3M9XCJzZHAtZGF5LWhlYWRcIj5TYTwvdGg+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGggY2xhc3M9XCJzZHAtZGF5LWhlYWRcIj5TdTwvdGg+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvdHI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC90aGVhZD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGJvZHkgY2xhc3M9XCJzZHAtZGF5cy1ib2R5XCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICR7cHJvcHMubW9kZWwubWFwKHdlZWtzKHByb3BzLmFjdGl2ZSkpLmpvaW4oJycpfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvdGJvZHk+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L3RhYmxlPmA7XG5cbmNvbnN0IGRheSA9IChhY3RpdmVEYXlzLCBwcm9wcywgaSkgPT4gYDx0ZCBjbGFzcz1cInNkcC1kYXktYm9keSR7cHJvcHMubmV4dE1vbnRoID8gJyBzZHAtZGF5LW5leHQtbW9udGggc2RwLWRheS1kaXNhYmxlZCcgOiAnJ30ke3Byb3BzLnByZXZpb3VzTW9udGggPyAnIHNkcC1kYXktcHJldi1tb250aCBzZHAtZGF5LWRpc2FibGVkJyA6ICcnfSR7cHJvcHMuYWN0aXZlID8gJyBzZHAtZGF5LXNlbGVjdGVkJyA6ICcnfVwiPjxidXR0b24gdGFiaW5kZXg9XCIke3Byb3BzLmlzU3RhcnREYXRlID8gMCA6IHByb3BzLmlzVG9kYXkgPyAwIDogLTF9XCIgY2xhc3M9XCJzZHAtZGF5LWJ0biR7cHJvcHMuaXNUb2RheSA/ICcgc2RwLWRheS1idG4tLWlzLXRvZGF5JyA6ICcnfSR7cHJvcHMuaXNTdGFydERhdGUgPyAnIHNkcC1kYXktYnRuLS1pcy1hY3RpdmUnIDogJyd9XCIgcm9sZT1cImJ1dHRvblwiIGRhdGEtZGF5PVwiJHtwcm9wcy5udW1iZXJ9XCIgZGF0YS1tb2RlbC1pbmRleD1cIiR7aX1cIiBhcmlhLWxhYmVsPVwiJHtwcm9wcy5pc1RvZGF5ID8gJ1RvZGF5LCAnIDogJyd9JHtkYXlOYW1lc1twcm9wcy5kYXRlLmdldERheSgpXX0sICR7bW9udGhOYW1lc1twcm9wcy5kYXRlLmdldE1vbnRoKCldfSAke3Byb3BzLmRhdGUuZ2V0RGF0ZSgpfSwgJHtwcm9wcy5kYXRlLmdldEZ1bGxZZWFyKCl9XCIke3Byb3BzLnByZXZpb3VzTW9udGggfHwgcHJvcHMubmV4dE1vbnRoID8gXCIgZGlzYWJsZWRcIiA6IFwiXCJ9PiR7cHJvcHMubnVtYmVyfTwvYnV0dG9uPjwvdGQ+YDtcblxuY29uc3Qgd2Vla3MgPSBhY3RpdmVEYXlzID0+IChwcm9wcywgaSwgYXJyKSA9PiB7XG4gICAgaWYoaSA9PT0gMCkgcmV0dXJuIGA8dHIgY2xhc3M9XCJzZHAtZGF5cy1yb3dcIj4ke2RheShhY3RpdmVEYXlzLCBwcm9wcywgaSl9YDtcbiAgICBlbHNlIGlmIChpID09PSBhcnIubGVuZ3RoIC0gMSkgcmV0dXJuIGAke2RheShhY3RpdmVEYXlzLCBwcm9wcywgaSl9PC90cj5gO1xuICAgIGVsc2UgaWYoKGkrMSkgJSA3ID09PSAwKSByZXR1cm4gYCR7ZGF5KGFjdGl2ZURheXMsIHByb3BzLCBpKX08L3RyPjx0ciBjbGFzcz1cInNkcC1kYXlzLXJvd1wiPmA7XG4gICAgZWxzZSByZXR1cm4gZGF5KGFjdGl2ZURheXMsIHByb3BzLCBpKTtcbn07IiwiaW1wb3J0IGZlY2hhIGZyb20gJ2ZlY2hhJztcblxuZXhwb3J0IGNvbnN0IHBhcnNlRGF0ZSA9IGZlY2hhLnBhcnNlO1xuXG5leHBvcnQgY29uc3QgZm9ybWF0RGF0ZSA9IGZlY2hhLmZvcm1hdDtcblxuZXhwb3J0IGNvbnN0IG1vbnRoTmFtZXMgPSBbJ0phbnVhcnknLCAnRmVicnVhcnknLCAnTWFyY2gnLCAnQXByaWwnLCAnTWF5JywgJ0p1bmUnLCAnSnVseScsICdBdWd1c3QnLCAnU2VwdGVtYmVyJywgJ09jdG9iZXInLCAnTm92ZW1iZXInLCAnRGVjZW1iZXInXTtcblxuZXhwb3J0IGNvbnN0IGRheU5hbWVzID0gWydTdW5kYXknLCdNb25kYXknLCdUdWVzZGF5JywnV2VkbmVzZGF5JywnVGh1cnNkYXknLCdGcmlkYXknLCdTYXR1cmRheSddO1xuXG5leHBvcnQgY29uc3QgY2F0Y2hCdWJibGUgPSBlID0+IHtcbiAgICBlLnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpO1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcbn07XG5cbmV4cG9ydCBjb25zdCBnZXRNb250aExlbmd0aCA9ICh5ZWFyLCBtb250aCkgPT4gbmV3IERhdGUoeWVhciwgKG1vbnRoICsgMSksIDApLmdldERhdGUoKTtcblxuY29uc3QgaXNUb2RheSA9IGNhbmRpZGF0ZSA9PiB7XG4gICAgbGV0IHRvZGF5ID0gbmV3IERhdGUoKTtcbiAgICB0b2RheS5zZXRIb3VycygwLDAsMCwwKTtcbiAgICByZXR1cm4gY2FuZGlkYXRlLmdldFRpbWUoKSA9PT0gdG9kYXkuZ2V0VGltZSgpO1xufTtcblxuY29uc3QgaXNTdGFydERhdGUgPSAoc3RhcnREYXRlLCBjYW5kaWRhdGUpID0+IHN0YXJ0RGF0ZS5nZXRUaW1lKCkgPT09IGNhbmRpZGF0ZS5nZXRUaW1lKCk7XG5cbmNvbnN0IG1vbnRoTW9kZWwgPSAoeWVhciwgbW9udGgsIHN0YXJ0RGF0ZSkgPT4ge1xuICAgIGxldCB0aGVNb250aCA9IG5ldyBEYXRlKHllYXIsIG1vbnRoICsgMSwgMCksXG4gICAgICAgIHRvdGFsRGF5cyA9IHRoZU1vbnRoLmdldERhdGUoKSxcbiAgICAgICAgZW5kRGF5ID0gdGhlTW9udGguZ2V0RGF5KCksXG4gICAgICAgIHN0YXJ0RGF5LFxuICAgICAgICBwcmV2TW9udGhTdGFydERheSA9IGZhbHNlLFxuICAgICAgICBwcmV2TW9udGggPSBuZXcgRGF0ZSh5ZWFyLCBtb250aCwgMCksXG4gICAgICAgIHByZXZNb250aEVuZERheSA9IHByZXZNb250aC5nZXREYXRlKCksXG4gICAgICAgIG91dHB1dCA9IFtdO1xuXG4gICAgdGhlTW9udGguc2V0RGF0ZSgxKTtcbiAgICBzdGFydERheSA9IHRoZU1vbnRoLmdldERheSgpO1xuICAgIFxuICAgIGlmKHN0YXJ0RGF5ICE9PSAxKSB7XG4gICAgICAgIGlmKHN0YXJ0RGF5ID09PSAwKSBwcmV2TW9udGhTdGFydERheSA9IHByZXZNb250aC5nZXREYXRlKCkgLSA1O1xuICAgICAgICBlbHNlIHByZXZNb250aFN0YXJ0RGF5ID0gcHJldk1vbnRoLmdldERhdGUoKSAtIChzdGFydERheSAtIDIpO1xuICAgIH1cblxuICAgIGlmKHByZXZNb250aFN0YXJ0RGF5KXtcbiAgICAgICAgd2hpbGUocHJldk1vbnRoU3RhcnREYXkgPD0gcHJldk1vbnRoRW5kRGF5KXtcbiAgICAgICAgICAgIGxldCB0bXBEYXRlID0gbmV3IERhdGUocHJldk1vbnRoLmdldEZ1bGxZZWFyKCksIHByZXZNb250aC5nZXRNb250aCgpLCBwcmV2TW9udGhTdGFydERheSk7XG4gICAgICAgICAgICBvdXRwdXQucHVzaCh7XG4gICAgICAgICAgICAgICAgbnVtYmVyOiBwcmV2TW9udGhTdGFydERheSxcbiAgICAgICAgICAgICAgICBwcmV2aW91c01vbnRoOiB0cnVlLFxuICAgICAgICAgICAgICAgIGlzVG9kYXk6IGlzVG9kYXkodG1wRGF0ZSksXG4gICAgICAgICAgICAgICAgaXNTdGFydERhdGU6IHN0YXJ0RGF0ZSAmJiBpc1N0YXJ0RGF0ZShzdGFydERhdGUsIHRtcERhdGUpIHx8IGZhbHNlLFxuXHRcdFx0XHRkYXRlOiB0bXBEYXRlXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHByZXZNb250aFN0YXJ0RGF5Kys7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZm9yKGxldCBpID0gMTsgaSA8PSB0b3RhbERheXM7IGkrKykge1xuICAgICAgICBsZXQgdG1wRGF0ZSA9IG5ldyBEYXRlKHllYXIsIG1vbnRoLCBpKTtcbiAgICAgICAgb3V0cHV0LnB1c2goeyBcbiAgICAgICAgICAgIG51bWJlcjogaSxcbiAgICAgICAgICAgIGRhdGU6IHRtcERhdGUsXG4gICAgICAgICAgICBpc1N0YXJ0RGF0ZTogc3RhcnREYXRlICYmIGlzU3RhcnREYXRlKHN0YXJ0RGF0ZSwgdG1wRGF0ZSkgfHwgZmFsc2UsXG4gICAgICAgICAgICBpc1RvZGF5OiBpc1RvZGF5KHRtcERhdGUpXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBpZihlbmREYXkgIT09IDApIGZvcihsZXQgaSA9IDE7IGkgPD0gKDcgLSBlbmREYXkpOyBpKyspIHtcbiAgICAgICAgbGV0IHRtcERhdGUgPSBuZXcgRGF0ZSh5ZWFyLCBtb250aCArIDEsIGkpO1xuICAgICAgICBvdXRwdXQucHVzaCh7IFxuICAgICAgICAgICAgbnVtYmVyOiBpLFxuICAgICAgICAgICAgbmV4dE1vbnRoOiB0cnVlLFxuICAgICAgICAgICAgZGF0ZTogdG1wRGF0ZSxcbiAgICAgICAgICAgIGlzU3RhcnREYXRlOiBzdGFydERhdGUgJiYgaXNTdGFydERhdGUoc3RhcnREYXRlLCB0bXBEYXRlKSB8fCBmYWxzZSxcbiAgICAgICAgICAgIGlzVG9kYXk6IGlzVG9kYXkodG1wRGF0ZSlcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiBvdXRwdXQ7XG59O1xuXG5leHBvcnQgY29uc3QgbW9udGhWaWV3RmFjdG9yeSA9IChyb290RGF0ZSwgc3RhcnREYXRlKSA9PiAoe1xuXHRtb2RlbDogbW9udGhNb2RlbChyb290RGF0ZS5nZXRGdWxsWWVhcigpLCByb290RGF0ZS5nZXRNb250aCgpLCBzdGFydERhdGUpLFxuXHRtb250aFRpdGxlOiBtb250aE5hbWVzW3Jvb3REYXRlLmdldE1vbnRoKCldLFxuXHR5ZWFyVGl0bGU6IHJvb3REYXRlLmdldEZ1bGxZZWFyKClcbn0pO1xuXG5leHBvcnQgY29uc3QgZWxlbWVudEZhY3RvcnkgPSAodHlwZSwgYXR0cmlidXRlcyA9IHt9LCBjbGFzc05hbWUpID0+IHtcbiAgICBsZXQgZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KHR5cGUpO1xuXG4gICAgZm9yKGxldCBwcm9wIGluIGF0dHJpYnV0ZXMpIGVsLnNldEF0dHJpYnV0ZShwcm9wLCBhdHRyaWJ1dGVzW3Byb3BdKTtcbiAgICBpZihjbGFzc05hbWUpIGVsLmNsYXNzTmFtZSA9IGNsYXNzTmFtZTtcblxuICAgIHJldHVybiBlbDtcbn07XG5cbmNvbnN0IGZvY3VzYWJsZUVsZW1lbnRzID0gWydhW2hyZWZdJywgJ2FyZWFbaHJlZl0nLCAnaW5wdXQ6bm90KFtkaXNhYmxlZF0pJywgJ3NlbGVjdDpub3QoW2Rpc2FibGVkXSknLCAndGV4dGFyZWE6bm90KFtkaXNhYmxlZF0pJywgJ2J1dHRvbjpub3QoW2Rpc2FibGVkXSknLCAnaWZyYW1lJywgJ29iamVjdCcsICdlbWJlZCcsICdbY29udGVudGVkaXRhYmxlXScsICdbdGFiaW5kZXhdOm5vdChbdGFiaW5kZXg9XCItMVwiXSknXTtcblxuZXhwb3J0IGNvbnN0IGdldEZvY3VzYWJsZUNoaWxkcmVuID0gbm9kZSA9PiBbXS5zbGljZS5jYWxsKG5vZGUucXVlcnlTZWxlY3RvckFsbChmb2N1c2FibGVFbGVtZW50cy5qb2luKCcsJykpKS5maWx0ZXIoY2hpbGQgPT4gISEoY2hpbGQub2Zmc2V0V2lkdGggfHwgY2hpbGQub2Zmc2V0SGVpZ2h0IHx8IGNoaWxkLmdldENsaWVudFJlY3RzKCkubGVuZ3RoKSk7IiwiKGZ1bmN0aW9uIChtYWluKSB7XG4gICd1c2Ugc3RyaWN0JztcblxuICAvKipcbiAgICogUGFyc2Ugb3IgZm9ybWF0IGRhdGVzXG4gICAqIEBjbGFzcyBmZWNoYVxuICAgKi9cbiAgdmFyIGZlY2hhID0ge307XG4gIHZhciB0b2tlbiA9IC9kezEsNH18TXsxLDR9fFlZKD86WVkpP3xTezEsM318RG98Wlp8KFtIaE1zRG1dKVxcMT98W2FBXXxcIlteXCJdKlwifCdbXiddKicvZztcbiAgdmFyIHR3b0RpZ2l0cyA9IC9cXGRcXGQ/LztcbiAgdmFyIHRocmVlRGlnaXRzID0gL1xcZHszfS87XG4gIHZhciBmb3VyRGlnaXRzID0gL1xcZHs0fS87XG4gIHZhciB3b3JkID0gL1swLTldKlsnYS16XFx1MDBBMC1cXHUwNUZGXFx1MDcwMC1cXHVEN0ZGXFx1RjkwMC1cXHVGRENGXFx1RkRGMC1cXHVGRkVGXSt8W1xcdTA2MDAtXFx1MDZGRlxcL10rKFxccyo/W1xcdTA2MDAtXFx1MDZGRl0rKXsxLDJ9L2k7XG4gIHZhciBsaXRlcmFsID0gL1xcWyhbXl0qPylcXF0vZ207XG4gIHZhciBub29wID0gZnVuY3Rpb24gKCkge1xuICB9O1xuXG4gIGZ1bmN0aW9uIHNob3J0ZW4oYXJyLCBzTGVuKSB7XG4gICAgdmFyIG5ld0FyciA9IFtdO1xuICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSBhcnIubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgIG5ld0Fyci5wdXNoKGFycltpXS5zdWJzdHIoMCwgc0xlbikpO1xuICAgIH1cbiAgICByZXR1cm4gbmV3QXJyO1xuICB9XG5cbiAgZnVuY3Rpb24gbW9udGhVcGRhdGUoYXJyTmFtZSkge1xuICAgIHJldHVybiBmdW5jdGlvbiAoZCwgdiwgaTE4bikge1xuICAgICAgdmFyIGluZGV4ID0gaTE4blthcnJOYW1lXS5pbmRleE9mKHYuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyB2LnN1YnN0cigxKS50b0xvd2VyQ2FzZSgpKTtcbiAgICAgIGlmICh+aW5kZXgpIHtcbiAgICAgICAgZC5tb250aCA9IGluZGV4O1xuICAgICAgfVxuICAgIH07XG4gIH1cblxuICBmdW5jdGlvbiBwYWQodmFsLCBsZW4pIHtcbiAgICB2YWwgPSBTdHJpbmcodmFsKTtcbiAgICBsZW4gPSBsZW4gfHwgMjtcbiAgICB3aGlsZSAodmFsLmxlbmd0aCA8IGxlbikge1xuICAgICAgdmFsID0gJzAnICsgdmFsO1xuICAgIH1cbiAgICByZXR1cm4gdmFsO1xuICB9XG5cbiAgdmFyIGRheU5hbWVzID0gWydTdW5kYXknLCAnTW9uZGF5JywgJ1R1ZXNkYXknLCAnV2VkbmVzZGF5JywgJ1RodXJzZGF5JywgJ0ZyaWRheScsICdTYXR1cmRheSddO1xuICB2YXIgbW9udGhOYW1lcyA9IFsnSmFudWFyeScsICdGZWJydWFyeScsICdNYXJjaCcsICdBcHJpbCcsICdNYXknLCAnSnVuZScsICdKdWx5JywgJ0F1Z3VzdCcsICdTZXB0ZW1iZXInLCAnT2N0b2JlcicsICdOb3ZlbWJlcicsICdEZWNlbWJlciddO1xuICB2YXIgbW9udGhOYW1lc1Nob3J0ID0gc2hvcnRlbihtb250aE5hbWVzLCAzKTtcbiAgdmFyIGRheU5hbWVzU2hvcnQgPSBzaG9ydGVuKGRheU5hbWVzLCAzKTtcbiAgZmVjaGEuaTE4biA9IHtcbiAgICBkYXlOYW1lc1Nob3J0OiBkYXlOYW1lc1Nob3J0LFxuICAgIGRheU5hbWVzOiBkYXlOYW1lcyxcbiAgICBtb250aE5hbWVzU2hvcnQ6IG1vbnRoTmFtZXNTaG9ydCxcbiAgICBtb250aE5hbWVzOiBtb250aE5hbWVzLFxuICAgIGFtUG06IFsnYW0nLCAncG0nXSxcbiAgICBEb0ZuOiBmdW5jdGlvbiBEb0ZuKEQpIHtcbiAgICAgIHJldHVybiBEICsgWyd0aCcsICdzdCcsICduZCcsICdyZCddW0QgJSAxMCA+IDMgPyAwIDogKEQgLSBEICUgMTAgIT09IDEwKSAqIEQgJSAxMF07XG4gICAgfVxuICB9O1xuXG4gIHZhciBmb3JtYXRGbGFncyA9IHtcbiAgICBEOiBmdW5jdGlvbihkYXRlT2JqKSB7XG4gICAgICByZXR1cm4gZGF0ZU9iai5nZXREYXRlKCk7XG4gICAgfSxcbiAgICBERDogZnVuY3Rpb24oZGF0ZU9iaikge1xuICAgICAgcmV0dXJuIHBhZChkYXRlT2JqLmdldERhdGUoKSk7XG4gICAgfSxcbiAgICBEbzogZnVuY3Rpb24oZGF0ZU9iaiwgaTE4bikge1xuICAgICAgcmV0dXJuIGkxOG4uRG9GbihkYXRlT2JqLmdldERhdGUoKSk7XG4gICAgfSxcbiAgICBkOiBmdW5jdGlvbihkYXRlT2JqKSB7XG4gICAgICByZXR1cm4gZGF0ZU9iai5nZXREYXkoKTtcbiAgICB9LFxuICAgIGRkOiBmdW5jdGlvbihkYXRlT2JqKSB7XG4gICAgICByZXR1cm4gcGFkKGRhdGVPYmouZ2V0RGF5KCkpO1xuICAgIH0sXG4gICAgZGRkOiBmdW5jdGlvbihkYXRlT2JqLCBpMThuKSB7XG4gICAgICByZXR1cm4gaTE4bi5kYXlOYW1lc1Nob3J0W2RhdGVPYmouZ2V0RGF5KCldO1xuICAgIH0sXG4gICAgZGRkZDogZnVuY3Rpb24oZGF0ZU9iaiwgaTE4bikge1xuICAgICAgcmV0dXJuIGkxOG4uZGF5TmFtZXNbZGF0ZU9iai5nZXREYXkoKV07XG4gICAgfSxcbiAgICBNOiBmdW5jdGlvbihkYXRlT2JqKSB7XG4gICAgICByZXR1cm4gZGF0ZU9iai5nZXRNb250aCgpICsgMTtcbiAgICB9LFxuICAgIE1NOiBmdW5jdGlvbihkYXRlT2JqKSB7XG4gICAgICByZXR1cm4gcGFkKGRhdGVPYmouZ2V0TW9udGgoKSArIDEpO1xuICAgIH0sXG4gICAgTU1NOiBmdW5jdGlvbihkYXRlT2JqLCBpMThuKSB7XG4gICAgICByZXR1cm4gaTE4bi5tb250aE5hbWVzU2hvcnRbZGF0ZU9iai5nZXRNb250aCgpXTtcbiAgICB9LFxuICAgIE1NTU06IGZ1bmN0aW9uKGRhdGVPYmosIGkxOG4pIHtcbiAgICAgIHJldHVybiBpMThuLm1vbnRoTmFtZXNbZGF0ZU9iai5nZXRNb250aCgpXTtcbiAgICB9LFxuICAgIFlZOiBmdW5jdGlvbihkYXRlT2JqKSB7XG4gICAgICByZXR1cm4gU3RyaW5nKGRhdGVPYmouZ2V0RnVsbFllYXIoKSkuc3Vic3RyKDIpO1xuICAgIH0sXG4gICAgWVlZWTogZnVuY3Rpb24oZGF0ZU9iaikge1xuICAgICAgcmV0dXJuIGRhdGVPYmouZ2V0RnVsbFllYXIoKTtcbiAgICB9LFxuICAgIGg6IGZ1bmN0aW9uKGRhdGVPYmopIHtcbiAgICAgIHJldHVybiBkYXRlT2JqLmdldEhvdXJzKCkgJSAxMiB8fCAxMjtcbiAgICB9LFxuICAgIGhoOiBmdW5jdGlvbihkYXRlT2JqKSB7XG4gICAgICByZXR1cm4gcGFkKGRhdGVPYmouZ2V0SG91cnMoKSAlIDEyIHx8IDEyKTtcbiAgICB9LFxuICAgIEg6IGZ1bmN0aW9uKGRhdGVPYmopIHtcbiAgICAgIHJldHVybiBkYXRlT2JqLmdldEhvdXJzKCk7XG4gICAgfSxcbiAgICBISDogZnVuY3Rpb24oZGF0ZU9iaikge1xuICAgICAgcmV0dXJuIHBhZChkYXRlT2JqLmdldEhvdXJzKCkpO1xuICAgIH0sXG4gICAgbTogZnVuY3Rpb24oZGF0ZU9iaikge1xuICAgICAgcmV0dXJuIGRhdGVPYmouZ2V0TWludXRlcygpO1xuICAgIH0sXG4gICAgbW06IGZ1bmN0aW9uKGRhdGVPYmopIHtcbiAgICAgIHJldHVybiBwYWQoZGF0ZU9iai5nZXRNaW51dGVzKCkpO1xuICAgIH0sXG4gICAgczogZnVuY3Rpb24oZGF0ZU9iaikge1xuICAgICAgcmV0dXJuIGRhdGVPYmouZ2V0U2Vjb25kcygpO1xuICAgIH0sXG4gICAgc3M6IGZ1bmN0aW9uKGRhdGVPYmopIHtcbiAgICAgIHJldHVybiBwYWQoZGF0ZU9iai5nZXRTZWNvbmRzKCkpO1xuICAgIH0sXG4gICAgUzogZnVuY3Rpb24oZGF0ZU9iaikge1xuICAgICAgcmV0dXJuIE1hdGgucm91bmQoZGF0ZU9iai5nZXRNaWxsaXNlY29uZHMoKSAvIDEwMCk7XG4gICAgfSxcbiAgICBTUzogZnVuY3Rpb24oZGF0ZU9iaikge1xuICAgICAgcmV0dXJuIHBhZChNYXRoLnJvdW5kKGRhdGVPYmouZ2V0TWlsbGlzZWNvbmRzKCkgLyAxMCksIDIpO1xuICAgIH0sXG4gICAgU1NTOiBmdW5jdGlvbihkYXRlT2JqKSB7XG4gICAgICByZXR1cm4gcGFkKGRhdGVPYmouZ2V0TWlsbGlzZWNvbmRzKCksIDMpO1xuICAgIH0sXG4gICAgYTogZnVuY3Rpb24oZGF0ZU9iaiwgaTE4bikge1xuICAgICAgcmV0dXJuIGRhdGVPYmouZ2V0SG91cnMoKSA8IDEyID8gaTE4bi5hbVBtWzBdIDogaTE4bi5hbVBtWzFdO1xuICAgIH0sXG4gICAgQTogZnVuY3Rpb24oZGF0ZU9iaiwgaTE4bikge1xuICAgICAgcmV0dXJuIGRhdGVPYmouZ2V0SG91cnMoKSA8IDEyID8gaTE4bi5hbVBtWzBdLnRvVXBwZXJDYXNlKCkgOiBpMThuLmFtUG1bMV0udG9VcHBlckNhc2UoKTtcbiAgICB9LFxuICAgIFpaOiBmdW5jdGlvbihkYXRlT2JqKSB7XG4gICAgICB2YXIgbyA9IGRhdGVPYmouZ2V0VGltZXpvbmVPZmZzZXQoKTtcbiAgICAgIHJldHVybiAobyA+IDAgPyAnLScgOiAnKycpICsgcGFkKE1hdGguZmxvb3IoTWF0aC5hYnMobykgLyA2MCkgKiAxMDAgKyBNYXRoLmFicyhvKSAlIDYwLCA0KTtcbiAgICB9XG4gIH07XG5cbiAgdmFyIHBhcnNlRmxhZ3MgPSB7XG4gICAgRDogW3R3b0RpZ2l0cywgZnVuY3Rpb24gKGQsIHYpIHtcbiAgICAgIGQuZGF5ID0gdjtcbiAgICB9XSxcbiAgICBEbzogW25ldyBSZWdFeHAodHdvRGlnaXRzLnNvdXJjZSArIHdvcmQuc291cmNlKSwgZnVuY3Rpb24gKGQsIHYpIHtcbiAgICAgIGQuZGF5ID0gcGFyc2VJbnQodiwgMTApO1xuICAgIH1dLFxuICAgIE06IFt0d29EaWdpdHMsIGZ1bmN0aW9uIChkLCB2KSB7XG4gICAgICBkLm1vbnRoID0gdiAtIDE7XG4gICAgfV0sXG4gICAgWVk6IFt0d29EaWdpdHMsIGZ1bmN0aW9uIChkLCB2KSB7XG4gICAgICB2YXIgZGEgPSBuZXcgRGF0ZSgpLCBjZW50ID0gKygnJyArIGRhLmdldEZ1bGxZZWFyKCkpLnN1YnN0cigwLCAyKTtcbiAgICAgIGQueWVhciA9ICcnICsgKHYgPiA2OCA/IGNlbnQgLSAxIDogY2VudCkgKyB2O1xuICAgIH1dLFxuICAgIGg6IFt0d29EaWdpdHMsIGZ1bmN0aW9uIChkLCB2KSB7XG4gICAgICBkLmhvdXIgPSB2O1xuICAgIH1dLFxuICAgIG06IFt0d29EaWdpdHMsIGZ1bmN0aW9uIChkLCB2KSB7XG4gICAgICBkLm1pbnV0ZSA9IHY7XG4gICAgfV0sXG4gICAgczogW3R3b0RpZ2l0cywgZnVuY3Rpb24gKGQsIHYpIHtcbiAgICAgIGQuc2Vjb25kID0gdjtcbiAgICB9XSxcbiAgICBZWVlZOiBbZm91ckRpZ2l0cywgZnVuY3Rpb24gKGQsIHYpIHtcbiAgICAgIGQueWVhciA9IHY7XG4gICAgfV0sXG4gICAgUzogWy9cXGQvLCBmdW5jdGlvbiAoZCwgdikge1xuICAgICAgZC5taWxsaXNlY29uZCA9IHYgKiAxMDA7XG4gICAgfV0sXG4gICAgU1M6IFsvXFxkezJ9LywgZnVuY3Rpb24gKGQsIHYpIHtcbiAgICAgIGQubWlsbGlzZWNvbmQgPSB2ICogMTA7XG4gICAgfV0sXG4gICAgU1NTOiBbdGhyZWVEaWdpdHMsIGZ1bmN0aW9uIChkLCB2KSB7XG4gICAgICBkLm1pbGxpc2Vjb25kID0gdjtcbiAgICB9XSxcbiAgICBkOiBbdHdvRGlnaXRzLCBub29wXSxcbiAgICBkZGQ6IFt3b3JkLCBub29wXSxcbiAgICBNTU06IFt3b3JkLCBtb250aFVwZGF0ZSgnbW9udGhOYW1lc1Nob3J0JyldLFxuICAgIE1NTU06IFt3b3JkLCBtb250aFVwZGF0ZSgnbW9udGhOYW1lcycpXSxcbiAgICBhOiBbd29yZCwgZnVuY3Rpb24gKGQsIHYsIGkxOG4pIHtcbiAgICAgIHZhciB2YWwgPSB2LnRvTG93ZXJDYXNlKCk7XG4gICAgICBpZiAodmFsID09PSBpMThuLmFtUG1bMF0pIHtcbiAgICAgICAgZC5pc1BtID0gZmFsc2U7XG4gICAgICB9IGVsc2UgaWYgKHZhbCA9PT0gaTE4bi5hbVBtWzFdKSB7XG4gICAgICAgIGQuaXNQbSA9IHRydWU7XG4gICAgICB9XG4gICAgfV0sXG4gICAgWlo6IFsvKFtcXCtcXC1dXFxkXFxkOj9cXGRcXGR8WikvLCBmdW5jdGlvbiAoZCwgdikge1xuICAgICAgaWYgKHYgPT09ICdaJykgdiA9ICcrMDA6MDAnO1xuICAgICAgdmFyIHBhcnRzID0gKHYgKyAnJykubWF0Y2goLyhbXFwrXFwtXXxcXGRcXGQpL2dpKSwgbWludXRlcztcblxuICAgICAgaWYgKHBhcnRzKSB7XG4gICAgICAgIG1pbnV0ZXMgPSArKHBhcnRzWzFdICogNjApICsgcGFyc2VJbnQocGFydHNbMl0sIDEwKTtcbiAgICAgICAgZC50aW1lem9uZU9mZnNldCA9IHBhcnRzWzBdID09PSAnKycgPyBtaW51dGVzIDogLW1pbnV0ZXM7XG4gICAgICB9XG4gICAgfV1cbiAgfTtcbiAgcGFyc2VGbGFncy5kZCA9IHBhcnNlRmxhZ3MuZDtcbiAgcGFyc2VGbGFncy5kZGRkID0gcGFyc2VGbGFncy5kZGQ7XG4gIHBhcnNlRmxhZ3MuREQgPSBwYXJzZUZsYWdzLkQ7XG4gIHBhcnNlRmxhZ3MubW0gPSBwYXJzZUZsYWdzLm07XG4gIHBhcnNlRmxhZ3MuaGggPSBwYXJzZUZsYWdzLkggPSBwYXJzZUZsYWdzLkhIID0gcGFyc2VGbGFncy5oO1xuICBwYXJzZUZsYWdzLk1NID0gcGFyc2VGbGFncy5NO1xuICBwYXJzZUZsYWdzLnNzID0gcGFyc2VGbGFncy5zO1xuICBwYXJzZUZsYWdzLkEgPSBwYXJzZUZsYWdzLmE7XG5cblxuICAvLyBTb21lIGNvbW1vbiBmb3JtYXQgc3RyaW5nc1xuICBmZWNoYS5tYXNrcyA9IHtcbiAgICBkZWZhdWx0OiAnZGRkIE1NTSBERCBZWVlZIEhIOm1tOnNzJyxcbiAgICBzaG9ydERhdGU6ICdNL0QvWVknLFxuICAgIG1lZGl1bURhdGU6ICdNTU0gRCwgWVlZWScsXG4gICAgbG9uZ0RhdGU6ICdNTU1NIEQsIFlZWVknLFxuICAgIGZ1bGxEYXRlOiAnZGRkZCwgTU1NTSBELCBZWVlZJyxcbiAgICBzaG9ydFRpbWU6ICdISDptbScsXG4gICAgbWVkaXVtVGltZTogJ0hIOm1tOnNzJyxcbiAgICBsb25nVGltZTogJ0hIOm1tOnNzLlNTUydcbiAgfTtcblxuICAvKioqXG4gICAqIEZvcm1hdCBhIGRhdGVcbiAgICogQG1ldGhvZCBmb3JtYXRcbiAgICogQHBhcmFtIHtEYXRlfG51bWJlcn0gZGF0ZU9ialxuICAgKiBAcGFyYW0ge3N0cmluZ30gbWFzayBGb3JtYXQgb2YgdGhlIGRhdGUsIGkuZS4gJ21tLWRkLXl5JyBvciAnc2hvcnREYXRlJ1xuICAgKi9cbiAgZmVjaGEuZm9ybWF0ID0gZnVuY3Rpb24gKGRhdGVPYmosIG1hc2ssIGkxOG5TZXR0aW5ncykge1xuICAgIHZhciBpMThuID0gaTE4blNldHRpbmdzIHx8IGZlY2hhLmkxOG47XG5cbiAgICBpZiAodHlwZW9mIGRhdGVPYmogPT09ICdudW1iZXInKSB7XG4gICAgICBkYXRlT2JqID0gbmV3IERhdGUoZGF0ZU9iaik7XG4gICAgfVxuXG4gICAgaWYgKE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChkYXRlT2JqKSAhPT0gJ1tvYmplY3QgRGF0ZV0nIHx8IGlzTmFOKGRhdGVPYmouZ2V0VGltZSgpKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIERhdGUgaW4gZmVjaGEuZm9ybWF0Jyk7XG4gICAgfVxuXG4gICAgbWFzayA9IGZlY2hhLm1hc2tzW21hc2tdIHx8IG1hc2sgfHwgZmVjaGEubWFza3NbJ2RlZmF1bHQnXTtcblxuICAgIHZhciBsaXRlcmFscyA9IFtdO1xuXG4gICAgLy8gTWFrZSBsaXRlcmFscyBpbmFjdGl2ZSBieSByZXBsYWNpbmcgdGhlbSB3aXRoID8/XG4gICAgbWFzayA9IG1hc2sucmVwbGFjZShsaXRlcmFsLCBmdW5jdGlvbigkMCwgJDEpIHtcbiAgICAgIGxpdGVyYWxzLnB1c2goJDEpO1xuICAgICAgcmV0dXJuICc/Pyc7XG4gICAgfSk7XG4gICAgLy8gQXBwbHkgZm9ybWF0dGluZyBydWxlc1xuICAgIG1hc2sgPSBtYXNrLnJlcGxhY2UodG9rZW4sIGZ1bmN0aW9uICgkMCkge1xuICAgICAgcmV0dXJuICQwIGluIGZvcm1hdEZsYWdzID8gZm9ybWF0RmxhZ3NbJDBdKGRhdGVPYmosIGkxOG4pIDogJDAuc2xpY2UoMSwgJDAubGVuZ3RoIC0gMSk7XG4gICAgfSk7XG4gICAgLy8gSW5saW5lIGxpdGVyYWwgdmFsdWVzIGJhY2sgaW50byB0aGUgZm9ybWF0dGVkIHZhbHVlXG4gICAgcmV0dXJuIG1hc2sucmVwbGFjZSgvXFw/XFw/L2csIGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIGxpdGVyYWxzLnNoaWZ0KCk7XG4gICAgfSk7XG4gIH07XG5cbiAgLyoqXG4gICAqIFBhcnNlIGEgZGF0ZSBzdHJpbmcgaW50byBhbiBvYmplY3QsIGNoYW5nZXMgLSBpbnRvIC9cbiAgICogQG1ldGhvZCBwYXJzZVxuICAgKiBAcGFyYW0ge3N0cmluZ30gZGF0ZVN0ciBEYXRlIHN0cmluZ1xuICAgKiBAcGFyYW0ge3N0cmluZ30gZm9ybWF0IERhdGUgcGFyc2UgZm9ybWF0XG4gICAqIEByZXR1cm5zIHtEYXRlfGJvb2xlYW59XG4gICAqL1xuICBmZWNoYS5wYXJzZSA9IGZ1bmN0aW9uIChkYXRlU3RyLCBmb3JtYXQsIGkxOG5TZXR0aW5ncykge1xuICAgIHZhciBpMThuID0gaTE4blNldHRpbmdzIHx8IGZlY2hhLmkxOG47XG5cbiAgICBpZiAodHlwZW9mIGZvcm1hdCAhPT0gJ3N0cmluZycpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBmb3JtYXQgaW4gZmVjaGEucGFyc2UnKTtcbiAgICB9XG5cbiAgICBmb3JtYXQgPSBmZWNoYS5tYXNrc1tmb3JtYXRdIHx8IGZvcm1hdDtcblxuICAgIC8vIEF2b2lkIHJlZ3VsYXIgZXhwcmVzc2lvbiBkZW5pYWwgb2Ygc2VydmljZSwgZmFpbCBlYXJseSBmb3IgcmVhbGx5IGxvbmcgc3RyaW5nc1xuICAgIC8vIGh0dHBzOi8vd3d3Lm93YXNwLm9yZy9pbmRleC5waHAvUmVndWxhcl9leHByZXNzaW9uX0RlbmlhbF9vZl9TZXJ2aWNlXy1fUmVEb1NcbiAgICBpZiAoZGF0ZVN0ci5sZW5ndGggPiAxMDAwKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgdmFyIGlzVmFsaWQgPSB0cnVlO1xuICAgIHZhciBkYXRlSW5mbyA9IHt9O1xuICAgIGZvcm1hdC5yZXBsYWNlKHRva2VuLCBmdW5jdGlvbiAoJDApIHtcbiAgICAgIGlmIChwYXJzZUZsYWdzWyQwXSkge1xuICAgICAgICB2YXIgaW5mbyA9IHBhcnNlRmxhZ3NbJDBdO1xuICAgICAgICB2YXIgaW5kZXggPSBkYXRlU3RyLnNlYXJjaChpbmZvWzBdKTtcbiAgICAgICAgaWYgKCF+aW5kZXgpIHtcbiAgICAgICAgICBpc1ZhbGlkID0gZmFsc2U7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZGF0ZVN0ci5yZXBsYWNlKGluZm9bMF0sIGZ1bmN0aW9uIChyZXN1bHQpIHtcbiAgICAgICAgICAgIGluZm9bMV0oZGF0ZUluZm8sIHJlc3VsdCwgaTE4bik7XG4gICAgICAgICAgICBkYXRlU3RyID0gZGF0ZVN0ci5zdWJzdHIoaW5kZXggKyByZXN1bHQubGVuZ3RoKTtcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHBhcnNlRmxhZ3NbJDBdID8gJycgOiAkMC5zbGljZSgxLCAkMC5sZW5ndGggLSAxKTtcbiAgICB9KTtcblxuICAgIGlmICghaXNWYWxpZCkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHZhciB0b2RheSA9IG5ldyBEYXRlKCk7XG4gICAgaWYgKGRhdGVJbmZvLmlzUG0gPT09IHRydWUgJiYgZGF0ZUluZm8uaG91ciAhPSBudWxsICYmICtkYXRlSW5mby5ob3VyICE9PSAxMikge1xuICAgICAgZGF0ZUluZm8uaG91ciA9ICtkYXRlSW5mby5ob3VyICsgMTI7XG4gICAgfSBlbHNlIGlmIChkYXRlSW5mby5pc1BtID09PSBmYWxzZSAmJiArZGF0ZUluZm8uaG91ciA9PT0gMTIpIHtcbiAgICAgIGRhdGVJbmZvLmhvdXIgPSAwO1xuICAgIH1cblxuICAgIHZhciBkYXRlO1xuICAgIGlmIChkYXRlSW5mby50aW1lem9uZU9mZnNldCAhPSBudWxsKSB7XG4gICAgICBkYXRlSW5mby5taW51dGUgPSArKGRhdGVJbmZvLm1pbnV0ZSB8fCAwKSAtICtkYXRlSW5mby50aW1lem9uZU9mZnNldDtcbiAgICAgIGRhdGUgPSBuZXcgRGF0ZShEYXRlLlVUQyhkYXRlSW5mby55ZWFyIHx8IHRvZGF5LmdldEZ1bGxZZWFyKCksIGRhdGVJbmZvLm1vbnRoIHx8IDAsIGRhdGVJbmZvLmRheSB8fCAxLFxuICAgICAgICBkYXRlSW5mby5ob3VyIHx8IDAsIGRhdGVJbmZvLm1pbnV0ZSB8fCAwLCBkYXRlSW5mby5zZWNvbmQgfHwgMCwgZGF0ZUluZm8ubWlsbGlzZWNvbmQgfHwgMCkpO1xuICAgIH0gZWxzZSB7XG4gICAgICBkYXRlID0gbmV3IERhdGUoZGF0ZUluZm8ueWVhciB8fCB0b2RheS5nZXRGdWxsWWVhcigpLCBkYXRlSW5mby5tb250aCB8fCAwLCBkYXRlSW5mby5kYXkgfHwgMSxcbiAgICAgICAgZGF0ZUluZm8uaG91ciB8fCAwLCBkYXRlSW5mby5taW51dGUgfHwgMCwgZGF0ZUluZm8uc2Vjb25kIHx8IDAsIGRhdGVJbmZvLm1pbGxpc2Vjb25kIHx8IDApO1xuICAgIH1cbiAgICByZXR1cm4gZGF0ZTtcbiAgfTtcblxuICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICBpZiAodHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcgJiYgbW9kdWxlLmV4cG9ydHMpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IGZlY2hhO1xuICB9IGVsc2UgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgIGRlZmluZShmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gZmVjaGE7XG4gICAgfSk7XG4gIH0gZWxzZSB7XG4gICAgbWFpbi5mZWNoYSA9IGZlY2hhO1xuICB9XG59KSh0aGlzKTtcbiJdfQ==
