import React from 'react';
import classnames from 'clsx';
import PropTypes from 'prop-types';
import {Typography} from '@jahia/moonstone';
import styles from './ContentTitle.scss';

const ContentTitle = ({title}) => (
    <div className={classnames(styles.root, 'alignCenter')}>
        <Typography variant="page">
            {title}
        </Typography>
    </div>
);

ContentTitle.propTypes = {
    title: PropTypes.string.isRequired
};

export default ContentTitle;
