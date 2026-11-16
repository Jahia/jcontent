import React from 'react';
import {useSelector} from 'react-redux';
import {useTranslation} from 'react-i18next';
import {registry} from '@jahia/ui-extender';
import {Button, Typography} from '@jahia/moonstone';
import {useFilters} from './useFilters';

/**
 * Whether the jContent list of `mode` is narrowed by filters: it is the current list, its accordion takes filters and the URL holds some.
 * A picker shows another mode, so its lists are never narrowed.
 */
export const useHasFilters = mode => {
    const currentMode = useSelector(state => state.jcontent.mode);
    const {filters} = useFilters();
    return mode === currentMode && Boolean(registry.get('accordionItem', mode)?.tableConfig?.filters) && filters.length > 0;
};

/** The empty list when the filters match no item, with a button that clears them. */
export const FilterEmptyState = () => {
    const {t} = useTranslation('jcontent');
    const {clearAll} = useFilters();
    return (
        <div className="flexFluid flexCol_center alignCenter" data-sel-role="filters-empty">
            <Typography component="div" variant="heading">{t('label.contentManager.filters.emptyList')}</Typography>
            <Button label={t('label.contentManager.filters.clearAll')} variant="outlined" onClick={clearAll}/>
        </div>
    );
};
