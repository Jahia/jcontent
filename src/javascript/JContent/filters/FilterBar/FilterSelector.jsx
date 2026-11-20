import React from 'react';
import PropTypes from 'prop-types';
import {useTranslation} from 'react-i18next';
import {DateTimeInput, Dropdown, Input} from '@jahia/moonstone';
import {FILTER_OPERATORS, MULTI_VALUE_OPERATORS, VALUELESS_OPERATORS, valuesOf} from '../filterConstraint';
import {operatorLabel} from './filterLabels';
import styles from './FilterBar.scss';

const LABELS = 'jcontent:label.contentManager.filters';
const SEARCH_FROM = 12;

const dayOf = value => (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : null);

/**
 * The controls of one filter: the operator, and the value control of the kind of the field.
 * It edits a draft; the bar applies the draft when the selector closes, and Enter in a value field closes it.
 */
export const FilterSelector = ({field, draft, onDraftChange, onApply}) => {
    const {t, i18n} = useTranslation('jcontent');
    const {operator} = draft;
    const operators = FILTER_OPERATORS[field.kind] || [];

    const setOperator = next => {
        const keepsValue = MULTI_VALUE_OPERATORS.has(next) === MULTI_VALUE_OPERATORS.has(operator) &&
            (next === 'lastDays') === (operator === 'lastDays') && !VALUELESS_OPERATORS.has(next);
        onDraftChange(keepsValue ? {...draft, operator: next} : {operator: next});
    };

    const setValue = value => onDraftChange({...draft, value});
    const applyOnEnter = event => {
        if (event.key === 'Enter') {
            event.preventDefault();
            onApply();
        }
    };

    const valueLabel = t(`${LABELS}.valueField`);
    let valueControl = null;
    if (VALUELESS_OPERATORS.has(operator)) {
        valueControl = null;
    } else if (field.kind === 'choice') {
        const options = field.options || [];
        valueControl = (
            <Dropdown
                aria-label={valueLabel}
                className={styles.selectorControl}
                data={options.map(option => ({label: option.label, value: option.value}))}
                values={valuesOf(draft.value)}
                hasSearch={options.length >= SEARCH_FROM}
                placeholder={valueLabel}
                onChange={(event, item) => {
                    const values = valuesOf(draft.value);
                    setValue(values.includes(item.value) ? values.filter(value => value !== item.value) : [...values, item.value]);
                }}
            />
        );
    } else if (field.kind === 'date' && operator !== 'lastDays') {
        valueControl = (
            <DateTimeInput
                aria-label={valueLabel}
                className={styles.selectorControl}
                type="date"
                locale={i18n.language}
                value={dayOf(draft.value)}
                onChange={(event, value) => setValue(value ? value.toString() : undefined)}
                onKeyDown={applyOnEnter}
            />
        );
    } else {
        const isNumber = field.kind === 'number' || operator === 'lastDays';
        valueControl = (
            <Input
                aria-label={valueLabel}
                className={styles.selectorControl}
                type={isNumber ? 'number' : 'text'}
                value={typeof draft.value === 'string' ? draft.value : ''}
                placeholder={valueLabel}
                onChange={event => setValue(event.target.value)}
                onKeyDown={applyOnEnter}
            />
        );
    }

    return (
        <>
            <Dropdown
                aria-label={t(`${LABELS}.operatorField`)}
                className={styles.selectorControl}
                data={operators.map(candidate => ({label: operatorLabel(t, field, candidate), value: candidate}))}
                value={operator}
                label={operatorLabel(t, field, operator)}
                onChange={(event, item) => setOperator(item.value)}
            />
            {valueControl}
        </>
    );
};

FilterSelector.propTypes = {
    field: PropTypes.shape({
        key: PropTypes.string.isRequired,
        kind: PropTypes.string.isRequired,
        options: PropTypes.arrayOf(PropTypes.shape({value: PropTypes.string, label: PropTypes.string}))
    }).isRequired,
    draft: PropTypes.shape({
        operator: PropTypes.string,
        value: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)])
    }).isRequired,
    onDraftChange: PropTypes.func.isRequired,
    onApply: PropTypes.func.isRequired
};
