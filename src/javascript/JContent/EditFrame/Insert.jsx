import clsx from 'clsx';
import styles from '~/JContent/EditFrame/Box.scss';
import PropTypes from 'prop-types';
import React from 'react';

export const Insert = ({relative}) => {
    const style = {...relative.position, height: '2px'};

    if (relative.insertPosition === 'insertAfter') {
        style.top = relative.position.top + relative.position.height;
    }

    return (
        <div className={clsx(styles.root, styles.horizontalInsert)} style={style}/>
    );
};

Insert.propTypes = {
    relative: PropTypes.object
};
