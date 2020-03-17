import React, {useState} from 'react';
import {Button, Separator, Typography} from '@jahia/moonstone';
import {Dialog} from '@material-ui/core';
import {useDispatch, useSelector} from 'react-redux';
import PropTypes from 'prop-types';
import {useTranslation} from 'react-i18next';
import styles from './SearchDialog.scss';
import AdvancedSearch from './AdvancedSearch';
import {cmSetSearchMode, cmGoto} from '~/JContent/JContent.redux';
import {
    Close,
    Search
} from '@jahia/moonstone/dist/icons';
import {BasicSearch} from './BasicSearch/BasicSearch';
import JContentConstants from '~/JContent/JContent.constants';

const isAdvancedSearch = searchMode => searchMode === JContentConstants.searchMode.ADVANCED;

const SearchDialog = ({open, handleClose}) => {
    const {t} = useTranslation('jcontent');
    const dispatch = useDispatch();

    const {params, searchMode, path} = useSelector(state => ({
        params: state.jcontent.params,
        searchMode: state.jcontent.searchMode,
        path: state.jcontent.path
    }));

    const [searchPath, setSearchPath] = useState(searchPath ? searchPath : (params.searchPath ? params.searchPath : path));
    const [searchTerms, setSearchTerms] = useState(searchTerms ? searchTerms : (params.searchTerms ? params.searchTerms : ''));
    const [searchContentType, setSearchContentType] = useState(searchContentType ? searchContentType : (params.searchContentType ? params.searchContentType : ''));

    const searchLabel = t('label.contentManager.search.search');

    const handleSearchChanges = (key, value) => {
        if (key === 'searchPath') {
            setSearchPath(value);
        }

        if (key === 'searchTerms') {
            setSearchTerms(value);
        }

        if (key === 'searchContentType') {
            setSearchContentType(value);
        }
    };

    const performSearch = () => {
        let mode;
        let searchParams;
        if (isAdvancedSearch(searchMode)) {
            searchParams = {};
            mode = JContentConstants.mode.SQL2SEARCH;
        } else {
            searchParams = {
                searchPath: searchPath,
                searchTerms: searchTerms,
                searchContentType: searchContentType
            };
            mode = JContentConstants.mode.SEARCH;
        }

        dispatch(cmGoto({mode, params: searchParams}));
        handleClose();
    };

    const toggleAdvancedSearch = () => {
        dispatch(cmSetSearchMode(isAdvancedSearch(searchMode) ? JContentConstants.searchMode.BASIC : JContentConstants.searchMode.ADVANCED));
    };

    return (
        <Dialog open={open} onClose={handleClose}>
            <div className={styles.dialogTitle}>
                <Typography isUpperCase variant="subheading">
                    {searchLabel}
                </Typography>

                <Button label={isAdvancedSearch(searchMode) ? t('label.contentManager.search.normal') : t('label.contentManager.search.sql2')}
                        variant="ghost"
                        data-cm-role="search-type-sql2search"
                        onClick={toggleAdvancedSearch}/>
            </div>
            <Separator/>
            <div className={styles.dialogContent}>
                {!isAdvancedSearch(searchMode) &&
                <BasicSearch searchPath={searchPath}
                             searchTerms={searchTerms}
                             searchContentType={searchContentType}
                             handleSearchChanges={handleSearchChanges}
                             performSearch={performSearch}
                />}
                {isAdvancedSearch(searchMode) &&
                <AdvancedSearch searchPath={searchPath}
                                handleSearchChanges={handleSearchChanges}
                />}
            </div>
            <Separator/>
            <div className={styles.dialogActions}>
                <Button variant="outlined"
                        size="big"
                        icon={<Close/>}
                        label={t('label.contentManager.search.modal.cancel')}
                        onClick={() => handleClose()}/>
                <Button size="big"
                        icon={<Search/>}
                        color="accent"
                        label={searchLabel}
                        onClick={() => performSearch()}/>
            </div>
        </Dialog>
    );
};

SearchDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    handleClose: PropTypes.func.isRequired
};

export default SearchDialog;
