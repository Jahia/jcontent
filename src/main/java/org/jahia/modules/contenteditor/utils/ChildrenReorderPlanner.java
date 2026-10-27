package org.jahia.modules.contenteditor.utils;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.Iterator;
import java.util.LinkedList;
import java.util.List;
import java.util.Set;

/**
 * Plans the {@code orderBefore} calls that put children in a requested order, without moving a locked child.
 * A locked child is one that the current user cannot move, so it is never the source of a call.
 */
public final class ChildrenReorderPlanner {

    /**
     * One {@code orderBefore(source, destination)} call. A null destination moves the source to the end.
     */
    public static final class Move {
        private final String source;
        private final String destination;

        Move(String source, String destination) {
            this.source = source;
            this.destination = destination;
        }

        public String getSource() {
            return source;
        }

        public String getDestination() {
            return destination;
        }

        @Override
        public String toString() {
            return source + " before " + destination;
        }
    }

    private ChildrenReorderPlanner() {
    }

    /**
     * Computes the order that the children must reach. The requested names fill, in their order, the positions
     * that these names hold now. Every other child and every locked child keeps its position.
     *
     * @param current   names of all the children, in their current order
     * @param requested names of the children to reorder, in the requested order
     * @param locked    names of the children that must not move
     * @return names of all the children, in the order to reach
     * @throws IllegalArgumentException when a requested name is unknown or repeated
     */
    public static List<String> targetOrder(List<String> current, List<String> requested, Set<String> locked) {
        Set<String> requestedNames = new HashSet<>(requested);
        if (requestedNames.size() != requested.size()) {
            throw new IllegalArgumentException("The requested names contain a duplicate");
        }
        if (!current.containsAll(requestedNames)) {
            throw new IllegalArgumentException("The requested names contain a child that does not exist");
        }

        Iterator<String> movables = requested.stream().filter(name -> !locked.contains(name)).iterator();
        List<String> target = new ArrayList<>(current.size());
        for (String name : current) {
            boolean refilled = requestedNames.contains(name) && !locked.contains(name);
            target.add(refilled ? movables.next() : name);
        }
        return target;
    }

    /**
     * Plans the calls that turn the current order into the target order. No call has a locked child as its source.
     * First, every movable child goes to the end, in target order. Then each movable child that the target puts
     * before a locked child goes back in front of that locked child.
     *
     * @param current names of all the children, in their current order
     * @param target  the same names, in the order to reach
     * @param locked  names of the children that must not move
     * @return the calls, in the order to run them, or an empty list when the order is already the target
     */
    public static List<Move> plan(List<String> current, List<String> target, Set<String> locked) {
        if (current.equals(target)) {
            return Collections.emptyList();
        }
        List<Move> moves = new ArrayList<>();
        for (String name : target) {
            if (!locked.contains(name)) {
                moves.add(new Move(name, null));
            }
        }
        String nextLocked = null;
        List<Move> backMoves = new LinkedList<>();
        for (int i = target.size() - 1; i >= 0; i--) {
            String name = target.get(i);
            if (locked.contains(name)) {
                nextLocked = name;
            } else if (nextLocked != null) {
                backMoves.add(0, new Move(name, nextLocked));
            }
        }
        moves.addAll(backMoves);
        return moves;
    }

    /**
     * Applies the calls to a list of names, the way {@code orderBefore} applies them to the children.
     *
     * @param names the names in their current order, which this method changes
     * @param moves the calls to apply
     */
    public static void apply(List<String> names, List<Move> moves) {
        for (Move move : moves) {
            names.remove(move.getSource());
            int index = move.getDestination() == null ? names.size() : names.indexOf(move.getDestination());
            names.add(index, move.getSource());
        }
    }
}
