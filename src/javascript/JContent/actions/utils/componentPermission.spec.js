import {hasComponentPermission} from './componentPermission';

describe('hasComponentPermission', () => {
    it('should return true when the node has the component permission', () => {
        expect(hasComponentPermission({node: {hasComponentPermission: true}})).toBe(true);
    });

    it('should return false when the node lacks the component permission', () => {
        expect(hasComponentPermission({node: {hasComponentPermission: false}})).toBe(false);
    });

    it('should return false when one node of a list lacks the component permission', () => {
        expect(hasComponentPermission({nodes: [{hasComponentPermission: true}, {hasComponentPermission: false}]})).toBe(false);
    });

    it('should return true when every node of a map has the component permission', () => {
        expect(hasComponentPermission({nodes: {'/a': {hasComponentPermission: true}, '/b': {hasComponentPermission: true}}})).toBe(true);
    });
});
