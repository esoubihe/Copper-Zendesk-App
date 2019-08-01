### Development

1. Install Zendesk App Tools (https://develop.zendesk.com/hc/en-us/articles/360001075048)

2. Go to the apps directory and run the app in development with

```
zat server -c settings.json --app-id=360003146633
```

You can find the app-id with this endpoint
```
https://${your_subdomain}.zendesk.com/api/v2/apps/installations.json
```
Locate your installed app and note its id value, not its app_id value.

3. Go to Zendesk and open a ticket but add `?zat=true` in the url, eg [https://maxihost.zendesk.com/agent/tickets/100838?zat=true](https://maxihost.zendesk.com/agent/tickets/100838?zat=true)

4. Enable loading unsafe content

![img](https://d2rsw2kbemic8w.cloudfront.net/items/15150I1Q1L0v1j06211d/Image%202019-08-01%20at%204.21.44%20PM.png?X-CloudApp-Visitor-Id=1931553)

5. Open tha Apps tab and you'll see the Copper app

![apps tab](http://clip.maxihost.com.br/0f1c6cd98cee/Image%2525202019-08-01%252520at%2525204.25.13%252520PM.png)
