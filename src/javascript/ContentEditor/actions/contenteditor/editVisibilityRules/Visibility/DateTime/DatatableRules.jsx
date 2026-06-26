import React, {forwardRef, useMemo} from 'react';
import PropTypes from 'prop-types';
import {useTranslation} from 'react-i18next';
import {Chip, DataTable, Delete, Edit, Hidden, TableRow, Typography, Undelete, Visibility} from '@jahia/moonstone';
import {getConditionLabel} from './utils';
import clsx from 'clsx';
import statusCellStyles from './TableCellStatus.scss';
import {
    DeleteButton,
    EditButton,
    UndeleteButton
} from '~/ContentEditor/actions/contenteditor/editVisibilityRules/Visibility/DateTime/ButtonRenderers';
import {useConditionDeletion} from './useConditionDeletion';
import PublicationStatus from '~/JContent/PublicationStatus';

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

export const DatatableRules = ({rules, onEdit, refresh}) => {
    const {t} = useTranslation('jcontent');
    const {markConditionForDeletion, unmarkConditionForDeletion, publishConditionDeletion} = useConditionDeletion({refresh});

    // We are adding two extra columns not declared here, so we need to keep the width overall at 90%
    const columns = [
        {
            key: 'type',
            label: 'Condition type',
            isSortable: true,
            width: '70%',
            sortFn: (a, b) => a.type.localeCompare(b.type),
            render: ({value, data}) => (
                <span className={clsx({[statusCellStyles.deletedText]: data.isMarkedForDeletion})}>
                    {value}
                </span>
            )
        },
        {
            key: 'isMatching',
            label: t('jcontent:label.contentEditor.visibilityTab.conditions.preview_live'),
            isSortable: false,
            width: '20%',
            render: ({value}) => (
                <Chip icon={value ? <Visibility/> : <Hidden/>}
                      color={value ? 'success' : 'warning'}
                      label={value ? t('jcontent:label.contentEditor.visibilityTab.conditions.visible') : t('jcontent:label.contentEditor.visibilityTab.conditions.hidden')}
                        />
            )
        }
    ];

    const data = useMemo(() => {
        return rules.nodes.map(rule => {
            const isMarkedForDeletion = rule.markedForDeletion || Boolean(rule.deleted?.value);

            // The deletion can be published (committed) only when it is marked for deletion, publication
            // is supported, and the condition actually exists in live (otherwise it is simply removed).
            const pubInfo = rule.aggregatedPublicationInfo;
            const canPublishDeletion = isMarkedForDeletion &&
                Boolean(rule.operationsSupport?.publication) &&
                (pubInfo?.publicationStatus !== 'NOT_PUBLISHED' || Boolean(pubInfo?.existsInLive));

            return {
                id: rule.uuid,
                type: getConditionLabel(rule.primaryNodeType.name, rule.properties, t),
                isMatching: rule.isConditionMatching,
                isMatchingLive: rule.live !== null && rule.live.isConditionMatching,
                isMarkedForDeletion: isMarkedForDeletion,
                canPublishDeletion: canPublishDeletion,
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
                            <Typography isNowrap
                                        component="td"
                                        variant="body"
                                        className={clsx(statusCellStyles.tableCellStatus)}
                                        data-sel-role="condition-status"
                            >
                                <PublicationStatus node={data.rule}/>
                            </Typography>
                        ), after: (
                            <TableCellActions
                                actions={data.isMarkedForDeletion ? (
                                    <UndeleteButton buttonIcon={<Undelete/>}
                                                    dataSelRole="undelete-condition"
                                                    onClick={() => {
                                                            // Restore a condition previously marked for deletion.
                                                            unmarkConditionForDeletion(data.rule.path);
                                                        }}/>
                                ) : (
                                    <>
                                        <EditButton buttonIcon={<Edit/>}
                                                    dataSelRole="edit-condition"
                                                    onClick={() => {
                                            onEdit(data.rule);
                                        }}/>
                                        <DeleteButton buttonIcon={<Delete/>}
                                                      dataSelRole="delete-condition"
                                                      onClick={() => {
                                            // Mark the condition for deletion (soft delete). It stays
                                            // visible until the deletion is published, and can be undeleted.
                                            markConditionForDeletion(data.rule.path);
                                        }}/>
                                    </>
                                )}
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
    refresh: PropTypes.func.isRequired
};
