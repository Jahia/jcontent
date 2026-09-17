import React from 'react';
import {DatePickerInput} from '~/ContentEditor/DesignSystem/DatePickerInput';
import {useCustomizedPreviewContext} from '../customizedPreview.context';
import {SelectorLabel} from './selectorLabel';
import styles from './selectors.scss';
import {useSelector} from 'react-redux';

export const DateSelector = () => {
    const {date, setDate} = useCustomizedPreviewContext();
    const lang = useSelector(state => state.language);

    return (
        <div className={styles.selector} data-sel-role="date-selector-input">
            <SelectorLabel name="date"/>
            <DatePickerInput
                variant="datetime"
                initialValue={date ? date.toDate() : null}
                lang={lang}
                onChange={setDate}
            />
        </div>
    );
};
