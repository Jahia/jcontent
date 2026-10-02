import React, {useRef} from 'react';
import {mount} from 'enzyme';
import {act} from 'react-dom/test-utils';
import {useFocusOnMove, useMovedItemFocus} from './useMovedItemFocus';

let tracker;

const List = ({items}) => {
    tracker = useMovedItemFocus();
    return items.map(key => <Item key={key} itemKey={key} focusId={tracker.focusIdFor(key)}/>);
};

const Item = ({itemKey, focusId}) => {
    const ref = useRef(null);
    useFocusOnMove(ref, focusId);
    return <button ref={ref} type="button" data-key={itemKey}/>;
};

List.propTypes = {items: () => null};
Item.propTypes = {itemKey: () => null, focusId: () => null};

const focusedKey = () => document.activeElement?.getAttribute('data-key');

describe('useMovedItemFocus', () => {
    let attachment;

    beforeEach(() => {
        // Focus only moves for elements that are actually in the document.
        attachment = document.createElement('div');
        document.body.appendChild(attachment);
    });

    afterEach(() => {
        attachment.remove();
    });

    const render = items => mount(<List items={items}/>, {attachTo: attachment});

    const move = key => act(() => {
        tracker.requestFocus(key);
    });

    it('should focus nothing until something has been moved', () => {
        render(['a', 'b', 'c']);

        expect(focusedKey()).toBeNull();
    });

    it('should focus the item that was moved', () => {
        render(['a', 'b', 'c']);

        move('b');

        expect(focusedKey()).toBe('b');
    });

    it('should focus the same item again when it is moved twice in a row', () => {
        // Reordering moves the DOM node, which blurs it, so a second move has to focus it again -
        // this is why a move is answered with a number rather than a boolean.
        const cmp = render(['a', 'b', 'c']);
        move('b');

        act(() => {
            document.activeElement.blur();
        });
        expect(focusedKey()).toBeNull();

        move('b');
        cmp.update();

        expect(focusedKey()).toBe('b');
    });

    it('should hand the focus over when a different item is moved', () => {
        render(['a', 'b', 'c']);

        move('b');
        move('c');

        expect(focusedKey()).toBe('c');
    });

    it('should answer with an id only for the item that moved', () => {
        render(['a', 'b']);

        move('a');

        expect(tracker.focusIdFor('a')).not.toBeNull();
        expect(tracker.focusIdFor('b')).toBeNull();
    });

    it('should not fail when the moved item is no longer in the list', () => {
        const cmp = render(['a', 'b']);

        expect(() => {
            move('b');
            cmp.setProps({items: ['a']});
        }).not.toThrow();
    });
});
