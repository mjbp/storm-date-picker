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

		this.inputClone = (0, _utils.elementFactory)('input', { type: 'text', tabindex: -1 }, 'field');
		this.input.setAttribute('type', 'hidden');
		this.node.appendChild(this.inputClone);

		this.inputClone.addEventListener('change', function (e) {
			_this.startDate = (0, _utils.parseDate)(_this.inputClone.value, _this.settings.valueFormat); //throws if parse error
		});

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
	toggle: function toggle() {
		if (this.isOpen) this.close();else this.open();
	},
	open: function open() {
		if (this.isOpen) return;
		this.renderCalendar();
		this.isOpen = true;
		this.workingDate = this.rootDate;
		this.container.querySelector('.sdp-day-btn--is-active') ? this.container.querySelector('.sdp-day-btn--is-active').focus() : this.container.querySelector('.sdp-day-btn--is-today') ? this.container.querySelector('.sdp-day-btn--is-today').focus() : this.container.querySelectorAll('.sdp-day-btn')[0].focus();
		document.body.addEventListener('focusout', this.boundHandleFocusOut);
	},
	close: function close() {
		if (!this.isOpen) return;
		this.node.removeChild(this.container);
		this.isOpen = false;
		this.btn.focus();
		this.workingDate = false;
	},
	handleFocusOut: function handleFocusOut() {
		var _this2 = this;

		window.setTimeout(function () {
			if (_this2.container.contains(document.activeElement)) return;
			_this2.close();
			document.body.removeEventListener('focusout', _this2.boundHandleFocusOut);
		}, 16);
	},
	renderCalendar: function renderCalendar() {
		this.container = (0, _utils.elementFactory)('div', {}, 'sdp-container');
		this.container.innerHTML = (0, _templates.calendar)();
		this.node.appendChild(this.container);
		this.monthContainer = document.querySelector('.js-sdp__month');
		this.renderMonth();
		this.initListeners();
	},
	renderMonth: function renderMonth() {
		this.monthView = (0, _utils.monthViewFactory)(this.workingDate || this.rootDate, this.startDate);
		this.monthContainer.innerHTML = (0, _templates.month)(this.monthView);
		if (!this.container.querySelector('.sdp-day-btn[tabindex="0"]')) [].slice.call(this.container.querySelectorAll('.sdp-day-btn:not([disabled])')).shift().setAttribute('tabindex', '0');
	},
	initListeners: function initListeners() {
		var _this3 = this;

		_constants.TRIGGER_EVENTS.forEach(function (ev) {
			_this3.container.addEventListener(ev, _this3.routeHandlers.bind(_this3));
		});
	},
	routeHandlers: function routeHandlers(e) {
		if (e.keyCode) this.handleKeyDown(e);else {
			if (e.target.classList.contains('js-sdp-nav__btn') || e.target.parentNode.classList.contains('js-sdp-nav__btn')) this.handleNav(+(e.target.getAttribute('data-action') || e.target.parentNode.getAttribute('data-action')));
			if (e.target.classList.contains('sdp-day-btn')) this.selectDate(e);
		}
	},
	handleNav: function handleNav(action) {
		this.workingDate = new Date(this.workingDate.getFullYear(), this.workingDate.getMonth() + action);
		this.renderMonth();
	},
	handleKeyDown: function handleKeyDown(e) {
		var keyDownDictionary = {
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
				if (e.target.classList.contains('js-sdp-nav__btn')) this.handleNav(+e.target.getAttribute('data-action'));
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
	},
	getValue: function getValue() {
		return this.startDate;
	}
};

