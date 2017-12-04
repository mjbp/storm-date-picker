import { 
	elementFactory,
	monthViewFactory,
	catchBubble,
	monthNames,
	dayNames,
	getMonthLength,
	parseDate,
	formatDate
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
		});

		this.boundHandleFocusOut = this.handleFocusOut.bind(this);

		this.startDate = this.input.value ? parseDate(this.input.value, this.settings.valueFormat) : false;
		if(this.startDate) this.inputClone.value = formatDate(this.startDate, this.settings.displayFormat);

		this.rootDate = this.startDate || new Date();
		this.rootDate.setHours(0,0,0,0);

		this.settings.startOpen && this.open();
		return this;
	},
	initClone(){
		this.inputClone = elementFactory('input', { type: 'text', tabindex: -1}, this.input.className);
		this.input.setAttribute('type', 'hidden');
		this.node.appendChild(this.inputClone);

		this.inputClone.addEventListener('change', e => {
			this.startDate = parseDate(this.inputClone.value, this.settings.displayFormat)//throws if parse error
			this.input.value = this.startDate || '';
		});
	},
	toggle(){
		if(this.isOpen) this.close();
		else this.open();
	},
	open(){
		if(this.isOpen) return;
		this.renderCalendar();
		this.isOpen = true;
		this.btn.setAttribute('aria-expanded', 'true');
		this.workingDate = this.rootDate;
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
		this.monthView = monthViewFactory(this.workingDate || this.rootDate, this.startDate);
		this.monthContainer.innerHTML = month(this.monthView);
		if(!this.container.querySelector(`${SELECTORS.BTN_DEFAULT}[tabindex="0"]`)) [].slice.call(this.container.querySelectorAll(`${SELECTORS.BTN_DEFAULT}:not([disabled])`)).shift().setAttribute('tabindex', '0');
	},
	initListeners(){
		TRIGGER_EVENTS.forEach(ev => {
			this.container.addEventListener(ev, this.routeHandlers.bind(this));
		});
	},
	routeHandlers(e){
		if(e.keyCode) this.handleKeyDown(e);
		else {
			if(e.target.classList.contains(CLASSNAMES.NAV_BTN) || e.target.parentNode.classList.contains(CLASSNAMES.NAV_BTN)) this.handleNav(+(e.target.getAttribute(DATA_ATTRIBUTES.ACTION) || e.target.parentNode.getAttribute(DATA_ATTRIBUTES.ACTION)));
			if(e.target.classList.contains(CLASSNAMES.BTN_DEFAULT)) this.selectDate(e);
		}
	},
	handleNav(action){
		this.workingDate = new Date(this.workingDate.getFullYear(), this.workingDate.getMonth() + action);
		this.renderMonth();
	},
	handleKeyDown(e){
		const keyDownDictionary = {
			PAGE_UP(){},//?
			PAGE_DOWN(){},//?
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
				if(e.target.classList.contains(CLASSNAMES.NAV_BTN)) this.handleNav(+e.target.getAttribute(DATA_ATTRIBUTES.ACTION));
			},
			ESCAPE(){ this.close(); },
			SPACE(e) { keyDownDictionary.ENTER(e); },
			LEFT(e){
				catchBubble(e);
				if(!e.target.classList.contains(CLASSNAMES.BTN_DEFAULT)) return;

				if(this.monthView.model[+e.target.getAttribute(DATA_ATTRIBUTES.MODEL_INDEX)].number === 1) {
					this.workingDate = new Date(this.workingDate.getFullYear(), this.workingDate.getMonth() - 1);
					this.renderMonth();
					[].slice.call(this.container.querySelectorAll(SELECTORS.BTN_ENABLED)).pop().firstElementChild.focus();
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
		if(this.isOpen) this.close();
	},
	setDate(nextDate){
		this.startDate = nextDate;
		this.rootDate = this.startDate;
		this.inputClone.value = formatDate(this.startDate, this.settings.displayFormat);
		this.input.value = formatDate(this.startDate, this.settings.valueFormat);
	},
	getValue(){ return this.startDate; },
	setValue(nextValue, format = this.settings.valueFormat){
		this.setDate(parseDate(nextValue, format));
		if(this.isOpen) this.workingDate = this.startDate, this.renderMonth();
	}
};