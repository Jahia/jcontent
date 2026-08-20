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

import com.drew.lang.SequentialByteArrayReader;
import com.drew.metadata.Metadata;
import com.drew.metadata.iptc.IptcDirectory;
import com.drew.metadata.photoshop.PhotoshopReader;
import org.junit.Test;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertNull;
import static org.junit.Assert.assertTrue;

public class PngRawIptcProfileTest {

    /**
     * A complete profile as a PNG text chunk carries it: name line, byte count, then the payload as
     * hex. The payload is a Photoshop image resource block ("8BIM", resource 0x0404) wrapping three
     * IPTC datasets - City "Barcelona", Headline "iptc headline" and By-line "clement".
     */
    private static final String RAW_PROFILE = "\nIPTC profile\n"
            + "      56\n"
            + "3842494d040400000000002c1c025a000942617263656c6f6e611c0269000d6970\n"
            + "746320686561646c696e651c02500007636c656d656e74\n";

    @Test
    public void recognisesTheChunkKeyword() {
        assertTrue(PngRawIptcProfile.isRawIptcProfile("Raw profile type iptc"));
        assertTrue(PngRawIptcProfile.isRawIptcProfile("raw profile type iptc"));
        assertTrue(PngRawIptcProfile.isRawIptcProfile("  Raw profile type iptc  "));
        assertFalse(PngRawIptcProfile.isRawIptcProfile("Raw profile type exif"));
        assertFalse(PngRawIptcProfile.isRawIptcProfile(null));
    }

    @Test
    public void decodesTheHexPayload() {
        byte[] decoded = PngRawIptcProfile.decode(RAW_PROFILE);

        assertNotNull(decoded);
        assertEquals(56, decoded.length);
        // "8BIM", the marker that says this is a Photoshop resource block rather than a bare IPTC
        // stream - the distinction the caller depends on.
        assertEquals('8', decoded[0]);
        assertEquals('B', decoded[1]);
        assertEquals('I', decoded[2]);
        assertEquals('M', decoded[3]);
    }

    @Test
    public void ignoresLeadingBlankLinesAndPaddingAroundTheCount() {
        // Writers disagree about the leading newline and right-align the count to a varying width, so
        // the count is found by shape rather than by line number.
        byte[] withoutLeadingNewline = PngRawIptcProfile.decode(RAW_PROFILE.substring(1));
        byte[] withWideCount = PngRawIptcProfile.decode(RAW_PROFILE.replace("      56", "          56"));

        assertNotNull(withoutLeadingNewline);
        assertEquals(56, withoutLeadingNewline.length);
        assertNotNull(withWideCount);
        assertEquals(56, withWideCount.length);
    }

    @Test
    public void acceptsWindowsLineEndings() {
        byte[] decoded = PngRawIptcProfile.decode(RAW_PROFILE.replace("\n", "\r\n"));

        assertNotNull(decoded);
        assertEquals(56, decoded.length);
    }

    @Test
    public void keepsWhatParsedWhenThePayloadIsTruncatedMidWay() {
        // The real-world failure mode: a profile cut short. The datasets that did arrive are still
        // worth having.
        byte[] decoded = PngRawIptcProfile.decode("\nIPTC profile\n      56\n3842494d0404\n");

        assertNotNull(decoded);
        assertEquals(6, decoded.length);
    }

    @Test
    public void returnsNothingWhenTheTextIsNotAProfile() {
        assertNull(PngRawIptcProfile.decode(null));
        assertNull(PngRawIptcProfile.decode(""));
        // No byte count anywhere, so there is no payload to find.
        assertNull(PngRawIptcProfile.decode("just some comment a user typed"));
        // A count but nothing usable after it.
        assertNull(PngRawIptcProfile.decode("\nIPTC profile\n      56\nzzzz\n"));
    }

    /**
     * The point of the whole exercise: what PNG hands us really does turn into IPTC values. This is
     * the step Tika and metadata-extractor both stop short of, so it is worth pinning down.
     */
    @Test
    public void decodedProfileYieldsIptcValues() throws Exception {
        byte[] decoded = PngRawIptcProfile.decode(RAW_PROFILE);

        Metadata metadata = new Metadata();
        new PhotoshopReader().extract(new SequentialByteArrayReader(decoded), decoded.length, metadata);

        IptcDirectory iptc = metadata.getFirstDirectoryOfType(IptcDirectory.class);
        assertNotNull("the Photoshop block should have been unwrapped into an IPTC directory", iptc);
        assertEquals("Barcelona", iptc.getString(IptcDirectory.TAG_CITY));
        assertEquals("iptc headline", iptc.getString(IptcDirectory.TAG_HEADLINE));
        assertEquals("clement", iptc.getString(IptcDirectory.TAG_BY_LINE));
    }
}
