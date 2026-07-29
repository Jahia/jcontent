import React from 'react';
import PropTypes from 'prop-types';
import {Trans, useTranslation} from 'react-i18next';
import styles from './AdvancedSearch.scss';
import SearchLocation from '../SearchLocation';
import {Input, Typography} from '@jahia/moonstone';

export const AdvancedSearch = ({
    searchForm: {searchPath, sql2SearchFrom, sql2SearchWhere},
    searchFormSetters: {setSearchPath, setSql2SearchFrom, setSql2SearchWhere}, performSearch
}) => {
    const {t} = useTranslation('jcontent');
    const onKeyDown = e => {
        if (e.key === 'Enter') {
            performSearch();
        }
    };

    return (
        <>
            <div className={styles.fieldset}>
                <SearchLocation searchPath={searchPath} setSearchPath={setSearchPath}/>
            </div>
            <div className={styles.fieldset}>
                <Typography variant="caption" weight="semiBold" className={styles.label}>SELECT * FROM</Typography>
                <Input className={styles.fullWidth}
                       name="sql2SearchFrom"
                       maxLength={100}
                       placeholder={t('label.contentManager.search.placeholders.sql2SearchFrom')}
                       data-sel-role="search-input-from"
                       value={sql2SearchFrom}
                       onChange={event => {
                           setSql2SearchFrom(event.target.value);
                       }}
                       onKeyDown={onKeyDown}
                />
            </div>
            <div className={styles.fieldset}>
                <Typography variant="caption" weight="semiBold" className={styles.label}>WHERE
                    ISDESCENDANTNODE(&apos;{searchPath}&apos;) AND
                </Typography>
                <Input className={styles.fullWidth}
                       name="sql2SearchWhere"
                       maxLength={2000}
                       placeholder={t('label.contentManager.search.placeholders.sql2SearchWhere')}
                       data-sel-role="search-input-where"
                       value={sql2SearchWhere}
                       onChange={event => {
                           setSql2SearchWhere(event.target.value);
                       }}
                       onKeyDown={onKeyDown}
                />

                <Typography variant="caption" className={styles.academyLink}>
                    <Trans i18nKey="jcontent:label.contentManager.search.sql2Prompt"
                           components={[
                               <a key="sql2Prompt"
                                  href="https://academy.jahia.com/documentation/jahia-cms/jahia-8.2/developer/leveraging-jahia-backend-capabilities/jcrsql2-query-cheat-sheet"
                                  target="_blank"
                                  rel="noopener noreferrer"
                               >
                                   univers
                               </a>
                           ]}
                    />
                </Typography>
            </div>
        </>
    );
};

AdvancedSearch.propTypes = {
    searchForm: PropTypes.object.isRequired,
    searchFormSetters: PropTypes.object.isRequired,
    performSearch: PropTypes.func.isRequired
};

export default AdvancedSearch;
