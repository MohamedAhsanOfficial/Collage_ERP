pipeline {
    agent any

    environment {
        DOCKERHUB_CREDENTIALS = credentials('dockerhub-credentials') // Make sure to create this in Jenkins
        DOCKER_IMAGE = "your-dockerhub-username/collage-erp"
        KUBECONFIG_CREDENTIALS = credentials('kubeconfig-credentials') // ID of Secret File with kubeconfig
    }

    stages {
        stage('Code Fetch') {
            steps {
                git branch: 'main', url: 'https://github.com/your-username/Collage_ERP.git'
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    dockerImage = docker.build("${DOCKER_IMAGE}:${env.BUILD_NUMBER}")
                }
            }
        }

        stage('Push to DockerHub') {
            steps {
                script {
                    docker.withRegistry('', 'dockerhub-credentials') {
                        dockerImage.push()
                        dockerImage.push('latest')
                    }
                }
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                withCredentials([file(credentialsId: 'kubeconfig-credentials', variable: 'KUBECONFIG')]) {
                    sh 'kubectl apply -f k8s/pvc.yaml'
                    sh 'kubectl apply -f k8s/deployment.yaml'
                    sh 'kubectl apply -f k8s/service.yaml'
                    
                    // Force rollout restart to pick up new image if using latest tag, 
                    // or better, update the image tag in deployment.yaml dynamically using sed
                    sh "kubectl set image deployment/collage-erp-deployment collage-erp=${DOCKER_IMAGE}:${env.BUILD_NUMBER}"
                }
            }
        }
    }
    
    post {
        always {
            cleanWs()
        }
    }
}
