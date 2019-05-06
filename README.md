# App name

[brief description of the app]

### The following information is displayed:

* info1
* info2
* info3

Please submit bug reports to [Insert Link](). Pull requests are welcome.

### Screenshot(s):
[put your screenshots down here.]


### Development

To start app in development.

```
zat server -c settings.json --app-id=${your_installation_id}
```

You can find the app-id with this endpoint
```
https://${your_subdomain}.zendesk.com/api/v2/apps/installations.json
```
Locate your installed app and note its id value, not its app_id value.

