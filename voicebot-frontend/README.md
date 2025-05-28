# VoiceBot Frontend

This is the frontend application for the VoiceBot Assistant project. It's built using React and Material-UI.

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (version 14.0.0 or higher)
- npm (comes with Node.js)

## Installation

1. Clone the repository (if you haven't already):
```bash
git clone <repository-url>
cd voicebot-frontend
```

2. Install dependencies:
```bash
npm install
```

This will install all the required dependencies listed in `package.json`, including:
- React 18
- Material-UI components
- WebSocket client
- Testing libraries
- Other development dependencies

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

## Project Structure

```
voicebot-frontend/
├── public/          # Static files
├── src/            # Source files
├── package.json    # Project dependencies and scripts
└── README.md       # This file
```

## Dependencies

The project uses several key dependencies:
- React 18.3.1
- Material-UI (MUI) for UI components
- WebSocket for real-time communication
- Testing libraries (Jest, React Testing Library)

## Browser Support

The application supports the following browsers:
- Chrome (latest version)
- Firefox (latest version)
- Safari (latest version)

## Development

When developing, make sure to:
1. Keep your dependencies up to date
2. Follow the existing code style
3. Write tests for new features
4. Test your changes across different browsers

## Troubleshooting

If you encounter any issues:

1. Make sure all dependencies are installed:
```bash
npm install
```

2. Clear npm cache if you have dependency issues:
```bash
npm cache clean --force
```

3. Delete node_modules and reinstall:
```bash
rm -rf node_modules
npm install
```

## License

[Add your license information here]
