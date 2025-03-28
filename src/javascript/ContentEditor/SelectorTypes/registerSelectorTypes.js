import {registerSelectorTypesOnChange} from './registerSelectorTypesOnChange';
import {registerChoiceList} from './ChoiceList';
import {registerTag} from './Tag';
import {registerText} from './Text';
import {registerCategory} from './Category';
import {registerTextArea} from './TextAreaField';
import {registerRichText} from './RichText';
import {registerColor} from './Color';
import {registerDateTimePicker} from './DateTimePicker';
import {registerBoolean} from './Boolean';
import {registerPicker} from './Picker';
import {registerSystemName} from './SystemName';
import {registerMultipleLeftRightSelector} from './MultipleLeftRightSelector';
import {registerRadioChoiceList} from './RadioChoiceList';
import {registerCheckboxChoiceList} from './CheckboxChoiceList';
import {registerChoiceTree} from './ChoiceTree';

export const registerSelectorTypes = ceRegistry => {
    registerSelectorTypesOnChange(ceRegistry);

    registerCategory(ceRegistry);
    registerTag(ceRegistry);
    registerText(ceRegistry);
    registerTextArea(ceRegistry);
    registerRichText(ceRegistry);
    registerColor(ceRegistry);
    registerDateTimePicker(ceRegistry);
    registerBoolean(ceRegistry);
    registerPicker(ceRegistry);
    registerChoiceList(ceRegistry);
    registerRadioChoiceList(ceRegistry);
    registerCheckboxChoiceList(ceRegistry);
    registerSystemName(ceRegistry);
    registerMultipleLeftRightSelector(ceRegistry);
    registerChoiceTree(ceRegistry);
};

