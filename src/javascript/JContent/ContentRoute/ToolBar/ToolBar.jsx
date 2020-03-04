import React from 'react';
import {Typography} from '@jahia/design-system-kit';
import {useSelector} from 'react-redux';
import JContentConstants from '~/JContent/JContent.constants';
import SearchControlBar from './SearchControlBar';
import BrowseControlBar from './BrowseControlBar';
import {DisplayActions} from '@jahia/ui-extender';
import {useTranslation} from 'react-i18next';
import {getButtonRenderer} from '~/utils/getButtonRenderer';
import styles from './Toolbar.scss';

export const ToolBar = () => {
    const {t} = useTranslation();

    const {mode, selection} = useSelector(state => ({
        mode: state.jcontent.mode,
        selection: state.jcontent.selection
    }));

    return (
        <div className={`flexRow ${styles.root}`}>
            {(mode === JContentConstants.mode.SEARCH || mode === JContentConstants.mode.SQL2SEARCH) ?
                <SearchControlBar showActions={selection.length === 0}/> :
                <BrowseControlBar showActions={selection.length === 0}/>}
            {selection.length > 0 &&
            <React.Fragment>
                <Typography variant="caption" data-cm-role="selection-infos" data-cm-selection-size={selection.length}>
                    {t('jcontent:label.contentManager.selection.itemsSelected', {count: selection.length})}
                </Typography>
                <div className={styles.spacer}/>
                <DisplayActions
                    target="selectedContentActions"
                    context={{paths: selection}}
                    render={getButtonRenderer({size: 'small', variant: 'ghost'})}
                />
            </React.Fragment>}
        </div>
    );
};

export default ToolBar;
