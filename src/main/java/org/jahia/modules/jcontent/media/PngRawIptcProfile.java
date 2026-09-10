/*
 * MIT License
 *
 * Copyright (c) 2002 - 2022 Jahia Solutions Group. All rights reserved.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
package org.jahia.modules.jcontent.media;

/**
 * Decodes the metadata profile ImageMagick (and anything else following its convention) writes into
 * a PNG text chunk keyed "Raw profile type iptc".
 * <p>
 * PNG has no IPTC chunk of its own, so the IPTC block is stored as text, hex-encoded, in a tEXt /
 * zTXt / iTXt chunk shaped like this:
 *
 * <pre>
 * IPTC profile
 *      176
 * 3842494d04040000000000a31c015a00031b25471c0100000200041c02500014636c656d
 * 656e7420657869662063726561746f721c0269000f6970746320686561646c696e652e20
 * </pre>
 *
 * A name line, a byte count, then the payload as hex wrapped at 72 characters. Neither Tika nor
 * metadata-extractor decodes this, so we do: metadata-extractor's PNG reader surfaces the chunk as
 * plain text and stops there, which is why a PNG carrying perfectly good IPTC looks empty.
 * <p>
 * What comes out is not a bare IPTC stream but a Photoshop image resource block - {@code 8BIM},
 * resource {@code 0x0404} - so the caller hands it to {@code PhotoshopReader}, which unwraps the
 * block and dispatches the payload to the IPTC reader.
 */
final class PngRawIptcProfile {

    /**
     * The keyword such a chunk carries. Compared case-insensitively: the convention is lowercase
     * "iptc", but the keyword is free text and not worth being strict about.
     */
    static final String KEYWORD = "raw profile type iptc";

    private PngRawIptcProfile() {
    }

    static boolean isRawIptcProfile(String keyword) {
        return keyword != null && KEYWORD.equalsIgnoreCase(keyword.trim());
    }

    /**
     * @param rawProfile the chunk's text value
     * @return the decoded bytes, or null when the text does not look like a hex profile at all
     */
    static byte[] decode(String rawProfile) {
        if (rawProfile == null) {
            return null;
        }

        // Locate the byte count rather than counting lines from the top: some writers put a leading
        // blank line before the name, and the name itself is not fixed. The first all-digit line is
        // unambiguous, because the count always precedes the payload.
        String[] lines = rawProfile.split("\\r?\\n");
        int countLine = -1;
        for (int i = 0; i < lines.length; i++) {
            if (isDigits(lines[i].trim())) {
                countLine = i;
                break;
            }
        }

        if (countLine < 0) {
            return null;
        }

        StringBuilder hex = new StringBuilder();
        for (int i = countLine + 1; i < lines.length; i++) {
            hex.append(lines[i].trim());
        }

        return decodeHex(hex);
    }

    private static boolean isDigits(String value) {
        if (value.isEmpty()) {
            return false;
        }

        for (int i = 0; i < value.length(); i++) {
            if (value.charAt(i) < '0' || value.charAt(i) > '9') {
                return false;
            }
        }

        return true;
    }

    /**
     * Decodes as much of the sequence as is valid hex, stopping at the first character that is not.
     * A truncated or padded profile still yields the datasets that did survive, which beats
     * discarding the lot: the reader downstream is tolerant of a short block.
     */
    private static byte[] decodeHex(CharSequence hex) {
        int usable = hex.length() - (hex.length() % 2);
        byte[] bytes = new byte[usable / 2];
        int written = 0;

        for (int i = 0; i < usable; i += 2) {
            int high = digit(hex.charAt(i));
            int low = digit(hex.charAt(i + 1));
            if (high < 0 || low < 0) {
                break;
            }

            bytes[written++] = (byte) ((high << 4) | low);
        }

        if (written == 0) {
            return null;
        }

        if (written == bytes.length) {
            return bytes;
        }

        byte[] truncated = new byte[written];
        System.arraycopy(bytes, 0, truncated, 0, written);
        return truncated;
    }

    private static int digit(char c) {
        if (c >= '0' && c <= '9') {
            return c - '0';
        }

        if (c >= 'a' && c <= 'f') {
            return c - 'a' + 10;
        }

        if (c >= 'A' && c <= 'F') {
            return c - 'A' + 10;
        }

        return -1;
    }
}
