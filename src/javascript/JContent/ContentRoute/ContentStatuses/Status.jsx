import React from 'react';
import PropTypes from 'prop-types';
import {useTranslation} from 'react-i18next';
import {
    Build,
    Chip,
    CloudCheck,
    Delete,
    Modified,
    FileContent,
    Lock,
    NoCloud,
    Warning,
    Language,
    Group,
    Visibility,
    Hidden,
    ContentReference
} from '@jahia/moonstone';

export const config = {
    locked: {
        color: 'default',
        icon: <Lock/>
    },
    markedForDeletion: {
        color: 'danger',
        icon: <Delete/>
    },
    modified: {
        color: 'warning',
        icon: <Modified/>
    },
    notPublished: {
        color: 'default',
        icon: <NoCloud/>
    },
    published: {
        color: 'success',
        icon: <CloudCheck/>
    },
    warning: {
        color: 'warning',
        icon: <Warning/>
    },
    workInProgress: {
        color: 'warning',
        icon: <Build/>
    },
    publishing: {
        color: 'accent',
        icon: <FileContent/>
    },
    noTranslation: {
        color: 'accent',
        icon: <Language/>
    },
    permissions: {
        color: 'accent',
        icon: <Group/>
    },
    visibilityConditions: {
        color: 'default',
        icon: <Visibility/>
    },
    notVisible: {
        color: 'default',
        icon: <Hidden/>
    },
    usagesCount: {
        color: 'warning',
        icon: <ContentReference/>
    }
};

const types = Object.keys(config);

const Status = ({type, tooltip, isDisabled, hasLabel, labelParams, ...props}) => {
    const {t} = useTranslation('jcontent');
    const label = t(`label.contentManager.contentStatus.${type}`, labelParams);
    const hasDefinedLabel = label !== `label.contentManager.contentStatus.${type}`;
    console.log(`Rendering Status: type=${type}, label=${label}, hasLabel=${hasLabel} hasDefinedLabel=${hasDefinedLabel}`);
    return (
        <Chip
            label={(hasLabel && hasDefinedLabel) ? label : null}
            isDisabled={isDisabled}
            title={tooltip || label}
            data-sel-role="content-status"
            data-status-type={type}
            {...config[type]}
            {...props}
        />
    );
};

Status.propTypes = {
    type: PropTypes.oneOf(types).isRequired,
    tooltip: PropTypes.string,
    isDisabled: PropTypes.bool,
    hasLabel: PropTypes.bool,
    labelParams: PropTypes.object
};

Status.defaultProps = {
    isDisabled: false,
    hasLabel: true
};

export default Status;
