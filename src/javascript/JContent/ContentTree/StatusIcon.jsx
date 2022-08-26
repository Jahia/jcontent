import {Lock, NoCloud} from '@jahia/moonstone';
import React from 'react';
import PropTypes from 'prop-types';
import styles from './ContentTree.scss';
import {DisplayAction} from '@jahia/ui-extender';
import {ButtonRendererNoLabel} from '../../utils/getButtonRenderer';
import clsx from 'clsx';

export const StatusIcon = ({isLocked, isNotPublished, path, contentMenu, ...props}) => {
    return (
        <>
            <span className={clsx(styles.ContentTree_ItemStatusIcon, {[styles.ContentTree_ItemStatusIconWithMenu]: contentMenu})}>
                {(isLocked && <Lock {...props}/>) || (isNotPublished && <NoCloud {...props}/>)}
            </span>
            {contentMenu && (
                <span className={styles.ContentTree_ItemMenuIcon}>
                    <DisplayAction isReversed actionKey={contentMenu} path={path} render={ButtonRendererNoLabel} buttonProps={{variant: 'ghost', size: 'small'}} {...props}/>
                </span>
            )}
        </>
    );
};

StatusIcon.propTypes = {
    path: PropTypes.string.isRequired,

    isLocked: PropTypes.bool.isRequired,

    isNotPublished: PropTypes.bool.isRequired,

    contentMenu: PropTypes.string
};
