# index.js
The main listener file. If any new actions should be performed on message received, index.js can be modified.
Out of the box, the only thing behind done is passing the data to the rules engine instance

# mqtt-listener.js
This has the functionality to mass-subscribe to channels, parse the messages, and pass data long to handler functions.
Also has baked in re-subscribe on disconnect and a few other error recovery modes

# rules.js
This file is the concaria to nools interface

# rule-parser.js
Takes the JS object from the rule configurator and creates nools functions from it. Used by rules.js

# nools/AirSoClean3000.js
This is the rule engine representation of a single AirSoClean3000

# nools/SalesforceCase.js
Representation of a Salesforce Case that actually creates a salesforce case when instantiated 