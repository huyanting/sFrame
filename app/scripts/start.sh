# !/bin/bash

BASE_DIR=$(cd "$(dirname "$0")/..";pwd)
cd $BASE_DIR
NODE_ENV=$1 pm2 start ./index.js --name hyting_resource

