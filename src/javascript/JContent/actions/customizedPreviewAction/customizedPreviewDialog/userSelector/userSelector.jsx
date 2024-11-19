import React, {useEffect, useState} from 'react';
import {Dialog, DialogActions, DialogContent, DialogTitle, Paper} from '@material-ui/core';
import {useTranslation} from 'react-i18next';
import {useQuery} from '@apollo/client';
import {Button} from '@jahia/moonstone';
import {registry} from '@jahia/ui-extender';
import clsx from 'clsx';
import {ReferenceCard} from '~/ContentEditor/DesignSystem/ReferenceCard';
import {Constants} from '~/ContentEditor/SelectorTypes/Picker/Picker.constants';
import {DefaultPickerConfig} from '~/ContentEditor/SelectorTypes/Picker/configs/DefaultPickerConfig';
import {encodeJCRPath} from '~/ContentEditor/utils';
import {useCustomizedPreviewContext} from '../../customizedPreview.context';
import {SelectorLabel} from '../selectorLabel';
import styles from '../selectors.scss';
import {UserSelectorTable} from './userSelectorTable';
import {GET_USER_ICON} from './userIcon.gql-queries';

export const UserSelector = () => {
    const {user, setUser} = useCustomizedPreviewContext();

    const [isDialogOpen, setDialogOpen] = useState(false);
    const [newValue, setNewValue] = useState(user);
    const pickerConfig = registry.get(Constants.pickerConfig, 'user');
    const {t} = useTranslation('jcontent');

    const {data} = useQuery(GET_USER_ICON);
    const userTypeIcon = data ? encodeJCRPath(`${data.jcr.nodeTypeByName.icon}.png`) : '';

    const onDblClick = newValue => {
        setUser(newValue);
        setDialogOpen(false);
    };

    const onClose = () => {
        setNewValue(user);
        setDialogOpen(false);
    };

    useEffect(() => {
        setNewValue(user);
    }, [user]);

    return (
        <>
            <SelectorLabel name="user"/>
            <div className={clsx(styles.selector, 'flexFluid flexRow_nowrap alignCenter')}>
                <ReferenceCard
                    emptyLabel={t(pickerConfig.pickerInput.emptyLabel)}
                    emptyIcon={DefaultPickerConfig.pickerInput.emptyIcon}
                    labelledBy="user-selector-label"
                    fieldData={user && {url: userTypeIcon, name: user, info: 'user'}}
                    onClick={() => setDialogOpen(true)}
                />

                <Dialog
                    fullWidth
                    maxWidth="xl"
                    data-sel-role="user-selector-dialog"
                    data-sel-type={pickerConfig.key}
                    PaperComponent={Paper}
                    open={isDialogOpen}
                    onClose={onClose}
                >

                    <DialogTitle>
                        {t(pickerConfig.pickerDialog.dialogTitle)}
                    </DialogTitle>

                    <DialogContent className={clsx('flexFluid flexCol_nowrap', styles.userContent)}>
                        <UserSelectorTable initialValue={user} newValue={newValue} onSelection={setNewValue} onDblClick={onDblClick}/>
                    </DialogContent>

                    <DialogActions>
                        <Button
                        data-sel-picker-dialog-action="cancel"
                        size="big"
                        label={t('jcontent:label.contentEditor.edit.fields.modalCancel').toUpperCase()}
                        onClick={onClose}
                    />
                        <Button
                        data-sel-picker-dialog-action="select-user"
                        disabled={!newValue}
                        color="accent"
                        size="big"
                        label={t('jcontent:label.contentEditor.edit.fields.modalDone').toUpperCase()}
                        onClick={() => {
                            setUser(newValue);
                            setDialogOpen(false);
                        }}
                    />
                    </DialogActions>
                </Dialog>
            </div>
        </>
    );
};
