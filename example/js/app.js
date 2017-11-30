(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var _component = require('./libs/component');

var _component2 = _interopRequireDefault(_component);

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
}

var onDOMContentLoadedTasks = [function () {
    _component2.default.init('.js-date-picker');
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
		if (el.nodeName === 'input') return console.warn('Date picker target node not an input');
		return Object.assign(Object.create(_componentPrototype2.default), {
			node: el,
			settings: Object.assign({}, _defaults2.default, opts)
		}).init();
	});
};

exports.default = { init: init };

},{"./lib/component-prototype":3,"./lib/defaults":4}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _utils = require('./utils');

var _templates = require('./templates');

var TRIGGER_EVENTS = ['click', 'keydown'],
    TRIGGER_KEYCODES = [13, 32],
    KEYCODES = {
	9: 'TAB',
	13: 'ENTER',
	27: 'ESCAPE',
	32: 'SPACE',
	37: 'LEFT',
	38: 'UP',
	39: 'RIGHT',
	40: 'DOWN'
};

exports.default = {
	init: function init() {
		this.node.addEventListener('focus', this.open.bind(this));

		this.boundHandleFocusOut = this.handleFocusOut.bind(this);

		this.startDate = new Date();
		this.startDate.setHours(0, 0, 0, 0);

		this.rootDate = this.startDate;
		//from value, not validating date here, up to the user


		this.settings.startOpen && this.open();

		/*
  let totalDays = diffDays(this.startDate, this.endDate),
  	eventDateObjects = [];
  
  for (let i = 0; i <= totalDays; i++) eventDateObjects.push(addDays(this.startDate, i));
  this.data = eventDateObjects.reduce((acc, curr) => {
  		let existingMonthIndex = acc.monthViews.length ? acc.monthViews.reduce(monthViewExists(curr), -1) : false;
  		if(!acc.monthViews.length || existingMonthIndex === -1) acc.monthViews.push(monthViewFactory(curr));
  		
  		acc.activeDates[curr.getFullYear()] = acc.activeDates[curr.getFullYear()] || {};
  		if(acc.activeDates[curr.getFullYear()] && acc.activeDates[curr.getFullYear()][monthNames[curr.getMonth()]]) 
  			acc.activeDates[curr.getFullYear()][monthNames[curr.getMonth()]].push(curr.getDate());
  		if(!acc.activeDates[curr.getFullYear()][monthNames[curr.getMonth()]])
  			acc.activeDates[curr.getFullYear()][monthNames[curr.getMonth()]] = [curr.getDate()];
  			return acc;
  	}, { monthViews: [], activeDates: {} });
  	
  eventDateObjects = [];
  
  this.data.monthViews = activateDates(this.data);
  this.renderView(0);
  */
		return this;
	},
	toggle: function toggle() {
		if (this.isOpen) this.close();else this.open();
	},
	open: function open() {
		if (this.isOpen) return;
		this.renderCalendar();
		this.isOpen = true;

		document.body.addEventListener('focusout', this.boundHandleFocusOut);
	},
	close: function close() {
		this.container.parentNode.removeChild(this.container);
		this.isOpen = false;
		//remove from DOM
		//remove all event listeners
	},
	handleFocusOut: function handleFocusOut() {
		var _this = this;

		window.setTimeout(function () {
			if (_this.container.contains(document.activeElement) || _this.node === document.activeElement) return;
			_this.close();
			document.body.removeEventListener('focusout', _this.boundHandleBlur);
		}, 16);
	},
	renderCalendar: function renderCalendar() {
		this.container = (0, _utils.elementFactory)('div', {}, 'sdp-container');
		this.container.innerHTML = (0, _templates.calendar)();
		this.node.parentNode.appendChild(this.container);
		this.monthContainer = document.querySelector('.js-sdp__month');
		this.renderMonth();
		this.manageButtons();
		this.initListeners();
		//focus on active date or today's date
	},
	renderMonth: function renderMonth() {
		this.monthView = (0, _utils.monthViewFactory)(this.rootDate, this.startDate);
		this.monthContainer.innerHTML = (0, _templates.month)(this.monthView);
	},
	manageButtons: function manageButtons() {
		var _this2 = this;

		TRIGGER_EVENTS.forEach(function (ev) {
			[_this2.container.querySelector('.js-sdp__back'), _this2.container.querySelector('.js-sdp__next')].forEach(function (btn, i) {
				btn.addEventListener(ev, function (e) {
					if (!!e.keyCode && !~TRIGGER_KEYCODES.indexOf(e.keyCode)) return;
					_this2.rootDate = new Date(_this2.rootDate.getFullYear(), _this2.rootDate.getMonth() + (i === 0 ? -1 : 1));
					_this2.renderMonth();
				});
			});
		});
	},
	initListeners: function initListeners() {
		var _this3 = this;

		TRIGGER_EVENTS.forEach(function (ev) {
			_this3.container.addEventListener(ev, function (e) {
				if (e.keyCode) return _this3.handleKeyDown(e);else _this3.handleClick(e);
				//click, check e.target
			});
		});
	},
	handleKeyDown: function handleKeyDown(e) {
		var keyDownDictionary = {
			TAB: function TAB() {},
			ENTER: function ENTER() {},
			ESCAPE: function ESCAPE() {
				this.close();
			},
			SPACE: function SPACE(e) {
				this.selectDate(e);
			},
			LEFT: function LEFT() {},
			UP: function UP() {},
			RIGHT: function RIGHT() {},
			DOWN: function DOWN() {}
		};
		if (KEYCODES[e.keyCode] && keyDownDictionary[KEYCODES[e.keyCode]]) keyDownDictionary[KEYCODES[e.keyCode]].call(this, e);
	},
	handleClick: function handleClick(e) {},
	selectDate: function selectDate(e) {
		this.startDate = this.monthView.model[+e.target.getAttribute('data-model-index')];
		this.rootDate = this.startDate;
		//this.close();
	}
};

