import React, {useCallback, useContext} from 'react';
import PropTypes from 'prop-types';
import {WorkInProgressDialog} from './WorkInProgressDialog';
import {ComponentRendererContext} from '@jahia/ui-extender';
import {Constants} from '~/ContentEditor/ContentEditor.constants';
import {useFormikContext} from 'formik';
import {useContentEditorContext} from '~/ContentEditor/contexts/ContentEditor';

export const OpenWorkInProgressModal = ({render: Render, ...otherProps}) => {
    const componentRenderer = useContext(ComponentRendererContext);
    const {nodeData, lang, siteInfo} = useContentEditorContext();
    const formik = useFormikContext();

    const closeDialog = () => {
        componentRenderer.destroy('WorkInProgressDialog');
    };

    const wipInfo = formik.values[Constants.wip.fieldName];
    const singleLanguage = siteInfo.languages.length === 1;
    const isWIP = (wipInfo, currentLanguage) => {
        const wipForLang = wipInfo?.status === Constants.wip.status.LANGUAGES && wipInfo?.languages?.includes(currentLanguage);
        return wipInfo?.status === Constants.wip.status.ALL_CONTENT || wipForLang;
    };

    const isWIPStatus = isWIP(wipInfo, lang);
    const buttonLabel = `jcontent:label.contentEditor.edit.action.workInProgress.label.${isWIPStatus ? 'unmark' : 'mark'}`;

    const openModal = () => {
        componentRenderer.render(
            'WorkInProgressDialog',
            WorkInProgressDialog,
            {
                wipInfo,
                currentLanguage: lang,
                isOpen: true,
                languages: siteInfo.languages,
                onCloseDialog: closeDialog,
                onApply: newWipInfo => {
                    formik.setFieldValue(Constants.wip.fieldName, newWipInfo);
                    closeDialog();
                }
            });
    };

    const switchButton = useCallback(() => {
        const status = isWIPStatus ? Constants.wip.status.DISABLED : Constants.wip.status.ALL_CONTENT;
        formik.setFieldValue(Constants.wip.fieldName, {status, languages: []});
    }, [isWIPStatus, formik]);

    return (
        <Render
                {...otherProps}
                buttonLabel={buttonLabel}
                enabled={!nodeData.lockedAndCannotBeEdited && nodeData.hasWritePermission && !Constants.wip.notAvailableFor.includes(nodeData.primaryNodeType.name)}
                onClick={singleLanguage ? switchButton : openModal}/>
    );
};

OpenWorkInProgressModal.propTypes = {
    render: PropTypes.func.isRequired
};

export const openWorkInProgressAction = {
    component: OpenWorkInProgressModal
};
