import clsx from 'clsx';
import styles from './Box2.scss';
import React from 'react';
import PropTypes from 'prop-types';
import {DefaultBar} from '~/JContent/EditFrame/DefaultBar';

export const DropArea = ({dropTarget, isDropAllowed}) => {
    return (
        <div className={clsx(styles.root, styles.dropArea, isDropAllowed ? '' : styles.dropArea_notAllowed)}
             style={dropTarget.position}
        >
            <div className={clsx(styles.dropArea_header, 'flexRow_nowrap', 'alignCenter', isDropAllowed ? '' : styles.dropArea_header_notAllowed)}>
                <DefaultBar isActionsHidden isStatusHidden node={dropTarget.node}/>
            </div>
        </div>
    );
};

DropArea.propTypes = {
    dropTarget: PropTypes.any,
    isDropAllowed: PropTypes.bool
};
