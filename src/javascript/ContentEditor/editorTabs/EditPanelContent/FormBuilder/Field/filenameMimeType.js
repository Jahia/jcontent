import mime from 'mime';
import {DEFAULT_MIME_TYPE} from '~/JContent/ContentRoute/ContentLayout/Upload/Upload.utils';

// Mime types that carry no opinion about the format: they are what the upload falls back to when
// nothing better is known, so disagreeing with the extension tells us nothing.
const UNDECIDED_MIME_TYPES = [DEFAULT_MIME_TYPE, 'application/binary'];

/**
 * Compares a file's name against the mime type stored on its jcr:content.
 *
 * The two drift apart because renaming a file only changes the node name - the rename mutation does
 * not touch jcr:mimeType - so a file uploaded as a PNG keeps saying image/png after being renamed
 * to .jpg. The stored type is the one thing that still reflects what was uploaded, so it is treated
 * here as the truth and the name as the thing to correct.
 *
 * Both sides are reduced to a mime type before comparing, rather than comparing extensions, so that
 * the aliases of one format do not register as a mismatch: .jpg and .jpeg both mean image/jpeg.
 *
 * @param {string} fileName name of the file, extension included
 * @param {string} storedMimeType value of jcr:mimeType
 * @returns {{storedMimeType: string, expectedExtension: string}|null} null when the two agree, or
 *          when neither side says anything conclusive
 */
export const getFilenameMimeTypeMismatch = (fileName, storedMimeType) => {
    if (!fileName || !storedMimeType) {
        return null;
    }

    // Stored types may carry parameters, e.g. "text/plain; charset=UTF-8"
    const stored = storedMimeType.split(';')[0].trim().toLowerCase();
    if (!stored || UNDECIDED_MIME_TYPES.includes(stored)) {
        return null;
    }

    // No extension at all is a different problem from a wrong one, and warning about it would fire
    // on every extension-less file, so it is left alone.
    const fromName = fileName.includes('.') ? mime.getType(fileName) : null;
    if (!fromName || fromName.toLowerCase() === stored) {
        return null;
    }

    return {
        storedMimeType: stored,
        // May be null: a type the mime database knows no extension for still warrants the warning,
        // it just cannot suggest what to rename the file to.
        expectedExtension: mime.getExtension(stored)
    };
};
