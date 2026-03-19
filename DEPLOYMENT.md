# Deployment Guide for Codebike

This document outlines the deployment process for the Codebike project hosted in the `standesv/codebike` repository. It covers GitHub Pages configuration, automatic deployment with GitHub Actions, verification steps, troubleshooting, and setting up a custom domain.

## GitHub Pages Configuration
1. **Navigate to Repository Settings:** Go to the repository settings on GitHub.
2. **Enable GitHub Pages:** Under the "Pages" section, choose the branch you want to deploy (usually `main`) and the folder (typically `/` or `/docs`).
3. **Save Changes:** Click on "Save" to apply the configuration.

## Automatic Deployment with GitHub Actions
1. **Create a Workflow File:** In your repository, create a `.github/workflows/deploy.yml` file.
2. **Define the Workflow:** Add the following configuration:
   ```yaml
   name: Deploy to GitHub Pages

   on:
     push:
       branches:
         - main

   jobs:
     deploy:
       runs-on: ubuntu-latest
       steps:
         - name: Checkout code
           uses: actions/checkout@v2
         - name: Build
           run: |  
             npm install  # Install dependencies
             npm run build # Build your project
         - name: Deploy
           uses: peaceiris/actions-gh-pages@v3
           with:
             github_token: ${{ secrets.GITHUB_TOKEN }}
             publish_dir: ./build # Change this to your build output directory
   ```
3. **Commit the Workflow:** Commit and push the `deploy.yml` file to your repository. This will trigger the deployment workflow automatically on every push to the `main` branch.

## Verification Steps
1. **Visit Your GitHub Pages URL:** Open your web browser and navigate to `https://<your-username>.github.io/codebike/`.
2. **Check for Errors:** Verify that all content loads correctly without errors.
3. **Functionality Tests:** Conduct tests to ensure all features work as expected.

## Troubleshooting
- **Deployment Failed:** Check the "Actions" tab in your GitHub repository for logs on the deployment workflows. Look for any errors and address them accordingly.
- **404 Errors:** If you encounter a 404 error, ensure that the branch and folder settings in the GitHub Pages configuration are correct.

## Custom Domain Setup
1. **Domain Registration:** Purchase your custom domain through a domain registrar of your choice.
2. **Configure DNS Settings:** Set up the DNS records:
   - Add a CNAME record pointing to `your-username.github.io`.
   - Alternatively, use an A record pointing to GitHub’s IP addresses if required.
3. **Add Domain in GitHub Repository:** In the GitHub Pages settings of your repository, add your custom domain and save changes.
4. **SSL Configuration:** Ensure that "Enforce HTTPS" is enabled in the GitHub Pages settings for your custom domain.

## Conclusion
Following this guide will help you set up, deploy, and troubleshoot your Codebike project efficiently on GitHub Pages. Make sure to regularly check for updates in the deployment workflows to keep your deployment process smooth and successful.
