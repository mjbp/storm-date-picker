/**
 * @name storm-date-picker: Lightweight, accessible date picker
 * @version 0.1.0: Wed, 03 Jan 2018 21:46:37 GMT
 * @author stormid
 * @license MIT
 */
import defaults from './lib/defaults';
import componentPrototype from './lib/component-prototype';

const init = (sel, opts) => {
	let els = [].slice.call(document.querySelectorAll(sel));
    //let els = Array.from(document.querySelectorAll(sel));

	if(!els.length) return console.warn('Date picker not initialised, no augmentable elements found');
    
	return {
		pickers: els.map((el) => {
			return Object.assign(Object.create(componentPrototype), {
				node: el, 
				input: el.querySelector('.js-input'),
				btn: el.querySelector('.js-btn'),
				btnClear: el.querySelector('.js-btn__clear'),
				settings: Object.assign({}, defaults, opts)
			}).init();
		}),
		find(sel){
			let candidate = document.querySelector(sel);
			if(!candidate) return console.warn('Date picker not found for this selector');
			return this.pickers.reduce((acc, curr) => {
				if(curr.node === candidate) acc = curr;
				return acc;
			}, false);
		}
	};
};

export default { init };