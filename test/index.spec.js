import should from 'should';
import DatePicker from '../dist';
import 'jsdom-global/register';

const html = `<div class="js-date-picker" aria-live="polite">
                <input class="field js-input" tabindex="-1" type="text" value="" name="test-date" id="test-date" aria-label="Date">
                <button role="button" class="btn js-btn" aria-expanded="false" aria-label="Toggle date picker">
                    <svg class="btn__icon" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z"/>
                        <path d="M0 0h24v24H0z" fill="none"/>
                    </svg>
                </button>
                <button role="button" class="btn btn__clear js-btn__clear" aria-label="Clear selected date">
                    <svg class="btn-close__icon" height="18" viewBox="0 0 24 24" width="18" xmlns="http://www.w3.org/2000/svg">
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                        <path d="M0 0h24v24H0z" fill="none"/>
                    </svg>
                </button>
            </div>
            <button class="focusable-item"></button>`;

document.body.innerHTML = html;
  
let DatePickers = DatePicker.init('.js-date-picker');

describe('Initialisation', () => {

  it('should return an object', () => {
    should(DatePickers)
      .Object();
  });

  it('should return array of pickers as a property', () => {
    should(DatePickers.pickers)
      .Array()
      .and.have.lengthOf(1);
  });

  it('should return a find fn as a property', () => {
    should(DatePickers.find)
      .Function();
  });

  it('each array item should be an object with a specific set of properties', () => {

    DatePickers.pickers[0].should.be.an.instanceOf(Object).and.not.empty();
    DatePickers.pickers[0].should.have.property('node');
    DatePickers.pickers[0].should.have.property('settings').Object();
    DatePickers.pickers[0].should.have.property('init').Function();
    DatePickers.pickers[0].should.have.property('initClone').Function();
    DatePickers.pickers[0].should.have.property('toggle').Function();
    DatePickers.pickers[0].should.have.property('open').Function();
    DatePickers.pickers[0].should.have.property('close').Function();
    DatePickers.pickers[0].should.have.property('renderCalendar').Function();
    DatePickers.pickers[0].should.have.property('renderMonth').Function();

  });

  it('should be possibble to find a picker instance bypassing in a selector for the container DOM node', () => {
    should(DatePickers.find('.js-date-picker'))
      .Object();
  });

  // it('should gracefully warn if no elements are found', () => {

  //   Boilerplate.init.bind(Boilerplate, '.js-err').should.throw();

  // })
  
  // it('should initialisation with different settings if different options are passed', () => {

  //   should(componentsTwo[0].settings.callback).not.equal(components[0].settings.callback);
  
  // });

});

describe('Open and close', () => {

  it('should toggle open and close on click, and by invoking toggle', () => {
    DatePickers.pickers[0].btn.click();
    DatePickers.pickers[0].isOpen.should.equal(true);

    DatePickers.pickers[0].toggle();
    DatePickers.pickers[0].isOpen.should.equal(false);
  });

});

describe('Set date and reset', () => {

    it('should set the date when passed a Date object', () => {
        var initialDate = DatePickers.pickers[0].getValue();
        DatePickers.pickers[0].setValue('01/01/2018');
        should(initialDate).not.equal(DatePickers.pickers[0].getValue());
        DatePickers.pickers[0].reset();
    });
  
  });

describe('Keyboard navigation', () => {
    var spaceDownEvt = new window.KeyboardEvent('keydown', { 
        code : 32,
        keyCode: 32
    });

    it('should toggle open and close on keydown with correct keyCode', () => {
        DatePickers.pickers[0].btn.dispatchEvent(spaceDownEvt);
        DatePickers.pickers[0].isOpen.should.equal(true);

        DatePickers.pickers[0].btn.dispatchEvent(spaceDownEvt);
        DatePickers.pickers[0].isOpen.should.equal(false);
    });

    it('should toggle open and close on keydown with correct keyCode', () => {
        DatePickers.pickers[0].btn.dispatchEvent(spaceDownEvt);
        DatePickers.pickers[0].isOpen.should.equal(true);
        
        DatePickers.pickers[0].container.dispatchEvent(new window.KeyboardEvent('keydown', { 
            code : 27,
            keyCode: 27
        }))
        DatePickers.pickers[0].isOpen.should.equal(false);
    });

    it('should navigate month views based on button click interactions', () => {
        DatePickers.pickers[0].open();

        var navBtns = Array.from(document.querySelectorAll('.js-sdp-nav__btn')),
            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
            currentMonth = months[new Date().getMonth()];
        
        document.querySelector('.sdp-month-label').innerHTML.should.startWith(currentMonth);
        navBtns[0].click();
        document.querySelector('.sdp-month-label').innerHTML.should.startWith(months[new Date().getMonth() - 1] ? months[new Date().getMonth() - 1] : months[months.length - 1]);
        navBtns[1].click();
        document.querySelector('.sdp-month-label').innerHTML.should.startWith(currentMonth);

        DatePickers.pickers[0].close();
    });

    it('should navigate days and month views based on keyboard interactions', () => {
        DatePickers.pickers[0].open();

        var startDay = DatePickers.pickers[0].rootDate,
            startDayButton = document.querySelector('.sdp-day-btn--is-today');

        console.log(document.activeElement.getAttribute('data-model-index'));
        
        
        document.activeElement.dispatchEvent(new window.KeyboardEvent('keydown', { 
            code : 37,
            keyCode: 37
        }));
        //console.log(document.activeElement.getAttribute('data-model-index'));
        

        // DatePickers.pickers[0].getValue().should.equal(new Date(startDay.getFullYear(), startDay.getMonth(), startDay.getDay - 1));
        
        //need to dispatch a bubbling keydown event on a day button
        //DatePickers.pickers[0].handlerKeyDown
        DatePickers.pickers[0].close();
    });

});

// describe('Focus behaviour', () => {

//   it('should toggle close on focusout', () => {
//     DatePickers.pickers[0].toggle();
//     DatePickers.pickers[0].isOpen.should.equal(true);
    
//     document.querySelector('.focusable-item').focus();
//     document.body.dispatchEvent( new Event( 'focusout' ) );
//     window.setTimeout(() => {
//         DatePickers.pickers[0].isOpen.should.equal(false);
//     }, 60);
//   });

// });