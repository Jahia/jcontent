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
