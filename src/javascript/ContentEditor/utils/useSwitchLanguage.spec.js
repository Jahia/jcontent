import {useFormikContext} from 'formik';
// Called outside React, which the mock of useCallback allows
import {fillSiblingCopies, useSwitchLanguage as switchLanguage} from './useSwitchLanguage';

jest.mock('react', () => ({...jest.requireActual('react'), useCallback: fn => fn}));
jest.mock('formik', () => ({useFormikContext: jest.fn()}));
jest.mock('~/ContentEditor/validation', () => ({validate: () => () => ({})}));

const players = ['cemix:youtubeGenericPlayer', 'cemix:vimeoGenericPlayer', 'cemix:switchTubeGenericPlayer'];
const nativePlayer = 'cemix:vimeoNativePlayer';

const sharedNote = player => ({
    nodeType: player,
    name: `${player}_sharedNote`,
    propertyName: 'sharedNote',
    declaringNodeType: 'cemix:sharedPlayerOptions',
    i18n: true
});

const sharedMode = player => ({...sharedNote(player), name: `${player}_sharedMode`, propertyName: 'sharedMode', i18n: false});

const mockFields = players.map(sharedNote);
const mockDynamicFieldSets = Object.fromEntries([...players, nativePlayer].map(mixin => [mixin, false]));
let mockSetI18nContext;

jest.mock('~/ContentEditor/contexts', () => ({
    useContentEditorContext: () => ({setI18nContext: mockSetI18nContext}),
    useContentEditorSectionContext: () => ({sections: []}),
    useContentEditorConfigContext: () => ({lang: 'en', updateEditorConfig: jest.fn(), sideBySideContext: {enabled: false}})
}));
jest.mock('~/ContentEditor/utils/index', () => ({
    ...jest.requireActual('~/ContentEditor/utils/fields.utils'),
    getFields: () => mockFields,
    getDynamicFieldSets: () => mockDynamicFieldSets
}));

const [youtube, vimeo, switchTube] = mockFields.map(field => field.name);

describe('fillSiblingCopies', () => {
    const fields = players.flatMap(player => [sharedNote(player), sharedMode(player)]);
    // Every copy loaded with the stored value
    const initialValues = Object.fromEntries(fields.map(field => [field.name, 'stored']));

    const fill = (values, bucket) => {
        const i18nValues = {values: {...bucket}, validation: {}};
        fillSiblingCopies({fields, dynamicFieldSets: mockDynamicFieldSets, values, initialValues, i18nValues});
        return i18nValues.values;
    };

    it('stores every copy of an edited property in the bucket of the language left', () => {
        const values = {'cemix:vimeoGenericPlayer': true, [vimeo]: 'edited in en'};

        expect(fill(values, {[vimeo]: 'edited in en'})).toEqual({
            [youtube]: 'edited in en',
            [vimeo]: 'edited in en',
            [switchTube]: 'edited in en'
        });
    });

    it('leaves out a property the reader sees with its stored value, so the save writes nothing', () => {
        // Edited in youtube, carried to every copy by a switch to vimeo, then edited back in vimeo
        const values = {'cemix:vimeoGenericPlayer': true, [youtube]: 'edit undone', [vimeo]: 'stored', [switchTube]: 'edit undone'};

        expect(fill(values, {[youtube]: 'edit undone', [switchTube]: 'edit undone'})).toEqual({});
    });

    it('leaves out a property whose visible copy was cleared', () => {
        // Formik deletes a key set to undefined
        const values = {'cemix:vimeoGenericPlayer': true, [youtube]: 'edited', [switchTube]: 'edited'};

        expect(fill(values, {[youtube]: 'edited', [vimeo]: 'edited', [switchTube]: 'edited'})).toEqual({});
    });

    it('stores the value a copy holds when no mixin with a copy is active', () => {
        expect(fill({[nativePlayer]: true}, {[youtube]: 'carried'})).toEqual({
            [youtube]: 'carried',
            [vimeo]: 'carried',
            [switchTube]: 'carried'
        });
    });

    it('adds nothing for a property no copy of which changed', () => {
        expect(fill({'cemix:vimeoGenericPlayer': true, [vimeo]: 'stored'}, {})).toEqual({});
    });

    it('leaves a property that is not translated', () => {
        const mode = 'cemix:vimeoGenericPlayer_sharedMode';

        expect(fill({'cemix:vimeoGenericPlayer': true, [mode]: 'manual'}, {[mode]: 'manual'})).toEqual({[mode]: 'manual'});
    });
});

describe('useSwitchLanguage, back in en after an edit saved in the en bucket', () => {
    const initialValues = {[youtube]: 'A', [vimeo]: 'A', [switchTube]: 'A', 'jnt:video_systemName': 'video'};
    // After a first en -> fr switch with vimeo_sharedNote edited from A to B: every copy holds B in the en bucket
    const prev = {
        en: {values: {[youtube]: 'B', [vimeo]: 'B', [switchTube]: 'B'}, validation: {}},
        shared: {values: {'jnt:video_systemName': 'video'}}
    };

    const switchFromEn = values => {
        useFormikContext.mockReturnValue({values, initialValues});
        mockSetI18nContext = jest.fn();
        switchLanguage()('fr');
        return mockSetI18nContext.mock.calls[0][0](prev);
    };

    it('drops the en bucket when the edit is set back to its stored value', () => {
        const next = switchFromEn({...initialValues, 'cemix:vimeoGenericPlayer': true, [youtube]: 'B', [vimeo]: 'A', [switchTube]: 'B'});

        expect(next.en).toBeUndefined();
    });

    it('drops the en bucket when the value is cleared to undefined', () => {
        const values = {...initialValues, 'cemix:vimeoGenericPlayer': true, [youtube]: 'B', [switchTube]: 'B'};
        delete values[vimeo];

        expect(switchFromEn(values).en).toBeUndefined();
    });

    it('replaces the en bucket with a new edit', () => {
        const next = switchFromEn({...initialValues, 'cemix:vimeoGenericPlayer': true, [youtube]: 'B', [vimeo]: 'C', [switchTube]: 'B'});

        expect(next.en.values).toEqual({[youtube]: 'C', [vimeo]: 'C', [switchTube]: 'C'});
    });
});
