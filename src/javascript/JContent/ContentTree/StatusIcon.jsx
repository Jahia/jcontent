import {Lock, NoCloud} from '@jahia/moonstone';
import React from 'react';
import PropTypes from 'prop-types';
import styles from './ContentTree.scss';
import {DisplayAction} from '@jahia/ui-extender';
import {getButtonRenderer} from '../../utils/getButtonRenderer';

export const StatusIcon = ({isLocked, isNotPublished, path, ...props}) => {
    return (
        <>
            <span className={styles.ContentTree_ItemStatusIcon}>
                {(isLocked && <Lock {...props}/>) || (isNotPublished && <NoCloud {...props}/>)}
            </span>
            <span className={styles.ContentTree_ItemMenuIcon}>
                <DisplayAction isReversed actionKey="contentMenu" context={{path}} render={getButtonRenderer({labelStyle: 'none'})} variant="ghost" size="small" {...props}/>
            </span>
        </>
    );
};

StatusIcon.propTypes = {
    path: PropTypes.string.isRequired,

    isLocked: PropTypes.bool.isRequired,

    isNotPublished: PropTypes.bool.isRequired
};
