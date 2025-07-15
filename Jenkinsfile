pipeline {
  agent any

  environment {
    IMAGE_NAME = "intelligen/data_fetcher_sid"
    TAG = "latest"
  }

  stages {

    stage('Build Docker Image') {
      steps {
        script {
          dockerImage = docker.build("${IMAGE_NAME}:${TAG}")
        }
      }
    }

    stage('Push to Registry') {
      steps {
        script {
          docker.withRegistry('https://index.docker.io/v1/', 'docker-hub-credentials-id') {
            dockerImage.push()
          }
        }
      }
    }
  }

  post {
    success {
      echo '✅ Image built and pushed successfully!'
    }
    failure {
      echo '❌ Build failed.'
    }
  }
}
