# Assignment Tracker CI/CD Lab

A minimal Express + SQLite web application that stores assignment telemetry and showcases how Jenkins orchestrates the lifecycle from GitHub to AWS EC2.

## Local development

1. Install Node.js (>=18) and clone this repository.
2. Run `npm ci` to install dependencies.
3. Seed the database with `npm run migrate` (creates `data/tracker.db`).
4. Start the app with `npm start` and visit [http://localhost:4000](http://localhost:4000).
5. Use the web form or `POST /api/assignments` to add new records. All data is persisted in `data/tracker.db`.

## Testing

- `npm run test` executes a quick smoke test that writes to SQLite and validates the round-trip.

## Jenkins pipeline overview

The pipeline defined in `Jenkinsfile` covers the required stages:

1. **Fetch:** clones the GitHub repository.
2. **Build:** installs Node dependencies (`npm ci`).
3. **Test:** runs the `npm run test` smoke test.
4. **Deploy:** uses `./scripts/deploy.sh` to bundle, transfer, and install code on an AWS EC2 host.
5. **Operate:** restarts the service remotely via `./scripts/operate.sh` using `nohup`.
6. **Monitor:** curls the EC2-hosted `/health` endpoint and verifies the SQLite file with `./scripts/monitor.sh`.

Set the following environment variables inside Jenkins (or export them on the controller) before running the pipeline:

- `SSH_KEY_PATH`: path to the private key that can log into your EC2 instance.
- `DEPLOY_HOST`: EC2 public DNS or IP address.
- `DEPLOY_USER`: Linux user on the EC2 host (often `ec2-user` or `ubuntu`).
- `DEPLOY_PATH`: folder where the application should be deployed (defaults to `/home/ec2-user/ci-lab-app`).
- `APP_URL`: `http://<ec2-host>:4000`, so the monitor step can query `/health`.

See `docs/ci_cd_guide.md` for step-by-step notes on provisioning Jenkins on AWS and wiring up the pipeline.

## Delivery expectations

Push your code to a GitHub repository so your Jenkins job can clone it. After you make changes, run the pipeline again to validate the fetch, deploy, operate, and monitor stages described in your lab instructions.