/*


Left: Move focus to the previous day. Will move to the last day of the previous month, if the current day is the first day of a month.
Right: Move focus to the next day. Will move to the first day of the following month, if the current day is the last day of a month.
Up: Move focus to the same day of the previous week. Will wrap to the appropriate day in the previous month.
Down: Move focus to the same day of the following week. Will wrap to the appropriate day in the following month.
PgUp: Move focus to the same date of the previous month. If that date does not exist, focus is placed on the last day of the month.
PgUp: Move focus to the same date of the following month. If that date does not exist, focus is placed on the last day of the month.
Ctrl+PgUp: Move focus to the same date of the previous year. If that date does not exist (e.g leap year), focus is placed on the last day of the month.
Ctrl+PgDn: Move focus to the same date of the following year. If that date does not exist (e.g leap year), focus is placed on the last day of the month.
Home: Move to the first day of the month.
End: Move to the last day of the month
Tab: Navigate between calander grid and previous/next selection buttons
Enter/Space: Select date
Escape: close calendar, no change


*/

},{"./templates":5,"./utils":6}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.default = {
	callback: null,
	startOpen: false,
	startDate: false,
	closeOnSelect: false,
	displayFormat: 'dd/mm/YYYY',
	valueFormat: 'dd/mm/YYYY'
};

},{}],5:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.month = exports.calendar = undefined;

var _utils = require('./utils');

var calendar = exports.calendar = function calendar(props) {
    return '<div class="sdp-date">\n                                        <button class="sdp-back js-sdp__back" type="button">\n                                            <svg class="sdp-btn__icon" width="19" height="19" viewBox="0 0 1000 1000"><path d="M336.2 274.5l-210.1 210h805.4c13 0 23 10 23 23s-10 23-23 23H126.1l210.1 210.1c11 11 11 21 0 32-5 5-10 7-16 7s-11-2-16-7l-249.1-249c-11-11-11-21 0-32l249.1-249.1c21-21.1 53 10.9 32 32z"></path></svg>\n                                        </button>\n                                        <button class="sdp-next js-sdp__next" type="button">\n                                            <svg class="sdp-btn__icon" width="19" height="19" viewBox="0 0 1000 1000"><path d="M694.4 242.4l249.1 249.1c11 11 11 21 0 32L694.4 772.7c-5 5-10 7-16 7s-11-2-16-7c-11-11-11-21 0-32l210.1-210.1H67.1c-13 0-23-10-23-23s10-23 23-23h805.4L662.4 274.5c-21-21.1 11-53.1 32-32.1z"></path></svg>\n                                        </button>\n                                        <div class="js-sdp__month"></div>\n                                    </div>';
};

var month = exports.month = function month(props) {
    return '<div class="sdp-month-label">' + props.monthTitle + ' ' + props.yearTitle + '</div>\n                        <table class="sdp-days">\n                            <thead class="sdp-days-head">\n                                <tr class="sdp-days-row">\n                                    <th class="sdp-day-head">Mo</th>\n                                    <th class="sdp-day-head">Tu</th>\n                                    <th class="sdp-day-head">We</th>\n                                    <th class="sdp-day-head">Th</th>\n                                    <th class="sdp-day-head">Fr</th>\n                                    <th class="sdp-day-head">Sa</th>\n                                    <th class="sdp-day-head">Su</th>\n                                </tr>\n                            </thead>\n                            <tbody class="sdp-days-body">\n                                ' + props.model.map(weeks(props.active)).join('') + '\n                            </tbody>\n                        </table>';
};

var day = function day(activeDays, props, i) {
    return '<td class="sdp-day-body' + (props.nextMonth ? ' sdp-day-next-month sdp-day-disabled' : '') + (props.previousMonth ? ' sdp-day-prev-month sdp-day-disabled' : '') + (props.active ? ' sdp-day-selected' : '') + '"><button class="sdp-day-btn" role="button" data-model-index="' + i + '" aria-label="' + _utils.dayNames[props.date.getDay()] + ', ' + _utils.monthNames[props.date.getMonth()] + ' ' + props.date.getDate() + ', ' + props.date.getFullYear() + '"' + (props.previousMonth || props.nextMonth ? " disabled" : "") + '>' + props.number + '</button></td>';
};

var weeks = function weeks(activeDays) {
    return function (props, i, arr) {
        if (i === 0) return '<tr class="sdp-days-row">' + day(activeDays, props, i);else if (i === arr.length - 1) return day(activeDays, props, i) + '</tr>';else if ((i + 1) % 7 === 0) return day(activeDays, props, i) + '</tr><tr class="sdp-days-row">';else return day(activeDays, props, i);
    };
};

},{"./utils":6}],6:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
var monthNames = exports.monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

