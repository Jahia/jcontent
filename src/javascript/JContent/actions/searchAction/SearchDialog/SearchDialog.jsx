import React from 'react';
import {Button, Close, Search, Separator, Typography} from '@jahia/moonstone';
import {Dialog, FormControlLabel, Switch} from '@material-ui/core';
import PropTypes from 'prop-types';
import {useTranslation} from 'react-i18next';
import styles from './SearchDialog.scss';
import AdvancedSearch from './AdvancedSearch';
import BasicSearch from './BasicSearch';

const SearchDialog = ({searchForm, searchFormSetters, isOpen, isAdvancedSearch, toggleAdvancedSearch, performSearch, handleClose, isShowingOnlySearchInput}) => {
    const {t} = useTranslation('jcontent');

    return (
        <Dialog open={isOpen} onClose={handleClose}>
            <div className={styles.dialogTitle}>
                <Typography isUpperCase variant="subheading">
                    {t('label.contentManager.title.search')}
                </Typography>
                {!isShowingOnlySearchInput &&
                    <div>
                        <Typography variant="caption">
                            {t('label.contentManager.search.advanced')}
                        </Typography>
                        <FormControlLabel control={
                            <Switch
                            checked={isAdvancedSearch}
                            color="primary"
                            data-sel-role="advanced-search-switch"
                            inputProps={{'aria-label': 'advancedSearchSwitch'}}
                            onChange={toggleAdvancedSearch}
                        />
}
                                          label={isAdvancedSearch ? 'On' : 'Off'}/>
                    </div>}
            </div>
            <Separator/>
            <div className={styles.dialogContent}>
                {isAdvancedSearch ?
                    <AdvancedSearch searchForm={searchForm}
                                    searchFormSetters={searchFormSetters}
                                    performSearch={performSearch}
                    /> :
                    <BasicSearch searchForm={searchForm}
                                 searchFormSetters={searchFormSetters}
                                 performSearch={performSearch}
                                 isShowingOnlySearchInput={isShowingOnlySearchInput}
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
                        data-sel-role="search-submit"
                        label={t('label.contentManager.search.search')}
                        onClick={() => performSearch()}/>
            </div>
        </Dialog>
    );
};

SearchDialog.propTypes = {
    searchForm: PropTypes.object.isRequired,
    searchFormSetters: PropTypes.object.isRequired,
    isOpen: PropTypes.bool.isRequired,
    isAdvancedSearch: PropTypes.bool.isRequired,
    toggleAdvancedSearch: PropTypes.func.isRequired,
    performSearch: PropTypes.func.isRequired,
    handleClose: PropTypes.func.isRequired,
    isShowingOnlySearchInput: PropTypes.bool.isRequired
};

export default SearchDialog;
