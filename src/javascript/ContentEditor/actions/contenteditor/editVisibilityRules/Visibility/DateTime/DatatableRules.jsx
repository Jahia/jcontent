import React, {forwardRef, useMemo} from 'react';
import PropTypes from 'prop-types';
import {useTranslation} from 'react-i18next';
import {
    Chip,
    DataTable,
    Delete,
    Edit,
    Hidden,
    Publish,
    TableRow,
    Typography,
    Undelete,
    Visibility
} from '@jahia/moonstone';
import {getConditionLabel, getStatus, getStatusText} from './utils';
import clsx from 'clsx';
import statusCellStyles from './TableCellStatus.scss';
import dayjs from 'dayjs';
import {
    DeleteButton,
    EditButton,
    PublishDeletionButton,
    UndeleteButton
} from '~/ContentEditor/actions/contenteditor/editVisibilityRules/Visibility/DateTime/ButtonRenderers';
import {useConditionDeletion} from './useConditionDeletion';

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
                <span className={clsx({[statusCellStyles.deletedText]: data.status === 'deleted'})}>
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
            const firstAncestor = rule?.ancestors[0];
            const isMarkedForDeletion = rule.markedForDeletion || Boolean(rule.deletionDate?.value);
            let status = rule.aggregatedPublicationInfo.existsInLive ? 'published' : 'modified';

            if (status === 'published') {
                // Check if lastModified from first ancestor is superior to the timestamp of the published rule, if yes the rule is modified not published
                if (dayjs(firstAncestor.lastModified.value).isAfter(dayjs(firstAncestor.lastPublished.value))) {
                    status = 'modified';
                }
            }

            let username = status === 'modified' ? firstAncestor?.lastModifiedBy?.value : firstAncestor?.lastPublishedBy?.value;
            let timestamp = dayjs(status === 'modified' ? firstAncestor?.lastModified?.value : firstAncestor?.lastPublished?.value).format('LLL');

            // A condition marked for deletion takes precedence over its publication status: it is
            // displayed as "marked for deletion" until the deletion is actually published.
            if (isMarkedForDeletion) {
                status = 'deleted';
                username = rule.deletionUser?.value;
                timestamp = rule.deletionDate?.value ? dayjs(rule.deletionDate.value).format('LLL') : timestamp;
            }

            // The deletion can be published (committed) only when it is marked for deletion, publication
            // is supported, and the condition actually exists in live (otherwise it is simply removed).
            const pubInfo = rule.aggregatedPublicationInfo;
            const canPublishDeletion = isMarkedForDeletion &&
                Boolean(rule.operationsSupport?.publication) &&
                (pubInfo?.publicationStatus !== 'NOT_PUBLISHED' || Boolean(pubInfo?.existsInLive));

            return {
                id: rule.uuid,
                status: status,
                type: getConditionLabel(rule.primaryNodeType.name, rule.properties, t),
                username: username,
                timestamp: timestamp,
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
                            <TableCellStatus color={getStatus(data.status).color}>
                                <>
                                    {getStatus(data.status).iconStart} {getStatusText(data, t)}
                                </>
                            </TableCellStatus>
                        ), after: (
                            <TableCellActions
                                actions={data.isMarkedForDeletion ? (
                                    <>
                                        {data.canPublishDeletion && (
                                            <PublishDeletionButton buttonIcon={<Publish/>}
                                                                   dataSelRole="publish-deletion-condition"
                                                                   onClick={() => {
                                                                       // Commit the deletion through the standard publication workflow.
                                                                       publishConditionDeletion(data.rule.uuid);
                                                                   }}/>
                                        )}
                                        <UndeleteButton buttonIcon={<Undelete/>}
                                                        dataSelRole="undelete-condition"
                                                        onClick={() => {
                                                            // Restore a condition previously marked for deletion.
                                                            unmarkConditionForDeletion(data.rule.path);
                                                        }}/>
                                    </>
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
