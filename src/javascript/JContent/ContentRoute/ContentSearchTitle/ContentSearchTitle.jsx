import React from 'react';
import classnames from 'clsx';
import {ArrowLeft, Button, Typography} from '@jahia/moonstone';
import styles from './ContentSearchTitle.scss';
import {useTranslation} from 'react-i18next';
import {useDispatch, useSelector} from 'react-redux';
import {cmGoto} from '~/JContent/JContent.redux';
import JContentConstants from '~/JContent/JContent.constants';
import SearchInput from '../SearchInput';

const ContentSearchTitle = () => {
    const {t} = useTranslation('jcontent');
    const dispatch = useDispatch();
    const {mode, preSearchModeMemo} = useSelector(state => ({
        mode: state.jcontent.mode,
        preSearchModeMemo: state.jcontent.preSearchModeMemo
    }));
    const title = t('label.contentManager.title.search');

    const clearSearchFunc = () => {
        dispatch(cmGoto({mode: preSearchModeMemo ? preSearchModeMemo : JContentConstants.mode.PAGES, params: {}}));
    };

    return (
        <div className={classnames(styles.root, 'alignCenter')}>
            <Button className={styles.buttonMargin} icon={<ArrowLeft/>} onClick={clearSearchFunc}/>
            <Typography variant="title">
                {title}
            </Typography>
            <div className={classnames(styles.rightPanel)}>
                {JContentConstants.mode.SEARCH === mode && <SearchInput/>}
            </div>
        </div>
    );
};

export default ContentSearchTitle;
