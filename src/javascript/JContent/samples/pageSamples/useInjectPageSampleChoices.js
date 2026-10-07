import {useEffect, useRef} from 'react';
import {useContentEditorSectionContext} from '~/ContentEditor/contexts';
import {recreateSections} from '~/ContentEditor/SelectorTypes/registerSelectorTypesOnChange';
import {usePageSamples} from './usePageSamples';
import {findTemplateField, toPageSampleValue} from './pageSamples.utils';

/**
 * Adds the site's page samples to the template dropdown of the page creation form, after a
 * separator: picking a template creates an empty page using it, picking a sample copies that sample.
 *
 * The constraints are mutated in place and the section provider is told to re-render, which is how
 * the dependent-property and ChoiceList handlers already modify a live form. Mutating rather than
 * replacing matters: the provider keeps one sections object for the life of the form and resyncs
 * only when the server sends a genuinely different one.
 *
 * Nothing is injected when the site holds no page samples, so a site without them sees exactly the
 * form it saw before.
 *
 * @param {object} options - hook options
 * @param {string} options.parentUuid - the node the page will be created under
 * @param {boolean} options.isPageCreation - whether the form is creating a page
 * @param {Function} options.t - translation function, for the separator label
 */
export const useInjectPageSampleChoices = ({parentUuid, isPageCreation, t}) => {
    const {getSections, onSectionsUpdate} = useContentEditorSectionContext();
    const {samples} = usePageSamples({parentUuid, skip: !isPageCreation});
    const injectedRef = useRef(false);

    useEffect(() => {
        if (!isPageCreation || samples.length === 0 || injectedRef.current) {
            return;
        }

        const sections = getSections();
        const field = findTemplateField(sections);
        if (!field?.valueConstraints) {
            return;
        }

        // Guard against a second pass over the same form: the effect re-runs whenever the sections
        // object is replaced, and the constraints it carries may already hold the samples.
        if (field.valueConstraints.some(c => c.properties?.some(p => p.name === 'group'))) {
            injectedRef.current = true;
            return;
        }

        const templatesGroup = t('jcontent:label.contentEditor.samples.pageTemplatesGroup');
        const samplesGroup = t('jcontent:label.contentEditor.samples.pageSamplesGroup');

        // A new array, not a push: the choicelist memoizes its options on the field reference, so
        // mutating the existing array in place leaves the dropdown showing its cached entries.
        // Naming a group on every entry is what turns the flat list into two labelled groups.
        field.valueConstraints = [
            ...field.valueConstraints.map(constraint => ({
                ...constraint,
                properties: [...(constraint.properties ?? []), {name: 'group', value: templatesGroup}]
            })),
            ...samples.map(sample => ({
                value: {type: 'STRING', string: toPageSampleValue(sample.path)},
                displayValue: sample.displayName,
                displayValueKey: null,
                properties: [{name: 'group', value: samplesGroup}]
            }))
        ];

        // And hand every field a fresh identity, which is what actually makes the form notice.
        recreateSections(sections);

        injectedRef.current = true;
        onSectionsUpdate();
    }, [isPageCreation, samples, getSections, onSectionsUpdate, t]);
};
