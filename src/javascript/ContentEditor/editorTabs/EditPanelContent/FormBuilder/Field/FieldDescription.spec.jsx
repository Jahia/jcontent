import React from 'react';
import {mount} from 'enzyme';
import {act} from 'react-dom/test-utils';
import {FieldDescription} from './FieldDescription';

// Jsdom does no layout: the heights the component compares are stubbed, and the resize
// observer is replaced by one the test triggers.
let fullHeight;
let visibleHeight;
let observers;

class MockResizeObserver {
    constructor(callback) {
        this.callback = callback;
        this.disconnect = jest.fn();
        observers.push(this);
    }

    observe() {}
}

const resize = () => act(() => {
    observers.forEach(observer => observer.callback([]));
});

const toggle = cmp => cmp.find('button[data-sel-role="field-description-toggle"]');

describe('FieldDescription', () => {
    let scrollHeight;
    let clientHeight;

    beforeAll(() => {
        scrollHeight = jest.spyOn(HTMLElement.prototype, 'scrollHeight', 'get').mockImplementation(() => fullHeight);
        clientHeight = jest.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockImplementation(() => visibleHeight);
    });

    afterAll(() => {
        scrollHeight.mockRestore();
        clientHeight.mockRestore();
    });

    beforeEach(() => {
        observers = [];
        globalThis.ResizeObserver = MockResizeObserver;
        visibleHeight = 16;
    });

    afterEach(() => {
        delete globalThis.ResizeObserver;
    });

    it('should render a description that fits on one line without a button', () => {
        fullHeight = 16;
        const cmp = mount(<FieldDescription description="Short <b>text</b>"/>);

        expect(cmp.find('span').prop('dangerouslySetInnerHTML').__html).toEqual('Short <b>text</b>');
        expect(toggle(cmp).exists()).toBe(false);
    });

    it('should show an expand button when the description overflows its line', () => {
        fullHeight = 48;
        const cmp = mount(<FieldDescription description="A long description"/>);

        const button = toggle(cmp);
        expect(button.text()).toEqual('···');
        expect(button.prop('aria-expanded')).toBe(false);
        expect(button.prop('aria-label')).toEqual('translated_jcontent:label.contentEditor.edit.fieldDescription.expand');
        expect(button.prop('aria-controls')).toEqual(cmp.find('p').prop('id'));
        expect(cmp.find('p').hasClass('collapsed')).toBe(true);
    });

    it('should expand on click, then fold back', () => {
        fullHeight = 48;
        const cmp = mount(<FieldDescription description="A long description"/>);

        act(() => {
            toggle(cmp).simulate('click');
        });
        cmp.update();
        expect(cmp.find('p').hasClass('collapsed')).toBe(false);
        expect(toggle(cmp).prop('aria-expanded')).toBe(true);
        expect(toggle(cmp).text()).toEqual('translated_jcontent:label.contentEditor.edit.fieldDescription.collapse');

        act(() => {
            toggle(cmp).simulate('click');
        });
        cmp.update();
        expect(cmp.find('p').hasClass('collapsed')).toBe(true);
        expect(toggle(cmp).prop('aria-expanded')).toBe(false);
    });

    it('should show or hide the button when the line width changes', () => {
        fullHeight = 16;
        const cmp = mount(<FieldDescription description="A description"/>);
        expect(toggle(cmp).exists()).toBe(false);

        fullHeight = 32;
        resize();
        cmp.update();
        expect(toggle(cmp).exists()).toBe(true);

        fullHeight = 16;
        resize();
        cmp.update();
        expect(toggle(cmp).exists()).toBe(false);
    });

    it('should measure again when the description changes', () => {
        fullHeight = 16;
        const cmp = mount(<FieldDescription description="Short"/>);
        expect(toggle(cmp).exists()).toBe(false);

        fullHeight = 48;
        act(() => {
            cmp.setProps({description: 'A much longer description'});
        });
        cmp.update();
        expect(toggle(cmp).exists()).toBe(true);
    });

    it('should stop observing once expanded or unmounted', () => {
        fullHeight = 48;
        const cmp = mount(<FieldDescription description="A long description"/>);
        const [first] = observers;

        act(() => {
            toggle(cmp).simulate('click');
        });
        expect(first.disconnect).toHaveBeenCalled();

        act(() => {
            toggle(cmp).simulate('click');
        });
        const second = observers[observers.length - 1];
        cmp.unmount();
        expect(second.disconnect).toHaveBeenCalled();
    });

    it('should place the expand button at the end of the first visual line', () => {
        fullHeight = 48;
        const original = Range.prototype.getClientRects;
        // Two lines: the first ends at 120px, the second (lower) at 300px
        Range.prototype.getClientRects = () => [
            {top: 0, height: 16, right: 80},
            {top: 0, height: 16, right: 120},
            {top: 16, height: 16, right: 300}
        ];
        try {
            const cmp = mount(<FieldDescription description="First line<br/>Second, longer line"/>);
            expect(toggle(cmp).prop('style')).toEqual({left: 120, right: 'auto'});
        } finally {
            Range.prototype.getClientRects = original;
        }
    });

    it('should keep the expand button at the end of the line when the text cannot be measured', () => {
        fullHeight = 48;
        const cmp = mount(<FieldDescription description="A long description"/>);
        expect(toggle(cmp).hasClass('expand')).toBe(true);
    });
});
