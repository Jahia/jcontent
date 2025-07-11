import React, {useContext} from 'react';
import PropTypes from 'prop-types';
import {useContentEditorContext} from '~/ContentEditor/contexts/ContentEditor';
import {useContentEditorApiContext} from '../../../contexts';
import {useSelector} from 'react-redux';
import {useNodeChecks} from '@jahia/data-helper';
import {TranslatePanel} from './TranslatePanel';

export const TranslateActionComponent = ({path, render: Render, ...otherProps}) => {
    // const {render, destroy} = useContext(ComponentRendererContext);
    const api = useContentEditorApiContext();
    const lang = useSelector(state => state.language);
    const res = useNodeChecks(
        {path: path, language: lang},
        {...otherProps, getSiteLanguages: true}
    );

    return (res.loading) ? null : (
        <Render {...otherProps}
                // enabled={siteInfo.languages.length > 1 && nodeData.hasWritePermission && !nodeData.lockedAndCannotBeEdited}
                onClick={() => {
                    api.edit({
                        uuid: res.node.uuid,
                        lang,
                        isFullscreen: true,
                        // editCallback,
                        dialogProps: {
                            classes: {}
                        },
                        layout: TranslatePanel,
                        // layout: RenameLayout,
                        // useFormDefinition: useRenameFormDefinition,
                        // useConfirmationDialog: false
                    });
                }}
        />
    );
};

TranslateActionComponent.propTypes = {
    render: PropTypes.func.isRequired
};

export const translateAction = {
    component: TranslateActionComponent
};
