import React from 'react';
import PropTypes from 'prop-types';
import {useTranslation} from 'react-i18next';
import {Input} from '@jahia/design-system-kit';
import {Typography, Dropdown} from '@jahia/moonstone';
import styles from './BasicSearch.scss';
import SearchLocation from '../SearchLocation';
import {findSelectedContentType} from './BasicSearch.utils';

export const BasicSearch = ({searchPath, searchTerms, searchContentType, contentTypeData, handleSearchChanges, performSearch}) => {
    const {t} = useTranslation('jcontent');

    const defaultContentType = {
        label: t('label.contentManager.search.anyContent'),
        value: ''
    };

    let contentTypeSelectData = [defaultContentType].concat(contentTypeData);

    let selectedContentType = defaultContentType;
    if (searchContentType) {
        selectedContentType = findSelectedContentType(contentTypeData, searchContentType);
    }

    return (
        <>
            <div className={styles.fieldset}>
                <SearchLocation searchPath={searchPath} handleSearchChanges={handleSearchChanges}/>
            </div>
            <div className={styles.fieldset}>
                <Typography variant="caption" weight="semiBold" className={styles.label}>
                    {t('label.contentManager.search.searchKeyword')}
                </Typography>
                <Input fullWidth
                       autoFocus
                       inputProps={{maxLength: 2000, 'data-sel-role': 'search-input-terms'}}
                       value={searchTerms}
                       placeholder={t('label.contentManager.search.normalPrompt')}
                       onChange={event => handleSearchChanges('searchTerms', event.target.value)}
                       onKeyPress={event => {
                           const code = event.keyCode || event.which;

                           if (code === 13) {
                               performSearch();
                           }
                       }}
                />
            </div>
            <div className={styles.fieldset}>
                <Typography variant="caption" weight="semiBold" className={styles.label}>
                    {t('label.contentManager.search.type')}
                </Typography>
                <Dropdown data={contentTypeSelectData}
                          size="medium"
                          icon={selectedContentType && selectedContentType.iconStart}
                          label={selectedContentType && selectedContentType.label}
                          value={searchContentType}
                          className={styles.dropdown}
                          data-sel-role="content-type-dropdown"
                          onChange={(e, item) => handleSearchChanges('searchContentType', item.value)}
                />
            </div>
        </>
    );
};

BasicSearch.propTypes = {
    searchPath: PropTypes.string.isRequired,
    searchTerms: PropTypes.string.isRequired,
    searchContentType: PropTypes.string.isRequired,
    contentTypeData: PropTypes.array.isRequired,
    handleSearchChanges: PropTypes.func.isRequired,
    performSearch: PropTypes.func.isRequired
};

export default BasicSearch;
