import React, {useMemo} from 'react';
import PropTypes from 'prop-types';
import {FieldPropTypes} from '~/ContentEditor/ContentEditor.proptypes';
import {Dropdown, toIconComponent} from '@jahia/moonstone';
import {useContentEditorConfigContext} from '~/ContentEditor/contexts';
import {DisplayAction} from '@jahia/ui-extender';
import {getButtonRenderer} from '~/ContentEditor/utils';

import enLocale from 'dayjs/locale/en';
import frLocale from 'dayjs/locale/fr';
import deLocale from 'dayjs/locale/de';
import esLocale from 'dayjs/locale/es';
import ptLocale from 'dayjs/locale/pt';
import itLocale from 'dayjs/locale/it';

const locales = {en: enLocale, fr: frLocale, de: deLocale, es: esLocale, pt: ptLocale, it: itLocale};

// Canonical English day names used as stored values (Sunday-first, matching JS Date.getDay())
const DAY_VALUES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const ButtonRenderer = getButtonRenderer({labelStyle: 'none', defaultButtonProps: {variant: 'ghost'}});

export const DayOfWeekSelect = ({field, id, value, inputContext, onChange, onBlur}) => {
    const {uilang} = useContentEditorConfigContext();

    inputContext.actionContext = {onChange, onBlur};

    const options = useMemo(() => {
        const locale = locales[uilang] || locales.en;
        // Dayjs locale weekdays array starts on Sunday
        return DAY_VALUES.map((dayValue, index) => ({
            label: locale.weekdays[index],
            value: dayValue.toLowerCase(),
            attributes: {'data-value': dayValue}
        }));
    }, [uilang]);

    const readOnly = field.readOnly;
    const currentValues = value || [];

    return (
        <div className="flexFluid flexRow alignCenter">
            <Dropdown
                hasSearch
                className="flexFluid"
                id={'dayofweek-' + id}
                variant="outlined"
                size="medium"
                icon={toIconComponent(inputContext?.selectorType?.properties?.find(p => p.name === 'iconStart')?.value)}
                data={options}
                values={currentValues}
                isDisabled={readOnly}
                data-sel-content-editor-select-readonly={readOnly}
                onChange={(_, selectedItem) => {
                    const prev = currentValues;
                    onChange(
                        prev.includes(selectedItem.value) ?
                            prev.filter(v => v !== selectedItem.value) :
                            [...prev, selectedItem.value]
                    );
                }}
                onBlur={onBlur}
            />
            {inputContext.displayActions && (
                <DisplayAction
                    actionKey="content-editor/field/Choicelist"
                    field={field}
                    inputContext={inputContext}
                    render={ButtonRenderer}
                />
            )}
        </div>
    );
};

DayOfWeekSelect.propTypes = {
    id: PropTypes.string.isRequired,
    field: FieldPropTypes.isRequired,
    value: PropTypes.arrayOf(PropTypes.string),
    inputContext: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
    onBlur: PropTypes.func.isRequired
};

