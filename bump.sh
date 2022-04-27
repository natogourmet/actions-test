if [ -z "$1" ]
  then
    echo "Please specify the version"
    exit
fi

BRANCH="release_v$1"

# Checkout develop
git checkout develop
# Get the latest from origin
git pull

# Create release branch
git checkout -b $BRANCH
# Update version
npm --no-git-tag-version version $1
# Commit changes
git add package.json package-lock.json
git commit -m "Bumped version to v$1"
# Push branch
git push origin $BRANCH

# Checkout develop
git checkout develop

# Delete release branch
git branch -d $BRANCH