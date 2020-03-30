import React from 'react';
import PropTypes from 'prop-types';
import {Trans} from 'react-i18next';
import styles from './AdvancedSearch.scss';
import SearchLocation from '../SearchLocation';
import {Typography} from '@jahia/moonstone';
import {Input} from '@jahia/design-system-kit';

export const Sql2Input = ({cmRole, maxLength, onChange, onSearch, size, style, value}) => {
    const onKeyDown = e => {
        if (e.key === 'Enter') {
            onSearch();
        }
    };

    return (
        <Input fullWidth
               inputProps={{maxLength: maxLength, size: size, 'data-cm-role': cmRole}}
               value={value}
               style={style}
               onChange={onChange}
               onKeyDown={onKeyDown}
        />
    );
};

Sql2Input.propTypes = {
    cmRole: PropTypes.string.isRequired,
    maxLength: PropTypes.number.isRequired,
    onChange: PropTypes.func.isRequired,
    onSearch: PropTypes.func.isRequired,
    size: PropTypes.number,
    style: PropTypes.object,
    value: PropTypes.string.isRequired
};

export const AdvancedSearch = ({searchForm: {searchPath, sql2SearchFrom, sql2SearchWhere}, searchFormSetters: {setSearchPath, setSql2SearchFrom, setSql2SearchWhere}, performSearch}) => {
    const onKeyPress = e => {
        const code = e.keyCode || e.which;

        if (code === 13) {
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
                <Input fullWidth
                       inputProps={{maxLength: 100, size: 15, 'data-sel-role': 'search-input-from'}}
                       value={sql2SearchFrom}
                       onChange={event => {
                           setSql2SearchFrom(event.target.value);
                       }}
                       onKeyPress={onKeyPress}
                />
            </div>
            <div className={styles.fieldset}>
                <Typography variant="caption" weight="semiBold" className={styles.label}>WHERE
                    ISDESCENDANTNODE(&apos;{searchPath}&apos;) AND
                </Typography>
                <Input fullWidth
                       inputProps={{maxLength: 2000, 'data-sel-role': 'search-input-where'}}
                       value={sql2SearchWhere}
                       onChange={event => {
                           setSql2SearchWhere(event.target.value);
                       }}
                       onKeyPress={onKeyPress}
                />

                <Typography variant="caption" className={styles.academyLink}>
                    <Trans i18nKey="jcontent:label.contentManager.search.sql2Prompt"
                           components={[
                               <a key="sql2Prompt"
                                  href={window.contextJsParameters.config.links.sql2CheatSheet}
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
