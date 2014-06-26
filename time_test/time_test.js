if (Meteor.isClient) {

  Template.insertData.events({
    'click #clean': function () {
      Meteor.call('killAll', function (error, result) {
        console.log("Cleaned");
      });
    },
    'click #insert': function () {
      Meteor.call('insertData', function (error, result) {
        document.getElementById("iansertr").innerHTML = result;
      });
    }
  });
  
  // searches
  Template.searchThreadsCount2013.events({
    'click #search1': function () {
      var startTime = new Date().getTime();
      var start = new Date(2013, 0, 1);
      var end = new Date(2014, 0, 1);
      var count = Threads.find({createDate: {$gte: start, $lt: end}});
      var finalResult = count.count();
      var endTime = new Date().getTime();
      document.getElementById('search1r').innerHTML = endTime - startTime;
      document.getElementById('search1result').innerHTML = finalResult;
    },
  });
  
  Template.searchMostPopularMay2013.events({
    'click #search2': function () {
      
      var startTime = new Date().getTime();
      var start = new Date(2013, 4, 1);
      var end = new Date(2013, 5, 1);
      var result = Threads.find({"posts.sent": {$gte: start, $lt: end}}, {fields: {title: 1, "posts": 1}, transform: function(thread) {
        thread.posts = thread.posts.filter(function (post) {
          return post.sent >= start && post.sent < end;
        });
        return thread;
      }});
      var threads = result.fetch().filter(function(thread) {
        return thread.posts.length > 0;
      });
      
      var maximum = 0;
      var maxKey = "";
      for (var i = 0; i < threads.length; i++) {
        if (maximum < threads[i].posts.length) {
          maximum = threads[i].posts.length;
          maxKey = threads[i].title;
        }
      }
      
      var endTime = new Date().getTime();
      
      document.getElementById('search2r').innerHTML = endTime - startTime;
      document.getElementById('search2result').innerHTML = maxKey + " (" + maximum + ")";
    },
  });
  
  // searches
  Template.searchAvgPostLen.events({
    'click #search3': function () {
      var startTime = new Date().getTime();
      var threadPostsStats = Threads.find({}, {transform: function (thread) {
        return {len: thread.posts.reduce(function (a, b) { return a + b.content.length; }, 0), count: thread.posts.length};
      }});
      var threads = threadPostsStats.fetch();
      var postsLen = 0, postsCount = 0;
      for (var i = 0; i < threads.length; i++) {
        postsLen += threads[i].len;
        postsCount += threads[i].count;
      }
      var finalResult = postsLen / postsCount;
      var endTime = new Date().getTime();
      document.getElementById('search3r').innerHTML = endTime - startTime;
      document.getElementById('search3result').innerHTML = finalResult;
    },
  });
  
  Template.searchMostActiveUser.events({
    'click #search4': function () {
      var startTime = new Date().getTime();
      var threadPostsStats = Threads.find({}, {fields: {posts: 1}, transform: function (thread) {
        thread.posts = thread.posts.map(function (post) {
          return post.author;
        }).filter(function (e, i, arr) {
          return arr.lastIndexOf(e) === i;
        });
        return thread;
      }});
      threadPostsStats = threadPostsStats.fetch();
      var activeUsers = {};
      for (var i = 0; i < threadPostsStats.length; i++) {
        var thrStat = threadPostsStats[i].posts;
        for (var y = 0; y < thrStat.length; y++) {
          activeUsers[thrStat[y]] = (activeUsers[thrStat[y]] ? activeUsers[thrStat[y]] : 0) + 1;
        }
      }
      var maxKey = null;
      var maximum = 0;
      for (key in activeUsers) {
        if (activeUsers[key] > maximum) {
          maximum = activeUsers[key];
          maxKey = key;
        }
      }
      
      var endTime = new Date().getTime();
      document.getElementById('search4r').innerHTML = endTime - startTime;
      document.getElementById('search4result').innerHTML = maxKey + " (" + maximum + ")";
    },
  });
  
  Template.searchMostActiveCommenter.events({
    'click #search5': function () {
      var startTime = new Date().getTime();
      var threads = Threads.find({}, {fields: {"posts.author": 1}}).fetch();
      var users = {};
      for (var i = 0; i < threads.length; i++) {
        var thr = threads[i];
        for (var y = 1; y < thr.posts.length; y++) {
          var posts = thr.posts;
          if (posts[y].author != posts[y-1].author) {
            if (users[posts[y].author] != null) {
              users[posts[y].author] += 1;
            } else {
              users[posts[y].author] = 1;
            }
          }
        }
      }
      var maximum = 0;
      var maxKey = null;
      for (user in users) {
        if (maximum < users[user]) {
          maximum = users[user];
          maxKey = user;
        }
      }
      
      var endTime = new Date().getTime();
      document.getElementById('search5r').innerHTML = endTime - startTime;
      document.getElementById('search5result').innerHTML = maxKey + " (" + maximum + ")";
    }
  });
  
  Template.searchPostsWithFrodo.events({
    'click #search6': function () {
      var startTime = new Date().getTime();
      Meteor.call('searchMrFrodo', function(error, result) {
        var endTime = new Date().getTime();
        document.getElementById('search6r').innerHTML = endTime - startTime;
        document.getElementById('search6result').innerHTML = result.length;
      });
    }
  });
  
  Template.searchPostsOfPeopleFromK.events({
    'click #search7': function () {
      var startTime = new Date().getTime();
      Meteor.call("searchPostsOfPeopleFromK", function (error, result) {
        var endTime = new Date().getTime();
        document.getElementById('search7r').innerHTML = endTime - startTime;
        document.getElementById('search7result').innerHTML = result.length;
      });
    }
  });
  
  Template.searchMostFrequentWords.events({
    'click #search8': function () {
      
      var getTopNWords = function (texts, n)
      {
          var wordRegExp = /\w+(?:'\w{1,2})?/g;
          var words = {};
          var matches;
          
          for (var i = 0; i < texts.length; i++) {
            text = texts[i];
            var parts = text.split(/\s+/);
            for (var y = 0; y < parts.length; y++)
            {
                var word = parts[y].toLowerCase();
                if (typeof words[word] == "undefined")
                {
                    words[word] = 1;
                }
                else
                {
                    words[word]++;
                }
            }
          }

          var wordList = [];
          for (var word in words)
          {
              if (words.hasOwnProperty(word))
              {
                  wordList.push([word, words[word]]);
              }
          }
          wordList.sort(function(a, b) { return b[1] - a[1]; });

          var topWords = [];
          for (var i = 0; i < n; i++)
          {
              topWords.push(wordList[i][0]);
          }
          return topWords;
      };
      
      var startTime = new Date().getTime();
      
      var threads = Threads.find({}, {fields: {"posts.content": 1}});
      threads = threads.fetch();
      
      var allTexts = [];
      for (var i = 0; i < threads.length; i++) {
        for (var y = 0; y < threads[i].posts.length; y++) {
          allTexts.push(threads[i].posts[y].content);
        }
      }
      
      console.log(getTopNWords(allTexts, 35));
      
      var endTime = new Date().getTime();
      document.getElementById('search8r').innerHTML = endTime - startTime;
      document.getElementById('search8result').innerHTML = getTopNWords(allTexts, 35)[34];
    }
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    Future = Npm.require('fibers/future');
  });
  
  Meteor.methods({
    killAll: function() {
      Threads.remove({});
      Users.remove({});
    },
    insertData: function () {
      console.log("inserting the data");
      var threadsToSave = JSON.parse(Assets.getText("threads.json"));
      var usersToSave = JSON.parse(Assets.getText("users.json"));
      
      for (var i = 0; i < threadsToSave.length; i++) {
        var thread = threadsToSave[i];
        thread.createDate = new Date(thread.createDate);
        
        for (var y = 0; y < thread.posts.length; y++) {
          thread.posts[y].sent = new Date(thread.posts[y].sent);
        }
      }
      
      Threads.remove({});
      Users.remove({});
      
      var startTime = new Date().getTime();
      
      for (var i = 0; i < threadsToSave.length; i++) {
        Threads.insert(threadsToSave[i]);
      }
      for (var i = 0; i < usersToSave.length; i++) {
        Users.insert(usersToSave[i]);
      }
      
      var endTime = new Date().getTime();
      console.log(endTime - startTime);
      return endTime - startTime;
    },
    aggregate: function (param) {
        var fut = new Future();
        MongoInternals.defaultRemoteCollectionDriver().mongo._getCollection(param.collection)
          .aggregate(param.pipe,function(err, result) {
            fut.return(result);
        });
        return fut.wait();
    },
    searchMrFrodo: function () {
      var _param = {
        pipe : [
          {$project: {posts: 1}},
          {$unwind: "$posts"},
          {$match: {"posts.content": /.*Frodo.*/i}},
          {$project: {_id: 1}}
        ],
        collection: "threads"
      };
      return Meteor.call('aggregate', _param);
    },
    searchPostsOfPeopleFromK: function () {
      
      var ppl = Users.find({city: /^k/i}, {fields: {login: 1}}).fetch();
      var writers = [];
      for (var i = 0; i < ppl.length; i++) {
        writers.push(ppl[i].login);
      }
      var _param = {
        pipe : [
          {$project: {posts: 1}},
          {$unwind: "$posts"},
          {$match: {"posts.author": {$in: writers}}},
          {$project: {_id: 1}},
        ],
        collection: "threads"
      };
      return Meteor.call('aggregate', _param);
    }
  });
}
