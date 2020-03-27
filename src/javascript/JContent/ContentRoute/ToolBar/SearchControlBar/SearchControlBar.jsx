import React from 'react';
import styles from './SearchControlBar.scss';
import {Separator, Chip} from '@jahia/moonstone';
import Edit from '@jahia/moonstone/dist/icons/Edit';
import {useSelector} from 'react-redux';
import {DisplayAction} from '@jahia/ui-extender';
import {getButtonRenderer} from '~/utils/getButtonRenderer';
import JContentConstants from '../../../JContent.constants';
import {useTranslation} from 'react-i18next';

const ButtonRenderer = getButtonRenderer();

export const SearchControlBar = () => {
    const {t} = useTranslation();
    const {path, mode} = useSelector(state => ({
        path: state.jcontent.path,
        site: state.site,
        mode: state.jcontent.mode
    }));

    const advancedSearchMode = mode === JContentConstants.mode.SQL2SEARCH;

    return (
        <React.Fragment>
            <DisplayAction actionKey="search" context={{path, buttonLabel: 'Edit query', buttonIcon: <Edit/>}} render={ButtonRenderer} variant="ghost" data-sel-role="open-search-dialog"/>
            <Separator variant="vertical" invisible="firstOrLastChild"/>
            {advancedSearchMode &&
            <>
                <Chip className={styles.chipMargin} label={t('jcontent:label.contentManager.search.advancedOn')}/>
                <Chip className={styles.chipMargin} label={t('jcontent:label.contentManager.search.advancedSearchOnType', {type: 'Designer'})}/>
            </>}
            <Chip className={styles.chipMargin} label={t('jcontent:label.contentManager.search.location', {siteName: window.contextJsParameters.siteName})}/>
            <div className={`${styles.grow}`}/>
        </React.Fragment>
    );
};

export default SearchControlBar;
