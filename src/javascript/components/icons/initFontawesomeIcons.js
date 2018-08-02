import { library } from '@fortawesome/fontawesome-svg-core';
import {
    faFilePowerpoint,
    faFileWord,
    faFileExcel,
    faFileImage,
    faFilePdf,
    faChevronDown,
    faImage,
    faFileVideo,
    faFileAudio,
    faFileArchive,
    faFileCode,
    faFile,
    faFolder,
    faFileAlt
} from '@fortawesome/free-solid-svg-icons';

export const initFontawesomeIcons = function() {
    library.add(faFilePowerpoint);
    library.add(faFileWord);
    library.add(faFileExcel);
    library.add(faFileImage);
    library.add(faFilePdf);
    library.add(faChevronDown);
    library.add(faImage);
    library.add(faFileVideo);
    library.add(faFileAudio);
    library.add(faFileArchive);
    library.add(faFileCode);
    library.add(faFile);
    library.add(faFolder);
    library.add(faFileAlt);
};