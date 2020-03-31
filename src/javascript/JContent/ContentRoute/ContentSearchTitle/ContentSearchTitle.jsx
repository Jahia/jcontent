import React from 'react';
import classnames from 'clsx';
import {Typography, Button} from '@jahia/moonstone';
import ArrowLeft from '@jahia/moonstone/dist/icons/ArrowLeft';
import styles from './ContentSearchTitle.scss';
import {useTranslation} from 'react-i18next';
import {useDispatch, useSelector} from 'react-redux';
import {cmGoto} from '../../JContent.redux';
import JContentConstants from '../../JContent.constants';
import SearchInput from '../SearchInput';

const ContentSearchTitle = () => {
    const {t} = useTranslation();
    const dispatch = useDispatch();
    const {mode} = useSelector(state => ({
        mode: state.jcontent.mode
    }));

    const clearSearchFunc = () => {
        dispatch(cmGoto({mode: JContentConstants.mode.PAGES, params: {}}));
    };

    return (
        <div className={classnames(styles.root, 'alignCenter')}>
            <Button className={styles.buttonMargin} icon={<ArrowLeft/>} onClick={clearSearchFunc}/>
            <Typography variant="title">
                {t('jcontent:label.contentManager.title.search')}
            </Typography>
            <div className={classnames(styles.rightPanel)}>
                {JContentConstants.mode.SEARCH === mode && <SearchInput clearSearch={clearSearchFunc}/>}
            </div>
        </div>
    );
};

export default ContentSearchTitle;
