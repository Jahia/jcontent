import React, {useState} from 'react';
import PropTypes from 'prop-types';
import {Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle} from '@material-ui/core';
import {Button, RadioGroup, RadioItem} from '@jahia/moonstone';
import {useTranslation} from 'react-i18next';
import {useCloseOnNavigation} from '~/utils';

export const SCOPE_WITH_CHILDREN = 'withChildren';
export const SCOPE_ITEM_ONLY = 'itemOnly';

/**
 * Asked only when saving a sample needs a decision, and asks both at once rather than stacking two
 * modals when both apply:
 *
 * - the category already holds a sample of this name, so saving would otherwise silently add a
 *   second copy (which is how name-1 and name-2 accumulated, each dragging a whole subtree along);
 * - the content has children of its own, and whether they belong in the sample is the author's call.
 *
 * Pages never reach the second question: a page sample is always the page alone, matching the
 * existing "copy page only" action.
 */
export const SaveSampleDialog = ({name, isReplacing, hasChildren, onConfirm, onExit}) => {
    const [open, setOpen] = useState(true);
    // Keeping the children is the safer default: a component stripped of its content previews as an
    // empty box, which is the opposite of what a sample is for.
    const [scope, setScope] = useState(SCOPE_WITH_CHILDREN);
    const {t} = useTranslation('jcontent');

    const handleCancel = () => {
        setOpen(false);
    };

    useCloseOnNavigation(handleCancel);

    const handleConfirm = () => {
        setOpen(false);
        onConfirm(scope === SCOPE_WITH_CHILDREN);
    };

    return (
        <Dialog open={open}
                aria-labelledby="save-sample-dialog-title"
                data-sel-role="save-sample-dialog"
                onClose={handleCancel}
                onExited={onExit}
        >
            <DialogTitle id="save-sample-dialog-title">
                {t(isReplacing ?
                    'jcontent:label.contentManager.copyToSamples.existsTitle' :
                    'jcontent:label.contentManager.copyToSamples.scopeTitle')}
            </DialogTitle>
            <DialogContent>
                {isReplacing && (
                    <DialogContentText>
                        {t('jcontent:label.contentManager.copyToSamples.existsText', {name})}
                    </DialogContentText>
                )}
                {hasChildren && (
                    <>
                        <DialogContentText>
                            {t('jcontent:label.contentManager.copyToSamples.scopeText')}
                        </DialogContentText>
                        <RadioGroup value={scope} onChange={(e, value) => setScope(value)}>
                            <RadioItem
                                id="save-sample-with-children"
                                data-sel-role="save-sample-with-children"
                                value={SCOPE_WITH_CHILDREN}
                                label={t('jcontent:label.contentManager.copyToSamples.scopeWithChildren')}
                            />
                            <RadioItem
                                id="save-sample-item-only"
                                data-sel-role="save-sample-item-only"
                                value={SCOPE_ITEM_ONLY}
                                label={t('jcontent:label.contentManager.copyToSamples.scopeItemOnly')}
                            />
                        </RadioGroup>
                    </>
                )}
            </DialogContent>
            <DialogActions>
                <Button
                    size="big"
                    data-sel-role="save-sample-cancel"
                    label={t('jcontent:label.cancel')}
                    onClick={handleCancel}
                />
                <Button
                    color="accent"
                    size="big"
                    data-sel-role="save-sample-confirm"
                    label={t(isReplacing ?
                        'jcontent:label.contentManager.copyToSamples.replace' :
                        'jcontent:label.contentManager.copyToSamples.save')}
                    onClick={handleConfirm}
                />
            </DialogActions>
        </Dialog>
    );
};

SaveSampleDialog.propTypes = {
    name: PropTypes.string.isRequired,
    isReplacing: PropTypes.bool.isRequired,
    hasChildren: PropTypes.bool.isRequired,
    onConfirm: PropTypes.func.isRequired,
    onExit: PropTypes.func.isRequired
};
