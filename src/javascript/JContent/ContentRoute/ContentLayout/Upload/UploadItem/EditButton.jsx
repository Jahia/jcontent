import React from 'react';
import {uploadStatuses} from '../Upload.constants';
import {Button, OpenInNew} from '@jahia/moonstone';
import PropTypes from 'prop-types';
import {useSelector} from 'react-redux';
import {isImageFile} from '../../ContentLayout.utils';
import {useTranslation} from 'react-i18next';

const EditButton = props => {
    const {t} = useTranslation();
    const {status, file, uuid} = props;

    const {language} = useSelector(state => ({language: state.language}));
    const url = `${window.contextJsParameters.urlbase}/content-editor/${language}/edit/${uuid}`;

    if (isImageFile(file.name) && uuid !== null && status === uploadStatuses.UPLOADED) {
        return (
            <Button
                isReversed
                label={t('jcontent:label.contentManager.fileUpload.edit')}
                icon={<OpenInNew/>}
                variant="ghost"
                size="big"
                onClick={() => {
                    window.open(url, '_blank');
                }}
            />
        );
    }

    return null; // If not uploaded yet or has error no need to display the edit button
};

EditButton.propTypes = {
    status: PropTypes.string,
    uuid: PropTypes.string,
    file: PropTypes.object.isRequired
};

export default EditButton;
