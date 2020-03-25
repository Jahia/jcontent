import React from 'react';
import PropTypes from 'prop-types';
import {Chip} from '@jahia/moonstone';

import {getNodeTypeIcon} from '../ContentBreadcrumb.utils';

const ContentType = ({name, displayName}) => (
    <Chip color="accent" label={displayName || name} icon={getNodeTypeIcon(name)}/>
);

ContentType.propTypes = {
    name: PropTypes.string.isRequired,
    displayName: PropTypes.string
};

export default ContentType;
