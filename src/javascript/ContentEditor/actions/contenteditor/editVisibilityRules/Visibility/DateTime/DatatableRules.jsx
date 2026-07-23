import React, {forwardRef, useMemo} from 'react';
import PropTypes from 'prop-types';
import {useTranslation} from 'react-i18next';
import {Chip, CloudCheck, DataTable, Delete, Edit, Hidden, TableRow, Typography, Undelete, Visibility} from '@jahia/moonstone';
import {getConditionLabel} from './utils';
import clsx from 'clsx';
import statusCellStyles from './TableCellStatus.scss';
import {
    DeleteButton,
    EditButton,
    PublishDeletionButton,
    UndeleteButton
} from '~/ContentEditor/actions/contenteditor/editVisibilityRules/Visibility/DateTime/ButtonRenderers';
import {useConditionDeletion} from './useConditionDeletion';
import {useContentEditorConfigContext} from '~/ContentEditor/contexts';
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

export const DatatableRules = ({rules, onEdit, refresh, hideActions = false}) => {
    const {t} = useTranslation('jcontent');
    const {uilang} = useContentEditorConfigContext();
    const {markConditionForDeletion, unmarkConditionForDeletion, publishConditionDeletion} = useConditionDeletion({refresh});

    // We are adding two extra columns not declared here, so we need to keep the width overall at 90%
    const columns = [
        {
            key: 'type',
            label: t('jcontent:label.contentEditor.visibilityTab.conditions.condition'),
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
                type: getConditionLabel(rule.primaryNodeType.name, rule.properties, t, uilang),
                isMatching: rule.isConditionMatching,
                isMatchingLive: rule.live !== null && rule.live.isConditionMatching,
                isMarkedForDeletion: isMarkedForDeletion,
                canPublishDeletion: canPublishDeletion,
                rule: rule
            };
        });
    }, [rules, t, uilang]);

    return (
        <DataTable
            enableSorting
            enableSelection={false}
            enablePagination={false}
            data={data}
            columns={columns}
            primaryKey="id"
            defaultSortDirection="descending"
            renderRow={({id, data, render: renderCells}) => {
                const editLabel = t('jcontent:label.contentEditor.visibilityTab.conditions.edit');
                const deleteLabel = t('jcontent:label.contentEditor.visibilityTab.conditions.delete');
                const undeleteLabel = t('jcontent:label.contentEditor.visibilityTab.conditions.undelete');
                const publishDeletionLabel = t('jcontent:label.contentEditor.visibilityTab.conditions.publishDeletion');

                // Tooltips use the native `title` attribute (via buttonProps) rather than moonstone's
                // <Tooltip>. moonstone renders its tooltip bubble inline (no portal), so it is truncated
                // by the `overflow: hidden` on the moonstone DataTable and is never fully visible inside
                // this table. A moonstone issue has been filed to fix that; until it lands we rely on the
                // native `title` (which the browser always paints on top, un-clippable), mirrored by
                // `aria-label` for accessibility since these buttons are icon-only.
                let actions = null;
                if (!hideActions && data.isMarkedForDeletion) {
                    actions = (
                        <>
                            <UndeleteButton buttonIcon={<Undelete/>}
                                            dataSelRole="undelete-condition"
                                            buttonProps={{title: undeleteLabel, 'aria-label': undeleteLabel}}
                                            onClick={() => {
                                                // Restore a condition previously marked for deletion.
                                                // Error notification is handled inside the hook.
                                                unmarkConditionForDeletion(data.rule.path).catch(() => {});
                                            }}/>
                            {data.canPublishDeletion &&
                                <PublishDeletionButton buttonIcon={<CloudCheck/>}
                                                       dataSelRole="publish-deletion-condition"
                                                       buttonProps={{title: publishDeletionLabel, 'aria-label': publishDeletionLabel}}
                                                       onClick={() => {
                                                           // Commit the deletion through the standard
                                                           // publication workflow.
                                                           publishConditionDeletion(data.rule.uuid);
                                                       }}/>}
                        </>
                    );
                } else if (!hideActions) {
                    actions = (
                        <>
                            <EditButton buttonIcon={<Edit/>}
                                        dataSelRole="edit-condition"
                                        buttonProps={{title: editLabel, 'aria-label': editLabel}}
                                        onClick={() => {
                                            onEdit(data.rule);
                                        }}/>
                            <DeleteButton buttonIcon={<Delete/>}
                                          dataSelRole="delete-condition"
                                          buttonProps={{title: deleteLabel, 'aria-label': deleteLabel}}
                                          onClick={() => {
                                              // Mark the condition for deletion (soft delete). It stays
                                              // visible until the deletion is published, and can be undeleted.
                                              // Error notification is handled inside the hook.
                                              markConditionForDeletion(data.rule.path).catch(() => {});
                                          }}/>
                        </>
                    );
                }

                return (
                    <TableRow
                        key={id}
                        className={clsx(statusCellStyles.tableRow)}
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
                                <TableCellActions actions={actions}/>
                            )
                        })}
                    </TableRow>
                );
            }}
            data-sel-role="visibility-rule-table"
        />
    );
};

DatatableRules.propTypes = {
    rules: PropTypes.object,
    onEdit: PropTypes.func,
    refresh: PropTypes.func.isRequired,
    // When true the per-row actions (edit/delete/undelete) are hidden — used while a condition is
    // being edited and its row is shown read-only underneath the edition panel.
    hideActions: PropTypes.bool
};
