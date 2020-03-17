import React from 'react';
import PropTypes from 'prop-types';
import {useTranslation} from 'react-i18next';
import {useSelector} from 'react-redux';
import {Input} from '@jahia/design-system-kit';
import {Typography, Dropdown, ImgWrapper} from '@jahia/moonstone';
import styles from './BasicSearch.scss';
import SearchLocation from '../SearchLocation';
import {useQuery} from '@apollo/react-hooks';
import gql from 'graphql-tag';

const SiteContentTypesQuery = gql`
    query SiteContentTypesQuery($siteKey: String!, $language:String!) {
        jcr {
            nodeTypes(filter: {includeMixins: false, siteKey: $siteKey, includeTypes: ["jmix:editorialContent", "jnt:page", "jnt:file"], excludeTypes: ["jmix:studioOnly", "jmix:hiddenType", "jnt:editableFile"]}) {
                nodes {
                    name
                    displayName(language: $language)
                    icon
                }
            }
        }
    }
`;

export const BasicSearch = ({searchPath, searchTerms, searchContentType, handleSearchChanges, performSearch}) => {
    const {t} = useTranslation('jcontent');

    const {siteKey, language} = useSelector(state => ({
        siteKey: state.site,
        language: state.language,
        params: state.jcontent.params
    }));

    const {data, error, loading} = useQuery(SiteContentTypesQuery, {
        variables: {
            siteKey: siteKey,
            language: language
        }
    });

    if (error) {
        console.log(error);
    }

    const defaultContentType = {
        label: t('label.contentManager.search.allType'),
        value: ''
    };

    let contentTypeSelectData;
    let selectedContentType = defaultContentType;
    if (!loading && data?.jcr?.nodeTypes?.nodes) {
        contentTypeSelectData = [defaultContentType].concat(data.jcr.nodeTypes.nodes.map(item => {
            return {
                label: `${item.displayName} (${item.name})`,
                value: item.name,
                iconStart: <ImgWrapper src={item.icon + '.png'}/>
            };
        }));

        if (searchContentType) {
            selectedContentType = contentTypeSelectData.find(item => {
                if (item.value === searchContentType) {
                    return item;
                }

                return null;
            });
        }
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
                       inputProps={{maxLength: 2000, 'data-cm-role': 'search-input-term'}}
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
                {contentTypeSelectData &&
                    <>
                        <Typography variant="caption" weight="semiBold" className={styles.label}>
                            {t('label.contentManager.search.type')}
                        </Typography>
                        <Dropdown data={contentTypeSelectData}
                                  size="medium"
                                  icon={selectedContentType && selectedContentType.iconStart}
                                  label={selectedContentType && selectedContentType.label}
                                  value={searchContentType}
                                  className={styles.dropdown}
                                  onChange={(e, item) => handleSearchChanges('searchContentType', item.value)}
                        />
                    </>}
            </div>
        </>
    );
};

BasicSearch.propTypes = {
    searchPath: PropTypes.string.isRequired,
    searchTerms: PropTypes.string.isRequired,
    searchContentType: PropTypes.string.isRequired,
    handleSearchChanges: PropTypes.func.isRequired,
    performSearch: PropTypes.func.isRequired
};

export default BasicSearch;
