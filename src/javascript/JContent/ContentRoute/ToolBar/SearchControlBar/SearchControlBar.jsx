import React, {useMemo} from 'react';
import styles from './SearchControlBar.scss';
import {Separator, Chip} from '@jahia/moonstone';
import Edit from '@jahia/moonstone/dist/icons/Edit';
import {useSelector} from 'react-redux';
import {DisplayAction} from '@jahia/ui-extender';
import {getButtonRenderer} from '~/utils/getButtonRenderer';
import JContentConstants from '../../../JContent.constants';
import {useTranslation} from 'react-i18next';
import {useNodeInfo} from '@jahia/data-helper';

const ButtonRenderer = getButtonRenderer();

const extractJCRType = function (from) {
    if (from) {
        const match = from.match(/(\[.*\])/);

        if (match) {
            return match[0].replace(/[\[|\]]/g, '');
        }
    }

    return '';
};

export const SearchControlBar = () => {
    const {t} = useTranslation();
    const {path, mode, from, language, searchPath} = useSelector(state => ({
        path: state.jcontent.path,
        site: state.site,
        mode: state.jcontent.mode,
        from: state.jcontent.params.sql2SearchFrom,
        searchPath: state.jcontent.params.searchPath,
        language: state.language
    }));

    const type = useMemo(() => {
        return extractJCRType(from);
    }, [from]);

    const nodeInfo = useNodeInfo({path: searchPath, language: language}, {getDisplayName: true});
    const location = nodeInfo.node ? nodeInfo.node.displayName : '';

    const advancedSearchMode = mode === JContentConstants.mode.SQL2SEARCH;

    return (
        <React.Fragment>
            <DisplayAction actionKey="search" context={{path, buttonLabel: 'Edit query', buttonIcon: <Edit/>}} render={ButtonRenderer} variant="ghost" data-sel-role="open-search-dialog"/>
            <Separator variant="vertical" invisible="firstOrLastChild"/>
            {advancedSearchMode &&
            <>
                <Chip className={styles.chipMargin} label={t('jcontent:label.contentManager.search.advancedOn')}/>
                <Chip className={styles.chipMargin} label={t('jcontent:label.contentManager.search.advancedSearchOnType', {type: type})}/>
            </>}
            {!advancedSearchMode && <Chip className={styles.chipMargin} label={t('jcontent:label.contentManager.search.advancedSearchOnType', {type: 'Designer'})}/>}
            <Chip className={styles.chipMargin} label={t('jcontent:label.contentManager.search.location', {siteName: location})}/>
            <div className={`${styles.grow}`}/>
        </React.Fragment>
    );
};

export default SearchControlBar;
