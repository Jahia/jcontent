import clsx from 'clsx';
import styles from '~/JContent/EditFrame/Box2.scss';
import PropTypes from 'prop-types';
import React from 'react';

export const Insert = ({relative}) => {
    const style = {...relative.position};
    let className = styles.horizontalInsert;

    if (relative.insertPosition === 'insertBefore' || relative.insertPosition === 'top') {
        style.height = '2px';
    } else if (relative.insertPosition === 'insertAfter' || relative.insertPosition === 'bottom') {
        style.height = '2px';
        style.top = relative.position.top + relative.position.height;
    } else if (relative.insertPosition === 'left') {
        style.width = '2px';
        className = styles.verticalInsert;
    } else if (relative.insertPosition === 'right') {
        style.width = '2px';
        style.left = relative.position.left + relative.position.width;
        className = styles.verticalInsert;
    }

    return (
        <div className={clsx(styles.root, className)} style={style}/>
    );
};

Insert.propTypes = {
    relative: PropTypes.object
};
