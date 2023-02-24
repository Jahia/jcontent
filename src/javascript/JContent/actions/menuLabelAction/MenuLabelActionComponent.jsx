import React from 'react';
import PropTypes from 'prop-types';
import {useTranslation} from 'react-i18next';
import {Typography} from '@jahia/moonstone';
import styles from './MenuLabelActionComponent.scss';

export const MenuLabelActionComponent = ({label}) => {
    const {t} = useTranslation('jcontent');

    return <Typography className={styles.label} variant="caption" weight="bold">{t(label)}</Typography>;
};

MenuLabelActionComponent.propTypes = {
    label: PropTypes.string.isRequired
};
