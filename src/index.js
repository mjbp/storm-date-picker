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
				input: el.querySelector('input'),
				btn: el.querySelector('.btn'),
				btnClear: el.querySelector('.btn__clear'),
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