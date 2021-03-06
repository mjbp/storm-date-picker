import fecha from 'fecha';
import { MONTHS } from './constants';

export const parseDate = fecha.parse;

export const formatDate = fecha.format;

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

const monthModel = (year, month, startDate, minDate, maxDate) => {
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
            isOutOfRange: !(minDate && minDate.getTime() <= tmpDate.getTime()) || !(maxDate && maxDate.getTime() > tmpDate.getTime()),
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

export const monthViewFactory = (rootDate, startDate, minDate, maxDate) => ({
	model: monthModel(rootDate.getFullYear(), rootDate.getMonth(), startDate, minDate, maxDate),
	monthTitle: MONTHS[rootDate.getMonth()],
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

export const dateIsOutOfBounds = (isNavigatingBack, workingDate, min, max) => {
    let tmpDate = new Date(workingDate.getFullYear(), workingDate.getMonth(), 1);
    
    if(isNavigatingBack && min && tmpDate.getTime() <= min.getTime()) return true;
    tmpDate.setDate(getMonthLength(tmpDate.getFullYear(), tmpDate.getMonth()));
    if(!isNavigatingBack && max && tmpDate.getTime() >= max.getTime()) return true;
    
    return false;
};

export const getNextActiveDay = (nextMonth, activeDay, workingDate, isNavigatingBack, min, max) => {
    let candidateDay = getMonthLength(workingDate.getFullYear(), nextMonth) < activeDay ? getMonthLength(workingDate.getFullYear(), nextMonth) : activeDay,
        tmpDate = new Date(workingDate.getFullYear(), nextMonth, candidateDay);
    
    if(isNavigatingBack && min && tmpDate.getMonth() === min.getMonth() && tmpDate.getDate() < min.getDate()) return min.getDate();
    if(!isNavigatingBack && max && tmpDate.getMonth() === max.getMonth() && tmpDate.getDate() > max.getDate()) return max.getDate() - 1;

    return candidateDay;
				
};