import React from 'react';
import PropTypes from 'prop-types';
import {Delete, Edit, Table, TableBody, TableHead, TableHeadCell, TableRow, Typography} from '@jahia/moonstone';
import {Paper, TableCell} from '@material-ui/core';
import {useFormikContext} from 'formik';
import {RenderCondition} from './RenderCondition';
import {DeleteButton, EditButton} from './ButtonRenderers';
import styles from './DateTime.scss';

export const RulesList = ({rules, onEdit}) => {
    const formikContext = useFormikContext();

    const newRules = formikContext.values['RULES::new'];
    const updatedRules = formikContext.values['RULES::updated'];
    const deletedRules = formikContext.values['RULES::deleted'];
    // rules.node contains all the rules on the current node, let's render it using paper and table from material ui and moonstone
    return (<div className={styles.column}>
        <div className="flexRow">
            <Typography variant="subheading" weight="bold">
                Existing condition
            </Typography>
        </div>
        <Paper elevation={8} style={{minWidth: "100%"}}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableHeadCell>Source</TableHeadCell>
                        <TableHeadCell>Type</TableHeadCell>
                        <TableHeadCell>State</TableHeadCell>
                        <TableHeadCell>Action</TableHeadCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {rules.nodes.filter(rule => {
                        return (deletedRules === undefined || !deletedRules.includes(rule.uuid))
                    }).map((rule, index) => {
                        return (
                            <TableRow key={rule.uuid}>
                                <TableCell>{rule.aggregatedPublicationInfo.existsInLive ? "Live" : "Edit"}</TableCell>
                                <TableCell>{rule.primaryNodeType.name}</TableCell>
                                <TableCell><RenderCondition rule={rule} updateRules={updatedRules}/></TableCell>
                                <TableCell>
                                    <EditButton buttonIcon={<Edit/>} onClick={() => {
                                        onEdit(rule);
                                    }}/>
                                    <DeleteButton buttonIcon={<Delete/>} onClick={() => {
                                        const deletedRules = formikContext.values['RULES::deleted'] || [];
                                        deletedRules.push(rule.uuid);
                                        // if the rule is already in updated rules we need to remove it from there
                                        const updatedRules = formikContext.values['RULES::updated'] || [];
                                        const newUpdatedRules = updatedRules.filter(r => r.uuid !== rule.uuid);
                                        formikContext.setFieldValue('RULES::updated', newUpdatedRules).then(() => {
                                            formikContext.setFieldValue('RULES::deleted', deletedRules);
                                        });
                                    }}/>
                                </TableCell>
                            </TableRow>
                        )
                    })}
                    {newRules !== undefined && newRules.map((rule, index) => {
                        return (
                            <TableRow key={rule.uuid}>
                                <TableCell>New</TableCell>
                                <TableCell>{rule.type}</TableCell>
                                <TableCell><RenderCondition rule={rule} isNew={true}/></TableCell>
                                <TableCell>
                                    <EditButton buttonIcon={<Edit/>} onClick={() => {
                                        onEdit(rule)
                                    }}/>
                                    <DeleteButton buttonIcon={<Delete/>} onClick={() => {
                                        const newRules = formikContext.values['RULES::new'] || [];
                                        const updatedNewRules = newRules.filter(r => r !== rule);
                                        formikContext.setFieldValue('RULES::new', updatedNewRules);
                                    }}/>
                                </TableCell>
                            </TableRow>
                        )
                    })}
                </TableBody>
            </Table>
        </Paper>
    </div>);
};

RulesList.propTypes = {
    rules: PropTypes.object,
    onEdit: PropTypes.func
};

