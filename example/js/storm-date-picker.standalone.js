/**
 * @name storm-date-picker: 
 * @version 0.1.0: Fri, 01 Dec 2017 17:42:14 GMT
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
  // closeOnSelect: false,
  displayFormat: 'dddd MMMM D, YYYY', //Thursday January 12, 2017
  valueFormat: 'DD/MM/YYYY'
};

var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

function createCommonjsModule(fn, module) {
  return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var fecha$1 = createCommonjsModule(function (module) {
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
    var noop = function noop() {};

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
      D: function D(dateObj) {
        return dateObj.getDate();
      },
      DD: function DD(dateObj) {
        return pad(dateObj.getDate());
      },
      Do: function Do(dateObj, i18n) {
        return i18n.DoFn(dateObj.getDate());
      },
      d: function d(dateObj) {
        return dateObj.getDay();
      },
      dd: function dd(dateObj) {
        return pad(dateObj.getDay());
      },
      ddd: function ddd(dateObj, i18n) {
        return i18n.dayNamesShort[dateObj.getDay()];
      },
      dddd: function dddd(dateObj, i18n) {
        return i18n.dayNames[dateObj.getDay()];
      },
      M: function M(dateObj) {
        return dateObj.getMonth() + 1;
      },
      MM: function MM(dateObj) {
        return pad(dateObj.getMonth() + 1);
      },
      MMM: function MMM(dateObj, i18n) {
        return i18n.monthNamesShort[dateObj.getMonth()];
      },
      MMMM: function MMMM(dateObj, i18n) {
        return i18n.monthNames[dateObj.getMonth()];
      },
      YY: function YY(dateObj) {
        return String(dateObj.getFullYear()).substr(2);
      },
      YYYY: function YYYY(dateObj) {
        return dateObj.getFullYear();
      },
      h: function h(dateObj) {
        return dateObj.getHours() % 12 || 12;
      },
      hh: function hh(dateObj) {
        return pad(dateObj.getHours() % 12 || 12);
      },
      H: function H(dateObj) {
        return dateObj.getHours();
      },
      HH: function HH(dateObj) {
        return pad(dateObj.getHours());
      },
      m: function m(dateObj) {
        return dateObj.getMinutes();
      },
      mm: function mm(dateObj) {
        return pad(dateObj.getMinutes());
      },
      s: function s(dateObj) {
        return dateObj.getSeconds();
      },
      ss: function ss(dateObj) {
        return pad(dateObj.getSeconds());
      },
      S: function S(dateObj) {
        return Math.round(dateObj.getMilliseconds() / 100);
      },
      SS: function SS(dateObj) {
        return pad(Math.round(dateObj.getMilliseconds() / 10), 2);
      },
      SSS: function SSS(dateObj) {
        return pad(dateObj.getMilliseconds(), 3);
      },
      a: function a(dateObj, i18n) {
        return dateObj.getHours() < 12 ? i18n.amPm[0] : i18n.amPm[1];
      },
      A: function A(dateObj, i18n) {
        return dateObj.getHours() < 12 ? i18n.amPm[0].toUpperCase() : i18n.amPm[1].toUpperCase();
      },
      ZZ: function ZZ(dateObj) {
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
        var da = new Date(),
            cent = +('' + da.getFullYear()).substr(0, 2);
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
        var parts = (v + '').match(/([\+\-]|\d\d)/gi),
            minutes;

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
      mask = mask.replace(literal, function ($0, $1) {
        literals.push($1);
        return '??';
      });
      // Apply formatting rules
      mask = mask.replace(token, function ($0) {
        return $0 in formatFlags ? formatFlags[$0](dateObj, i18n) : $0.slice(1, $0.length - 1);
      });
      // Inline literal values back into the formatted value
      return mask.replace(/\?\?/g, function () {
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
        date = new Date(Date.UTC(dateInfo.year || today.getFullYear(), dateInfo.month || 0, dateInfo.day || 1, dateInfo.hour || 0, dateInfo.minute || 0, dateInfo.second || 0, dateInfo.millisecond || 0));
      } else {
        date = new Date(dateInfo.year || today.getFullYear(), dateInfo.month || 0, dateInfo.day || 1, dateInfo.hour || 0, dateInfo.minute || 0, dateInfo.second || 0, dateInfo.millisecond || 0);
      }
      return date;
    };

    /* istanbul ignore next */
    if ('object' !== 'undefined' && module.exports) {
      module.exports = fecha;
    } else if (typeof undefined === 'function' && undefined.amd) {
      undefined(function () {
        return fecha;
      });
    } else {
      main.fecha = fecha;
    }
  })(commonjsGlobal);
});

