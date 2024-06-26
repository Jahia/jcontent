import React, {useState} from 'react';
import {FieldContainer} from '../../../Field';
import {useFormikContext} from 'formik';
import {useTranslation} from 'react-i18next';
import {adaptSectionToDisplayableRows, getDisplayedRows} from './AutomaticOrdering.utils';
import {Button, Close} from '@jahia/moonstone';
import styles from './AutomaticOrdering.scss';
import PropTypes from 'prop-types';

export const AutomaticOrdering = ({orderingFieldSet}) => {
    const {values, setFieldValue, setFieldTouched} = useFormikContext();
    const {t} = useTranslation('jcontent');
    const rows = adaptSectionToDisplayableRows(orderingFieldSet, t);
    const [displayedRows, setDisplayedRows] = useState(getDisplayedRows(rows, values));

    const _getNextRowIndexToAdd = () => {
        for (let i = 0; i < rows.length; i++) {
            if (!displayedRows.includes(i)) {
                return i;
            }
        }

        return -1;
    };

    const add = (_nextRow, _nextRowIndex) => {
        setDisplayedRows([...displayedRows, _nextRowIndex]);

        setFieldValue(_nextRow.propField.name, 'jcr:lastModified');
        setFieldTouched(_nextRow.propField.name, true, false);
        setFieldValue(_nextRow.directionField.name, 'desc');
        setFieldTouched(_nextRow.directionField.name, true, false);
    };

    const remove = index => {
        // Remove from display
        const displayedRowToRemove = rows[displayedRows[index]];
        const currentDisplayedRows = displayedRows.slice();
        currentDisplayedRows.splice(index, 1);
        setDisplayedRows(currentDisplayedRows);

        // Unset values
        setFieldValue(displayedRowToRemove.propField.name, undefined);
        setFieldTouched(displayedRowToRemove.propField.name, true, false);
        setFieldValue(displayedRowToRemove.directionField.name, undefined);
        setFieldTouched(displayedRowToRemove.directionField.name, true, false);
    };

    const getInputContext = (index, field) => {
        const inputContext = {
            displayBadges: false,
            displayActions: false,
            displayLabels: index === 0,
            displayErrors: false
        };

        if (!field.name.endsWith('Direction')) {
            /* eslint-disable react/jsx-no-useless-fragment */
            inputContext.actionRender = <></>;
        } else if (displayedRows.length > 1) {
            inputContext.actionRender = (
                <Button variant="ghost"
                        data-sel-role={`delete-automatic-ordering-field-${index}`}
                        aria-label={t('jcontent:label.contentEditor.edit.fields.actions.clear')}
                        icon={<Close/>}
                        disabled={field.readOnly}
                        onClick={() => {
                                remove(index);
                            }}
                />
            );
        }

        return inputContext;
    };

    const nextRowIndex = _getNextRowIndexToAdd();
    const nextRow = nextRowIndex !== -1 && rows[nextRowIndex];
    return (
        <>
            {displayedRows
                .map((displayableRow, index) => {
                    const row = rows[displayableRow];
                    return (
                        <div key={row.propField.name} className="flexRow">
                            <div className={styles.orderBy}>
                                <FieldContainer field={row.propField} inputContext={getInputContext(index, row.propField)}/>
                            </div>
                            <div className="flexFluid">
                                <FieldContainer field={row.directionField} inputContext={getInputContext(index, row.directionField)}/>
                            </div>
                        </div>
                    );
                })}

            <Button className={styles.addButton}
                    size="big"
                    data-sel-role="add-automatic-ordering-field"
                    isDisabled={!nextRow || nextRow.propField.readOnly}
                    label={t('jcontent:label.contentEditor.edit.fields.actions.add')}
                    onClick={() => add(nextRow, nextRowIndex)}/>
        </>
    );
};

AutomaticOrdering.propTypes = {
    orderingFieldSet: PropTypes.object.isRequired
};
