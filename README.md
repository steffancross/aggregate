# Aggregate

Built this because I listen to music on multiple platforms and didn't like having duplicate and incomplete playlists. Can make playlists from spotify, soundcloud, and youtube. Endgame for me would be when pasting in a new song link, download and host rather than dealing with the jank and workarounds of using embedded players. That will be done when I setup a home server. 

## Supported sources
- Youtube (video links)
- Soundcloud (track links)
- Spotify (track links)

(playlist and album support in the future)

## How it works
The audio controller manages which embedded player/sdk adapter to use based on the current track's source. Each source has their own adapter implementation that exposes a common set of controls (play, pause, seek, etc). When playback starts, a hidden audio element is started to regain media session authority. 

## Limitations
A spotify premium account is required. 

Desktop browsers work pretty well. Because of a lagging race condition on initial play sometimes you will lose media session authority, pausing and unpausing remedies this.

On mobile, at least ios, it can get flaky depending on browser. Common issue is having to double click play for each song. This is due to stricter autoplay and gesture chain rules. Brave is the best browser as autoplay works and it allows youtube to play in the background/locked.  

No path to create an account, pre-populate in clerk. 

## Stack

- **Framework**: [Next.js](https://nextjs.org) 15 with React 19
- **Database**: [Prisma](https://prisma.io) with PostgreSQL
- **API**: [tRPC](https://trpc.io) 
- **Authentication**: [Clerk](https://clerk.com) 
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs)

## Status

This project is somewhat in development. The core functionality works and solves my problem. I have a few more features that I may get to but will likely be focusing on other projects. Look toward the issues tab for the list. 

### Maybe in the future
- Migration to host all tracks rather than stream from source
- Upload songs from device
- Bulk playlist loader
- Browser extension 
- Testing and better patterns
- Performance optimizations
