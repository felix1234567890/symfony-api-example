/*
 * Welcome to your app's main JavaScript file!
 *
 * We recommend including the built version of this JavaScript file
 * (and its CSS file) in your base layout (base.html.twig).
 */

// Import styles
import './styles/app.scss';

// Import React and React Admin
import React from "react";
import { Admin, EditGuesser, ListGuesser, Resource, ShowGuesser } from 'react-admin';
import { createRoot } from "react-dom/client";

// Import custom providers and components
import { dataProvider } from './apiPlatformDataProvider';
import { authProvider } from './authProvider';
import LoginPage from './LoginPage';

// Custom Admin component with debug mode enabled
const AdminApp = () => {
    // Enable debug mode in console
    console.log('Starting React Admin with API Platform data provider');

    // Log environment information for debugging
    console.log('Window location:', window.location.href);
    console.log('Window origin:', window.location.origin);

    return (
        <Admin
            dataProvider={dataProvider}
            authProvider={authProvider}
            loginPage={LoginPage}
            disableTelemetry
            requireAuth={true}
        >
            <Resource name="articles" list={ListGuesser} edit={EditGuesser} show={ShowGuesser} />
            <Resource name="comments" list={ListGuesser} edit={EditGuesser} show={ShowGuesser} />
            <Resource name="tags" list={ListGuesser} edit={EditGuesser} show={ShowGuesser} />
            <Resource name="users" list={ListGuesser} edit={EditGuesser} show={ShowGuesser} />
        </Admin>
    );
};

// Render the admin interface
const rootElement = document.getElementById('root');
if (rootElement) {
    const root = createRoot(rootElement);
    root.render(<AdminApp />);
}
