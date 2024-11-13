import React from 'react';
import {DatePickerInput} from '~/ContentEditor/DesignSystem/DatePickerInput';
import {useCustomizedPreviewContext} from '../customizedPreview.context';
import {SelectorLabel} from './selectorLabel';
import styles from './selectors.scss';

export const DateSelector = () => {
    const {lang, date, setDate} = useCustomizedPreviewContext();
    return (
        <div className={styles.selector}>
            <SelectorLabel name="date"/>
            <DatePickerInput
                variant="datetime"
                initialValue={date}
                lang={lang}
                onChange={setDate}
            />
        </div>
    );
};
