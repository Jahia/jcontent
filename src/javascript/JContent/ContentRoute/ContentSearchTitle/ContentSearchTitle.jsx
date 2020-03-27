import React from 'react';
import classnames from 'clsx';
import {Typography, Button} from '@jahia/moonstone';
import ArrowLeft from '@jahia/moonstone/dist/icons/ArrowLeft';
import styles from './ContentSearchTitle.scss';
import {useTranslation} from 'react-i18next';
import {useDispatch} from 'react-redux';
import {cmGoto} from '../../JContent.redux';
import JContentConstants from '../../JContent.constants';

const ContentSearchTitle = () => {
    const {t} = useTranslation();
    const dispatch = useDispatch();

    const clearSearchFunc = () => {
        dispatch(cmGoto({mode: JContentConstants.mode.PAGES, params: {}}));
    };

    return (
        <div className={classnames(styles.root, 'alignCenter')}>
            <Button className={styles.buttonMargin} icon={<ArrowLeft/>} onClick={clearSearchFunc}/>
            <Typography variant="title">
                {t('jcontent:label.contentManager.title.search')}
            </Typography>
        </div>
    );
};

export default ContentSearchTitle;
