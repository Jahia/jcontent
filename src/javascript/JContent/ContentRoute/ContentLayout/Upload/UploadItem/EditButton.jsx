import React from 'react';
import {uploadStatuses} from '../Upload.constants';
import {DisplayActions} from '@jahia/ui-extender';
import {ButtonRenderer} from '~/utils/getButtonRenderer';
import {OpenInNew} from '@jahia/moonstone/dist/icons';
import PropTypes from 'prop-types';
import {isImageFile} from '../../ContentLayout.utils';

const EditButton = props => {
    const {status, file, t, path} = props;

    if (window.contextJsParameters.config.links.tagImageOnUpload && isImageFile(file.name)) {
        if (status === uploadStatuses.UPLOADED) {
            return (
                <DisplayActions
                    target="contentActions"
                    filter={value => value.key === 'edit'}
                    path={`${path}/${file.name}`}
                    render={ButtonRenderer}
                    buttonLabel={t('jcontent:label.contentManager.fileUpload.edit')}
                    buttonIcon={<OpenInNew/>}
                    buttonProps={{variant: 'ghost', size: 'big', isReversed: true}}
                />
            );
        }
    }

    return null; // If not uploaded yet or has error no need to display the edit button
};

EditButton.propTypes = {
    status: PropTypes.string,
    file: PropTypes.object.isRequired,
    t: PropTypes.func.isRequired,
    path: PropTypes.string.isRequired
};

export default EditButton;
