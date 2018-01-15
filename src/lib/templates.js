import { CLASSNAMES, MONTHS, DAYS } from './constants';

export const calendar = props => `<div class="sdp-date">
                                        <button class="${CLASSNAMES.NAV_BTN} sdp-back" type="button" data-action="-1">
                                            <svg focusable="false" class="sdp-btn__icon" width="19" height="19" viewBox="0 0 1000 1000"><path d="M336.2 274.5l-210.1 210h805.4c13 0 23 10 23 23s-10 23-23 23H126.1l210.1 210.1c11 11 11 21 0 32-5 5-10 7-16 7s-11-2-16-7l-249.1-249c-11-11-11-21 0-32l249.1-249.1c21-21.1 53 10.9 32 32z"></path></svg>
                                        </button>
                                        <button class="${CLASSNAMES.NAV_BTN} sdp-next" type="button" data-action="1">
                                            <svg focusable="false" class="sdp-btn__icon" width="19" height="19" viewBox="0 0 1000 1000"><path d="M694.4 242.4l249.1 249.1c11 11 11 21 0 32L694.4 772.7c-5 5-10 7-16 7s-11-2-16-7c-11-11-11-21 0-32l210.1-210.1H67.1c-13 0-23-10-23-23s10-23 23-23h805.4L662.4 274.5c-21-21.1 11-53.1 32-32.1z"></path></svg>
                                        </button>
                                        <div class="${CLASSNAMES.MONTH_CONTAINER}"></div>
                                    </div>`;

export const month = props => `<div class="sdp-month-label">${props.monthTitle} ${props.yearTitle}</div>
                        <table class="sdp-days">
                            <thead class="sdp-days-head">
                                <tr class="sdp-days-row">
                                    <th class="sdp-day-head">Mo</th>
                                    <th class="sdp-day-head">Tu</th>
                                    <th class="sdp-day-head">We</th>
                                    <th class="sdp-day-head">Th</th>
                                    <th class="sdp-day-head">Fr</th>
                                    <th class="sdp-day-head">Sa</th>
                                    <th class="sdp-day-head">Su</th>
                                </tr>
                            </thead>
                            <tbody class="sdp-days-body">
                                ${props.model.map(weeks(props.active)).join('')}
                            </tbody>
                        </table>`;

const day = (activeDays, props, i) => `<td class="sdp-day-body${props.isOutOfRange ? ' sdp-day-disabled' : props.nextMonth ? ' sdp-day-next-month sdp-day-disabled' : ''}${props.previousMonth ? ' sdp-day-prev-month sdp-day-disabled' : ''}${props.active ? ' sdp-day-selected' : ''}"><button tabindex="${props.isStartDate ? 0 : props.isToday ? 0 : -1}" class="sdp-day-btn${props.isToday ? ' sdp-day-btn--is-today' : ''}${props.isStartDate ? ' sdp-day-btn--is-active' : ''}" role="button" data-day="${props.number}" data-model-index="${i}" aria-label="${props.isToday ? 'Today, ' : ''}${DAYS[props.date.getDay()]}, ${MONTHS[props.date.getMonth()]} ${props.date.getDate()}, ${props.date.getFullYear()}"${props.previousMonth || props.nextMonth || props.isOutOfRange ? " disabled" : ""}>${props.number}</button></td>`;

const weeks = activeDays => (props, i, arr) => {
    if(i === 0) return `<tr class="sdp-days-row">${day(activeDays, props, i)}`;
    else if (i === arr.length - 1) return `${day(activeDays, props, i)}</tr>`;
    else if((i+1) % 7 === 0) return `${day(activeDays, props, i)}</tr><tr class="sdp-days-row">`;
    else return day(activeDays, props, i);
};