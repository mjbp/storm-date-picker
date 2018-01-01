import DatePicker from './libs/component';

const onDOMContentLoadedTasks = [() => {
    window.DatePicker = DatePicker.init('.js-date-picker');
}];
    
if('addEventListener' in window) window.addEventListener('DOMContentLoaded', () => { onDOMContentLoadedTasks.forEach((fn) => fn()); });