import React from 'react';
import PropTypes from 'prop-types';
import {BreadcrumbItem} from '@jahia/moonstone';

import {getNodeTypeIcon} from '~/ContentEditor/utils';

export const SimplePathEntry = ({item, onItemClick}) => {
    const type = item.primaryNodeType?.name;
    const icon = getNodeTypeIcon(type);
    return (
        <BreadcrumbItem data-sel-role="breadcrumb-item" label={item.displayName} icon={icon} onClick={() => onItemClick(item.path)}/>
    );
};

SimplePathEntry.propTypes = {
    item: PropTypes.object.isRequired,
    onItemClick: PropTypes.func
};

SimplePathEntry.defaultProps = {
    onItemClick: () => {}
};
