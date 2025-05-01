#!/bin/bash
npm run build

rsync -av --progress ./dist/ root@47.250.92.86:/usr/share/nginx/rowy/dist
