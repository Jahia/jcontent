import React from 'react';
import {uploadStatuses} from '../Upload.constants';
import {OpenInNew} from '@jahia/moonstone/dist/icons';
import {Button} from '@jahia/moonstone';
import PropTypes from 'prop-types';
import {useSelector} from 'react-redux';
import {isImageFile} from '../../ContentLayout.utils';

const showEditButton = ({uuid, status}) => {
    if (uuid !== null && status === uploadStatuses.UPLOADED) {
        return true;
    }

    return false;
};

const EditButton = props => {
    const {status, file, t, uuid} = props;

    const {language} = useSelector(state => ({language: state.language}));
    const windowLocationPathNames = window.location.pathname.split('/');
    const location = (windowLocationPathNames.length > 1) ? `/${windowLocationPathNames[1]}` : '';
    const url = `${location}/content-editor/${language}/edit/${uuid}`;

    if (isImageFile(file.name)) {
        if (showEditButton({uuid, status})) {
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
    }

    return null; // If not uploaded yet or has error no need to display the edit button
};

EditButton.propTypes = {
    status: PropTypes.string,
    uuid: PropTypes.string,
    file: PropTypes.object.isRequired,
    t: PropTypes.func.isRequired
};

export default EditButton;
