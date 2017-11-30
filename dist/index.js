/**
 * @name storm-date-picker: 
 * @version 0.1.0: Thu, 30 Nov 2017 21:20:48 GMT
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
		if(el.nodeName === 'input') return console.warn('Date picker target node not an input');
		return Object.assign(Object.create(componentPrototype), {
			node: el,
			settings: Object.assign({}, defaults, opts)
		}).init();
	});
};

export default { init };