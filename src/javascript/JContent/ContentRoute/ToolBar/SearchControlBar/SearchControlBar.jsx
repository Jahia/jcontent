import React from 'react';
import styles from './SearchControlBar.scss';
import {Chip, Edit, Separator} from '@jahia/moonstone';
import {shallowEqual, useSelector} from 'react-redux';
import {DisplayAction} from '@jahia/ui-extender';
import {ButtonRenderer} from '~/utils/getButtonRenderer';
import JContentConstants from '~/JContent/JContent.constants';
import {useTranslation} from 'react-i18next';
import {useNodeInfo} from '@jahia/data-helper';

export const SearchControlBar = () => {
    const {t} = useTranslation();
    const {path, mode, from, language, searchPath, searchContentType} = useSelector(state => ({
        path: state.jcontent.path,
        site: state.site,
        mode: state.jcontent.mode,
        from: state.jcontent.params.sql2SearchFrom,
        searchContentType: state.jcontent.params.searchContentType,
        searchPath: state.jcontent.params.searchPath,
        language: state.language
    }), shallowEqual);

    const nodeInfo = useNodeInfo({path: searchPath, language: language}, {getDisplayName: true});
    const location = nodeInfo.node ? nodeInfo.node.displayName : '';

    const advancedSearchMode = mode === JContentConstants.mode.SQL2SEARCH;

    let typeInfo;
    if (advancedSearchMode) {
        typeInfo = from;
    } else {
        typeInfo = searchContentType === '' ? t('jcontent:label.contentManager.search.anyContent') : searchContentType;
    }

    return (
        <React.Fragment>
            <DisplayAction actionKey="search" path={path} buttonLabel="Edit query" buttonIcon={<Edit/>} render={ButtonRenderer} buttonProps={{variant: 'ghost'}} data-sel-role="open-search-dialog"/>
            <Separator variant="vertical" invisible="firstOrLastChild"/>
            {advancedSearchMode &&
            <>
                <Chip className={styles.chipMargin} label={t('jcontent:label.contentManager.search.advancedOn')}/>
                <Chip className={styles.chipMargin} label={t('jcontent:label.contentManager.search.advancedSearchOnType', {type: typeInfo})}/>
            </>}
            {!advancedSearchMode && <Chip className={styles.chipMargin} label={t('jcontent:label.contentManager.search.advancedSearchOnType', {type: typeInfo})}/>}
            <Chip className={styles.chipMargin} label={t('jcontent:label.contentManager.search.location', {siteName: location})}/>
            <div className={`${styles.grow}`}/>
        </React.Fragment>
    );
};

export default SearchControlBar;
