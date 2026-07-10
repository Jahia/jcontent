import {getButtonRenderer} from '~/ContentEditor/utils';

export const EditButton = getButtonRenderer({
    defaultButtonProps: {
        variant: 'ghost',
        size: 'default',
        color: 'default'
    }
});

export const DeleteButton = getButtonRenderer({
    defaultButtonProps: {
        variant: 'ghost',
        size: 'default',
        color: 'danger'
    }
});

export const UndeleteButton = getButtonRenderer({
    defaultButtonProps: {
        variant: 'ghost',
        size: 'default',
        color: 'default'
    }
});

export const PublishDeletionButton = getButtonRenderer({
    defaultButtonProps: {
        variant: 'ghost',
        size: 'default',
        color: 'danger'
    }
});

export const RefreshButton = getButtonRenderer({
    labelStyle: 'none',
    defaultButtonProps: {
        size: 'small',
        color: 'accent'
    }
});

export const ButtonRenderer = getButtonRenderer({
    defaultButtonProps: {
        variant: 'outlined',
        size: 'default',
        color: 'accent'
    }
});

export const DangerButtonRenderer = getButtonRenderer({
    defaultButtonProps: {
        variant: 'outlined',
        size: 'big',
        color: 'danger'
    }
});
