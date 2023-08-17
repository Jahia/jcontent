import React from 'react';
import PropTypes from 'prop-types';
import {Breadcrumb, BreadcrumbItem} from '@jahia/moonstone';

export const Breadcrumbs = ({nodes}) => (
    <Breadcrumb>
        {nodes.map(n => (
            <BreadcrumbItem key={n.path} label={n.name} icon={<img alt={n.name} src={`${window.contextJsParameters.contextPath}${n.primaryNodeType.icon}.png`}/>}/>
        ))}
    </Breadcrumb>
);

Breadcrumbs.propTypes = {
    nodes: PropTypes.array
};