/*

	Left: Move focus to the previous day. Will move to the last day of the previous month, if the current day is the first day of a month.
	Right: Move focus to the next day. Will move to the first day of the following month, if the current day is the last day of a month.
	Up: Move focus to the same day of the previous week. Will wrap to the appropriate day in the previous month.
	Down: Move focus to the same day of the following week. Will wrap to the appropriate day in the following month.
	Tab: Navigate between calander grid and previous/next selection buttons
	Enter/Space: Select date
	Escape: close calendar, no change

*/

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJleGFtcGxlL3NyYy9hcHAuanMiLCJleGFtcGxlL3NyYy9saWJzL2NvbXBvbmVudC9pbmRleC5qcyIsImV4YW1wbGUvc3JjL2xpYnMvY29tcG9uZW50L2xpYi9jb21wb25lbnQtcHJvdG90eXBlLmpzIiwiZXhhbXBsZS9zcmMvbGlicy9jb21wb25lbnQvbGliL2NvbnN0YW50cy5qcyIsImV4YW1wbGUvc3JjL2xpYnMvY29tcG9uZW50L2xpYi9kZWZhdWx0cy5qcyIsImV4YW1wbGUvc3JjL2xpYnMvY29tcG9uZW50L2xpYi90ZW1wbGF0ZXMuanMiLCJleGFtcGxlL3NyYy9saWJzL2NvbXBvbmVudC9saWIvdXRpbHMuanMiLCJub2RlX21vZHVsZXMvZmVjaGEvZmVjaGEuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztBQ0FBOzs7Ozs7OztBQUVBLElBQU0sMkJBQTJCLFlBQU0sQUFDbkM7V0FBQSxBQUFPLGFBQWEsb0JBQUEsQUFBVyxLQUEvQixBQUFvQixBQUFnQixBQUN2QztBQUZELEFBQWdDLENBQUE7O0FBSWhDLElBQUcsc0JBQUgsQUFBeUIsZUFBUSxBQUFPLGlCQUFQLEFBQXdCLG9CQUFvQixZQUFNLEFBQUU7NEJBQUEsQUFBd0IsUUFBUSxVQUFBLEFBQUMsSUFBRDtlQUFBLEFBQVE7QUFBeEMsQUFBZ0Q7QUFBcEcsQ0FBQTs7Ozs7Ozs7O0FDTmpDOzs7O0FBQ0E7Ozs7Ozs7O0FBRUEsSUFBTSxPQUFPLFNBQVAsQUFBTyxLQUFBLEFBQUMsS0FBRCxBQUFNLE1BQVMsQUFDM0I7S0FBSSxNQUFNLEdBQUEsQUFBRyxNQUFILEFBQVMsS0FBSyxTQUFBLEFBQVMsaUJBQWpDLEFBQVUsQUFBYyxBQUEwQixBQUMvQztBQUVIOztLQUFHLENBQUMsSUFBSixBQUFRLFFBQVEsT0FBTyxRQUFBLEFBQVEsS0FBZixBQUFPLEFBQWEsQUFFcEM7O1lBQU8sQUFBSSxJQUFJLFVBQUEs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QTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiaW1wb3J0IERhdGVQaWNrZXIgZnJvbSAnLi9saWJzL2NvbXBvbmVudCc7XG5cbmNvbnN0IG9uRE9NQ29udGVudExvYWRlZFRhc2tzID0gWygpID0+IHtcbiAgICB3aW5kb3cuRGF0ZVBpY2tlciA9IERhdGVQaWNrZXIuaW5pdCgnLmpzLWRhdGUtcGlja2VyJyk7XG59XTtcbiAgICBcbmlmKCdhZGRFdmVudExpc3RlbmVyJyBpbiB3aW5kb3cpIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgKCkgPT4geyBvbkRPTUNvbnRlbnRMb2FkZWRUYXNrcy5mb3JFYWNoKChmbikgPT4gZm4oKSk7IH0pOyIsImltcG9ydCBkZWZhdWx0cyBmcm9tICcuL2xpYi9kZWZhdWx0cyc7XG5pbXBvcnQgY29tcG9uZW50UHJvdG90eXBlIGZyb20gJy4vbGliL2NvbXBvbmVudC1wcm90b3R5cGUnO1xuXG5jb25zdCBpbml0ID0gKHNlbCwgb3B0cykgPT4ge1xuXHRsZXQgZWxzID0gW10uc2xpY2UuY2FsbChkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKHNlbCkpO1xuICAgIC8vbGV0IGVscyA9IEFycmF5LmZyb20oZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChzZWwpKTtcblxuXHRpZighZWxzLmxlbmd0aCkgcmV0dXJuIGNvbnNvbGUud2FybignRGF0ZSBwaWNrZXIgbm90IGluaXRpYWxpc2VkLCBubyBhdWdtZW50YWJsZSBlbGVtZW50cyBmb3VuZCcpO1xuICAgIFxuXHRyZXR1cm4gZWxzLm1hcCgoZWwpID0+IHtcblx0XHRyZXR1cm4gT2JqZWN0LmFzc2lnbihPYmplY3QuY3JlYXRlKGNvbXBvbmVudFByb3RvdHlwZSksIHtcblx0XHRcdG5vZGU6IGVsLCBcblx0XHRcdGlucHV0OiBlbC5xdWVyeVNlbGVjdG9yKCdpbnB1dCcpLFxuXHRcdFx0YnRuOiBlbC5xdWVyeVNlbGVjdG9yKCcuYnRuJyksXG5cdFx0XHRzZXR0aW5nczogT2JqZWN0LmFzc2lnbih7fSwgZGVmYXVsdHMsIG9wdHMpXG5cdFx0fSkuaW5pdCgpO1xuXHR9KTtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IHsgaW5pdCB9OyIsImltcG9ydCB7IFxuXHRlbGVtZW50RmFjdG9yeSxcblx0bW9udGhWaWV3RmFjdG9yeSxcblx0Y2F0Y2hCdWJibGUsXG5cdG1vbnRoTmFtZXMsXG5cdGRheU5hbWVzLFxuXHRnZXRNb250aExlbmd0aCxcblx0cGFyc2VEYXRlLFxuXHRmb3JtYXREYXRlXG59IGZyb20gJy4vdXRpbHMnO1xuaW1wb3J0IHsgY2FsZW5kYXIsIG1vbnRoIH0gZnJvbSAnLi90ZW1wbGF0ZXMnO1xuaW1wb3J0IHsgVFJJR0dFUl9FVkVOVFMsIFRSSUdHRVJfS0VZQ09ERVMsIEtFWUNPREVTIH0gZnJvbSAnLi9jb25zdGFudHMnO1xuXG5leHBvcnQgZGVmYXVsdCB7XG5cdGluaXQoKSB7XG5cdFx0dGhpcy5pbnB1dENsb25lID0gZWxlbWVudEZhY3RvcnkoJ2lucHV0JywgeyB0eXBlOiAndGV4dCcsIHRhYmluZGV4OiAtMSB9LCAnZmllbGQnKTtcblx0XHR0aGlzLmlucHV0LnNldEF0dHJpYnV0ZSgndHlwZScsICdoaWRkZW4nKTtcblx0XHR0aGlzLm5vZGUuYXBwZW5kQ2hpbGQodGhpcy5pbnB1dENsb25lKTtcblxuXHRcdHRoaXMuaW5wdXRDbG9uZS5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCBlID0+IHtcblx0XHRcdHRoaXMuc3RhcnREYXRlID0gcGFyc2VEYXRlKHRoaXMuaW5wdXRDbG9uZS52YWx1ZSwgdGhpcy5zZXR0aW5ncy52YWx1ZUZvcm1hdCk7Ly90aHJvd3MgaWYgcGFyc2UgZXJyb3Jcblx0XHR9KTtcblxuXHRcdFRSSUdHRVJfRVZFTlRTLmZvckVhY2goZXYgPT4ge1xuXHRcdFx0dGhpcy5idG4uYWRkRXZlbnRMaXN0ZW5lcihldiwgZSA9PiB7XG5cdFx0XHRcdGlmKCEhZS5rZXlDb2RlICYmICF+VFJJR0dFUl9LRVlDT0RFUy5pbmRleE9mKGUua2V5Q29kZSkpIHJldHVybjtcblx0XHRcdFx0Y2F0Y2hCdWJibGUoZSk7XG5cdFx0XHRcdHRoaXMudG9nZ2xlKCk7XG5cdFx0XHR9KTtcblx0XHR9KTtcblxuXHRcdHRoaXMuYm91bmRIYW5kbGVGb2N1c091dCA9IHRoaXMuaGFuZGxlRm9jdXNPdXQuYmluZCh0aGlzKTtcblxuXHRcdHRoaXMuc3RhcnREYXRlID0gdGhpcy5pbnB1dC52YWx1ZSA/IHBhcnNlRGF0ZSh0aGlzLmlucHV0LnZhbHVlLCB0aGlzLnNldHRpbmdzLnZhbHVlRm9ybWF0KSA6IGZhbHNlO1xuXHRcdGlmKHRoaXMuc3RhcnREYXRlKSB0aGlzLmlucHV0Q2xvbmUudmFsdWUgPSBmb3JtYXREYXRlKHRoaXMuc3RhcnREYXRlLCB0aGlzLnNldHRpbmdzLmRpc3BsYXlGb3JtYXQpO1xuXG5cdFx0dGhpcy5yb290RGF0ZSA9IHRoaXMuc3RhcnREYXRlIHx8IG5ldyBEYXRlKCk7XG5cdFx0dGhpcy5yb290RGF0ZS5zZXRIb3VycygwLDAsMCwwKTtcblxuXHRcdHRoaXMuc2V0dGluZ3Muc3RhcnRPcGVuICYmIHRoaXMub3BlbigpO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9LFxuXHR0b2dnbGUoKXtcblx0XHRpZih0aGlzLmlzT3BlbikgdGhpcy5jbG9zZSgpO1xuXHRcdGVsc2UgdGhpcy5vcGVuKCk7XG5cdH0sXG5cdG9wZW4oKXtcblx0XHRpZih0aGlzLmlzT3BlbikgcmV0dXJuO1xuXHRcdHRoaXMucmVuZGVyQ2FsZW5kYXIoKTtcblx0XHR0aGlzLmlzT3BlbiA9IHRydWU7XG5cdFx0dGhpcy53b3JraW5nRGF0ZSA9IHRoaXMucm9vdERhdGU7XG5cdFx0dGhpcy5jb250YWluZXIucXVlcnlTZWxlY3RvcignLnNkcC1kYXktYnRuLS1pcy1hY3RpdmUnKSA/IHRoaXMuY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoJy5zZHAtZGF5LWJ0bi0taXMtYWN0aXZlJykuZm9jdXMoKSA6IHRoaXMuY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoJy5zZHAtZGF5LWJ0bi0taXMtdG9kYXknKSA/IHRoaXMuY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoJy5zZHAtZGF5LWJ0bi0taXMtdG9kYXknKS5mb2N1cygpIDogdGhpcy5jb250YWluZXIucXVlcnlTZWxlY3RvckFsbCgnLnNkcC1kYXktYnRuJylbMF0uZm9jdXMoKTtcblx0XHRkb2N1bWVudC5ib2R5LmFkZEV2ZW50TGlzdGVuZXIoJ2ZvY3Vzb3V0JywgdGhpcy5ib3VuZEhhbmRsZUZvY3VzT3V0KTtcblx0fSxcblx0Y2xvc2UoKXtcblx0XHRpZighdGhpcy5pc09wZW4pIHJldHVybjtcblx0XHR0aGlzLm5vZGUucmVtb3ZlQ2hpbGQodGhpcy5jb250YWluZXIpO1xuXHRcdHRoaXMuaXNPcGVuID0gZmFsc2U7XG5cdFx0dGhpcy5idG4uZm9jdXMoKTtcblx0XHR0aGlzLndvcmtpbmdEYXRlID0gZmFsc2U7XG5cdH0sXG5cdGhhbmRsZUZvY3VzT3V0KCl7XG5cdFx0d2luZG93LnNldFRpbWVvdXQoKCkgPT4ge1xuXHRcdFx0aWYodGhpcy5jb250YWluZXIuY29udGFpbnMoZG9jdW1lbnQuYWN0aXZlRWxlbWVudCkpIHJldHVybjtcblx0XHRcdHRoaXMuY2xvc2UoKTtcblx0XHRcdGRvY3VtZW50LmJvZHkucmVtb3ZlRXZlbnRMaXN0ZW5lcignZm9jdXNvdXQnLCB0aGlzLmJvdW5kSGFuZGxlRm9jdXNPdXQpO1xuXHRcdH0sIDE2KTtcblx0fSxcblx0cmVuZGVyQ2FsZW5kYXIoKXtcblx0XHR0aGlzLmNvbnRhaW5lciA9IGVsZW1lbnRGYWN0b3J5KCdkaXYnLCB7fSwgJ3NkcC1jb250YWluZXInKTtcblx0XHR0aGlzLmNvbnRhaW5lci5pbm5lckhUTUwgPSBjYWxlbmRhcigpO1xuXHRcdHRoaXMubm9kZS5hcHBlbmRDaGlsZCh0aGlzLmNvbnRhaW5lcik7XG5cdFx0dGhpcy5tb250aENvbnRhaW5lciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy1zZHBfX21vbnRoJyk7XG5cdFx0dGhpcy5yZW5kZXJNb250aCgpO1xuXHRcdHRoaXMuaW5pdExpc3RlbmVycygpO1xuXHR9LFxuXHRyZW5kZXJNb250aCgpe1xuXHRcdHRoaXMubW9udGhWaWV3ID0gbW9udGhWaWV3RmFjdG9yeSh0aGlzLndvcmtpbmdEYXRlIHx8IHRoaXMucm9vdERhdGUsIHRoaXMuc3RhcnREYXRlKTtcblx0XHR0aGlzLm1vbnRoQ29udGFpbmVyLmlubmVySFRNTCA9IG1vbnRoKHRoaXMubW9udGhWaWV3KTtcblx0XHRpZighdGhpcy5jb250YWluZXIucXVlcnlTZWxlY3RvcignLnNkcC1kYXktYnRuW3RhYmluZGV4PVwiMFwiXScpKSBbXS5zbGljZS5jYWxsKHRoaXMuY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3JBbGwoJy5zZHAtZGF5LWJ0bjpub3QoW2Rpc2FibGVkXSknKSkuc2hpZnQoKS5zZXRBdHRyaWJ1dGUoJ3RhYmluZGV4JywgJzAnKTtcblx0fSxcblx0aW5pdExpc3RlbmVycygpe1xuXHRcdFRSSUdHRVJfRVZFTlRTLmZvckVhY2goZXYgPT4ge1xuXHRcdFx0dGhpcy5jb250YWluZXIuYWRkRXZlbnRMaXN0ZW5lcihldiwgdGhpcy5yb3V0ZUhhbmRsZXJzLmJpbmQodGhpcykpO1xuXHRcdH0pO1xuXHR9LFxuXHRyb3V0ZUhhbmRsZXJzKGUpe1xuXHRcdGlmKGUua2V5Q29kZSkgdGhpcy5oYW5kbGVLZXlEb3duKGUpO1xuXHRcdGVsc2Uge1xuXHRcdFx0aWYoZS50YXJnZXQuY2xhc3NMaXN0LmNvbnRhaW5zKCdqcy1zZHAtbmF2X19idG4nKSB8fCBlLnRhcmdldC5wYXJlbnROb2RlLmNsYXNzTGlzdC5jb250YWlucygnanMtc2RwLW5hdl9fYnRuJykpIHRoaXMuaGFuZGxlTmF2KCsoZS50YXJnZXQuZ2V0QXR0cmlidXRlKCdkYXRhLWFjdGlvbicpIHx8IGUudGFyZ2V0LnBhcmVudE5vZGUuZ2V0QXR0cmlidXRlKCdkYXRhLWFjdGlvbicpKSk7XG5cdFx0XHRpZihlLnRhcmdldC5jbGFzc0xpc3QuY29udGFpbnMoJ3NkcC1kYXktYnRuJykpIHRoaXMuc2VsZWN0RGF0ZShlKTtcblx0XHR9XG5cdH0sXG5cdGhhbmRsZU5hdihhY3Rpb24pe1xuXHRcdHRoaXMud29ya2luZ0RhdGUgPSBuZXcgRGF0ZSh0aGlzLndvcmtpbmdEYXRlLmdldEZ1bGxZZWFyKCksIHRoaXMud29ya2luZ0RhdGUuZ2V0TW9udGgoKSArIGFjdGlvbik7XG5cdFx0dGhpcy5yZW5kZXJNb250aCgpO1xuXHR9LFxuXHRoYW5kbGVLZXlEb3duKGUpe1xuXHRcdGNvbnN0IGtleURvd25EaWN0aW9uYXJ5ID0ge1xuXHRcdFx0VEFCKCl7XG5cdFx0XHRcdC8qIFxuXHRcdFx0XHRcdC0gdHJhcCB0YWIgaW4gZm9jdXNhYmxlIGNoaWxkcmVuPz9cblx0XHRcdFx0XHRcdCAtIHJldHVybiB0byBidXR0b24gYWZ0ZXIgbGFzdCBmb2N1c2FibGUgY2hpbGQ/XG5cdFx0XHRcdFx0LSByZWYuIGh0dHBzOi8vZ2l0aHViLmNvbS9tamJwL3N0b3JtLWZvY3VzLW1hbmFnZXIvYmxvYi9tYXN0ZXIvc3JjL3N0b3JtLWZvY3VzLW1hbmFnZXIuanNcblx0XHRcdFx0Ki9cblx0XHRcdH0sXG5cdFx0XHRFTlRFUihlKXtcblx0XHRcdFx0Y2F0Y2hCdWJibGUoZSk7XG5cdFx0XHRcdGlmKGUudGFyZ2V0LmNsYXNzTGlzdC5jb250YWlucygnc2RwLWRheS1idG4nKSkgdGhpcy5zZWxlY3REYXRlKGUpO1xuXHRcdFx0XHRpZihlLnRhcmdldC5jbGFzc0xpc3QuY29udGFpbnMoJ2pzLXNkcC1uYXZfX2J0bicpKSB0aGlzLmhhbmRsZU5hdigrZS50YXJnZXQuZ2V0QXR0cmlidXRlKCdkYXRhLWFjdGlvbicpKTtcblx0XHRcdH0sXG5cdFx0XHRFU0NBUEUoKXsgdGhpcy5jbG9zZSgpOyB9LFxuXHRcdFx0U1BBQ0UoZSkgeyBrZXlEb3duRGljdGlvbmFyeS5FTlRFUihlKTsgfSxcblx0XHRcdExFRlQoZSl7XG5cdFx0XHRcdGNhdGNoQnViYmxlKGUpO1xuXHRcdFx0XHRpZighZS50YXJnZXQuY2xhc3NMaXN0LmNvbnRhaW5zKCdzZHAtZGF5LWJ0bicpKSByZXR1cm47XG5cblx0XHRcdFx0aWYodGhpcy5tb250aFZpZXcubW9kZWxbK2UudGFyZ2V0LmdldEF0dHJpYnV0ZSgnZGF0YS1tb2RlbC1pbmRleCcpXS5udW1iZXIgPT09IDEpIHtcblx0XHRcdFx0XHR0aGlzLndvcmtpbmdEYXRlID0gbmV3IERhdGUodGhpcy53b3JraW5nRGF0ZS5nZXRGdWxsWWVhcigpLCB0aGlzLndvcmtpbmdEYXRlLmdldE1vbnRoKCkgLSAxKTtcblx0XHRcdFx0XHR0aGlzLnJlbmRlck1vbnRoKCk7XG5cdFx0XHRcdFx0W10uc2xpY2UuY2FsbCh0aGlzLmNvbnRhaW5lci5xdWVyeVNlbGVjdG9yQWxsKCcuc2RwLWRheS1ib2R5Om5vdCguc2RwLWRheS1kaXNhYmxlZCknKSkucG9wKCkuZmlyc3RFbGVtZW50Q2hpbGQuZm9jdXMoKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNlIHRoaXMuY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoYFtkYXRhLW1vZGVsLWluZGV4PVwiJHsrZS50YXJnZXQuZ2V0QXR0cmlidXRlKCdkYXRhLW1vZGVsLWluZGV4JykgLSAxfVwiXWApLmZvY3VzKCk7XG5cdFx0XHR9LFxuXHRcdFx0VVAoKXtcblx0XHRcdFx0Y2F0Y2hCdWJibGUoZSk7XG5cdFx0XHRcdGlmKCFlLnRhcmdldC5jbGFzc0xpc3QuY29udGFpbnMoJ3NkcC1kYXktYnRuJykpIHJldHVybjtcblx0XHRcdFx0XG5cdFx0XHRcdGxldCBuZXh0RGF5SW5kZXggPSArZS50YXJnZXQuZ2V0QXR0cmlidXRlKCdkYXRhLW1vZGVsLWluZGV4JykgLSA3O1xuXG5cdFx0XHRcdGlmKCt0aGlzLm1vbnRoVmlldy5tb2RlbFsrZS50YXJnZXQuZ2V0QXR0cmlidXRlKCdkYXRhLW1vZGVsLWluZGV4JyldLm51bWJlciAtIDcgPCAxKSB7XG5cdFx0XHRcdFx0dGhpcy53b3JraW5nRGF0ZSA9IG5ldyBEYXRlKHRoaXMud29ya2luZ0RhdGUuZ2V0RnVsbFllYXIoKSwgdGhpcy53b3JraW5nRGF0ZS5nZXRNb250aCgpIC0gMSk7XG5cdFx0XHRcdFx0dGhpcy5yZW5kZXJNb250aCgpO1xuXHRcdFx0XHRcdC8vdXNlIHRoaXMud29ya2luZ0RhdGUgaW5zdGVhZCBvZiBxdWVyeWluZyBET00/XG5cdFx0XHRcdFx0aWYoIXRoaXMuY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoYFtkYXRhLW1vZGVsLWluZGV4PVwiJHt0aGlzLm1vbnRoVmlldy5tb2RlbC5sZW5ndGggKyBuZXh0RGF5SW5kZXh9XCJdYCl8fCB0aGlzLmNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKGBbZGF0YS1tb2RlbC1pbmRleD1cIiR7dGhpcy5tb250aFZpZXcubW9kZWwubGVuZ3RoICsgbmV4dERheUluZGV4fVwiXWApICYmIHRoaXMuY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoYFtkYXRhLW1vZGVsLWluZGV4PVwiJHt0aGlzLm1vbnRoVmlldy5tb2RlbC5sZW5ndGggKyBuZXh0RGF5SW5kZXh9XCJdYCkuaGFzQXR0cmlidXRlKCdkaXNhYmxlZCcpKSBcblx0XHRcdFx0XHRcdHRoaXMuY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoYFtkYXRhLW1vZGVsLWluZGV4PVwiJHt0aGlzLm1vbnRoVmlldy5tb2RlbC5sZW5ndGggKyAobmV4dERheUluZGV4IC0gNyl9XCJdYCkuZm9jdXMoKTtcblx0XHRcdFx0XHRlbHNlIHRoaXMuY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoYFtkYXRhLW1vZGVsLWluZGV4PVwiJHt0aGlzLm1vbnRoVmlldy5tb2RlbC5sZW5ndGggKyBuZXh0RGF5SW5kZXh9XCJdYCkuZm9jdXMoKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNlIHRoaXMuY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoYFtkYXRhLW1vZGVsLWluZGV4PVwiJHtuZXh0RGF5SW5kZXh9XCJdYCkuZm9jdXMoKTtcblx0XHRcdH0sXG5cdFx0XHRSSUdIVChlKXtcblx0XHRcdFx0Y2F0Y2hCdWJibGUoZSk7XG5cdFx0XHRcdGlmKCFlLnRhcmdldC5jbGFzc0xpc3QuY29udGFpbnMoJ3NkcC1kYXktYnRuJykpIHJldHVybjtcblx0XHRcdFx0XG5cdFx0XHRcdGlmKHRoaXMubW9udGhWaWV3Lm1vZGVsWytlLnRhcmdldC5nZXRBdHRyaWJ1dGUoJ2RhdGEtbW9kZWwtaW5kZXgnKV0ubnVtYmVyID09PSBnZXRNb250aExlbmd0aCh0aGlzLm1vbnRoVmlldy5tb2RlbFsrZS50YXJnZXQuZ2V0QXR0cmlidXRlKCdkYXRhLW1vZGVsLWluZGV4JyldLmRhdGUuZ2V0RnVsbFllYXIoKSwgdGhpcy5tb250aFZpZXcubW9kZWxbK2UudGFyZ2V0LmdldEF0dHJpYnV0ZSgnZGF0YS1tb2RlbC1pbmRleCcpXS5kYXRlLmdldE1vbnRoKCkpKSB7XG5cdFx0XHRcdFx0dGhpcy53b3JraW5nRGF0ZSA9IG5ldyBEYXRlKHRoaXMud29ya2luZ0RhdGUuZ2V0RnVsbFllYXIoKSwgdGhpcy53b3JraW5nRGF0ZS5nZXRNb250aCgpICsgMSk7XG5cdFx0XHRcdFx0dGhpcy5yZW5kZXJNb250aCgpO1xuXHRcdFx0XHRcdFtdLnNsaWNlLmNhbGwodGhpcy5jb250YWluZXIucXVlcnlTZWxlY3RvckFsbCgnLnNkcC1kYXktYm9keTpub3QoLnNkcC1kYXktZGlzYWJsZWQpJykpLnNoaWZ0KCkuZmlyc3RFbGVtZW50Q2hpbGQuZm9jdXMoKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNlIHRoaXMuY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoYFtkYXRhLW1vZGVsLWluZGV4PVwiJHsrZS50YXJnZXQuZ2V0QXR0cmlidXRlKCdkYXRhLW1vZGVsLWluZGV4JykgKyAxfVwiXWApLmZvY3VzKCk7XG5cdFx0XHRcdFxuXHRcdFx0fSxcblx0XHRcdERPV04oKXtcblx0XHRcdFx0Y2F0Y2hCdWJibGUoZSk7XG5cdFx0XHRcdGlmKCFlLnRhcmdldC5jbGFzc0xpc3QuY29udGFpbnMoJ3NkcC1kYXktYnRuJykpIHJldHVybjtcblxuXHRcdFx0XHRsZXQgbmV4dERhdGUgPSArdGhpcy5tb250aFZpZXcubW9kZWxbK2UudGFyZ2V0LmdldEF0dHJpYnV0ZSgnZGF0YS1tb2RlbC1pbmRleCcpXS5udW1iZXIgKyA3LFxuXHRcdFx0XHRcdG5leHREYXlJbmRleCA9ICtlLnRhcmdldC5nZXRBdHRyaWJ1dGUoJ2RhdGEtbW9kZWwtaW5kZXgnKSArIDc7XG5cblx0XHRcdFx0aWYoK3RoaXMubW9udGhWaWV3Lm1vZGVsWytlLnRhcmdldC5nZXRBdHRyaWJ1dGUoJ2RhdGEtbW9kZWwtaW5kZXgnKV0ubnVtYmVyICsgNyA+IGdldE1vbnRoTGVuZ3RoKHRoaXMubW9udGhWaWV3Lm1vZGVsWytlLnRhcmdldC5nZXRBdHRyaWJ1dGUoJ2RhdGEtbW9kZWwtaW5kZXgnKV0uZGF0ZS5nZXRGdWxsWWVhcigpLCB0aGlzLm1vbnRoVmlldy5tb2RlbFsrZS50YXJnZXQuZ2V0QXR0cmlidXRlKCdkYXRhLW1vZGVsLWluZGV4JyldLmRhdGUuZ2V0TW9udGgoKSkpIHtcblx0XHRcdFx0XHR0aGlzLndvcmtpbmdEYXRlID0gbmV3IERhdGUodGhpcy53b3JraW5nRGF0ZS5nZXRGdWxsWWVhcigpLCB0aGlzLndvcmtpbmdEYXRlLmdldE1vbnRoKCkgKyAxKTtcblx0XHRcdFx0XHR0aGlzLnJlbmRlck1vbnRoKCk7XG5cdFx0XHRcdFx0Ly91c2UgdGhpcy53b3JraW5nRGF0ZSBpbnN0ZWFkIG9mIHF1ZXJ5aW5nIERPTT9cblx0XHRcdFx0XHRpZih0aGlzLmNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKGBbZGF0YS1tb2RlbC1pbmRleD1cIiR7bmV4dERheUluZGV4ICUgN31cIl1gKS5oYXNBdHRyaWJ1dGUoJ2Rpc2FibGVkJykpIHRoaXMuY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoYFtkYXRhLW1vZGVsLWluZGV4PVwiJHsobmV4dERheUluZGV4ICUgNykgKyA3fVwiXWApLmZvY3VzKCk7XG5cdFx0XHRcdFx0ZWxzZSB0aGlzLmNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKGBbZGF0YS1tb2RlbC1pbmRleD1cIiR7bmV4dERheUluZGV4ICUgN31cIl1gKS5mb2N1cygpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGVsc2UgdGhpcy5jb250YWluZXIucXVlcnlTZWxlY3RvcihgW2RhdGEtbW9kZWwtaW5kZXg9XCIke25leHREYXlJbmRleH1cIl1gKS5mb2N1cygpO1xuXHRcdFx0fVxuXHRcdH07XG5cdFx0aWYoS0VZQ09ERVNbZS5rZXlDb2RlXSAmJiBrZXlEb3duRGljdGlvbmFyeVtLRVlDT0RFU1tlLmtleUNvZGVdXSkga2V5RG93bkRpY3Rpb25hcnlbS0VZQ09ERVNbZS5rZXlDb2RlXV0uY2FsbCh0aGlzLCBlKTtcblx0fSxcblx0c2VsZWN0RGF0ZShlKXtcblx0XHR0aGlzLnN0YXJ0RGF0ZSA9IHRoaXMubW9udGhWaWV3Lm1vZGVsWytlLnRhcmdldC5nZXRBdHRyaWJ1dGUoJ2RhdGEtbW9kZWwtaW5kZXgnKV0uZGF0ZTtcblx0XHR0aGlzLnJvb3REYXRlID0gdGhpcy5zdGFydERhdGU7XG5cdFx0ZS50YXJnZXQuY2xhc3NMaXN0LmFkZCgnc2RwLWRheS1idG4tLWlzLWFjdGl2ZScpO1xuXHRcdHRoaXMuaW5wdXRDbG9uZS52YWx1ZSA9IGZvcm1hdERhdGUodGhpcy5zdGFydERhdGUsIHRoaXMuc2V0dGluZ3MuZGlzcGxheUZvcm1hdCk7XG5cdFx0dGhpcy5pbnB1dC52YWx1ZSA9IGZvcm1hdERhdGUodGhpcy5zdGFydERhdGUsIHRoaXMuc2V0dGluZ3MudmFsdWVGb3JtYXQpO1xuXHRcdHRoaXMuY2xvc2UoKTtcblx0fSxcblx0cmVzZXQoKXtcblx0XHR0aGlzLnJvb3REYXRlID0gbmV3IERhdGUoKTtcblx0XHR0aGlzLnJvb3REYXRlLnNldEhvdXJzKDAsMCwwLDApO1xuXHRcdHRoaXMuc3RhcnREYXRlID0gZmFsc2U7XG5cdFx0dGhpcy5pbnB1dENsb25lLnZhbHVlID0gJyc7XG5cdFx0dGhpcy5pbnB1dC52YWx1ZSA9ICcnO1xuXHR9LFxuXHRnZXRWYWx1ZSgpeyByZXR1cm4gdGhpcy5zdGFydERhdGU7IH1cbn07XG5cblxuLypcblxuXHRMZWZ0OiBNb3ZlIGZvY3VzIHRvIHRoZSBwcmV2aW91cyBkYXkuIFdpbGwgbW92ZSB0byB0aGUgbGFzdCBkYXkgb2YgdGhlIHByZXZpb3VzIG1vbnRoLCBpZiB0aGUgY3VycmVudCBkYXkgaXMgdGhlIGZpcnN0IGRheSBvZiBhIG1vbnRoLlxuXHRSaWdodDogTW92ZSBmb2N1cyB0byB0aGUgbmV4dCBkYXkuIFdpbGwgbW92ZSB0byB0aGUgZmlyc3QgZGF5IG9mIHRoZSBmb2xsb3dpbmcgbW9udGgsIGlmIHRoZSBjdXJyZW50IGRheSBpcyB0aGUgbGFzdCBkYXkgb2YgYSBtb250aC5cblx0VXA6IE1vdmUgZm9jdXMgdG8gdGhlIHNhbWUgZGF5IG9mIHRoZSBwcmV2aW91cyB3ZWVrLiBXaWxsIHdyYXAgdG8gdGhlIGFwcHJvcHJpYXRlIGRheSBpbiB0aGUgcHJldmlvdXMgbW9udGguXG5cdERvd246IE1vdmUgZm9jdXMgdG8gdGhlIHNhbWUgZGF5IG9mIHRoZSBmb2xsb3dpbmcgd2Vlay4gV2lsbCB3cmFwIHRvIHRoZSBhcHByb3ByaWF0ZSBkYXkgaW4gdGhlIGZvbGxvd2luZyBtb250aC5cblx0VGFiOiBOYXZpZ2F0ZSBiZXR3ZWVuIGNhbGFuZGVyIGdyaWQgYW5kIHByZXZpb3VzL25leHQgc2VsZWN0aW9uIGJ1dHRvbnNcblx0RW50ZXIvU3BhY2U6IFNlbGVjdCBkYXRlXG5cdEVzY2FwZTogY2xvc2UgY2FsZW5kYXIsIG5vIGNoYW5nZVxuXG4qLyIsImV4cG9ydCBjb25zdCBUUklHR0VSX0VWRU5UUyA9IFsnY2xpY2snLCAna2V5ZG93biddO1xuXG5leHBvcnQgY29uc3QgVFJJR0dFUl9LRVlDT0RFUyA9IFsxMywgMzJdO1xuXG5leHBvcnQgY29uc3QgS0VZQ09ERVMgPSB7XG4gICAgOTogJ1RBQicsXG4gICAgMTM6ICdFTlRFUicsXG4gICAgMjc6ICdFU0NBUEUnLFxuICAgIDMyOiAnU1BBQ0UnLFxuICAgIDM3OiAnTEVGVCcsXG4gICAgMzg6ICdVUCcsXG4gICAgMzk6ICdSSUdIVCcsXG4gICAgNDA6ICdET1dOJ1xufTsiLCJleHBvcnQgZGVmYXVsdCB7XG5cdGNhbGxiYWNrOiBudWxsLFxuXHRzdGFydE9wZW46IGZhbHNlLFxuXHRzdGFydERhdGU6IGZhbHNlLFxuXHQvLyBjbG9zZU9uU2VsZWN0OiBmYWxzZSxcblx0ZGlzcGxheUZvcm1hdDogJ2RkZGQgTU1NTSBELCBZWVlZJywgLy9UaHVyc2RheSBKYW51YXJ5IDEyLCAyMDE3XG5cdHZhbHVlRm9ybWF0OiAnREQvTU0vWVlZWSdcbn07IiwiaW1wb3J0IHsgZGF5TmFtZXMsIG1vbnRoTmFtZXMgfSBmcm9tICcuL3V0aWxzJztcblxuZXhwb3J0IGNvbnN0IGNhbGVuZGFyID0gcHJvcHMgPT4gYDxkaXYgY2xhc3M9XCJzZHAtZGF0ZVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxidXR0b24gY2xhc3M9XCJqcy1zZHAtbmF2X19idG4gc2RwLWJhY2tcIiB0eXBlPVwiYnV0dG9uXCIgZGF0YS1hY3Rpb249XCItMVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3ZnIGNsYXNzPVwic2RwLWJ0bl9faWNvblwiIHdpZHRoPVwiMTlcIiBoZWlnaHQ9XCIxOVwiIHZpZXdCb3g9XCIwIDAgMTAwMCAxMDAwXCI+PHBhdGggZD1cIk0zMzYuMiAyNzQuNWwtMjEwLjEgMjEwaDgwNS40YzEzIDAgMjMgMTAgMjMgMjNzLTEwIDIzLTIzIDIzSDEyNi4xbDIxMC4xIDIxMC4xYzExIDExIDExIDIxIDAgMzItNSA1LTEwIDctMTYgN3MtMTEtMi0xNi03bC0yNDkuMS0yNDljLTExLTExLTExLTIxIDAtMzJsMjQ5LjEtMjQ5LjFjMjEtMjEuMSA1MyAxMC45IDMyIDMyelwiPjwvcGF0aD48L3N2Zz5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIGNsYXNzPVwianMtc2RwLW5hdl9fYnRuIHNkcC1uZXh0XCIgdHlwZT1cImJ1dHRvblwiIGRhdGEtYWN0aW9uPVwiMVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3ZnIGNsYXNzPVwic2RwLWJ0bl9faWNvblwiIHdpZHRoPVwiMTlcIiBoZWlnaHQ9XCIxOVwiIHZpZXdCb3g9XCIwIDAgMTAwMCAxMDAwXCI+PHBhdGggZD1cIk02OTQuNCAyNDIuNGwyNDkuMSAyNDkuMWMxMSAxMSAxMSAyMSAwIDMyTDY5NC40IDc3Mi43Yy01IDUtMTAgNy0xNiA3cy0xMS0yLTE2LTdjLTExLTExLTExLTIxIDAtMzJsMjEwLjEtMjEwLjFINjcuMWMtMTMgMC0yMy0xMC0yMy0yM3MxMC0yMyAyMy0yM2g4MDUuNEw2NjIuNCAyNzQuNWMtMjEtMjEuMSAxMS01My4xIDMyLTMyLjF6XCI+PC9wYXRoPjwvc3ZnPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJqcy1zZHBfX21vbnRoXCI+PC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5gO1xuXG5leHBvcnQgY29uc3QgbW9udGggPSBwcm9wcyA9PiBgPGRpdiBjbGFzcz1cInNkcC1tb250aC1sYWJlbFwiPiR7cHJvcHMubW9udGhUaXRsZX0gJHtwcm9wcy55ZWFyVGl0bGV9PC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICA8dGFibGUgY2xhc3M9XCJzZHAtZGF5c1wiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0aGVhZCBjbGFzcz1cInNkcC1kYXlzLWhlYWRcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRyIGNsYXNzPVwic2RwLWRheXMtcm93XCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGggY2xhc3M9XCJzZHAtZGF5LWhlYWRcIj5NbzwvdGg+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGggY2xhc3M9XCJzZHAtZGF5LWhlYWRcIj5UdTwvdGg+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGggY2xhc3M9XCJzZHAtZGF5LWhlYWRcIj5XZTwvdGg+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGggY2xhc3M9XCJzZHAtZGF5LWhlYWRcIj5UaDwvdGg+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGggY2xhc3M9XCJzZHAtZGF5LWhlYWRcIj5GcjwvdGg+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGggY2xhc3M9XCJzZHAtZGF5LWhlYWRcIj5TYTwvdGg+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGggY2xhc3M9XCJzZHAtZGF5LWhlYWRcIj5TdTwvdGg+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvdHI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC90aGVhZD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGJvZHkgY2xhc3M9XCJzZHAtZGF5cy1ib2R5XCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICR7cHJvcHMubW9kZWwubWFwKHdlZWtzKHByb3BzLmFjdGl2ZSkpLmpvaW4oJycpfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvdGJvZHk+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L3RhYmxlPmA7XG5cbmNvbnN0IGRheSA9IChhY3RpdmVEYXlzLCBwcm9wcywgaSkgPT4gYDx0ZCBjbGFzcz1cInNkcC1kYXktYm9keSR7cHJvcHMubmV4dE1vbnRoID8gJyBzZHAtZGF5LW5leHQtbW9udGggc2RwLWRheS1kaXNhYmxlZCcgOiAnJ30ke3Byb3BzLnByZXZpb3VzTW9udGggPyAnIHNkcC1kYXktcHJldi1tb250aCBzZHAtZGF5LWRpc2FibGVkJyA6ICcnfSR7cHJvcHMuYWN0aXZlID8gJyBzZHAtZGF5LXNlbGVjdGVkJyA6ICcnfVwiPjxidXR0b24gdGFiaW5kZXg9XCIke3Byb3BzLmlzU3RhcnREYXRlID8gMCA6IHByb3BzLmlzVG9kYXkgPyAwIDogLTF9XCIgY2xhc3M9XCJzZHAtZGF5LWJ0biR7cHJvcHMuaXNUb2RheSA/ICcgc2RwLWRheS1idG4tLWlzLXRvZGF5JyA6ICcnfSR7cHJvcHMuaXNTdGFydERhdGUgPyAnIHNkcC1kYXktYnRuLS1pcy1hY3RpdmUnIDogJyd9XCIgcm9sZT1cImJ1dHRvblwiIGRhdGEtbW9kZWwtaW5kZXg9XCIke2l9XCIgYXJpYS1sYWJlbD1cIiR7cHJvcHMuaXNUb2RheSA/ICdUb2RheSwgJyA6ICcnfSR7ZGF5TmFtZXNbcHJvcHMuZGF0ZS5nZXREYXkoKV19LCAke21vbnRoTmFtZXNbcHJvcHMuZGF0ZS5nZXRNb250aCgpXX0gJHtwcm9wcy5kYXRlLmdldERhdGUoKX0sICR7cHJvcHMuZGF0ZS5nZXRGdWxsWWVhcigpfVwiJHtwcm9wcy5wcmV2aW91c01vbnRoIHx8IHByb3BzLm5leHRNb250aCA/IFwiIGRpc2FibGVkXCIgOiBcIlwifT4ke3Byb3BzLm51bWJlcn08L2J1dHRvbj48L3RkPmA7XG5cbmNvbnN0IHdlZWtzID0gYWN0aXZlRGF5cyA9PiAocHJvcHMsIGksIGFycikgPT4ge1xuICAgIGlmKGkgPT09IDApIHJldHVybiBgPHRyIGNsYXNzPVwic2RwLWRheXMtcm93XCI+JHtkYXkoYWN0aXZlRGF5cywgcHJvcHMsIGkpfWA7XG4gICAgZWxzZSBpZiAoaSA9PT0gYXJyLmxlbmd0aCAtIDEpIHJldHVybiBgJHtkYXkoYWN0aXZlRGF5cywgcHJvcHMsIGkpfTwvdHI+YDtcbiAgICBlbHNlIGlmKChpKzEpICUgNyA9PT0gMCkgcmV0dXJuIGAke2RheShhY3RpdmVEYXlzLCBwcm9wcywgaSl9PC90cj48dHIgY2xhc3M9XCJzZHAtZGF5cy1yb3dcIj5gO1xuICAgIGVsc2UgcmV0dXJuIGRheShhY3RpdmVEYXlzLCBwcm9wcywgaSk7XG59OyIsImltcG9ydCBmZWNoYSBmcm9tICdmZWNoYSc7XG5cbmV4cG9ydCBjb25zdCBwYXJzZURhdGUgPSBmZWNoYS5wYXJzZTtcblxuZXhwb3J0IGNvbnN0IGZvcm1hdERhdGUgPSBmZWNoYS5mb3JtYXQ7XG5cbmV4cG9ydCBjb25zdCBtb250aE5hbWVzID0gWydKYW51YXJ5JywgJ0ZlYnJ1YXJ5JywgJ01hcmNoJywgJ0FwcmlsJywgJ01heScsICdKdW5lJywgJ0p1bHknLCAnQXVndXN0JywgJ1NlcHRlbWJlcicsICdPY3RvYmVyJywgJ05vdmVtYmVyJywgJ0RlY2VtYmVyJ107XG5cbmV4cG9ydCBjb25zdCBkYXlOYW1lcyA9IFsnU3VuZGF5JywnTW9uZGF5JywnVHVlc2RheScsJ1dlZG5lc2RheScsJ1RodXJzZGF5JywnRnJpZGF5JywnU2F0dXJkYXknXTtcblxuZXhwb3J0IGNvbnN0IGNhdGNoQnViYmxlID0gZSA9PiB7XG4gICAgZS5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24oKTtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG59O1xuXG5leHBvcnQgY29uc3QgZ2V0TW9udGhMZW5ndGggPSAoeWVhciwgbW9udGgpID0+IG5ldyBEYXRlKHllYXIsIChtb250aCArIDEpLCAwKS5nZXREYXRlKCk7XG5cbmNvbnN0IGlzVG9kYXkgPSBjYW5kaWRhdGUgPT4ge1xuICAgIGxldCB0b2RheSA9IG5ldyBEYXRlKCk7XG4gICAgdG9kYXkuc2V0SG91cnMoMCwwLDAsMCk7XG4gICAgcmV0dXJuIGNhbmRpZGF0ZS5nZXRUaW1lKCkgPT09IHRvZGF5LmdldFRpbWUoKTtcbn07XG5cbmNvbnN0IGlzU3RhcnREYXRlID0gKHN0YXJ0RGF0ZSwgY2FuZGlkYXRlKSA9PiBzdGFydERhdGUuZ2V0VGltZSgpID09PSBjYW5kaWRhdGUuZ2V0VGltZSgpO1xuXG5jb25zdCBtb250aE1vZGVsID0gKHllYXIsIG1vbnRoLCBzdGFydERhdGUpID0+IHtcbiAgICBsZXQgdGhlTW9udGggPSBuZXcgRGF0ZSh5ZWFyLCBtb250aCArIDEsIDApLFxuICAgICAgICB0b3RhbERheXMgPSB0aGVNb250aC5nZXREYXRlKCksXG4gICAgICAgIGVuZERheSA9IHRoZU1vbnRoLmdldERheSgpLFxuICAgICAgICBzdGFydERheSxcbiAgICAgICAgcHJldk1vbnRoU3RhcnREYXkgPSBmYWxzZSxcbiAgICAgICAgcHJldk1vbnRoID0gbmV3IERhdGUoeWVhciwgbW9udGgsIDApLFxuICAgICAgICBwcmV2TW9udGhFbmREYXkgPSBwcmV2TW9udGguZ2V0RGF0ZSgpLFxuICAgICAgICBvdXRwdXQgPSBbXTtcblxuICAgIHRoZU1vbnRoLnNldERhdGUoMSk7XG4gICAgc3RhcnREYXkgPSB0aGVNb250aC5nZXREYXkoKTtcbiAgICBcbiAgICBpZihzdGFydERheSAhPT0gMSkge1xuICAgICAgICBpZihzdGFydERheSA9PT0gMCkgcHJldk1vbnRoU3RhcnREYXkgPSBwcmV2TW9udGguZ2V0RGF0ZSgpIC0gNTtcbiAgICAgICAgZWxzZSBwcmV2TW9udGhTdGFydERheSA9IHByZXZNb250aC5nZXREYXRlKCkgLSAoc3RhcnREYXkgLSAyKTtcbiAgICB9XG5cbiAgICBpZihwcmV2TW9udGhTdGFydERheSl7XG4gICAgICAgIHdoaWxlKHByZXZNb250aFN0YXJ0RGF5IDw9IHByZXZNb250aEVuZERheSl7XG4gICAgICAgICAgICBsZXQgdG1wRGF0ZSA9IG5ldyBEYXRlKHByZXZNb250aC5nZXRGdWxsWWVhcigpLCBwcmV2TW9udGguZ2V0TW9udGgoKSwgcHJldk1vbnRoU3RhcnREYXkpO1xuICAgICAgICAgICAgb3V0cHV0LnB1c2goe1xuICAgICAgICAgICAgICAgIG51bWJlcjogcHJldk1vbnRoU3RhcnREYXksXG4gICAgICAgICAgICAgICAgcHJldmlvdXNNb250aDogdHJ1ZSxcbiAgICAgICAgICAgICAgICBpc1RvZGF5OiBpc1RvZGF5KHRtcERhdGUpLFxuICAgICAgICAgICAgICAgIGlzU3RhcnREYXRlOiBzdGFydERhdGUgJiYgaXNTdGFydERhdGUoc3RhcnREYXRlLCB0bXBEYXRlKSB8fCBmYWxzZSxcblx0XHRcdFx0ZGF0ZTogdG1wRGF0ZVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBwcmV2TW9udGhTdGFydERheSsrO1xuICAgICAgICB9XG4gICAgfVxuICAgIGZvcihsZXQgaSA9IDE7IGkgPD0gdG90YWxEYXlzOyBpKyspIHtcbiAgICAgICAgbGV0IHRtcERhdGUgPSBuZXcgRGF0ZSh5ZWFyLCBtb250aCwgaSk7XG4gICAgICAgIG91dHB1dC5wdXNoKHsgXG4gICAgICAgICAgICBudW1iZXI6IGksXG4gICAgICAgICAgICBkYXRlOiB0bXBEYXRlLFxuICAgICAgICAgICAgaXNTdGFydERhdGU6IHN0YXJ0RGF0ZSAmJiBpc1N0YXJ0RGF0ZShzdGFydERhdGUsIHRtcERhdGUpIHx8IGZhbHNlLFxuICAgICAgICAgICAgaXNUb2RheTogaXNUb2RheSh0bXBEYXRlKVxuICAgICAgICB9KTtcbiAgICB9XG4gICAgaWYoZW5kRGF5ICE9PSAwKSBmb3IobGV0IGkgPSAxOyBpIDw9ICg3IC0gZW5kRGF5KTsgaSsrKSB7XG4gICAgICAgIGxldCB0bXBEYXRlID0gbmV3IERhdGUoeWVhciwgbW9udGggKyAxLCBpKTtcbiAgICAgICAgb3V0cHV0LnB1c2goeyBcbiAgICAgICAgICAgIG51bWJlcjogaSxcbiAgICAgICAgICAgIG5leHRNb250aDogdHJ1ZSxcbiAgICAgICAgICAgIGRhdGU6IHRtcERhdGUsXG4gICAgICAgICAgICBpc1N0YXJ0RGF0ZTogc3RhcnREYXRlICYmIGlzU3RhcnREYXRlKHN0YXJ0RGF0ZSwgdG1wRGF0ZSkgfHwgZmFsc2UsXG4gICAgICAgICAgICBpc1RvZGF5OiBpc1RvZGF5KHRtcERhdGUpXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4gb3V0cHV0O1xufTtcblxuZXhwb3J0IGNvbnN0IG1vbnRoVmlld0ZhY3RvcnkgPSAocm9vdERhdGUsIHN0YXJ0RGF0ZSkgPT4gKHtcblx0bW9kZWw6IG1vbnRoTW9kZWwocm9vdERhdGUuZ2V0RnVsbFllYXIoKSwgcm9vdERhdGUuZ2V0TW9udGgoKSwgc3RhcnREYXRlKSxcblx0bW9udGhUaXRsZTogbW9udGhOYW1lc1tyb290RGF0ZS5nZXRNb250aCgpXSxcblx0eWVhclRpdGxlOiByb290RGF0ZS5nZXRGdWxsWWVhcigpXG59KTtcblxuZXhwb3J0IGNvbnN0IGVsZW1lbnRGYWN0b3J5ID0gKHR5cGUsIGF0dHJpYnV0ZXMgPSB7fSwgY2xhc3NOYW1lKSA9PiB7XG4gICAgbGV0IGVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCh0eXBlKTtcblxuICAgIGZvcihsZXQgcHJvcCBpbiBhdHRyaWJ1dGVzKSBlbC5zZXRBdHRyaWJ1dGUocHJvcCwgYXR0cmlidXRlc1twcm9wXSk7XG4gICAgaWYoY2xhc3NOYW1lKSBlbC5jbGFzc05hbWUgPSBjbGFzc05hbWU7XG5cbiAgICByZXR1cm4gZWw7XG59O1xuXG5jb25zdCBmb2N1c2FibGVFbGVtZW50cyA9IFsnYVtocmVmXScsICdhcmVhW2hyZWZdJywgJ2lucHV0Om5vdChbZGlzYWJsZWRdKScsICdzZWxlY3Q6bm90KFtkaXNhYmxlZF0pJywgJ3RleHRhcmVhOm5vdChbZGlzYWJsZWRdKScsICdidXR0b246bm90KFtkaXNhYmxlZF0pJywgJ2lmcmFtZScsICdvYmplY3QnLCAnZW1iZWQnLCAnW2NvbnRlbnRlZGl0YWJsZV0nLCAnW3RhYmluZGV4XTpub3QoW3RhYmluZGV4PVwiLTFcIl0pJ107XG5cbmV4cG9ydCBjb25zdCBnZXRGb2N1c2FibGVDaGlsZHJlbiA9IG5vZGUgPT4gW10uc2xpY2UuY2FsbChub2RlLnF1ZXJ5U2VsZWN0b3JBbGwoZm9jdXNhYmxlRWxlbWVudHMuam9pbignLCcpKSkuZmlsdGVyKGNoaWxkID0+ICEhKGNoaWxkLm9mZnNldFdpZHRoIHx8IGNoaWxkLm9mZnNldEhlaWdodCB8fCBjaGlsZC5nZXRDbGllbnRSZWN0cygpLmxlbmd0aCkpOyIsIihmdW5jdGlvbiAobWFpbikge1xuICAndXNlIHN0cmljdCc7XG5cbiAgLyoqXG4gICAqIFBhcnNlIG9yIGZvcm1hdCBkYXRlc1xuICAgKiBAY2xhc3MgZmVjaGFcbiAgICovXG4gIHZhciBmZWNoYSA9IHt9O1xuICB2YXIgdG9rZW4gPSAvZHsxLDR9fE17MSw0fXxZWSg/OllZKT98U3sxLDN9fERvfFpafChbSGhNc0RtXSlcXDE/fFthQV18XCJbXlwiXSpcInwnW14nXSonL2c7XG4gIHZhciB0d29EaWdpdHMgPSAvXFxkXFxkPy87XG4gIHZhciB0aHJlZURpZ2l0cyA9IC9cXGR7M30vO1xuICB2YXIgZm91ckRpZ2l0cyA9IC9cXGR7NH0vO1xuICB2YXIgd29yZCA9IC9bMC05XSpbJ2EtelxcdTAwQTAtXFx1MDVGRlxcdTA3MDAtXFx1RDdGRlxcdUY5MDAtXFx1RkRDRlxcdUZERjAtXFx1RkZFRl0rfFtcXHUwNjAwLVxcdTA2RkZcXC9dKyhcXHMqP1tcXHUwNjAwLVxcdTA2RkZdKyl7MSwyfS9pO1xuICB2YXIgbGl0ZXJhbCA9IC9cXFsoW15dKj8pXFxdL2dtO1xuICB2YXIgbm9vcCA9IGZ1bmN0aW9uICgpIHtcbiAgfTtcblxuICBmdW5jdGlvbiBzaG9ydGVuKGFyciwgc0xlbikge1xuICAgIHZhciBuZXdBcnIgPSBbXTtcbiAgICBmb3IgKHZhciBpID0gMCwgbGVuID0gYXJyLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICBuZXdBcnIucHVzaChhcnJbaV0uc3Vic3RyKDAsIHNMZW4pKTtcbiAgICB9XG4gICAgcmV0dXJuIG5ld0FycjtcbiAgfVxuXG4gIGZ1bmN0aW9uIG1vbnRoVXBkYXRlKGFyck5hbWUpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKGQsIHYsIGkxOG4pIHtcbiAgICAgIHZhciBpbmRleCA9IGkxOG5bYXJyTmFtZV0uaW5kZXhPZih2LmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgdi5zdWJzdHIoMSkudG9Mb3dlckNhc2UoKSk7XG4gICAgICBpZiAofmluZGV4KSB7XG4gICAgICAgIGQubW9udGggPSBpbmRleDtcbiAgICAgIH1cbiAgICB9O1xuICB9XG5cbiAgZnVuY3Rpb24gcGFkKHZhbCwgbGVuKSB7XG4gICAgdmFsID0gU3RyaW5nKHZhbCk7XG4gICAgbGVuID0gbGVuIHx8IDI7XG4gICAgd2hpbGUgKHZhbC5sZW5ndGggPCBsZW4pIHtcbiAgICAgIHZhbCA9ICcwJyArIHZhbDtcbiAgICB9XG4gICAgcmV0dXJuIHZhbDtcbiAgfVxuXG4gIHZhciBkYXlOYW1lcyA9IFsnU3VuZGF5JywgJ01vbmRheScsICdUdWVzZGF5JywgJ1dlZG5lc2RheScsICdUaHVyc2RheScsICdGcmlkYXknLCAnU2F0dXJkYXknXTtcbiAgdmFyIG1vbnRoTmFtZXMgPSBbJ0phbnVhcnknLCAnRmVicnVhcnknLCAnTWFyY2gnLCAnQXByaWwnLCAnTWF5JywgJ0p1bmUnLCAnSnVseScsICdBdWd1c3QnLCAnU2VwdGVtYmVyJywgJ09jdG9iZXInLCAnTm92ZW1iZXInLCAnRGVjZW1iZXInXTtcbiAgdmFyIG1vbnRoTmFtZXNTaG9ydCA9IHNob3J0ZW4obW9udGhOYW1lcywgMyk7XG4gIHZhciBkYXlOYW1lc1Nob3J0ID0gc2hvcnRlbihkYXlOYW1lcywgMyk7XG4gIGZlY2hhLmkxOG4gPSB7XG4gICAgZGF5TmFtZXNTaG9ydDogZGF5TmFtZXNTaG9ydCxcbiAgICBkYXlOYW1lczogZGF5TmFtZXMsXG4gICAgbW9udGhOYW1lc1Nob3J0OiBtb250aE5hbWVzU2hvcnQsXG4gICAgbW9udGhOYW1lczogbW9udGhOYW1lcyxcbiAgICBhbVBtOiBbJ2FtJywgJ3BtJ10sXG4gICAgRG9GbjogZnVuY3Rpb24gRG9GbihEKSB7XG4gICAgICByZXR1cm4gRCArIFsndGgnLCAnc3QnLCAnbmQnLCAncmQnXVtEICUgMTAgPiAzID8gMCA6IChEIC0gRCAlIDEwICE9PSAxMCkgKiBEICUgMTBdO1xuICAgIH1cbiAgfTtcblxuICB2YXIgZm9ybWF0RmxhZ3MgPSB7XG4gICAgRDogZnVuY3Rpb24oZGF0ZU9iaikge1xuICAgICAgcmV0dXJuIGRhdGVPYmouZ2V0RGF0ZSgpO1xuICAgIH0sXG4gICAgREQ6IGZ1bmN0aW9uKGRhdGVPYmopIHtcbiAgICAgIHJldHVybiBwYWQoZGF0ZU9iai5nZXREYXRlKCkpO1xuICAgIH0sXG4gICAgRG86IGZ1bmN0aW9uKGRhdGVPYmosIGkxOG4pIHtcbiAgICAgIHJldHVybiBpMThuLkRvRm4oZGF0ZU9iai5nZXREYXRlKCkpO1xuICAgIH0sXG4gICAgZDogZnVuY3Rpb24oZGF0ZU9iaikge1xuICAgICAgcmV0dXJuIGRhdGVPYmouZ2V0RGF5KCk7XG4gICAgfSxcbiAgICBkZDogZnVuY3Rpb24oZGF0ZU9iaikge1xuICAgICAgcmV0dXJuIHBhZChkYXRlT2JqLmdldERheSgpKTtcbiAgICB9LFxuICAgIGRkZDogZnVuY3Rpb24oZGF0ZU9iaiwgaTE4bikge1xuICAgICAgcmV0dXJuIGkxOG4uZGF5TmFtZXNTaG9ydFtkYXRlT2JqLmdldERheSgpXTtcbiAgICB9LFxuICAgIGRkZGQ6IGZ1bmN0aW9uKGRhdGVPYmosIGkxOG4pIHtcbiAgICAgIHJldHVybiBpMThuLmRheU5hbWVzW2RhdGVPYmouZ2V0RGF5KCldO1xuICAgIH0sXG4gICAgTTogZnVuY3Rpb24oZGF0ZU9iaikge1xuICAgICAgcmV0dXJuIGRhdGVPYmouZ2V0TW9udGgoKSArIDE7XG4gICAgfSxcbiAgICBNTTogZnVuY3Rpb24oZGF0ZU9iaikge1xuICAgICAgcmV0dXJuIHBhZChkYXRlT2JqLmdldE1vbnRoKCkgKyAxKTtcbiAgICB9LFxuICAgIE1NTTogZnVuY3Rpb24oZGF0ZU9iaiwgaTE4bikge1xuICAgICAgcmV0dXJuIGkxOG4ubW9udGhOYW1lc1Nob3J0W2RhdGVPYmouZ2V0TW9udGgoKV07XG4gICAgfSxcbiAgICBNTU1NOiBmdW5jdGlvbihkYXRlT2JqLCBpMThuKSB7XG4gICAgICByZXR1cm4gaTE4bi5tb250aE5hbWVzW2RhdGVPYmouZ2V0TW9udGgoKV07XG4gICAgfSxcbiAgICBZWTogZnVuY3Rpb24oZGF0ZU9iaikge1xuICAgICAgcmV0dXJuIFN0cmluZyhkYXRlT2JqLmdldEZ1bGxZZWFyKCkpLnN1YnN0cigyKTtcbiAgICB9LFxuICAgIFlZWVk6IGZ1bmN0aW9uKGRhdGVPYmopIHtcbiAgICAgIHJldHVybiBkYXRlT2JqLmdldEZ1bGxZZWFyKCk7XG4gICAgfSxcbiAgICBoOiBmdW5jdGlvbihkYXRlT2JqKSB7XG4gICAgICByZXR1cm4gZGF0ZU9iai5nZXRIb3VycygpICUgMTIgfHwgMTI7XG4gICAgfSxcbiAgICBoaDogZnVuY3Rpb24oZGF0ZU9iaikge1xuICAgICAgcmV0dXJuIHBhZChkYXRlT2JqLmdldEhvdXJzKCkgJSAxMiB8fCAxMik7XG4gICAgfSxcbiAgICBIOiBmdW5jdGlvbihkYXRlT2JqKSB7XG4gICAgICByZXR1cm4gZGF0ZU9iai5nZXRIb3VycygpO1xuICAgIH0sXG4gICAgSEg6IGZ1bmN0aW9uKGRhdGVPYmopIHtcbiAgICAgIHJldHVybiBwYWQoZGF0ZU9iai5nZXRIb3VycygpKTtcbiAgICB9LFxuICAgIG06IGZ1bmN0aW9uKGRhdGVPYmopIHtcbiAgICAgIHJldHVybiBkYXRlT2JqLmdldE1pbnV0ZXMoKTtcbiAgICB9LFxuICAgIG1tOiBmdW5jdGlvbihkYXRlT2JqKSB7XG4gICAgICByZXR1cm4gcGFkKGRhdGVPYmouZ2V0TWludXRlcygpKTtcbiAgICB9LFxuICAgIHM6IGZ1bmN0aW9uKGRhdGVPYmopIHtcbiAgICAgIHJldHVybiBkYXRlT2JqLmdldFNlY29uZHMoKTtcbiAgICB9LFxuICAgIHNzOiBmdW5jdGlvbihkYXRlT2JqKSB7XG4gICAgICByZXR1cm4gcGFkKGRhdGVPYmouZ2V0U2Vjb25kcygpKTtcbiAgICB9LFxuICAgIFM6IGZ1bmN0aW9uKGRhdGVPYmopIHtcbiAgICAgIHJldHVybiBNYXRoLnJvdW5kKGRhdGVPYmouZ2V0TWlsbGlzZWNvbmRzKCkgLyAxMDApO1xuICAgIH0sXG4gICAgU1M6IGZ1bmN0aW9uKGRhdGVPYmopIHtcbiAgICAgIHJldHVybiBwYWQoTWF0aC5yb3VuZChkYXRlT2JqLmdldE1pbGxpc2Vjb25kcygpIC8gMTApLCAyKTtcbiAgICB9LFxuICAgIFNTUzogZnVuY3Rpb24oZGF0ZU9iaikge1xuICAgICAgcmV0dXJuIHBhZChkYXRlT2JqLmdldE1pbGxpc2Vjb25kcygpLCAzKTtcbiAgICB9LFxuICAgIGE6IGZ1bmN0aW9uKGRhdGVPYmosIGkxOG4pIHtcbiAgICAgIHJldHVybiBkYXRlT2JqLmdldEhvdXJzKCkgPCAxMiA/IGkxOG4uYW1QbVswXSA6IGkxOG4uYW1QbVsxXTtcbiAgICB9LFxuICAgIEE6IGZ1bmN0aW9uKGRhdGVPYmosIGkxOG4pIHtcbiAgICAgIHJldHVybiBkYXRlT2JqLmdldEhvdXJzKCkgPCAxMiA/IGkxOG4uYW1QbVswXS50b1VwcGVyQ2FzZSgpIDogaTE4bi5hbVBtWzFdLnRvVXBwZXJDYXNlKCk7XG4gICAgfSxcbiAgICBaWjogZnVuY3Rpb24oZGF0ZU9iaikge1xuICAgICAgdmFyIG8gPSBkYXRlT2JqLmdldFRpbWV6b25lT2Zmc2V0KCk7XG4gICAgICByZXR1cm4gKG8gPiAwID8gJy0nIDogJysnKSArIHBhZChNYXRoLmZsb29yKE1hdGguYWJzKG8pIC8gNjApICogMTAwICsgTWF0aC5hYnMobykgJSA2MCwgNCk7XG4gICAgfVxuICB9O1xuXG4gIHZhciBwYXJzZUZsYWdzID0ge1xuICAgIEQ6IFt0d29EaWdpdHMsIGZ1bmN0aW9uIChkLCB2KSB7XG4gICAgICBkLmRheSA9IHY7XG4gICAgfV0sXG4gICAgRG86IFtuZXcgUmVnRXhwKHR3b0RpZ2l0cy5zb3VyY2UgKyB3b3JkLnNvdXJjZSksIGZ1bmN0aW9uIChkLCB2KSB7XG4gICAgICBkLmRheSA9IHBhcnNlSW50KHYsIDEwKTtcbiAgICB9XSxcbiAgICBNOiBbdHdvRGlnaXRzLCBmdW5jdGlvbiAoZCwgdikge1xuICAgICAgZC5tb250aCA9IHYgLSAxO1xuICAgIH1dLFxuICAgIFlZOiBbdHdvRGlnaXRzLCBmdW5jdGlvbiAoZCwgdikge1xuICAgICAgdmFyIGRhID0gbmV3IERhdGUoKSwgY2VudCA9ICsoJycgKyBkYS5nZXRGdWxsWWVhcigpKS5zdWJzdHIoMCwgMik7XG4gICAgICBkLnllYXIgPSAnJyArICh2ID4gNjggPyBjZW50IC0gMSA6IGNlbnQpICsgdjtcbiAgICB9XSxcbiAgICBoOiBbdHdvRGlnaXRzLCBmdW5jdGlvbiAoZCwgdikge1xuICAgICAgZC5ob3VyID0gdjtcbiAgICB9XSxcbiAgICBtOiBbdHdvRGlnaXRzLCBmdW5jdGlvbiAoZCwgdikge1xuICAgICAgZC5taW51dGUgPSB2O1xuICAgIH1dLFxuICAgIHM6IFt0d29EaWdpdHMsIGZ1bmN0aW9uIChkLCB2KSB7XG4gICAgICBkLnNlY29uZCA9IHY7XG4gICAgfV0sXG4gICAgWVlZWTogW2ZvdXJEaWdpdHMsIGZ1bmN0aW9uIChkLCB2KSB7XG4gICAgICBkLnllYXIgPSB2O1xuICAgIH1dLFxuICAgIFM6IFsvXFxkLywgZnVuY3Rpb24gKGQsIHYpIHtcbiAgICAgIGQubWlsbGlzZWNvbmQgPSB2ICogMTAwO1xuICAgIH1dLFxuICAgIFNTOiBbL1xcZHsyfS8sIGZ1bmN0aW9uIChkLCB2KSB7XG4gICAgICBkLm1pbGxpc2Vjb25kID0gdiAqIDEwO1xuICAgIH1dLFxuICAgIFNTUzogW3RocmVlRGlnaXRzLCBmdW5jdGlvbiAoZCwgdikge1xuICAgICAgZC5taWxsaXNlY29uZCA9IHY7XG4gICAgfV0sXG4gICAgZDogW3R3b0RpZ2l0cywgbm9vcF0sXG4gICAgZGRkOiBbd29yZCwgbm9vcF0sXG4gICAgTU1NOiBbd29yZCwgbW9udGhVcGRhdGUoJ21vbnRoTmFtZXNTaG9ydCcpXSxcbiAgICBNTU1NOiBbd29yZCwgbW9udGhVcGRhdGUoJ21vbnRoTmFtZXMnKV0sXG4gICAgYTogW3dvcmQsIGZ1bmN0aW9uIChkLCB2LCBpMThuKSB7XG4gICAgICB2YXIgdmFsID0gdi50b0xvd2VyQ2FzZSgpO1xuICAgICAgaWYgKHZhbCA9PT0gaTE4bi5hbVBtWzBdKSB7XG4gICAgICAgIGQuaXNQbSA9IGZhbHNlO1xuICAgICAgfSBlbHNlIGlmICh2YWwgPT09IGkxOG4uYW1QbVsxXSkge1xuICAgICAgICBkLmlzUG0gPSB0cnVlO1xuICAgICAgfVxuICAgIH1dLFxuICAgIFpaOiBbLyhbXFwrXFwtXVxcZFxcZDo/XFxkXFxkfFopLywgZnVuY3Rpb24gKGQsIHYpIHtcbiAgICAgIGlmICh2ID09PSAnWicpIHYgPSAnKzAwOjAwJztcbiAgICAgIHZhciBwYXJ0cyA9ICh2ICsgJycpLm1hdGNoKC8oW1xcK1xcLV18XFxkXFxkKS9naSksIG1pbnV0ZXM7XG5cbiAgICAgIGlmIChwYXJ0cykge1xuICAgICAgICBtaW51dGVzID0gKyhwYXJ0c1sxXSAqIDYwKSArIHBhcnNlSW50KHBhcnRzWzJdLCAxMCk7XG4gICAgICAgIGQudGltZXpvbmVPZmZzZXQgPSBwYXJ0c1swXSA9PT0gJysnID8gbWludXRlcyA6IC1taW51dGVzO1xuICAgICAgfVxuICAgIH1dXG4gIH07XG4gIHBhcnNlRmxhZ3MuZGQgPSBwYXJzZUZsYWdzLmQ7XG4gIHBhcnNlRmxhZ3MuZGRkZCA9IHBhcnNlRmxhZ3MuZGRkO1xuICBwYXJzZUZsYWdzLkREID0gcGFyc2VGbGFncy5EO1xuICBwYXJzZUZsYWdzLm1tID0gcGFyc2VGbGFncy5tO1xuICBwYXJzZUZsYWdzLmhoID0gcGFyc2VGbGFncy5IID0gcGFyc2VGbGFncy5ISCA9IHBhcnNlRmxhZ3MuaDtcbiAgcGFyc2VGbGFncy5NTSA9IHBhcnNlRmxhZ3MuTTtcbiAgcGFyc2VGbGFncy5zcyA9IHBhcnNlRmxhZ3MucztcbiAgcGFyc2VGbGFncy5BID0gcGFyc2VGbGFncy5hO1xuXG5cbiAgLy8gU29tZSBjb21tb24gZm9ybWF0IHN0cmluZ3NcbiAgZmVjaGEubWFza3MgPSB7XG4gICAgZGVmYXVsdDogJ2RkZCBNTU0gREQgWVlZWSBISDptbTpzcycsXG4gICAgc2hvcnREYXRlOiAnTS9EL1lZJyxcbiAgICBtZWRpdW1EYXRlOiAnTU1NIEQsIFlZWVknLFxuICAgIGxvbmdEYXRlOiAnTU1NTSBELCBZWVlZJyxcbiAgICBmdWxsRGF0ZTogJ2RkZGQsIE1NTU0gRCwgWVlZWScsXG4gICAgc2hvcnRUaW1lOiAnSEg6bW0nLFxuICAgIG1lZGl1bVRpbWU6ICdISDptbTpzcycsXG4gICAgbG9uZ1RpbWU6ICdISDptbTpzcy5TU1MnXG4gIH07XG5cbiAgLyoqKlxuICAgKiBGb3JtYXQgYSBkYXRlXG4gICAqIEBtZXRob2QgZm9ybWF0XG4gICAqIEBwYXJhbSB7RGF0ZXxudW1iZXJ9IGRhdGVPYmpcbiAgICogQHBhcmFtIHtzdHJpbmd9IG1hc2sgRm9ybWF0IG9mIHRoZSBkYXRlLCBpLmUuICdtbS1kZC15eScgb3IgJ3Nob3J0RGF0ZSdcbiAgICovXG4gIGZlY2hhLmZvcm1hdCA9IGZ1bmN0aW9uIChkYXRlT2JqLCBtYXNrLCBpMThuU2V0dGluZ3MpIHtcbiAgICB2YXIgaTE4biA9IGkxOG5TZXR0aW5ncyB8fCBmZWNoYS5pMThuO1xuXG4gICAgaWYgKHR5cGVvZiBkYXRlT2JqID09PSAnbnVtYmVyJykge1xuICAgICAgZGF0ZU9iaiA9IG5ldyBEYXRlKGRhdGVPYmopO1xuICAgIH1cblxuICAgIGlmIChPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoZGF0ZU9iaikgIT09ICdbb2JqZWN0IERhdGVdJyB8fCBpc05hTihkYXRlT2JqLmdldFRpbWUoKSkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBEYXRlIGluIGZlY2hhLmZvcm1hdCcpO1xuICAgIH1cblxuICAgIG1hc2sgPSBmZWNoYS5tYXNrc1ttYXNrXSB8fCBtYXNrIHx8IGZlY2hhLm1hc2tzWydkZWZhdWx0J107XG5cbiAgICB2YXIgbGl0ZXJhbHMgPSBbXTtcblxuICAgIC8vIE1ha2UgbGl0ZXJhbHMgaW5hY3RpdmUgYnkgcmVwbGFjaW5nIHRoZW0gd2l0aCA/P1xuICAgIG1hc2sgPSBtYXNrLnJlcGxhY2UobGl0ZXJhbCwgZnVuY3Rpb24oJDAsICQxKSB7XG4gICAgICBsaXRlcmFscy5wdXNoKCQxKTtcbiAgICAgIHJldHVybiAnPz8nO1xuICAgIH0pO1xuICAgIC8vIEFwcGx5IGZvcm1hdHRpbmcgcnVsZXNcbiAgICBtYXNrID0gbWFzay5yZXBsYWNlKHRva2VuLCBmdW5jdGlvbiAoJDApIHtcbiAgICAgIHJldHVybiAkMCBpbiBmb3JtYXRGbGFncyA/IGZvcm1hdEZsYWdzWyQwXShkYXRlT2JqLCBpMThuKSA6ICQwLnNsaWNlKDEsICQwLmxlbmd0aCAtIDEpO1xuICAgIH0pO1xuICAgIC8vIElubGluZSBsaXRlcmFsIHZhbHVlcyBiYWNrIGludG8gdGhlIGZvcm1hdHRlZCB2YWx1ZVxuICAgIHJldHVybiBtYXNrLnJlcGxhY2UoL1xcP1xcPy9nLCBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBsaXRlcmFscy5zaGlmdCgpO1xuICAgIH0pO1xuICB9O1xuXG4gIC8qKlxuICAgKiBQYXJzZSBhIGRhdGUgc3RyaW5nIGludG8gYW4gb2JqZWN0LCBjaGFuZ2VzIC0gaW50byAvXG4gICAqIEBtZXRob2QgcGFyc2VcbiAgICogQHBhcmFtIHtzdHJpbmd9IGRhdGVTdHIgRGF0ZSBzdHJpbmdcbiAgICogQHBhcmFtIHtzdHJpbmd9IGZvcm1hdCBEYXRlIHBhcnNlIGZvcm1hdFxuICAgKiBAcmV0dXJucyB7RGF0ZXxib29sZWFufVxuICAgKi9cbiAgZmVjaGEucGFyc2UgPSBmdW5jdGlvbiAoZGF0ZVN0ciwgZm9ybWF0LCBpMThuU2V0dGluZ3MpIHtcbiAgICB2YXIgaTE4biA9IGkxOG5TZXR0aW5ncyB8fCBmZWNoYS5pMThuO1xuXG4gICAgaWYgKHR5cGVvZiBmb3JtYXQgIT09ICdzdHJpbmcnKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgZm9ybWF0IGluIGZlY2hhLnBhcnNlJyk7XG4gICAgfVxuXG4gICAgZm9ybWF0ID0gZmVjaGEubWFza3NbZm9ybWF0XSB8fCBmb3JtYXQ7XG5cbiAgICAvLyBBdm9pZCByZWd1bGFyIGV4cHJlc3Npb24gZGVuaWFsIG9mIHNlcnZpY2UsIGZhaWwgZWFybHkgZm9yIHJlYWxseSBsb25nIHN0cmluZ3NcbiAgICAvLyBodHRwczovL3d3dy5vd2FzcC5vcmcvaW5kZXgucGhwL1JlZ3VsYXJfZXhwcmVzc2lvbl9EZW5pYWxfb2ZfU2VydmljZV8tX1JlRG9TXG4gICAgaWYgKGRhdGVTdHIubGVuZ3RoID4gMTAwMCkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHZhciBpc1ZhbGlkID0gdHJ1ZTtcbiAgICB2YXIgZGF0ZUluZm8gPSB7fTtcbiAgICBmb3JtYXQucmVwbGFjZSh0b2tlbiwgZnVuY3Rpb24gKCQwKSB7XG4gICAgICBpZiAocGFyc2VGbGFnc1skMF0pIHtcbiAgICAgICAgdmFyIGluZm8gPSBwYXJzZUZsYWdzWyQwXTtcbiAgICAgICAgdmFyIGluZGV4ID0gZGF0ZVN0ci5zZWFyY2goaW5mb1swXSk7XG4gICAgICAgIGlmICghfmluZGV4KSB7XG4gICAgICAgICAgaXNWYWxpZCA9IGZhbHNlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGRhdGVTdHIucmVwbGFjZShpbmZvWzBdLCBmdW5jdGlvbiAocmVzdWx0KSB7XG4gICAgICAgICAgICBpbmZvWzFdKGRhdGVJbmZvLCByZXN1bHQsIGkxOG4pO1xuICAgICAgICAgICAgZGF0ZVN0ciA9IGRhdGVTdHIuc3Vic3RyKGluZGV4ICsgcmVzdWx0Lmxlbmd0aCk7XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBwYXJzZUZsYWdzWyQwXSA/ICcnIDogJDAuc2xpY2UoMSwgJDAubGVuZ3RoIC0gMSk7XG4gICAgfSk7XG5cbiAgICBpZiAoIWlzVmFsaWQpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICB2YXIgdG9kYXkgPSBuZXcgRGF0ZSgpO1xuICAgIGlmIChkYXRlSW5mby5pc1BtID09PSB0cnVlICYmIGRhdGVJbmZvLmhvdXIgIT0gbnVsbCAmJiArZGF0ZUluZm8uaG91ciAhPT0gMTIpIHtcbiAgICAgIGRhdGVJbmZvLmhvdXIgPSArZGF0ZUluZm8uaG91ciArIDEyO1xuICAgIH0gZWxzZSBpZiAoZGF0ZUluZm8uaXNQbSA9PT0gZmFsc2UgJiYgK2RhdGVJbmZvLmhvdXIgPT09IDEyKSB7XG4gICAgICBkYXRlSW5mby5ob3VyID0gMDtcbiAgICB9XG5cbiAgICB2YXIgZGF0ZTtcbiAgICBpZiAoZGF0ZUluZm8udGltZXpvbmVPZmZzZXQgIT0gbnVsbCkge1xuICAgICAgZGF0ZUluZm8ubWludXRlID0gKyhkYXRlSW5mby5taW51dGUgfHwgMCkgLSArZGF0ZUluZm8udGltZXpvbmVPZmZzZXQ7XG4gICAgICBkYXRlID0gbmV3IERhdGUoRGF0ZS5VVEMoZGF0ZUluZm8ueWVhciB8fCB0b2RheS5nZXRGdWxsWWVhcigpLCBkYXRlSW5mby5tb250aCB8fCAwLCBkYXRlSW5mby5kYXkgfHwgMSxcbiAgICAgICAgZGF0ZUluZm8uaG91ciB8fCAwLCBkYXRlSW5mby5taW51dGUgfHwgMCwgZGF0ZUluZm8uc2Vjb25kIHx8IDAsIGRhdGVJbmZvLm1pbGxpc2Vjb25kIHx8IDApKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZGF0ZSA9IG5ldyBEYXRlKGRhdGVJbmZvLnllYXIgfHwgdG9kYXkuZ2V0RnVsbFllYXIoKSwgZGF0ZUluZm8ubW9udGggfHwgMCwgZGF0ZUluZm8uZGF5IHx8IDEsXG4gICAgICAgIGRhdGVJbmZvLmhvdXIgfHwgMCwgZGF0ZUluZm8ubWludXRlIHx8IDAsIGRhdGVJbmZvLnNlY29uZCB8fCAwLCBkYXRlSW5mby5taWxsaXNlY29uZCB8fCAwKTtcbiAgICB9XG4gICAgcmV0dXJuIGRhdGU7XG4gIH07XG5cbiAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnICYmIG1vZHVsZS5leHBvcnRzKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBmZWNoYTtcbiAgfSBlbHNlIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICBkZWZpbmUoZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIGZlY2hhO1xuICAgIH0pO1xuICB9IGVsc2Uge1xuICAgIG1haW4uZmVjaGEgPSBmZWNoYTtcbiAgfVxufSkodGhpcyk7XG4iXX0=
