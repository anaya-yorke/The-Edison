#!/bin/bash

# Build and export the Next.js application
echo "Building and exporting the Next.js application..."
npm run export

# Create .nojekyll file to prevent GitHub Pages from ignoring files starting with underscore
touch out/.nojekyll

# If deploying from a non-main branch, we need to create a temp branch for deployment
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
TEMP_BRANCH="gh-pages-deploy"

echo "Current branch: $CURRENT_BRANCH"
echo "Creating temporary branch for deployment: $TEMP_BRANCH"

# Create a temporary branch
git checkout -b $TEMP_BRANCH

# Add the output directory and commit
git add -f out/
git commit -m "Deploy to GitHub Pages"

# Push to the gh-pages branch
echo "Pushing to gh-pages branch..."
git push origin $TEMP_BRANCH:gh-pages --force

# Return to the original branch
git checkout $CURRENT_BRANCH

# Delete the temporary branch
git branch -D $TEMP_BRANCH

echo "Deployment complete! Your site should be live shortly at https://yourusername.github.io/The-Edison"
echo "Don't forget to update the URL with your actual GitHub username." 