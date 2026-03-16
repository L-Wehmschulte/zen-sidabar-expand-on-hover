#!/bin/sh

if [ -e .commit] then
    rm .commit
    git add zen-sidebar-expand-on-hover.user.js
    git commit --amend -C HEAD --no-verify
fi
exit
    