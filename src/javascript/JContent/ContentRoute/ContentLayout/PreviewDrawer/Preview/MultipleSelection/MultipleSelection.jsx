import React from 'react';
import classNames from 'clsx';
import {Paper} from '@material-ui/core';
import {useDispatch} from 'react-redux';
import {cmClearSelection} from '~/JContent/redux/selection.redux';
import {useTranslation} from 'react-i18next';
import {Button, Copy, Typography} from '@jahia/moonstone';
import {useSidePanelContext} from '~/ContentEditor/editorTabs/EditPanelContent/SidePanel';

import styles from '../Preview.scss';

const MultipleSelection = () => {
    const {selection} = useSidePanelContext();
    const {t} = useTranslation('jcontent');
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

export default MultipleSelection;
