# CI/CD Guide for Jenkins on AWS

This project demonstrates how to push a simple Express/SQLite web application through Jenkins running on an EC2 instance. The workflow covers fetching the repository, building and testing the code, deploying the bundle to the EC2 host, operating the Node process, and monitoring the `/health` endpoint.

## AWS EC2 prerequisites

1. Provision an Amazon Linux 2023 or Ubuntu LTS EC2 node inside a VPC with a security group that:
   - Allows inbound `22` (SSH) and `4000` (HTTP) from the Jenkins server.
   - Allows HUD outbound traffic to reach GitHub and other dependencies.
2. Upload the Jenkins controller's SSH key to the EC2 user's `~/.ssh/authorized_keys`. Save the same key path for Jenkins credentials.
3. Install Node.js (>=18) and `npm`, and make sure `tar`/`curl` are available.
4. Create a directory (for example `/home/ec2-user/ci-lab-app`) owned by the deploy user and grant write access so the deploy script can unpack releases.

## Jenkins job setup

1. Create a Pipeline job pointing to this repository and set the Jenkinsfile path to `Jenkinsfile` at the repository root.
2. Configure the following credentials and environment variables using either `withCredentials` or global Jenkins environment variables:
   - `SSH_KEY_PATH`: path to the private key that can log into the EC2 host.
   - `DEPLOY_HOST`: public IP or DNS name of the EC2 host.
   - `DEPLOY_USER`: Linux user with permissions to run Node on the EC2 host.
   - `DEPLOY_PATH`: absolute path to the deployment directory (defaults to `/home/ec2-user/ci-lab-app`).
   - `APP_URL`: `http://<ec2-host>:4000` so the monitor stage can hit the `/health` endpoint.
3. Ensure the workspace has `npm` available so the build and test stages can run correctly.
4. Node modules are installed remotely only inside the deploy stage to keep the Jenkins workspace lightweight.

## Pipeline stages breakdown

- **Fetch:** Jenkins checks out the latest GitHub branch or tag and keeps the history for later troubleshooting.
- **Build:** `npm ci` installs dependencies deterministically.
- **Test:** `npm run test` executes the lightweight smoke test that inserts a record and queries it via SQLite.
- **Deploy:** `./scripts/deploy.sh` archives the source, copies it to the EC2 host over SSH, and runs `npm install --production` there.
- **Operate:** `./scripts/operate.sh` restarts any stale Node process and uses `nohup` to keep the digital service running in the background.
- **Monitor:** `./scripts/monitor.sh` curls the `/health` endpoint and probes the SQLite file to ensure the persistence layer is intact.

## Verification and monitoring tips

- Visit `http://<ec2-host>:4000` to interact with the assignment tracker UI or call `/api/assignments` for programmatic access.
- The `/health` endpoint responds with a timestamp, so Jenkins can verify availability before promoting changes further.
- Store logs from `/tmp/ci-lab-app.log` or the Jenkins console for diagnosing long-term issues.
