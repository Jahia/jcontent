import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'clsx';
import {Paper} from '@material-ui/core';
import {useDispatch} from 'react-redux';
import {cmClearSelection} from '../../../contentSelection.redux';
import {useTranslation} from 'react-i18next';
import {Button, Copy, Typography} from '@jahia/moonstone';

import styles from '../Preview.scss';

const MultipleSelection = ({selection}) => {
    const {t} = useTranslation();
    const dispatch = useDispatch();

    return (
        <div className={classNames(styles.noPreviewContainer, styles.contentContainer)}>
            <Paper elevation={1} className={styles.contentContainer} classes={{root: styles.center}}>
                <Typography variant="heading" weight="light">
                    {t('jcontent:label.contentManager.selection.itemsSelected', {count: selection.length})}
                </Typography>
                <Copy className={styles.centerIcon} size="big"/>
                <Button className={styles.centerIcon} label={t('jcontent:label.contentManager.selection.clearMultipleSelection')} onClick={() => dispatch(cmClearSelection())}/>
            </Paper>
        </div>
    );
};

MultipleSelection.propTypes = {
    selection: PropTypes.array.isRequired
};

export default MultipleSelection;
