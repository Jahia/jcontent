import React from 'react';
import {useNodeChecks} from '@jahia/data-helper';
import * as PropTypes from 'prop-types';
import {useSelector} from 'react-redux';
import {useContentEditorApiContext} from '~/ContentEditor/contexts/ContentEditorApi/ContentEditorApi.context';
import {isDefinitelyHidden} from '~/JContent/actions/utils/nodeVisibilityUtils';
import {getFirstOtherLanguage, getFirstUntranslatedLanguage} from '~/ContentEditor/utils';
import {Constants} from '~/ContentEditor/ContentEditor.constants';

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

    // Default the side-by-side languages when opening the editor (#2484). The two entry points
    // into translate mode behave differently, distinguished by the action opening on the translate tab:
    //  - Plain edit actions (edit, editAdvanced, quickEdit, …) keep editing the current language;
    //    the source (read-only) column defaults to the first other active language alphabetically.
    //  - The right-click "Translate to" action translates *from* the current language *to* another one,
    //    so the source is the current language and the editable/target defaults to the first active
    //    language, alphabetically, that has no translation yet.
    const languages = (res.node?.site?.languages || []).filter(l => l.activeInEdit).map(l => l.language);
    const isTranslateAction = otherProps.editConfig?.advancedOpenTab === Constants.editPanel.translateTab;
    const editLang = isTranslateAction ?
        getFirstUntranslatedLanguage({languages, translationLanguages: res.node?.translationLanguages, currentLanguage: language}) :
        language;
    const sourceLang = isTranslateAction ?
        language :
        getFirstOtherLanguage({languages, currentLanguage: language});

    return (
        <Render
            {...otherProps}
            isVisible={res.checksResult}
            onClick={() =>
                api.edit({
                    uuid: res.node.uuid,
                    lang: editLang,
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
    component: EditContent
};
