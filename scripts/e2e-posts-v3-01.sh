#!/bin/bash
STDIN=$(cat -)
outputDir=$(./bin/run crawl -u $STDIN | tail -n 1)
./bin/run process $outputDir -d 2 -r 1
./bin/run generate $outputDir