./bin/run crawl -u "https://www.reddit.com/r/AskReddit/comments/dx7hyx/albert_einstein_once_said_if_you_judge_a_fish_by/f7nznen?utm_source=share&utm_medium=web2x" -u "https://www.reddit.com/r/AskReddit/comments/f36iha/lawyers_of_reddit_what_is_a_detail_that_your/fhgxgu2?utm_source=share&utm_medium=web2x"
./bin/run process temp -d 1 -r 0 -l 60000
./bin/run generate temp