var parseDate = fecha$1.parse;

var formatDate = fecha$1.format;

var monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

var dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

var catchBubble = function catchBubble(e) {
  e.stopImmediatePropagation();
  e.preventDefault();
};

var getMonthLength = function getMonthLength(year, month) {
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
  return '<div class="sdp-date">\n                                        <button class="js-sdp-nav__btn sdp-back" type="button" data-action="-1">\n                                            <svg class="sdp-btn__icon" width="19" height="19" viewBox="0 0 1000 1000"><path d="M336.2 274.5l-210.1 210h805.4c13 0 23 10 23 23s-10 23-23 23H126.1l210.1 210.1c11 11 11 21 0 32-5 5-10 7-16 7s-11-2-16-7l-249.1-249c-11-11-11-21 0-32l249.1-249.1c21-21.1 53 10.9 32 32z"></path></svg>\n                                        </button>\n                                        <button class="js-sdp-nav__btn sdp-next" type="button" data-action="1">\n                                            <svg class="sdp-btn__icon" width="19" height="19" viewBox="0 0 1000 1000"><path d="M694.4 242.4l249.1 249.1c11 11 11 21 0 32L694.4 772.7c-5 5-10 7-16 7s-11-2-16-7c-11-11-11-21 0-32l210.1-210.1H67.1c-13 0-23-10-23-23s10-23 23-23h805.4L662.4 274.5c-21-21.1 11-53.1 32-32.1z"></path></svg>\n                                        </button>\n                                        <div class="js-sdp__month"></div>\n                                    </div>';
};

var month = function month(props) {
  return '<div class="sdp-month-label">' + props.monthTitle + ' ' + props.yearTitle + '</div>\n                        <table class="sdp-days">\n                            <thead class="sdp-days-head">\n                                <tr class="sdp-days-row">\n                                    <th class="sdp-day-head">Mo</th>\n                                    <th class="sdp-day-head">Tu</th>\n                                    <th class="sdp-day-head">We</th>\n                                    <th class="sdp-day-head">Th</th>\n                                    <th class="sdp-day-head">Fr</th>\n                                    <th class="sdp-day-head">Sa</th>\n                                    <th class="sdp-day-head">Su</th>\n                                </tr>\n                            </thead>\n                            <tbody class="sdp-days-body">\n                                ' + props.model.map(weeks(props.active)).join('') + '\n                            </tbody>\n                        </table>';
};

var day = function day(activeDays, props, i) {
  return '<td class="sdp-day-body' + (props.nextMonth ? ' sdp-day-next-month sdp-day-disabled' : '') + (props.previousMonth ? ' sdp-day-prev-month sdp-day-disabled' : '') + (props.active ? ' sdp-day-selected' : '') + '"><button tabindex="' + (props.isStartDate ? 0 : props.isToday ? 0 : -1) + '" class="sdp-day-btn' + (props.isToday ? ' sdp-day-btn--is-today' : '') + (props.isStartDate ? ' sdp-day-btn--is-active' : '') + '" role="button" data-model-index="' + i + '" aria-label="' + (props.isToday ? 'Today, ' : '') + dayNames[props.date.getDay()] + ', ' + monthNames[props.date.getMonth()] + ' ' + props.date.getDate() + ', ' + props.date.getFullYear() + '"' + (props.previousMonth || props.nextMonth ? " disabled" : "") + '>' + props.number + '</button></td>';
};

var weeks = function weeks(activeDays) {
  return function (props, i, arr) {
    if (i === 0) return '<tr class="sdp-days-row">' + day(activeDays, props, i);else if (i === arr.length - 1) return day(activeDays, props, i) + '</tr>';else if ((i + 1) % 7 === 0) return day(activeDays, props, i) + '</tr><tr class="sdp-days-row">';else return day(activeDays, props, i);
  };
};

var TRIGGER_EVENTS = ['click', 'keydown'];

var TRIGGER_KEYCODES = [13, 32];

