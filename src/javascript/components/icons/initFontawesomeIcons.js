import { library } from '@fortawesome/fontawesome-svg-core';
import {
    faFilePowerpoint,
    faFileWord,
    faFileExcel,
    faFileImage,
    faFilePdf,
    faImage,
    faFileVideo,
    faFileAudio,
    faFileArchive,
    faFileCode,
    faFile,
    faFolder,
    faFileAlt
} from '@fortawesome/free-regular-svg-icons';

import { faChevronDown, faChevronLeft, faChevronRight, faChevronUp } from '@fortawesome/free-solid-svg-icons';

export const initFontawesomeIcons = function() {
    library.add(faFilePowerpoint);
    library.add(faFileWord);
    library.add(faFileExcel);
    library.add(faFileImage);
    library.add(faFilePdf);
    library.add(faImage);
    library.add(faFileVideo);
    library.add(faFileAudio);
    library.add(faFileArchive);
    library.add(faFileCode);
    library.add(faFile);
    library.add(faFolder);
    library.add(faFileAlt);
    library.add(faChevronDown);
    library.add(faChevronUp);
    library.add(faChevronLeft);
    library.add(faChevronRight);
};