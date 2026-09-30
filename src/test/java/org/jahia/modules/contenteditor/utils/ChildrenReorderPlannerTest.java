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
package org.jahia.modules.contenteditor.utils;

import org.jahia.modules.contenteditor.utils.ChildrenReorderPlanner.Move;
import org.junit.Test;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Random;
import java.util.Set;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

public class ChildrenReorderPlannerTest {

    private static final List<String> CHILDREN = Arrays.asList("main", "A", "B", "readOnly", "D");
    private static final Set<String> READ_ONLY = Collections.singleton("readOnly");

    @Test
    public void keepsTheLockedChildInItsPositionWhenAPageCrossesIt() {
        List<String> target = ChildrenReorderPlanner.targetOrder(CHILDREN, Arrays.asList("D", "B", "readOnly", "A"), READ_ONLY);

        assertEquals(Arrays.asList("main", "D", "B", "readOnly", "A"), target);
        assertReaches(CHILDREN, target, READ_ONLY);
    }

    @Test
    public void putsTheLockedChildBackInItsPositionWhenTheRequestMovesIt() {
        List<String> target = ChildrenReorderPlanner.targetOrder(CHILDREN, Arrays.asList("readOnly", "A", "B", "D"), READ_ONLY);

        assertEquals(CHILDREN, target);
        assertTrue(ChildrenReorderPlanner.plan(CHILDREN, target, READ_ONLY).isEmpty());
    }

    @Test
    public void keepsTheChildrenThatAreNotRequestedInTheirPositions() {
        List<String> target = ChildrenReorderPlanner.targetOrder(CHILDREN, Arrays.asList("B", "A", "D"), Collections.emptySet());

        assertEquals(Arrays.asList("main", "B", "A", "readOnly", "D"), target);
        assertReaches(CHILDREN, target, Collections.emptySet());
    }

    @Test(expected = IllegalArgumentException.class)
    public void refusesAnUnknownName() {
        ChildrenReorderPlanner.targetOrder(CHILDREN, Arrays.asList("A", "unknown"), READ_ONLY);
    }

    @Test(expected = IllegalArgumentException.class)
    public void refusesARepeatedName() {
        ChildrenReorderPlanner.targetOrder(CHILDREN, Arrays.asList("A", "B", "A"), READ_ONLY);
    }

    @Test
    public void reachesEveryTargetWithoutMovingALockedChild() {
        Random random = new Random(2795);
        for (int run = 0; run < 2000; run++) {
            List<String> current = new ArrayList<>();
            Set<String> locked = new HashSet<>();
            int size = 1 + random.nextInt(9);
            for (int i = 0; i < size; i++) {
                current.add("n" + i);
                if (random.nextInt(3) == 0) {
                    locked.add("n" + i);
                }
            }
            Collections.shuffle(current, random);
            List<String> requested = new ArrayList<>(current.subList(0, random.nextInt(size + 1)));
            Collections.shuffle(requested, random);

            assertReaches(current, ChildrenReorderPlanner.targetOrder(current, requested, locked), locked);
        }
    }

    private static void assertReaches(List<String> current, List<String> target, Set<String> locked) {
        for (String name : locked) {
            assertEquals("Position of " + name, current.indexOf(name), target.indexOf(name));
        }
        List<Move> moves = ChildrenReorderPlanner.plan(current, target, locked);
        for (Move move : moves) {
            assertFalse("Locked source in " + move, locked.contains(move.getSource()));
        }
        List<String> names = new ArrayList<>(current);
        ChildrenReorderPlanner.apply(names, moves);
        assertEquals(target, names);
    }
}
