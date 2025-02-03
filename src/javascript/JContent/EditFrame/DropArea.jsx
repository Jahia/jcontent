import clsx from 'clsx';
import styles from './Box.scss';
import React from 'react';
import PropTypes from 'prop-types';
import {DefaultBar} from '~/JContent/EditFrame/DefaultBar';

export const DropArea = ({dropTarget, isDropAllowed}) => {
    if (!isDropAllowed) {
        return null;
    }

    return (
        <div className={clsx(styles.root, styles.dropArea)}
             style={dropTarget.position}
        >
            <div className={clsx(styles.dropAreaHeader, 'flexRow_nowrap', 'alignCenter')}>
                <DefaultBar isActionsHidden isStatusHidden node={dropTarget.node} dragProps={{isDropAllowed: true}}/>
            </div>
        </div>
    );
};

DropArea.propTypes = {
    dropTarget: PropTypes.any,
    isDropAllowed: PropTypes.bool
};
