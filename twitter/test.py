# from searchtweets import ResultStream, gen_rule_payload, load_credentials, collect_results

# premium_search_args = load_credentials("./twitter_keys.yaml",
#                                        yaml_key="search_tweets_api",
#                                        env_overwrite=False)
# # testing with a sandbox account
# rule = gen_rule_payload("geocode=37.781157,-122.398720,1mi", results_per_call=100)
# print(rule)

# tweets = collect_results(rule,
#                          max_results=100,
#                          result_stream_args=premium_search_args)
# for tweet in tweets:
#     print(tweet.all_text)
from TwitterSearch import *
import csv

latlngs = [[40.009781, -83.014129], [39.95492, -83.02512], [39.98439, -83.03233], [40.10004, -83.11816], [40.03330, -83.03027], [39.96203, -83.00075], [39.98335, -83.00606], [39.99046, -83.01567], [40.00282, -82.89448], [39.96652, -82.89997], [40.02307, -82.94357], [40.14341, -82.98423], [40.10013, -83.09748], [40.10013, -83.06520], [40.10039, -83.03327], [40.10091, -82.98006], [40.10170, -82.93371], [40.07806, -83.12597], [40.07832, -83.08958]]

results = open("tweet_lat_lngs_new.csv", 'a')
latlng_file = open("lat_lngs_new.csv", 'a')
results.write("time,userid,id,lat,lng")

try:
    tso = TwitterSearchOrder()
    tso.set_count(100)
    tso.set_keywords(["the", "it", "at"], True)
    print(tso.create_search_url())

    ts = TwitterSearch(
        consumer_key='8WvgWypg9ja5uMcZninc6G06R',
        consumer_secret='MHsNrWvkm5IQsvaWNa6GOjH31nuMtV9mkTdUBIDQRF7sSmWy3y',
        access_token='336327237-VEUXjMCMBBpK0i479mU5XGqO3ey3TEGvspr4Db6b',
        access_token_secret='BQvTkYFMd6JsqqQcGg7wRygCqefNgi0W75OiBORG3utGL'
    )
    file = open('latlngs.csv')
    latlngs_source = csv.reader(file,delimiter=",")
    latlngs = []
    for row in latlngs_source:
        latlngs.append(row)
    ranges=[0,450,900,1350]
    for i in range(1694,2000):
        latlng = latlngs[i]
        print(i)
        tso.set_geocode(float(latlng[1]), float(latlng[3]), 1, True)
        for tweet in ts.search_tweets_iterable(tso):
            if(tweet['geo']):
                results.write('%s,%s,%s,%s,%s\n' % (tweet['created_at'],tweet['user']['id'],tweet['id'],tweet['geo']['coordinates']
                                 [0], tweet['geo']['coordinates'][1]))
                latlng_file.write('%s,%s\n' % (tweet['geo']['coordinates'][0], tweet['geo']['coordinates'][1]))               

except TwitterSearchException as e:  # take care of all those ugly errors if there are some
    print(e)
