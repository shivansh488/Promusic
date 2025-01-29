const { execSync } = require('child_process');
const fs = require('fs');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function deploy() {
  try {
    console.log('\n🚀 Starting deployment process...\n');

    // 1. Deploy JioSaavn API
    console.log('📦 Deploying JioSaavn API...');
    process.chdir('./JioSaavnAPI');
    execSync('vercel --prod', { stdio: 'inherit' });
    
    // Get API URL
    const apiUrl = await question('\n🔗 Please enter the deployed API URL from above (e.g., https://your-api.vercel.app): ');
    process.chdir('..');

    // 2. Create production environment file
    console.log('\n📝 Creating production environment file...');
    const spotifyClientId = await question('Enter your Spotify Client ID: ');
    
    const envContent = `VITE_SPOTIFY_CLIENT_ID=${spotifyClientId}\nVITE_API_URL=${apiUrl}`;
    fs.writeFileSync('.env.production', envContent);

    // 3. Deploy React app
    console.log('\n📦 Deploying React application...');
    execSync('vercel --prod', { stdio: 'inherit' });

    const frontendUrl = await question('\n🔗 Please enter the deployed frontend URL from above (e.g., https://your-app.vercel.app): ');

    console.log('\n✅ Deployment completed!');
    console.log('\nNext steps:');
    console.log(`1. Go to https://developer.spotify.com/dashboard`);
    console.log(`2. Add this redirect URI to your Spotify app: ${frontendUrl}`);
    console.log(`3. Save the changes in Spotify Dashboard\n`);
    console.log(`Your app should now be live at: ${frontendUrl}\n`);

  } catch (error) {
    console.error('❌ Deployment failed:', error);
  } finally {
    rl.close();
  }
}

// Check if Vercel CLI is installed
try {
  execSync('vercel --version', { stdio: 'ignore' });
} catch (error) {
  console.log('❌ Vercel CLI is not installed. Installing...');
  execSync('npm install -g vercel', { stdio: 'inherit' });
}

deploy();
