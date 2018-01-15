import DatePicker from './libs/component';

const onDOMContentLoadedTasks = [() => {
    window.DatePicker = DatePicker.init('.js-date-picker', {
        minDate: '25/12/2017',
        maxDate: '16/01/2018'
    });
}];
    
if('addEventListener' in window) window.addEventListener('DOMContentLoaded', () => { onDOMContentLoadedTasks.forEach((fn) => fn()); });