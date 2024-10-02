FROM ruby:latest

WORKDIR /app
RUN gem install sportdb
RUN apt-get update && apt-get install -y sqlite3

ENTRYPOINT ["sportdb"]
