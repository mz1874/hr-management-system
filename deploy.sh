#!/bin/bash
npm run build

rsync -av --progress ./dist/ root@bugcreator.org.cn:/usr/share/nginx/rowy/dist
