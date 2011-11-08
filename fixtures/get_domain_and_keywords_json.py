#!/usr/bin/env python
"""
This script accept a domain/website name as input and prints a json which include such
domain or website name as well as the related keywords retrieved from delicious.
This script has been actually used to build a database of domain/websites with associated keyboards,
built as a set of json declarations on a file, by running something like:
while read domainname; do ./get_domain_and_keywords_json.py $domainname; done < domains_list >> output_file
"""

from os import _exit
from hashlib import md5
from sys import argv
import urllib2

baseurl = 'http://feeds.delicious.com/v2/json/urlinfo/'

# keywords retrieved from delicious are.. well, a total ripoff...
# a list of allowed keywords has been buit as follows:
# all keywords have been retrieved for all domains reported at least <threshold> times according to herdict reports.
# As allowed keywords, only the subset of these keywords which have been used more than 10 times to tag
# the websites above have been considered.

allowed_keywords_list = [ "news",  "blog",  "tools",  "free",  "media",  "social",  "web",  "politics",  "community",  "software",  "web2.0",  "blogs",  "search",  "security",  "online",  "china",  "web2.0",  "proxy",  "video",  "reference",  "privacy",  "network",  "chinese",  "daily",  "download",  "web",  "music",  "movies",  "anonymous",  "socialnetworking",  "google",  "porn",  "forum",  "videos",  "tv",  "networking",  "entertainment",  "technology",  "socialmedia",  "sex",  "streaming",  "p2p",  "newspaper",  "activism",  "sharing",  "culture",  "arabic",  "politics",  "News",  "education",  "service",  "hosting",  "torrent",  "searchengine",  "fun",  "adult",  "video",  "twitter",  "radio",  "gfw",  "games",  "downloads",  "Yigal Chamish",  "television",  "China",  "chat",  "censorship",  "blogging",  "Blog",  "world",  "torrents",  "opensource",  "iran",  "friends",  "freeware",  "youtube",  "storage",  "portal",  "Politics",  "newspapers",  "mobile",  "magazine",  "links",  "Islam&ME",  "international",  "information",  "government",  "filesharing",  "design",  "computer",  "business",  "bittorrent" ]

def __md5__(s):
    h = md5()
    h.update(s)
    return h.hexdigest()

def __get_response__(url):
    url = "%s%s" % (baseurl, __md5__(url))
    r = urllib2.urlopen(url)
    r = eval(r.read())
    return r

def __generate_urls__(url):
    prefixes   = ['www.', 'http://www.', '', 'http://', 'https://www.', 'https://']
    endingwith = ['/']
    for prefix in prefixes:
        if url.startswith(prefix): url = url[len(prefix):]
    for ending in endingwith:
        if url.endswith(ending) and not len(ending) == 0: url = url[:-(len(ending))]
    url_list_prefixes_only = []
    url_list = []
    for prefix in prefixes: url_list_prefixes_only.append('%s%s' % (prefix, url))
    for built_url in url_list_prefixes_only: url_list.append(built_url)
    for ending in endingwith:
        for built_url in url_list_prefixes_only: url_list.append('%s%s' % (built_url, ending))
    return url_list

def __get_info__(url):
    info = __get_response__(url)
    if   len(info) == 1: return info[0]
    elif len(info) >  1: pass # Error... will return an empty list anyway
    else: pass # Empty list, well.. we can live with that.
    return []

def get_top_tags_from_delicious(url):
    top_tags = []
    url_list = __generate_urls__(url)
    for url in url_list:
        info = __get_info__(url)
        if info == []: continue
	else: 
	    for t in info['top_tags'].keys(): top_tags.append(t)
    uniq_top_tags = []
    current_tag = ''
    for tag in sorted(top_tags):
        if tag != current_tag:
	    uniq_top_tags.append(tag)
	    current_tag = tag
	else: continue
    return uniq_top_tags

if __name__ == '__main__':
    keywords = get_top_tags_from_delicious(argv[1])
    result = '{ "domain": "%s", "keywords": [ ' % argv[1]
    if len(keywords) > 0:
        at_least_one = False
        for keyword in keywords: 
            if keyword in allowed_keywords_list: 
	        result += '"%s", ' % keyword
		at_least_one = True
        if at_least_one: result = result[:-2]
    result += ' ] }'
    print result
