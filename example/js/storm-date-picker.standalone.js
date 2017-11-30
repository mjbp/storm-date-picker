/**
 * @name storm-date-picker: 
 * @version 0.1.0: Thu, 30 Nov 2017 17:42:51 GMT
 * @author stormid
 * @license MIT
 */
(function(root, factory) {
   var mod = {
       exports: {}
   };
   if (typeof exports !== 'undefined'){
       mod.exports = exports
       factory(mod.exports)
       module.exports = mod.exports.default
   } else {
       factory(mod.exports);
       root.gulpWrapUmd = mod.exports.default
   }

}(this, function(exports) {
   'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
var defaults = {
	callback: null,
	startOpen: false,
	startDate: false,
	closeOnSelect: false,
	displayFormat: 'dd/mm/YYYY',
	valueFormat: 'dd/mm/YYYY'
};

var monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

var dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

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

var monthViewFactory = function monthViewFactory(rootDate, startDate) {
	return {
		model: monthModel(rootDate.getFullYear(), rootDate.getMonth(), startDate),
		monthTitle: monthNames[rootDate.getMonth()],
		yearTitle: rootDate.getFullYear()
	};
};

var elementFactory = function elementFactory(type) {
	var attributes = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
	var className = arguments[2];

	var el = document.createElement(type);

	for (var prop in attributes) {
		el.setAttribute(prop, attributes[prop]);
	}if (className) el.className = className;

	return el;
};

var calendar = function calendar(props) {
	return '<div class="sdp-date">\n                                        <div class="sdp-month">\n                                            <button class="sdp-back js-calendar__back" type="button">\n                                                <svg class="sdp-btn__icon" width="19" height="19" viewBox="0 0 1000 1000"><path d="M336.2 274.5l-210.1 210h805.4c13 0 23 10 23 23s-10 23-23 23H126.1l210.1 210.1c11 11 11 21 0 32-5 5-10 7-16 7s-11-2-16-7l-249.1-249c-11-11-11-21 0-32l249.1-249.1c21-21.1 53 10.9 32 32z"></path></svg>\n                                            </button>\n                                            <button class="sdp-next js-calendar__next" type="button">\n                                                <svg class="sdp-btn__icon" width="19" height="19" viewBox="0 0 1000 1000"><path d="M694.4 242.4l249.1 249.1c11 11 11 21 0 32L694.4 772.7c-5 5-10 7-16 7s-11-2-16-7c-11-11-11-21 0-32l210.1-210.1H67.1c-13 0-23-10-23-23s10-23 23-23h805.4L662.4 274.5c-21-21.1 11-53.1 32-32.1z"></path></svg>\n                                            </button>\n                                            <div class="sdp-month-label">' + props.monthTitle + ' ' + props.yearTitle + '</div>\n                                            <table class="sdp-days">\n                                                <thead class="sdp-days-head">\n                                                    <tr class="sdp-days-row">\n                                                        <th class="sdp-day-head">Mo</th>\n                                                        <th class="sdp-day-head">Tu</th>\n                                                        <th class="sdp-day-head">We</th>\n                                                        <th class="sdp-day-head">Th</th>\n                                                        <th class="sdp-day-head">Fr</th>\n                                                        <th class="sdp-day-head">Sa</th>\n                                                        <th class="sdp-day-head">Su</th>\n                                                    </tr>\n                                                </thead>\n                                                <tbody class="sdp-days-body">\n                                                    ' + props.model.map(weeks(props.active)).join('') + '\n                                                </tbody>\n                                            </table>\n                                        </div>\n                                    </div>';
};

var day = function day(activeDays, props, i) {
	return '<td class="sdp-day-body' + (props.nextMonth ? ' sdp-day-next-month sdp-day-disabled' : '') + (props.previousMonth ? ' sdp-day-prev-month sdp-day-disabled' : '') + (props.active ? ' sdp-day-selected' : '') + '"><button class="sdp-day-btn" role="button" data-model-index="' + i + '" aria-label="Select ' + dayNames[props.date.getDay()] + ', ' + monthNames[props.date.getMonth()] + ' ' + props.date.getDate() + ', ' + props.date.getFullYear() + '"' + (props.previousMonth || props.nextMonth ? " disabled" : "") + '>' + props.number + '</button></td>';
};

var weeks = function weeks(activeDays) {
	return function (props, i, arr) {
		if (i === 0) return '<tr class="sdp-days-row">' + day(activeDays, props, i);else if (i === arr.length - 1) return day(activeDays, props, i) + '</tr>';else if ((i + 1) % 7 === 0) return day(activeDays, props, i) + '</tr><tr class="sdp-days-row">';else return day(activeDays, props, i);
	};
};

var TRIGGER_EVENTS = ['click', 'keydown'];
var TRIGGER_KEYCODES = [13, 32];

var componentPrototype = {
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
		this.container = elementFactory('div', {}, 'sdp-container');
		this.node.parentNode.appendChild(this.container);
		this.renderMonth();
	},
	renderMonth: function renderMonth() {
		this.monthView = monthViewFactory(this.rootDate, this.startDate);
		this.container.innerHTML = calendar(this.monthView);
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

var init = function init(sel, opts) {
	var els = [].slice.call(document.querySelectorAll(sel));
	//let els = Array.from(document.querySelectorAll(sel));

	if (!els.length) return console.warn('Date picker not initialised, no augmentable elements found');

	return els.map(function (el) {
		if (el.nodeName === 'input') return console.warn('Date picker target node not an input');
		return Object.assign(Object.create(componentPrototype), {
			node: el,
			settings: Object.assign({}, defaults, opts)
		}).init();
	});
};

var index = { init: init };

exports.default = index;;
}));
