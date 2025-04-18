import {useContentEditorContext} from '~/ContentEditor/contexts/ContentEditor';
import {useFormikContext} from 'formik';
import {Constants} from '~/ContentEditor/ContentEditor.constants';
import React from 'react';
import {DisplayAction} from '@jahia/ui-extender';
import {getButtonRenderer, isDirty} from '~/ContentEditor/utils';
import {ChevronDown} from '@jahia/moonstone';

const ButtonRenderer = getButtonRenderer({
    labelStyle: 'none',
    defaultButtonProps: {
        size: 'big',
        color: 'accent',
        'data-sel-role': 'ContentEditorHeaderMenu'
    }
});

export const PublishMenu = () => {
    const {nodeData, lang, i18nContext} = useContentEditorContext();
    const formik = useFormikContext();
    const wipInfo = formik.values[Constants.wip.fieldName];
    const isWip = wipInfo.status === Constants.wip.status.ALL_CONTENT ||
        (wipInfo.status === Constants.wip.status.LANGUAGES && wipInfo.languages.includes(lang));

    const dirty = isDirty(formik, i18nContext);
    let isDisabled = dirty || nodeData.lockedAndCannotBeEdited || isWip;

    return (
        <DisplayAction
            menuUseElementAnchor
            disabled={isDisabled}
            actionKey="publishMenu"
            language={lang}
            path={nodeData.path}
            render={ButtonRenderer}
            buttonProps={{icon: <ChevronDown/>}}
        />
    );
};
