import React from 'react';
import PropTypes from 'prop-types';
import {useTranslation} from 'react-i18next';
import {Input} from '@jahia/design-system-kit';
import {Dropdown, Typography} from '@jahia/moonstone';
import styles from './BasicSearch.scss';
import SearchLocation from '../SearchLocation';
import {findSelectedContentType} from './BasicSearch.utils';

export const BasicSearch = ({searchForm: {searchPath, searchTerms, searchContentType}, searchFormSetters: {setSearchPath, setSearchTerms, setSearchContentType}, contentTypeData, performSearch, isShowingOnlySearchInput}) => {
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
            {!isShowingOnlySearchInput &&
                <div className={styles.fieldset}>
                    <SearchLocation searchPath={searchPath} setSearchPath={setSearchPath}/>
                </div>}
            <div className={styles.fieldset}>
                <Typography variant="caption" weight="semiBold" className={styles.label}>
                    {t('label.contentManager.search.searchKeyword')}
                </Typography>
                <Input fullWidth
                       autoFocus
                       inputProps={{maxLength: 2000, 'data-sel-role': 'search-input-terms'}}
                       value={searchTerms}
                       placeholder={t('label.contentManager.search.normalPrompt')}
                       onChange={event => setSearchTerms(event.target.value)}
                       onKeyPress={event => {
                           const code = event.keyCode || event.which;

                           if (code === 13) {
                               performSearch();
                           }
                       }}
                />
            </div>
            {!isShowingOnlySearchInput &&
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
                              onChange={(e, item) => setSearchContentType(item.value)}
                    />
                </div>}
        </>
    );
};

BasicSearch.propTypes = {
    searchForm: PropTypes.object.isRequired,
    searchFormSetters: PropTypes.object.isRequired,
    contentTypeData: PropTypes.array.isRequired,
    performSearch: PropTypes.func.isRequired,
    isShowingOnlySearchInput: PropTypes.bool
};

BasicSearch.defaultProps = {
    isShowingOnlySearchInput: false
};

export default BasicSearch;