var dayNames = exports.dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

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
                isStartDate: isStartDate(startDate, tmpDate),
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
            isStartDate: isStartDate(startDate, _tmpDate),
            isToday: isToday(_tmpDate)
        });
    }

    if (endDay !== 0) for (var _i = 1; _i <= 7 - endDay; _i++) {
        var _tmpDate2 = new Date(year, month + 1, _i);
        output.push({
            number: _i,
            nextMonth: true,
            date: _tmpDate2,
            isStartDate: isStartDate(startDate, _tmpDate2),
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

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJleGFtcGxlL3NyYy9hcHAuanMiLCJleGFtcGxlL3NyYy9saWJzL2NvbXBvbmVudC9pbmRleC5qcyIsImV4YW1wbGUvc3JjL2xpYnMvY29tcG9uZW50L2xpYi9jb21wb25lbnQtcHJvdG90eXBlLmpzIiwiZXhhbXBsZS9zcmMvbGlicy9jb21wb25lbnQvbGliL2RlZmF1bHRzLmpzIiwiZXhhbXBsZS9zcmMvbGlicy9jb21wb25lbnQvbGliL3RlbXBsYXRlcy5qcyIsImV4YW1wbGUvc3JjL2xpYnMvY29tcG9uZW50L2xpYi91dGlscy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUE7Ozs7Ozs7O0FBRUEsSUFBTSwyQkFBMkIsWUFBTSxBQUNuQzt3QkFBQSxBQUFXLEtBQVgsQUFBZ0IsQUFDbkI7QUFGRCxBQUFnQyxDQUFBOztBQUloQyxJQUFHLHNCQUFILEFBQXlCLGVBQVEsQUFBTyxpQkFBUCxBQUF3QixvQkFBb0IsWUFBTSxBQUFFOzRCQUFBLEFBQXdCLFFBQVEsVUFBQSxBQUFDLElBQUQ7ZUFBQSxBQUFRO0FBQXhDLEFBQWdEO0FBQXBHLENBQUE7Ozs7Ozs7OztBQ05qQzs7OztBQUNBOzs7Ozs7OztBQUVBLElBQU0sT0FBTyxTQUFQLEFBQU8sS0FBQSxBQUFDLEtBQUQsQUFBTSxNQUFTLEFBQzNCO0tBQUksTUFBTSxHQUFBLEFBQUcsTUFBSCxBQUFTLEtBQUssU0FBQSxBQUFTLGlCQUFqQyxBQUFVLEFBQWMsQUFBMEIsQUFDL0M7QUFFSDs7S0FBRyxDQUFDLElBQUosQUFBUSxRQUFRLE9BQU8sUUFBQSxBQUFRLEtBQWYsQUFBTyxBQUFhLEFBRXBDOztZQUFPLEFBQUksSUFBSSxVQUFBLEFBQUMsSUFBTyxBQUN0QjtNQUFHLEdBQUEsQUFBRyxhQUFOLEFBQW1CLFNBQVMsT0FBTyxRQUFBLEFBQVEsS0FBZixBQUFPLEFBQWEsQUFDaEQ7Z0JBQU8sQUFBTyxPQUFP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QkFBYSxZQUFBLEFBQVksV0FKakIsQUFJSyxBQUF1QixBQUNwQztxQkFBUyxRQUxiLEFBQVksQUFLQyxBQUFRLEFBRXhCO0FBUGUsQUFDUjtBQU9SO1dBQUEsQUFBTyxBQUNWO0FBcEREOztBQXNETyxJQUFNLDhDQUFtQixTQUFuQixBQUFtQixpQkFBQSxBQUFDLFVBQUQsQUFBVyxXQUFYOztlQUN4QixXQUFXLFNBQVgsQUFBVyxBQUFTLGVBQWUsU0FBbkMsQUFBbUMsQUFBUyxZQURNLEFBQ2xELEFBQXdELEFBQy9EO29CQUFZLFdBQVcsU0FGa0MsQUFFN0MsQUFBVyxBQUFTLEFBQ2hDO21CQUFXLFNBSG9CLEFBQTBCLEFBRzlDLEFBQVM7QUFIcUMsQUFDekQ7QUFETTs7QUFNQSxJQUFNLDBDQUFpQixTQUFqQixBQUFpQixlQUFBLEFBQUMsTUFBcUM7UUFBL0IsQUFBK0IsaUZBQWxCLEFBQWtCO1FBQWQsQUFBYyxzQkFDaEU7O1FBQUksS0FBSyxTQUFBLEFBQVMsY0FBbEIsQUFBUyxBQUF1QixBQUVoQzs7U0FBSSxJQUFKLEFBQVEsUUFBUixBQUFnQixZQUFZO1dBQUEsQUFBRyxhQUFILEFBQWdCLE1BQU0sV0FBbEQsQUFBNEIsQUFBc0IsQUFBVztBQUM3RCxTQUFBLEFBQUcsV0FBVyxHQUFBLEFBQUcsWUFBSCxBQUFlLEFBRTdCOztXQUFBLEFBQU8sQUFDVjtBQVBNIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImltcG9ydCBEYXRlUGlja2VyIGZyb20gJy4vbGlicy9jb21wb25lbnQnO1xuXG5jb25zdCBvbkRPTUNvbnRlbnRMb2FkZWRUYXNrcyA9IFsoKSA9PiB7XG4gICAgRGF0ZVBpY2tlci5pbml0KCcuanMtZGF0ZS1waWNrZXInKTtcbn1dO1xuICAgIFxuaWYoJ2FkZEV2ZW50TGlzdGVuZXInIGluIHdpbmRvdykgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCAoKSA9PiB7IG9uRE9NQ29udGVudExvYWRlZFRhc2tzLmZvckVhY2goKGZuKSA9PiBmbigpKTsgfSk7IiwiaW1wb3J0IGRlZmF1bHRzIGZyb20gJy4vbGliL2RlZmF1bHRzJztcbmltcG9ydCBjb21wb25lbnRQcm90b3R5cGUgZnJvbSAnLi9saWIvY29tcG9uZW50LXByb3RvdHlwZSc7XG5cbmNvbnN0IGluaXQgPSAoc2VsLCBvcHRzKSA9PiB7XG5cdGxldCBlbHMgPSBbXS5zbGljZS5jYWxsKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoc2VsKSk7XG4gICAgLy9sZXQgZWxzID0gQXJyYXkuZnJvbShkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKHNlbCkpO1xuXG5cdGlmKCFlbHMubGVuZ3RoKSByZXR1cm4gY29uc29sZS53YXJuKCdEYXRlIHBpY2tlciBub3QgaW5pdGlhbGlzZWQsIG5vIGF1Z21lbnRhYmxlIGVsZW1lbnRzIGZvdW5kJyk7XG4gICAgXG5cdHJldHVybiBlbHMubWFwKChlbCkgPT4ge1xuXHRcdGlmKGVsLm5vZGVOYW1lID09PSAnaW5wdXQnKSByZXR1cm4gY29uc29sZS53YXJuKCdEYXRlIHBpY2tlciB0YXJnZXQgbm9kZSBub3QgYW4gaW5wdXQnKTtcblx0XHRyZXR1cm4gT2JqZWN0LmFzc2lnbihPYmplY3QuY3JlYXRlKGNvbXBvbmVudFByb3RvdHlwZSksIHtcblx0XHRcdG5vZGU6IGVsLFxuXHRcdFx0c2V0dGluZ3M6IE9iamVjdC5hc3NpZ24oe30sIGRlZmF1bHRzLCBvcHRzKVxuXHRcdH0pLmluaXQoKTtcblx0fSk7XG59O1xuXG5leHBvcnQgZGVmYXVsdCB7IGluaXQgfTsiLCJpbXBvcnQgeyBlbGVtZW50RmFjdG9yeSwgbW9udGhWaWV3RmFjdG9yeSB9IGZyb20gJy4vdXRpbHMnO1xuaW1wb3J0IHsgY2FsZW5kYXIsIG1vbnRoIH0gZnJvbSAnLi90ZW1wbGF0ZXMnO1xuXG5jb25zdCBUUklHR0VSX0VWRU5UUyA9IFsnY2xpY2snLCAna2V5ZG93biddLFxuXHQgIFRSSUdHRVJfS0VZQ09ERVMgPSBbMTMsIDMyXSxcblx0ICBLRVlDT0RFUyA9IHtcblx0XHQgIDk6ICdUQUInLFxuXHRcdCAgMTM6ICdFTlRFUicsXG5cdFx0ICAyNzogJ0VTQ0FQRScsXG5cdFx0ICAzMjogJ1NQQUNFJyxcblx0XHQgIDM3OiAnTEVGVCcsXG5cdFx0ICAzODogJ1VQJyxcblx0XHQgIDM5OiAnUklHSFQnLFxuXHRcdCAgNDA6ICdET1dOJ1xuXHQgIH07XG5cbmV4cG9ydCBkZWZhdWx0IHtcblx0aW5pdCgpIHtcblx0XHR0aGlzLm5vZGUuYWRkRXZlbnRMaXN0ZW5lcignZm9jdXMnLCB0aGlzLm9wZW4uYmluZCh0aGlzKSk7XG5cblx0XHR0aGlzLmJvdW5kSGFuZGxlRm9jdXNPdXQgPSB0aGlzLmhhbmRsZUZvY3VzT3V0LmJpbmQodGhpcyk7XG5cblxuXHRcdHRoaXMuc3RhcnREYXRlID0gbmV3IERhdGUoKTtcblx0XHR0aGlzLnN0YXJ0RGF0ZS5zZXRIb3VycygwLDAsMCwwKTtcblxuXHRcdHRoaXMucm9vdERhdGUgPSB0aGlzLnN0YXJ0RGF0ZTtcblx0XHQvL2Zyb20gdmFsdWUsIG5vdCB2YWxpZGF0aW5nIGRhdGUgaGVyZSwgdXAgdG8gdGhlIHVzZXJcblxuXG5cdFx0dGhpcy5zZXR0aW5ncy5zdGFydE9wZW4gJiYgdGhpcy5vcGVuKCk7XG5cblxuXHRcdC8qXG5cdFx0bGV0IHRvdGFsRGF5cyA9IGRpZmZEYXlzKHRoaXMuc3RhcnREYXRlLCB0aGlzLmVuZERhdGUpLFxuXHRcdFx0ZXZlbnREYXRlT2JqZWN0cyA9IFtdO1xuXHRcdFxuXHRcdGZvciAobGV0IGkgPSAwOyBpIDw9IHRvdGFsRGF5czsgaSsrKSBldmVudERhdGVPYmplY3RzLnB1c2goYWRkRGF5cyh0aGlzLnN0YXJ0RGF0ZSwgaSkpO1xuXHRcdHRoaXMuZGF0YSA9IGV2ZW50RGF0ZU9iamVjdHMucmVkdWNlKChhY2MsIGN1cnIpID0+IHtcblx0XHRcdFx0bGV0IGV4aXN0aW5nTW9udGhJbmRleCA9IGFjYy5tb250aFZpZXdzLmxlbmd0aCA/IGFjYy5tb250aFZpZXdzLnJlZHVjZShtb250aFZpZXdFeGlzdHMoY3VyciksIC0xKSA6IGZhbHNlO1xuXHRcdFx0XHRpZighYWNjLm1vbnRoVmlld3MubGVuZ3RoIHx8IGV4aXN0aW5nTW9udGhJbmRleCA9PT0gLTEpIGFjYy5tb250aFZpZXdzLnB1c2gobW9udGhWaWV3RmFjdG9yeShjdXJyKSk7XG5cdFx0XHRcdFxuXHRcdFx0XHRhY2MuYWN0aXZlRGF0ZXNbY3Vyci5nZXRGdWxsWWVhcigpXSA9IGFjYy5hY3RpdmVEYXRlc1tjdXJyLmdldEZ1bGxZZWFyKCldIHx8IHt9O1xuXHRcdFx0XHRpZihhY2MuYWN0aXZlRGF0ZXNbY3Vyci5nZXRGdWxsWWVhcigpXSAmJiBhY2MuYWN0aXZlRGF0ZXNbY3Vyci5nZXRGdWxsWWVhcigpXVttb250aE5hbWVzW2N1cnIuZ2V0TW9udGgoKV1dKSBcblx0XHRcdFx0XHRhY2MuYWN0aXZlRGF0ZXNbY3Vyci5nZXRGdWxsWWVhcigpXVttb250aE5hbWVzW2N1cnIuZ2V0TW9udGgoKV1dLnB1c2goY3Vyci5nZXREYXRlKCkpO1xuXHRcdFx0XHRpZighYWNjLmFjdGl2ZURhdGVzW2N1cnIuZ2V0RnVsbFllYXIoKV1bbW9udGhOYW1lc1tjdXJyLmdldE1vbnRoKCldXSlcblx0XHRcdFx0XHRhY2MuYWN0aXZlRGF0ZXNbY3Vyci5nZXRGdWxsWWVhcigpXVttb250aE5hbWVzW2N1cnIuZ2V0TW9udGgoKV1dID0gW2N1cnIuZ2V0RGF0ZSgpXTtcblxuXHRcdFx0XHRyZXR1cm4gYWNjO1xuXHRcdFx0fSwgeyBtb250aFZpZXdzOiBbXSwgYWN0aXZlRGF0ZXM6IHt9IH0pO1xuXHRcdFx0XG5cdFx0ZXZlbnREYXRlT2JqZWN0cyA9IFtdO1xuXHRcdFxuXHRcdHRoaXMuZGF0YS5tb250aFZpZXdzID0gYWN0aXZhdGVEYXRlcyh0aGlzLmRhdGEpO1xuXHRcdHRoaXMucmVuZGVyVmlldygwKTtcblx0XHQqL1xuXHRcdHJldHVybiB0aGlzO1xuXHR9LFxuXHR0b2dnbGUoKXtcblx0XHRpZih0aGlzLmlzT3BlbikgdGhpcy5jbG9zZSgpO1xuXHRcdGVsc2UgdGhpcy5vcGVuKCk7XG5cdH0sXG5cdG9wZW4oKXtcblx0XHRpZih0aGlzLmlzT3BlbikgcmV0dXJuO1xuXHRcdHRoaXMucmVuZGVyQ2FsZW5kYXIoKTtcblx0XHR0aGlzLmlzT3BlbiA9IHRydWU7XG5cblx0XHRkb2N1bWVudC5ib2R5LmFkZEV2ZW50TGlzdGVuZXIoJ2ZvY3Vzb3V0JywgdGhpcy5ib3VuZEhhbmRsZUZvY3VzT3V0KTtcblx0fSxcblx0Y2xvc2UoKXtcblx0XHR0aGlzLmNvbnRhaW5lci5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHRoaXMuY29udGFpbmVyKTtcblx0XHR0aGlzLmlzT3BlbiA9IGZhbHNlO1xuXHRcdC8vcmVtb3ZlIGZyb20gRE9NXG5cdFx0Ly9yZW1vdmUgYWxsIGV2ZW50IGxpc3RlbmVyc1xuXHR9LFxuXHRoYW5kbGVGb2N1c091dCgpe1xuXHRcdHdpbmRvdy5zZXRUaW1lb3V0KCgpID0+IHtcblx0XHRcdGlmKHRoaXMuY29udGFpbmVyLmNvbnRhaW5zKGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQpIHx8IHRoaXMubm9kZSA9PT0gZG9jdW1lbnQuYWN0aXZlRWxlbWVudCkgcmV0dXJuO1xuXHRcdFx0dGhpcy5jbG9zZSgpO1xuXHRcdFx0ZG9jdW1lbnQuYm9keS5yZW1vdmVFdmVudExpc3RlbmVyKCdmb2N1c291dCcsIHRoaXMuYm91bmRIYW5kbGVCbHVyKTtcblx0XHR9LCAxNik7XG5cdH0sXG5cdHJlbmRlckNhbGVuZGFyKCl7XG5cdFx0dGhpcy5jb250YWluZXIgPSBlbGVtZW50RmFjdG9yeSgnZGl2Jywge30sICdzZHAtY29udGFpbmVyJyk7XG5cdFx0dGhpcy5jb250YWluZXIuaW5uZXJIVE1MID0gY2FsZW5kYXIoKTtcblx0XHR0aGlzLm5vZGUucGFyZW50Tm9kZS5hcHBlbmRDaGlsZCh0aGlzLmNvbnRhaW5lcik7XG5cdFx0dGhpcy5tb250aENvbnRhaW5lciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy1zZHBfX21vbnRoJyk7XG5cdFx0dGhpcy5yZW5kZXJNb250aCgpO1xuXHRcdHRoaXMubWFuYWdlQnV0dG9ucygpO1xuXHRcdHRoaXMuaW5pdExpc3RlbmVycygpO1xuXHRcdC8vZm9jdXMgb24gYWN0aXZlIGRhdGUgb3IgdG9kYXkncyBkYXRlXG5cdH0sXG5cdHJlbmRlck1vbnRoKCl7XG5cdFx0dGhpcy5tb250aFZpZXcgPSBtb250aFZpZXdGYWN0b3J5KHRoaXMucm9vdERhdGUsIHRoaXMuc3RhcnREYXRlKTtcblx0XHR0aGlzLm1vbnRoQ29udGFpbmVyLmlubmVySFRNTCA9IG1vbnRoKHRoaXMubW9udGhWaWV3KTtcblx0fSxcblx0bWFuYWdlQnV0dG9ucygpIHtcblx0XHRUUklHR0VSX0VWRU5UUy5mb3JFYWNoKGV2ID0+IHtcblx0XHRcdFt0aGlzLmNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKCcuanMtc2RwX19iYWNrJyksIHRoaXMuY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoJy5qcy1zZHBfX25leHQnKV1cblx0XHRcdFx0LmZvckVhY2goKGJ0biwgaSkgPT4ge1xuXHRcdFx0XHRcdGJ0bi5hZGRFdmVudExpc3RlbmVyKGV2LCBlID0+IHtcblx0XHRcdFx0XHRcdGlmKCEhZS5rZXlDb2RlICYmICF+VFJJR0dFUl9LRVlDT0RFUy5pbmRleE9mKGUua2V5Q29kZSkpIHJldHVybjtcblx0XHRcdFx0XHRcdHRoaXMucm9vdERhdGUgPSBuZXcgRGF0ZSh0aGlzLnJvb3REYXRlLmdldEZ1bGxZZWFyKCksIHRoaXMucm9vdERhdGUuZ2V0TW9udGgoKSArIChpID09PSAwID8gLTEgOiAxKSk7XG5cdFx0XHRcdFx0XHR0aGlzLnJlbmRlck1vbnRoKCk7XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH0pO1xuXHRcdH0pO1xuXHR9LFxuXHRpbml0TGlzdGVuZXJzKCl7XG5cdFx0VFJJR0dFUl9FVkVOVFMuZm9yRWFjaChldiA9PiB7XG5cdFx0XHR0aGlzLmNvbnRhaW5lci5hZGRFdmVudExpc3RlbmVyKGV2LCBlID0+IHtcblx0XHRcdFx0aWYoZS5rZXlDb2RlKSByZXR1cm4gdGhpcy5oYW5kbGVLZXlEb3duKGUpO1xuXHRcdFx0XHRlbHNlIHRoaXMuaGFuZGxlQ2xpY2soZSk7XG5cdFx0XHRcdC8vY2xpY2ssIGNoZWNrIGUudGFyZ2V0XG5cdFx0XHR9KTtcblx0XHR9KTtcblx0fSxcblx0aGFuZGxlS2V5RG93bihlKXtcblx0XHRjb25zdCBrZXlEb3duRGljdGlvbmFyeSA9IHtcblx0XHRcdFRBQigpe30sXG5cdFx0XHRFTlRFUigpe30sXG5cdFx0XHRFU0NBUEUoKXtcblx0XHRcdFx0dGhpcy5jbG9zZSgpO1xuXHRcdFx0fSxcblx0XHRcdFNQQUNFKGUpe1xuXHRcdFx0XHR0aGlzLnNlbGVjdERhdGUoZSlcblx0XHRcdH0sXG5cdFx0XHRMRUZUKCl7fSxcblx0XHRcdFVQKCl7fSxcblx0XHRcdFJJR0hUKCl7fSxcblx0XHRcdERPV04oKXt9XG5cdFx0fVxuXHRcdGlmKEtFWUNPREVTW2Uua2V5Q29kZV0gJiYga2V5RG93bkRpY3Rpb25hcnlbS0VZQ09ERVNbZS5rZXlDb2RlXV0pIGtleURvd25EaWN0aW9uYXJ5W0tFWUNPREVTW2Uua2V5Q29kZV1dLmNhbGwodGhpcywgZSk7XG5cdH0sXG5cdGhhbmRsZUNsaWNrKGUpe1xuXG5cdH0sXG5cdHNlbGVjdERhdGUoZSl7XG5cdFx0dGhpcy5zdGFydERhdGUgPSB0aGlzLm1vbnRoVmlldy5tb2RlbFsrZS50YXJnZXQuZ2V0QXR0cmlidXRlKCdkYXRhLW1vZGVsLWluZGV4JyldO1xuXHRcdHRoaXMucm9vdERhdGUgPSB0aGlzLnN0YXJ0RGF0ZTtcblx0XHQvL3RoaXMuY2xvc2UoKTtcblx0fVxufTtcblxuXG4vKlxuXG5cbkxlZnQ6IE1vdmUgZm9jdXMgdG8gdGhlIHByZXZpb3VzIGRheS4gV2lsbCBtb3ZlIHRvIHRoZSBsYXN0IGRheSBvZiB0aGUgcHJldmlvdXMgbW9udGgsIGlmIHRoZSBjdXJyZW50IGRheSBpcyB0aGUgZmlyc3QgZGF5IG9mIGEgbW9udGguXG5SaWdodDogTW92ZSBmb2N1cyB0byB0aGUgbmV4dCBkYXkuIFdpbGwgbW92ZSB0byB0aGUgZmlyc3QgZGF5IG9mIHRoZSBmb2xsb3dpbmcgbW9udGgsIGlmIHRoZSBjdXJyZW50IGRheSBpcyB0aGUgbGFzdCBkYXkgb2YgYSBtb250aC5cblVwOiBNb3ZlIGZvY3VzIHRvIHRoZSBzYW1lIGRheSBvZiB0aGUgcHJldmlvdXMgd2Vlay4gV2lsbCB3cmFwIHRvIHRoZSBhcHByb3ByaWF0ZSBkYXkgaW4gdGhlIHByZXZpb3VzIG1vbnRoLlxuRG93bjogTW92ZSBmb2N1cyB0byB0aGUgc2FtZSBkYXkgb2YgdGhlIGZvbGxvd2luZyB3ZWVrLiBXaWxsIHdyYXAgdG8gdGhlIGFwcHJvcHJpYXRlIGRheSBpbiB0aGUgZm9sbG93aW5nIG1vbnRoLlxuUGdVcDogTW92ZSBmb2N1cyB0byB0aGUgc2FtZSBkYXRlIG9mIHRoZSBwcmV2aW91cyBtb250aC4gSWYgdGhhdCBkYXRlIGRvZXMgbm90IGV4aXN0LCBmb2N1cyBpcyBwbGFjZWQgb24gdGhlIGxhc3QgZGF5IG9mIHRoZSBtb250aC5cblBnVXA6IE1vdmUgZm9jdXMgdG8gdGhlIHNhbWUgZGF0ZSBvZiB0aGUgZm9sbG93aW5nIG1vbnRoLiBJZiB0aGF0IGRhdGUgZG9lcyBub3QgZXhpc3QsIGZvY3VzIGlzIHBsYWNlZCBvbiB0aGUgbGFzdCBkYXkgb2YgdGhlIG1vbnRoLlxuQ3RybCtQZ1VwOiBNb3ZlIGZvY3VzIHRvIHRoZSBzYW1lIGRhdGUgb2YgdGhlIHByZXZpb3VzIHllYXIuIElmIHRoYXQgZGF0ZSBkb2VzIG5vdCBleGlzdCAoZS5nIGxlYXAgeWVhciksIGZvY3VzIGlzIHBsYWNlZCBvbiB0aGUgbGFzdCBkYXkgb2YgdGhlIG1vbnRoLlxuQ3RybCtQZ0RuOiBNb3ZlIGZvY3VzIHRvIHRoZSBzYW1lIGRhdGUgb2YgdGhlIGZvbGxvd2luZyB5ZWFyLiBJZiB0aGF0IGRhdGUgZG9lcyBub3QgZXhpc3QgKGUuZyBsZWFwIHllYXIpLCBmb2N1cyBpcyBwbGFjZWQgb24gdGhlIGxhc3QgZGF5IG9mIHRoZSBtb250aC5cbkhvbWU6IE1vdmUgdG8gdGhlIGZpcnN0IGRheSBvZiB0aGUgbW9udGguXG5FbmQ6IE1vdmUgdG8gdGhlIGxhc3QgZGF5IG9mIHRoZSBtb250aFxuVGFiOiBOYXZpZ2F0ZSBiZXR3ZWVuIGNhbGFuZGVyIGdyaWQgYW5kIHByZXZpb3VzL25leHQgc2VsZWN0aW9uIGJ1dHRvbnNcbkVudGVyL1NwYWNlOiBTZWxlY3QgZGF0ZVxuRXNjYXBlOiBjbG9zZSBjYWxlbmRhciwgbm8gY2hhbmdlXG5cblxuKi8iLCJleHBvcnQgZGVmYXVsdCB7XG5cdGNhbGxiYWNrOiBudWxsLFxuXHRzdGFydE9wZW46IGZhbHNlLFxuXHRzdGFydERhdGU6IGZhbHNlLFxuXHRjbG9zZU9uU2VsZWN0OiBmYWxzZSxcblx0ZGlzcGxheUZvcm1hdDogJ2RkL21tL1lZWVknLFxuXHR2YWx1ZUZvcm1hdDogJ2RkL21tL1lZWVknXG59OyIsImltcG9ydCB7IGRheU5hbWVzLCBtb250aE5hbWVzIH0gZnJvbSAnLi91dGlscyc7XG5cbmV4cG9ydCBjb25zdCBjYWxlbmRhciA9IHByb3BzID0+IGA8ZGl2IGNsYXNzPVwic2RwLWRhdGVcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIGNsYXNzPVwic2RwLWJhY2sganMtc2RwX19iYWNrXCIgdHlwZT1cImJ1dHRvblwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3ZnIGNsYXNzPVwic2RwLWJ0bl9faWNvblwiIHdpZHRoPVwiMTlcIiBoZWlnaHQ9XCIxOVwiIHZpZXdCb3g9XCIwIDAgMTAwMCAxMDAwXCI+PHBhdGggZD1cIk0zMzYuMiAyNzQuNWwtMjEwLjEgMjEwaDgwNS40YzEzIDAgMjMgMTAgMjMgMjNzLTEwIDIzLTIzIDIzSDEyNi4xbDIxMC4xIDIxMC4xYzExIDExIDExIDIxIDAgMzItNSA1LTEwIDctMTYgN3MtMTEtMi0xNi03bC0yNDkuMS0yNDljLTExLTExLTExLTIxIDAtMzJsMjQ5LjEtMjQ5LjFjMjEtMjEuMSA1MyAxMC45IDMyIDMyelwiPjwvcGF0aD48L3N2Zz5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIGNsYXNzPVwic2RwLW5leHQganMtc2RwX19uZXh0XCIgdHlwZT1cImJ1dHRvblwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3ZnIGNsYXNzPVwic2RwLWJ0bl9faWNvblwiIHdpZHRoPVwiMTlcIiBoZWlnaHQ9XCIxOVwiIHZpZXdCb3g9XCIwIDAgMTAwMCAxMDAwXCI+PHBhdGggZD1cIk02OTQuNCAyNDIuNGwyNDkuMSAyNDkuMWMxMSAxMSAxMSAyMSAwIDMyTDY5NC40IDc3Mi43Yy01IDUtMTAgNy0xNiA3cy0xMS0yLTE2LTdjLTExLTExLTExLTIxIDAtMzJsMjEwLjEtMjEwLjFINjcuMWMtMTMgMC0yMy0xMC0yMy0yM3MxMC0yMyAyMy0yM2g4MDUuNEw2NjIuNCAyNzQuNWMtMjEtMjEuMSAxMS01My4xIDMyLTMyLjF6XCI+PC9wYXRoPjwvc3ZnPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJqcy1zZHBfX21vbnRoXCI+PC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5gO1xuXG5leHBvcnQgY29uc3QgbW9udGggPSBwcm9wcyA9PiBgPGRpdiBjbGFzcz1cInNkcC1tb250aC1sYWJlbFwiPiR7cHJvcHMubW9udGhUaXRsZX0gJHtwcm9wcy55ZWFyVGl0bGV9PC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICA8dGFibGUgY2xhc3M9XCJzZHAtZGF5c1wiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0aGVhZCBjbGFzcz1cInNkcC1kYXlzLWhlYWRcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRyIGNsYXNzPVwic2RwLWRheXMtcm93XCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGggY2xhc3M9XCJzZHAtZGF5LWhlYWRcIj5NbzwvdGg+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGggY2xhc3M9XCJzZHAtZGF5LWhlYWRcIj5UdTwvdGg+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGggY2xhc3M9XCJzZHAtZGF5LWhlYWRcIj5XZTwvdGg+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGggY2xhc3M9XCJzZHAtZGF5LWhlYWRcIj5UaDwvdGg+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGggY2xhc3M9XCJzZHAtZGF5LWhlYWRcIj5GcjwvdGg+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGggY2xhc3M9XCJzZHAtZGF5LWhlYWRcIj5TYTwvdGg+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGggY2xhc3M9XCJzZHAtZGF5LWhlYWRcIj5TdTwvdGg+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvdHI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC90aGVhZD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGJvZHkgY2xhc3M9XCJzZHAtZGF5cy1ib2R5XCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICR7cHJvcHMubW9kZWwubWFwKHdlZWtzKHByb3BzLmFjdGl2ZSkpLmpvaW4oJycpfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvdGJvZHk+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L3RhYmxlPmA7XG5cbmNvbnN0IGRheSA9IChhY3RpdmVEYXlzLCBwcm9wcywgaSkgPT4gYDx0ZCBjbGFzcz1cInNkcC1kYXktYm9keSR7cHJvcHMubmV4dE1vbnRoID8gJyBzZHAtZGF5LW5leHQtbW9udGggc2RwLWRheS1kaXNhYmxlZCcgOiAnJ30ke3Byb3BzLnByZXZpb3VzTW9udGggPyAnIHNkcC1kYXktcHJldi1tb250aCBzZHAtZGF5LWRpc2FibGVkJyA6ICcnfSR7cHJvcHMuYWN0aXZlID8gJyBzZHAtZGF5LXNlbGVjdGVkJyA6ICcnfVwiPjxidXR0b24gY2xhc3M9XCJzZHAtZGF5LWJ0blwiIHJvbGU9XCJidXR0b25cIiBkYXRhLW1vZGVsLWluZGV4PVwiJHtpfVwiIGFyaWEtbGFiZWw9XCIke2RheU5hbWVzW3Byb3BzLmRhdGUuZ2V0RGF5KCldfSwgJHttb250aE5hbWVzW3Byb3BzLmRhdGUuZ2V0TW9udGgoKV19ICR7cHJvcHMuZGF0ZS5nZXREYXRlKCl9LCAke3Byb3BzLmRhdGUuZ2V0RnVsbFllYXIoKX1cIiR7cHJvcHMucHJldmlvdXNNb250aCB8fCBwcm9wcy5uZXh0TW9udGggPyBcIiBkaXNhYmxlZFwiIDogXCJcIn0+JHtwcm9wcy5udW1iZXJ9PC9idXR0b24+PC90ZD5gO1xuXG5jb25zdCB3ZWVrcyA9IGFjdGl2ZURheXMgPT4gKHByb3BzLCBpLCBhcnIpID0+IHtcbiAgICBpZihpID09PSAwKSByZXR1cm4gYDx0ciBjbGFzcz1cInNkcC1kYXlzLXJvd1wiPiR7ZGF5KGFjdGl2ZURheXMsIHByb3BzLCBpKX1gO1xuICAgIGVsc2UgaWYgKGkgPT09IGFyci5sZW5ndGggLSAxKSByZXR1cm4gYCR7ZGF5KGFjdGl2ZURheXMsIHByb3BzLCBpKX08L3RyPmA7XG4gICAgZWxzZSBpZigoaSsxKSAlIDcgPT09IDApIHJldHVybiBgJHtkYXkoYWN0aXZlRGF5cywgcHJvcHMsIGkpfTwvdHI+PHRyIGNsYXNzPVwic2RwLWRheXMtcm93XCI+YDtcbiAgICBlbHNlIHJldHVybiBkYXkoYWN0aXZlRGF5cywgcHJvcHMsIGkpO1xufTsiLCJleHBvcnQgY29uc3QgbW9udGhOYW1lcyA9IFsnSmFudWFyeScsICdGZWJydWFyeScsICdNYXJjaCcsICdBcHJpbCcsICdNYXknLCAnSnVuZScsICdKdWx5JywgJ0F1Z3VzdCcsICdTZXB0ZW1iZXInLCAnT2N0b2JlcicsICdOb3ZlbWJlcicsICdEZWNlbWJlciddO1xuXG5leHBvcnQgY29uc3QgZGF5TmFtZXMgPSBbJ1N1bmRheScsJ01vbmRheScsJ1R1ZXNkYXknLCdXZWRuZXNkYXknLCdUaHVyc2RheScsJ0ZyaWRheScsJ1NhdHVyZGF5J107XG5cbmNvbnN0IGlzVG9kYXkgPSBjYW5kaWRhdGUgPT4ge1xuICAgIGxldCB0b2RheSA9IG5ldyBEYXRlKCk7XG4gICAgdG9kYXkuc2V0SG91cnMoMCwwLDAsMCk7XG4gICAgcmV0dXJuIGNhbmRpZGF0ZS5nZXRUaW1lKCkgPT09IHRvZGF5LmdldFRpbWUoKTtcbn07XG5cbmNvbnN0IGlzU3RhcnREYXRlID0gKHN0YXJ0RGF0ZSwgY2FuZGlkYXRlKSA9PiBzdGFydERhdGUuZ2V0VGltZSgpID09PSBjYW5kaWRhdGUuZ2V0VGltZSgpO1xuXG5jb25zdCBtb250aE1vZGVsID0gKHllYXIsIG1vbnRoLCBzdGFydERhdGUpID0+IHtcbiAgICBsZXQgdGhlTW9udGggPSBuZXcgRGF0ZSh5ZWFyLCBtb250aCArIDEsIDApLFxuICAgICAgICB0b3RhbERheXMgPSB0aGVNb250aC5nZXREYXRlKCksXG4gICAgICAgIGVuZERheSA9IHRoZU1vbnRoLmdldERheSgpLFxuICAgICAgICBzdGFydERheSxcbiAgICAgICAgcHJldk1vbnRoU3RhcnREYXkgPSBmYWxzZSxcbiAgICAgICAgcHJldk1vbnRoID0gbmV3IERhdGUoeWVhciwgbW9udGgsIDApLFxuICAgICAgICBwcmV2TW9udGhFbmREYXkgPSBwcmV2TW9udGguZ2V0RGF0ZSgpLFxuICAgICAgICBvdXRwdXQgPSBbXTtcblxuICAgIHRoZU1vbnRoLnNldERhdGUoMSk7XG4gICAgc3RhcnREYXkgPSB0aGVNb250aC5nZXREYXkoKTtcbiAgICBcbiAgICBpZihzdGFydERheSAhPT0gMSkge1xuICAgICAgICBpZihzdGFydERheSA9PT0gMCkgcHJldk1vbnRoU3RhcnREYXkgPSBwcmV2TW9udGguZ2V0RGF0ZSgpIC0gNTtcbiAgICAgICAgZWxzZSBwcmV2TW9udGhTdGFydERheSA9IHByZXZNb250aC5nZXREYXRlKCkgLSAoc3RhcnREYXkgLSAyKTtcbiAgICB9XG5cbiAgICBpZihwcmV2TW9udGhTdGFydERheSl7XG4gICAgICAgIHdoaWxlKHByZXZNb250aFN0YXJ0RGF5IDw9IHByZXZNb250aEVuZERheSl7XG4gICAgICAgICAgICBsZXQgdG1wRGF0ZSA9IG5ldyBEYXRlKHByZXZNb250aC5nZXRGdWxsWWVhcigpLCBwcmV2TW9udGguZ2V0TW9udGgoKSwgcHJldk1vbnRoU3RhcnREYXkpO1xuICAgICAgICAgICAgb3V0cHV0LnB1c2goe1xuICAgICAgICAgICAgICAgIG51bWJlcjogcHJldk1vbnRoU3RhcnREYXksXG4gICAgICAgICAgICAgICAgcHJldmlvdXNNb250aDogdHJ1ZSxcbiAgICAgICAgICAgICAgICBpc1RvZGF5OiBpc1RvZGF5KHRtcERhdGUpLFxuICAgICAgICAgICAgICAgIGlzU3RhcnREYXRlOiBpc1N0YXJ0RGF0ZShzdGFydERhdGUsIHRtcERhdGUpLFxuXHRcdFx0XHRkYXRlOiB0bXBEYXRlXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHByZXZNb250aFN0YXJ0RGF5Kys7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZm9yKGxldCBpID0gMTsgaSA8PSB0b3RhbERheXM7IGkrKykge1xuICAgICAgICBsZXQgdG1wRGF0ZSA9IG5ldyBEYXRlKHllYXIsIG1vbnRoLCBpKTtcbiAgICAgICAgb3V0cHV0LnB1c2goeyBcbiAgICAgICAgICAgIG51bWJlcjogaSxcbiAgICAgICAgICAgIGRhdGU6IHRtcERhdGUsXG4gICAgICAgICAgICBpc1N0YXJ0RGF0ZTogaXNTdGFydERhdGUoc3RhcnREYXRlLCB0bXBEYXRlKSxcbiAgICAgICAgICAgIGlzVG9kYXk6IGlzVG9kYXkodG1wRGF0ZSlcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgaWYoZW5kRGF5ICE9PSAwKSBmb3IobGV0IGkgPSAxOyBpIDw9ICg3IC0gZW5kRGF5KTsgaSsrKSB7XG4gICAgICAgIGxldCB0bXBEYXRlID0gbmV3IERhdGUoeWVhciwgbW9udGggKyAxLCBpKTtcbiAgICAgICAgb3V0cHV0LnB1c2goeyBcbiAgICAgICAgICAgIG51bWJlcjogaSxcbiAgICAgICAgICAgIG5leHRNb250aDogdHJ1ZSxcbiAgICAgICAgICAgIGRhdGU6IHRtcERhdGUsXG4gICAgICAgICAgICBpc1N0YXJ0RGF0ZTogaXNTdGFydERhdGUoc3RhcnREYXRlLCB0bXBEYXRlKSxcbiAgICAgICAgICAgIGlzVG9kYXk6IGlzVG9kYXkodG1wRGF0ZSlcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiBvdXRwdXQ7XG59O1xuXG5leHBvcnQgY29uc3QgbW9udGhWaWV3RmFjdG9yeSA9IChyb290RGF0ZSwgc3RhcnREYXRlKSA9PiAoe1xuXHRtb2RlbDogbW9udGhNb2RlbChyb290RGF0ZS5nZXRGdWxsWWVhcigpLCByb290RGF0ZS5nZXRNb250aCgpLCBzdGFydERhdGUpLFxuXHRtb250aFRpdGxlOiBtb250aE5hbWVzW3Jvb3REYXRlLmdldE1vbnRoKCldLFxuXHR5ZWFyVGl0bGU6IHJvb3REYXRlLmdldEZ1bGxZZWFyKClcbn0pO1xuXG5leHBvcnQgY29uc3QgZWxlbWVudEZhY3RvcnkgPSAodHlwZSwgYXR0cmlidXRlcyA9IHt9LCBjbGFzc05hbWUpID0+IHtcbiAgICBsZXQgZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KHR5cGUpO1xuXG4gICAgZm9yKGxldCBwcm9wIGluIGF0dHJpYnV0ZXMpIGVsLnNldEF0dHJpYnV0ZShwcm9wLCBhdHRyaWJ1dGVzW3Byb3BdKTtcbiAgICBpZihjbGFzc05hbWUpIGVsLmNsYXNzTmFtZSA9IGNsYXNzTmFtZTtcblxuICAgIHJldHVybiBlbDtcbn07Il19
