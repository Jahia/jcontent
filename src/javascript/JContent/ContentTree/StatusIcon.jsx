import {Lock, NoCloud} from '@jahia/moonstone/dist/icons';
import React from 'react';
import PropTypes from 'prop-types';
import styles from './ContentTree.scss';
import {DisplayAction} from '@jahia/ui-extender';
import {getButtonRenderer} from '../../utils/getButtonRenderer';

export const StatusIcon = ({locked, notPublished, path, ...props}) => {
    return (
        <>
            <span className={styles.ContentTree_ItemStatusIcon}>
                {(locked && <Lock {...props}/>) || (notPublished && <NoCloud {...props}/>)}
            </span>
            <span className={styles.ContentTree_ItemMenuIcon}>
                <DisplayAction actionKey="contentMenu" context={{path}} render={getButtonRenderer({labelStyle: 'none', variant: 'ghost', isReversed: true, size: 'small'})} {...props}/>
            </span>
        </>
    );
};

StatusIcon.propTypes = {
    path: PropTypes.string.isRequired,
    locked: PropTypes.bool.isRequired,
    notPublished: PropTypes.bool.isRequired
};
