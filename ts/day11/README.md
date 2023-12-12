# Day 11

1. expand universe without galaxies
2. find sum of shortest manhattan distance to all galaxies

## Why i was stuck

if a row or a column expands tenfold, the total distance increment is 9, **not 10**.

say this column marked `v` expands **twice**:

```
 v
...#......
```
`#`: 3

only 1 unit of distance is added to the total, not 2.

```
 v1
..1.#......
```
`#`: 4

if `v` expands **10 times**:

```
 v123456789
..123456789.#......
```

9 units of distance is added to the total, not 10. This is because the **original column has a length of 1**.
thus, the x position of `#` is 4 + 9 = 13, not 14.
