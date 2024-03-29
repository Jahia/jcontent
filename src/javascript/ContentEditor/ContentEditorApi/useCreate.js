import {
    flattenNodeTypes,
    getCreatableNodetypesTree,
    getNodeUUID
} from '~/ContentEditor/actions/jcontent/createContent/createContent.utils';
import {Constants} from '~/ContentEditor/ContentEditor.constants';
import {useCallback} from 'react';
import {useApolloClient} from '@apollo/client';
import {shallowEqual, useSelector} from 'react-redux';

// eslint-disable-next-line max-params
const create = async (setEditorConfig, setContentTypeSelectorConfig, client, data, uilang, currentLanguage) => {
    const {
        path, uuid, name, nodeTypes, excludedNodeTypes, includeSubTypes, nodeTypesTree, lang, ...editorConfigWithoutUuid
    } = data;

    const resolvedCreatableNodeTypesTree = nodeTypesTree || await getCreatableNodetypesTree({
        client,
        nodeTypes,
        childNodeName: name,
        includeSubTypes,
        path,
        uuid,
        uilang,
        excludedNodeTypes: (excludedNodeTypes && excludedNodeTypes.length) > 0 ? excludedNodeTypes : ['jmix:studioOnly', 'jmix:hiddenType'],
        showOnNodeTypes: []}
    );

    const editorConfig = {
        ...editorConfigWithoutUuid,
        lang: lang || currentLanguage,
        uuid: uuid || await getNodeUUID({client, path})
    };

    const flattenedNodeTypes = flattenNodeTypes(resolvedCreatableNodeTypesTree);

    // Only one type allowed, open directly CE
    if (flattenedNodeTypes.length === 1) {
        setEditorConfig({
            name,
            contentType: flattenedNodeTypes[0].name,
            mode: Constants.routes.baseCreateRoute,
            ...editorConfig
        });
    }

    // Multiple nodetypes allowed, open content type selector
    if (flattenedNodeTypes.length > 1) {
        setContentTypeSelectorConfig({
            nodeTypesTree: resolvedCreatableNodeTypesTree,
            name,
            editorConfig
        });
    }
};

export const useCreate = (setEditorConfig, setContentTypeSelectorConfig) => {
    const client = useApolloClient();
    const {currentLanguage, uilang} = useSelector(state => ({currentLanguage: state.language, uilang: state.uilang}), shallowEqual);

    /**
     * Open content type selection then content editor as a modal to create a new content
     * @param uuid of the parent node path where the content will be created
     * @param path of the parent node path where the content will be created
     * @param site the current site
     * @param lang the current lang from url
     * @param uilang deprecated
     * @param nodeTypes (optional) required in case you want to open CE directly for this content type,
     *                    if not specified: will try to resolve the content types available for creation
     *                    - in case of one content type resolved and includeSubTypes to false: open directly CE for this content type
     *                    - in case of multiple content types resolved: open content type selector
     * @param excludedNodeTypes (optional) The node types excluded for creation, by default: ['jmix:studioOnly', 'jmix:hiddenType']
     * @param includeSubTypes (optional) if true, subtypes of nodeTypes provided will be resolved.
     * @param name the name of the child node (only specified in case of named child node, null/undefined otherwise)
     * @param isFullscreen open editor in fullscreen
     */
    // eslint-disable-next-line max-params
    return useCallback(async (uuid, path, site, lang, _, nodeTypes, excludedNodeTypes, includeSubTypes, name, isFullscreen, createCallback, onClosedCallback) => {
        if (uuid && typeof uuid === 'object') {
            return create(setEditorConfig, setContentTypeSelectorConfig, client, uuid, uilang, currentLanguage);
        }

        return create(setEditorConfig, setContentTypeSelectorConfig, client, {
            uuid, path, lang, nodeTypes, excludedNodeTypes, includeSubTypes, name, isFullscreen, createCallback, onClosedCallback
        }, uilang, currentLanguage);
    }, [uilang, currentLanguage, client, setEditorConfig, setContentTypeSelectorConfig]);
};
