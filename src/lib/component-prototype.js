import { 
	elementFactory,
	monthViewFactory,
	catchBubble,
	getMonthLength,
	parseDate,
	formatDate,
	dateIsOutOfBounds,
	getNextActiveDay
} from './utils';
import { calendar, month } from './templates';
import { 
	TRIGGER_EVENTS,
	TRIGGER_KEYCODES,
	KEYCODES,
	ARIA_HELP_TEXT,
	CLASSNAMES,
	SELECTORS,
	DATA_ATTRIBUTES
} from './constants';

export default {
	init() {
		this.initClone();

		TRIGGER_EVENTS.forEach(ev => {
			this.btn.addEventListener(ev, e => {
				if(!!e.keyCode && !~TRIGGER_KEYCODES.indexOf(e.keyCode)) return;
				catchBubble(e);
				this.toggle();
			});
			this.btnClear && this.btnClear.addEventListener(ev, e => {
				if(!!e.keyCode && !~TRIGGER_KEYCODES.indexOf(e.keyCode)) return;
				this.reset();
			});
		});

		this.setDateLimits();
		this.boundHandleFocusOut = this.handleFocusOut.bind(this);

		this.startDate = this.input.value ? parseDate(this.input.value, this.settings.valueFormat) : false;
		if(this.startDate) this.inputClone.value = formatDate(this.startDate, this.settings.displayFormat);

		this.rootDate = this.startDate || new Date();
		this.rootDate.setHours(0,0,0,0);
		this.settings.startOpen && this.open();
		return this;
	},
	setDateLimits(){
		['min', 'max'].forEach(limit => {
			if(this.settings[`${limit}Date`] && !parseDate(this.settings[`${limit}Date`], this.settings.valueFormat)) return console.warn(`${limit}Date setting could not be parsed`);
			this.settings[`${limit}Date`] = this.settings[`${limit}Date`] && parseDate(this.settings[`${limit}Date`], this.settings.valueFormat);
		});
	},
	initClone(){
		this.inputClone = elementFactory('input', { type: 'text', tabindex: -1}, this.input.className);
		this.input.setAttribute('type', 'hidden');
		this.node.appendChild(this.inputClone);

		this.inputClone.addEventListener('change', e => {
			let candidate = parseDate(this.inputClone.value, this.settings.displayFormat)//false if parse fails
			if(candidate) this.setDate(candidate);
			else this.input.value = this.inputClone.value = '';
		});
	},
	toggle(){
		if(this.isOpen) this.close();
		else this.open();
	},
	open(){
		if(this.isOpen) return;
		this.workingDate = this.rootDate;
		this.renderCalendar();
		this.isOpen = true;
		this.btn.setAttribute('aria-expanded', 'true');
		this.container.querySelector(SELECTORS.BTN_ACTIVE) ? this.container.querySelector(SELECTORS.BTN_ACTIVE).focus() : this.container.querySelector(SELECTORS.BTN_TODAY) ? this.container.querySelector(SELECTORS.BTN_TODAY).focus() : this.container.querySelectorAll(SELECTORS.BTN_DEFAULT)[0].focus();
		document.body.addEventListener('focusout', this.boundHandleFocusOut);
	},
	close(){
		if(!this.isOpen) return;
		this.node.removeChild(this.container);
		this.isOpen = false;
		this.btn.setAttribute('aria-expanded', 'false');
		this.btn.focus();
		this.workingDate = false;
	},
	handleFocusOut(){
		window.setTimeout(() => {
			if(this.container.contains(document.activeElement)) return;
			this.close();
			document.body.removeEventListener('focusout', this.boundHandleFocusOut);
		}, 16);
	},
	renderCalendar(){
		this.container = elementFactory('div', { 'role': 'dialog', 'aria-helptext': ARIA_HELP_TEXT }, CLASSNAMES.CONTAINER);
		this.container.innerHTML = calendar();
		this.node.appendChild(this.container);
		this.monthContainer = document.querySelector(SELECTORS.MONTH_CONTAINER);
		this.renderMonth();
		this.initListeners();
	},
	renderMonth(){
		this.monthView = monthViewFactory(this.workingDate || this.rootDate, this.startDate, this.settings.minDate, this.settings.maxDate);
		this.monthContainer.innerHTML = month(this.monthView);
		if(!this.container.querySelector(`${SELECTORS.BTN_DEFAULT}[tabindex="0"]`)) [].slice.call(this.container.querySelectorAll(`${SELECTORS.BTN_DEFAULT}:not([disabled])`)).shift().setAttribute('tabindex', '0');
		this.enableButtons();
	},
	enableButtons(){
		[].slice.call(this.container.querySelectorAll(`.${CLASSNAMES.NAV_BTN}`))
			.forEach((btn, i) => {
				if(dateIsOutOfBounds(!Boolean(i), this.workingDate, this.settings.minDate, this.settings.maxDate)) btn.setAttribute('disabled','disabled');
				else if (btn.hasAttribute('disabled')) btn.removeAttribute('disabled');
			});
	},
	initListeners(){
		TRIGGER_EVENTS.forEach(ev => {
			this.container.addEventListener(ev, this.routeHandlers.bind(this));
		});
	},
	routeHandlers(e){
		if(e.keyCode) this.handleKeyDown(e);
		else {
			if(e.target.classList.contains(CLASSNAMES.NAV_BTN) || e.target.parentNode.classList.contains(CLASSNAMES.NAV_BTN)) this.handleNav(e);
			if(e.target.classList.contains(CLASSNAMES.BTN_DEFAULT)) this.selectDate(e);
		}
	},
	handleNav(e){
		let action = +(e.target.getAttribute(DATA_ATTRIBUTES.ACTION) || e.target.parentNode.getAttribute(DATA_ATTRIBUTES.ACTION));
		this.workingDate = new Date(this.workingDate.getFullYear(), this.workingDate.getMonth() + action);
		this.renderMonth();
		if(e.target.hasAttribute('disabled') || e.target.parentNode.hasAttribute('disabled')) [].slice.call(this.container.querySelectorAll(`${SELECTORS.BTN_DEFAULT}:not([disabled])`))[Boolean(action + 1) ? 'shift' : 'pop']().focus();
	},
	handleKeyDown(e){
		const keyDownDictionary = {
			PAGE_UP(){
				catchBubble(e);
				keyDownDictionary.PAGE.call(this, true);
			},
			PAGE_DOWN(){
				catchBubble(e);
				keyDownDictionary.PAGE.call(this, false);
			},
			PAGE(up){
				if(dateIsOutOfBounds(up, this.workingDate, this.settings.minDate, this.settings.maxDate)) return;

				let nextMonth = up === true ? this.workingDate.getMonth() - 1 : this.workingDate.getMonth() + 1,
					targetDay = getNextActiveDay(nextMonth, e.target.getAttribute(DATA_ATTRIBUTES.DAY), this.workingDate, up, this.settings.minDate, this.settings.maxDate);
					
				this.workingDate = new Date(this.workingDate.getFullYear(), nextMonth, targetDay);
				this.renderMonth();
				let focusableDay = this.container.querySelector(`[${DATA_ATTRIBUTES.DAY}="${targetDay}"]:not(:disabled)`);
				focusableDay && focusableDay.focus();
			},
			TAB(){
				/* 
					- trap tab in focusable children??
						 - return to button after last focusable child?
					- ref. https://github.com/mjbp/storm-focus-manager/blob/master/src/storm-focus-manager.js
				*/
			},
			ENTER(e){
				catchBubble(e);
				if(e.target.classList.contains(CLASSNAMES.BTN_DEFAULT)) this.selectDate(e);
				if(e.target.classList.contains(CLASSNAMES.NAV_BTN)) this.handleNav(e);
			},
			ESCAPE(){ this.close(); },
			SPACE(e) { keyDownDictionary.ENTER(e); },
			LEFT(e){
				catchBubble(e);
				if(!e.target.classList.contains(CLASSNAMES.BTN_DEFAULT)) return;

				if(this.monthView.model[+e.target.getAttribute(DATA_ATTRIBUTES.MODEL_INDEX)].number === 1) {
					this.workingDate = new Date(this.workingDate.getFullYear(), this.workingDate.getMonth() - 1);
					this.renderMonth();
					let focusableDays = [].slice.call(this.container.querySelectorAll(SELECTORS.BTN_ENABLED));
					focusableDays.length > 0 && focusableDays.pop().firstElementChild.focus();
				}
				else this.container.querySelector(`[${DATA_ATTRIBUTES.MODEL_INDEX}="${+e.target.getAttribute(DATA_ATTRIBUTES.MODEL_INDEX) - 1}"]`).focus();
			},
			UP(){
				catchBubble(e);
				if(!e.target.classList.contains(CLASSNAMES.BTN_DEFAULT)) return;
				
				let nextDayIndex = +e.target.getAttribute(DATA_ATTRIBUTES.MODEL_INDEX) - 7;

				if(+this.monthView.model[+e.target.getAttribute(DATA_ATTRIBUTES.MODEL_INDEX)].number - 7 < 1) {
					this.workingDate = new Date(this.workingDate.getFullYear(), this.workingDate.getMonth() - 1);
					this.renderMonth();
					//use this.workingDate instead of querying DOM?
					if(!this.container.querySelector(`[${DATA_ATTRIBUTES.MODEL_INDEX}="${this.monthView.model.length + nextDayIndex}"]`)|| this.container.querySelector(`[${DATA_ATTRIBUTES.MODEL_INDEX}="${this.monthView.model.length + nextDayIndex}"]`) && this.container.querySelector(`[${DATA_ATTRIBUTES.MODEL_INDEX}="${this.monthView.model.length + nextDayIndex}"]`).hasAttribute('disabled')) 
						this.container.querySelector(`[${DATA_ATTRIBUTES.MODEL_INDEX}="${this.monthView.model.length + (nextDayIndex - 7)}"]`).focus();
					else this.container.querySelector(`[${DATA_ATTRIBUTES.MODEL_INDEX}="${this.monthView.model.length + nextDayIndex}"]`).focus();
				}
				else this.container.querySelector(`[${DATA_ATTRIBUTES.MODEL_INDEX}="${nextDayIndex}"]`).focus();
			},
			RIGHT(e){
				catchBubble(e);
				if(!e.target.classList.contains(CLASSNAMES.BTN_DEFAULT)) return;
				
				if(this.monthView.model[+e.target.getAttribute(DATA_ATTRIBUTES.MODEL_INDEX)].number === getMonthLength(this.monthView.model[+e.target.getAttribute(DATA_ATTRIBUTES.MODEL_INDEX)].date.getFullYear(), this.monthView.model[+e.target.getAttribute(DATA_ATTRIBUTES.MODEL_INDEX)].date.getMonth())) {
					this.workingDate = new Date(this.workingDate.getFullYear(), this.workingDate.getMonth() + 1);
					this.renderMonth();
					[].slice.call(this.container.querySelectorAll(SELECTORS.BTN_ENABLED)).shift().firstElementChild.focus();
				}
				else this.container.querySelector(`[${DATA_ATTRIBUTES.MODEL_INDEX}="${+e.target.getAttribute(DATA_ATTRIBUTES.MODEL_INDEX) + 1}"]`).focus();
				
			},
			DOWN(){
				catchBubble(e);
				if(!e.target.classList.contains(CLASSNAMES.BTN_DEFAULT)) return;

				let nextDate = +this.monthView.model[+e.target.getAttribute(DATA_ATTRIBUTES.MODEL_INDEX)].number + 7,
					nextDayIndex = +e.target.getAttribute(DATA_ATTRIBUTES.MODEL_INDEX) + 7;

				if(+this.monthView.model[+e.target.getAttribute(DATA_ATTRIBUTES.MODEL_INDEX)].number + 7 > getMonthLength(this.monthView.model[+e.target.getAttribute(DATA_ATTRIBUTES.MODEL_INDEX)].date.getFullYear(), this.monthView.model[+e.target.getAttribute(DATA_ATTRIBUTES.MODEL_INDEX)].date.getMonth())) {
					this.workingDate = new Date(this.workingDate.getFullYear(), this.workingDate.getMonth() + 1);
					this.renderMonth();
					//use this.workingDate instead of querying DOM?
					if(this.container.querySelector(`[${DATA_ATTRIBUTES.MODEL_INDEX}="${nextDayIndex % 7}"]`).hasAttribute('disabled')) this.container.querySelector(`[${DATA_ATTRIBUTES.MODEL_INDEX}="${(nextDayIndex % 7) + 7}"]`).focus();
					else this.container.querySelector(`[${DATA_ATTRIBUTES.MODEL_INDEX}="${nextDayIndex % 7}"]`).focus();
				}
				else this.container.querySelector(`[${DATA_ATTRIBUTES.MODEL_INDEX}="${nextDayIndex}"]`).focus();
			}
		};
		if(KEYCODES[e.keyCode] && keyDownDictionary[KEYCODES[e.keyCode]]) keyDownDictionary[KEYCODES[e.keyCode]].call(this, e);
	},
	selectDate(e){
		e.target.classList.add(SELECTORS.BTN_ACTIVE);
		this.setDate(this.monthView.model[+e.target.getAttribute(DATA_ATTRIBUTES.MODEL_INDEX)].date);	
		this.close();
	},
	reset(){
		this.rootDate = new Date();
		this.rootDate.setHours(0,0,0,0);
		this.startDate = false;
		this.inputClone.value = '';
		this.input.value = '';
		this.node.classList.remove(CLASSNAMES.HAS_VALUE);	
		if(this.isOpen) this.close();
	},
	setDate(nextDate){
		this.startDate = nextDate;
		this.rootDate = this.startDate;
		this.inputClone.value = formatDate(this.startDate, this.settings.displayFormat);
		this.input.value = formatDate(this.startDate, this.settings.valueFormat);
		!this.node.classList.contains(CLASSNAMES.HAS_VALUE) && this.node.classList.add(CLASSNAMES.HAS_VALUE);
	},
	getValue(){ return this.startDate; },
	setValue(nextValue, format = this.settings.valueFormat){
		this.setDate(parseDate(nextValue, format));
		if(this.isOpen) this.workingDate = this.startDate, this.renderMonth();
	}
};