import React from 'react';
import {Dropdown, SearchContextInput} from '@jahia/moonstone';
import {registry} from '@jahia/ui-extender';
import {useTranslation} from 'react-i18next';
import PropTypes from 'prop-types';

import {Constants} from '~/ContentEditor/SelectorTypes/Picker/Picker.constants';
import styles from '../selectors.scss';

export const UserSearch = ({siteKey, searchPath, setSearchPath, searchTerms, setSearchTerms}) => {
    const {t} = useTranslation('jcontent');

    const accordionConfig = registry.get(Constants.ACCORDION_ITEM_NAME, 'picker-user') || {};
    const searchContextData = accordionConfig.getSearchContextData({t, currentSite: siteKey});
    const currentSearchContext = searchContextData.find(value => value.searchPath === searchPath) || searchContextData[0];

    // Keep the 'picker-user' mode so the optimized user search endpoint handles the term in place,
    // rather than falling back to the generic full-text 'picker-search' handler.
    const handleChangeTerms = e => {
        const val = e.target.value;
        if (val === '') {
            handleClearTerms();
        } else {
            setSearchTerms(val);
        }
    };

    const handleClearTerms = () => {
        setSearchTerms('');
    };

    const handleChangeContext = (e, item) => {
        setSearchPath(item.searchPath);
    };

    return (
        <SearchContextInput
            data-sel-role="user-selector-search"
            searchContext={<Dropdown data={searchContextData}
                                     value={currentSearchContext.searchPath}
                                     label={currentSearchContext.label}
                                     icon={currentSearchContext.iconStart}
                                     onChange={handleChangeContext}/>}
            size="big"
            value={searchTerms}
            className={styles.userSearchInput}
            onChange={e => handleChangeTerms(e)}
            onClear={e => handleClearTerms(e)}
        />
    );
};

UserSearch.propTypes = {
    siteKey: PropTypes.string,
    searchPath: PropTypes.string,
    setSearchPath: PropTypes.func,
    searchTerms: PropTypes.string,
    setSearchTerms: PropTypes.func
};
