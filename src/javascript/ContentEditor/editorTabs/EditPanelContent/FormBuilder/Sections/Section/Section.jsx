import {Collapsible} from '@jahia/moonstone';
import {FieldSet} from '../../FieldSet';
import React from 'react';
import PropTypes from 'prop-types';
import {SectionPropTypes} from '~/ContentEditor/ContentEditor.proptypes';
import {filterFieldSets} from '~/ContentEditor/editorTabs/EditPanelContent/FormBuilder/Sections';

export const Section = ({section, isExpanded, onClick}) => {
    const fieldSets = filterFieldSets(section.fieldSets);

    if (fieldSets.length === 0) {
        return null;
    }

    const sectionName = section.displayName === '' ? section.name : section.displayName;

    if (section.hideHeader) {
        return fieldSets?.map(fs => <FieldSet key={fs.name} fieldset={fs}/>);
    }

    return (
        <Collapsible data-sel-content-editor-fields-group={sectionName}
                     label={sectionName}
                     isExpanded={isExpanded}
                     onClick={onClick}
        >
            { fieldSets?.map(fs => <FieldSet key={fs.name} fieldset={fs}/>) }
        </Collapsible>
    );
};

Section.propTypes = {
    section: SectionPropTypes.isRequired,
    isExpanded: PropTypes.bool.isRequired,
    onClick: PropTypes.func.isRequired
};

