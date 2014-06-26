#!/usr/bin/env python
# -*- coding: utf-8

from lxml import etree
import json
import re

f = open("tolkien.xml", "r")

posts = []
users = []

postsLen = 0

MONTHS = {"Sty": "01", "Lut": "02", "Mar": "03", "Kwi": "04", "Maj": "05", "Cze": "06",
  "Lip": "07", "Sie": "08", "Wrz": "09", u"Paź": "10", "Lis": "11", "Gru": "12"}

parser = etree.XMLParser()
root = etree.parse(f, parser).getroot()
for task in root.findall("task_result"):
  
  moarData = task.findtext("rule[@name='user-data']").strip()
  newUser = {}
  newUser["login"] = task.findtext("rule[@name='user-login']").strip()
  
  newUser["joinDate"] = ""
  m = re.search(u'Dołączył\(a\): (\d+) (\S+) (\d+)', moarData) # data utworzenia
  if m:
    newUser["joinDate"] = m.group(3) + "-" + MONTHS[m.group(2)] + "-" + m.group(1)
  
  newUser["city"] = ""
  m = re.search(u'Skąd: (.*)', moarData) # miasto
  if m:
    newUser["city"] = m.group(1)
  
  users.append(newUser)
  
  sendDateStr = task.findtext("rule[@name='post-details']").splitlines()[1]
  
  newPost = {}
  newPost["threadName"] = task.findtext("rule[@name='thread-title']").strip()
  m = re.match("Temat: (.*)", newPost["threadName"])
  newPost["threadName"] = m.group(1)
  newPost["author"] = newUser["login"]
  
  m = re.match(u"Wysłany: (.*)", sendDateStr)
  sendDate = m.group(1)
  m = re.match("Wczoraj o (.*)", sendDate)
  if m:
    sendDate = "01-06-2014 " + m.group(1)
  m = re.match("Dzisiaj o (.*)", sendDate)
  if m:
    sendDate = "02-06-2014 " + m.group(1)
  
  sendDate = sendDate[6:10] + "-" + sendDate[3:5] + "-" + sendDate[0:2] + sendDate[10:]
  newPost["sent"] = sendDate
  
  newPost["content"] = task.findtext("rule[@name='post-content']").strip()
  postsLen += len(newPost["content"])
  
  posts.append(newPost)
f.close()

threads = {}
for post in posts:
  thrName = post["threadName"]
  if thrName not in threads:
    threads[thrName] = []
  threads[thrName].append(post)

def getPostDate(p):
  return p["sent"]

finalThreads = []
for thrName in threads:
  threads[thrName] = sorted(threads[thrName], key=getPostDate) # by post date
  
  finalThreads.append({"title": thrName, "author": threads[thrName][0]["author"],
    "createDate": threads[thrName][0]["sent"], "posts": threads[thrName]})

with open("private/threads.json", "w") as threadsFile:
  threadsFile.write(json.dumps(finalThreads))

with open("private/users.json", "w") as usersFile:
  usersFile.write(json.dumps(users))

print postsLen


