pipeline {
  agent any
  environment {
    APP_URL = 'http://127.0.0.1:4000'
    DEPLOY_PATH = '/home/ec2-user/ci-lab-app'
  }
  options {
    ansiColor('xterm')
  }
  stages {
    stage('Fetch') {
      steps {
        echo 'Pulling latest artifacts from the repository'
        checkout scm
      }
    }
    stage('Build') {
      steps {
        sh 'npm ci'
      }
    }
    stage('Test') {
      steps {
        sh 'npm run test'
      }
    }
    stage('Deploy') {
      steps {
        sh './scripts/deploy.sh'
      }
    }
    stage('Operate') {
      steps {
        sh './scripts/operate.sh'
      }
    }
    stage('Monitor') {
      steps {
        sh './scripts/monitor.sh'
      }
    }
  }
  post {
    always {
      echo 'Pipeline finished'
    }
  }
}
