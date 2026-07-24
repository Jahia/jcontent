import React from 'react';
import {useNodeChecks} from '@jahia/data-helper';
import * as PropTypes from 'prop-types';
import {useSelector} from 'react-redux';
import {useContentEditorApiContext} from '~/ContentEditor/contexts/ContentEditorApi/ContentEditorApi.context';
import {isDefinitelyHidden} from '~/JContent/actions/utils/nodeVisibilityUtils';
import {Constants} from '~/ContentEditor/ContentEditor.constants';
import {editContentTranslationLanguagesFragment} from './editContent.gql-queries';
import {getBestSourceLanguage, getBestTargetLanguage} from '~/ContentEditor/utils/translateLanguages';

export const EditContent = ({
    path,
    node: prefetchedNode,
    isFullscreen,
    editCallback,
    render: Render,
    loading: Loading,
    ...otherProps
}) => {
    const api = useContentEditorApiContext();
    const language = useSelector(state => state.language);

    // Only use hideOnNodeTypes for pre-gate — showOnNodeTypes is skipped (subtype risk)
    const skip = isDefinitelyHidden(prefetchedNode, {hideOnNodeTypes: otherProps.hideOnNodeTypes});

    const res = useNodeChecks(
        {path: path, language: language},
        {skip, ...otherProps}
    );

    if (Loading && res.loading) {
        return <Loading {...otherProps}/>;
    }

    if (skip) {
        return false;
    }

    // We have no guarentee that the site node is fully populated as they are many ways to get to this code
    // Consider all values nullable
    const defaultLanguage = res.node?.site?.defaultLanguage;
    const activeLanguages = (res.node?.site?.languages || [])
        .filter(lang => lang.activeInEdit)
        .map(lang => lang.language)
        .sort((a, z) => a.localeCompare(z));
    const availableTranslations = (res.node?.translationLanguages || []).sort((a, z) => a.localeCompare(z));

    // `Right click > Advanced editing` and `Right click > Translate to` both open this panel
    // but should pick different source and target languages
    const isTranslateTo = otherProps.editConfig?.advancedOpenTab === Constants.editPanel.translateTab;

    const sourceLang = isTranslateTo ?
        language :
        getBestSourceLanguage(language, availableTranslations, defaultLanguage);

    const targetLang = isTranslateTo ?
        getBestTargetLanguage(language, availableTranslations, activeLanguages) :
        language;

    return (
        <Render
            {...otherProps}
            isVisible={res.checksResult}
            onClick={() =>
                api.edit({
                    uuid: res.node.uuid,
                    lang: targetLang,
                    isFullscreen,
                    editCallback,
                    sideBySideContext: {lang: sourceLang},
                    ...otherProps.editConfig
                })}
        />
    );
};

EditContent.defaultProps = {
    loading: undefined,
    isFullscreen: false,
    editCallback: undefined
};

EditContent.propTypes = {
    path: PropTypes.string.isRequired,
    node: PropTypes.object,
    isFullscreen: PropTypes.bool,
    editCallback: PropTypes.func,
    render: PropTypes.func.isRequired,
    loading: PropTypes.func
};

export const editContentAction = {
    component: EditContent,
    applyFragment: editContentTranslationLanguagesFragment
};
