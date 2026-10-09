import {
    DEFAULT_FOCAL_POINT,
    fromProperties,
    isDefaultFocalPoint,
    toFocalPoint,
    toObjectPosition
} from './focalPoint.utils';

describe('focalPoint.utils', () => {
    const rect = {left: 100, top: 50, width: 400, height: 200};

    describe('toFocalPoint', () => {
        it('maps a click to percentages of the rendered image', () => {
            expect(toFocalPoint({clientX: 300, clientY: 150}, rect)).toEqual({x: 50, y: 50});
            expect(toFocalPoint({clientX: 200, clientY: 100}, rect)).toEqual({x: 25, y: 25});
        });

        it('clamps a click outside the image', () => {
            expect(toFocalPoint({clientX: 0, clientY: 0}, rect)).toEqual({x: 0, y: 0});
            expect(toFocalPoint({clientX: 9999, clientY: 9999}, rect)).toEqual({x: 100, y: 100});
        });

        it('rounds to one decimal', () => {
            expect(toFocalPoint({clientX: 101, clientY: 51}, rect)).toEqual({x: 0.3, y: 0.5});
        });

        it('falls back to the centre when the image has not been laid out yet', () => {
            expect(toFocalPoint({clientX: 300, clientY: 150}, null)).toEqual(DEFAULT_FOCAL_POINT);
            expect(toFocalPoint({clientX: 300, clientY: 150}, {left: 0, top: 0, width: 0, height: 0}))
                .toEqual(DEFAULT_FOCAL_POINT);
        });
    });

    describe('fromProperties', () => {
        it('reads stored values', () => {
            expect(fromProperties('25.5', '80')).toEqual({x: 25.5, y: 80});
        });

        it('falls back to the centre when unset or unparseable', () => {
            expect(fromProperties(undefined, undefined)).toEqual(DEFAULT_FOCAL_POINT);
            expect(fromProperties(null, null)).toEqual(DEFAULT_FOCAL_POINT);
            expect(fromProperties('', 'abc')).toEqual(DEFAULT_FOCAL_POINT);
        });

        it('falls back per axis, not for the pair', () => {
            expect(fromProperties('30', undefined)).toEqual({x: 30, y: 50});
        });

        it('clamps values an API caller could have written out of range', () => {
            expect(fromProperties('-10', '150')).toEqual({x: 0, y: 100});
        });
    });

    describe('isDefaultFocalPoint', () => {
        it('recognises the centre', () => {
            expect(isDefaultFocalPoint({x: 50, y: 50})).toBe(true);
            expect(isDefaultFocalPoint({x: 50, y: 49.9})).toBe(false);
        });
    });

    describe('toObjectPosition', () => {
        it('formats the value a template puts in object-position', () => {
            expect(toObjectPosition({x: 25.5, y: 80})).toBe('25.5% 80%');
            expect(toObjectPosition(DEFAULT_FOCAL_POINT)).toBe('50% 50%');
        });
    });
});
