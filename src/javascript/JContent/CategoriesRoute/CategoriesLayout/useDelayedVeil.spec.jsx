import React, {act} from 'react';
import {createRoot} from 'react-dom/client';
import {useDelayedVeil, VEIL_DELAY_MS} from './useDelayedVeil';

// react-test-renderer in this tree is still on React 16, so drive a real root instead
const render = (loading, hasRows) => {
    const seen = {value: undefined};
    const Probe = ({loading, hasRows}) => {
        seen.value = useDelayedVeil(loading, hasRows);
        return null;
    };

    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    act(() => {
        root.render(<Probe loading={loading} hasRows={hasRows}/>);
    });

    return {
        seen,
        update: (nextLoading, nextHasRows) => act(() => {
            root.render(<Probe loading={nextLoading} hasRows={nextHasRows}/>);
        }),
        unmount: () => {
            act(() => root.unmount());
            container.remove();
        }
    };
};

const wait = ms => act(() => {
    jest.advanceTimersByTime(ms);
});

describe('useDelayedVeil', () => {
    beforeEach(() => {
        global.IS_REACT_ACT_ENVIRONMENT = true;
        jest.useFakeTimers();
    });
    afterEach(() => jest.useRealTimers());

    it('should not veil while rows are already on screen, however long the query runs', () => {
        const {seen, unmount} = render(true, true);
        expect(seen.value).toBe(false);
        wait(VEIL_DELAY_MS * 10);
        // The whole point: expanding a branch never covers rows that are already there
        expect(seen.value).toBe(false);
        unmount();
    });

    it('should not veil a first load that resolves before the delay', () => {
        const {seen, update, unmount} = render(true, false);
        wait(VEIL_DELAY_MS - 50);
        expect(seen.value).toBe(false);
        update(false, true);
        wait(VEIL_DELAY_MS * 2);
        expect(seen.value).toBe(false);
        unmount();
    });

    it('should veil a first load that outlasts the delay', () => {
        const {seen, unmount} = render(true, false);
        wait(VEIL_DELAY_MS);
        expect(seen.value).toBe(true);
        unmount();
    });

    it('should lift the veil once the rows arrive', () => {
        const {seen, update, unmount} = render(true, false);
        wait(VEIL_DELAY_MS);
        expect(seen.value).toBe(true);
        update(false, true);
        expect(seen.value).toBe(false);
        unmount();
    });

    it('should not veil a later expansion after the first load has veiled', () => {
        const {seen, update, unmount} = render(true, false);
        wait(VEIL_DELAY_MS);
        expect(seen.value).toBe(true);
        update(false, true);
        // The user now expands a branch: loading again, but rows are on screen
        update(true, true);
        wait(VEIL_DELAY_MS * 5);
        expect(seen.value).toBe(false);
        unmount();
    });
});
