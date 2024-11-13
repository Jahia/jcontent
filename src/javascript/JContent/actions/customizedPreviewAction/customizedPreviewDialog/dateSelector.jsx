import React from 'react';
import {DatePickerInput} from '~/ContentEditor/DesignSystem/DatePickerInput';
import {useCustomizedPreviewContext} from '~/JContent/actions/customizedPreviewAction/customizedPreviewDialog/customizedPreview.context';
export const DateSelector = () => {
    const {lang, date, setDate} = useCustomizedPreviewContext();
    return (
        <DatePickerInput
            variant="datetime"
            initialValue={date}
            lang={lang}
            onChange={setDate}
        />
    );
};
