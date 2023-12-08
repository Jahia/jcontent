import React, {useState} from 'react';
import {useContentEditorSectionContext} from '~/ContentEditor/contexts';
import {Validation} from '~/ContentEditor/editorTabs/EditPanelContent/FormBuilder/Validation';
import styles from './DateTime.scss';
import {DisplayAction} from '@jahia/ui-extender';
import {getButtonRenderer} from '~/ContentEditor/utils';
import {useTranslation} from 'react-i18next';
import stylesFieldset from '~/ContentEditor/editorTabs/EditPanelContent/FormBuilder/FieldSet/FieldSet.scss';
import {Toggle} from '@jahia/design-system-kit';
import {Edit, Typography} from '@jahia/moonstone';
import PropTypes from 'prop-types';

const ButtonRenderer = getButtonRenderer({
    defaultButtonProps: {
        variant: 'outlined',
        size: 'medium',
        color: 'accent',
        buttonIcon: <Edit/>
    }
});

const filterRegularFieldSets = fieldSets => {
    const showFieldSet = fieldSet => {
        if (!fieldSet || fieldSet.name !== 'jmix:conditionalVisibility') {
            return false;
        }

        if (fieldSet.dynamic && !fieldSet.hasEnableSwitch && !fieldSet.activated) {
            return false;
        }

        // We must hide fieldSet in the section when the fieldSet is not dynamic and
        // the fieldSet doesn't contain any fields (empty).
        return fieldSet.dynamic || fieldSet.fields.length > 0;
    };

    return fieldSets.filter(fs => showFieldSet(fs));
};

export const DateTime = ({rules}) => {
    const {t} = useTranslation('jcontent');
    const {sections} = useContentEditorSectionContext();
    const section = sections.filter(s => s.name === 'visibility');
    const fieldSets = filterRegularFieldSets(section[0].fieldSets);
    const [activatedSection, setActivatedSection] = useState(rules.length > 0);

    if (fieldSets.length === 0) {
        return null;
    }

    const handleChange = () => {
        setActivatedSection(!activatedSection);
    };

    return (
        <div className={styles.container}>
            <Validation/>
            <section>
                <article>
                    <div className={stylesFieldset.fieldSetTitleContainer}>
                        <div className="flexRow_nowrap">
                            <Toggle
                                classes={{
                                    root: stylesFieldset.toggle
                                }}
                                data-sel-role-dynamic-fieldset="jmix:conditionalVisibility"
                                id="jmix:conditionalVisibility"
                                checked={activatedSection}
                                onChange={handleChange}
                            />
                            <div className="flexCol">
                                <Typography component="label"
                                            htmlFor="jmix:conditionalVisibility"
                                            className={stylesFieldset.fieldSetTitle}
                                            variant="subheading"
                                            weight="bold"
                                >
                                    {t('jcontent:label.contentEditor.visibilityTab.conditions.title')}
                                </Typography>
                            </div>
                        </div>
                    </div>
                    <div className={stylesFieldset.fields}>
                        {activatedSection &&
                            <DisplayAction actionKey="contentEditorGWTTabAction_visibility"
                                           render={props => (
                                               <div className={styles.row}>
                                                   <Typography>{rules.length === 0 ? t('jcontent:label.contentEditor.visibilityTab.conditions.norules') : t('jcontent:label.contentEditor.visibilityTab.conditions.rules', {rulesNumber: rules.length})}</Typography>
                                                   <ButtonRenderer {...props}
                                                                   buttonLabel={t('jcontent:label.contentManager.editAction')}/>
                                               </div>
                                           )}
                            />}
                    </div>
                </article>
            </section>
        </div>
    );
};

DateTime.propTypes = {
    rules: PropTypes.array
};
