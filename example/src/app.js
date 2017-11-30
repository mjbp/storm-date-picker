import DatePicker from './libs/component';

const onDOMContentLoadedTasks = [() => {
    DatePicker.init('.js-date-picker');
}];
    
if('addEventListener' in window) window.addEventListener('DOMContentLoaded', () => { onDOMContentLoadedTasks.forEach((fn) => fn()); });