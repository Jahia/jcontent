import React from 'react';
import PropTypes from 'prop-types';
import {useTranslation} from 'react-i18next';
import {Build, Chip, Cloud, Delete, File, Lock, NoCloud, Warning} from '@jahia/moonstone';

const config = {
    locked: {
        color: 'warning',
        icon: <Lock/>
    },
    markedForDeletion: {
        color: 'danger',
        icon: <Delete/>
    },
    modified: {
        color: 'default',
        icon: <File/>
    },
    notPublished: {
        color: 'warning',
        icon: <NoCloud/>
    },
    published: {
        color: 'accent',
        icon: <Cloud/>
    },
    warning: {
        color: 'warning',
        icon: <Warning/>
    },
    workInProgress: {
        color: 'default',
        icon: <Build/>
    }
};

const types = Object.keys(config);

const Status = ({type, tooltip, isDisabled, hasLabel}) => {
    const {t} = useTranslation('jcontent');
    const label = t(`label.contentManager.contentStatus.${type}`);
    return (
        <Chip label={hasLabel ? label : null} isDisabled={isDisabled} title={tooltip || label} {...config[type]} data-sel-role="content-status"/>
    );
};

Status.propTypes = {
    type: PropTypes.oneOf(types).isRequired,
    tooltip: PropTypes.string,
    isDisabled: PropTypes.bool,
    hasLabel: PropTypes.bool
};

Status.defaultProps = {
    isDisabled: false,
    hasLabel: true
};

export default Status;
