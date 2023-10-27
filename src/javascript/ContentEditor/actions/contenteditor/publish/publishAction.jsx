import React, {useCallback} from 'react';
import * as PropTypes from 'prop-types';
import {publishNode} from './publishNode';
import {Constants} from '~/ContentEditor/ContentEditor.constants';
import {useContentEditorContext, usePublicationInfoContext} from '~/ContentEditor/contexts';
import {useApolloClient} from '@apollo/client';
import {useTranslation} from 'react-i18next';
import {useFormikContext} from 'formik';
import {isDirty} from '~/ContentEditor/utils';
import {CloudCheck} from '@jahia/moonstone';

const Publish = ({buttonIcon, render: Render, loading: Loading, ...otherProps}) => {
    const {publicationInfoPolling, publicationStatus, stopPublicationInfoPolling, startPublicationInfoPolling} = usePublicationInfoContext();
    const client = useApolloClient();
    const {t} = useTranslation();
    const {nodeData, lang, i18nContext, siteInfo} = useContentEditorContext();
    const formik = useFormikContext();
    const {hasPublishPermission, lockedAndCannotBeEdited} = nodeData;

    let disabled = true;
    const isVisible = hasPublishPermission;

    if (isVisible) {
        if (publicationInfoPolling && publicationStatus === Constants.editPanel.publicationStatus.PUBLISHED) {
            stopPublicationInfoPolling();
        }

        const dirty = isDirty(formik, i18nContext);

        const wipInfo = formik.values[Constants.wip.fieldName];
        disabled = publicationStatus === undefined ||
            publicationInfoPolling ||
            lockedAndCannotBeEdited ||
            dirty ||
            wipInfo.status === Constants.wip.status.ALL_CONTENT ||
            (wipInfo.status === Constants.wip.status.LANGUAGES && wipInfo.languages.includes(lang)) ||
            [
                Constants.editPanel.publicationStatus.PUBLISHED,
                Constants.editPanel.publicationStatus.MANDATORY_LANGUAGE_UNPUBLISHABLE
            ].includes(publicationStatus);
    }

    let buttonLabel = publicationInfoPolling ?
        'jcontent:label.contentEditor.edit.action.publish.namePolling' :
        'jcontent:label.contentEditor.edit.action.publish.name';

    let buttonLabelShort = (siteInfo?.languages?.length === 1) && !publicationInfoPolling ?
        'jcontent:label.contentEditor.edit.action.publish.shortName' : '';

    if (publicationStatus === 'PUBLISHED') {
        buttonLabel += 'Published';
        if (buttonLabelShort) {
            buttonLabelShort += 'Published';
        }

        if (buttonIcon) {
            buttonIcon = <CloudCheck/>;
        }
    }

    let onClick = useCallback(() => {
        publishNode({
            client,
            t,
            data: {
                nodeData,
                language: lang
            },
            successCallback: startPublicationInfoPolling
        });
    }, [client, t, nodeData, lang, startPublicationInfoPolling]);

    if (Loading) {
        return <Loading {...otherProps}/>;
    }

    return (
        <Render
            {...otherProps}
            buttonIcon={buttonIcon}
            disabled={disabled}
            buttonLabel={buttonLabel}
            buttonLabelShort={buttonLabelShort}
            buttonLabelParams={{language: lang}}
            isVisible={isVisible}
            onClick={onClick}
        />
    );
};

Publish.propTypes = {
    buttonIcon: PropTypes.node,
    render: PropTypes.func.isRequired,
    loading: PropTypes.func
};

export const publishAction = {
    component: Publish
};
