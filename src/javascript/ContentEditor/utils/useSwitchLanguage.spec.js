import {fillSiblingCopies} from './useSwitchLanguage';

jest.mock('formik', () => ({useFormikContext: jest.fn()}));
jest.mock('~/ContentEditor/contexts', () => ({}));
jest.mock('~/ContentEditor/validation', () => ({validate: jest.fn()}));

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

const fields = players.flatMap(player => [sharedNote(player), sharedMode(player)]);
const dynamicFieldSets = Object.fromEntries([...players, nativePlayer].map(mixin => [mixin, false]));

const fill = (values, bucket) => {
    const i18nValues = {values: {...bucket}, validation: {}};
    fillSiblingCopies({fields, dynamicFieldSets, values, i18nValues});
    return i18nValues.values;
};

describe('fillSiblingCopies', () => {
    it('stores every copy of an edited property in the bucket of the language left', () => {
        const values = {
            'cemix:vimeoGenericPlayer': true,
            'cemix:vimeoGenericPlayer_sharedNote': 'edited in en'
        };

        expect(fill(values, {'cemix:vimeoGenericPlayer_sharedNote': 'edited in en'})).toEqual({
            'cemix:youtubeGenericPlayer_sharedNote': 'edited in en',
            'cemix:vimeoGenericPlayer_sharedNote': 'edited in en',
            'cemix:switchTubeGenericPlayer_sharedNote': 'edited in en'
        });
    });

    it('stores the value of the copy the reader sees, even when that copy is unchanged', () => {
        // Edited in youtube, carried to every copy by a switch to vimeo, then edited back in vimeo
        const values = {
            'cemix:vimeoGenericPlayer': true,
            'cemix:youtubeGenericPlayer_sharedNote': 'edit undone',
            'cemix:vimeoGenericPlayer_sharedNote': 'stored',
            'cemix:switchTubeGenericPlayer_sharedNote': 'edit undone'
        };
        const bucket = {
            'cemix:youtubeGenericPlayer_sharedNote': 'edit undone',
            'cemix:switchTubeGenericPlayer_sharedNote': 'edit undone'
        };

        expect(Object.values(fill(values, bucket))).toEqual(['stored', 'stored', 'stored']);
    });

    it('stores the value a copy holds when no mixin with a copy is active', () => {
        const values = {[nativePlayer]: true};

        expect(fill(values, {'cemix:youtubeGenericPlayer_sharedNote': 'carried'})).toEqual({
            'cemix:youtubeGenericPlayer_sharedNote': 'carried',
            'cemix:vimeoGenericPlayer_sharedNote': 'carried',
            'cemix:switchTubeGenericPlayer_sharedNote': 'carried'
        });
    });

    it('adds nothing for a property no copy of which changed', () => {
        const values = {'cemix:vimeoGenericPlayer': true, 'cemix:vimeoGenericPlayer_sharedNote': 'stored'};

        expect(fill(values, {})).toEqual({});
    });

    it('leaves a property that is not translated', () => {
        const values = {'cemix:vimeoGenericPlayer': true, 'cemix:vimeoGenericPlayer_sharedMode': 'manual'};

        expect(fill(values, {'cemix:vimeoGenericPlayer_sharedMode': 'manual'})).toEqual({'cemix:vimeoGenericPlayer_sharedMode': 'manual'});
    });
});
