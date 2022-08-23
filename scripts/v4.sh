#!/bin/bash
outputDir=$(./bin/run crawl -u "https://www.reddit.com/r/AskReddit/comments/w3vre0/anesthesiologists_of_reddit_what_was_something/" | tail -n 2)
echo $outputDir
./bin/run process $outputDir -d 2 -r 1 -l 30000
./bin/run generate $outputDir