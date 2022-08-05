import {Checkbox, Typography} from '@jahia/moonstone';
import {useTranslation} from 'react-i18next';
import React from 'react';

// No need to have props types declared for these trivial components, user never injects proptypes
/* eslint-disable react/prop-types */

export const HeaderSelection = ({getToggleAllRowsSelectedProps}) => (
    <Checkbox {...getToggleAllRowsSelectedProps()}/>
);

export const Header = ({column}) => {
    const {t} = useTranslation('jcontent');
    return <Typography weight="bold">{t(column.label)}</Typography>;
};
