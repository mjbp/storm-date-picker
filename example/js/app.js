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

	return els.map(function (el) {
		return Object.assign(Object.create(_componentPrototype2.default), {
			node: el,
			input: el.querySelector('input'),
			btn: el.querySelector('.btn'),
			settings: Object.assign({}, _defaults2.default, opts)
		}).init();
	});
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
		this.container = (0, _utils.elementFactory)('div', { 'role': 'dialog', 'aria-helptext': _constants.ARIA_HELP_TEXT }, 'sdp-container');
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
			if (e.target.classList.contains(_constants.CLASSNAMES.NAV_BTN) || e.target.parentNode.classList.contains(_constants.CLASSNAMES.NAV_BTN)) this.handleNav(+(e.target.getAttribute('data-action') || e.target.parentNode.getAttribute('data-action')));
			if (e.target.classList.contains(_constants.SELECTORS.BTN_DEFAULT)) this.selectDate(e);
		}
	},
	handleNav: function handleNav(action) {
		this.workingDate = new Date(this.workingDate.getFullYear(), this.workingDate.getMonth() + action);
		this.renderMonth();
	},
	handleKeyDown: function handleKeyDown(e) {
		var keyDownDictionary = {
			PAGE_UP: function PAGE_UP() {},
			//?
			PAGE_DOWN: function PAGE_DOWN() {},
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
				if (e.target.classList.contains('sdp-day-btn')) this.selectDate(e);
				if (e.target.classList.contains(_constants.CLASSNAMES.NAV_BTN)) this.handleNav(+e.target.getAttribute('data-action'));
			},
			ESCAPE: function ESCAPE() {
				this.close();
			},
			SPACE: function SPACE(e) {
				keyDownDictionary.ENTER(e);
			},
			LEFT: function LEFT(e) {
				(0, _utils.catchBubble)(e);
				if (!e.target.classList.contains('sdp-day-btn')) return;

				if (this.monthView.model[+e.target.getAttribute('data-model-index')].number === 1) {
					this.workingDate = new Date(this.workingDate.getFullYear(), this.workingDate.getMonth() - 1);
					this.renderMonth();
					[].slice.call(this.container.querySelectorAll('.sdp-day-body:not(.sdp-day-disabled)')).pop().firstElementChild.focus();
				} else this.container.querySelector('[data-model-index="' + (+e.target.getAttribute('data-model-index') - 1) + '"]').focus();
			},
			UP: function UP() {
				(0, _utils.catchBubble)(e);
				if (!e.target.classList.contains('sdp-day-btn')) return;

				var nextDayIndex = +e.target.getAttribute('data-model-index') - 7;

				if (+this.monthView.model[+e.target.getAttribute('data-model-index')].number - 7 < 1) {
					this.workingDate = new Date(this.workingDate.getFullYear(), this.workingDate.getMonth() - 1);
					this.renderMonth();
					//use this.workingDate instead of querying DOM?
					if (!this.container.querySelector('[data-model-index="' + (this.monthView.model.length + nextDayIndex) + '"]') || this.container.querySelector('[data-model-index="' + (this.monthView.model.length + nextDayIndex) + '"]') && this.container.querySelector('[data-model-index="' + (this.monthView.model.length + nextDayIndex) + '"]').hasAttribute('disabled')) this.container.querySelector('[data-model-index="' + (this.monthView.model.length + (nextDayIndex - 7)) + '"]').focus();else this.container.querySelector('[data-model-index="' + (this.monthView.model.length + nextDayIndex) + '"]').focus();
				} else this.container.querySelector('[data-model-index="' + nextDayIndex + '"]').focus();
			},
			RIGHT: function RIGHT(e) {
				(0, _utils.catchBubble)(e);
				if (!e.target.classList.contains('sdp-day-btn')) return;

				if (this.monthView.model[+e.target.getAttribute('data-model-index')].number === (0, _utils.getMonthLength)(this.monthView.model[+e.target.getAttribute('data-model-index')].date.getFullYear(), this.monthView.model[+e.target.getAttribute('data-model-index')].date.getMonth())) {
					this.workingDate = new Date(this.workingDate.getFullYear(), this.workingDate.getMonth() + 1);
					this.renderMonth();
					[].slice.call(this.container.querySelectorAll('.sdp-day-body:not(.sdp-day-disabled)')).shift().firstElementChild.focus();
				} else this.container.querySelector('[data-model-index="' + (+e.target.getAttribute('data-model-index') + 1) + '"]').focus();
			},
			DOWN: function DOWN() {
				(0, _utils.catchBubble)(e);
				if (!e.target.classList.contains('sdp-day-btn')) return;

				var nextDate = +this.monthView.model[+e.target.getAttribute('data-model-index')].number + 7,
				    nextDayIndex = +e.target.getAttribute('data-model-index') + 7;

				if (+this.monthView.model[+e.target.getAttribute('data-model-index')].number + 7 > (0, _utils.getMonthLength)(this.monthView.model[+e.target.getAttribute('data-model-index')].date.getFullYear(), this.monthView.model[+e.target.getAttribute('data-model-index')].date.getMonth())) {
					this.workingDate = new Date(this.workingDate.getFullYear(), this.workingDate.getMonth() + 1);
					this.renderMonth();
					//use this.workingDate instead of querying DOM?
					if (this.container.querySelector('[data-model-index="' + nextDayIndex % 7 + '"]').hasAttribute('disabled')) this.container.querySelector('[data-model-index="' + (nextDayIndex % 7 + 7) + '"]').focus();else this.container.querySelector('[data-model-index="' + nextDayIndex % 7 + '"]').focus();
				} else this.container.querySelector('[data-model-index="' + nextDayIndex + '"]').focus();
			}
		};
		if (_constants.KEYCODES[e.keyCode] && keyDownDictionary[_constants.KEYCODES[e.keyCode]]) keyDownDictionary[_constants.KEYCODES[e.keyCode]].call(this, e);
	},
	selectDate: function selectDate(e) {
		this.startDate = this.monthView.model[+e.target.getAttribute('data-model-index')].date;
		this.rootDate = this.startDate;
		e.target.classList.add('sdp-day-btn--is-active');
		this.inputClone.value = (0, _utils.formatDate)(this.startDate, this.settings.displayFormat);
		this.input.value = (0, _utils.formatDate)(this.startDate, this.settings.valueFormat);
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
	getValue: function getValue() {
		return this.startDate;
	},
	setValue: function setValue(nextValue) {
		this.rootDate = (0, _utils.parseDate)(nextValue, this.settings.valueFormat);
		this.rootDate.setHours(0, 0, 0, 0);
		this.startDate = this.rootDate;
		this.inputClone.value = (0, _utils.formatDate)(this.rootDate, this.settings.displayFormat);
		this.input.value = this.startDate;
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
    37: 'LEFT',
    38: 'UP',
    39: 'RIGHT',
    40: 'DOWN'
};

var ARIA_HELP_TEXT = exports.ARIA_HELP_TEXT = 'Press the arrow keys to navigate by day, PageUp and PageDown to navigate by month, Enter or Space to select a date, or Escape to cancel.';

var CLASSNAMES = exports.CLASSNAMES = {
    NAV_BTN: 'js-sdp-nav__btn'
};

var SELECTORS = exports.SELECTORS = {
    BTN_DEFAULT: '.sdp-day-btn',
    BTN_ACTIVE: '.sdp-day-btn--is-active',
    BTN_TODAY: '.sdp-day-btn--is-today',
    MONTH_CONTAINER: '.js-sdp__month'
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

var _utils = require('./utils');

var calendar = exports.calendar = function calendar(props) {
    return '<div class="sdp-date">\n                                        <button class="js-sdp-nav__btn sdp-back" type="button" data-action="-1">\n                                            <svg class="sdp-btn__icon" width="19" height="19" viewBox="0 0 1000 1000"><path d="M336.2 274.5l-210.1 210h805.4c13 0 23 10 23 23s-10 23-23 23H126.1l210.1 210.1c11 11 11 21 0 32-5 5-10 7-16 7s-11-2-16-7l-249.1-249c-11-11-11-21 0-32l249.1-249.1c21-21.1 53 10.9 32 32z"></path></svg>\n                                        </button>\n                                        <button class="js-sdp-nav__btn sdp-next" type="button" data-action="1">\n                                            <svg class="sdp-btn__icon" width="19" height="19" viewBox="0 0 1000 1000"><path d="M694.4 242.4l249.1 249.1c11 11 11 21 0 32L694.4 772.7c-5 5-10 7-16 7s-11-2-16-7c-11-11-11-21 0-32l210.1-210.1H67.1c-13 0-23-10-23-23s10-23 23-23h805.4L662.4 274.5c-21-21.1 11-53.1 32-32.1z"></path></svg>\n                                        </button>\n                                        <div class="js-sdp__month"></div>\n                                    </div>';
};

var month = exports.month = function month(props) {
    return '<div class="sdp-month-label">' + props.monthTitle + ' ' + props.yearTitle + '</div>\n                        <table class="sdp-days">\n                            <thead class="sdp-days-head">\n                                <tr class="sdp-days-row">\n                                    <th class="sdp-day-head">Mo</th>\n                                    <th class="sdp-day-head">Tu</th>\n                                    <th class="sdp-day-head">We</th>\n                                    <th class="sdp-day-head">Th</th>\n                                    <th class="sdp-day-head">Fr</th>\n                                    <th class="sdp-day-head">Sa</th>\n                                    <th class="sdp-day-head">Su</th>\n                                </tr>\n                            </thead>\n                            <tbody class="sdp-days-body">\n                                ' + props.model.map(weeks(props.active)).join('') + '\n                            </tbody>\n                        </table>';
};

var day = function day(activeDays, props, i) {
    return '<td class="sdp-day-body' + (props.nextMonth ? ' sdp-day-next-month sdp-day-disabled' : '') + (props.previousMonth ? ' sdp-day-prev-month sdp-day-disabled' : '') + (props.active ? ' sdp-day-selected' : '') + '"><button tabindex="' + (props.isStartDate ? 0 : props.isToday ? 0 : -1) + '" class="sdp-day-btn' + (props.isToday ? ' sdp-day-btn--is-today' : '') + (props.isStartDate ? ' sdp-day-btn--is-active' : '') + '" role="button" data-model-index="' + i + '" aria-label="' + (props.isToday ? 'Today, ' : '') + _utils.dayNames[props.date.getDay()] + ', ' + _utils.monthNames[props.date.getMonth()] + ' ' + props.date.getDate() + ', ' + props.date.getFullYear() + '"' + (props.previousMonth || props.nextMonth ? " disabled" : "") + '>' + props.number + '</button></td>';
};

var weeks = function weeks(activeDays) {
    return function (props, i, arr) {
        if (i === 0) return '<tr class="sdp-days-row">' + day(activeDays, props, i);else if (i === arr.length - 1) return day(activeDays, props, i) + '</tr>';else if ((i + 1) % 7 === 0) return day(activeDays, props, i) + '</tr><tr class="sdp-days-row">';else return day(activeDays, props, i);
    };
};

},{"./utils":7}],7:[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJleGFtcGxlL3NyYy9hcHAuanMiLCJleGFtcGxlL3NyYy9saWJzL2NvbXBvbmVudC9pbmRleC5qcyIsImV4YW1wbGUvc3JjL2xpYnMvY29tcG9uZW50L2xpYi9jb21wb25lbnQtcHJvdG90eXBlLmpzIiwiZXhhbXBsZS9zcmMvbGlicy9jb21wb25lbnQvbGliL2NvbnN0YW50cy5qcyIsImV4YW1wbGUvc3JjL2xpYnMvY29tcG9uZW50L2xpYi9kZWZhdWx0cy5qcyIsImV4YW1wbGUvc3JjL2xpYnMvY29tcG9uZW50L2xpYi90ZW1wbGF0ZXMuanMiLCJleGFtcGxlL3NyYy9saWJzL2NvbXBvbmVudC9saWIvdXRpbHMuanMiLCJub2RlX21vZHVsZXMvZmVjaGEvZmVjaGEuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztBQ0FBOzs7Ozs7OztBQUVBLElBQU0sMkJBQTJCLFlBQU0sQUFDbkM7V0FBQSxBQUFPLGFBQWEsb0JBQUEsQUFBVyxLQUEvQixBQUFvQixBQUFnQixBQUN2QztBQUZELEFBQWdDLENBQUE7O0FBSWhDLElBQUcsc0JBQUgsQUFBeUIsZUFBUSxBQUFPLGlCQUFQLEFBQXdCLG9CQUFvQixZQUFNLEFBQUU7NEJBQUEsQUFBd0IsUUFBUSxVQUFBLEFBQUMsSUFBRDtlQUFBLEFBQVE7QUFBeEMsQUFBZ0Q7QUFBcEcsQ0FBQTs7Ozs7Ozs7O0FDTmpDOzs7O0FBQ0E7Ozs7Ozs7O0FBRUEsSUFBTSxPQUFPLFNBQVAsQUFBTyxLQUFBLEFBQUMsS0FBRCxBQUFNLE1BQVMsQUFDM0I7S0FBSSxNQUFNLEdBQUEsQUFBRyxNQUFILEFBQVMsS0FBSyxTQUFBLEFBQVMsaUJBQWpDLEFBQVUsQUFBYyxBQUEwQixBQUMvQztBQUVIOztLQUFHLENBQUMsSUFBSixBQUFRLFFBQVEsT0FBTyxRQUFBLEFBQVEsS0FBZixBQUFPLEFBQWEsQUFFcEM7O1lBQU8sQUFBSSxJQUFJLFVBQUEs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Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJpbXBvcnQgRGF0ZVBpY2tlciBmcm9tICcuL2xpYnMvY29tcG9uZW50JztcblxuY29uc3Qgb25ET01Db250ZW50TG9hZGVkVGFza3MgPSBbKCkgPT4ge1xuICAgIHdpbmRvdy5EYXRlUGlja2VyID0gRGF0ZVBpY2tlci5pbml0KCcuanMtZGF0ZS1waWNrZXInKTtcbn1dO1xuICAgIFxuaWYoJ2FkZEV2ZW50TGlzdGVuZXInIGluIHdpbmRvdykgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCAoKSA9PiB7IG9uRE9NQ29udGVudExvYWRlZFRhc2tzLmZvckVhY2goKGZuKSA9PiBmbigpKTsgfSk7IiwiaW1wb3J0IGRlZmF1bHRzIGZyb20gJy4vbGliL2RlZmF1bHRzJztcbmltcG9ydCBjb21wb25lbnRQcm90b3R5cGUgZnJvbSAnLi9saWIvY29tcG9uZW50LXByb3RvdHlwZSc7XG5cbmNvbnN0IGluaXQgPSAoc2VsLCBvcHRzKSA9PiB7XG5cdGxldCBlbHMgPSBbXS5zbGljZS5jYWxsKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoc2VsKSk7XG4gICAgLy9sZXQgZWxzID0gQXJyYXkuZnJvbShkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKHNlbCkpO1xuXG5cdGlmKCFlbHMubGVuZ3RoKSByZXR1cm4gY29uc29sZS53YXJuKCdEYXRlIHBpY2tlciBub3QgaW5pdGlhbGlzZWQsIG5vIGF1Z21lbnRhYmxlIGVsZW1lbnRzIGZvdW5kJyk7XG4gICAgXG5cdHJldHVybiBlbHMubWFwKChlbCkgPT4ge1xuXHRcdHJldHVybiBPYmplY3QuYXNzaWduKE9iamVjdC5jcmVhdGUoY29tcG9uZW50UHJvdG90eXBlKSwge1xuXHRcdFx0bm9kZTogZWwsIFxuXHRcdFx0aW5wdXQ6IGVsLnF1ZXJ5U2VsZWN0b3IoJ2lucHV0JyksXG5cdFx0XHRidG46IGVsLnF1ZXJ5U2VsZWN0b3IoJy5idG4nKSxcblx0XHRcdHNldHRpbmdzOiBPYmplY3QuYXNzaWduKHt9LCBkZWZhdWx0cywgb3B0cylcblx0XHR9KS5pbml0KCk7XG5cdH0pO1xufTtcblxuZXhwb3J0IGRlZmF1bHQgeyBpbml0IH07IiwiaW1wb3J0IHsgXG5cdGVsZW1lbnRGYWN0b3J5LFxuXHRtb250aFZpZXdGYWN0b3J5LFxuXHRjYXRjaEJ1YmJsZSxcblx0bW9udGhOYW1lcyxcblx0ZGF5TmFtZXMsXG5cdGdldE1vbnRoTGVuZ3RoLFxuXHRwYXJzZURhdGUsXG5cdGZvcm1hdERhdGVcbn0gZnJvbSAnLi91dGlscyc7XG5pbXBvcnQgeyBjYWxlbmRhciwgbW9udGggfSBmcm9tICcuL3RlbXBsYXRlcyc7XG5pbXBvcnQgeyBcblx0VFJJR0dFUl9FVkVOVFMsXG5cdFRSSUdHRVJfS0VZQ09ERVMsXG5cdEtFWUNPREVTLFxuXHRBUklBX0hFTFBfVEVYVCxcblx0Q0xBU1NOQU1FUyxcblx0U0VMRUNUT1JTXG59IGZyb20gJy4vY29uc3RhbnRzJztcblxuZXhwb3J0IGRlZmF1bHQge1xuXHRpbml0KCkge1xuXHRcdHRoaXMuaW5pdENsb25lKCk7XG5cblx0XHRUUklHR0VSX0VWRU5UUy5mb3JFYWNoKGV2ID0+IHtcblx0XHRcdHRoaXMuYnRuLmFkZEV2ZW50TGlzdGVuZXIoZXYsIGUgPT4ge1xuXHRcdFx0XHRpZighIWUua2V5Q29kZSAmJiAhflRSSUdHRVJfS0VZQ09ERVMuaW5kZXhPZihlLmtleUNvZGUpKSByZXR1cm47XG5cdFx0XHRcdGNhdGNoQnViYmxlKGUpO1xuXHRcdFx0XHR0aGlzLnRvZ2dsZSgpO1xuXHRcdFx0fSk7XG5cdFx0fSk7XG5cblx0XHR0aGlzLmJvdW5kSGFuZGxlRm9jdXNPdXQgPSB0aGlzLmhhbmRsZUZvY3VzT3V0LmJpbmQodGhpcyk7XG5cblx0XHR0aGlzLnN0YXJ0RGF0ZSA9IHRoaXMuaW5wdXQudmFsdWUgPyBwYXJzZURhdGUodGhpcy5pbnB1dC52YWx1ZSwgdGhpcy5zZXR0aW5ncy52YWx1ZUZvcm1hdCkgOiBmYWxzZTtcblx0XHRpZih0aGlzLnN0YXJ0RGF0ZSkgdGhpcy5pbnB1dENsb25lLnZhbHVlID0gZm9ybWF0RGF0ZSh0aGlzLnN0YXJ0RGF0ZSwgdGhpcy5zZXR0aW5ncy5kaXNwbGF5Rm9ybWF0KTtcblxuXHRcdHRoaXMucm9vdERhdGUgPSB0aGlzLnN0YXJ0RGF0ZSB8fCBuZXcgRGF0ZSgpO1xuXHRcdHRoaXMucm9vdERhdGUuc2V0SG91cnMoMCwwLDAsMCk7XG5cblx0XHR0aGlzLnNldHRpbmdzLnN0YXJ0T3BlbiAmJiB0aGlzLm9wZW4oKTtcblx0XHRyZXR1cm4gdGhpcztcblx0fSxcblx0aW5pdENsb25lKCl7XG5cdFx0dGhpcy5pbnB1dENsb25lID0gZWxlbWVudEZhY3RvcnkoJ2lucHV0JywgeyB0eXBlOiAndGV4dCcsIHRhYmluZGV4OiAtMX0sIHRoaXMuaW5wdXQuY2xhc3NOYW1lKTtcblx0XHR0aGlzLmlucHV0LnNldEF0dHJpYnV0ZSgndHlwZScsICdoaWRkZW4nKTtcblx0XHR0aGlzLm5vZGUuYXBwZW5kQ2hpbGQodGhpcy5pbnB1dENsb25lKTtcblxuXHRcdHRoaXMuaW5wdXRDbG9uZS5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCBlID0+IHtcblx0XHRcdHRoaXMuc3RhcnREYXRlID0gcGFyc2VEYXRlKHRoaXMuaW5wdXRDbG9uZS52YWx1ZSwgdGhpcy5zZXR0aW5ncy5kaXNwbGF5Rm9ybWF0KS8vdGhyb3dzIGlmIHBhcnNlIGVycm9yXG5cdFx0XHR0aGlzLmlucHV0LnZhbHVlID0gdGhpcy5zdGFydERhdGUgfHwgJyc7XG5cdFx0fSk7XG5cdH0sXG5cdHRvZ2dsZSgpe1xuXHRcdGlmKHRoaXMuaXNPcGVuKSB0aGlzLmNsb3NlKCk7XG5cdFx0ZWxzZSB0aGlzLm9wZW4oKTtcblx0fSxcblx0b3Blbigpe1xuXHRcdGlmKHRoaXMuaXNPcGVuKSByZXR1cm47XG5cdFx0dGhpcy5yZW5kZXJDYWxlbmRhcigpO1xuXHRcdHRoaXMuaXNPcGVuID0gdHJ1ZTtcblx0XHR0aGlzLmJ0bi5zZXRBdHRyaWJ1dGUoJ2FyaWEtZXhwYW5kZWQnLCAndHJ1ZScpO1xuXHRcdHRoaXMud29ya2luZ0RhdGUgPSB0aGlzLnJvb3REYXRlO1xuXHRcdHRoaXMuY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoU0VMRUNUT1JTLkJUTl9BQ1RJVkUpID8gdGhpcy5jb250YWluZXIucXVlcnlTZWxlY3RvcihTRUxFQ1RPUlMuQlROX0FDVElWRSkuZm9jdXMoKSA6IHRoaXMuY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoU0VMRUNUT1JTLkJUTl9UT0RBWSkgPyB0aGlzLmNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKFNFTEVDVE9SUy5CVE5fVE9EQVkpLmZvY3VzKCkgOiB0aGlzLmNvbnRhaW5lci5xdWVyeVNlbGVjdG9yQWxsKFNFTEVDVE9SUy5CVE5fREVGQVVMVClbMF0uZm9jdXMoKTtcblx0XHRkb2N1bWVudC5ib2R5LmFkZEV2ZW50TGlzdGVuZXIoJ2ZvY3Vzb3V0JywgdGhpcy5ib3VuZEhhbmRsZUZvY3VzT3V0KTtcblx0fSxcblx0Y2xvc2UoKXtcblx0XHRpZighdGhpcy5pc09wZW4pIHJldHVybjtcblx0XHR0aGlzLm5vZGUucmVtb3ZlQ2hpbGQodGhpcy5jb250YWluZXIpO1xuXHRcdHRoaXMuaXNPcGVuID0gZmFsc2U7XG5cdFx0dGhpcy5idG4uc2V0QXR0cmlidXRlKCdhcmlhLWV4cGFuZGVkJywgJ2ZhbHNlJyk7XG5cdFx0dGhpcy5idG4uZm9jdXMoKTtcblx0XHR0aGlzLndvcmtpbmdEYXRlID0gZmFsc2U7XG5cdH0sXG5cdGhhbmRsZUZvY3VzT3V0KCl7XG5cdFx0d2luZG93LnNldFRpbWVvdXQoKCkgPT4ge1xuXHRcdFx0aWYodGhpcy5jb250YWluZXIuY29udGFpbnMoZG9jdW1lbnQuYWN0aXZlRWxlbWVudCkpIHJldHVybjtcblx0XHRcdHRoaXMuY2xvc2UoKTtcblx0XHRcdGRvY3VtZW50LmJvZHkucmVtb3ZlRXZlbnRMaXN0ZW5lcignZm9jdXNvdXQnLCB0aGlzLmJvdW5kSGFuZGxlRm9jdXNPdXQpO1xuXHRcdH0sIDE2KTtcblx0fSxcblx0cmVuZGVyQ2FsZW5kYXIoKXtcblx0XHR0aGlzLmNvbnRhaW5lciA9IGVsZW1lbnRGYWN0b3J5KCdkaXYnLCB7ICdyb2xlJzogJ2RpYWxvZycsICdhcmlhLWhlbHB0ZXh0JzogQVJJQV9IRUxQX1RFWFQgfSwgJ3NkcC1jb250YWluZXInKTtcblx0XHR0aGlzLmNvbnRhaW5lci5pbm5lckhUTUwgPSBjYWxlbmRhcigpO1xuXHRcdHRoaXMubm9kZS5hcHBlbmRDaGlsZCh0aGlzLmNvbnRhaW5lcik7XG5cdFx0dGhpcy5tb250aENvbnRhaW5lciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoU0VMRUNUT1JTLk1PTlRIX0NPTlRBSU5FUik7XG5cdFx0dGhpcy5yZW5kZXJNb250aCgpO1xuXHRcdHRoaXMuaW5pdExpc3RlbmVycygpO1xuXHR9LFxuXHRyZW5kZXJNb250aCgpe1xuXHRcdHRoaXMubW9udGhWaWV3ID0gbW9udGhWaWV3RmFjdG9yeSh0aGlzLndvcmtpbmdEYXRlIHx8IHRoaXMucm9vdERhdGUsIHRoaXMuc3RhcnREYXRlKTtcblx0XHR0aGlzLm1vbnRoQ29udGFpbmVyLmlubmVySFRNTCA9IG1vbnRoKHRoaXMubW9udGhWaWV3KTtcblx0XHRpZighdGhpcy5jb250YWluZXIucXVlcnlTZWxlY3RvcihgJHtTRUxFQ1RPUlMuQlROX0RFRkFVTFR9W3RhYmluZGV4PVwiMFwiXWApKSBbXS5zbGljZS5jYWxsKHRoaXMuY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3JBbGwoYCR7U0VMRUNUT1JTLkJUTl9ERUZBVUxUfTpub3QoW2Rpc2FibGVkXSlgKSkuc2hpZnQoKS5zZXRBdHRyaWJ1dGUoJ3RhYmluZGV4JywgJzAnKTtcblx0fSxcblx0aW5pdExpc3RlbmVycygpe1xuXHRcdFRSSUdHRVJfRVZFTlRTLmZvckVhY2goZXYgPT4ge1xuXHRcdFx0dGhpcy5jb250YWluZXIuYWRkRXZlbnRMaXN0ZW5lcihldiwgdGhpcy5yb3V0ZUhhbmRsZXJzLmJpbmQodGhpcykpO1xuXHRcdH0pO1xuXHR9LFxuXHRyb3V0ZUhhbmRsZXJzKGUpe1xuXHRcdGlmKGUua2V5Q29kZSkgdGhpcy5oYW5kbGVLZXlEb3duKGUpO1xuXHRcdGVsc2Uge1xuXHRcdFx0aWYoZS50YXJnZXQuY2xhc3NMaXN0LmNvbnRhaW5zKENMQVNTTkFNRVMuTkFWX0JUTikgfHwgZS50YXJnZXQucGFyZW50Tm9kZS5jbGFzc0xpc3QuY29udGFpbnMoQ0xBU1NOQU1FUy5OQVZfQlROKSkgdGhpcy5oYW5kbGVOYXYoKyhlLnRhcmdldC5nZXRBdHRyaWJ1dGUoJ2RhdGEtYWN0aW9uJykgfHwgZS50YXJnZXQucGFyZW50Tm9kZS5nZXRBdHRyaWJ1dGUoJ2RhdGEtYWN0aW9uJykpKTtcblx0XHRcdGlmKGUudGFyZ2V0LmNsYXNzTGlzdC5jb250YWlucyhTRUxFQ1RPUlMuQlROX0RFRkFVTFQpKSB0aGlzLnNlbGVjdERhdGUoZSk7XG5cdFx0fVxuXHR9LFxuXHRoYW5kbGVOYXYoYWN0aW9uKXtcblx0XHR0aGlzLndvcmtpbmdEYXRlID0gbmV3IERhdGUodGhpcy53b3JraW5nRGF0ZS5nZXRGdWxsWWVhcigpLCB0aGlzLndvcmtpbmdEYXRlLmdldE1vbnRoKCkgKyBhY3Rpb24pO1xuXHRcdHRoaXMucmVuZGVyTW9udGgoKTtcblx0fSxcblx0aGFuZGxlS2V5RG93bihlKXtcblx0XHRjb25zdCBrZXlEb3duRGljdGlvbmFyeSA9IHtcblx0XHRcdFBBR0VfVVAoKXt9LC8vP1xuXHRcdFx0UEFHRV9ET1dOKCl7fSwvLz9cblx0XHRcdFRBQigpe1xuXHRcdFx0XHQvKiBcblx0XHRcdFx0XHQtIHRyYXAgdGFiIGluIGZvY3VzYWJsZSBjaGlsZHJlbj8/XG5cdFx0XHRcdFx0XHQgLSByZXR1cm4gdG8gYnV0dG9uIGFmdGVyIGxhc3QgZm9jdXNhYmxlIGNoaWxkP1xuXHRcdFx0XHRcdC0gcmVmLiBodHRwczovL2dpdGh1Yi5jb20vbWpicC9zdG9ybS1mb2N1cy1tYW5hZ2VyL2Jsb2IvbWFzdGVyL3NyYy9zdG9ybS1mb2N1cy1tYW5hZ2VyLmpzXG5cdFx0XHRcdCovXG5cdFx0XHR9LFxuXHRcdFx0RU5URVIoZSl7XG5cdFx0XHRcdGNhdGNoQnViYmxlKGUpO1xuXHRcdFx0XHRpZihlLnRhcmdldC5jbGFzc0xpc3QuY29udGFpbnMoJ3NkcC1kYXktYnRuJykpIHRoaXMuc2VsZWN0RGF0ZShlKTtcblx0XHRcdFx0aWYoZS50YXJnZXQuY2xhc3NMaXN0LmNvbnRhaW5zKENMQVNTTkFNRVMuTkFWX0JUTikpIHRoaXMuaGFuZGxlTmF2KCtlLnRhcmdldC5nZXRBdHRyaWJ1dGUoJ2RhdGEtYWN0aW9uJykpO1xuXHRcdFx0fSxcblx0XHRcdEVTQ0FQRSgpeyB0aGlzLmNsb3NlKCk7IH0sXG5cdFx0XHRTUEFDRShlKSB7IGtleURvd25EaWN0aW9uYXJ5LkVOVEVSKGUpOyB9LFxuXHRcdFx0TEVGVChlKXtcblx0XHRcdFx0Y2F0Y2hCdWJibGUoZSk7XG5cdFx0XHRcdGlmKCFlLnRhcmdldC5jbGFzc0xpc3QuY29udGFpbnMoJ3NkcC1kYXktYnRuJykpIHJldHVybjtcblxuXHRcdFx0XHRpZih0aGlzLm1vbnRoVmlldy5tb2RlbFsrZS50YXJnZXQuZ2V0QXR0cmlidXRlKCdkYXRhLW1vZGVsLWluZGV4JyldLm51bWJlciA9PT0gMSkge1xuXHRcdFx0XHRcdHRoaXMud29ya2luZ0RhdGUgPSBuZXcgRGF0ZSh0aGlzLndvcmtpbmdEYXRlLmdldEZ1bGxZZWFyKCksIHRoaXMud29ya2luZ0RhdGUuZ2V0TW9udGgoKSAtIDEpO1xuXHRcdFx0XHRcdHRoaXMucmVuZGVyTW9udGgoKTtcblx0XHRcdFx0XHRbXS5zbGljZS5jYWxsKHRoaXMuY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3JBbGwoJy5zZHAtZGF5LWJvZHk6bm90KC5zZHAtZGF5LWRpc2FibGVkKScpKS5wb3AoKS5maXJzdEVsZW1lbnRDaGlsZC5mb2N1cygpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGVsc2UgdGhpcy5jb250YWluZXIucXVlcnlTZWxlY3RvcihgW2RhdGEtbW9kZWwtaW5kZXg9XCIkeytlLnRhcmdldC5nZXRBdHRyaWJ1dGUoJ2RhdGEtbW9kZWwtaW5kZXgnKSAtIDF9XCJdYCkuZm9jdXMoKTtcblx0XHRcdH0sXG5cdFx0XHRVUCgpe1xuXHRcdFx0XHRjYXRjaEJ1YmJsZShlKTtcblx0XHRcdFx0aWYoIWUudGFyZ2V0LmNsYXNzTGlzdC5jb250YWlucygnc2RwLWRheS1idG4nKSkgcmV0dXJuO1xuXHRcdFx0XHRcblx0XHRcdFx0bGV0IG5leHREYXlJbmRleCA9ICtlLnRhcmdldC5nZXRBdHRyaWJ1dGUoJ2RhdGEtbW9kZWwtaW5kZXgnKSAtIDc7XG5cblx0XHRcdFx0aWYoK3RoaXMubW9udGhWaWV3Lm1vZGVsWytlLnRhcmdldC5nZXRBdHRyaWJ1dGUoJ2RhdGEtbW9kZWwtaW5kZXgnKV0ubnVtYmVyIC0gNyA8IDEpIHtcblx0XHRcdFx0XHR0aGlzLndvcmtpbmdEYXRlID0gbmV3IERhdGUodGhpcy53b3JraW5nRGF0ZS5nZXRGdWxsWWVhcigpLCB0aGlzLndvcmtpbmdEYXRlLmdldE1vbnRoKCkgLSAxKTtcblx0XHRcdFx0XHR0aGlzLnJlbmRlck1vbnRoKCk7XG5cdFx0XHRcdFx0Ly91c2UgdGhpcy53b3JraW5nRGF0ZSBpbnN0ZWFkIG9mIHF1ZXJ5aW5nIERPTT9cblx0XHRcdFx0XHRpZighdGhpcy5jb250YWluZXIucXVlcnlTZWxlY3RvcihgW2RhdGEtbW9kZWwtaW5kZXg9XCIke3RoaXMubW9udGhWaWV3Lm1vZGVsLmxlbmd0aCArIG5leHREYXlJbmRleH1cIl1gKXx8IHRoaXMuY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoYFtkYXRhLW1vZGVsLWluZGV4PVwiJHt0aGlzLm1vbnRoVmlldy5tb2RlbC5sZW5ndGggKyBuZXh0RGF5SW5kZXh9XCJdYCkgJiYgdGhpcy5jb250YWluZXIucXVlcnlTZWxlY3RvcihgW2RhdGEtbW9kZWwtaW5kZXg9XCIke3RoaXMubW9udGhWaWV3Lm1vZGVsLmxlbmd0aCArIG5leHREYXlJbmRleH1cIl1gKS5oYXNBdHRyaWJ1dGUoJ2Rpc2FibGVkJykpIFxuXHRcdFx0XHRcdFx0dGhpcy5jb250YWluZXIucXVlcnlTZWxlY3RvcihgW2RhdGEtbW9kZWwtaW5kZXg9XCIke3RoaXMubW9udGhWaWV3Lm1vZGVsLmxlbmd0aCArIChuZXh0RGF5SW5kZXggLSA3KX1cIl1gKS5mb2N1cygpO1xuXHRcdFx0XHRcdGVsc2UgdGhpcy5jb250YWluZXIucXVlcnlTZWxlY3RvcihgW2RhdGEtbW9kZWwtaW5kZXg9XCIke3RoaXMubW9udGhWaWV3Lm1vZGVsLmxlbmd0aCArIG5leHREYXlJbmRleH1cIl1gKS5mb2N1cygpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGVsc2UgdGhpcy5jb250YWluZXIucXVlcnlTZWxlY3RvcihgW2RhdGEtbW9kZWwtaW5kZXg9XCIke25leHREYXlJbmRleH1cIl1gKS5mb2N1cygpO1xuXHRcdFx0fSxcblx0XHRcdFJJR0hUKGUpe1xuXHRcdFx0XHRjYXRjaEJ1YmJsZShlKTtcblx0XHRcdFx0aWYoIWUudGFyZ2V0LmNsYXNzTGlzdC5jb250YWlucygnc2RwLWRheS1idG4nKSkgcmV0dXJuO1xuXHRcdFx0XHRcblx0XHRcdFx0aWYodGhpcy5tb250aFZpZXcubW9kZWxbK2UudGFyZ2V0LmdldEF0dHJpYnV0ZSgnZGF0YS1tb2RlbC1pbmRleCcpXS5udW1iZXIgPT09IGdldE1vbnRoTGVuZ3RoKHRoaXMubW9udGhWaWV3Lm1vZGVsWytlLnRhcmdldC5nZXRBdHRyaWJ1dGUoJ2RhdGEtbW9kZWwtaW5kZXgnKV0uZGF0ZS5nZXRGdWxsWWVhcigpLCB0aGlzLm1vbnRoVmlldy5tb2RlbFsrZS50YXJnZXQuZ2V0QXR0cmlidXRlKCdkYXRhLW1vZGVsLWluZGV4JyldLmRhdGUuZ2V0TW9udGgoKSkpIHtcblx0XHRcdFx0XHR0aGlzLndvcmtpbmdEYXRlID0gbmV3IERhdGUodGhpcy53b3JraW5nRGF0ZS5nZXRGdWxsWWVhcigpLCB0aGlzLndvcmtpbmdEYXRlLmdldE1vbnRoKCkgKyAxKTtcblx0XHRcdFx0XHR0aGlzLnJlbmRlck1vbnRoKCk7XG5cdFx0XHRcdFx0W10uc2xpY2UuY2FsbCh0aGlzLmNvbnRhaW5lci5xdWVyeVNlbGVjdG9yQWxsKCcuc2RwLWRheS1ib2R5Om5vdCguc2RwLWRheS1kaXNhYmxlZCknKSkuc2hpZnQoKS5maXJzdEVsZW1lbnRDaGlsZC5mb2N1cygpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGVsc2UgdGhpcy5jb250YWluZXIucXVlcnlTZWxlY3RvcihgW2RhdGEtbW9kZWwtaW5kZXg9XCIkeytlLnRhcmdldC5nZXRBdHRyaWJ1dGUoJ2RhdGEtbW9kZWwtaW5kZXgnKSArIDF9XCJdYCkuZm9jdXMoKTtcblx0XHRcdFx0XG5cdFx0XHR9LFxuXHRcdFx0RE9XTigpe1xuXHRcdFx0XHRjYXRjaEJ1YmJsZShlKTtcblx0XHRcdFx0aWYoIWUudGFyZ2V0LmNsYXNzTGlzdC5jb250YWlucygnc2RwLWRheS1idG4nKSkgcmV0dXJuO1xuXG5cdFx0XHRcdGxldCBuZXh0RGF0ZSA9ICt0aGlzLm1vbnRoVmlldy5tb2RlbFsrZS50YXJnZXQuZ2V0QXR0cmlidXRlKCdkYXRhLW1vZGVsLWluZGV4JyldLm51bWJlciArIDcsXG5cdFx0XHRcdFx0bmV4dERheUluZGV4ID0gK2UudGFyZ2V0LmdldEF0dHJpYnV0ZSgnZGF0YS1tb2RlbC1pbmRleCcpICsgNztcblxuXHRcdFx0XHRpZigrdGhpcy5tb250aFZpZXcubW9kZWxbK2UudGFyZ2V0LmdldEF0dHJpYnV0ZSgnZGF0YS1tb2RlbC1pbmRleCcpXS5udW1iZXIgKyA3ID4gZ2V0TW9udGhMZW5ndGgodGhpcy5tb250aFZpZXcubW9kZWxbK2UudGFyZ2V0LmdldEF0dHJpYnV0ZSgnZGF0YS1tb2RlbC1pbmRleCcpXS5kYXRlLmdldEZ1bGxZZWFyKCksIHRoaXMubW9udGhWaWV3Lm1vZGVsWytlLnRhcmdldC5nZXRBdHRyaWJ1dGUoJ2RhdGEtbW9kZWwtaW5kZXgnKV0uZGF0ZS5nZXRNb250aCgpKSkge1xuXHRcdFx0XHRcdHRoaXMud29ya2luZ0RhdGUgPSBuZXcgRGF0ZSh0aGlzLndvcmtpbmdEYXRlLmdldEZ1bGxZZWFyKCksIHRoaXMud29ya2luZ0RhdGUuZ2V0TW9udGgoKSArIDEpO1xuXHRcdFx0XHRcdHRoaXMucmVuZGVyTW9udGgoKTtcblx0XHRcdFx0XHQvL3VzZSB0aGlzLndvcmtpbmdEYXRlIGluc3RlYWQgb2YgcXVlcnlpbmcgRE9NP1xuXHRcdFx0XHRcdGlmKHRoaXMuY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoYFtkYXRhLW1vZGVsLWluZGV4PVwiJHtuZXh0RGF5SW5kZXggJSA3fVwiXWApLmhhc0F0dHJpYnV0ZSgnZGlzYWJsZWQnKSkgdGhpcy5jb250YWluZXIucXVlcnlTZWxlY3RvcihgW2RhdGEtbW9kZWwtaW5kZXg9XCIkeyhuZXh0RGF5SW5kZXggJSA3KSArIDd9XCJdYCkuZm9jdXMoKTtcblx0XHRcdFx0XHRlbHNlIHRoaXMuY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoYFtkYXRhLW1vZGVsLWluZGV4PVwiJHtuZXh0RGF5SW5kZXggJSA3fVwiXWApLmZvY3VzKCk7XG5cdFx0XHRcdH1cblx0XHRcdFx0ZWxzZSB0aGlzLmNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKGBbZGF0YS1tb2RlbC1pbmRleD1cIiR7bmV4dERheUluZGV4fVwiXWApLmZvY3VzKCk7XG5cdFx0XHR9XG5cdFx0fTtcblx0XHRpZihLRVlDT0RFU1tlLmtleUNvZGVdICYmIGtleURvd25EaWN0aW9uYXJ5W0tFWUNPREVTW2Uua2V5Q29kZV1dKSBrZXlEb3duRGljdGlvbmFyeVtLRVlDT0RFU1tlLmtleUNvZGVdXS5jYWxsKHRoaXMsIGUpO1xuXHR9LFxuXHRzZWxlY3REYXRlKGUpe1xuXHRcdHRoaXMuc3RhcnREYXRlID0gdGhpcy5tb250aFZpZXcubW9kZWxbK2UudGFyZ2V0LmdldEF0dHJpYnV0ZSgnZGF0YS1tb2RlbC1pbmRleCcpXS5kYXRlO1xuXHRcdHRoaXMucm9vdERhdGUgPSB0aGlzLnN0YXJ0RGF0ZTtcblx0XHRlLnRhcmdldC5jbGFzc0xpc3QuYWRkKCdzZHAtZGF5LWJ0bi0taXMtYWN0aXZlJyk7XG5cdFx0dGhpcy5pbnB1dENsb25lLnZhbHVlID0gZm9ybWF0RGF0ZSh0aGlzLnN0YXJ0RGF0ZSwgdGhpcy5zZXR0aW5ncy5kaXNwbGF5Rm9ybWF0KTtcblx0XHR0aGlzLmlucHV0LnZhbHVlID0gZm9ybWF0RGF0ZSh0aGlzLnN0YXJ0RGF0ZSwgdGhpcy5zZXR0aW5ncy52YWx1ZUZvcm1hdCk7XG5cdFx0dGhpcy5jbG9zZSgpO1xuXHR9LFxuXHRyZXNldCgpe1xuXHRcdHRoaXMucm9vdERhdGUgPSBuZXcgRGF0ZSgpO1xuXHRcdHRoaXMucm9vdERhdGUuc2V0SG91cnMoMCwwLDAsMCk7XG5cdFx0dGhpcy5zdGFydERhdGUgPSBmYWxzZTtcblx0XHR0aGlzLmlucHV0Q2xvbmUudmFsdWUgPSAnJztcblx0XHR0aGlzLmlucHV0LnZhbHVlID0gJyc7XG5cdFx0aWYodGhpcy5pc09wZW4pIHRoaXMuY2xvc2UoKTtcblx0fSxcblx0Z2V0VmFsdWUoKXsgcmV0dXJuIHRoaXMuc3RhcnREYXRlOyB9LFxuXHRzZXRWYWx1ZShuZXh0VmFsdWUpe1xuXHRcdHRoaXMucm9vdERhdGUgPSBwYXJzZURhdGUobmV4dFZhbHVlLCB0aGlzLnNldHRpbmdzLnZhbHVlRm9ybWF0KTtcblx0XHR0aGlzLnJvb3REYXRlLnNldEhvdXJzKDAsMCwwLDApO1xuXHRcdHRoaXMuc3RhcnREYXRlID0gdGhpcy5yb290RGF0ZTtcblx0XHR0aGlzLmlucHV0Q2xvbmUudmFsdWUgPSBmb3JtYXREYXRlKHRoaXMucm9vdERhdGUsIHRoaXMuc2V0dGluZ3MuZGlzcGxheUZvcm1hdCk7XG5cdFx0dGhpcy5pbnB1dC52YWx1ZSA9IHRoaXMuc3RhcnREYXRlO1xuXHRcdGlmKHRoaXMuaXNPcGVuKSB0aGlzLndvcmtpbmdEYXRlID0gdGhpcy5zdGFydERhdGUsIHRoaXMucmVuZGVyTW9udGgoKTtcblx0fVxufTsiLCJleHBvcnQgY29uc3QgVFJJR0dFUl9FVkVOVFMgPSBbJ2NsaWNrJywgJ2tleWRvd24nXTtcblxuZXhwb3J0IGNvbnN0IFRSSUdHRVJfS0VZQ09ERVMgPSBbMTMsIDMyXTtcblxuZXhwb3J0IGNvbnN0IEtFWUNPREVTID0ge1xuICAgIDk6ICdUQUInLFxuICAgIDEzOiAnRU5URVInLFxuICAgIDI3OiAnRVNDQVBFJyxcbiAgICAzMjogJ1NQQUNFJyxcbiAgICAzNzogJ0xFRlQnLFxuICAgIDM4OiAnVVAnLFxuICAgIDM5OiAnUklHSFQnLFxuICAgIDQwOiAnRE9XTidcbn07XG5cbmV4cG9ydCBjb25zdCBBUklBX0hFTFBfVEVYVCA9IGBQcmVzcyB0aGUgYXJyb3cga2V5cyB0byBuYXZpZ2F0ZSBieSBkYXksIFBhZ2VVcCBhbmQgUGFnZURvd24gdG8gbmF2aWdhdGUgYnkgbW9udGgsIEVudGVyIG9yIFNwYWNlIHRvIHNlbGVjdCBhIGRhdGUsIG9yIEVzY2FwZSB0byBjYW5jZWwuYDtcblxuZXhwb3J0IGNvbnN0IENMQVNTTkFNRVMgPSB7XG4gICAgTkFWX0JUTjogJ2pzLXNkcC1uYXZfX2J0bidcbn07XG5cbmV4cG9ydCBjb25zdCBTRUxFQ1RPUlMgPSB7XG4gICAgQlROX0RFRkFVTFQ6ICcuc2RwLWRheS1idG4nLFxuICAgIEJUTl9BQ1RJVkU6ICcuc2RwLWRheS1idG4tLWlzLWFjdGl2ZScsXG4gICAgQlROX1RPREFZOiAnLnNkcC1kYXktYnRuLS1pcy10b2RheScsXG4gICAgTU9OVEhfQ09OVEFJTkVSOiAnLmpzLXNkcF9fbW9udGgnLFxufTsiLCJleHBvcnQgZGVmYXVsdCB7XG5cdGNhbGxiYWNrOiBudWxsLFxuXHRzdGFydE9wZW46IGZhbHNlLFxuXHRzdGFydERhdGU6IGZhbHNlLFxuXHQvLyBjbG9zZU9uU2VsZWN0OiBmYWxzZSxcblx0ZGlzcGxheUZvcm1hdDogJ2RkZGQgTU1NTSBELCBZWVlZJywgLy9UaHVyc2RheSBKYW51YXJ5IDEyLCAyMDE3XG5cdHZhbHVlRm9ybWF0OiAnREQvTU0vWVlZWSdcbn07IiwiaW1wb3J0IHsgZGF5TmFtZXMsIG1vbnRoTmFtZXMgfSBmcm9tICcuL3V0aWxzJztcblxuZXhwb3J0IGNvbnN0IGNhbGVuZGFyID0gcHJvcHMgPT4gYDxkaXYgY2xhc3M9XCJzZHAtZGF0ZVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxidXR0b24gY2xhc3M9XCJqcy1zZHAtbmF2X19idG4gc2RwLWJhY2tcIiB0eXBlPVwiYnV0dG9uXCIgZGF0YS1hY3Rpb249XCItMVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3ZnIGNsYXNzPVwic2RwLWJ0bl9faWNvblwiIHdpZHRoPVwiMTlcIiBoZWlnaHQ9XCIxOVwiIHZpZXdCb3g9XCIwIDAgMTAwMCAxMDAwXCI+PHBhdGggZD1cIk0zMzYuMiAyNzQuNWwtMjEwLjEgMjEwaDgwNS40YzEzIDAgMjMgMTAgMjMgMjNzLTEwIDIzLTIzIDIzSDEyNi4xbDIxMC4xIDIxMC4xYzExIDExIDExIDIxIDAgMzItNSA1LTEwIDctMTYgN3MtMTEtMi0xNi03bC0yNDkuMS0yNDljLTExLTExLTExLTIxIDAtMzJsMjQ5LjEtMjQ5LjFjMjEtMjEuMSA1MyAxMC45IDMyIDMyelwiPjwvcGF0aD48L3N2Zz5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIGNsYXNzPVwianMtc2RwLW5hdl9fYnRuIHNkcC1uZXh0XCIgdHlwZT1cImJ1dHRvblwiIGRhdGEtYWN0aW9uPVwiMVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3ZnIGNsYXNzPVwic2RwLWJ0bl9faWNvblwiIHdpZHRoPVwiMTlcIiBoZWlnaHQ9XCIxOVwiIHZpZXdCb3g9XCIwIDAgMTAwMCAxMDAwXCI+PHBhdGggZD1cIk02OTQuNCAyNDIuNGwyNDkuMSAyNDkuMWMxMSAxMSAxMSAyMSAwIDMyTDY5NC40IDc3Mi43Yy01IDUtMTAgNy0xNiA3cy0xMS0yLTE2LTdjLTExLTExLTExLTIxIDAtMzJsMjEwLjEtMjEwLjFINjcuMWMtMTMgMC0yMy0xMC0yMy0yM3MxMC0yMyAyMy0yM2g4MDUuNEw2NjIuNCAyNzQuNWMtMjEtMjEuMSAxMS01My4xIDMyLTMyLjF6XCI+PC9wYXRoPjwvc3ZnPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJqcy1zZHBfX21vbnRoXCI+PC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5gO1xuXG5leHBvcnQgY29uc3QgbW9udGggPSBwcm9wcyA9PiBgPGRpdiBjbGFzcz1cInNkcC1tb250aC1sYWJlbFwiPiR7cHJvcHMubW9udGhUaXRsZX0gJHtwcm9wcy55ZWFyVGl0bGV9PC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICA8dGFibGUgY2xhc3M9XCJzZHAtZGF5c1wiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0aGVhZCBjbGFzcz1cInNkcC1kYXlzLWhlYWRcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRyIGNsYXNzPVwic2RwLWRheXMtcm93XCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGggY2xhc3M9XCJzZHAtZGF5LWhlYWRcIj5NbzwvdGg+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGggY2xhc3M9XCJzZHAtZGF5LWhlYWRcIj5UdTwvdGg+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGggY2xhc3M9XCJzZHAtZGF5LWhlYWRcIj5XZTwvdGg+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGggY2xhc3M9XCJzZHAtZGF5LWhlYWRcIj5UaDwvdGg+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGggY2xhc3M9XCJzZHAtZGF5LWhlYWRcIj5GcjwvdGg+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGggY2xhc3M9XCJzZHAtZGF5LWhlYWRcIj5TYTwvdGg+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGggY2xhc3M9XCJzZHAtZGF5LWhlYWRcIj5TdTwvdGg+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvdHI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC90aGVhZD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGJvZHkgY2xhc3M9XCJzZHAtZGF5cy1ib2R5XCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICR7cHJvcHMubW9kZWwubWFwKHdlZWtzKHByb3BzLmFjdGl2ZSkpLmpvaW4oJycpfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvdGJvZHk+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L3RhYmxlPmA7XG5cbmNvbnN0IGRheSA9IChhY3RpdmVEYXlzLCBwcm9wcywgaSkgPT4gYDx0ZCBjbGFzcz1cInNkcC1kYXktYm9keSR7cHJvcHMubmV4dE1vbnRoID8gJyBzZHAtZGF5LW5leHQtbW9udGggc2RwLWRheS1kaXNhYmxlZCcgOiAnJ30ke3Byb3BzLnByZXZpb3VzTW9udGggPyAnIHNkcC1kYXktcHJldi1tb250aCBzZHAtZGF5LWRpc2FibGVkJyA6ICcnfSR7cHJvcHMuYWN0aXZlID8gJyBzZHAtZGF5LXNlbGVjdGVkJyA6ICcnfVwiPjxidXR0b24gdGFiaW5kZXg9XCIke3Byb3BzLmlzU3RhcnREYXRlID8gMCA6IHByb3BzLmlzVG9kYXkgPyAwIDogLTF9XCIgY2xhc3M9XCJzZHAtZGF5LWJ0biR7cHJvcHMuaXNUb2RheSA/ICcgc2RwLWRheS1idG4tLWlzLXRvZGF5JyA6ICcnfSR7cHJvcHMuaXNTdGFydERhdGUgPyAnIHNkcC1kYXktYnRuLS1pcy1hY3RpdmUnIDogJyd9XCIgcm9sZT1cImJ1dHRvblwiIGRhdGEtbW9kZWwtaW5kZXg9XCIke2l9XCIgYXJpYS1sYWJlbD1cIiR7cHJvcHMuaXNUb2RheSA/ICdUb2RheSwgJyA6ICcnfSR7ZGF5TmFtZXNbcHJvcHMuZGF0ZS5nZXREYXkoKV19LCAke21vbnRoTmFtZXNbcHJvcHMuZGF0ZS5nZXRNb250aCgpXX0gJHtwcm9wcy5kYXRlLmdldERhdGUoKX0sICR7cHJvcHMuZGF0ZS5nZXRGdWxsWWVhcigpfVwiJHtwcm9wcy5wcmV2aW91c01vbnRoIHx8IHByb3BzLm5leHRNb250aCA/IFwiIGRpc2FibGVkXCIgOiBcIlwifT4ke3Byb3BzLm51bWJlcn08L2J1dHRvbj48L3RkPmA7XG5cbmNvbnN0IHdlZWtzID0gYWN0aXZlRGF5cyA9PiAocHJvcHMsIGksIGFycikgPT4ge1xuICAgIGlmKGkgPT09IDApIHJldHVybiBgPHRyIGNsYXNzPVwic2RwLWRheXMtcm93XCI+JHtkYXkoYWN0aXZlRGF5cywgcHJvcHMsIGkpfWA7XG4gICAgZWxzZSBpZiAoaSA9PT0gYXJyLmxlbmd0aCAtIDEpIHJldHVybiBgJHtkYXkoYWN0aXZlRGF5cywgcHJvcHMsIGkpfTwvdHI+YDtcbiAgICBlbHNlIGlmKChpKzEpICUgNyA9PT0gMCkgcmV0dXJuIGAke2RheShhY3RpdmVEYXlzLCBwcm9wcywgaSl9PC90cj48dHIgY2xhc3M9XCJzZHAtZGF5cy1yb3dcIj5gO1xuICAgIGVsc2UgcmV0dXJuIGRheShhY3RpdmVEYXlzLCBwcm9wcywgaSk7XG59OyIsImltcG9ydCBmZWNoYSBmcm9tICdmZWNoYSc7XG5cbmV4cG9ydCBjb25zdCBwYXJzZURhdGUgPSBmZWNoYS5wYXJzZTtcblxuZXhwb3J0IGNvbnN0IGZvcm1hdERhdGUgPSBmZWNoYS5mb3JtYXQ7XG5cbmV4cG9ydCBjb25zdCBtb250aE5hbWVzID0gWydKYW51YXJ5JywgJ0ZlYnJ1YXJ5JywgJ01hcmNoJywgJ0FwcmlsJywgJ01heScsICdKdW5lJywgJ0p1bHknLCAnQXVndXN0JywgJ1NlcHRlbWJlcicsICdPY3RvYmVyJywgJ05vdmVtYmVyJywgJ0RlY2VtYmVyJ107XG5cbmV4cG9ydCBjb25zdCBkYXlOYW1lcyA9IFsnU3VuZGF5JywnTW9uZGF5JywnVHVlc2RheScsJ1dlZG5lc2RheScsJ1RodXJzZGF5JywnRnJpZGF5JywnU2F0dXJkYXknXTtcblxuZXhwb3J0IGNvbnN0IGNhdGNoQnViYmxlID0gZSA9PiB7XG4gICAgZS5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24oKTtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG59O1xuXG5leHBvcnQgY29uc3QgZ2V0TW9udGhMZW5ndGggPSAoeWVhciwgbW9udGgpID0+IG5ldyBEYXRlKHllYXIsIChtb250aCArIDEpLCAwKS5nZXREYXRlKCk7XG5cbmNvbnN0IGlzVG9kYXkgPSBjYW5kaWRhdGUgPT4ge1xuICAgIGxldCB0b2RheSA9IG5ldyBEYXRlKCk7XG4gICAgdG9kYXkuc2V0SG91cnMoMCwwLDAsMCk7XG4gICAgcmV0dXJuIGNhbmRpZGF0ZS5nZXRUaW1lKCkgPT09IHRvZGF5LmdldFRpbWUoKTtcbn07XG5cbmNvbnN0IGlzU3RhcnREYXRlID0gKHN0YXJ0RGF0ZSwgY2FuZGlkYXRlKSA9PiBzdGFydERhdGUuZ2V0VGltZSgpID09PSBjYW5kaWRhdGUuZ2V0VGltZSgpO1xuXG5jb25zdCBtb250aE1vZGVsID0gKHllYXIsIG1vbnRoLCBzdGFydERhdGUpID0+IHtcbiAgICBsZXQgdGhlTW9udGggPSBuZXcgRGF0ZSh5ZWFyLCBtb250aCArIDEsIDApLFxuICAgICAgICB0b3RhbERheXMgPSB0aGVNb250aC5nZXREYXRlKCksXG4gICAgICAgIGVuZERheSA9IHRoZU1vbnRoLmdldERheSgpLFxuICAgICAgICBzdGFydERheSxcbiAgICAgICAgcHJldk1vbnRoU3RhcnREYXkgPSBmYWxzZSxcbiAgICAgICAgcHJldk1vbnRoID0gbmV3IERhdGUoeWVhciwgbW9udGgsIDApLFxuICAgICAgICBwcmV2TW9udGhFbmREYXkgPSBwcmV2TW9udGguZ2V0RGF0ZSgpLFxuICAgICAgICBvdXRwdXQgPSBbXTtcblxuICAgIHRoZU1vbnRoLnNldERhdGUoMSk7XG4gICAgc3RhcnREYXkgPSB0aGVNb250aC5nZXREYXkoKTtcbiAgICBcbiAgICBpZihzdGFydERheSAhPT0gMSkge1xuICAgICAgICBpZihzdGFydERheSA9PT0gMCkgcHJldk1vbnRoU3RhcnREYXkgPSBwcmV2TW9udGguZ2V0RGF0ZSgpIC0gNTtcbiAgICAgICAgZWxzZSBwcmV2TW9udGhTdGFydERheSA9IHByZXZNb250aC5nZXREYXRlKCkgLSAoc3RhcnREYXkgLSAyKTtcbiAgICB9XG5cbiAgICBpZihwcmV2TW9udGhTdGFydERheSl7XG4gICAgICAgIHdoaWxlKHByZXZNb250aFN0YXJ0RGF5IDw9IHByZXZNb250aEVuZERheSl7XG4gICAgICAgICAgICBsZXQgdG1wRGF0ZSA9IG5ldyBEYXRlKHByZXZNb250aC5nZXRGdWxsWWVhcigpLCBwcmV2TW9udGguZ2V0TW9udGgoKSwgcHJldk1vbnRoU3RhcnREYXkpO1xuICAgICAgICAgICAgb3V0cHV0LnB1c2goe1xuICAgICAgICAgICAgICAgIG51bWJlcjogcHJldk1vbnRoU3RhcnREYXksXG4gICAgICAgICAgICAgICAgcHJldmlvdXNNb250aDogdHJ1ZSxcbiAgICAgICAgICAgICAgICBpc1RvZGF5OiBpc1RvZGF5KHRtcERhdGUpLFxuICAgICAgICAgICAgICAgIGlzU3RhcnREYXRlOiBzdGFydERhdGUgJiYgaXNTdGFydERhdGUoc3RhcnREYXRlLCB0bXBEYXRlKSB8fCBmYWxzZSxcblx0XHRcdFx0ZGF0ZTogdG1wRGF0ZVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBwcmV2TW9udGhTdGFydERheSsrO1xuICAgICAgICB9XG4gICAgfVxuICAgIGZvcihsZXQgaSA9IDE7IGkgPD0gdG90YWxEYXlzOyBpKyspIHtcbiAgICAgICAgbGV0IHRtcERhdGUgPSBuZXcgRGF0ZSh5ZWFyLCBtb250aCwgaSk7XG4gICAgICAgIG91dHB1dC5wdXNoKHsgXG4gICAgICAgICAgICBudW1iZXI6IGksXG4gICAgICAgICAgICBkYXRlOiB0bXBEYXRlLFxuICAgICAgICAgICAgaXNTdGFydERhdGU6IHN0YXJ0RGF0ZSAmJiBpc1N0YXJ0RGF0ZShzdGFydERhdGUsIHRtcERhdGUpIHx8IGZhbHNlLFxuICAgICAgICAgICAgaXNUb2RheTogaXNUb2RheSh0bXBEYXRlKVxuICAgICAgICB9KTtcbiAgICB9XG4gICAgaWYoZW5kRGF5ICE9PSAwKSBmb3IobGV0IGkgPSAxOyBpIDw9ICg3IC0gZW5kRGF5KTsgaSsrKSB7XG4gICAgICAgIGxldCB0bXBEYXRlID0gbmV3IERhdGUoeWVhciwgbW9udGggKyAxLCBpKTtcbiAgICAgICAgb3V0cHV0LnB1c2goeyBcbiAgICAgICAgICAgIG51bWJlcjogaSxcbiAgICAgICAgICAgIG5leHRNb250aDogdHJ1ZSxcbiAgICAgICAgICAgIGRhdGU6IHRtcERhdGUsXG4gICAgICAgICAgICBpc1N0YXJ0RGF0ZTogc3RhcnREYXRlICYmIGlzU3RhcnREYXRlKHN0YXJ0RGF0ZSwgdG1wRGF0ZSkgfHwgZmFsc2UsXG4gICAgICAgICAgICBpc1RvZGF5OiBpc1RvZGF5KHRtcERhdGUpXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4gb3V0cHV0O1xufTtcblxuZXhwb3J0IGNvbnN0IG1vbnRoVmlld0ZhY3RvcnkgPSAocm9vdERhdGUsIHN0YXJ0RGF0ZSkgPT4gKHtcblx0bW9kZWw6IG1vbnRoTW9kZWwocm9vdERhdGUuZ2V0RnVsbFllYXIoKSwgcm9vdERhdGUuZ2V0TW9udGgoKSwgc3RhcnREYXRlKSxcblx0bW9udGhUaXRsZTogbW9udGhOYW1lc1tyb290RGF0ZS5nZXRNb250aCgpXSxcblx0eWVhclRpdGxlOiByb290RGF0ZS5nZXRGdWxsWWVhcigpXG59KTtcblxuZXhwb3J0IGNvbnN0IGVsZW1lbnRGYWN0b3J5ID0gKHR5cGUsIGF0dHJpYnV0ZXMgPSB7fSwgY2xhc3NOYW1lKSA9PiB7XG4gICAgbGV0IGVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCh0eXBlKTtcblxuICAgIGZvcihsZXQgcHJvcCBpbiBhdHRyaWJ1dGVzKSBlbC5zZXRBdHRyaWJ1dGUocHJvcCwgYXR0cmlidXRlc1twcm9wXSk7XG4gICAgaWYoY2xhc3NOYW1lKSBlbC5jbGFzc05hbWUgPSBjbGFzc05hbWU7XG5cbiAgICByZXR1cm4gZWw7XG59O1xuXG5jb25zdCBmb2N1c2FibGVFbGVtZW50cyA9IFsnYVtocmVmXScsICdhcmVhW2hyZWZdJywgJ2lucHV0Om5vdChbZGlzYWJsZWRdKScsICdzZWxlY3Q6bm90KFtkaXNhYmxlZF0pJywgJ3RleHRhcmVhOm5vdChbZGlzYWJsZWRdKScsICdidXR0b246bm90KFtkaXNhYmxlZF0pJywgJ2lmcmFtZScsICdvYmplY3QnLCAnZW1iZWQnLCAnW2NvbnRlbnRlZGl0YWJsZV0nLCAnW3RhYmluZGV4XTpub3QoW3RhYmluZGV4PVwiLTFcIl0pJ107XG5cbmV4cG9ydCBjb25zdCBnZXRGb2N1c2FibGVDaGlsZHJlbiA9IG5vZGUgPT4gW10uc2xpY2UuY2FsbChub2RlLnF1ZXJ5U2VsZWN0b3JBbGwoZm9jdXNhYmxlRWxlbWVudHMuam9pbignLCcpKSkuZmlsdGVyKGNoaWxkID0+ICEhKGNoaWxkLm9mZnNldFdpZHRoIHx8IGNoaWxkLm9mZnNldEhlaWdodCB8fCBjaGlsZC5nZXRDbGllbnRSZWN0cygpLmxlbmd0aCkpOyIsIihmdW5jdGlvbiAobWFpbikge1xuICAndXNlIHN0cmljdCc7XG5cbiAgLyoqXG4gICAqIFBhcnNlIG9yIGZvcm1hdCBkYXRlc1xuICAgKiBAY2xhc3MgZmVjaGFcbiAgICovXG4gIHZhciBmZWNoYSA9IHt9O1xuICB2YXIgdG9rZW4gPSAvZHsxLDR9fE17MSw0fXxZWSg/OllZKT98U3sxLDN9fERvfFpafChbSGhNc0RtXSlcXDE/fFthQV18XCJbXlwiXSpcInwnW14nXSonL2c7XG4gIHZhciB0d29EaWdpdHMgPSAvXFxkXFxkPy87XG4gIHZhciB0aHJlZURpZ2l0cyA9IC9cXGR7M30vO1xuICB2YXIgZm91ckRpZ2l0cyA9IC9cXGR7NH0vO1xuICB2YXIgd29yZCA9IC9bMC05XSpbJ2EtelxcdTAwQTAtXFx1MDVGRlxcdTA3MDAtXFx1RDdGRlxcdUY5MDAtXFx1RkRDRlxcdUZERjAtXFx1RkZFRl0rfFtcXHUwNjAwLVxcdTA2RkZcXC9dKyhcXHMqP1tcXHUwNjAwLVxcdTA2RkZdKyl7MSwyfS9pO1xuICB2YXIgbGl0ZXJhbCA9IC9cXFsoW15dKj8pXFxdL2dtO1xuICB2YXIgbm9vcCA9IGZ1bmN0aW9uICgpIHtcbiAgfTtcblxuICBmdW5jdGlvbiBzaG9ydGVuKGFyciwgc0xlbikge1xuICAgIHZhciBuZXdBcnIgPSBbXTtcbiAgICBmb3IgKHZhciBpID0gMCwgbGVuID0gYXJyLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICBuZXdBcnIucHVzaChhcnJbaV0uc3Vic3RyKDAsIHNMZW4pKTtcbiAgICB9XG4gICAgcmV0dXJuIG5ld0FycjtcbiAgfVxuXG4gIGZ1bmN0aW9uIG1vbnRoVXBkYXRlKGFyck5hbWUpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKGQsIHYsIGkxOG4pIHtcbiAgICAgIHZhciBpbmRleCA9IGkxOG5bYXJyTmFtZV0uaW5kZXhPZih2LmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgdi5zdWJzdHIoMSkudG9Mb3dlckNhc2UoKSk7XG4gICAgICBpZiAofmluZGV4KSB7XG4gICAgICAgIGQubW9udGggPSBpbmRleDtcbiAgICAgIH1cbiAgICB9O1xuICB9XG5cbiAgZnVuY3Rpb24gcGFkKHZhbCwgbGVuKSB7XG4gICAgdmFsID0gU3RyaW5nKHZhbCk7XG4gICAgbGVuID0gbGVuIHx8IDI7XG4gICAgd2hpbGUgKHZhbC5sZW5ndGggPCBsZW4pIHtcbiAgICAgIHZhbCA9ICcwJyArIHZhbDtcbiAgICB9XG4gICAgcmV0dXJuIHZhbDtcbiAgfVxuXG4gIHZhciBkYXlOYW1lcyA9IFsnU3VuZGF5JywgJ01vbmRheScsICdUdWVzZGF5JywgJ1dlZG5lc2RheScsICdUaHVyc2RheScsICdGcmlkYXknLCAnU2F0dXJkYXknXTtcbiAgdmFyIG1vbnRoTmFtZXMgPSBbJ0phbnVhcnknLCAnRmVicnVhcnknLCAnTWFyY2gnLCAnQXByaWwnLCAnTWF5JywgJ0p1bmUnLCAnSnVseScsICdBdWd1c3QnLCAnU2VwdGVtYmVyJywgJ09jdG9iZXInLCAnTm92ZW1iZXInLCAnRGVjZW1iZXInXTtcbiAgdmFyIG1vbnRoTmFtZXNTaG9ydCA9IHNob3J0ZW4obW9udGhOYW1lcywgMyk7XG4gIHZhciBkYXlOYW1lc1Nob3J0ID0gc2hvcnRlbihkYXlOYW1lcywgMyk7XG4gIGZlY2hhLmkxOG4gPSB7XG4gICAgZGF5TmFtZXNTaG9ydDogZGF5TmFtZXNTaG9ydCxcbiAgICBkYXlOYW1lczogZGF5TmFtZXMsXG4gICAgbW9udGhOYW1lc1Nob3J0OiBtb250aE5hbWVzU2hvcnQsXG4gICAgbW9udGhOYW1lczogbW9udGhOYW1lcyxcbiAgICBhbVBtOiBbJ2FtJywgJ3BtJ10sXG4gICAgRG9GbjogZnVuY3Rpb24gRG9GbihEKSB7XG4gICAgICByZXR1cm4gRCArIFsndGgnLCAnc3QnLCAnbmQnLCAncmQnXVtEICUgMTAgPiAzID8gMCA6IChEIC0gRCAlIDEwICE9PSAxMCkgKiBEICUgMTBdO1xuICAgIH1cbiAgfTtcblxuICB2YXIgZm9ybWF0RmxhZ3MgPSB7XG4gICAgRDogZnVuY3Rpb24oZGF0ZU9iaikge1xuICAgICAgcmV0dXJuIGRhdGVPYmouZ2V0RGF0ZSgpO1xuICAgIH0sXG4gICAgREQ6IGZ1bmN0aW9uKGRhdGVPYmopIHtcbiAgICAgIHJldHVybiBwYWQoZGF0ZU9iai5nZXREYXRlKCkpO1xuICAgIH0sXG4gICAgRG86IGZ1bmN0aW9uKGRhdGVPYmosIGkxOG4pIHtcbiAgICAgIHJldHVybiBpMThuLkRvRm4oZGF0ZU9iai5nZXREYXRlKCkpO1xuICAgIH0sXG4gICAgZDogZnVuY3Rpb24oZGF0ZU9iaikge1xuICAgICAgcmV0dXJuIGRhdGVPYmouZ2V0RGF5KCk7XG4gICAgfSxcbiAgICBkZDogZnVuY3Rpb24oZGF0ZU9iaikge1xuICAgICAgcmV0dXJuIHBhZChkYXRlT2JqLmdldERheSgpKTtcbiAgICB9LFxuICAgIGRkZDogZnVuY3Rpb24oZGF0ZU9iaiwgaTE4bikge1xuICAgICAgcmV0dXJuIGkxOG4uZGF5TmFtZXNTaG9ydFtkYXRlT2JqLmdldERheSgpXTtcbiAgICB9LFxuICAgIGRkZGQ6IGZ1bmN0aW9uKGRhdGVPYmosIGkxOG4pIHtcbiAgICAgIHJldHVybiBpMThuLmRheU5hbWVzW2RhdGVPYmouZ2V0RGF5KCldO1xuICAgIH0sXG4gICAgTTogZnVuY3Rpb24oZGF0ZU9iaikge1xuICAgICAgcmV0dXJuIGRhdGVPYmouZ2V0TW9udGgoKSArIDE7XG4gICAgfSxcbiAgICBNTTogZnVuY3Rpb24oZGF0ZU9iaikge1xuICAgICAgcmV0dXJuIHBhZChkYXRlT2JqLmdldE1vbnRoKCkgKyAxKTtcbiAgICB9LFxuICAgIE1NTTogZnVuY3Rpb24oZGF0ZU9iaiwgaTE4bikge1xuICAgICAgcmV0dXJuIGkxOG4ubW9udGhOYW1lc1Nob3J0W2RhdGVPYmouZ2V0TW9udGgoKV07XG4gICAgfSxcbiAgICBNTU1NOiBmdW5jdGlvbihkYXRlT2JqLCBpMThuKSB7XG4gICAgICByZXR1cm4gaTE4bi5tb250aE5hbWVzW2RhdGVPYmouZ2V0TW9udGgoKV07XG4gICAgfSxcbiAgICBZWTogZnVuY3Rpb24oZGF0ZU9iaikge1xuICAgICAgcmV0dXJuIFN0cmluZyhkYXRlT2JqLmdldEZ1bGxZZWFyKCkpLnN1YnN0cigyKTtcbiAgICB9LFxuICAgIFlZWVk6IGZ1bmN0aW9uKGRhdGVPYmopIHtcbiAgICAgIHJldHVybiBkYXRlT2JqLmdldEZ1bGxZZWFyKCk7XG4gICAgfSxcbiAgICBoOiBmdW5jdGlvbihkYXRlT2JqKSB7XG4gICAgICByZXR1cm4gZGF0ZU9iai5nZXRIb3VycygpICUgMTIgfHwgMTI7XG4gICAgfSxcbiAgICBoaDogZnVuY3Rpb24oZGF0ZU9iaikge1xuICAgICAgcmV0dXJuIHBhZChkYXRlT2JqLmdldEhvdXJzKCkgJSAxMiB8fCAxMik7XG4gICAgfSxcbiAgICBIOiBmdW5jdGlvbihkYXRlT2JqKSB7XG4gICAgICByZXR1cm4gZGF0ZU9iai5nZXRIb3VycygpO1xuICAgIH0sXG4gICAgSEg6IGZ1bmN0aW9uKGRhdGVPYmopIHtcbiAgICAgIHJldHVybiBwYWQoZGF0ZU9iai5nZXRIb3VycygpKTtcbiAgICB9LFxuICAgIG06IGZ1bmN0aW9uKGRhdGVPYmopIHtcbiAgICAgIHJldHVybiBkYXRlT2JqLmdldE1pbnV0ZXMoKTtcbiAgICB9LFxuICAgIG1tOiBmdW5jdGlvbihkYXRlT2JqKSB7XG4gICAgICByZXR1cm4gcGFkKGRhdGVPYmouZ2V0TWludXRlcygpKTtcbiAgICB9LFxuICAgIHM6IGZ1bmN0aW9uKGRhdGVPYmopIHtcbiAgICAgIHJldHVybiBkYXRlT2JqLmdldFNlY29uZHMoKTtcbiAgICB9LFxuICAgIHNzOiBmdW5jdGlvbihkYXRlT2JqKSB7XG4gICAgICByZXR1cm4gcGFkKGRhdGVPYmouZ2V0U2Vjb25kcygpKTtcbiAgICB9LFxuICAgIFM6IGZ1bmN0aW9uKGRhdGVPYmopIHtcbiAgICAgIHJldHVybiBNYXRoLnJvdW5kKGRhdGVPYmouZ2V0TWlsbGlzZWNvbmRzKCkgLyAxMDApO1xuICAgIH0sXG4gICAgU1M6IGZ1bmN0aW9uKGRhdGVPYmopIHtcbiAgICAgIHJldHVybiBwYWQoTWF0aC5yb3VuZChkYXRlT2JqLmdldE1pbGxpc2Vjb25kcygpIC8gMTApLCAyKTtcbiAgICB9LFxuICAgIFNTUzogZnVuY3Rpb24oZGF0ZU9iaikge1xuICAgICAgcmV0dXJuIHBhZChkYXRlT2JqLmdldE1pbGxpc2Vjb25kcygpLCAzKTtcbiAgICB9LFxuICAgIGE6IGZ1bmN0aW9uKGRhdGVPYmosIGkxOG4pIHtcbiAgICAgIHJldHVybiBkYXRlT2JqLmdldEhvdXJzKCkgPCAxMiA/IGkxOG4uYW1QbVswXSA6IGkxOG4uYW1QbVsxXTtcbiAgICB9LFxuICAgIEE6IGZ1bmN0aW9uKGRhdGVPYmosIGkxOG4pIHtcbiAgICAgIHJldHVybiBkYXRlT2JqLmdldEhvdXJzKCkgPCAxMiA/IGkxOG4uYW1QbVswXS50b1VwcGVyQ2FzZSgpIDogaTE4bi5hbVBtWzFdLnRvVXBwZXJDYXNlKCk7XG4gICAgfSxcbiAgICBaWjogZnVuY3Rpb24oZGF0ZU9iaikge1xuICAgICAgdmFyIG8gPSBkYXRlT2JqLmdldFRpbWV6b25lT2Zmc2V0KCk7XG4gICAgICByZXR1cm4gKG8gPiAwID8gJy0nIDogJysnKSArIHBhZChNYXRoLmZsb29yKE1hdGguYWJzKG8pIC8gNjApICogMTAwICsgTWF0aC5hYnMobykgJSA2MCwgNCk7XG4gICAgfVxuICB9O1xuXG4gIHZhciBwYXJzZUZsYWdzID0ge1xuICAgIEQ6IFt0d29EaWdpdHMsIGZ1bmN0aW9uIChkLCB2KSB7XG4gICAgICBkLmRheSA9IHY7XG4gICAgfV0sXG4gICAgRG86IFtuZXcgUmVnRXhwKHR3b0RpZ2l0cy5zb3VyY2UgKyB3b3JkLnNvdXJjZSksIGZ1bmN0aW9uIChkLCB2KSB7XG4gICAgICBkLmRheSA9IHBhcnNlSW50KHYsIDEwKTtcbiAgICB9XSxcbiAgICBNOiBbdHdvRGlnaXRzLCBmdW5jdGlvbiAoZCwgdikge1xuICAgICAgZC5tb250aCA9IHYgLSAxO1xuICAgIH1dLFxuICAgIFlZOiBbdHdvRGlnaXRzLCBmdW5jdGlvbiAoZCwgdikge1xuICAgICAgdmFyIGRhID0gbmV3IERhdGUoKSwgY2VudCA9ICsoJycgKyBkYS5nZXRGdWxsWWVhcigpKS5zdWJzdHIoMCwgMik7XG4gICAgICBkLnllYXIgPSAnJyArICh2ID4gNjggPyBjZW50IC0gMSA6IGNlbnQpICsgdjtcbiAgICB9XSxcbiAgICBoOiBbdHdvRGlnaXRzLCBmdW5jdGlvbiAoZCwgdikge1xuICAgICAgZC5ob3VyID0gdjtcbiAgICB9XSxcbiAgICBtOiBbdHdvRGlnaXRzLCBmdW5jdGlvbiAoZCwgdikge1xuICAgICAgZC5taW51dGUgPSB2O1xuICAgIH1dLFxuICAgIHM6IFt0d29EaWdpdHMsIGZ1bmN0aW9uIChkLCB2KSB7XG4gICAgICBkLnNlY29uZCA9IHY7XG4gICAgfV0sXG4gICAgWVlZWTogW2ZvdXJEaWdpdHMsIGZ1bmN0aW9uIChkLCB2KSB7XG4gICAgICBkLnllYXIgPSB2O1xuICAgIH1dLFxuICAgIFM6IFsvXFxkLywgZnVuY3Rpb24gKGQsIHYpIHtcbiAgICAgIGQubWlsbGlzZWNvbmQgPSB2ICogMTAwO1xuICAgIH1dLFxuICAgIFNTOiBbL1xcZHsyfS8sIGZ1bmN0aW9uIChkLCB2KSB7XG4gICAgICBkLm1pbGxpc2Vjb25kID0gdiAqIDEwO1xuICAgIH1dLFxuICAgIFNTUzogW3RocmVlRGlnaXRzLCBmdW5jdGlvbiAoZCwgdikge1xuICAgICAgZC5taWxsaXNlY29uZCA9IHY7XG4gICAgfV0sXG4gICAgZDogW3R3b0RpZ2l0cywgbm9vcF0sXG4gICAgZGRkOiBbd29yZCwgbm9vcF0sXG4gICAgTU1NOiBbd29yZCwgbW9udGhVcGRhdGUoJ21vbnRoTmFtZXNTaG9ydCcpXSxcbiAgICBNTU1NOiBbd29yZCwgbW9udGhVcGRhdGUoJ21vbnRoTmFtZXMnKV0sXG4gICAgYTogW3dvcmQsIGZ1bmN0aW9uIChkLCB2LCBpMThuKSB7XG4gICAgICB2YXIgdmFsID0gdi50b0xvd2VyQ2FzZSgpO1xuICAgICAgaWYgKHZhbCA9PT0gaTE4bi5hbVBtWzBdKSB7XG4gICAgICAgIGQuaXNQbSA9IGZhbHNlO1xuICAgICAgfSBlbHNlIGlmICh2YWwgPT09IGkxOG4uYW1QbVsxXSkge1xuICAgICAgICBkLmlzUG0gPSB0cnVlO1xuICAgICAgfVxuICAgIH1dLFxuICAgIFpaOiBbLyhbXFwrXFwtXVxcZFxcZDo/XFxkXFxkfFopLywgZnVuY3Rpb24gKGQsIHYpIHtcbiAgICAgIGlmICh2ID09PSAnWicpIHYgPSAnKzAwOjAwJztcbiAgICAgIHZhciBwYXJ0cyA9ICh2ICsgJycpLm1hdGNoKC8oW1xcK1xcLV18XFxkXFxkKS9naSksIG1pbnV0ZXM7XG5cbiAgICAgIGlmIChwYXJ0cykge1xuICAgICAgICBtaW51dGVzID0gKyhwYXJ0c1sxXSAqIDYwKSArIHBhcnNlSW50KHBhcnRzWzJdLCAxMCk7XG4gICAgICAgIGQudGltZXpvbmVPZmZzZXQgPSBwYXJ0c1swXSA9PT0gJysnID8gbWludXRlcyA6IC1taW51dGVzO1xuICAgICAgfVxuICAgIH1dXG4gIH07XG4gIHBhcnNlRmxhZ3MuZGQgPSBwYXJzZUZsYWdzLmQ7XG4gIHBhcnNlRmxhZ3MuZGRkZCA9IHBhcnNlRmxhZ3MuZGRkO1xuICBwYXJzZUZsYWdzLkREID0gcGFyc2VGbGFncy5EO1xuICBwYXJzZUZsYWdzLm1tID0gcGFyc2VGbGFncy5tO1xuICBwYXJzZUZsYWdzLmhoID0gcGFyc2VGbGFncy5IID0gcGFyc2VGbGFncy5ISCA9IHBhcnNlRmxhZ3MuaDtcbiAgcGFyc2VGbGFncy5NTSA9IHBhcnNlRmxhZ3MuTTtcbiAgcGFyc2VGbGFncy5zcyA9IHBhcnNlRmxhZ3MucztcbiAgcGFyc2VGbGFncy5BID0gcGFyc2VGbGFncy5hO1xuXG5cbiAgLy8gU29tZSBjb21tb24gZm9ybWF0IHN0cmluZ3NcbiAgZmVjaGEubWFza3MgPSB7XG4gICAgZGVmYXVsdDogJ2RkZCBNTU0gREQgWVlZWSBISDptbTpzcycsXG4gICAgc2hvcnREYXRlOiAnTS9EL1lZJyxcbiAgICBtZWRpdW1EYXRlOiAnTU1NIEQsIFlZWVknLFxuICAgIGxvbmdEYXRlOiAnTU1NTSBELCBZWVlZJyxcbiAgICBmdWxsRGF0ZTogJ2RkZGQsIE1NTU0gRCwgWVlZWScsXG4gICAgc2hvcnRUaW1lOiAnSEg6bW0nLFxuICAgIG1lZGl1bVRpbWU6ICdISDptbTpzcycsXG4gICAgbG9uZ1RpbWU6ICdISDptbTpzcy5TU1MnXG4gIH07XG5cbiAgLyoqKlxuICAgKiBGb3JtYXQgYSBkYXRlXG4gICAqIEBtZXRob2QgZm9ybWF0XG4gICAqIEBwYXJhbSB7RGF0ZXxudW1iZXJ9IGRhdGVPYmpcbiAgICogQHBhcmFtIHtzdHJpbmd9IG1hc2sgRm9ybWF0IG9mIHRoZSBkYXRlLCBpLmUuICdtbS1kZC15eScgb3IgJ3Nob3J0RGF0ZSdcbiAgICovXG4gIGZlY2hhLmZvcm1hdCA9IGZ1bmN0aW9uIChkYXRlT2JqLCBtYXNrLCBpMThuU2V0dGluZ3MpIHtcbiAgICB2YXIgaTE4biA9IGkxOG5TZXR0aW5ncyB8fCBmZWNoYS5pMThuO1xuXG4gICAgaWYgKHR5cGVvZiBkYXRlT2JqID09PSAnbnVtYmVyJykge1xuICAgICAgZGF0ZU9iaiA9IG5ldyBEYXRlKGRhdGVPYmopO1xuICAgIH1cblxuICAgIGlmIChPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoZGF0ZU9iaikgIT09ICdbb2JqZWN0IERhdGVdJyB8fCBpc05hTihkYXRlT2JqLmdldFRpbWUoKSkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBEYXRlIGluIGZlY2hhLmZvcm1hdCcpO1xuICAgIH1cblxuICAgIG1hc2sgPSBmZWNoYS5tYXNrc1ttYXNrXSB8fCBtYXNrIHx8IGZlY2hhLm1hc2tzWydkZWZhdWx0J107XG5cbiAgICB2YXIgbGl0ZXJhbHMgPSBbXTtcblxuICAgIC8vIE1ha2UgbGl0ZXJhbHMgaW5hY3RpdmUgYnkgcmVwbGFjaW5nIHRoZW0gd2l0aCA/P1xuICAgIG1hc2sgPSBtYXNrLnJlcGxhY2UobGl0ZXJhbCwgZnVuY3Rpb24oJDAsICQxKSB7XG4gICAgICBsaXRlcmFscy5wdXNoKCQxKTtcbiAgICAgIHJldHVybiAnPz8nO1xuICAgIH0pO1xuICAgIC8vIEFwcGx5IGZvcm1hdHRpbmcgcnVsZXNcbiAgICBtYXNrID0gbWFzay5yZXBsYWNlKHRva2VuLCBmdW5jdGlvbiAoJDApIHtcbiAgICAgIHJldHVybiAkMCBpbiBmb3JtYXRGbGFncyA/IGZvcm1hdEZsYWdzWyQwXShkYXRlT2JqLCBpMThuKSA6ICQwLnNsaWNlKDEsICQwLmxlbmd0aCAtIDEpO1xuICAgIH0pO1xuICAgIC8vIElubGluZSBsaXRlcmFsIHZhbHVlcyBiYWNrIGludG8gdGhlIGZvcm1hdHRlZCB2YWx1ZVxuICAgIHJldHVybiBtYXNrLnJlcGxhY2UoL1xcP1xcPy9nLCBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBsaXRlcmFscy5zaGlmdCgpO1xuICAgIH0pO1xuICB9O1xuXG4gIC8qKlxuICAgKiBQYXJzZSBhIGRhdGUgc3RyaW5nIGludG8gYW4gb2JqZWN0LCBjaGFuZ2VzIC0gaW50byAvXG4gICAqIEBtZXRob2QgcGFyc2VcbiAgICogQHBhcmFtIHtzdHJpbmd9IGRhdGVTdHIgRGF0ZSBzdHJpbmdcbiAgICogQHBhcmFtIHtzdHJpbmd9IGZvcm1hdCBEYXRlIHBhcnNlIGZvcm1hdFxuICAgKiBAcmV0dXJucyB7RGF0ZXxib29sZWFufVxuICAgKi9cbiAgZmVjaGEucGFyc2UgPSBmdW5jdGlvbiAoZGF0ZVN0ciwgZm9ybWF0LCBpMThuU2V0dGluZ3MpIHtcbiAgICB2YXIgaTE4biA9IGkxOG5TZXR0aW5ncyB8fCBmZWNoYS5pMThuO1xuXG4gICAgaWYgKHR5cGVvZiBmb3JtYXQgIT09ICdzdHJpbmcnKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgZm9ybWF0IGluIGZlY2hhLnBhcnNlJyk7XG4gICAgfVxuXG4gICAgZm9ybWF0ID0gZmVjaGEubWFza3NbZm9ybWF0XSB8fCBmb3JtYXQ7XG5cbiAgICAvLyBBdm9pZCByZWd1bGFyIGV4cHJlc3Npb24gZGVuaWFsIG9mIHNlcnZpY2UsIGZhaWwgZWFybHkgZm9yIHJlYWxseSBsb25nIHN0cmluZ3NcbiAgICAvLyBodHRwczovL3d3dy5vd2FzcC5vcmcvaW5kZXgucGhwL1JlZ3VsYXJfZXhwcmVzc2lvbl9EZW5pYWxfb2ZfU2VydmljZV8tX1JlRG9TXG4gICAgaWYgKGRhdGVTdHIubGVuZ3RoID4gMTAwMCkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHZhciBpc1ZhbGlkID0gdHJ1ZTtcbiAgICB2YXIgZGF0ZUluZm8gPSB7fTtcbiAgICBmb3JtYXQucmVwbGFjZSh0b2tlbiwgZnVuY3Rpb24gKCQwKSB7XG4gICAgICBpZiAocGFyc2VGbGFnc1skMF0pIHtcbiAgICAgICAgdmFyIGluZm8gPSBwYXJzZUZsYWdzWyQwXTtcbiAgICAgICAgdmFyIGluZGV4ID0gZGF0ZVN0ci5zZWFyY2goaW5mb1swXSk7XG4gICAgICAgIGlmICghfmluZGV4KSB7XG4gICAgICAgICAgaXNWYWxpZCA9IGZhbHNlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGRhdGVTdHIucmVwbGFjZShpbmZvWzBdLCBmdW5jdGlvbiAocmVzdWx0KSB7XG4gICAgICAgICAgICBpbmZvWzFdKGRhdGVJbmZvLCByZXN1bHQsIGkxOG4pO1xuICAgICAgICAgICAgZGF0ZVN0ciA9IGRhdGVTdHIuc3Vic3RyKGluZGV4ICsgcmVzdWx0Lmxlbmd0aCk7XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBwYXJzZUZsYWdzWyQwXSA/ICcnIDogJDAuc2xpY2UoMSwgJDAubGVuZ3RoIC0gMSk7XG4gICAgfSk7XG5cbiAgICBpZiAoIWlzVmFsaWQpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICB2YXIgdG9kYXkgPSBuZXcgRGF0ZSgpO1xuICAgIGlmIChkYXRlSW5mby5pc1BtID09PSB0cnVlICYmIGRhdGVJbmZvLmhvdXIgIT0gbnVsbCAmJiArZGF0ZUluZm8uaG91ciAhPT0gMTIpIHtcbiAgICAgIGRhdGVJbmZvLmhvdXIgPSArZGF0ZUluZm8uaG91ciArIDEyO1xuICAgIH0gZWxzZSBpZiAoZGF0ZUluZm8uaXNQbSA9PT0gZmFsc2UgJiYgK2RhdGVJbmZvLmhvdXIgPT09IDEyKSB7XG4gICAgICBkYXRlSW5mby5ob3VyID0gMDtcbiAgICB9XG5cbiAgICB2YXIgZGF0ZTtcbiAgICBpZiAoZGF0ZUluZm8udGltZXpvbmVPZmZzZXQgIT0gbnVsbCkge1xuICAgICAgZGF0ZUluZm8ubWludXRlID0gKyhkYXRlSW5mby5taW51dGUgfHwgMCkgLSArZGF0ZUluZm8udGltZXpvbmVPZmZzZXQ7XG4gICAgICBkYXRlID0gbmV3IERhdGUoRGF0ZS5VVEMoZGF0ZUluZm8ueWVhciB8fCB0b2RheS5nZXRGdWxsWWVhcigpLCBkYXRlSW5mby5tb250aCB8fCAwLCBkYXRlSW5mby5kYXkgfHwgMSxcbiAgICAgICAgZGF0ZUluZm8uaG91ciB8fCAwLCBkYXRlSW5mby5taW51dGUgfHwgMCwgZGF0ZUluZm8uc2Vjb25kIHx8IDAsIGRhdGVJbmZvLm1pbGxpc2Vjb25kIHx8IDApKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZGF0ZSA9IG5ldyBEYXRlKGRhdGVJbmZvLnllYXIgfHwgdG9kYXkuZ2V0RnVsbFllYXIoKSwgZGF0ZUluZm8ubW9udGggfHwgMCwgZGF0ZUluZm8uZGF5IHx8IDEsXG4gICAgICAgIGRhdGVJbmZvLmhvdXIgfHwgMCwgZGF0ZUluZm8ubWludXRlIHx8IDAsIGRhdGVJbmZvLnNlY29uZCB8fCAwLCBkYXRlSW5mby5taWxsaXNlY29uZCB8fCAwKTtcbiAgICB9XG4gICAgcmV0dXJuIGRhdGU7XG4gIH07XG5cbiAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnICYmIG1vZHVsZS5leHBvcnRzKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBmZWNoYTtcbiAgfSBlbHNlIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICBkZWZpbmUoZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIGZlY2hhO1xuICAgIH0pO1xuICB9IGVsc2Uge1xuICAgIG1haW4uZmVjaGEgPSBmZWNoYTtcbiAgfVxufSkodGhpcyk7XG4iXX0=
