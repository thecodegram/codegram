# CodeGram
## Problem Statement
[leetcode.com](leetcode.com) offers a great platform to gain programming skills, but there is little to none social or competitive aspects to it. Studies show that gamification boosts retention, meaning CodeGram will help programmers improve their skills.  

## Solution
CodeGram is a competitive social networking app similar to apps such as [Strava](strava.com) but with LeetCode as the activity. Users can add friends with their user id's and receive notifications if you're friends successfully complete a new problem. Other common social media components like news feeds, stories, likes/comments, and profile pages will be implemented to show scores, stats, and updates.

## User workflow
A user will create an account and login to the app with their unique LeetCode User ID. They will be able to add friends or follow other users by User ID. The user's CodeGram newsfeed will show the most recent updates including their friends activities (e.g. "🔔 janedoe123 has complete a new LeetCode Hard problem!"). They can click on their friends usernames to view their profile which will show stats like how many Easy, Medium, and Hard problems the user has completed. We will explore and implement various gamification and social networking components such as scoreboards, challenges, and rewards. 

## Internal, External Service(s) and Database(s)

![CodeGram_architecture_and_models drawio (1)](https://github.com/peyz21/codegram/assets/64120482/68fe5c6b-59bd-48f7-88a3-386f871dfeb6)



## Technology Stack
### Frontend framework
Either React or Angular will be used, and data visualization libraries such as Chart.js will be used. 

### Internal Service
Our internal service will use the Node.js/Express stack

### External Services
We will use the [leetcode-stats-api](https://github.com/JeremyTsaii/leetcode-stats-api) to get user's LeetCode stats and explore other external services to help bootstrap our application, including but not limited to services for authentication and integration with other social media apps (Instagram, Facebook, etc.).

### Database
Our internal service will connect to a MongoDB NoSQL database to store user data for seamless horizontal scalability.

## Authentication
Users will need to create an account and login to access the CodeGram functionality. We will further explore external APIs like auth0 for our authentication. 

