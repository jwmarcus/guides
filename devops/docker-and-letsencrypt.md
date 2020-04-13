# Using Docker and Let's Encrypt

You should be using HTTPS. You know that. Here is how to use docker alongside certbot.


## Storing the keys properly

Although it might be tempting to have each build of an image generate a new certificate, this is generally a bad idea. Certificates expire every 90 days, and images could update multiple times per day. To avoid rate limiting and key thrashing, it might be smart to remove the certificate renewal process from docker entirely (more reasons below).

Follow the [Installation instructions](https://certbot.eff.org/instructions) as normal, but choose the `--standalone` version, which you can get to by selecting "I don't know" from the host type drop-down. Once you have completed the registration of your domains and received the proper files, we need to test that `certbot`, the binary that does the certificate renewal for us, can operate correctly.

`sudo certbot renew --dry-run`

If the dry-run works, your certificates will renew when there are fewer than 30 days remaining on the valid certificate.


## But there is a problem here

Now, certbot will automatically check for new certificates for all of your domains using its standalone web-server. Great, right? Well, if you are running services on port 80, the standalone server will fail to bind to that port and the update will fail. So how do we free up that port for the update process if we have existing running containers? One option might be to run a docker image that solely runs `certbot renew`. Considering the certificates are shared across all domains hosted on this machine, it seems wise to externalize the renewal process as it happens rather infrequently.

The other option that I prefer is to create a script that shuts down any containers using port 80, runs the `certbot renew`, and re-runs the images.


## Creating the tear-down and start-up script

I use docker-compose for now, so I created a script at `/usr/local/sbin/renew-certificate.sh`:

```
#!/bin/bash

/usr/local/bin/docker-compose -f /path/to/your/compose/file.yml down
/bin/sleep 20 # Wait for docker-compose to come down
/usr/bin/certbot renew
/usr/local/bin/docker-compose -f /path/to/your/compose/file.yml up
```

If you start and stop your docker containers with a systemd service, you can use:

```
#!/bin/bash

/bin/systemctl stop docker-compose-service.service
/bin/sleep 20 # Wait for systemd to close service
/usr/bin/certbot renew
/bin/systemctl start docker-compose-service.service
```

Make sure to make your script executable `chmod +x renew-cerficiate.sh`.


## Next, we cron

As the original cron job from certbot will fail (due to the inability to bind to port 80) we need to tell our script to run occasionally. Once every month seems like a good strategy, and is only slightly less optimal than certbot's own renewal schedule (30 days before the 90 day window). Here is how I set that up in a new file `/etc/cron.d/renew-certs`:

```
SHELL=/bin/sh
PATH=/usr/local/sbin:/usr/local/bin:/sbin:/bin:/usr/sbin:/usr/bin

0 0 1 * * root /usr/local/sbin/renew-certificate.sh
```


## Much better ways to do this in the future:

- Run the `--dry-run` or similar options to determine if a renewal is due within 30 days
  - `test -x /usr/bin/certbot -a \! -d /run/systemd/system && perl -e 'sleep int(rand(43200))' && certbot -q renew` or similar might do it
- Only stop the containers if expiration is within a certain date range
- Do the renewal process with another Docker image

