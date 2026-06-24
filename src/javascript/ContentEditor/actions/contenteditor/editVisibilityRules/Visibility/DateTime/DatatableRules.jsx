import React, {forwardRef, useMemo} from 'react';
import PropTypes from 'prop-types';
import {useTranslation} from 'react-i18next';
import {Chip, DataTable, Delete, Edit, Hidden, TableRow, Typography, Visibility} from '@jahia/moonstone';
import {getConditionLabel, getStatus, getStatusText} from './utils';
import clsx from 'clsx';
import statusCellStyles from './TableCellStatus.scss';
import dayjs from 'dayjs';
import {
    DeleteButton,
    EditButton
} from '~/ContentEditor/actions/contenteditor/editVisibilityRules/Visibility/DateTime/ButtonRenderers';

const TableCell = forwardRef(({
    className,
    children = '-',
    align = 'left',
    width,
    style,
    isScrollable = false,
    ...props
}, ref) => {
    const getAlignment = () => {
        if (align === 'left') {
            return 'justifyStart';
        }

        return align === 'right' ? 'justifyEnd' : 'justifyCenter';
    };

    return (
        <Typography
            ref={ref}
            isNowrap
            component="td"
            variant="body"
            className={clsx(
                statusCellStyles.tableCell,
                getAlignment(),
                'flexRow_nowrap',
                'alignCenter',
                {flexFluid: !width},
                {[statusCellStyles.scrollable]: isScrollable},
                className
            )}
            style={{
                width: width,
                ...style
            }}
            {...props}
        >
            {children}
        </Typography>
    );
});

TableCell.propTypes = {
    className: PropTypes.string,
    children: PropTypes.string,
    align: PropTypes.string,
    width: PropTypes.string,
    style: PropTypes.string,
    isScrollable: PropTypes.bool
};

const TableCellStatus = forwardRef(({
    color,
    children,
    className,
    ...props
},
ref) => {
    return (
        <TableCell
        ref={ref}
        className={clsx(
            statusCellStyles.tableCellStatus,
            statusCellStyles[color],
            className
        )}
        component="td"
        width="8px"
        {...props}
        >
            <div className={clsx('flexRow_nowrap', 'alignCenter', statusCellStyles.panel)}>
                {children}
            </div>
        </TableCell>
    );
});

TableCellStatus.propTypes = {
    color: PropTypes.any,
    children: PropTypes.node,
    className: PropTypes.string
};

const TableCellActions = forwardRef(({className, actions, ...props}, ref) => {
    return (
        <TableCell ref={ref}
                   className={clsx('flexRow_reverse', 'alignCenter', statusCellStyles.tableCellActions, className)}
                   align="right"
                   {...props}
        >
            {actions}
        </TableCell>
    );
});

TableCellActions.propTypes = {
    className: PropTypes.string,
    actions: PropTypes.any
};

export const DatatableRules = ({rules, onEdit, isMatchingAllConditions, saveConditions}) => {
    const {t} = useTranslation('jcontent');

    // We are adding two extra columns not declared here, so we need to keep the width overall at 90%
    const columns = [
        {
            key: 'type',
            label: 'Condition type',
            isSortable: true,
            width: '70%',
            sortFn: (a, b) => a.type.localeCompare(b.type)
        },
        {
            key: 'isMatching',
            label: t('jcontent:label.contentEditor.visibilityTab.conditions.preview_live'),
            isSortable: false,
            width: '20%',
            render: ({value, data}) => (
                <>
                    <Chip icon={value ? <Visibility/> : <Hidden/>}
                          color={value ? 'success' : 'warning'}
                          label={value ? t('jcontent:label.contentEditor.visibilityTab.conditions.visible') : t('jcontent:label.contentEditor.visibilityTab.conditions.hidden')}
                        />
                    {/* <Typography variant="caption">/</Typography> */}
                    {/* <Chip icon={data.isMatchingLive ? <Visibility/> : <Hidden/>} */}
                    {/*      color={data.isMatchingLive ? 'success' : 'warning'} */}
                    {/*      label={data.isMatchingLive ? t('jcontent:label.contentEditor.visibilityTab.conditions.visible') : t('jcontent:label.contentEditor.visibilityTab.conditions.hidden')} */}
                    {/*    /> */}
                </>
            )
        }
    ];

    const data = useMemo(() => {
        return rules.nodes.map(rule => {
            const firstAncestor = rule?.ancestors[0];
            let status = rule.aggregatedPublicationInfo.existsInLive ? 'published' : 'modified';

            if (status === 'published') {
                // Check if lastModified from first ancestor is superior to the timestamp of the published rule, if yes the rule is modified not published
                if (dayjs(firstAncestor.lastModified.value).isAfter(dayjs(firstAncestor.lastPublished.value))) {
                    status = 'modified';
                }
            }

            const username = status === 'modified' ? firstAncestor?.lastModifiedBy?.value : firstAncestor?.lastPublishedBy?.value;
            const timestamp = dayjs(status === 'modified' ? firstAncestor?.lastModified?.value : firstAncestor?.lastPublished?.value).format('LLL');

            return {
                id: rule.uuid,
                status: status,
                type: getConditionLabel(rule.primaryNodeType.name, rule.properties, t),
                username: username,
                timestamp: timestamp,
                isMatching: rule.isConditionMatching,
                isMatchingLive: rule.live !== null && rule.live.isConditionMatching,
                rule: rule
            };
        });
    }, [rules, t]);

    return (
        <DataTable
            enableSorting
            enableSelection={false}
            enablePagination={false}
            data={data}
            columns={columns}
            primaryKey="id"
            defaultSortDirection="descending"
            renderRow={({id, data, render: renderCells}) => (
                <TableRow
                    key={id}
                >
                    {renderCells({
                        before: (
                            <TableCellStatus color={getStatus(data.status).color}>
                                <>
                                    {getStatus(data.status).iconStart} {getStatusText(data, t)}
                                </>
                            </TableCellStatus>
                        ), after: (
                            <TableCellActions
                                actions={
                                    <>
                                        <EditButton buttonIcon={<Edit/>}
                                                    onClick={() => {
                                            onEdit(data.rule);
                                        }}/>
                                        <DeleteButton buttonIcon={<Delete/>}
                                                      onClick={() => {
                                            // Real backend save of the removed condition.
                                            saveConditions({
                                                removedConditions: [data.rule.uuid],
                                                isMatchingAllConditions
                                            });
                                        }}/>
                                    </>
                                }
                            />
                        )
                    })}
                </TableRow>
            )}
            data-sel-role="visibility-rule-table"
        />
    );
};

DatatableRules.propTypes = {
    rules: PropTypes.object,
    onEdit: PropTypes.func,
    isMatchingAllConditions: PropTypes.bool,
    saveConditions: PropTypes.func.isRequired
};
