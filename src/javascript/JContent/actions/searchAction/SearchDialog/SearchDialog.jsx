import React, {useState} from 'react';
import {Button, Separator, Typography} from '@jahia/moonstone';
import {Dialog} from '@material-ui/core';
import {useDispatch, useSelector} from 'react-redux';
import PropTypes from 'prop-types';
import {useTranslation} from 'react-i18next';
import styles from './SearchDialog.scss';
import AdvancedSearch from './AdvancedSearch';
import {cmGoto} from '~/JContent/JContent.redux';
import {
    Close,
    Search
} from '@jahia/moonstone/dist/icons';
import {BasicSearch} from './BasicSearch/BasicSearch';
import JContentConstants from '~/JContent/JContent.constants';

const SearchDialog = ({open, handleClose}) => {
    const {t} = useTranslation('jcontent');
    const dispatch = useDispatch();

    const {params, mode, path} = useSelector(state => ({
        params: state.jcontent.params,
        mode: state.jcontent.mode,
        path: state.jcontent.path
    }));

    const [isAdvancedSearch, setIsAdvancedSearch] = useState(mode === JContentConstants.mode.SQL2SEARCH);
    const [searchPath, setSearchPath] = useState(searchPath ? searchPath : (params.searchPath ? params.searchPath : path));
    const [searchTerms, setSearchTerms] = useState(searchTerms ? searchTerms : (params.searchTerms ? params.searchTerms : ''));
    const [searchContentType, setSearchContentType] = useState(searchContentType ? searchContentType : (params.searchContentType ? params.searchContentType : ''));

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
        if (isAdvancedSearch) {
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
        setIsAdvancedSearch(!isAdvancedSearch);
    };

    return (
        <Dialog open={open} onClose={handleClose}>
            <div className={styles.dialogTitle}>
                <Typography isUpperCase variant="subheading">
                    {t('label.contentManager.title.search')}
                </Typography>

                <Button label={isAdvancedSearch ? t('label.contentManager.search.basic') : t('label.contentManager.search.advanced')}
                        variant="ghost"
                        data-cm-role="search-type-sql2search"
                        onClick={toggleAdvancedSearch}/>
            </div>
            <Separator/>
            <div className={styles.dialogContent}>
                {!isAdvancedSearch &&
                <BasicSearch searchPath={searchPath}
                             searchTerms={searchTerms}
                             searchContentType={searchContentType}
                             handleSearchChanges={handleSearchChanges}
                             performSearch={performSearch}
                />}
                {isAdvancedSearch &&
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
                        label={t('label.contentManager.search.search')}
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
