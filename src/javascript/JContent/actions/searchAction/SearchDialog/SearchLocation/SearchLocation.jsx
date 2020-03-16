import React from 'react';
import {Typography} from '@jahia/moonstone';
import {Radio, RadioGroup} from '@material-ui/core';
import {FormControlLabel} from '@jahia/design-system-kit';
import styles from './SearchLocation.scss';
import {useNodeInfo, useSiteInfo} from '@jahia/data-helper';
import {useTranslation} from 'react-i18next';
import {useSelector} from 'react-redux';
import PropTypes from 'prop-types';

const SearchLocation = ({searchPath, handleSearchChanges}) => {
    const {t} = useTranslation('jcontent');

    const {path, siteKey, language} = useSelector(state => ({
        path: state.jcontent.path,
        siteKey: state.site,
        language: state.language
    }));

    const {node, loading: nodeLoading} = useNodeInfo({path: path, language: language}, {getDisplayName: true});
    const {siteInfo, loading} = useSiteInfo({siteKey, displayLanguage: language});

    return (
        <>
            {!nodeLoading && !loading && siteInfo && node &&
            <>
                <Typography variant="caption" weight="semiBold" className={styles.label}>
                    {t('label.contentManager.search.searchLocation')}
                </Typography>
                <RadioGroup aria-label="Search path"
                            name="searchPath"
                            value={searchPath}
                            onChange={event => {
                                handleSearchChanges('searchPath', event.target.value);
                            }}
                >
                    <FormControlLabel
                        className={styles.radioLabel}
                        value={siteInfo.path}
                        control={<Radio color="primary"/>}
                        label={t('label.contentManager.search.searchInWebsite', {siteName: siteInfo.displayName})}
                        labelPlacement="end"
                        color="alpha"
                    />
                    <FormControlLabel
                        className={styles.radioLabel}
                        value={path}
                        control={<Radio color="primary"/>}
                        label={t('label.contentManager.search.searchInCurrentLocation', {nodeName: node.displayName})}
                        labelPlacement="end"
                        color="alpha"
                    />
                </RadioGroup>
            </>}
        </>
    );
};

SearchLocation.propTypes = {
    searchPath: PropTypes.string.isRequired,
    handleSearchChanges: PropTypes.func.isRequired
};

export default SearchLocation;
