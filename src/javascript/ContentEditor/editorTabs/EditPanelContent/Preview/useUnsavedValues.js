import {useEffect, useState} from 'react';
import {useFormikContext} from 'formik';
import {useQuery} from '@apollo/client';
import {isEqual} from 'lodash';
import {useContentEditorContext, useContentEditorSectionContext} from '~/ContentEditor/contexts';
import {getChildrenOrder, getDataToMutate} from '~/ContentEditor/utils';
import {Constants} from '~/ContentEditor/ContentEditor.constants';
import {UNSAVED_VALUES_SUPPORT_CONTEXT} from '~/JContent/preview/useContentPreview';
import {UnsavedValuesSupportQuery} from './useUnsavedValues.gql-queries';

const DEBOUNCE_DELAY = 500;

/**
 * The unsaved values of the form, in the shape of the save: the properties that the form sets and removes, and the
 * mixins that it adds and removes. A removal of a property that the node does not store changes nothing, so it stays out.
 * @returns {object|null} the unsaved values, or null when the form changes nothing that the preview shows
 */
export const buildUnsavedValues = ({nodeData, values, i18nContext, sections, lang}) => {
    const {propsToSave, propsToDelete, mixinsToAdd = [], mixinsToDelete = []} = getDataToMutate({
        nodeData,
        formValues: values,
        i18nContext,
        sections,
        lang
    });
    // The system name renames the node on save, and the preview reads the node at its current path.
    const properties = propsToSave.filter(property => property.name !== Constants.systemName.propertyName);
    const propertiesToDelete = propsToDelete.filter(property => nodeData.properties?.some(stored => stored.name === property.name));
    if (properties.length === 0 && propertiesToDelete.length === 0 && mixinsToAdd.length === 0 && mixinsToDelete.length === 0) {
        return null;
    }

    return {
        node: nodeData.uuid,
        properties,
        propertiesToDelete,
        mixinsToAdd,
        mixinsToDelete
    };
};

/**
 * Whether the form holds a change that the preview cannot show: a new system name, which renames the node on save, or a
 * new order of the children.
 * @returns {boolean} true when the preview shows the form only in part
 */
export const hasChangesOutsidePreview = ({nodeData, values, i18nContext, sections, lang}) => {
    const {propsToSave} = getDataToMutate({nodeData, formValues: values, i18nContext, sections, lang});
    return propsToSave.some(property => property.name === Constants.systemName.propertyName) ||
        getChildrenOrder(values, nodeData, sections).shouldModifyChildren;
};

/**
 * Follows the unsaved values of the form for the preview, once the editor stops typing.
 * @returns {{isSupported: boolean, unsavedValues: object|null, isPartial: boolean}} whether the server shows unsaved
 * values, the values to show, and whether the form holds a change that the preview cannot show
 */
export const useUnsavedValues = () => {
    const {dirty, values} = useFormikContext();
    const {nodeData, lang, i18nContext} = useContentEditorContext();
    const {sections} = useContentEditorSectionContext();
    const {data, error} = useQuery(UnsavedValuesSupportQuery, {
        variables: {node: nodeData.uuid},
        fetchPolicy: 'cache-first',
        errorPolicy: 'all',
        context: UNSAVED_VALUES_SUPPORT_CONTEXT
    });
    const isSupported = Boolean(data?.jcr?.workspace) && !error;
    const [state, setState] = useState({unsavedValues: null, isPartial: false});

    useEffect(() => {
        if (!isSupported || !dirty) {
            setState(previous => (previous.unsavedValues === null && !previous.isPartial ? previous : {unsavedValues: null, isPartial: false}));
            return undefined;
        }

        const timeout = setTimeout(() => {
            const form = {nodeData, values, i18nContext, sections, lang};
            const next = {unsavedValues: buildUnsavedValues(form), isPartial: hasChangesOutsidePreview(form)};
            // The same values keep the same object, so the preview does not render them again.
            setState(previous => (isEqual(previous, next) ? previous : next));
        }, DEBOUNCE_DELAY);
        return () => clearTimeout(timeout);
    }, [isSupported, dirty, values, nodeData, lang, i18nContext, sections]);

    return {isSupported, unsavedValues: state.unsavedValues, isPartial: state.isPartial};
};
