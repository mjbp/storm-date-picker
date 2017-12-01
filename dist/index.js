/**
 * @name storm-date-picker: 
 * @version 0.1.0: Fri, 01 Dec 2017 17:42:13 GMT
 * @author stormid
 * @license MIT
 */
import defaults from './lib/defaults';
import componentPrototype from './lib/component-prototype';

const init = (sel, opts) => {
	let els = [].slice.call(document.querySelectorAll(sel));
    //let els = Array.from(document.querySelectorAll(sel));

	if(!els.length) return console.warn('Date picker not initialised, no augmentable elements found');
    
	return els.map((el) => {
		return Object.assign(Object.create(componentPrototype), {
			node: el, 
			input: el.querySelector('input'),
			btn: el.querySelector('.btn'),
			settings: Object.assign({}, defaults, opts)
		}).init();
	});
};

export default { init };