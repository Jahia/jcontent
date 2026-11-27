import {useEffect, useState} from 'react';
import {useFormikContext} from 'formik';
import {useQuery} from '@apollo/client';
import {isEqual} from 'lodash';
import {registry} from '@jahia/ui-extender';
import {useContentEditorContext, useContentEditorSectionContext} from '~/ContentEditor/contexts';
import {getChildrenOrder, getDataToMutate} from '~/ContentEditor/utils';
import {adaptUpdateRequest} from '~/ContentEditor/ContentEditor/updateNode/adaptUpdateRequest';
import {Constants} from '~/ContentEditor/ContentEditor.constants';
import {useUnsavedValuesContext} from '~/JContent/preview/useContentPreview';
import {UnsavedValuesSupportQuery} from './useUnsavedValues.gql-queries';

const DEBOUNCE_DELAY = 500;
const NO_UNSAVED_VALUES = {unsavedValues: null, isPartial: false};

/**
 * Reads the form for the preview. The unsaved values take the shape of the save: the properties that the form sets and
 * removes, and the mixins that it adds and removes. A removal of a property that the node does not store changes
 * nothing, so it stays out. The preview shows the form in part when the form renames the node, as the save decides it,
 * or gives its children a new order, and when a contentEditor.onEdit hook of a module can change the save.
 * @returns {{unsavedValues: object|null, isPartial: boolean}} the values to show, or null when the form changes nothing
 * that the preview shows, and whether the form holds a change that the preview cannot show
 */
export const readUnsavedValues = ({nodeData, values, i18nContext, sections, lang}) => {
    const {propsToSave, propsToDelete, mixinsToAdd = [], mixinsToDelete = []} = getDataToMutate({
        nodeData,
        formValues: values,
        i18nContext,
        sections,
        lang
    });
    // The save request removes the system name from the list that it receives, so it gets a copy.
    const isPartial = adaptUpdateRequest(nodeData, {propertiesToSave: [...propsToSave]}).shouldRename ||
        getChildrenOrder(values, nodeData, sections).shouldModifyChildren ||
        registry.find({type: 'contentEditor.onEdit'}).length > 0;
    // The system name renames the node on save, and the preview reads the node at its current path.
    const properties = propsToSave.filter(property => property.name !== Constants.systemName.propertyName);
    const propertiesToDelete = propsToDelete.filter(property => nodeData.properties?.some(stored => stored.name === property.name));
    const isEmpty = properties.length === 0 && propertiesToDelete.length === 0 && mixinsToAdd.length === 0 && mixinsToDelete.length === 0;
    return {
        unsavedValues: isEmpty ? null : {node: nodeData.uuid, properties, propertiesToDelete, mixinsToAdd, mixinsToDelete},
        isPartial
    };
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
    const supportContext = useUnsavedValuesContext('support');
    const {data, error} = useQuery(UnsavedValuesSupportQuery, {
        variables: {node: nodeData.uuid},
        fetchPolicy: 'cache-first',
        errorPolicy: 'all',
        context: supportContext
    });
    const isSupported = Boolean(data?.jcr?.workspace) && !error;
    const [state, setState] = useState(NO_UNSAVED_VALUES);

    useEffect(() => {
        // An older server refuses the probe with a GraphQL error, and so does a server that shows no unsaved values of
        // this node, such as a node under /modules.
        if (error?.graphQLErrors?.length) {
            console.info('The preview shows the unsaved values on save only:', error.graphQLErrors.map(e => e.message).join('; '));
        } else if (error) {
            console.error('The preview could not ask the server about unsaved values', error);
        }
    }, [error]);

    useEffect(() => {
        if (!isSupported || !dirty) {
            setState(NO_UNSAVED_VALUES);
            return undefined;
        }

        const timeout = setTimeout(() => {
            const next = readUnsavedValues({nodeData, values, i18nContext, sections, lang});
            // The same values keep the same object, so the preview does not render them again.
            setState(previous => (isEqual(previous, next) ? previous : next));
        }, DEBOUNCE_DELAY);
        return () => clearTimeout(timeout);
    }, [isSupported, dirty, values, nodeData, lang, i18nContext, sections]);

    return {isSupported, unsavedValues: state.unsavedValues, isPartial: state.isPartial};
};
