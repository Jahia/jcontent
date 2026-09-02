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

import com.drew.metadata.iptc.IptcDirectory;
import org.junit.Test;

import java.util.HashSet;
import java.util.Map;
import java.util.Set;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNull;
import static org.junit.Assert.assertTrue;

public class IptcPropertyMappingTest {

    @Test
    public void mapsEveryFieldOfTheMixinFromIim() {
        Map<Integer, String> tags = IptcPropertyMapping.iimTags();

        assertEquals("the mixin declares 21 fields and each should be fed", 21, tags.size());
        assertEquals("j:iptcHeadline", tags.get(IptcDirectory.TAG_HEADLINE));
        assertEquals("j:iptcCaption", tags.get(IptcDirectory.TAG_CAPTION));
        assertEquals("j:iptcCity", tags.get(IptcDirectory.TAG_CITY));
        assertEquals("j:iptcByline", tags.get(IptcDirectory.TAG_BY_LINE));
        assertEquals("j:iptcCopyrightNotice", tags.get(IptcDirectory.TAG_COPYRIGHT_NOTICE));
    }

    @Test
    public void neverSendsTwoFieldsToTheSameProperty() {
        Set<String> properties = new HashSet<>(IptcPropertyMapping.iimTags().values());

        assertEquals("a property fed by two tags would silently lose one of them",
                IptcPropertyMapping.iimTags().size(), properties.size());
    }

    @Test
    public void mapsTheXmpEquivalentsOntoTheSameProperties() {
        // The whole point of merging provenances: a PNG carrying only XMP fills the same fields a
        // JPEG carrying only IIM would.
        assertEquals("j:iptcHeadline", IptcPropertyMapping.propertyForXmpPath("photoshop:Headline"));
        assertEquals("j:iptcCaption", IptcPropertyMapping.propertyForXmpPath("dc:description"));
        assertEquals("j:iptcKeywords", IptcPropertyMapping.propertyForXmpPath("dc:subject"));
        assertEquals("j:iptcByline", IptcPropertyMapping.propertyForXmpPath("dc:creator"));
        assertEquals("j:iptcCredit", IptcPropertyMapping.propertyForXmpPath("photoshop:Credit"));
        assertEquals("j:iptcSublocation", IptcPropertyMapping.propertyForXmpPath("Iptc4xmpCore:Location"));
    }

    @Test
    public void everyXmpTargetIsARealMixinProperty() {
        Set<String> iimProperties = new HashSet<>(IptcPropertyMapping.iimTags().values());

        for (String xmpPath : new String[]{"dc:title", "photoshop:Headline", "dc:description", "dc:subject",
                "dc:creator", "photoshop:Credit", "photoshop:Source", "dc:rights", "photoshop:City",
                "Iptc4xmpCore:Location", "photoshop:State", "photoshop:Country", "photoshop:DateCreated",
                "photoshop:Category", "photoshop:Instructions", "photoshop:Urgency",
                "photoshop:TransmissionReference", "photoshop:CaptionWriter", "photoshop:AuthorsPosition",
                "photoshop:SupplementalCategories"}) {
            String property = IptcPropertyMapping.propertyForXmpPath(xmpPath);
            assertTrue(xmpPath + " maps to " + property + ", which no IIM tag writes to",
                    iimProperties.contains(property));
        }
    }

    @Test
    public void stripsTheIndexFromArrayAndLanguageAlternativeProperties() {
        // Keywords arrive one entry at a time, and a localised caption arrives indexed even when there
        // is only one language.
        assertEquals("dc:subject", IptcPropertyMapping.normalizeXmpPath("dc:subject[1]"));
        assertEquals("dc:subject", IptcPropertyMapping.normalizeXmpPath("dc:subject[12]"));
        assertEquals("dc:description", IptcPropertyMapping.normalizeXmpPath("dc:description[1]"));
        assertEquals("j:iptcKeywords", IptcPropertyMapping.propertyForXmpPath("dc:subject[3]"));
    }

    @Test
    public void rejectsQualifiersRatherThanMistakingThemForValues() {
        // xml:lang describes the caption; storing it as the caption would be nonsense.
        assertNull(IptcPropertyMapping.normalizeXmpPath("dc:description[1]/xml:lang"));
        assertNull(IptcPropertyMapping.propertyForXmpPath("dc:description[1]/xml:lang"));
    }

    @Test
    public void leavesUnknownPropertiesAlone() {
        assertNull(IptcPropertyMapping.propertyForXmpPath("xmpMM:DocumentID"));
        assertNull(IptcPropertyMapping.propertyForXmpPath("tiff:Orientation"));
        assertNull(IptcPropertyMapping.propertyForXmpPath(null));
    }

    @Test
    public void contactIsIimOnlyOnPurpose() {
        // Its XMP counterpart is a structure of address, phone, email and web fields; flattening it
        // would invent a format nobody writes.
        assertTrue(IptcPropertyMapping.iimTags().containsValue("j:iptcContact"));
        assertNull(IptcPropertyMapping.propertyForXmpPath("Iptc4xmpCore:CreatorContactInfo"));
    }
}
