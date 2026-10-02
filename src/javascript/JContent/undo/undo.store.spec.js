import {clearUndo, peekUndo, recordUndo, subscribeToUndo} from './undo.store';

describe('undo store', () => {
    afterEach(() => {
        clearUndo();
    });

    it('should hold nothing to begin with', () => {
        expect(peekUndo()).toBeNull();
    });

    it('should hold what was recorded', () => {
        const snapshot = {kind: 'move', count: 2};
        recordUndo(snapshot);
        expect(peekUndo()).toBe(snapshot);
    });

    it('should replace the previous snapshot rather than stacking it', () => {
        recordUndo({kind: 'move', count: 2});
        recordUndo({kind: 'markForDeletion', count: 1});

        expect(peekUndo()).toEqual({kind: 'markForDeletion', count: 1});
    });

    it('should forget the snapshot when cleared', () => {
        recordUndo({kind: 'move'});
        clearUndo();

        expect(peekUndo()).toBeNull();
    });

    it('should tell subscribers when a snapshot is recorded, replaced and cleared', () => {
        const listener = jest.fn();
        const unsubscribe = subscribeToUndo(listener);

        recordUndo({kind: 'move'});
        recordUndo({kind: 'markForDeletion'});
        clearUndo();

        expect(listener).toHaveBeenCalledTimes(3);
        unsubscribe();
    });

    it('should not wake subscribers clearing a store that is already empty', () => {
        const listener = jest.fn();
        const unsubscribe = subscribeToUndo(listener);

        clearUndo();

        expect(listener).not.toHaveBeenCalled();
        unsubscribe();
    });

    it('should stop telling a subscriber that has unsubscribed', () => {
        const listener = jest.fn();
        subscribeToUndo(listener)();

        recordUndo({kind: 'move'});

        expect(listener).not.toHaveBeenCalled();
    });
});
