import {getInitialValuesFromSnapshot} from '../../../../ContentEditor/useEditFormDefinition';
import {useSelector} from 'react-redux';
import {useQuery} from '@apollo/client';
import {adaptSections} from '~/ContentEditor/ContentEditor/adaptSections';
import {adaptTranslateSections} from '../useTranslateFormDefinition';
import {SnapshotFormSectionsQuery} from './snapshotFormSections.gql-queries';

// JCR PropertyType constants (javax.jcr.PropertyType)
const STRING = 1;
const LONG = 3;
const DOUBLE = 4;
const DATE = 5;
const BOOLEAN = 6;
const NAME = 7;
const REFERENCE = 9;
const DECIMAL = 12;

// POC: hardcoded snapshot captured via debugger from a qant:allFields node.
// In the real implementation this is replaced by the `compositeContentSnapshotByDate` API response.

// used with a qant:versionSnapshotTest
/*
const MOCK_SNAPSHOT = {
    properties: [
        // JCR system properties (unchanged from live node)
        {name: 'j:nodename', value: 'versionsnapshottest', values: null, type: STRING},
        {name: 'jcr:primaryType', value: 'qant:versionSnapshotTest', values: null, type: NAME},
        {name: 'jcr:uuid', value: 'aa8e9099-4b66-4c18-a627-bf4fc656d635', values: null, type: STRING},
        {name: 'jcr:createdBy', value: 'root', values: null, type: STRING},
        {name: 'jcr:created', value: '2026-06-22T15:09:32.073Z', values: null, type: DATE},
        {name: 'jcr:lastModifiedBy', value: 'root', values: null, type: STRING},
        {name: 'jcr:lastModified', value: '2026-06-22T15:24:52.534Z', values: null, type: DATE},
        {name: 'jcr:isCheckedOut', value: 'true', values: null, type: BOOLEAN},
        {name: 'jcr:baseVersion', value: '95101d6c-8b17-40e6-8d60-f400b3df3774', values: null, type: REFERENCE},
        {name: 'jcr:versionHistory', value: 'ec5593dd-827b-4572-b6dc-f3075f27b097', values: null, type: REFERENCE},
        {name: 'jcr:predecessors', value: null, values: ['95101d6c-8b17-40e6-8d60-f400b3df3774'], type: REFERENCE},
        {name: 'j:originWS', value: 'default', values: null, type: STRING},

        // Custom properties — mutated to simulate a past version
        {name: 'sharedText', value: 'shared text versioned', values: null, type: STRING},
        {name: 'sharedTextMandatory', value: 'mandatory text versioned', values: null, type: STRING},
        {name: 'sharedTextMultiple', value: null, values: ['multiple1', 'multiple_versioned'], type: STRING}, // Was: [multiple1, multiple2]
        {name: 'sharedBoolean', value: 'false', values: null, type: BOOLEAN}, // Was: true
        {name: 'sharedDouble', value: '73.12', values: null, type: DOUBLE}, // Was: 12.34
        {name: 'sharedChoicelist', value: 'choice2', values: null, type: STRING}, // Was: choice1
        {name: 'sharedChoicelistMultiple', value: null, values: ['choice2', 'choice3'], type: STRING}, // Was: [choice1, choice2]
        {name: 'sharedLongMultiple', value: null, values: ['2', '42'], type: LONG}, // Was: [1, 2, 3]
        {name: 'sharedColor', value: '#75a3f4', values: null, type: STRING}, // Was: #f47575
        {name: 'sharedDate', value: '2023-03-15T00:00:00.000Z', values: null, type: DATE}, // Was: 2025-06-01
        {name: 'sharedDatetime', value: '2024-11-20T14:30:00.000Z', values: null, type: DATE}, // Was: 2026-06-09
        {name: 'sharedDateMultiple', value: null, values: ['2020-06-01T00:00:00.000Z', '2019-04-10T00:00:00.000Z'], type: DATE}, // Was: [2020-06-01, 2020-06-02]
        {name: 'tags', value: null, values: ['t1', 't_versioned'], type: STRING}, // Was: [t1, t2, t3]
        {name: 'password', value: 'is5mQTcjLW4hJpUtk+2WhEUxY5UQ+UFv', values: null, type: STRING}, // Encrypted, kept as-is
        {name: 'sharedTextarea', value: 'my shared text area versioned', values: null, type: STRING}, // Was: my shared text area
        {name: 'sharedRichtext', value: '<p>shared rich text versioned</p>\n', values: null, type: STRING}, // Was: <p>shared rich text</p>
        {name: 'sharedLong', value: '777', values: null, type: LONG}, // Was: 123
        {name: 'sharedDecimal', value: '99.99', values: null, type: DECIMAL}, // Was: 12.34

        // i18n properties (locale-specific, present in captured EN/SQ session)
        {name: 'localTextMandatory', value: 'local AL versioned', values: null, type: STRING}, // Was: local AL
        {name: 'localText', value: 'basic i18n english versioned', values: null, type: STRING} // Was: local AL
    ],
    mixins: []
};
*/

// used with a qant:versionSnapshotMixinExtendTest
const MOCK_SNAPSHOT = {
    properties: [
        // JCR system properties (unchanged from live node)
        {name: 'versionSnapshotMixinExtendSharedText', value: 'versionSnapshotMixinExtendSharedText (versioned)', values: null, type: STRING},
        {name: 'versionSnapshotMixinExtendLocalText', value: 'versionSnapshotMixinExtendLocalText English (versioned)', values: null, type: STRING}
    ],
    mixins: []
};
const adaptReadOnlySnapshotData = data => {
    if (!data?.forms) {
        return data;
    }

    const sections = adaptSections(data.forms.editFormForSnapshot.sections);

    // POC: use MOCK_SNAPSHOT. Replace with the real `compositeContentSnapshotByDate` API response
    // once that endpoint exists in the content-versioning module.
    const snapshotData = {
        sections,
        initialValues: getInitialValuesFromSnapshot(MOCK_SNAPSHOT, sections)
    };

    // Reuse adaptTranslateSections to mark all fields as read-only
    return adaptTranslateSections(snapshotData, true);
};

/**
 * POC hook: loads a CompositeContentSnapshot and adapts it into form data for a read-only panel.
 *
 * Currently mocks the snapshot from the live node data so the POC requires no backend changes.
 * The real implementation would call `compositeContentSnapshotByDate(uuid, locale, date)` and
 * replace EditFormQuery with a combined query that fetches both the form sections and the snapshot.
 *
 * Params mirror useTranslationReadOnlyFormDefinition but use `date` as cache key instead of `lang`.
 */
export const useVersionSnapshotFormDefinition = ({uuid, locale, date, snapshotMixins}) => {
    const uilang = useSelector(state => state.uilang);

    // Fetches only form sections — no live node data.
    // Real implementation: also add compositeContentSnapshotByDate(uuid, locale, date) here
    // and replace MOCK_SNAPSHOT with the API response in adaptReadOnlySnapshotData.
    const {loading, error, data: queryData} = useQuery(SnapshotFormSectionsQuery, {
        variables: {uuid, language: locale, uilang, snapshotMixins},
        fetchPolicy: 'network-only',
        errorPolicy: 'all',
        skip: !date // Do not fire when the panel is not in version-compare mode
    });

    const data = loading ? null : adaptReadOnlySnapshotData(queryData);

    return {data, loading, error};
};
