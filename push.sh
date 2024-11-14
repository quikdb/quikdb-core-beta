#!/usr/bin/env bash

deploy_git() {
  local commit_message
  local git_branch

    read -p "Enter commit message (or 'exit' to finish): " commit_message
    if [ "$commit_message" = "exit" ]; then
      break
    fi

    read -p "Enter git branch: " git_branch
    echo 
    git add .
    git commit -m "$commit_message"
    git push origin "$git_branch"
}

deploy_git

# apiId="kl8no40qhb"

# stageExists=$(aws apigateway get-stage --rest-api-id "$apiId" --stage-name "test" 2>&1)

# if [[ $stageExists == *"NotFoundException"* ]]; then
#     echo "Stage 'test' does not exist."
#     aws apigateway create-stage --rest-api-id kl8no40qhb --deployment-id xallax --stage-name test
# else
#     echo "Stage 'test' exists."
#     aws apigateway delete-stage --rest-api-id kl8no40qhb --stage-name test
#     aws apigateway create-stage --rest-api-id kl8no40qhb --deployment-id xallax --stage-name test
# fi