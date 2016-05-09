#!/bin/bash
set -e # exit with nonzero exit code if anything fails

if [[ $TRAVIS ]];
then
  git config --global user.email "travis@risingstack.com";
  git config --global user.name "Travis CI";

  BRANCH=$TRAVIS_BRANCH;
  HEAD=$TRAVIS_COMMIT;
  BUILD_BRANCH=$BRANCH-build;

  # create build branch
  git checkout -b $BUILD_BRANCH -f;

  # build the client
  npm run build;
  # create new commit
  git add -f public;
  git commit -m "Build" -n;
  # push to build branch
  git push -f -q "https://${GH_TOKEN}@${GH_REF}" $BUILD_BRANCH:$BUILD_BRANCH > /dev/null 2>&1;
else
  BRANCH=$(git branch | sed -n '/\* /s///p');

  # checkout build branch
  BUILD_BRANCH=$BRANCH-build;
  git checkout $BUILD_BRANCH;
  git reset --hard $BRANCH;

  # build the client
  npm run build;
  # create new commit
  git add -f public;
  git commit -m "Build" -n;
  # push to build branch
  git push -f;
  git checkout $BRANCH;
fi
