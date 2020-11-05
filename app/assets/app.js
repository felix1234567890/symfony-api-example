/*
 * Welcome to your app's main JavaScript file!
 *
 * We recommend including the built version of this JavaScript file
 * (and its CSS file) in your base layout (base.html.twig).
 */

// any CSS you import will output into a single css file (app.css in this case)
import React from "react";
import { HydraAdmin } from "@api-platform/admin";
import {render} from "react-dom"

// Replace with your own API entrypoint
// For instance if https://example.com/api/books is the path to the collection of book resources, then the entrypoint is https://example.com/api
const Admin = () => (
    <HydraAdmin entrypoint="http://192.168.99.100:8000/api" />
);
render(<Admin />, document.getElementById('root'));
