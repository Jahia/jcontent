import React from 'react';
import {Dropdown, SearchContextInput} from '@jahia/moonstone';
import {registry} from '@jahia/ui-extender';
import {useTranslation} from 'react-i18next';
import PropTypes from 'prop-types';

import {Constants} from '~/ContentEditor/SelectorTypes/Picker/Picker.constants';
import styles from '../selectors.scss';

export const UserSearch = ({siteKey, setPickerMode, searchPath, setSearchPath, searchTerms, setSearchTerms}) => {
    const {t} = useTranslation('jcontent');

    const accordionConfig = registry.get(Constants.ACCORDION_ITEM_NAME, 'picker-user') || {};
    const searchContextData = accordionConfig.getSearchContextData({t, currentSite: siteKey});
    const currentSearchContext = searchContextData.find(value => value.searchPath === searchPath) || searchContextData[0];

    const handleChangeTerms = e => {
        const val = e.target.value;
        if (val === '') {
            handleClearTerms();
        } else {
            setPickerMode(Constants.mode.SEARCH);
            setSearchTerms(val);
        }
    };

    const handleClearTerms = () => {
        setPickerMode('picker-user');
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
    setPickerMode: PropTypes.func,
    searchPath: PropTypes.string,
    setSearchPath: PropTypes.func,
    searchTerms: PropTypes.string,
    setSearchTerms: PropTypes.func
};
