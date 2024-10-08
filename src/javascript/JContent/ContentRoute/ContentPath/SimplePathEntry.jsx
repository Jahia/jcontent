import React from 'react';
import PropTypes from 'prop-types';
import {BreadcrumbItem} from '@jahia/moonstone';

import {getNodeTypeIcon} from '~/JContent/JContent.utils';

const SimplePathEntry = ({item, onItemClick, isDisabled}) => {
    const type = item.primaryNodeType?.name;
    const icon = getNodeTypeIcon(type);
    return (
        <BreadcrumbItem isDisabled={isDisabled} data-sel-role="breadcrumb-item" label={item.displayName} icon={icon} onClick={() => onItemClick(item)}/>
    );
};

SimplePathEntry.propTypes = {
    item: PropTypes.object.isRequired,
    onItemClick: PropTypes.func,
    isDisabled: PropTypes.bool
};

SimplePathEntry.defaultProps = {
    onItemClick: () => {}
};

export default SimplePathEntry;
