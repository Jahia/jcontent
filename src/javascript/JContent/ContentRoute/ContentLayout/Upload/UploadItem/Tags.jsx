import {uploadStatuses, TAG_ERROR} from '../Upload.constants';
import React from 'react';
import {LocalOffer} from '@material-ui/icons';
import {Typography} from '@jahia/design-system-kit';
import {isImageFile} from '../../ContentLayout.utils';

const Tags = props => {
    const {classes, status, t, file} = props;
    const tags = props.numTags;
    let content = null;
    let tagText = (tags === TAG_ERROR) ? '' : ((tags > 0) ? t('jcontent:label.contentManager.fileUpload.tags') : t('jcontent:label.contentManager.fileUpload.tag'));

    if (window.contextJsParameters.config.links.tagImageOnUpload && isImageFile(file.name)) {
        if (status === uploadStatuses.UPLOADED) {
            content = (
                <React.Fragment>
                    <LocalOffer className={classes.tagIcon} color="inherit"/>
                    <Typography variant="zeta" className={classes.progressText} color="inherit">
                        {tags} {tagText}
                    </Typography>
                </React.Fragment>
            );
        }
    }

    return content;
};

export default Tags;
