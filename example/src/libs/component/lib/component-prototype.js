import { elementFactory, monthViewFactory } from './utils';
import { calendar, month } from './templates';

const TRIGGER_EVENTS = ['click', 'keydown'],
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

export default {
	init() {
		this.node.addEventListener('focus', this.open.bind(this));

		this.boundHandleFocusOut = this.handleFocusOut.bind(this);


		this.startDate = new Date();
		this.startDate.setHours(0,0,0,0);

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
	toggle(){
		if(this.isOpen) this.close();
		else this.open();
	},
	open(){
		if(this.isOpen) return;
		this.renderCalendar();
		this.isOpen = true;

		document.body.addEventListener('focusout', this.boundHandleFocusOut);
	},
	close(){
		this.container.parentNode.removeChild(this.container);
		this.isOpen = false;
		//remove from DOM
		//remove all event listeners
	},
	handleFocusOut(){
		window.setTimeout(() => {
			if(this.container.contains(document.activeElement) || this.node === document.activeElement) return;
			this.close();
			document.body.removeEventListener('focusout', this.boundHandleBlur);
		}, 16);
	},
	renderCalendar(){
		this.container = elementFactory('div', {}, 'sdp-container');
		this.container.innerHTML = calendar();
		this.node.parentNode.appendChild(this.container);
		this.monthContainer = document.querySelector('.js-sdp__month');
		this.renderMonth();
		this.manageButtons();
		this.initListeners();
		//focus on active date or today's date
	},
	renderMonth(){
		this.monthView = monthViewFactory(this.rootDate, this.startDate);
		this.monthContainer.innerHTML = month(this.monthView);
	},
	manageButtons() {
		TRIGGER_EVENTS.forEach(ev => {
			[this.container.querySelector('.js-sdp__back'), this.container.querySelector('.js-sdp__next')]
				.forEach((btn, i) => {
					btn.addEventListener(ev, e => {
						if(!!e.keyCode && !~TRIGGER_KEYCODES.indexOf(e.keyCode)) return;
						this.rootDate = new Date(this.rootDate.getFullYear(), this.rootDate.getMonth() + (i === 0 ? -1 : 1));
						this.renderMonth();
					});
				});
		});
	},
	initListeners(){
		TRIGGER_EVENTS.forEach(ev => {
			this.container.addEventListener(ev, e => {
				if(e.keyCode) return this.handleKeyDown(e);
				else this.handleClick(e);
				//click, check e.target
			});
		});
	},
	handleKeyDown(e){
		const keyDownDictionary = {
			TAB(){},
			ENTER(){},
			ESCAPE(){
				this.close();
			},
			SPACE(e){
				this.selectDate(e)
			},
			LEFT(){},
			UP(){},
			RIGHT(){},
			DOWN(){}
		}
		if(KEYCODES[e.keyCode] && keyDownDictionary[KEYCODES[e.keyCode]]) keyDownDictionary[KEYCODES[e.keyCode]].call(this, e);
	},
	handleClick(e){

	},
	selectDate(e){
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