import fecha from 'fecha';

export const parseDate = fecha.parse;

export const formatDate = fecha.format;

export const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export const dayNames = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
export const catchBubble = e => {
    e.stopImmediatePropagation();
    e.preventDefault();
};

export const getMonthLength = (y, m) => new Date(y, (m + 1), 0).getDate();

const isToday = candidate => {
    let today = new Date();
    today.setHours(0,0,0,0);
    return candidate.getTime() === today.getTime();
};

const isStartDate = (startDate, candidate) => startDate.getTime() === candidate.getTime();

const monthModel = (year, month, startDate) => {
    let theMonth = new Date(year, month + 1, 0),
        totalDays = theMonth.getDate(),
        endDay = theMonth.getDay(),
        startDay,
        prevMonthStartDay = false,
        prevMonth = new Date(year, month, 0),
        prevMonthEndDay = prevMonth.getDate(),
        output = [];

    theMonth.setDate(1);
    startDay = theMonth.getDay();
    
    if(startDay !== 1) {
        if(startDay === 0) prevMonthStartDay = prevMonth.getDate() - 5;
        else prevMonthStartDay = prevMonth.getDate() - (startDay - 2);
    }

    if(prevMonthStartDay){
        while(prevMonthStartDay <= prevMonthEndDay){
            let tmpDate = new Date(prevMonth.getFullYear(), prevMonth.getMonth(), prevMonthStartDay);
            output.push({
                number: prevMonthStartDay,
                previousMonth: true,
                isToday: isToday(tmpDate),
                isStartDate: startDate && isStartDate(startDate, tmpDate) || false,
				date: tmpDate
            });
            prevMonthStartDay++;
        }
    }
    for(let i = 1; i <= totalDays; i++) {
        let tmpDate = new Date(year, month, i);
        output.push({ 
            number: i,
            date: tmpDate,
            isStartDate: startDate && isStartDate(startDate, tmpDate) || false,
            isToday: isToday(tmpDate)
        });
    }
    if(endDay !== 0) for(let i = 1; i <= (7 - endDay); i++) {
        let tmpDate = new Date(year, month + 1, i);
        output.push({ 
            number: i,
            nextMonth: true,
            date: tmpDate,
            isStartDate: startDate && isStartDate(startDate, tmpDate) || false,
            isToday: isToday(tmpDate)
        });
    }
    return output;
};

export const monthViewFactory = (rootDate, startDate) => ({
	model: monthModel(rootDate.getFullYear(), rootDate.getMonth(), startDate),
	monthTitle: monthNames[rootDate.getMonth()],
	yearTitle: rootDate.getFullYear()
});

export const elementFactory = (type, attributes = {}, className) => {
    let el = document.createElement(type);

    for(let prop in attributes) el.setAttribute(prop, attributes[prop]);
    if(className) el.className = className;

    return el;
};

const focusableElements = ['a[href]', 'area[href]', 'input:not([disabled])', 'select:not([disabled])', 'textarea:not([disabled])', 'button:not([disabled])', 'iframe', 'object', 'embed', '[contenteditable]', '[tabindex]:not([tabindex="-1"])'];

export const getFocusableChildren = node => [].slice.call(node.querySelectorAll(focusableElements.join(','))).filter(child => !!(child.offsetWidth || child.offsetHeight || child.getClientRects().length));