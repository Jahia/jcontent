import React, {forwardRef, useMemo} from 'react';
import PropTypes from 'prop-types';
import {useTranslation} from 'react-i18next';
import {Chip, DataTable, Delete, Edit, Hidden, TableRow, Typography, Visibility} from '@jahia/moonstone';
import {useFormikContext} from 'formik';
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

export const DatatableRules = ({rules, onEdit}) => {
    const formikContext = useFormikContext();
    const {t} = useTranslation('jcontent');

    const newRules = formikContext.values['RULES::new'];
    const updatedRules = formikContext.values['RULES::updated'];
    const deletedRules = formikContext.values['RULES::deleted'];

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
        const getProperties = rule => {
            // Find if there's an updated version of this rule
            const updatedRule = updatedRules?.find(r => r.uuid === rule.uuid);

            if (updatedRule) {
                // If the rule has been updated, transform the updated properties into the expected format
                return Object.keys(updatedRule)
                    .filter(key => key !== 'type' && key !== 'uuid')
                    .map(key => ({
                        name: key,
                        value: updatedRule[key],
                        values: updatedRule[key]
                    }));
            }

            // Otherwise, return the original rule's properties
            return rule.properties;
        };

        return rules.nodes.filter(rule => {
            return (deletedRules === undefined || !deletedRules.includes(rule.uuid));
        }).map(rule => {
            const updatedRule = updatedRules?.find(r => r.uuid === rule.uuid);
            const isUpdated = Boolean(updatedRule);
            const firstAncestor = rule?.ancestors[0];
            let status = rule.aggregatedPublicationInfo.existsInLive && !isUpdated ? 'published' : 'modified';

            if (status === 'published') {
                // Check if lastModified from first ancestor is superior to the timestamp of the published rule, if yes the rule is modified not published
                if (dayjs(firstAncestor.lastModified.value).isAfter(dayjs(firstAncestor.lastPublished.value))) {
                    status = 'modified';
                }
            }

            // If the rule has been updated, use the username and timestamp from the updated rule
            // Otherwise, use the information from the ancestor
            let username;
            let timestamp;
            if (isUpdated && updatedRule) {
                username = updatedRule.username;
                timestamp = dayjs(updatedRule.timestamp).format('LLL');
            } else {
                username = status === 'modified' ? firstAncestor?.lastModifiedBy?.value : firstAncestor?.lastPublishedBy?.value;
                timestamp = dayjs(status === 'modified' ? firstAncestor?.lastModified?.value : firstAncestor?.lastPublished?.value).format('LLL');
            }

            return {
                id: rule.uuid,
                status: status,
                type: getConditionLabel(rule.primaryNodeType.name, getProperties(rule), t),
                username: username,
                timestamp: timestamp,
                isMatching: rule.isConditionMatching,
                isMatchingLive: rule.live !== null && rule.live.isConditionMatching,
                rule: rule
            };
        }).concat(newRules === undefined ? [] : newRules.map(rule => {
            return {
                id: rule.uuid,
                status: 'new',
                type: getConditionLabel(rule.type, Object.keys(rule).filter(value => value !== 'type').map(value => ({
                    name: value,
                    value: rule[value],
                    values: rule[value]
                })), t),
                username: rule.username,
                timestamp: dayjs(rule.timestamp).format('LLL'),
                rule: rule
            };
        }));
    }, [newRules, updatedRules, deletedRules, rules, t]);

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
                                            if (data.status === 'new') {
                                                const updatedNewRules = (formikContext.values['RULES::new'] || []).filter(r => r.uuid !== data.rule.uuid);
                                                formikContext.setFieldValue('RULES::new', updatedNewRules);
                                            } else {
                                                const nextDeletedRules = [
                                                    ...(formikContext.values['RULES::deleted'] || []),
                                                    data.rule.uuid
                                                ];
                                                // If the rule is already in updated rules we need to remove it from there
                                                const nextUpdatedRules = (formikContext.values['RULES::updated'] || []).filter(r => r.uuid !== data.rule.uuid);
                                                formikContext.setFieldValue('RULES::updated', nextUpdatedRules).then(() => {
                                                    formikContext.setFieldValue('RULES::deleted', nextDeletedRules);
                                                });
                                            }
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
    onEdit: PropTypes.func
};
