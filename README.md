# rating-empresas-api
Rating de empresas API  

# Creating a feature branch  
git checkout develop  
git pull origin develop  
git checkout -b nameBranch develop  

# Incorporating a finished feature on develop  
git status  
git add *    
git commit -m "XXX"  
git push origin nameBranch  

# GitHub  
Create a pull request y merging with develop (no master!!!!)  

# Creating and Finishing a release branch  
git checkout develop  
git checkout -b release-0.1 develop  
git push origin release-0.1  

git checkout master  
git merge --no-ff release-0.1  
git tag -a 0.1  
git tag  
git push origin master  
git push origin --tags  

git checkout develop  
git merge --no-ff release-0.1  
git push origin develop  
