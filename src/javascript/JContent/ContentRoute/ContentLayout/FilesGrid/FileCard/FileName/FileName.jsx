import React from 'react';
import PropTypes from 'prop-types';
import {isMarkedForDeletion} from '~/JContent/JContent.utils';
import {Typography} from '@jahia/moonstone';
import styles from './FileName.scss';
import clsx from 'clsx';

export const FileName = ({node}) => {
    const name = node.title === null ? node.displayName : node.title.value;
    const sysName = node.name;

    return (
        <div className={styles.container}>
            <Typography isNowrap
                        variant="subheading"
                        weight="bold"
                        title={name}
                        className={isMarkedForDeletion(node) && clsx(styles.isDeleted)}
                        data-cm-role="grid-content-list-card-name"
            >
                {name}
            </Typography>
            {name !== sysName &&
                <Typography isNowrap
                            variant="caption"
                            title={sysName}
                            className={isMarkedForDeletion(node) ? clsx(styles.isDeleted, styles.textSubheading) : clsx(styles.textSubheading)}
                >
                    {sysName}
                </Typography>}
        </div>
    );
};

FileName.propTypes = {
    node: PropTypes.object.isRequired
};

export default FileName;