var KEYCODES = {
  9: 'TAB',
  13: 'ENTER',
  27: 'ESCAPE',
  32: 'SPACE',
  37: 'LEFT',
  38: 'UP',
  39: 'RIGHT',
  40: 'DOWN'
};

var ARIA_HELP_TEXT = 'Press the arrow keys to navigate by day, PageUp and PageDown to navigate by month, Enter or Space to select a date, or Escape to cancel.';

var CLASSNAMES = {
  NAV_BTN: 'js-sdp-nav__btn'
};

var SELECTORS = {
  BTN_DEFAULT: '.sdp-day-btn',
  BTN_ACTIVE: '.sdp-day-btn--is-active',
  BTN_TODAY: '.sdp-day-btn--is-today',
  MONTH_CONTAINER: '.js-sdp__month'
};

var componentPrototype = {
  init: function init() {
    var _this = this;

    this.initClone();

    TRIGGER_EVENTS.forEach(function (ev) {
      _this.btn.addEventListener(ev, function (e) {
        if (!!e.keyCode && !~TRIGGER_KEYCODES.indexOf(e.keyCode)) return;
        catchBubble(e);
        _this.toggle();
      });
    });

    this.boundHandleFocusOut = this.handleFocusOut.bind(this);

    this.startDate = this.input.value ? parseDate(this.input.value, this.settings.valueFormat) : false;
    if (this.startDate) this.inputClone.value = formatDate(this.startDate, this.settings.displayFormat);

    this.rootDate = this.startDate || new Date();
    this.rootDate.setHours(0, 0, 0, 0);

    this.settings.startOpen && this.open();
    return this;
  },
  initClone: function initClone() {
    var _this2 = this;

    this.inputClone = elementFactory('input', { type: 'text', tabindex: -1 }, this.input.className);
    this.input.setAttribute('type', 'hidden');
    this.node.appendChild(this.inputClone);

    this.inputClone.addEventListener('change', function (e) {
      _this2.startDate = parseDate(_this2.inputClone.value, _this2.settings.displayFormat); //throws if parse error
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
    this.container.querySelector(SELECTORS.BTN_ACTIVE) ? this.container.querySelector(SELECTORS.BTN_ACTIVE).focus() : this.container.querySelector(SELECTORS.BTN_TODAY) ? this.container.querySelector(SELECTORS.BTN_TODAY).focus() : this.container.querySelectorAll(SELECTORS.BTN_DEFAULT)[0].focus();
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
    this.container = elementFactory('div', { 'role': 'dialog', 'aria-helptext': ARIA_HELP_TEXT }, 'sdp-container');
    this.container.innerHTML = calendar();
    this.node.appendChild(this.container);
    this.monthContainer = document.querySelector(SELECTORS.MONTH_CONTAINER);
    this.renderMonth();
    this.initListeners();
  },
  renderMonth: function renderMonth() {
    this.monthView = monthViewFactory(this.workingDate || this.rootDate, this.startDate);
    this.monthContainer.innerHTML = month(this.monthView);
    if (!this.container.querySelector(SELECTORS.BTN_DEFAULT + '[tabindex="0"]')) [].slice.call(this.container.querySelectorAll(SELECTORS.BTN_DEFAULT + ':not([disabled])')).shift().setAttribute('tabindex', '0');
  },
  initListeners: function initListeners() {
    var _this4 = this;

    TRIGGER_EVENTS.forEach(function (ev) {
      _this4.container.addEventListener(ev, _this4.routeHandlers.bind(_this4));
    });
  },
  routeHandlers: function routeHandlers(e) {
    if (e.keyCode) this.handleKeyDown(e);else {
      if (e.target.classList.contains(CLASSNAMES.NAV_BTN) || e.target.parentNode.classList.contains(CLASSNAMES.NAV_BTN)) this.handleNav(+(e.target.getAttribute('data-action') || e.target.parentNode.getAttribute('data-action')));
      if (e.target.classList.contains(SELECTORS.BTN_DEFAULT)) this.selectDate(e);
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
        catchBubble(e);
        if (e.target.classList.contains('sdp-day-btn')) this.selectDate(e);
        if (e.target.classList.contains(CLASSNAMES.NAV_BTN)) this.handleNav(+e.target.getAttribute('data-action'));
      },
      ESCAPE: function ESCAPE() {
        this.close();
      },
      SPACE: function SPACE(e) {
        keyDownDictionary.ENTER(e);
      },
      LEFT: function LEFT(e) {
        catchBubble(e);
        if (!e.target.classList.contains('sdp-day-btn')) return;

        if (this.monthView.model[+e.target.getAttribute('data-model-index')].number === 1) {
          this.workingDate = new Date(this.workingDate.getFullYear(), this.workingDate.getMonth() - 1);
          this.renderMonth();
          [].slice.call(this.container.querySelectorAll('.sdp-day-body:not(.sdp-day-disabled)')).pop().firstElementChild.focus();
        } else this.container.querySelector('[data-model-index="' + (+e.target.getAttribute('data-model-index') - 1) + '"]').focus();
      },
      UP: function UP() {
        catchBubble(e);
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
        catchBubble(e);
        if (!e.target.classList.contains('sdp-day-btn')) return;

        if (this.monthView.model[+e.target.getAttribute('data-model-index')].number === getMonthLength(this.monthView.model[+e.target.getAttribute('data-model-index')].date.getFullYear(), this.monthView.model[+e.target.getAttribute('data-model-index')].date.getMonth())) {
          this.workingDate = new Date(this.workingDate.getFullYear(), this.workingDate.getMonth() + 1);
          this.renderMonth();
          [].slice.call(this.container.querySelectorAll('.sdp-day-body:not(.sdp-day-disabled)')).shift().firstElementChild.focus();
        } else this.container.querySelector('[data-model-index="' + (+e.target.getAttribute('data-model-index') + 1) + '"]').focus();
      },
      DOWN: function DOWN() {
        catchBubble(e);
        if (!e.target.classList.contains('sdp-day-btn')) return;

        var nextDate = +this.monthView.model[+e.target.getAttribute('data-model-index')].number + 7,
            nextDayIndex = +e.target.getAttribute('data-model-index') + 7;

        if (+this.monthView.model[+e.target.getAttribute('data-model-index')].number + 7 > getMonthLength(this.monthView.model[+e.target.getAttribute('data-model-index')].date.getFullYear(), this.monthView.model[+e.target.getAttribute('data-model-index')].date.getMonth())) {
          this.workingDate = new Date(this.workingDate.getFullYear(), this.workingDate.getMonth() + 1);
          this.renderMonth();
          //use this.workingDate instead of querying DOM?
          if (this.container.querySelector('[data-model-index="' + nextDayIndex % 7 + '"]').hasAttribute('disabled')) this.container.querySelector('[data-model-index="' + (nextDayIndex % 7 + 7) + '"]').focus();else this.container.querySelector('[data-model-index="' + nextDayIndex % 7 + '"]').focus();
        } else this.container.querySelector('[data-model-index="' + nextDayIndex + '"]').focus();
      }
    };
    if (KEYCODES[e.keyCode] && keyDownDictionary[KEYCODES[e.keyCode]]) keyDownDictionary[KEYCODES[e.keyCode]].call(this, e);
  },
  selectDate: function selectDate(e) {
    this.startDate = this.monthView.model[+e.target.getAttribute('data-model-index')].date;
    this.rootDate = this.startDate;
    e.target.classList.add('sdp-day-btn--is-active');
    this.inputClone.value = formatDate(this.startDate, this.settings.displayFormat);
    this.input.value = formatDate(this.startDate, this.settings.valueFormat);
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
    this.rootDate = parseDate(nextValue, this.settings.valueFormat);
    this.rootDate.setHours(0, 0, 0, 0);
    this.startDate = this.rootDate;
    this.inputClone.value = formatDate(this.rootDate, this.settings.displayFormat);
    this.input.value = this.startDate;
    if (this.isOpen) this.workingDate = this.startDate, this.renderMonth();
  }
};

var init = function init(sel, opts) {
  var els = [].slice.call(document.querySelectorAll(sel));
  //let els = Array.from(document.querySelectorAll(sel));

  if (!els.length) return console.warn('Date picker not initialised, no augmentable elements found');

  return els.map(function (el) {
    return Object.assign(Object.create(componentPrototype), {
      node: el,
      input: el.querySelector('input'),
      btn: el.querySelector('.btn'),
      settings: Object.assign({}, defaults, opts)
    }).init();
  });
};

var index = { init: init };

exports.default = index;;
}));
