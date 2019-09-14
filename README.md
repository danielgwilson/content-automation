# Reddit YouTube Video Bot

## Project summary

End-to-end automated Reddit YouTube video bot that scrapes content, generates formatted videos, and uploads them to a channel.

Created by Daniel G. Wilson, Chris Castaneda, Edward Guardado, and NOT Arjun N (lame).

*README last updated on 2019-09-14*

## Background

This project is inspired by the recent and high-volume influx of YouTube videos of computer-narrated Ask Reddit posts.

Examples:

![][askreddit-videos-sc]

These videos attract hundreds of thousands of views, and consist of little more than existing Reddit content, computer-narration, and simple transitions.

The motivation behind this project was the observation that this (surprisingly popular) format seems rather easy to automate—even completely.

## Goals

The goals of this project are to:

1. Prove the feasibility of automated video generation and video content creation from existing online / reddit content.
2. Create a robust system that can generate such videos at sufficiently high quality to compete with existing channels in the genre.
3. Construct an end-to-end system that could feasibly run autonomously for an indefinite period.
4. Produce an end product that requires minimal / zero human direction to operate.

## Out of scope

The following topics are expressly out of scope and are therefore discussed minimally, if at all.

## Objectives and key results

1. We can generate high-quality videos based on Reddit content automatically.
   1. We generate high-quality audio narration for 10 randomly selected Reddit posts.
   2. We generate video containing this audio and the Reddit posts.
   3. We generate 10 composite videos each containing 10 randomly selected Reddit posts.
   4. We generate 10 such *cohesive* composite videos with titles, transitions, and additional elements such that they could have been created by a human professional.
2. We can scrape popular Reddit content and format it for video generation automatically.
   1. We scrape 10 randomly selected Reddit posts from a target subreddit.
   2. We format 10 scraped Reddit posts such that they are ready for video generation.
   3. We scrape 10 heuristically selected Reddit posts from a target subreddit and format them.
   4. We scrape 10 heuristically selected Reddit posts from a heuristically selected subreddit and format them.
3. We can automatically orchestrate content scraping, video generation, video upload, and channel management without additional human intervention.
   1. We set up infrastructure such that content generation and orchestration can take place on some cloud hosting provider (vs. locally during development).
   2. We automate Reddit scraping such that we have 10 high quality and formatted content chunks of 10 reddit posts per day.
   3. We automate video generation for 10 videos per day.
   4. We automate video uploading to a YouTube channel for 10 videos per day.
   5. We automate telemetry, messaging, alerts, etc. such that we never have to "babysit" the service.

## Key scenarios

### Video generation

| #    | Title            | Description                                                                                                                                                            | Priority | Notes |
| :--- | :--------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------- | :---- |
| 1    | Generate audio   | Given some text, generate audio narration.                                                                                                                             | 1        |       |
| 2    | Generate video   | Given some audio, generate video containing arbitrary content of the correct length containing the audio.                                                              | 1        |       |
| 3    | Video content    | Given some audio and text, generate video content displaying the text (e.g. of the Reddit post)                                                                        | 1        |       |
| 4    | Text animation   | Given some text, generate video displaying the text and animating it such that it highlights or appears in sync with an audio narration.                               | 3        |       |
| 5    | Sequencing       | Given 10 sets of text, generate a single sequenced video containing 10 sub-videos for each text piece.                                                                 | 1        |       |
| 6    | Titling          | Given some 10 sets of text and a category/title, generate titles (optionally with design, animation, narration) such that the topic is introduced.                     | 1        |       |
| 7    | "Chrome"         | Given some video sequence, generate a final sequence with additional "chrome"—i.e. sound effects, graphics, additional animation, transitions, etc.                    | 3        |       |
| 8    | End-card         | Given some sequence on a category/topic, generate a channel info end-card containing "Please like and subscribe, etc." and the channel info (dynamic).                 | 2        |       |
| 9    | End-card links   | Given some end-card and target videos, add spaces for sub-videos such that they can be linked to and recommended (so that people keep watching the channel's content). | 3        |       |
| 10   | Post format      | Given some Reddit post text, author, etc., generate video content that is formatted to look like a Reddit post.                                                        | 2        |       |
| 11   | Long posts       | Given some very long Reddit post text, generate video content such that it is intelligently paginated / split across multiple cuts.                                    | 2        |       |
| 12   | Comment chains   | Given some Reddit post text and its accompanying comment chain, generate video content such that it is intelligently paginated / split across multiple cuts.           | 3        |       |
| 13   | Thumbnail        | Generate a thumbnail given misc. content                                                                                                                               | 1        |       |
| 14   | Description      | Generate a YouTube video description given misc. content                                                                                                               | 1        |       |
| 15   | Tags             | Generate YouTube video tags given misc. content                                                                                                                        | 1        |       |
| 16   | Censor profanity | Remove profanity s.t. videos / channel are not de-monetized                                                                                                            | 2        |       |

### Reddit scraping

| #    | Title               | Description                                                            | Priority | Notes |
| :--- | :------------------ | :--------------------------------------------------------------------- | :------- | :---- |
| 1    | Post content        | Scrape some arbitrary Reddit post's content.                           | 1        |       |
| 2    | Post author         | Scrape some arbitrary Reddit post's author (username).                 | 1        |       |
| 3    | Post comments       | Scrape some arbitrary Reddit post's comment chain.                     | 3        |       |
| 4    | Subreddit top posts | Scrape content, author, and comment chains given some target subreddit | 1        |       |

### Infrastructure

| #    | Title | Description | Priority | Notes |
| :--- | :---- | :---------- | :------- | :---- |


## Design

## Telemetry

| #    | Title | Description | Priority | Notes |
| :--- | :---- | :---------- | :------- | :---- |

## Dependencies

## Appendix

[askreddit-videos-sc]: askreddit-videos-sc.png