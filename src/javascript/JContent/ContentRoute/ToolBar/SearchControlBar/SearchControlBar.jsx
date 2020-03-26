import React from 'react';
import PropTypes from 'prop-types';
import {useTranslation} from 'react-i18next';
import {cmGoto, cmSetPath} from '../../../JContent.redux';
import {Button} from '@jahia/design-system-kit';
import {Close, Search} from '@material-ui/icons';
import * as _ from 'lodash';
import {VirtualsiteIcon} from '@jahia/icons';
import JContentConstants from '~/JContent/JContent.constants';
import {useSelector, useDispatch} from 'react-redux';
import styles from './SearchControlBar.scss';
import {Typography} from '@jahia/moonstone';

export const SearchControlBar = ({showActions}) => {
    const {t} = useTranslation('jcontent');
    const dispatch = useDispatch();

    const clearSearch = searchParams => {
        searchParams = _.clone(searchParams);
        _.unset(searchParams, 'searchContentType');
        _.unset(searchParams, 'searchTerms');
        _.unset(searchParams, 'sql2SearchFrom');
        _.unset(searchParams, 'sql2SearchWhere');
        dispatch(cmGoto({mode: JContentConstants.mode.PAGES, params: searchParams}));
    };

    const {siteKey, path, searchTerms, searchContentType, sql2SearchFrom, sql2SearchWhere} = useSelector(state => ({
        siteKey: state.site,
        path: state.jcontent.path,
        searchTerms: state.jcontent.params.searchTerms,
        searchContentType: state.jcontent.params.searchContentType,
        sql2SearchFrom: state.jcontent.params.sql2SearchFrom,
        sql2SearchWhere: state.jcontent.params.sql2SearchWhere
    }));
    let siteRootPath = '/sites/' + siteKey;
    const params = {
        searchContentType: searchContentType,
        searchTerms: searchTerms,
        sql2SearchFrom: sql2SearchFrom,
        sql2SearchWhere: sql2SearchWhere
    };

    return (
        <React.Fragment>
            <Search fontSize="small"/>
            <Typography variant="body">{t('jcontent:label.contentManager.search.searchPath', {path: path})}</Typography>
            <div className={`${styles.grow}`}/>
            {showActions && (path !== siteRootPath) &&
            <Button
                data-cm-role="search-all"
                variant="ghost"
                onClick={() => dispatch(cmSetPath(siteRootPath))}
            >
                <VirtualsiteIcon/>
                {t('jcontent:label.contentManager.search.searchEverywhere', {site: siteKey})}
            </Button>}
            {showActions &&
            <Button
                data-sel-role="search-clear"
                variant="ghost"
                onClick={() => clearSearch(params)}
            >
                <Close/>
                {t('jcontent:label.contentManager.search.clear')}
            </Button>}
        </React.Fragment>
    );
};

SearchControlBar.propTypes = {
    showActions: PropTypes.bool.isRequired
};

export default SearchControlBar;
