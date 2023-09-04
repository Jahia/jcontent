import React from 'react';
import {uploadStatuses} from '../Upload.constants';
import {Button, OpenInNew} from '@jahia/moonstone';
import PropTypes from 'prop-types';
import {useSelector} from 'react-redux';
import {isImageFile} from '../../ContentLayout.utils';
import {useTranslation} from 'react-i18next';
import rison from 'rison';
import {buildUrl, expandTree} from '~/JContent/JContent.utils';
import {useApolloClient} from '@apollo/client';

const EditButton = ({upload, uuid}) => {
    const {t} = useTranslation('jcontent');
    const language = useSelector(state => state.language);
    const {status, file} = upload;
    const client = useApolloClient();

    if (isImageFile(file.name) && uuid !== null && status === uploadStatuses.UPLOADED) {
        return (
            <Button
                isReversed
                label={t('jcontent:label.contentManager.fileUpload.edit')}
                icon={<OpenInNew/>}
                variant="ghost"
                size="big"
                onClick={() => {
                    expandTree({uuid}, client).then(({mode, parentPath, site}) => {
                        const hash = rison.encode_uri({contentEditor: [{uuid, lang: language, mode: 'edit', isFullscreen: true}]});
                        const url = buildUrl({site, language, mode, path: parentPath});
                        window.open(`${window.contextJsParameters.urlbase}${url}#${hash}`, '_blank');
                    });
                }}
            />
        );
    }

    return null; // If not uploaded yet or has error no need to display the edit button
};

EditButton.propTypes = {
    upload: PropTypes.object,
    uuid: PropTypes.string
};

export default EditButton;
