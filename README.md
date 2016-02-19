# Concaria

This is a sample application demonstrating the Xively platform.

### Installation

The simplest and recommended method of installation is through Heroku. Simply click the button below.

[![Deploy](https://www.herokucdn.com/deploy/button.png)](https://heroku.com/deploy?template=https://github.com/xively/concaria/tree/new-build)

### Local Installation

If you would like to run the app locally, check your [system requirements](#system-requirements), clone this
repository, and run the following from the command line:

```sh
# You only need to run the following two commands once
npm install
npm run local-provision
# This must be run each time you want to work on the project
npm run work
```

Navigate to <http://localhost:5000/> in your browser to access the app. The application will automatically refresh as you make changes to the source code.

### Heroku Installation

If you are making changes to this repo or a fork of it you'll need commit the built client files to deploy it. You can follow this script as an example.

```sh
git clone git@github.com:my-github-user/concaria.git
cd concaria
git checkout -b my-changes
# make your changes
grunt work
# test your changes
git add .
git commit
git checkout -b my-changes-heroku
grunt build
# public is normally ignored in git
git add public --force
git commit -m "Build"
```

Then you can push to your heroku instance from a heroku-cli set remote.

```sh
git push heroku my-changes-heroku:master --force
```

Or deploy a from scratch copy by pushing to your fork and deploying with https://heroku.com/deploy.

```sh
git push origin my-changes-heroku
# https://heroku.com/deploy?template=https://github.com/my-github-user/concaria/tree/my-changes-heroku
```

### Developer Scripts

There are a handful of npm scripts to aid in development.

- `npm run work` – run a development version of the app with Watch and LiveReload
- `npm run build` – build a production version of the app
- `npm run start` – start the production Node server
- `npm test` – run the unit test in actual browsers
- `npm run test-headless` – run the unit tests in a headless browser
- `npm run local-provision` – configure the app to run locally
- `npm run clear-sf-data` – delete all of your Contacts and Assets from Salesforce

### Configuration

#### Environment Variables

- XIVELY_IDM_HOST
- XIVELY_TIMESERIES_HOST
- XIVELY_BROKER_HOST
- XIVELY_ACCOUNT_ID
- XIVELY_IDM_EMAIL_ADDRESS
- XIVELY_IDM_PASSWORD
- AIRNOW_APIKEY
- AIRNOW_BOUNDINGBOX
- CONCARIA_TYPEID
- CONCARIA_ID
- XIVELY_MQTT_USERNAME
- XIVELY_MQTT_PASSWORD

### Salesforce Integration

This application can be used to demonstrate Xively's integration with Salesforce.
To try that out, set up your Salesforce account as follows:

1. Create a Salesforce account
2. Install this Salesforce package:
   https://login.salesforce.com/packaging/installPackage.apexp?p0=04t36000000HRMn

Now that your Salesforce account is set up, it's time to configure the application.
This process is different depending on whether you're setting things up locally
or if you'll be running it on Heroku.

#### Heroku

1. Log into Heroku
2. Navigate to this application
3. Insert your Salesforce credentials into the dashboard, and save the changes
4. When the application restarts, it will upload a Contact and the devices as Assets
to Salesforce

#### Local development

1. Be sure that you've provisioned the app before. If you have, then you will have
a `.env` file.
2. Open up `.env` and add three new fields:
  - `SALESFORCE_USER`: your Salesforce username. This is generally an email.
  - `SALESFORCE_PASSWORD`: your Salesforce password
  - `SALESFORCE_TOKEN`: your Salesforce token. To find this, follow
    the guide [here](https://success.salesforce.com/answers?id=90630000000glADAAY)
3. Restart the Node application. It will upload a Contact and the devices as Assets
  to your Salesforce account

#### Staging and Release notes

Pull Requests are not to be merged into master without first being confirmed by QA.
After your PR is reviewed, merge your PR into the `staging` branch. Then cut a new build release into `staging-build`. 

(**NOTE:** You will have to run `grunt build` & add the public folder by force `git add public --force`)

[Deploy the staging branch](https://heroku.com/deploy?template=https://github.com/xively/concaria/tree/staging-build)

When a staging branch has been QA'd and no regressions are found, then you can merge your Pull Request into master. After you've done that, tag master with the lastest version #. 

```
git tag -a v1.1 -m "write a note about what this version includes"
git push origin v1.1

```

Update the `new-build` branch with a new build.  Master and new-build should always match.


##### Release notes
If you want to include release notes between each tagged version, you can get a list of commits using this command:

`git log v1.0..v1.1`

This will give you all the commits made between those 2 versions.  

Tags are like branches, so you can also do that with any branch. For example if you want to see how many commits staging is ahead of master:

`git log master..staging`


### System Requirements

- Heroku &amp; Heroku CLI
  - heroku account with creditcard attached to account

- Node >0.12
  - [http://nodejs.org](http://nodejs.org) (All Platforms)
  - `brew install node` via [Homebrew](http://brew.sh/) (OSX)
  - `apt-get/yum install node` (Linux)
