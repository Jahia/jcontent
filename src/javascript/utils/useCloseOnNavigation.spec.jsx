import React from 'react';
import {useSelector} from 'react-redux';
import {mount} from 'enzyme';
import {act} from 'react-dom/test-utils';
import {CloseOnNavigation, useCloseOnNavigation} from './useCloseOnNavigation';

jest.mock('react-redux', () => ({
    useSelector: jest.fn(),
    shallowEqual: jest.fn()
}));

const onClose = jest.fn();

const TestDialog = () => {
    useCloseOnNavigation(onClose);
    return null;
};

const HOME = '/jcontent/digitall/en/pages/home';

/**
 * A navigation the store would record: a location object is never reused from one to the next,
 * which is what the hook relies on to spot one.
 */
const at = (pathname, {action = 'PUSH', search = ''} = {}) => {
    const state = {router: {location: {pathname, search}, action}};
    useSelector.mockImplementation(selector => selector(state));
};

const withoutRouterState = () => {
    useSelector.mockImplementation(selector => selector({}));
};

const rerender = cmp => act(() => {
    cmp.setProps({});
});

const navigate = (cmp, pathname, options) => {
    at(pathname, options);
    rerender(cmp);
};

describe('useCloseOnNavigation', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should not close while the application stays on the same location', () => {
        at(HOME);
        const cmp = mount(<TestDialog/>);

        rerender(cmp);

        expect(onClose).not.toHaveBeenCalled();
    });

    it('should close when navigating to another page', () => {
        at(HOME);
        const cmp = mount(<TestDialog/>);

        navigate(cmp, '/jcontent/digitall/en/pages/about');

        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('should close when the browser goes back to the same page with another query string', () => {
        // What jContent records when a node gets selected, and the case the dialog was left
        // open on: the pathname alone cannot tell the two entries apart.
        at(HOME, {search: '?params=(selectionNode:node)'});
        const cmp = mount(<TestDialog/>);

        navigate(cmp, HOME, {action: 'POP'});

        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('should stay open when the current page records its state in the query string', () => {
        at(HOME);
        const cmp = mount(<TestDialog/>);

        navigate(cmp, HOME, {search: '?params=(selectionNode:node)'});

        expect(onClose).not.toHaveBeenCalled();
    });

    it('should stay open when the dialog is opened after a back navigation', () => {
        // The store still reports POP long after the navigation that caused it.
        at(HOME, {action: 'POP'});
        const cmp = mount(<TestDialog/>);

        rerender(cmp);

        expect(onClose).not.toHaveBeenCalled();
    });

    it('should close only once when the dialog re-renders after the navigation', () => {
        at(HOME);
        const cmp = mount(<TestDialog/>);

        navigate(cmp, '/jcontent/digitall/en/media', {action: 'POP'});
        rerender(cmp);

        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('should not close when there is no location in the store', () => {
        withoutRouterState();
        const cmp = mount(<TestDialog/>);

        rerender(cmp);

        expect(onClose).not.toHaveBeenCalled();
    });
});

describe('CloseOnNavigation', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render nothing', () => {
        at(HOME);

        expect(mount(<CloseOnNavigation onClose={onClose}/>).isEmptyRender()).toBe(true);
    });

    it('should close when the browser navigates back', () => {
        at(HOME);
        const cmp = mount(<CloseOnNavigation onClose={onClose}/>);

        navigate(cmp, HOME, {action: 'POP', search: '?params=(selectionNode:node)'});

        expect(onClose).toHaveBeenCalledTimes(1);
    });
});
