import React from 'react';
import {Button, Separator, Typography} from '@jahia/moonstone';
import {Dialog} from '@material-ui/core';
import PropTypes from 'prop-types';
import {useTranslation} from 'react-i18next';
import styles from './SearchDialog.scss';
import AdvancedSearch from './AdvancedSearch';
import {
    Close,
    Search
} from '@jahia/moonstone/dist/icons';
import BasicSearch from './BasicSearch';

const SearchDialog = ({searchPath, searchTerms, searchContentType, isOpen, isAdvancedSearch, toggleAdvancedSearch, performSearch, handleSearchChanges, handleClose}) => {
    const {t} = useTranslation('jcontent');

    return (
        <Dialog open={isOpen} onClose={handleClose}>
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
    searchPath: PropTypes.string.isRequired,
    searchTerms: PropTypes.string.isRequired,
    searchContentType: PropTypes.string.isRequired,
    isOpen: PropTypes.bool.isRequired,
    isAdvancedSearch: PropTypes.bool.isRequired,
    toggleAdvancedSearch: PropTypes.func.isRequired,
    performSearch: PropTypes.func.isRequired,
    handleSearchChanges: PropTypes.func.isRequired,
    handleClose: PropTypes.func.isRequired
};

export default SearchDialog;
