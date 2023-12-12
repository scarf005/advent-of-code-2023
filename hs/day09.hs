#! /usr/bin/env cabal
{- cabal:
build-depends: base
-}

import Data.Functor ((<&>))

lastDiff :: [Int] -> Int
lastDiff xs = last xs - last (init xs)

diff :: [Int] -> [Int]
diff xs = zipWith (-) (tail xs) xs

-- | predicts the next number in the sequence
-- by finding 'acceleration' from recursive diffs.
--
-- >>> next [0, 3, 6, 9, 12, 15]
-- 18
-- >>> next [1, 3, 6, 10, 15, 21]
-- 28
-- >>> next [10, 13, 16, 21, 30, 45]
-- 60
next :: [Int] -> Int
next xs = last xs + if all (== 0) ys then lastDiff xs else next ys
    where
        ys = diff xs

-- | predicts the previous number in the sequence
-- by finding 'deceleration' from recursive diffs.
--
-- >>> prev [0, 3, 6, 9, 12, 15]
-- -3
-- >>> prev [1, 3, 6, 10, 15, 21]
-- 0
-- >>> prev [10, 13, 16, 21, 30, 45]
-- 5
prev :: [Int] -> Int
prev xs = head xs - if all (== 0) ys then lastDiff xs else prev ys
    where
        ys = diff xs

solution :: [Int] -> Int
solution = prev

parse :: String -> [[Int]]
parse = map (map read . words) . lines

example :: [[Int]]
example =
    [ [0, 3, 6, 9, 12, 15]
    , [1, 3, 6, 10, 15, 21]
    , [10, 13, 16, 21, 30, 45]
    ]

part1 :: String -> Int
part1 = sum . map next . parse

part2 :: String -> Int
part2 = sum . map prev . parse

main :: IO ()
main = do
    print $ map next example
    print $ map prev example

    text <- readFile ".cache/09.txt"
    print $ part1 text
    print $ part2 text
