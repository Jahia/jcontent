import React, {useMemo} from 'react';
import PropTypes from 'prop-types';
import {shallowEqual, useDispatch, useSelector} from 'react-redux';
import {useTranslation} from 'react-i18next';
import {cmSetSort} from '~/JContent/redux/sort.redux';
import {ArrowDown, ArrowUp, Dropdown, CustomDropdown, Separator, MenuItem} from '@jahia/moonstone';
import classes from './SortSelector.scss';
import JContentConstants from '~/JContent/JContent.constants';

const SORT_DATA = [
    {
        label: 'jcontent:label.contentManager.listColumns.name',
        orderBy: 'displayName'
    },
    {
        label: 'jcontent:label.contentManager.listColumns.type',
        orderBy: 'content.mimeType.value'
    },
    {
        label: 'jcontent:label.contentManager.listColumns.createdBy',
        orderBy: 'createdBy.value'
    },
    {
        label: 'jcontent:label.contentManager.listColumns.lastModified',
        orderBy: 'lastModified.value'
    },
    {
        label: 'jcontent:label.contentManager.listColumns.size',
        orderBy: 'content.data.size'
    }
];

const DROPDOWN_ICON = {
    DESC: <ArrowDown/>,
    ASC: <ArrowUp/>
};

export const SortSelector = ({selector, setSortAction}) => {
    const {t} = useTranslation('jcontent');

    const {sort, mode} = useSelector(selector, shallowEqual);
    const dispatch = useDispatch();
    const sortData = useMemo(() => {
        return SORT_DATA.map(d => ({label: t(d.label), value: d.orderBy}));
    }, [t]);
    const currentLabel = t(SORT_DATA.find(d => d.orderBy === sort?.orderBy)?.label);

    return mode === JContentConstants.mode.GRID ? (
        <CustomDropdown size="default"
                        data-sel-role="sel-media-sort-dropdown"
                        label={currentLabel}
                        icon={DROPDOWN_ICON[sort?.order]}
                        variant="outlined"
        >
            <MenuItem
            className={classes.label}
            label={t('jcontent:label.contentManager.sortSelector.orderingBy')}
            variant="title"
        />
            <Dropdown
                data-sel-role="sel-media-sort-property-dropdown"
                data={sortData}
                value={sort?.orderBy}
                variant="outlined"
                onChange={(e, item) => {
                dispatch(setSortAction({order: sort.order, orderBy: item.value}));
            }}
        />
            <Separator/>
            <MenuItem
            className={classes.label}
            label={t('jcontent:label.contentManager.sortSelector.direction')}
            variant="title"
        />
            <Dropdown
                data-sel-role="sel-media-sort-order-dropdown"
                variant="outlined"
                value={sort?.order}
                data={[
                {
                    label: t('jcontent:label.contentManager.sortSelector.asc'),
                    value: 'ASC'
                },
                {
                    label: t('jcontent:label.contentManager.sortSelector.desc'),
                    value: 'DESC'
                }
            ]}
                onChange={(e, item) => {
                dispatch(setSortAction({order: item.value, orderBy: sort.orderBy}));
            }}
        />
        </CustomDropdown>
    ) : null;
};

const sortSelector = state => ({
    sort: state.jcontent.sort,
    mode: state.jcontent.filesGrid.mode
});

SortSelector.propTypes = {
    selector: PropTypes.func,
    setSortAction: PropTypes.func
};

SortSelector.defaultProps = {
    selector: sortSelector,
    setSortAction: sort => cmSetSort(sort)
};

export default SortSelector;

