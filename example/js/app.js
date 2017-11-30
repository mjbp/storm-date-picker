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
    TRIGGER_KEYCODES = [13, 32];

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
		this.renderView();
		this.isOpen = true;

		//document.body.addEventListener('focusout', this.boundHandleFocusOut);
	},
	close: function close() {
		this.node.parentNode.removeChild(this.container);
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
	renderView: function renderView() {
		this.container = (0, _utils.elementFactory)('div', {}, 'sdp-container');
		this.node.parentNode.appendChild(this.container);
		this.renderMonth();
	},
	renderMonth: function renderMonth() {
		this.monthView = (0, _utils.monthViewFactory)(this.rootDate, this.startDate);
		this.container.innerHTML = (0, _templates.calendar)(this.monthView);
		this.manageButtons();
	},
	enableButton: function enableButton(btn, value) {
		var _this2 = this;

		TRIGGER_EVENTS.forEach(function (ev) {
			btn.addEventListener(ev, function (e) {
				if (!!e.keyCode && !~TRIGGER_KEYCODES.indexOf(e.keyCode)) return;
				_this2.renderView.call(_this2, value);
			});
		});
	},
	manageButtons: function manageButtons() {
		var _this3 = this;

		var backButton = {
			node: this.container.querySelector('.js-calendar__back'),
			value: -1
		},
		    nextButton = {
			node: this.container.querySelector('.js-calendar__next'),
			value: 1
		};

		TRIGGER_EVENTS.forEach(function (ev) {
			[backButton, nextButton].forEach(function (btn) {
				btn.node.addEventListener(ev, function (e) {
					if (!!e.keyCode && !~TRIGGER_KEYCODES.indexOf(e.keyCode)) return;
					_this3.rootDate = new Date(_this3.rootDate.getFullYear(), _this3.rootDate.getMonth() + btn.value);
					_this3.renderMonth();
				});
			});
		});
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
exports.calendar = undefined;

var _utils = require('./utils');

var calendar = exports.calendar = function calendar(props) {
    return '<div class="sdp-date">\n                                        <div class="sdp-month">\n                                            <button class="sdp-back js-calendar__back" type="button">\n                                                <svg class="sdp-btn__icon" width="19" height="19" viewBox="0 0 1000 1000"><path d="M336.2 274.5l-210.1 210h805.4c13 0 23 10 23 23s-10 23-23 23H126.1l210.1 210.1c11 11 11 21 0 32-5 5-10 7-16 7s-11-2-16-7l-249.1-249c-11-11-11-21 0-32l249.1-249.1c21-21.1 53 10.9 32 32z"></path></svg>\n                                            </button>\n                                            <button class="sdp-next js-calendar__next" type="button">\n                                                <svg class="sdp-btn__icon" width="19" height="19" viewBox="0 0 1000 1000"><path d="M694.4 242.4l249.1 249.1c11 11 11 21 0 32L694.4 772.7c-5 5-10 7-16 7s-11-2-16-7c-11-11-11-21 0-32l210.1-210.1H67.1c-13 0-23-10-23-23s10-23 23-23h805.4L662.4 274.5c-21-21.1 11-53.1 32-32.1z"></path></svg>\n                                            </button>\n                                            <div class="sdp-month-label">' + props.monthTitle + ' ' + props.yearTitle + '</div>\n                                            <table class="sdp-days">\n                                                <thead class="sdp-days-head">\n                                                    <tr class="sdp-days-row">\n                                                        <th class="sdp-day-head">Mo</th>\n                                                        <th class="sdp-day-head">Tu</th>\n                                                        <th class="sdp-day-head">We</th>\n                                                        <th class="sdp-day-head">Th</th>\n                                                        <th class="sdp-day-head">Fr</th>\n                                                        <th class="sdp-day-head">Sa</th>\n                                                        <th class="sdp-day-head">Su</th>\n                                                    </tr>\n                                                </thead>\n                                                <tbody class="sdp-days-body">\n                                                    ' + props.model.map(weeks(props.active)).join('') + '\n                                                </tbody>\n                                            </table>\n                                        </div>\n                                    </div>';
};

var day = function day(activeDays, props, i) {
    return '<td class="sdp-day-body' + (props.nextMonth ? ' sdp-day-next-month sdp-day-disabled' : '') + (props.previousMonth ? ' sdp-day-prev-month sdp-day-disabled' : '') + (props.active ? ' sdp-day-selected' : '') + '"><button class="sdp-day-btn" role="button" data-model-index="' + i + '" aria-label="Select ' + _utils.dayNames[props.date.getDay()] + ', ' + _utils.monthNames[props.date.getMonth()] + ' ' + props.date.getDate() + ', ' + props.date.getFullYear() + '"' + (props.previousMonth || props.nextMonth ? " disabled" : "") + '>' + props.number + '</button></td>';
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJleGFtcGxlL3NyYy9hcHAuanMiLCJleGFtcGxlL3NyYy9saWJzL2NvbXBvbmVudC9pbmRleC5qcyIsImV4YW1wbGUvc3JjL2xpYnMvY29tcG9uZW50L2xpYi9jb21wb25lbnQtcHJvdG90eXBlLmpzIiwiZXhhbXBsZS9zcmMvbGlicy9jb21wb25lbnQvbGliL2RlZmF1bHRzLmpzIiwiZXhhbXBsZS9zcmMvbGlicy9jb21wb25lbnQvbGliL3RlbXBsYXRlcy5qcyIsImV4YW1wbGUvc3JjL2xpYnMvY29tcG9uZW50L2xpYi91dGlscy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUE7Ozs7Ozs7O0FBRUEsSUFBTSwyQkFBMkIsWUFBTSxBQUNuQzt3QkFBQSxBQUFXLEtBQVgsQUFBZ0IsQUFDbkI7QUFGRCxBQUFnQyxDQUFBOztBQUloQyxJQUFHLHNCQUFILEFBQXlCLGVBQVEsQUFBTyxpQkFBUCxBQUF3QixvQkFBb0IsWUFBTSxBQUFFOzRCQUFBLEFBQXdCLFFBQVEsVUFBQSxBQUFDLElBQUQ7ZUFBQSxBQUFRO0FBQXhDLEFBQWdEO0FBQXBHLENBQUE7Ozs7Ozs7OztBQ05qQzs7OztBQUNBOzs7Ozs7OztBQUVBLElBQU0sT0FBTyxTQUFQLEFBQU8sS0FBQSxBQUFDLEtBQUQsQUFBTSxNQUFTLEFBQzNCO0tBQUksTUFBTSxHQUFBLEFBQUcsTUFBSCxBQUFTLEtBQUssU0FBQSxBQUFTLGlCQUFqQyxBQUFVLEFBQWMsQUFBMEIsQUFDL0M7QUFFSDs7S0FBRyxDQUFDLElBQUosQUFBUSxRQUFRLE9BQU8sUUFBQSxBQUFRLEtBQWYsQUFBTyxBQUFhLEFBRXBDOztZQUFPLEFBQUksSUFBSSxVQUFBLEFBQUMsSUFBTyxBQUN0QjtNQUFHLEdBQUEsQUFBRyxhQUFOLEFBQW1CLFNBQVMsT0FBTyxRQUFBLEFBQVEsS0FBZixBQUFPLEFBQWEsQUFDaEQ7Z0JBQU8sQUFBTyxPQUFP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Q3BDO3FCQUFTLFFBTGIsQUFBWSxBQUtDLEFBQVEsQUFFeEI7QUFQZSxBQUNSO0FBT1I7V0FBQSxBQUFPLEFBQ1Y7QUFwREQ7O0FBc0RPLElBQU0sOENBQW1CLFNBQW5CLEFBQW1CLGlCQUFBLEFBQUMsVUFBRCxBQUFXLFdBQVg7O2VBQ3hCLFdBQVcsU0FBWCxBQUFXLEFBQVMsZUFBZSxTQUFuQyxBQUFtQyxBQUFTLFlBRE0sQUFDbEQsQUFBd0QsQUFDL0Q7b0JBQVksV0FBVyxTQUZrQyxBQUU3QyxBQUFXLEFBQVMsQUFDaEM7bUJBQVcsU0FIb0IsQUFBMEIsQUFHOUMsQUFBUztBQUhxQyxBQUN6RDtBQURNOztBQU1BLElBQU0sMENBQWlCLFNBQWpCLEFBQWlCLGVBQUEsQUFBQyxNQUFxQztRQUEvQixBQUErQixpRkFBbEIsQUFBa0I7UUFBZCxBQUFjLHNCQUNoRTs7UUFBSSxLQUFLLFNBQUEsQUFBUyxjQUFsQixBQUFTLEFBQXVCLEFBRWhDOztTQUFJLElBQUosQUFBUSxRQUFSLEFBQWdCLFlBQVk7V0FBQSxBQUFHLGFBQUgsQUFBZ0IsTUFBTSxXQUFsRCxBQUE0QixBQUFzQixBQUFXO0FBQzdELFNBQUEsQUFBRyxXQUFXLEdBQUEsQUFBRyxZQUFILEFBQWUsQUFFN0I7O1dBQUEsQUFBTyxBQUNWO0FBUE0iLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiaW1wb3J0IERhdGVQaWNrZXIgZnJvbSAnLi9saWJzL2NvbXBvbmVudCc7XG5cbmNvbnN0IG9uRE9NQ29udGVudExvYWRlZFRhc2tzID0gWygpID0+IHtcbiAgICBEYXRlUGlja2VyLmluaXQoJy5qcy1kYXRlLXBpY2tlcicpO1xufV07XG4gICAgXG5pZignYWRkRXZlbnRMaXN0ZW5lcicgaW4gd2luZG93KSB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsICgpID0+IHsgb25ET01Db250ZW50TG9hZGVkVGFza3MuZm9yRWFjaCgoZm4pID0+IGZuKCkpOyB9KTsiLCJpbXBvcnQgZGVmYXVsdHMgZnJvbSAnLi9saWIvZGVmYXVsdHMnO1xuaW1wb3J0IGNvbXBvbmVudFByb3RvdHlwZSBmcm9tICcuL2xpYi9jb21wb25lbnQtcHJvdG90eXBlJztcblxuY29uc3QgaW5pdCA9IChzZWwsIG9wdHMpID0+IHtcblx0bGV0IGVscyA9IFtdLnNsaWNlLmNhbGwoZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChzZWwpKTtcbiAgICAvL2xldCBlbHMgPSBBcnJheS5mcm9tKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoc2VsKSk7XG5cblx0aWYoIWVscy5sZW5ndGgpIHJldHVybiBjb25zb2xlLndhcm4oJ0RhdGUgcGlja2VyIG5vdCBpbml0aWFsaXNlZCwgbm8gYXVnbWVudGFibGUgZWxlbWVudHMgZm91bmQnKTtcbiAgICBcblx0cmV0dXJuIGVscy5tYXAoKGVsKSA9PiB7XG5cdFx0aWYoZWwubm9kZU5hbWUgPT09ICdpbnB1dCcpIHJldHVybiBjb25zb2xlLndhcm4oJ0RhdGUgcGlja2VyIHRhcmdldCBub2RlIG5vdCBhbiBpbnB1dCcpO1xuXHRcdHJldHVybiBPYmplY3QuYXNzaWduKE9iamVjdC5jcmVhdGUoY29tcG9uZW50UHJvdG90eXBlKSwge1xuXHRcdFx0bm9kZTogZWwsXG5cdFx0XHRzZXR0aW5nczogT2JqZWN0LmFzc2lnbih7fSwgZGVmYXVsdHMsIG9wdHMpXG5cdFx0fSkuaW5pdCgpO1xuXHR9KTtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IHsgaW5pdCB9OyIsImltcG9ydCB7IGVsZW1lbnRGYWN0b3J5LCBtb250aFZpZXdGYWN0b3J5IH0gZnJvbSAnLi91dGlscyc7XG5pbXBvcnQgeyBjYWxlbmRhciB9IGZyb20gJy4vdGVtcGxhdGVzJztcblxuY29uc3QgVFJJR0dFUl9FVkVOVFMgPSBbJ2NsaWNrJywgJ2tleWRvd24nXSxcblx0ICBUUklHR0VSX0tFWUNPREVTID0gWzEzLCAzMl07XG5cbmV4cG9ydCBkZWZhdWx0IHtcblx0aW5pdCgpIHtcblx0XHR0aGlzLm5vZGUuYWRkRXZlbnRMaXN0ZW5lcignZm9jdXMnLCB0aGlzLm9wZW4uYmluZCh0aGlzKSk7XG5cblx0XHR0aGlzLmJvdW5kSGFuZGxlRm9jdXNPdXQgPSB0aGlzLmhhbmRsZUZvY3VzT3V0LmJpbmQodGhpcyk7XG5cblxuXHRcdHRoaXMuc3RhcnREYXRlID0gbmV3IERhdGUoKTtcblx0XHR0aGlzLnN0YXJ0RGF0ZS5zZXRIb3VycygwLDAsMCwwKTtcblxuXHRcdHRoaXMucm9vdERhdGUgPSB0aGlzLnN0YXJ0RGF0ZTtcblx0XHQvL2Zyb20gdmFsdWUsIG5vdCB2YWxpZGF0aW5nIGRhdGUgaGVyZSwgdXAgdG8gdGhlIHVzZXJcblxuXG5cdFx0dGhpcy5zZXR0aW5ncy5zdGFydE9wZW4gJiYgdGhpcy5vcGVuKCk7XG5cblxuXHRcdC8qXG5cdFx0bGV0IHRvdGFsRGF5cyA9IGRpZmZEYXlzKHRoaXMuc3RhcnREYXRlLCB0aGlzLmVuZERhdGUpLFxuXHRcdFx0ZXZlbnREYXRlT2JqZWN0cyA9IFtdO1xuXHRcdFxuXHRcdGZvciAobGV0IGkgPSAwOyBpIDw9IHRvdGFsRGF5czsgaSsrKSBldmVudERhdGVPYmplY3RzLnB1c2goYWRkRGF5cyh0aGlzLnN0YXJ0RGF0ZSwgaSkpO1xuXHRcdHRoaXMuZGF0YSA9IGV2ZW50RGF0ZU9iamVjdHMucmVkdWNlKChhY2MsIGN1cnIpID0+IHtcblx0XHRcdFx0bGV0IGV4aXN0aW5nTW9udGhJbmRleCA9IGFjYy5tb250aFZpZXdzLmxlbmd0aCA/IGFjYy5tb250aFZpZXdzLnJlZHVjZShtb250aFZpZXdFeGlzdHMoY3VyciksIC0xKSA6IGZhbHNlO1xuXHRcdFx0XHRpZighYWNjLm1vbnRoVmlld3MubGVuZ3RoIHx8IGV4aXN0aW5nTW9udGhJbmRleCA9PT0gLTEpIGFjYy5tb250aFZpZXdzLnB1c2gobW9udGhWaWV3RmFjdG9yeShjdXJyKSk7XG5cdFx0XHRcdFxuXHRcdFx0XHRhY2MuYWN0aXZlRGF0ZXNbY3Vyci5nZXRGdWxsWWVhcigpXSA9IGFjYy5hY3RpdmVEYXRlc1tjdXJyLmdldEZ1bGxZZWFyKCldIHx8IHt9O1xuXHRcdFx0XHRpZihhY2MuYWN0aXZlRGF0ZXNbY3Vyci5nZXRGdWxsWWVhcigpXSAmJiBhY2MuYWN0aXZlRGF0ZXNbY3Vyci5nZXRGdWxsWWVhcigpXVttb250aE5hbWVzW2N1cnIuZ2V0TW9udGgoKV1dKSBcblx0XHRcdFx0XHRhY2MuYWN0aXZlRGF0ZXNbY3Vyci5nZXRGdWxsWWVhcigpXVttb250aE5hbWVzW2N1cnIuZ2V0TW9udGgoKV1dLnB1c2goY3Vyci5nZXREYXRlKCkpO1xuXHRcdFx0XHRpZighYWNjLmFjdGl2ZURhdGVzW2N1cnIuZ2V0RnVsbFllYXIoKV1bbW9udGhOYW1lc1tjdXJyLmdldE1vbnRoKCldXSlcblx0XHRcdFx0XHRhY2MuYWN0aXZlRGF0ZXNbY3Vyci5nZXRGdWxsWWVhcigpXVttb250aE5hbWVzW2N1cnIuZ2V0TW9udGgoKV1dID0gW2N1cnIuZ2V0RGF0ZSgpXTtcblxuXHRcdFx0XHRyZXR1cm4gYWNjO1xuXHRcdFx0fSwgeyBtb250aFZpZXdzOiBbXSwgYWN0aXZlRGF0ZXM6IHt9IH0pO1xuXHRcdFx0XG5cdFx0ZXZlbnREYXRlT2JqZWN0cyA9IFtdO1xuXHRcdFxuXHRcdHRoaXMuZGF0YS5tb250aFZpZXdzID0gYWN0aXZhdGVEYXRlcyh0aGlzLmRhdGEpO1xuXHRcdHRoaXMucmVuZGVyVmlldygwKTtcblx0XHQqL1xuXHRcdHJldHVybiB0aGlzO1xuXHR9LFxuXHR0b2dnbGUoKXtcblx0XHRpZih0aGlzLmlzT3BlbikgdGhpcy5jbG9zZSgpO1xuXHRcdGVsc2UgdGhpcy5vcGVuKCk7XG5cdH0sXG5cdG9wZW4oKXtcblx0XHRpZih0aGlzLmlzT3BlbikgcmV0dXJuO1xuXHRcdHRoaXMucmVuZGVyVmlldygpO1xuXHRcdHRoaXMuaXNPcGVuID0gdHJ1ZTtcblxuXHRcdC8vZG9jdW1lbnQuYm9keS5hZGRFdmVudExpc3RlbmVyKCdmb2N1c291dCcsIHRoaXMuYm91bmRIYW5kbGVGb2N1c091dCk7XG5cdH0sXG5cdGNsb3NlKCl7XG5cdFx0dGhpcy5ub2RlLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQodGhpcy5jb250YWluZXIpO1xuXHRcdHRoaXMuaXNPcGVuID0gZmFsc2U7XG5cdFx0Ly9yZW1vdmUgZnJvbSBET01cblx0XHQvL3JlbW92ZSBhbGwgZXZlbnQgbGlzdGVuZXJzXG5cdH0sXG5cdGhhbmRsZUZvY3VzT3V0KCl7XG5cdFx0d2luZG93LnNldFRpbWVvdXQoKCkgPT4ge1xuXHRcdFx0aWYodGhpcy5jb250YWluZXIuY29udGFpbnMoZG9jdW1lbnQuYWN0aXZlRWxlbWVudCkgfHwgdGhpcy5ub2RlID09PSBkb2N1bWVudC5hY3RpdmVFbGVtZW50KSByZXR1cm47XG5cdFx0XHR0aGlzLmNsb3NlKCk7XG5cdFx0XHRkb2N1bWVudC5ib2R5LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2ZvY3Vzb3V0JywgdGhpcy5ib3VuZEhhbmRsZUJsdXIpO1xuXHRcdH0sIDE2KTtcblx0fSxcblx0cmVuZGVyVmlldygpe1xuXHRcdHRoaXMuY29udGFpbmVyID0gZWxlbWVudEZhY3RvcnkoJ2RpdicsIHt9LCAnc2RwLWNvbnRhaW5lcicpO1xuXHRcdHRoaXMubm9kZS5wYXJlbnROb2RlLmFwcGVuZENoaWxkKHRoaXMuY29udGFpbmVyKTtcblx0XHR0aGlzLnJlbmRlck1vbnRoKCk7XG5cdH0sXG5cdHJlbmRlck1vbnRoKCl7XG5cdFx0dGhpcy5tb250aFZpZXcgPSBtb250aFZpZXdGYWN0b3J5KHRoaXMucm9vdERhdGUsIHRoaXMuc3RhcnREYXRlKTtcblx0XHR0aGlzLmNvbnRhaW5lci5pbm5lckhUTUwgPSBjYWxlbmRhcih0aGlzLm1vbnRoVmlldyk7XG5cdFx0dGhpcy5tYW5hZ2VCdXR0b25zKCk7XG5cdH0sXG5cdGVuYWJsZUJ1dHRvbihidG4sIHZhbHVlKXtcblx0XHRUUklHR0VSX0VWRU5UUy5mb3JFYWNoKGV2ID0+IHtcblx0XHRcdGJ0bi5hZGRFdmVudExpc3RlbmVyKGV2LCBlID0+IHtcblx0XHRcdFx0aWYoISFlLmtleUNvZGUgJiYgIX5UUklHR0VSX0tFWUNPREVTLmluZGV4T2YoZS5rZXlDb2RlKSkgcmV0dXJuO1xuXHRcdFx0XHR0aGlzLnJlbmRlclZpZXcuY2FsbCh0aGlzLCB2YWx1ZSk7XG5cdFx0XHR9KTtcblx0XHR9KTtcblx0fSxcblx0bWFuYWdlQnV0dG9ucygpIHtcblx0XHRsZXQgYmFja0J1dHRvbiA9IHtcblx0XHRcdFx0bm9kZTogdGhpcy5jb250YWluZXIucXVlcnlTZWxlY3RvcignLmpzLWNhbGVuZGFyX19iYWNrJyksXG5cdFx0XHRcdHZhbHVlOiAtMVxuXHRcdFx0fSxcblx0XHRcdG5leHRCdXR0b24gPSB7XG5cdFx0XHRcdG5vZGU6IHRoaXMuY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoJy5qcy1jYWxlbmRhcl9fbmV4dCcpLFxuXHRcdFx0XHR2YWx1ZTogMVxuXHRcdFx0fTtcblxuXHRcdFRSSUdHRVJfRVZFTlRTLmZvckVhY2goZXYgPT4ge1xuXHRcdFx0W2JhY2tCdXR0b24sIG5leHRCdXR0b25dLmZvckVhY2goYnRuID0+IHtcblx0XHRcdFx0YnRuLm5vZGUuYWRkRXZlbnRMaXN0ZW5lcihldiwgZSA9PiB7XG5cdFx0XHRcdFx0aWYoISFlLmtleUNvZGUgJiYgIX5UUklHR0VSX0tFWUNPREVTLmluZGV4T2YoZS5rZXlDb2RlKSkgcmV0dXJuO1xuXHRcdFx0XHRcdHRoaXMucm9vdERhdGUgPSBuZXcgRGF0ZSh0aGlzLnJvb3REYXRlLmdldEZ1bGxZZWFyKCksIHRoaXMucm9vdERhdGUuZ2V0TW9udGgoKSArIGJ0bi52YWx1ZSk7XG5cdFx0XHRcdFx0dGhpcy5yZW5kZXJNb250aCgpO1xuXHRcdFx0XHR9KTtcblx0XHRcdH0pO1xuXHRcdH0pO1xuXHR9XG59O1xuXG5cbi8qXG5cblxuTGVmdDogTW92ZSBmb2N1cyB0byB0aGUgcHJldmlvdXMgZGF5LiBXaWxsIG1vdmUgdG8gdGhlIGxhc3QgZGF5IG9mIHRoZSBwcmV2aW91cyBtb250aCwgaWYgdGhlIGN1cnJlbnQgZGF5IGlzIHRoZSBmaXJzdCBkYXkgb2YgYSBtb250aC5cblJpZ2h0OiBNb3ZlIGZvY3VzIHRvIHRoZSBuZXh0IGRheS4gV2lsbCBtb3ZlIHRvIHRoZSBmaXJzdCBkYXkgb2YgdGhlIGZvbGxvd2luZyBtb250aCwgaWYgdGhlIGN1cnJlbnQgZGF5IGlzIHRoZSBsYXN0IGRheSBvZiBhIG1vbnRoLlxuVXA6IE1vdmUgZm9jdXMgdG8gdGhlIHNhbWUgZGF5IG9mIHRoZSBwcmV2aW91cyB3ZWVrLiBXaWxsIHdyYXAgdG8gdGhlIGFwcHJvcHJpYXRlIGRheSBpbiB0aGUgcHJldmlvdXMgbW9udGguXG5Eb3duOiBNb3ZlIGZvY3VzIHRvIHRoZSBzYW1lIGRheSBvZiB0aGUgZm9sbG93aW5nIHdlZWsuIFdpbGwgd3JhcCB0byB0aGUgYXBwcm9wcmlhdGUgZGF5IGluIHRoZSBmb2xsb3dpbmcgbW9udGguXG5QZ1VwOiBNb3ZlIGZvY3VzIHRvIHRoZSBzYW1lIGRhdGUgb2YgdGhlIHByZXZpb3VzIG1vbnRoLiBJZiB0aGF0IGRhdGUgZG9lcyBub3QgZXhpc3QsIGZvY3VzIGlzIHBsYWNlZCBvbiB0aGUgbGFzdCBkYXkgb2YgdGhlIG1vbnRoLlxuUGdVcDogTW92ZSBmb2N1cyB0byB0aGUgc2FtZSBkYXRlIG9mIHRoZSBmb2xsb3dpbmcgbW9udGguIElmIHRoYXQgZGF0ZSBkb2VzIG5vdCBleGlzdCwgZm9jdXMgaXMgcGxhY2VkIG9uIHRoZSBsYXN0IGRheSBvZiB0aGUgbW9udGguXG5DdHJsK1BnVXA6IE1vdmUgZm9jdXMgdG8gdGhlIHNhbWUgZGF0ZSBvZiB0aGUgcHJldmlvdXMgeWVhci4gSWYgdGhhdCBkYXRlIGRvZXMgbm90IGV4aXN0IChlLmcgbGVhcCB5ZWFyKSwgZm9jdXMgaXMgcGxhY2VkIG9uIHRoZSBsYXN0IGRheSBvZiB0aGUgbW9udGguXG5DdHJsK1BnRG46IE1vdmUgZm9jdXMgdG8gdGhlIHNhbWUgZGF0ZSBvZiB0aGUgZm9sbG93aW5nIHllYXIuIElmIHRoYXQgZGF0ZSBkb2VzIG5vdCBleGlzdCAoZS5nIGxlYXAgeWVhciksIGZvY3VzIGlzIHBsYWNlZCBvbiB0aGUgbGFzdCBkYXkgb2YgdGhlIG1vbnRoLlxuSG9tZTogTW92ZSB0byB0aGUgZmlyc3QgZGF5IG9mIHRoZSBtb250aC5cbkVuZDogTW92ZSB0byB0aGUgbGFzdCBkYXkgb2YgdGhlIG1vbnRoXG5UYWI6IE5hdmlnYXRlIGJldHdlZW4gY2FsYW5kZXIgZ3JpZCBhbmQgcHJldmlvdXMvbmV4dCBzZWxlY3Rpb24gYnV0dG9uc1xuRW50ZXIvU3BhY2U6IFNlbGVjdCBkYXRlXG5Fc2NhcGU6IGNsb3NlIGNhbGVuZGFyLCBubyBjaGFuZ2VcblxuXG4qLyIsImV4cG9ydCBkZWZhdWx0IHtcblx0Y2FsbGJhY2s6IG51bGwsXG5cdHN0YXJ0T3BlbjogZmFsc2UsXG5cdHN0YXJ0RGF0ZTogZmFsc2UsXG5cdGNsb3NlT25TZWxlY3Q6IGZhbHNlLFxuXHRkaXNwbGF5Rm9ybWF0OiAnZGQvbW0vWVlZWScsXG5cdHZhbHVlRm9ybWF0OiAnZGQvbW0vWVlZWSdcbn07IiwiaW1wb3J0IHsgZGF5TmFtZXMsIG1vbnRoTmFtZXMgfSBmcm9tICcuL3V0aWxzJztcblxuZXhwb3J0IGNvbnN0IGNhbGVuZGFyID0gcHJvcHMgPT4gYDxkaXYgY2xhc3M9XCJzZHAtZGF0ZVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJzZHAtbW9udGhcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz1cInNkcC1iYWNrIGpzLWNhbGVuZGFyX19iYWNrXCIgdHlwZT1cImJ1dHRvblwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHN2ZyBjbGFzcz1cInNkcC1idG5fX2ljb25cIiB3aWR0aD1cIjE5XCIgaGVpZ2h0PVwiMTlcIiB2aWV3Qm94PVwiMCAwIDEwMDAgMTAwMFwiPjxwYXRoIGQ9XCJNMzM2LjIgMjc0LjVsLTIxMC4xIDIxMGg4MDUuNGMxMyAwIDIzIDEwIDIzIDIzcy0xMCAyMy0yMyAyM0gxMjYuMWwyMTAuMSAyMTAuMWMxMSAxMSAxMSAyMSAwIDMyLTUgNS0xMCA3LTE2IDdzLTExLTItMTYtN2wtMjQ5LjEtMjQ5Yy0xMS0xMS0xMS0yMSAwLTMybDI0OS4xLTI0OS4xYzIxLTIxLjEgNTMgMTAuOSAzMiAzMnpcIj48L3BhdGg+PC9zdmc+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIGNsYXNzPVwic2RwLW5leHQganMtY2FsZW5kYXJfX25leHRcIiB0eXBlPVwiYnV0dG9uXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3ZnIGNsYXNzPVwic2RwLWJ0bl9faWNvblwiIHdpZHRoPVwiMTlcIiBoZWlnaHQ9XCIxOVwiIHZpZXdCb3g9XCIwIDAgMTAwMCAxMDAwXCI+PHBhdGggZD1cIk02OTQuNCAyNDIuNGwyNDkuMSAyNDkuMWMxMSAxMSAxMSAyMSAwIDMyTDY5NC40IDc3Mi43Yy01IDUtMTAgNy0xNiA3cy0xMS0yLTE2LTdjLTExLTExLTExLTIxIDAtMzJsMjEwLjEtMjEwLjFINjcuMWMtMTMgMC0yMy0xMC0yMy0yM3MxMC0yMyAyMy0yM2g4MDUuNEw2NjIuNCAyNzQuNWMtMjEtMjEuMSAxMS01My4xIDMyLTMyLjF6XCI+PC9wYXRoPjwvc3ZnPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInNkcC1tb250aC1sYWJlbFwiPiR7cHJvcHMubW9udGhUaXRsZX0gJHtwcm9wcy55ZWFyVGl0bGV9PC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0YWJsZSBjbGFzcz1cInNkcC1kYXlzXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGhlYWQgY2xhc3M9XCJzZHAtZGF5cy1oZWFkXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRyIGNsYXNzPVwic2RwLWRheXMtcm93XCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0aCBjbGFzcz1cInNkcC1kYXktaGVhZFwiPk1vPC90aD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRoIGNsYXNzPVwic2RwLWRheS1oZWFkXCI+VHU8L3RoPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGggY2xhc3M9XCJzZHAtZGF5LWhlYWRcIj5XZTwvdGg+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0aCBjbGFzcz1cInNkcC1kYXktaGVhZFwiPlRoPC90aD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRoIGNsYXNzPVwic2RwLWRheS1oZWFkXCI+RnI8L3RoPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGggY2xhc3M9XCJzZHAtZGF5LWhlYWRcIj5TYTwvdGg+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0aCBjbGFzcz1cInNkcC1kYXktaGVhZFwiPlN1PC90aD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3RyPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC90aGVhZD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0Ym9keSBjbGFzcz1cInNkcC1kYXlzLWJvZHlcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAke3Byb3BzLm1vZGVsLm1hcCh3ZWVrcyhwcm9wcy5hY3RpdmUpKS5qb2luKCcnKX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvdGJvZHk+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvdGFibGU+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5gO1xuXG5jb25zdCBkYXkgPSAoYWN0aXZlRGF5cywgcHJvcHMsIGkpID0+IGA8dGQgY2xhc3M9XCJzZHAtZGF5LWJvZHkke3Byb3BzLm5leHRNb250aCA/ICcgc2RwLWRheS1uZXh0LW1vbnRoIHNkcC1kYXktZGlzYWJsZWQnIDogJyd9JHtwcm9wcy5wcmV2aW91c01vbnRoID8gJyBzZHAtZGF5LXByZXYtbW9udGggc2RwLWRheS1kaXNhYmxlZCcgOiAnJ30ke3Byb3BzLmFjdGl2ZSA/ICcgc2RwLWRheS1zZWxlY3RlZCcgOiAnJ31cIj48YnV0dG9uIGNsYXNzPVwic2RwLWRheS1idG5cIiByb2xlPVwiYnV0dG9uXCIgZGF0YS1tb2RlbC1pbmRleD1cIiR7aX1cIiBhcmlhLWxhYmVsPVwiU2VsZWN0ICR7ZGF5TmFtZXNbcHJvcHMuZGF0ZS5nZXREYXkoKV19LCAke21vbnRoTmFtZXNbcHJvcHMuZGF0ZS5nZXRNb250aCgpXX0gJHtwcm9wcy5kYXRlLmdldERhdGUoKX0sICR7cHJvcHMuZGF0ZS5nZXRGdWxsWWVhcigpfVwiJHtwcm9wcy5wcmV2aW91c01vbnRoIHx8IHByb3BzLm5leHRNb250aCA/IFwiIGRpc2FibGVkXCIgOiBcIlwifT4ke3Byb3BzLm51bWJlcn08L2J1dHRvbj48L3RkPmA7XG5cbmNvbnN0IHdlZWtzID0gYWN0aXZlRGF5cyA9PiAocHJvcHMsIGksIGFycikgPT4ge1xuICAgIGlmKGkgPT09IDApIHJldHVybiBgPHRyIGNsYXNzPVwic2RwLWRheXMtcm93XCI+JHtkYXkoYWN0aXZlRGF5cywgcHJvcHMsIGkpfWA7XG4gICAgZWxzZSBpZiAoaSA9PT0gYXJyLmxlbmd0aCAtIDEpIHJldHVybiBgJHtkYXkoYWN0aXZlRGF5cywgcHJvcHMsIGkpfTwvdHI+YDtcbiAgICBlbHNlIGlmKChpKzEpICUgNyA9PT0gMCkgcmV0dXJuIGAke2RheShhY3RpdmVEYXlzLCBwcm9wcywgaSl9PC90cj48dHIgY2xhc3M9XCJzZHAtZGF5cy1yb3dcIj5gO1xuICAgIGVsc2UgcmV0dXJuIGRheShhY3RpdmVEYXlzLCBwcm9wcywgaSk7XG59OyIsImV4cG9ydCBjb25zdCBtb250aE5hbWVzID0gWydKYW51YXJ5JywgJ0ZlYnJ1YXJ5JywgJ01hcmNoJywgJ0FwcmlsJywgJ01heScsICdKdW5lJywgJ0p1bHknLCAnQXVndXN0JywgJ1NlcHRlbWJlcicsICdPY3RvYmVyJywgJ05vdmVtYmVyJywgJ0RlY2VtYmVyJ107XG5cbmV4cG9ydCBjb25zdCBkYXlOYW1lcyA9IFsnU3VuZGF5JywnTW9uZGF5JywnVHVlc2RheScsJ1dlZG5lc2RheScsJ1RodXJzZGF5JywnRnJpZGF5JywnU2F0dXJkYXknXTtcblxuY29uc3QgaXNUb2RheSA9IGNhbmRpZGF0ZSA9PiB7XG4gICAgbGV0IHRvZGF5ID0gbmV3IERhdGUoKTtcbiAgICB0b2RheS5zZXRIb3VycygwLDAsMCwwKTtcbiAgICByZXR1cm4gY2FuZGlkYXRlLmdldFRpbWUoKSA9PT0gdG9kYXkuZ2V0VGltZSgpO1xufTtcblxuY29uc3QgaXNTdGFydERhdGUgPSAoc3RhcnREYXRlLCBjYW5kaWRhdGUpID0+IHN0YXJ0RGF0ZS5nZXRUaW1lKCkgPT09IGNhbmRpZGF0ZS5nZXRUaW1lKCk7XG5cbmNvbnN0IG1vbnRoTW9kZWwgPSAoeWVhciwgbW9udGgsIHN0YXJ0RGF0ZSkgPT4ge1xuICAgIGxldCB0aGVNb250aCA9IG5ldyBEYXRlKHllYXIsIG1vbnRoICsgMSwgMCksXG4gICAgICAgIHRvdGFsRGF5cyA9IHRoZU1vbnRoLmdldERhdGUoKSxcbiAgICAgICAgZW5kRGF5ID0gdGhlTW9udGguZ2V0RGF5KCksXG4gICAgICAgIHN0YXJ0RGF5LFxuICAgICAgICBwcmV2TW9udGhTdGFydERheSA9IGZhbHNlLFxuICAgICAgICBwcmV2TW9udGggPSBuZXcgRGF0ZSh5ZWFyLCBtb250aCwgMCksXG4gICAgICAgIHByZXZNb250aEVuZERheSA9IHByZXZNb250aC5nZXREYXRlKCksXG4gICAgICAgIG91dHB1dCA9IFtdO1xuXG4gICAgdGhlTW9udGguc2V0RGF0ZSgxKTtcbiAgICBzdGFydERheSA9IHRoZU1vbnRoLmdldERheSgpO1xuICAgIFxuICAgIGlmKHN0YXJ0RGF5ICE9PSAxKSB7XG4gICAgICAgIGlmKHN0YXJ0RGF5ID09PSAwKSBwcmV2TW9udGhTdGFydERheSA9IHByZXZNb250aC5nZXREYXRlKCkgLSA1O1xuICAgICAgICBlbHNlIHByZXZNb250aFN0YXJ0RGF5ID0gcHJldk1vbnRoLmdldERhdGUoKSAtIChzdGFydERheSAtIDIpO1xuICAgIH1cblxuICAgIGlmKHByZXZNb250aFN0YXJ0RGF5KXtcbiAgICAgICAgd2hpbGUocHJldk1vbnRoU3RhcnREYXkgPD0gcHJldk1vbnRoRW5kRGF5KXtcbiAgICAgICAgICAgIGxldCB0bXBEYXRlID0gbmV3IERhdGUocHJldk1vbnRoLmdldEZ1bGxZZWFyKCksIHByZXZNb250aC5nZXRNb250aCgpLCBwcmV2TW9udGhTdGFydERheSk7XG4gICAgICAgICAgICBvdXRwdXQucHVzaCh7XG4gICAgICAgICAgICAgICAgbnVtYmVyOiBwcmV2TW9udGhTdGFydERheSxcbiAgICAgICAgICAgICAgICBwcmV2aW91c01vbnRoOiB0cnVlLFxuICAgICAgICAgICAgICAgIGlzVG9kYXk6IGlzVG9kYXkodG1wRGF0ZSksXG4gICAgICAgICAgICAgICAgaXNTdGFydERhdGU6IGlzU3RhcnREYXRlKHN0YXJ0RGF0ZSwgdG1wRGF0ZSksXG5cdFx0XHRcdGRhdGU6IHRtcERhdGVcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcHJldk1vbnRoU3RhcnREYXkrKztcbiAgICAgICAgfVxuICAgIH1cbiAgICBmb3IobGV0IGkgPSAxOyBpIDw9IHRvdGFsRGF5czsgaSsrKSB7XG4gICAgICAgIGxldCB0bXBEYXRlID0gbmV3IERhdGUoeWVhciwgbW9udGgsIGkpO1xuICAgICAgICBvdXRwdXQucHVzaCh7IFxuICAgICAgICAgICAgbnVtYmVyOiBpLFxuICAgICAgICAgICAgZGF0ZTogdG1wRGF0ZSxcbiAgICAgICAgICAgIGlzU3RhcnREYXRlOiBpc1N0YXJ0RGF0ZShzdGFydERhdGUsIHRtcERhdGUpLFxuICAgICAgICAgICAgaXNUb2RheTogaXNUb2RheSh0bXBEYXRlKVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBpZihlbmREYXkgIT09IDApIGZvcihsZXQgaSA9IDE7IGkgPD0gKDcgLSBlbmREYXkpOyBpKyspIHtcbiAgICAgICAgbGV0IHRtcERhdGUgPSBuZXcgRGF0ZSh5ZWFyLCBtb250aCArIDEsIGkpO1xuICAgICAgICBvdXRwdXQucHVzaCh7IFxuICAgICAgICAgICAgbnVtYmVyOiBpLFxuICAgICAgICAgICAgbmV4dE1vbnRoOiB0cnVlLFxuICAgICAgICAgICAgZGF0ZTogdG1wRGF0ZSxcbiAgICAgICAgICAgIGlzU3RhcnREYXRlOiBpc1N0YXJ0RGF0ZShzdGFydERhdGUsIHRtcERhdGUpLFxuICAgICAgICAgICAgaXNUb2RheTogaXNUb2RheSh0bXBEYXRlKVxuICAgICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIG91dHB1dDtcbn07XG5cbmV4cG9ydCBjb25zdCBtb250aFZpZXdGYWN0b3J5ID0gKHJvb3REYXRlLCBzdGFydERhdGUpID0+ICh7XG5cdG1vZGVsOiBtb250aE1vZGVsKHJvb3REYXRlLmdldEZ1bGxZZWFyKCksIHJvb3REYXRlLmdldE1vbnRoKCksIHN0YXJ0RGF0ZSksXG5cdG1vbnRoVGl0bGU6IG1vbnRoTmFtZXNbcm9vdERhdGUuZ2V0TW9udGgoKV0sXG5cdHllYXJUaXRsZTogcm9vdERhdGUuZ2V0RnVsbFllYXIoKVxufSk7XG5cbmV4cG9ydCBjb25zdCBlbGVtZW50RmFjdG9yeSA9ICh0eXBlLCBhdHRyaWJ1dGVzID0ge30sIGNsYXNzTmFtZSkgPT4ge1xuICAgIGxldCBlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQodHlwZSk7XG5cbiAgICBmb3IobGV0IHByb3AgaW4gYXR0cmlidXRlcykgZWwuc2V0QXR0cmlidXRlKHByb3AsIGF0dHJpYnV0ZXNbcHJvcF0pO1xuICAgIGlmKGNsYXNzTmFtZSkgZWwuY2xhc3NOYW1lID0gY2xhc3NOYW1lO1xuXG4gICAgcmV0dXJuIGVsO1xufTsiXX0=
