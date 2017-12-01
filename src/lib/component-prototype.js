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
import { TRIGGER_EVENTS, TRIGGER_KEYCODES, KEYCODES } from './constants';

export default {
	init() {
		this.inputClone = elementFactory('input', { type: 'text', tabindex: -1 }, 'field');
		this.input.setAttribute('type', 'hidden');
		this.node.appendChild(this.inputClone);

		this.inputClone.addEventListener('change', e => {
			this.startDate = parseDate(this.inputClone.value, this.settings.valueFormat);//throws if parse error
		});

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
	toggle(){
		if(this.isOpen) this.close();
		else this.open();
	},
	open(){
		if(this.isOpen) return;
		this.renderCalendar();
		this.isOpen = true;
		this.workingDate = this.rootDate;
		this.container.querySelector('.sdp-day-btn--is-active') ? this.container.querySelector('.sdp-day-btn--is-active').focus() : this.container.querySelector('.sdp-day-btn--is-today') ? this.container.querySelector('.sdp-day-btn--is-today').focus() : this.container.querySelectorAll('.sdp-day-btn')[0].focus();
		document.body.addEventListener('focusout', this.boundHandleFocusOut);
	},
	close(){
		if(!this.isOpen) return;
		this.node.removeChild(this.container);
		this.isOpen = false;
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
		this.container = elementFactory('div', {}, 'sdp-container');
		this.container.innerHTML = calendar();
		this.node.appendChild(this.container);
		this.monthContainer = document.querySelector('.js-sdp__month');
		this.renderMonth();
		this.initListeners();
	},
	renderMonth(){
		this.monthView = monthViewFactory(this.workingDate || this.rootDate, this.startDate);
		this.monthContainer.innerHTML = month(this.monthView);
		if(!this.container.querySelector('.sdp-day-btn[tabindex="0"]')) [].slice.call(this.container.querySelectorAll('.sdp-day-btn:not([disabled])')).shift().setAttribute('tabindex', '0');
	},
	initListeners(){
		TRIGGER_EVENTS.forEach(ev => {
			this.container.addEventListener(ev, this.routeHandlers.bind(this));
		});
	},
	routeHandlers(e){
		if(e.keyCode) this.handleKeyDown(e);
		else {
			if(e.target.classList.contains('js-sdp-nav__btn') || e.target.parentNode.classList.contains('js-sdp-nav__btn')) this.handleNav(+(e.target.getAttribute('data-action') || e.target.parentNode.getAttribute('data-action')));
			if(e.target.classList.contains('sdp-day-btn')) this.selectDate(e);
		}
	},
	handleNav(action){
		this.workingDate = new Date(this.workingDate.getFullYear(), this.workingDate.getMonth() + action);
		this.renderMonth();
	},
	handleKeyDown(e){
		const keyDownDictionary = {
			TAB(){
				/* 
					- trap tab in focusable children??
						 - return to button after last focusable child?
					- ref. https://github.com/mjbp/storm-focus-manager/blob/master/src/storm-focus-manager.js
				*/
			},
			ENTER(e){
				catchBubble(e);
				if(e.target.classList.contains('sdp-day-btn')) this.selectDate(e);
				if(e.target.classList.contains('js-sdp-nav__btn')) this.handleNav(+e.target.getAttribute('data-action'));
			},
			ESCAPE(){ this.close(); },
			SPACE(e) { keyDownDictionary.ENTER(e); },
			LEFT(e){
				catchBubble(e);
				if(!e.target.classList.contains('sdp-day-btn')) return;

				if(this.monthView.model[+e.target.getAttribute('data-model-index')].number === 1) {
					this.workingDate = new Date(this.workingDate.getFullYear(), this.workingDate.getMonth() - 1);
					this.renderMonth();
					[].slice.call(this.container.querySelectorAll('.sdp-day-body:not(.sdp-day-disabled)')).pop().firstElementChild.focus();
				}
				else this.container.querySelector(`[data-model-index="${+e.target.getAttribute('data-model-index') - 1}"]`).focus();
			},
			UP(){
				catchBubble(e);
				if(!e.target.classList.contains('sdp-day-btn')) return;
				
				let nextDayIndex = +e.target.getAttribute('data-model-index') - 7;

				if(+this.monthView.model[+e.target.getAttribute('data-model-index')].number - 7 < 1) {
					this.workingDate = new Date(this.workingDate.getFullYear(), this.workingDate.getMonth() - 1);
					this.renderMonth();
					//use this.workingDate instead of querying DOM?
					if(!this.container.querySelector(`[data-model-index="${this.monthView.model.length + nextDayIndex}"]`)|| this.container.querySelector(`[data-model-index="${this.monthView.model.length + nextDayIndex}"]`) && this.container.querySelector(`[data-model-index="${this.monthView.model.length + nextDayIndex}"]`).hasAttribute('disabled')) 
						this.container.querySelector(`[data-model-index="${this.monthView.model.length + (nextDayIndex - 7)}"]`).focus();
					else this.container.querySelector(`[data-model-index="${this.monthView.model.length + nextDayIndex}"]`).focus();
				}
				else this.container.querySelector(`[data-model-index="${nextDayIndex}"]`).focus();
			},
			RIGHT(e){
				catchBubble(e);
				if(!e.target.classList.contains('sdp-day-btn')) return;
				
				if(this.monthView.model[+e.target.getAttribute('data-model-index')].number === getMonthLength(this.monthView.model[+e.target.getAttribute('data-model-index')].date.getFullYear(), this.monthView.model[+e.target.getAttribute('data-model-index')].date.getMonth())) {
					this.workingDate = new Date(this.workingDate.getFullYear(), this.workingDate.getMonth() + 1);
					this.renderMonth();
					[].slice.call(this.container.querySelectorAll('.sdp-day-body:not(.sdp-day-disabled)')).shift().firstElementChild.focus();
				}
				else this.container.querySelector(`[data-model-index="${+e.target.getAttribute('data-model-index') + 1}"]`).focus();
				
			},
			DOWN(){
				catchBubble(e);
				if(!e.target.classList.contains('sdp-day-btn')) return;

				let nextDate = +this.monthView.model[+e.target.getAttribute('data-model-index')].number + 7,
					nextDayIndex = +e.target.getAttribute('data-model-index') + 7;

				if(+this.monthView.model[+e.target.getAttribute('data-model-index')].number + 7 > getMonthLength(this.monthView.model[+e.target.getAttribute('data-model-index')].date.getFullYear(), this.monthView.model[+e.target.getAttribute('data-model-index')].date.getMonth())) {
					this.workingDate = new Date(this.workingDate.getFullYear(), this.workingDate.getMonth() + 1);
					this.renderMonth();
					//use this.workingDate instead of querying DOM?
					if(this.container.querySelector(`[data-model-index="${nextDayIndex % 7}"]`).hasAttribute('disabled')) this.container.querySelector(`[data-model-index="${(nextDayIndex % 7) + 7}"]`).focus();
					else this.container.querySelector(`[data-model-index="${nextDayIndex % 7}"]`).focus();
				}
				else this.container.querySelector(`[data-model-index="${nextDayIndex}"]`).focus();
			}
		};
		if(KEYCODES[e.keyCode] && keyDownDictionary[KEYCODES[e.keyCode]]) keyDownDictionary[KEYCODES[e.keyCode]].call(this, e);
	},
	selectDate(e){
		this.startDate = this.monthView.model[+e.target.getAttribute('data-model-index')].date;
		this.rootDate = this.startDate;
		e.target.classList.add('sdp-day-btn--is-active');
		this.inputClone.value = formatDate(this.startDate, this.settings.displayFormat);
		this.input.value = formatDate(this.startDate, this.settings.valueFormat);
		this.close();
	},
	reset(){
		this.rootDate = new Date();
		this.rootDate.setHours(0,0,0,0);
		this.startDate = false;
		this.inputClone.value = '';
		this.input.value = '';
	},
	getValue(){ return this.startDate; }
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