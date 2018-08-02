import { library } from '@fortawesome/fontawesome-svg-core';
import { faFilePowerpoint, faFileWord,faFileExcel, faFileImage, faFilePdf, faChevronDown } from '@fortawesome/free-solid-svg-icons';

export const initFontawesomeIcons = function() {
    library.add(faFilePowerpoint);
    library.add(faFileWord);
    library.add(faFileExcel);
    library.add(faFileImage);
    library.add(faFilePdf);
    library.add(faChevronDown);
};