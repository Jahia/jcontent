import React from 'react';
import PropTypes from 'prop-types';
import {Typography} from '@jahia/moonstone';
import styles from './EmptyTable.scss';
import {useTranslation} from 'react-i18next';

const EmptyTable = ({text}) => {
    const {t} = useTranslation('jcontent');
    return (
        <div className="flexFluid flexCol_center alignCenter">
            <Typography component="div" variant="heading">{t('label.contentManager.noResults')}</Typography>
            <Typography className={styles.text} component="div" variant="body">{t('label.contentManager.noResultsText', {text})}</Typography>
        </div>
    );
};

EmptyTable.propTypes = {
    text: PropTypes.string.isRequired
};

export default EmptyTable;
