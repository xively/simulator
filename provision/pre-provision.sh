#!/usr/bin/env bash

# Current script directory.
script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# Location of the temporary heroku app.
temp_dir="$script_dir/temp-heroku-app"
# Unique (hopefully) app name.
app_name=xively-$(date +%s)

# Removing existing temp dir and heroku app.
if [[ -e "$temp_dir" ]]; then
  if [[ -e "$temp_dir/app_name" ]]; then
    old_app_name="$(< "$temp_dir/app_name")"
    heroku apps:destroy $old_app_name --confirm $old_app_name
  fi
  rm -rf "$temp_dir"
fi

if [[ "$1" == "--destroy" ]]; then exit; fi

# Create temp dir.
mkdir "$temp_dir"
cd "$temp_dir"

# Store current heroku app for later cleanup.
echo "$app_name" > app_name

# Initialize new heroku app.
git init
heroku apps:create $app_name
heroku addons:create xively:test
heroku addons:create heroku-postgresql:hobby-dev
heroku addons:create heroku-redis:hobby-dev

# Write environment vars to .env file
heroku config -s | tee "$script_dir/../.env"
