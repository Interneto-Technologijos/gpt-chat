#! /bin/sh

docker build -t gtp-chat . && docker run --name=gtp-chat -p 3001:3001 gtp-chat
