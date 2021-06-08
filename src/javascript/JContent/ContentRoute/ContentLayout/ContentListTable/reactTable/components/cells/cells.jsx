import {Checkbox, Typography} from '@jahia/moonstone';
import {useSelector} from 'react-redux';
import dayjs from 'dayjs';
import {getDefaultLocale} from '../../../../../../JContent.utils';
import css from '../../../ContentListTableMoon.scss';
import {DisplayAction, DisplayActions} from '@jahia/ui-extender';
import {includes} from 'lodash';
import React from 'react';
import PublicationStatus from '../../../../PublicationStatus';
import {ButtonRendererNoLabel} from '~/utils/getButtonRenderer';

// No need to have props types declared for these trivial components, user never injects proptypes
/* eslint-disable react/prop-types */

export const CellSelection = ({row}) => (
    <Checkbox isUncontrolled {...row.getToggleRowSelectedProps()}/>
);

export const CellLastModified = ({row, value}) => {
    const uilang = useSelector(state => state.uilang);
    return (
        <>
            <Typography>
                <time>{dayjs(value).locale(getDefaultLocale(uilang)).format('ll')}</time>
            </Typography>
            <div className={css.cellActions}
                 data-cm-role="table-content-list-cell-actions"
            >
                <DisplayActions
                    target="contentActions"
                    filter={value => {
                        return includes(['edit', 'preview', 'subContents', 'locate'], value.key);
                    }}
                    path={row.original.path}
                    render={ButtonRendererNoLabel}
                    buttonProps={{variant: 'ghost', size: 'big'}}
                />
            </div>
        </>
    );
};

export const CellVisibleActions = ({row}) => (
    <DisplayAction
        actionKey="contentMenu"
        path={row.original.path}
        menuFilter={value => !includes(['edit', 'preview', 'subContents', 'locate'], value.key)}
        render={ButtonRendererNoLabel}
        buttonProps={{variant: 'ghost', size: 'big'}}
    />
);

export const CellPublicationStatus = ({row}) => (
    <PublicationStatus node={row.original}/>
);

export const Cell = ({value}) => (
    <Typography>{value}</Typography>
);
